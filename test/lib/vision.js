// Testler için Node sürümü. Programdaki asıl kod: odev-kontrol/app.js.
// Yerel, basit ve hızlı "yapay zekâ": internet ve ücretli servis gerekmez.
//  - readTemplate: boş sayfanın fotoğrafındaki basılı yazıyı okur (Tesseract), soru/şık yerlerini bulur.
//  - readStudentPage: öğrencinin fotoğrafını boş sayfaya oturtur (OpenCV ORB + homografi),
//    boş sayfada olmayan izleri el yazısı sayar, her soruda işaretlenen şıkkı ve işlem yazılıp yazılmadığını bulur.
import cvModule from "@techstark/opencv-js";
import Tesseract from "tesseract.js";
import sharp from "sharp";
import { createRequire } from "node:module";
import { detectQuestions } from "./layout.js";
// Okuma eşikleri (odev-kontrol/app.js içindeki T ile aynı tutulmalı).
const THRESHOLDS = { minPageMatch: 40, inkDarkness: 55, printTolerancePx: 5, markMinRatio: 0.01, markMultiMin: 0.045, markRivalRatio: 0.55, workMinRatio: 0.004 };

const require = createRequire(import.meta.url);
/** Boş sayfa bu genişliğe getirilir; bütün koordinatlar bu ölçektedir. */
export const PAGE_WIDTH = 1400;
const STUDENT_MAX_SIDE = 1800;

// ---------- OpenCV hazırlığı ----------

let cv;
const cvReady = new Promise((resolve) => {
  if (cvModule instanceof Promise) cvModule.then((m) => resolve((cv = m)));
  else if (cvModule.Mat) resolve((cv = cvModule));
  else cvModule.onRuntimeInitialized = () => resolve((cv = cvModule));
});

/** Mat'ları iş bitince bellekten siler (OpenCV.js'te çöp toplayıcı yoktur). */
function scope(fn) {
  const mats = [];
  const keep = (m) => (mats.push(m), m);
  try {
    return fn(keep);
  } catch (e) {
    // OpenCV.js hataları sayı olarak gelir; okunur mesaja çevir.
    if (typeof e === "number" && cv.exceptionFromPtr) throw new Error(`OpenCV: ${cv.exceptionFromPtr(e).msg}`);
    throw e;
  } finally {
    for (const m of mats) if (m && !m.isDeleted?.()) m.delete();
  }
}

async function toGrayMat(buf, { width, maxSide }) {
  let img = sharp(buf).rotate(); // telefonun EXIF yönünü uygula
  img = width ? img.resize({ width }) : img.resize({ width: maxSide, height: maxSide, fit: "inside", withoutEnlargement: true });
  const { data, info } = await img.toColourspace("b-w").raw().toBuffer({ resolveWithObject: true });
  const m = new cv.Mat(info.height, info.width, cv.CV_8UC1);
  if (info.channels === 1) m.data.set(data);
  else for (let i = 0, j = 0; i < m.data.length; i++, j += info.channels) m.data[i] = data[j];
  return m;
}

/** Işık farklarını düzeltir: kağıt beyaz, yazı koyu olur (gölge ve sarı ışık etkisi azalır). */
function flatten(gray, keep) {
  const k = Math.max(15, Math.round(Math.max(gray.cols, gray.rows) / 60) | 1);
  const bg = keep(new cv.Mat());
  const kernel = keep(cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(k, k)));
  cv.dilate(gray, bg, kernel); // en açık komşu = kağıt rengi
  cv.GaussianBlur(bg, bg, new cv.Size(k * 2 + 1, k * 2 + 1), 0);
  const out = new cv.Mat();
  cv.divide(gray, bg, out, 255);
  return out;
}

