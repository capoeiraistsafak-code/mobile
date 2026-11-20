// Test için yapay test sayfası, öğrenci işaretleri ve "telefonla çekilmiş" görünüm üretir.
import sharp from "sharp";
import cvModule from "@techstark/opencv-js";

const W = 1240; // A4, 150 dpi
const H = 1754;

let cv;
const cvReady = new Promise((resolve) => {
  if (cvModule instanceof Promise) cvModule.then((m) => resolve((cv = m)));
  else if (cvModule.Mat) resolve((cv = cvModule));
  else cvModule.onRuntimeInitialized = () => resolve((cv = cvModule));
});

/** Tekrarlanabilir rastgele sayı üreteci. */
export function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/**
 * Sayfa düzeni: 2 sütun, her sütunda 4 soru. Şık düzenleri: yan yana, 2x2, alt alta.
 * @returns {{ questions: {number, options:{letter, x, y, w, h}[], work:{x,y,w,h}}[], svgBody: string }}
 */
export function layoutPage(seed = 1) {
  const r = rng(seed);
  const parts = [];
  const questions = [];
  const fs = 24;
  const lh = 32;
  parts.push(`<text x="60" y="60" font-size="26" font-weight="bold" font-family="DejaVu Sans, sans-serif">Örnek Yayınları – 8. Sınıf Matematik – Test 3</text>`);
  parts.push(`<line x1="${W / 2}" y1="90" x2="${W / 2}" y2="${H - 60}" stroke="#999" stroke-width="2"/>`);
  const layouts = ["row", "grid", "col", "row", "grid", "col", "row", "grid"];
  let n = 1;
  for (let col = 0; col < 2; col++) {
    const x0 = col === 0 ? 60 : W / 2 + 40;
    let y = 130;
    for (let k = 0; k < 4; k++, n++) {
      const layout = layouts[(n + seed) % layouts.length];
      parts.push(`<text x="${x0}" y="${y}" font-size="${fs}" font-weight="bold" font-family="DejaVu Sans, sans-serif">${n}.</text>`);
      const lines = [
        `${2 + Math.floor(r() * 7)}x + ${Math.floor(r() * 20)} = ${20 + Math.floor(r() * 60)} denkleminde`,
        "x kaçtır?",
      ];
      lines.forEach((t, i) =>
        parts.push(`<text x="${x0 + 40}" y="${y + i * lh}" font-size="${fs}" font-family="DejaVu Sans, sans-serif">${esc(t)}</text>`)
      );
      y += lines.length * lh + 10;
      // Öğrencinin işlem yapacağı boşluk.
      const work = { x: x0 + 40, y: y, w: W / 2 - 160, h: 120 };
      y += work.h + 10;
      const vals = Array.from({ length: 4 }, () => Math.floor(r() * 30) + 1);
      const options = [];
      "ABCD".split("").forEach((L, i) => {
        let ox;
        let oy;
        if (layout === "row") {
          ox = x0 + 40 + i * 120;
          oy = y;
        } else if (layout === "grid") {
          ox = x0 + 40 + (i % 2) * 220;
          oy = y + Math.floor(i / 2) * (lh + 14);
        } else {
          ox = x0 + 40;
          oy = y + i * (lh + 10);
        }
        parts.push(
          `<text x="${ox}" y="${oy}" font-size="${fs}" font-family="DejaVu Sans, sans-serif">${L}) ${vals[i]}</text>`
        );
        options.push({ letter: L, x: ox, y: oy - fs, w: 22, h: fs + 6 });
      });
      y += layout === "row" ? lh : layout === "grid" ? 2 * (lh + 14) : 4 * (lh + 10);
      y += 50;
      questions.push({ number: n, options, work });
    }
  }
  return { questions, svgBody: parts.join("\n") };
}

/**
 * Öğrenci işaretleri: seçilen şıkkın etrafına daire, işlem alanına el yazısı benzeri çizgiler.
 * @param {{number:number, mark:string|null, work:boolean, style?:string}[]} answers
 */
