// Basılı yazı okumasından (OCR) gelen kelimelerden sayfa düzenini çıkarır:
// hangi soru nerede, şıkları (A, B, C, D, E) nerede.
// Saf fonksiyon: resimle uğraşmaz, sadece kelime kutularıyla çalışır.

const LABEL_RE = /^[(\[]?([A-E])\1?[)\].:]/; // "A)", "(A)", "A.", "A:", OCR çift okursa "CC)"
const NUMBER_RE = /^(\d{1,3})[.)]$/; // "12." ya da "12)"
const LETTERS = ["A", "B", "C", "D", "E"];

const median = (a) => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)];
};
const cy = (w) => (w.y0 + w.y1) / 2;

/**
 * @param {{text:string,x0:number,y0:number,x1:number,y1:number}[]} words OCR kelimeleri
 * @param {number} W sayfa genişliği (piksel)
 * @param {number} H sayfa yüksekliği (piksel)
 * @returns {{number:number, region:Rect, options:{letter:string, box:Rect}[]}[]}
 */
export function detectQuestions(words, W, H) {
  words = words.filter((w) => w.text && w.x1 > w.x0 && w.y1 > w.y0);
  const labels = words
    .map((w) => {
      // OCR'nin sık karıştırdığı işaretler: "©)" ve "€)" aslında "C)".
      const m = LABEL_RE.exec(w.text.trim().replace(/^[©€¢]/, "C"));
      return m ? { ...w, L: m[1], used: false } : null;
    })
    .filter(Boolean)
    .sort((a, b) => cy(a) - cy(b) || a.x0 - b.x0);
  if (!labels.length) return [];
  const lh = median(labels.map((l) => l.y1 - l.y0)) || 20; // satır yüksekliği

  // 1) A'dan başlayıp B, C, D, E'yi zincirle. Tek bir harf okunamadıysa atlanır, yeri sonra tahmin edilir.
  const findNext = (prev, a, letter, maxRows) => {
    let best = null;
    let bestD = Infinity;
    for (const l of labels) {
      if (l.used || l.L !== letter) continue;
      const dy = cy(l) - cy(prev);
      const sameLine = Math.abs(dy) < lh * 1.1 && l.x0 > prev.x1 && l.x0 - a.x0 < W * 0.48;
      // Alt satırdaki şık A'nın ya da bir önceki şıkkın hizasında olmalı (alt alta ya da 2x2 düzen);
      // değilse başka sütundaki bir sorunun şıkkıdır.
      const aligned = Math.abs(l.x0 - a.x0) < lh * 2.5 || Math.abs(l.x0 - prev.x0) < lh * 2.5;
      const below = dy > lh * 1.1 && dy < lh * maxRows && aligned;
      if (!sameLine && !below) continue;
      const d = Math.hypot(l.x0 - prev.x0, dy * 1.5);
      if (d < bestD) {
        bestD = d;
        best = l;
      }
    }
    return best;
  };
  const chains = [];
  // A'dan (A okunamadıysa B'den) başlayıp sonraki harfleri zincirle.
  const build = (start, from) => {
    const chain = { [start.L]: start };
    let prev = start;
    let skipped = 0;
    for (let i = from + 1; i < LETTERS.length; i++) {
      let next = findNext(prev, start, LETTERS[i], 7);
      if (!next && skipped === 0 && i + 1 < LETTERS.length) {
        // Bu harf okunamamış olabilir: bir sonrakini dene.
        next = findNext(prev, start, LETTERS[i + 1], 12);
        if (next) {
          skipped++;
          i++;
        }
      }
      if (!next) break;
      chain[next.L] = next;
      prev = next;
    }
    const found = Object.keys(chain).length;
    if (found >= 3 && (chain.D || chain.C)) {
      Object.values(chain).forEach((l) => (l.used = true));
      chains.push(fillMissing(chain, lh));
    }
  };
  for (const a of labels.filter((l) => l.L === "A")) if (!a.used) build(a, 0);
  for (const b of labels.filter((l) => l.L === "B")) if (!b.used) build(b, 1);
  if (!chains.length) return [];

  // 2) Her zincire soru numarasını bul: A'nın üstünde, aynı sütunda, en yakın "12." gibi kelime.
  const numbers = words
    .map((w) => {
      const m = NUMBER_RE.exec(w.text.trim());
      return m ? { ...w, n: Number(m[1]) } : null;
    })
    .filter(Boolean);
  const qs = chains.map((chain) => {
    const a = chain[0];
    const top = Math.min(...chain.map((l) => l.y0));
    let num = null;
    for (const n of numbers) {
      if (n.y0 > top + lh * 0.3) continue; // numara şıkların üstünde ya da aynı satırda olmalı
      if (n.x0 > a.x0 + W * 0.1 || a.x0 - n.x0 > W * 0.35) continue;
      if (!num || n.y0 > num.y0) num = n;
    }
    return { chain, num, anchorX: Math.min(a.x0, num ? num.x0 : a.x0) };
  });
  // Aynı numara iki soruya verildiyse alttakine bırakmaz (en yakın olan kalır).
  const byNum = new Map();
  for (const q of qs) {
    if (!q.num) continue;
    const prev = byNum.get(q.num);
    if (!prev || q.chain[0].y0 < prev.chain[0].y0) byNum.set(q.num, q);
  }
  for (const q of qs) if (q.num && byNum.get(q.num) !== q) q.num = null;

  // 3) Sütunlar: soru başlangıçlarının x konumlarını grupla.
  const xs = [...new Set(qs.map((q) => q.anchorX))].sort((a, b) => a - b);
  const colStarts = [];
  for (const x of xs) if (!colStarts.length || x - colStarts[colStarts.length - 1] > W * 0.25) colStarts.push(x);
  const colOf = (x) => {
    let c = 0;
    for (let i = 0; i < colStarts.length; i++) if (x >= colStarts[i] - W * 0.12) c = i;
    return c;
  };
  for (const q of qs) {
    q.col = colOf(q.anchorX);
    q.top = q.num ? q.num.y0 : Math.min(...q.chain.map((l) => l.y0));
  }

  // 4) Soru alanı: kendi başından aynı sütundaki bir sonraki sorunun başına kadar.
  const pad = lh * 0.4;
  const optBottom = (q) => Math.max(...q.chain.map((l) => l.y1));
  for (const q of qs) {
    const prevInCol = qs.filter((o) => o.col === q.col && o.top < q.top - lh).sort((a, b) => b.top - a.top)[0];
    // Numarasız soruda alanın üstü: bir önceki sorunun şıklarının altı.
    q.regionTop = q.num
      ? q.num.y0 - pad
      : prevInCol
        ? optBottom(prevInCol) + lh
        : Math.max(0, q.top - lh * 8);
  }
  const out = [];
  for (const q of qs) {
    const colLeft = Math.max(0, q.col === 0 ? 0 : colStarts[q.col] - W * 0.03);
    const colRight = q.col + 1 < colStarts.length ? colStarts[q.col + 1] - W * 0.02 : W;
    const next = qs.filter((o) => o.col === q.col && o.top > q.top + lh).sort((a, b) => a.top - b.top)[0];
    const bottom = next ? Math.max(optBottom(q) + lh, next.regionTop) : H - pad;
    const region = clampRect({ x0: colLeft, y0: q.regionTop, x1: colRight, y1: bottom }, W, H);

    // Şık kutuları: harfin çevresi + aynı satırdaki şık metni (bir sonraki harfe kadar).
    const options = q.chain.map((l, i) => {
      const next = q.chain[i + 1];
      const nextSameLine = next && Math.abs(cy(next) - cy(l)) < lh * 1.1 ? next : null;
      const limit = nextSameLine ? nextSameLine.x0 - lh * 0.3 : Math.min(colRight, l.x1 + W * 0.3);
      let textRight = l.x1;
      for (const w of words) {
        if (Math.abs(cy(w) - cy(l)) < lh * 0.6 && w.x0 > l.x1 - 1 && w.x1 <= limit + lh) textRight = Math.max(textRight, w.x1);
      }
      return {
        letter: l.L,
        box: clampRect(
          { x0: l.x0 - lh * 0.6, y0: l.y0 - lh * 0.45, x1: Math.min(limit, Math.max(textRight, l.x1 + lh)) + lh * 0.3, y1: l.y1 + lh * 0.45 },
          W,
          H
        ),
      };
    });
    splitOverlaps(options.map((o) => o.box));
    out.push({ number: q.num?.n ?? null, col: q.col, region, options });
  }

  // Okuma sırası: sütun sütun, yukarıdan aşağı. Numarası okunamayanlara sıra numarası ver.
  out.sort((a, b) => a.col - b.col || a.region.y0 - b.region.y0);
  const taken = new Set(out.map((q) => q.number).filter((n) => n != null));
  let k = 1;
  for (const q of out) {
    if (q.number == null) {
      while (taken.has(k)) k++;
      q.number = k;
      q.numberGuessed = true;
      taken.add(k);
    }
    delete q.col;
  }
  return out;
}

