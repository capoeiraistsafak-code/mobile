// Eşikler, doğru/yanlış kararı, öğrenci çoğunluğundan cevap anahtarı ve kazanım raporu.
// Bütün eşikler burada; gerçek ödevlerle denedikten sonra buradan ayarlanır.
import { all } from "./db.js";

export const THRESHOLDS = {
  // --- Resim benzerliği ---
  // Öğrenci fotoğrafı ile boş sayfa arasında en az bu kadar ortak nokta olmalı; azsa "sayfa tanınamadı".
  minPageMatch: 40,
  // Öğretmen aynı sayfayı ikinci kez çekerse (ya da başka öğretmen aynı yayını eklerse) eski anahtar kullanılır.
  samePageMatch: 120,

  // --- El yazısını ayırma ---
  // Öğrenci sayfasındaki bir nokta boş sayfadan bu kadar koyuysa el yazısı sayılır (0-255).
  inkDarkness: 55,
  // Basılı yazıdaki küçük kaymaları tolere etme payı (piksel, tek sayı).
  printTolerancePx: 5,

  // --- Şık işaretleme ---
  // (Yapay test sayfalarıyla ayarlandı: 240 cevapta %98,75 doğru. Gerçek ödevlerle yeniden bakılmalı.)
  // Şık kutusunun en az bu oranı mürekkepse işaretli sayılır (0.01 = %1).
  markMinRatio: 0.01,
  // İkinci şık hem bu oranı geçerse...
  markMultiMin: 0.045,
  // ...hem de birincinin bu katından fazlaysa "birden fazla şık işaretli" denir (karar öğretmene kalır).
  markRivalRatio: 0.55,

  // --- Çözüm yazılmış mı ---
  // Soru alanının en az bu oranı el yazısıysa "işlem yapılmış" sayılır.
  workMinRatio: 0.004,
  // Sayfanın en az bu oranı el yazısıysa ödev "yapılmış" sayılır; altıysa "boş sayfa".
  pageMinInk: 0.002,

  // --- Öğrenci çoğunluğundan anahtar ---
  // Öğretmen anahtar girmediyse: en az bu kadar öğrenci işaretlemiş olmalı...
  crowdMinStudents: 3,
  // ...ve öğrencilerin en az bu oranı aynı şıkkı seçmiş olmalı.
  crowdMinShare: 0.6,

  // --- Eksik kazanım ---
  weakOutcomeRate: 0.6,
  weakOutcomeMinAttempts: 2,
};

/**
 * Bir sorunun anahtarını döner: önce öğretmenin girdiği, yoksa öğrenci çoğunluğu.
 * @returns {{ letter: string|null, source: 'teacher'|'crowd'|null, votes?: object }}
 */
export function keyFor(q, votes) {
  if (q.key_letter) return { letter: q.key_letter, source: "teacher" };
  const v = votes?.get(q.id);
  if (!v) return { letter: null, source: null };
  const total = Object.values(v).reduce((a, b) => a + b, 0);
  const [letter, n] = Object.entries(v).sort((a, b) => b[1] - a[1])[0] || [];
  if (total >= THRESHOLDS.crowdMinStudents && n / total >= THRESHOLDS.crowdMinShare)
    return { letter, source: "crowd", votes: v };
  return { letter: null, source: null, votes: v };
}

/** Sorulara göre öğrenci oyları: Map<question_id, {A: 3, B: 1}> (her öğrencinin son işareti). */
export function crowdVotes(questionIds) {
  const map = new Map();
  if (!questionIds.length) return map;
  const rows = all(
    `SELECT a.question_id, a.marked, count(DISTINCT s.student_id) AS n
       FROM answers a JOIN submissions s ON s.id = a.submission_id
      WHERE a.state = 'ok' AND a.question_id IN (${questionIds.map(() => "?").join(",")})
      GROUP BY a.question_id, a.marked`,
    ...questionIds
  );
  for (const r of rows) {
    const v = map.get(r.question_id) || {};
    v[r.marked] = r.n;
    map.set(r.question_id, v);
  }
  return map;
}

/**
 * Karar: işaretlenen şık anahtarla aynıysa doğru.
 * Öğretmen kararı değiştirdiyse o geçerlidir.
 */
