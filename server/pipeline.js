// Fotoğrafların işlenmesi. Resim işleme işlemciyi meşgul ettiği için işler sırayla yapılır.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { one, all, run, db, UPLOAD_DIR } from "./db.js";
import { readTemplate, readStudentPage, bestMatch } from "./vision.js";
import { THRESHOLDS } from "./grading.js";

let queue = Promise.resolve();
/** İşi kuyruğa ekler; sırası gelince çalışır. */
export function enqueue(fn) {
  const p = queue.then(fn, fn);
  queue = p.catch(() => {});
  return p;
}

const file = (name) => path.join(UPLOAD_DIR, path.basename(name));
export const saveFile = (buf, ext) => {
  const name = `${crypto.randomUUID()}.${ext}`;
  fs.writeFileSync(file(name), buf);
  return name;
};
export const readFile = (name) => fs.readFileSync(file(name));
export const removeFile = (name) => name && fs.rm(file(name), { force: true }, () => {});

const parse = (s, d) => {
  try {
    return s ? JSON.parse(s) : d;
  } catch {
    return d;
  }
};

/** Bir sayfanın sorularını (şık kutularıyla) getirir. */
export function pageQuestions(pageId) {
  return all(`SELECT * FROM questions WHERE page_id=? ORDER BY number, id`, pageId).map((q) => ({
    ...q,
    region: parse(q.region_json, null),
    options: parse(q.options_json, []),
  }));
}

/**
 * Öğretmenin çektiği boş sayfayı işler: basılı yazıyı okur, soruları ve şıkları bulur.
 * Aynı sayfa havuzda zaten varsa yenisini silip eskisini (anahtarıyla birlikte) döner.
 * @returns {Promise<number>} kullanılacak sayfa id'si
 */
export async function processPage(pageId) {
  const page = one(`SELECT * FROM pages WHERE id=?`, pageId);
  try {
    const photo = readFile(page.photo_file);

    const pool = all(`SELECT id, template_file FROM pages WHERE status='ready' AND id!=? ORDER BY id DESC LIMIT 200`, pageId);
    if (pool.length) {
      const m = await bestMatch(
        photo,
        pool.map((p) => ({ id: p.id, png: readFile(p.template_file) }))
      );
      if (m.id && m.score >= THRESHOLDS.samePageMatch) {
        removeFile(page.photo_file);
        removeFile(page.template_file);
        run(`DELETE FROM pages WHERE id=?`, pageId);
        return m.id;
      }
    }

    const t = await readTemplate(photo);
    const tf = saveFile(t.png, "png");
    db.exec("BEGIN");
    try {
      run(
        `UPDATE pages SET template_file=?, width=?, height=?, status='ready', title=CASE WHEN title='' THEN ? ELSE title END WHERE id=?`,
        tf,
        t.width,
        t.height,
        t.headerText || "Adsız sayfa",
        pageId
      );
      for (const q of t.questions) {
        run(
          `INSERT INTO questions (page_id, number, region_json, options_json) VALUES (?,?,?,?)`,
          pageId,
          q.number,
          JSON.stringify(q.region),
          JSON.stringify(q.options)
        );
      }
      db.exec("COMMIT");
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
    if (!t.questions.length)
      run(
        `UPDATE pages SET error=? WHERE id=?`,
        "Sayfada şık (A, B, C, D) bulunamadı. Sayfayı düz, gölgesiz ve yakından tekrar çekin.",
        pageId
      );
    return pageId;
  } catch (err) {
    console.error(`Sayfa ${pageId} işlenemedi:`, err);
    run(`UPDATE pages SET status='failed', error=? WHERE id=?`, String(err.message || err), pageId);
    return pageId;
  }
}

/** Öğrencinin fotoğrafını adaylar arasından doğru sayfaya oturtur ve cevapları kaydeder. */
export async function processSubmission(submissionId) {
  const sub = one(`SELECT * FROM submissions WHERE id=?`, submissionId);
  try {
    // Aday sayfalar: seçilen ödevin sayfaları; ödev seçilmediyse sınıfın bütün ödev sayfaları.
    const pages = sub.assignment_id
      ? all(
          `SELECT p.* FROM pages p JOIN assignment_pages ap ON ap.page_id=p.id WHERE ap.assignment_id=? AND p.status='ready'`,
          sub.assignment_id
        )
      : all(
          `SELECT DISTINCT p.* FROM pages p
             JOIN assignment_pages ap ON ap.page_id=p.id
             JOIN assignments a ON a.id=ap.assignment_id
             JOIN users u ON u.class_id=a.class_id
            WHERE u.id=? AND p.status='ready'
            ORDER BY a.id DESC LIMIT 30`,
          sub.student_id
        );
    if (!pages.length) throw new Error("Bu ödeve henüz sayfa eklenmemiş. Öğretmeninize haber verin.");

    const templates = pages.map((p) => ({
      id: p.id,
      png: readFile(p.template_file),
      questions: pageQuestions(p.id).map((q) => ({ key: q.id, region: q.region, options: q.options })),
    }));
    const r = await readStudentPage(readFile(sub.image_file), templates);
    if (!r.matched)
      throw new Error(
        "Fotoğraf ödev sayfalarından hiçbirine benzemiyor. Doğru sayfayı, bütün sayfa görünecek şekilde, düz ve net çekin."
      );

    const overlay = saveFile(await r.overlay, "jpg");
    db.exec("BEGIN");
    try {
      for (const a of r.answers) {
        run(
          `INSERT INTO answers (submission_id, question_id, marked, state, share, option_ratios_json, work_ratio, has_work)
           VALUES (?,?,?,?,?,?,?,?)`,
          submissionId,
          a.question_key,
          a.marked,
          a.state,
          a.share,
          JSON.stringify(a.option_ratios),
          a.work_ratio,
          a.has_work ? 1 : 0
        );
      }
      run(
        `UPDATE submissions SET status='done', page_id=?, overlay_file=?, match_score=?, page_ink=?, has_handwriting=? WHERE id=?`,
        r.template_id,
        overlay,
        r.score,
        r.page_ink,
        r.page_ink >= THRESHOLDS.pageMinInk ? 1 : 0,
        submissionId
      );
      db.exec("COMMIT");
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  } catch (err) {
    console.error(`Gönderim ${submissionId} işlenemedi:`, err.message);
    run(`UPDATE submissions SET status='failed', error=? WHERE id=?`, String(err.message || err), submissionId);
  }
}