/**
 * Okunamayan şıkkın yerini diğerlerinden tahmin eder (A-D arası).
 * Düzenler: yan yana, 2x2, alt alta.
 */
function fillMissing(chain, lh) {
  const L = ["A", "B", "C", "D"];
  const has = (k) => !!chain[k];
  const make = (x, y, like) => ({ ...like, text: "?", L: "", x0: x, x1: x + (like.x1 - like.x0), y0: y, y1: y + (like.y1 - like.y0), guessed: true });
  const known = L.filter(has).map((k) => chain[k]);
  const ref = known[0];
  // Düzeni bul: aynı sütundaki şıklar alt alta mı, yan yana mı?
  const sameX = (p, q) => Math.abs(p.x0 - q.x0) < lh * 1.5;
  const below = (p, q) => cy(q) - cy(p) > lh * 1.1;
  const stacked = (a, b) => has(a) && has(b) && sameX(chain[a], chain[b]) && below(chain[a], chain[b]);
  const beside = (a, b) => has(a) && has(b) && !sameX(chain[a], chain[b]);
  let layout = "row";
  if ((stacked("A", "C") || stacked("B", "D")) && (beside("A", "B") || beside("C", "D"))) layout = "grid";
  else if (known.every((k) => sameX(k, ref))) layout = "col";
  for (let i = 0; i < 4; i++) {
    const k = L[i];
    if (has(k)) continue;
    let p = null;
    if (layout === "grid") {
      const colMate = chain[L[i ^ 2]]; // A<->C, B<->D aynı sütun
      const rowMate = chain[L[i ^ 1]]; // A<->B, C<->D aynı satır
      if (colMate && rowMate) p = make(colMate.x0, rowMate.y0, ref);
    } else {
      const prev = chain[L[i - 1]];
      const next = chain[L[i + 1]];
      if (prev && next) p = make((prev.x0 + next.x0) / 2, (prev.y0 + next.y0) / 2, ref);
      else if (prev && chain[L[i - 2]]) {
        const pp = chain[L[i - 2]];
        p = make(prev.x0 * 2 - pp.x0, prev.y0 * 2 - pp.y0, ref);
      } else if (next && chain[L[i + 2]]) {
        // A okunamadı: B ile C arasındaki adımı geriye uygula.
        const nn = chain[L[i + 2]];
        p = make(next.x0 * 2 - nn.x0, next.y0 * 2 - nn.y0, ref);
      }
    }
    if (p) {
      p.L = k;
      chain[k] = p;
    }
  }
  return [...L, "E"].filter(has).map((k) => chain[k]);
}