async function matToPng(mat) {
  return sharp(Buffer.from(mat.data), { raw: { width: mat.cols, height: mat.rows, channels: mat.channels() } }).png().toBuffer();
}
async function matToJpeg(mat) {
  return sharp(Buffer.from(mat.data), { raw: { width: mat.cols, height: mat.rows, channels: mat.channels() } }).jpeg({ quality: 80 }).toBuffer();
}

// ---------- Basılı yazı okuma (OCR) ----------

let workerP = null;
function ocrWorker() {
  if (!workerP) {
    const tur = require("@tesseract.js-data/tur");
    workerP = Tesseract.createWorker("tur", Tesseract.OEM.LSTM_ONLY, {
      langPath: tur.langPath,
      gzip: true,
      cacheMethod: "none",
    });
  }
  return workerP;
}

// Küçük şık harflerini daha iyi okumak için sayfa büyütülür ve "seyrek yazı" modu kullanılır
// (denemede 32 şıktan 31'ini buldu; normal modda 22).
const OCR_SCALE = 1.6;

async function ocrWords(pngBuf, width) {
  const w = await ocrWorker();
  await w.setParameters({ tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT });
  const big = await sharp(pngBuf).resize({ width: Math.round(width * OCR_SCALE) }).png().toBuffer();
  const r = await w.recognize(big, {}, { blocks: true });
  const words = [];
  const k = 1 / OCR_SCALE;
  for (const b of r.data.blocks || [])
    for (const p of b.paragraphs)
      for (const l of p.lines)
        for (const wd of l.words)
          words.push({ text: wd.text, conf: wd.confidence, x0: wd.bbox.x0 * k, y0: wd.bbox.y0 * k, x1: wd.bbox.x1 * k, y1: wd.bbox.y1 * k });
  return { words, text: r.data.text };
}

// ---------- 1) Boş sayfa (şablon) ----------

/**
 * Öğretmenin çektiği boş sayfa fotoğrafını işler.
 * @returns {{ png: Buffer, width: number, height: number, questions: object[], headerText: string }}
 */
export async function readTemplate(photoBuf) {
  await cvReady;
  const gray = await toGrayMat(photoBuf, { width: PAGE_WIDTH });
  const { png, W, H } = scope((keep) => {
    keep(gray);
    const flat = keep(flatten(gray, keep));
    return { png: matToPng(flat), W: flat.cols, H: flat.rows };
  });
  const pngBuf = await png;
  const { words, text } = await ocrWords(pngBuf, W);
  const questions = detectQuestions(words, W, H);
  // Sayfanın en üstündeki yazı satırı (yayın / kitap adı) başlık önerisi olur.
  const good = words.filter((w) => w.conf > 30 && w.text.trim().length > 1);
  const topY = Math.min(...good.map((w) => w.y0));
  const headerText = good
    .filter((w) => w.y0 < topY + 25)
    .sort((a, b) => a.x0 - b.x0)
    .map((w) => w.text)
    .join(" ")
    .slice(0, 120);
  return { png: pngBuf, width: W, height: H, questions, headerText, ocrText: text, words };
}

// ---------- 2) Sayfa eşleştirme ve el yazısı ayırma ----------

function features(img, keep) {
  const orb = keep(new cv.ORB(4000));
  const kp = keep(new cv.KeyPointVector());
  const des = keep(new cv.Mat());
  orb.detectAndCompute(img, keep(new cv.Mat()), kp, des);
  return { kp, des };
}