export function verdictFor(answer, key) {
  if (answer.teacher_override) return { verdict: answer.teacher_override, reason: "Öğretmen kararı." };
  if (answer.state === "multi") return { verdict: "review", reason: "Birden fazla şık işaretlenmiş gibi görünüyor." };
  if (answer.state === "none")
    return answer.has_work
      ? { verdict: "review", reason: "İşlem yazılmış ama şık işaretlenmemiş." }
      : { verdict: "blank", reason: "Soru boş bırakılmış." };
  if (!key.letter) return { verdict: "nokey", reason: "Bu soru için henüz cevap anahtarı yok." };
  if (answer.marked === key.letter)
    return answer.has_work
      ? { verdict: "correct", reason: "Doğru şık işaretlenmiş, işlem yapılmış." }
      : { verdict: "correct", reason: "Doğru şık işaretlenmiş ama işlem görünmüyor.", noWork: true };
  return { verdict: "wrong", reason: `${answer.marked} işaretlenmiş, doğru cevap ${key.letter}.` };
}

/** Cevap satırlarına güncel anahtara göre karar ekler. Satırlarda question_id ve key_letter olmalı. */
export function withVerdicts(rows) {
  const votes = crowdVotes([...new Set(rows.map((r) => r.question_id))]);
  return rows.map((r) => {
    const key = keyFor({ id: r.question_id, key_letter: r.key_letter }, votes);
    return { ...r, key: key.letter, key_source: key.source, ...verdictFor(r, key) };
  });
}

const VERDICT_SCORE = { correct: 1, partial: 0.5, wrong: 0, blank: 0 };

function answerRows(where, ...params) {
  return withVerdicts(
    all(
      `SELECT a.*, s.student_id, q.key_letter, q.topic, q.outcome_code, q.outcome_text, p.subject
         FROM answers a
         JOIN submissions s ON s.id = a.submission_id
         JOIN questions q ON q.id = a.question_id
         JOIN pages p ON p.id = q.page_id
        WHERE ${where}`,
      ...params
    )
  );
}

/** Bir öğrencinin kazanım bazında başarısı ve eksik kazanımlar. */
export function outcomeReport(studentId) {
  return summarize(answerRows("s.student_id = ?", studentId));
}

/** Sınıf geneli kazanım tablosu (+ her kazanımda eksik olan öğrenci sayısı). */
export function classOutcomeReport(classId) {
  const rows = answerRows("s.student_id IN (SELECT id FROM users WHERE class_id = ?)", classId);
  const list = summarize(rows);
  for (const o of list) {
    const per = new Map();
    for (const r of rows) {
      if (keyOf(r) !== o.key || !(r.verdict in VERDICT_SCORE)) continue;
      const p = per.get(r.student_id) || { n: 0, s: 0 };
      p.n++;
      p.s += VERDICT_SCORE[r.verdict];
      per.set(r.student_id, p);
    }
    o.weakStudents = [...per.values()].filter(
      (p) => p.n >= THRESHOLDS.weakOutcomeMinAttempts && p.s / p.n < THRESHOLDS.weakOutcomeRate
    ).length;
  }
  return list;
}

const keyOf = (r) => r.outcome_code || r.topic || "Konu girilmemiş";

function summarize(rows) {
  const map = new Map();
  for (const r of rows) {
    if (!(r.verdict in VERDICT_SCORE)) continue; // "review" ve "nokey" sayılmaz
    const key = keyOf(r);
    const o = map.get(key) || {
      key,
      subject: r.subject,
      topic: r.topic,
      outcome_code: r.outcome_code,
      outcome_text: r.outcome_text,
      attempts: 0,
      score: 0,
      correct: 0,
      partial: 0,
      wrong: 0,
      blank: 0,
    };
    o.attempts++;
    o.score += VERDICT_SCORE[r.verdict];
    o[r.verdict]++;
    map.set(key, o);
  }
  return [...map.values()]
    .map((o) => {
      const rate = o.score / o.attempts;
      return {
        ...o,
        rate: Math.round(rate * 100),
        weak: o.attempts >= THRESHOLDS.weakOutcomeMinAttempts && rate < THRESHOLDS.weakOutcomeRate,
      };
    })
    .sort((a, b) => a.rate - b.rate);
}

/** Bir öğrencinin cevap satırlarından sayımlar. */
export function countVerdicts(rows) {
  const c = { n: rows.length, correct: 0, partial: 0, wrong: 0, blank: 0, review: 0, nokey: 0, nowork: 0 };
  for (const r of rows) {
    c[r.verdict] = (c[r.verdict] || 0) + 1;
    if (r.noWork) c.nowork++;
  }
  return c;
}

export { answerRows };