export function studentInk(layout, answers, seed = 7) {
  const r = rng(seed);
  const color = r() < 0.5 ? "#1b2a6b" : "#555555"; // tükenmez kalem ya da kurşun kalem
  const parts = [];
  for (const a of answers) {
    const q = layout.questions.find((x) => x.number === a.number);
    if (a.work) {
      // İşlem: birkaç satır rakam benzeri karalama.
      for (let line = 0; line < 3; line++) {
        let px = q.work.x + 10 + r() * 20;
        const py = q.work.y + 24 + line * 28;
        let d = `M ${px} ${py}`;
        const len = 8 + Math.floor(r() * 10);
        for (let i = 0; i < len; i++) {
          px += 10 + r() * 12;
          d += ` Q ${px - 6} ${py - 18 - r() * 10} ${px} ${py + (r() - 0.5) * 6}`;
        }
        parts.push(`<path d="${d}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round"/>`);
      }
    }
    if (a.mark) {
      const o = q.options.find((x) => x.letter === a.mark);
      const cx = o.x + o.w / 2 + (r() - 0.5) * 6;
      const cy = o.y + o.h / 2 + (r() - 0.5) * 6;
      if (a.style === "tick") {
        parts.push(
          `<path d="M ${o.x - 6} ${cy} L ${o.x + 6} ${cy + 12} L ${o.x + 26} ${cy - 16}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`
        );
      } else {
        parts.push(
          `<ellipse cx="${cx}" cy="${cy}" rx="${o.w * 0.9 + r() * 6}" ry="${o.h * 0.75 + r() * 4}" fill="none" stroke="${color}" stroke-width="3" transform="rotate(${(r() - 0.5) * 20} ${cx} ${cy})"/>`
        );
      }
    }
    if (a.mark2) {
      const o = q.options.find((x) => x.letter === a.mark2);
      parts.push(
        `<ellipse cx="${o.x + o.w / 2}" cy="${o.y + o.h / 2}" rx="${o.w}" ry="${o.h * 0.8}" fill="none" stroke="${color}" stroke-width="3"/>`
      );
    }
  }
  return parts.join("\n");
}

export async function renderPage(layout, ink = "") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#fff"/>${layout.svgBody}${ink}</svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Düz sayfayı "telefonla çekilmiş" hâle getirir: eğim, perspektif, gölge, bulanıklık, gürültü. */
export async function photograph(pngBuf, seed = 3, strength = 1) {
  await cvReady;
  const r = rng(seed);
  const { data, info } = await sharp(pngBuf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const src = new cv.Mat(info.height, info.width, cv.CV_8UC3);
  src.data.set(data);
  const OW = 2000;
  const OH = 2700;
  const j = () => (r() - 0.5) * 0.12 * strength;
  const margin = 0.08;
  const pts = [
    [margin + j(), margin + j()],
    [1 - margin + j(), margin + j()],
    [1 - margin + j(), 1 - margin + j()],
    [margin + j(), 1 - margin + j()],
  ].flatMap(([x, y]) => [x * OW, y * OH]);
  const from = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, info.width, 0, info.width, info.height, 0, info.height]);
  const to = cv.matFromArray(4, 1, cv.CV_32FC2, pts);
  const M = cv.getPerspectiveTransform(from, to);
  const out = new cv.Mat();
  cv.warpPerspective(src, out, M, new cv.Size(OW, OH), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar(120, 100, 80));
  // Işık: bir köşeden diğerine kararma ve sarımsı ton.
  const d = out.data;
  const gx = r() * 0.35 * strength;
  const gy = r() * 0.25 * strength;
  for (let y = 0; y < OH; y++) {
    for (let x = 0; x < OW; x++) {
      const f = 1 - gx * (x / OW) - gy * (y / OH);
      const i = (y * OW + x) * 3;
      const n = (r() - 0.5) * 18 * strength;
      d[i] = Math.max(0, Math.min(255, d[i] * f * 0.98 + n));
      d[i + 1] = Math.max(0, Math.min(255, d[i + 1] * f * 0.95 + n));
      d[i + 2] = Math.max(0, Math.min(255, d[i + 2] * f * 0.85 + n));
    }
  }
  cv.GaussianBlur(out, out, new cv.Size(5, 5), 1.1 * strength);
  const jpg = await sharp(Buffer.from(out.data), { raw: { width: OW, height: OH, channels: 3 } }).jpeg({ quality: 75 }).toBuffer();
  [src, from, to, M, out].forEach((m) => m.delete());
  return jpg;
}