/** Öğrenci fotoğrafını şablona oturtan dönüşümü bulur. inliers = resim benzerliği puanı. */
function findHomography(tmpl, stud, keep) {
  const a = features(tmpl, keep);
  const b = features(stud, keep);
  if (a.des.rows < 10 || b.des.rows < 10) return null;
  const bf = keep(new cv.BFMatcher(cv.NORM_HAMMING, false));
  const knn = keep(new cv.DMatchVectorVector());
  bf.knnMatch(b.des, a.des, knn, 2);
  const src = [];
  const dst = [];
  for (let i = 0; i < knn.size(); i++) {
    const m = knn.get(i);
    if (m.size() < 2) continue;
    const m0 = m.get(0);
    const m1 = m.get(1);
    if (m0.distance < 0.75 * m1.distance) {
      const p = b.kp.get(m0.queryIdx).pt;
      const q = a.kp.get(m0.trainIdx).pt;
      src.push(p.x, p.y);
      dst.push(q.x, q.y);
    }
  }
  const n = src.length / 2;
  if (n < 12) return { H: null, inliers: 0, good: n };
  const srcM = keep(cv.matFromArray(n, 1, cv.CV_32FC2, src));
  const dstM = keep(cv.matFromArray(n, 1, cv.CV_32FC2, dst));
  const mask = keep(new cv.Mat());
  const H = cv.findHomography(srcM, dstM, cv.RANSAC, 4, mask);
  if (H.empty()) {
    H.delete();
    return { H: null, inliers: 0, good: n };
  }
  return { H: keep(H), inliers: cv.countNonZero(mask), good: n };
}

const rectArea = (r) => (r.x1 - r.x0) * (r.y1 - r.y0);

function inkIn(ink, r) {
  const x0 = Math.max(0, Math.min(ink.cols - 1, r.x0));
  const y0 = Math.max(0, Math.min(ink.rows - 1, r.y0));
  const x1 = Math.max(x0 + 1, Math.min(ink.cols, r.x1));
  const y1 = Math.max(y0 + 1, Math.min(ink.rows, r.y1));
  const roi = ink.roi(new cv.Rect(x0, y0, x1 - x0, y1 - y0));
  const n = cv.countNonZero(roi);
  roi.delete();
  return n;
}

/**
 * Öğrenci fotoğrafını verilen şablonlarla karşılaştırır; en benzer sayfayı seçer,
 * el yazısını ayırır ve her sorunun cevabını okur.
 * @param {Buffer} photoBuf öğrenci fotoğrafı
 * @param {{id:number, png:Buffer, questions:object[]}[]} templates aday boş sayfalar
 */