function clampRect(r, W, H) {
  const x0 = Math.min(W - 1, Math.max(0, Math.round(r.x0)));
  const y0 = Math.min(H - 1, Math.max(0, Math.round(r.y0)));
  return { x0, y0, x1: Math.max(x0 + 1, Math.min(W, Math.round(r.x1))), y1: Math.max(y0 + 1, Math.min(H, Math.round(r.y1))) };
}

/** Üst üste binen şık kutularını ortadan böler (alt alta dizilmiş şıklar için). */
function splitOverlaps(boxes) {
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      const ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
      const oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
      if (ox <= 0 || oy <= 0) continue;
      if (Math.min(ox, oy) > Math.min(a.x1 - a.x0, a.y1 - a.y0, b.x1 - b.x0, b.y1 - b.y0) * 0.8) continue; // tamamen üst üste: bölme
      if (oy < ox) {
        const [up, down] = a.y0 <= b.y0 ? [a, b] : [b, a];
        const mid = Math.round((up.y1 + down.y0) / 2);
        up.y1 = mid;
        down.y0 = mid;
      } else {
        const [l, r] = a.x0 <= b.x0 ? [a, b] : [b, a];
        const mid = Math.round((l.x1 + r.x0) / 2);
        l.x1 = mid;
        r.x0 = mid;
      }
    }
  }
}
