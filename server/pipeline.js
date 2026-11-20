// Bir ödev fotoğrafının baştan sona işlenmesi.
import { one, run } from "./db.js";
import { readPage, solveQuestion, gradeAnswer, stepScoreOf } from "./ai.js";
import { decideVerdict, findExistingQuestion, normalizeText, crowdCheckKey } from "./grading.js";

const parse = (s, d) => {
  try {
    return s ? JSON.parse(s) : d;
  } catch {
    return d;
  }
};

/** Kayıttaki soru satırını anahtar nesnesine çevirir. */
export function keyFromRow(r) {
  return { ...r, options: parse(r.options_json, []), steps: parse(r.steps_json, []) };
}

// Aynı soru aynı anda iki öğrenciden gelirse iki kez çözülmesin diye soru başına kilit.
const locks = new Map();
async function withLock(name, fn) {
  const prev = locks.get(name) || Promise.resolve();
  let release;
  const mine = new Promise((r) => (release = r));
  const chain = prev.then(() => mine);
  locks.set(name, chain);
  await prev;
  try {
    return await fn();
  } finally {
    release();
    if (locks.get(name) === chain) locks.delete(name);
  }
}

function lockName(page, pq) {
  if (page.publisher && pq.question_no) return `src:${page.publisher.toLocaleLowerCase("tr-TR")}|${pq.question_no}`;
  return `txt:${normalizeText(pq.question_text).slice(0, 40)}`;
}

/** Sorunun cevap anahtarını bulur; yoksa çözer ve havuza ekler. */
function getOrCreateKey(page, pq, userId) {
  return withLock(lockName(page, pq), () => findOrSolve(page, pq, userId));
}

async function findOrSolve(page, pq, userId) {
  const found = findExistingQuestion({
    publisher: page.publisher,
    page: page.page,
    question_no: pq.question_no,
    question_text: pq.question_text,
  });
  if (found) {
    run(`UPDATE questions SET use_count = use_count + 1 WHERE id=?`, found.row.id);
    return { key: keyFromRow(found.row), reused: true };
  }

  const solved = await solveQuestion({ ...pq });
  const r = run(
    `INSERT INTO questions (publisher, book, page, question_no, subject, grade, question_text, options_json, norm_text,
                            topic, outcome_code, outcome_text, final_answer, steps_json, status, use_count, created_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?)`,
    page.publisher,
    page.book,
    page.page,
    pq.question_no,
    solved.subject || pq.subject,
    solved.grade ?? pq.grade,
    pq.question_text,
    JSON.stringify(pq.options || []),
    normalizeText(pq.question_text),
    solved.topic,
    solved.outcome_code,
    solved.outcome_text,
    solved.final_answer,
    JSON.stringify(solved.steps),
    // Yapay zekâ çözümüne az güveniyorsa doğrudan "şüpheli" başlar, öğretmen bakar.
    solved.confidence < 0.6 ? "disputed" : "unverified",
    userId
  );
  const row = one(`SELECT * FROM questions WHERE id=?`, r.lastInsertRowid);
  return { key: keyFromRow(row), reused: false };
}

/** Tek bir sorunun öğrenci cevabını puanlar ve kaydeder. */
async function gradeOne(submissionId, page, pq, userId) {
  const { key } = await getOrCreateKey(page, pq, userId);
  const hasWork = pq.has_student_work && !!(pq.student_work?.trim() || pq.student_final_answer?.trim());

  let grade = null;
  let stepScore = 0;
  if (hasWork && pq.read_confidence >= 0.3) {
    grade = await gradeAnswer(key, pq);
    stepScore = stepScoreOf(grade, key.steps.length);
  }
  const { verdict, reason } = decideVerdict({
    hasWork,
    finalCorrect: !!grade?.final_correct,
    stepScore,
    readConfidence: pq.read_confidence,
    isMultipleChoice: pq.is_multiple_choice,
  });

  run(
    `INSERT INTO answers (submission_id, question_id, student_work, student_final, read_confidence,
                          final_correct, step_score, verdict, reason, feedback, step_results_json)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    submissionId,
    key.id,
    pq.student_work,
    pq.student_final_answer,
    pq.read_confidence,
    grade ? (grade.final_correct ? 1 : 0) : null,
    grade ? stepScore : null,
    verdict,
    reason,
    grade?.feedback || null,
    JSON.stringify(grade?.step_results || [])
  );

  if (grade?.final_correct) run(`UPDATE questions SET agree_count = agree_count + 1 WHERE id=?`, key.id);
  crowdCheckKey(key.id);
}

/** Fotoğrafı okur, her soruyu puanlar. Hata olursa gönderimi "failed" işaretler. */
export async function processSubmission(submissionId, imageBase64, mediaType) {
  const sub = one(`SELECT * FROM submissions WHERE id=?`, submissionId);
  try {
    const page = await readPage(imageBase64, mediaType);
    const qs = page.questions.filter((q) => q.question_text?.trim());
    if (!qs.length) throw new Error("Fotoğrafta soru bulunamadı. Sayfayı düz ve net çekip tekrar deneyin.");

    // Sorular sırayla işlenir: aynı sayfada aynı soru iki kez çıkarsa anahtar bir kez üretilir.
    for (const pq of qs) await gradeOne(submissionId, page, pq, sub.student_id);

    run(
      `UPDATE submissions SET status='done', has_handwriting=? WHERE id=?`,
      page.page_has_handwriting ? 1 : 0,
      submissionId
    );
  } catch (err) {
    console.error(`Gönderim ${submissionId} işlenemedi:`, err);
    run(`UPDATE submissions SET status='failed', error=? WHERE id=?`, String(err.message || err), submissionId);
  }
}