export async function readStudentPage(photoBuf, templates) {
  await cvReady;
  const t = THRESHOLDS;
  const studGray = await toGrayMat(photoBuf, { maxSide: STUDENT_MAX_SIDE });
  const tmplMats = await Promise.all(templates.map((tp) => toGrayMat(tp.png, { width: PAGE_WIDTH })));

  return scope((keep) => {
    keep(studGray);
    tmplMats.forEach(keep);
    const stud = keep(flatten(studGray, keep));

    // En çok ortak noktası olan sayfa = aynı sayfa.
    let best = null;
    templates.forEach((tp, i) => {
      const h = findHomography(tmplMats[i], stud, keep);
      if (h?.H && (!best || h.inliers > best.h.inliers)) best = { tp, h, tmpl: tmplMats[i] };
    });
    if (!best || best.h.inliers < t.minPageMatch) {
      return { matched: false, score: best?.h.inliers ?? 0 };
    }

    const { tp, h, tmpl } = best;
    const size = new cv.Size(tmpl.cols, tmpl.rows);
    // Öğrenci fotoğrafını şablonun üstüne oturt.
    const warped = keep(new cv.Mat());
    cv.warpPerspective(stud, warped, h.H, size, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar(255));
    // Fotoğrafın dışında kalan yerler (kenarlar) hesaba katılmaz.
    const ones = keep(new cv.Mat(stud.rows, stud.cols, cv.CV_8UC1, new cv.Scalar(255)));
    const valid = keep(new cv.Mat());
    cv.warpPerspective(ones, valid, h.H, size, cv.INTER_NEAREST, cv.BORDER_CONSTANT, new cv.Scalar(0));
    const k9 = keep(cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(9, 9)));
    cv.erode(valid, valid, k9);

    // El yazısı = öğrenci sayfasında olup boş sayfada olmayan koyu izler.
    // Basılı yazıyı biraz kalınlaştırıyoruz ki küçük kaymalar el yazısı sanılmasın.
    const tmplMin = keep(new cv.Mat());
    const k5 = keep(cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(t.printTolerancePx, t.printTolerancePx)));
    cv.erode(tmpl, tmplMin, k5);
    const diff = keep(new cv.Mat());
    cv.subtract(tmplMin, warped, diff);
    const ink = keep(new cv.Mat());
    cv.threshold(diff, ink, t.inkDarkness, 255, cv.THRESH_BINARY);
    cv.bitwise_and(ink, valid, ink);
    const k2 = keep(cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2, 2)));
    cv.morphologyEx(ink, ink, cv.MORPH_OPEN, k2); // tek tük benekleri sil

    const pageInk = cv.countNonZero(ink) / (ink.rows * ink.cols);

    // Her soru: şıklardaki iz + soru alanındaki işlem izi.
    const answers = tp.questions.map((q) => {
      const opt = q.options.map((o) => {
        const n = inkIn(ink, o.box);
        return { letter: o.letter, ink: n, ratio: n / rectArea(o.box) };
      });
      const sorted = [...opt].sort((a, b) => b.ratio - a.ratio);
      const [first, second] = sorted;
      const total = opt.reduce((s, o) => s + o.ink, 0);
      let state = "none";
      let marked = null;
      if (first && first.ratio >= t.markMinRatio) {
        if (second && second.ratio >= t.markMultiMin && second.ratio > first.ratio * t.markRivalRatio) state = "multi";
        else {
          state = "ok";
          marked = first.letter;
        }
      }
      const optInk = total;
      const regionInk = inkIn(ink, q.region) - optInk;
      const regionArea = rectArea(q.region) - q.options.reduce((s, o) => s + rectArea(o.box), 0);
      const workRatio = Math.max(0, regionInk) / Math.max(1, regionArea);
      return {
        question_key: q.key,
        marked,
        state,
        // İşaret benzerliği: seçilen şıkkın, şıklardaki toplam izden aldığı pay (0-1).
        share: total ? (first?.ink ?? 0) / total : 0,
        option_ratios: Object.fromEntries(opt.map((o) => [o.letter, Math.round(o.ratio * 1000) / 1000])),
        work_ratio: workRatio,
        has_work: workRatio >= t.workMinRatio,
      };
    });

    // Görsel: öğrencinin oturtulmuş sayfası, el yazısı maviye boyanmış.
    const rgb = keep(new cv.Mat());
    cv.cvtColor(warped, rgb, cv.COLOR_GRAY2RGB);
    const d = rgb.data;
    const m = ink.data;
    for (let i = 0; i < m.length; i++) {
      if (m[i]) {
        d[i * 3] = 20;
        d[i * 3 + 1] = 90;
        d[i * 3 + 2] = 230;
      }
    }
    return {
      matched: true,
      template_id: tp.id,
      score: h.inliers,
      page_ink: pageInk,
      answers,
      overlay: matToJpeg(rgb),
    };
  });
}

/** Sunucu kapanırken OCR işçisini kapatır. */
export async function shutdownVision() {
  if (workerP) (await workerP).terminate();
}

/**
 * Bir fotoğrafın verilen boş sayfalardan hangisine benzediğini bulur (aynı sayfa ikinci kez eklenmesin diye).
 * @returns {{ id: number|null, score: number }}
 */
export async function bestMatch(photoBuf, templates) {
  await cvReady;
  const img = await toGrayMat(photoBuf, { width: PAGE_WIDTH });
  let best = { id: null, score: 0 };
  for (const tp of templates) {
    const tm = await toGrayMat(tp.png, { width: PAGE_WIDTH });
    scope((keep) => {
      keep(tm);
      const h = findHomography(tm, img, keep);
      if (h?.inliers > best.score) best = { id: tp.id, score: h.inliers };
    });
  }
  img.delete();
  return best;
}
