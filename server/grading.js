// Puanlama kuralları, soru eşleştirme ve eksik kazanım analizi.
// Bütün eşikler burada; gerçek ödevlerle denedikten sonra buradan ayarlanır.
import { all, one, run } from "./db.js";

export const THRESHOLDS = {
  // Çözüm yolu puanı (0-100) bu değer ve üstündeyse "yöntem doğru" sayılır.
  stepPass: 70,
  // Son cevap yanlışsa ve çözüm yolu bunun altındaysa kesin "yanlış".
  stepFail: 40,
  // El yazısı okuma güveni bunun altındaysa karar öğretmene bırakılır.
  minReadConfidence: 0.6,
  // Aynı soru sayılması için basılı metin benzerliği (0-1).
  sameQuestion: 0.85,
  // Bir kazanımda başarı oranı bunun altındaysa "eksik" denir.
  weakOutcomeRate: 0.6,
  // Eksik demek için o kazanımdan en az kaç soru çözülmüş olmalı.
  weakOutcomeMinAttempts: 2,
  // Bu kadar öğrencinin son cevabı anahtarla aynı çıkınca anahtar "doğrulandı" sayılır.
  autoVerifyAgreements: 3,
  // Bu kadar öğrenci aynı farklı cevabı verirse anahtar "şüpheli" işaretlenir.
  disputeSameWrong: 3,
};

/**
 * Son cevap + çözüm yolu puanından nihai karar.
 * Tek bir "%80 benzerlik" yerine iki ayrı ölçüm kullanılır:
 * son cevap doğru mu, çözüm yolu ne kadar doğru.
 */
export function decideVerdict({ hasWork, finalCorrect, stepScore, readConfidence, isMultipleChoice }) {
  const t = THRESHOLDS;
  if (!hasWork) return { verdict: "blank", reason: "Soru boş bırakılmış." };
  if (readConfidence < t.minReadConfidence)
    return { verdict: "review", reason: "El yazısı tam okunamadı, öğretmen kontrol edecek." };

  // Test sorusunda işaretlenen şık belirleyicidir; yazılan çözüm yolu yalnız bilgi amaçlı.
  if (isMultipleChoice) {
    return finalCorrect
      ? { verdict: "correct", reason: "Doğru şık işaretlenmiş." }
      : { verdict: "wrong", reason: "Yanlış şık işaretlenmiş." };
  }

  if (finalCorrect && stepScore >= t.stepPass) return { verdict: "correct", reason: "Cevap ve çözüm yolu doğru." };
  if (finalCorrect)
    return {
      verdict: "partial",
      reason: "Cevap doğru ama çözüm yolu eksik ya da yazılmamış.",
    };
  if (stepScore >= t.stepPass)
    return { verdict: "partial", reason: "Yöntem doğru ama sonuçta işlem hatası var." };
  if (stepScore >= t.stepFail)
    return { verdict: "partial", reason: "Çözümün bir kısmı doğru, sonuç yanlış." };
  return { verdict: "wrong", reason: "Cevap ve çözüm yolu yanlış." };
}

/** Basılı soru metnini karşılaştırma için sadeleştirir. */
export function normalizeText(s) {
  return (s || "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function trigrams(s) {
  const set = new Set();
  const x = ` ${s} `;
  for (let i = 0; i < x.length - 2; i++) set.add(x.slice(i, i + 3));
  return set;
}

/** İki metnin harf-üçlüsü benzerliği (Dice katsayısı), 0-1. */
export function similarity(a, b) {
  if (!a || !b) return 0;
  const A = trigrams(a);
  const B = trigrams(b);
  let inter = 0;
  for (const g of A) if (B.has(g)) inter++;
  return (2 * inter) / (A.size + B.size);
}

/**
 * Daha önce çözülmüş aynı soruyu bulur.
 * Önce yayın + sayfa + soru no ile aday daraltılır, sonra metin benzerliği bakılır;
 * ikisinden birinin tutması yetmez, metin de benzer olmalı (farklı baskı/sayfa hatasına karşı).
 * Şüpheli anahtarlar da eşleşir (aynı soru tekrar tekrar çözülmesin); öğretmen onlara ayrıca bakar.
 */
export function findExistingQuestion({ publisher, page, question_no, question_text }) {
  const norm = normalizeText(question_text);
  if (norm.length < 8) return null;

  let best = null;
  const consider = (rows) => {
    for (const r of rows) {
      const s = similarity(norm, r.norm_text);
      if (s >= THRESHOLDS.sameQuestion && (!best || s > best.score)) best = { row: r, score: s };
    }
  };

  if (publisher && question_no) {
    consider(
      all(
        `SELECT * FROM questions WHERE lower(publisher)=lower(?) AND question_no=?`,
        publisher,
        String(question_no)
      )
    );
  }
  if (!best) {
    // Kaynak okunamadıysa: benzer uzunluktaki sorular arasında metinle ara.
    consider(
      all(
        `SELECT * FROM questions WHERE length(norm_text) BETWEEN ? AND ?`,
        Math.floor(norm.length * 0.7),
        Math.ceil(norm.length * 1.3)
      )
    );
  }
  return best;
}

const VERDICT_SCORE = { correct: 1, partial: 0.5, wrong: 0, blank: 0 };

/** Bir öğrencinin kazanım bazında başarısı ve eksik kazanımlar. */
export function outcomeReport(studentId) {
  const rows = all(
    `SELECT q.subject, q.topic, q.outcome_code, q.outcome_text,
            COALESCE(a.teacher_override, a.verdict) AS v
       FROM answers a
       JOIN submissions s ON s.id = a.submission_id
       JOIN questions q ON q.id = a.question_id
      WHERE s.student_id = ?`,
    studentId
  );
  return summarize(rows);
}

/** Sınıf geneli kazanım tablosu. */
export function classOutcomeReport(classId) {
  const rows = all(
    `SELECT q.subject, q.topic, q.outcome_code, q.outcome_text, s.student_id,
            COALESCE(a.teacher_override, a.verdict) AS v
       FROM answers a
       JOIN submissions s ON s.id = a.submission_id
       JOIN users u ON u.id = s.student_id
       JOIN questions q ON q.id = a.question_id
      WHERE u.class_id = ?`,
    classId
  );
  const list = summarize(rows);
  // Her kazanımda eksik olan öğrenci sayısı.
  for (const o of list) {
    const per = new Map();
    for (const r of rows) {
      if ((r.outcome_code || r.topic) !== o.key || !(r.v in VERDICT_SCORE)) continue;
      const p = per.get(r.student_id) || { n: 0, s: 0 };
      p.n++;
      p.s += VERDICT_SCORE[r.v];
      per.set(r.student_id, p);
    }
    o.weakStudents = [...per.values()].filter(
      (p) => p.n >= THRESHOLDS.weakOutcomeMinAttempts && p.s / p.n < THRESHOLDS.weakOutcomeRate
    ).length;
  }
  return list;
}

function summarize(rows) {
  const map = new Map();
  for (const r of rows) {
    if (!(r.v in VERDICT_SCORE)) continue; // "review" sayılmaz
    const key = r.outcome_code || r.topic || "Belirsiz";
    const o =
      map.get(key) ||
      { key, subject: r.subject, topic: r.topic, outcome_code: r.outcome_code, outcome_text: r.outcome_text, attempts: 0, score: 0, correct: 0, partial: 0, wrong: 0, blank: 0 };
    o.attempts++;
    o.score += VERDICT_SCORE[r.v];
    o[r.v]++;
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

/**
 * Anahtarın güvenilirliğini öğrenci cevaplarına göre günceller:
 * yeterince öğrenci aynı sonucu bulursa doğrulanır,
 * birçok öğrenci aynı "yanlış" cevabı verirse şüpheli işaretlenir.
 */
export function crowdCheckKey(questionId) {
  const q = one(`SELECT * FROM questions WHERE id=?`, questionId);
  if (!q || q.verified_by) return; // öğretmen onayı her şeyin önünde
  if (q.status === "unverified" && q.agree_count >= THRESHOLDS.autoVerifyAgreements) {
    run(`UPDATE questions SET status='verified' WHERE id=?`, questionId);
    return;
  }
  const wrongs = all(
    `SELECT lower(trim(student_final)) AS f, count(*) AS n FROM answers
      WHERE question_id=? AND final_correct=0 AND student_final IS NOT NULL AND student_final!=''
      GROUP BY f ORDER BY n DESC LIMIT 1`,
    questionId
  );
  if (wrongs[0] && wrongs[0].n >= THRESHOLDS.disputeSameWrong && wrongs[0].n > q.agree_count) {
    run(`UPDATE questions SET status='disputed' WHERE id=?`, questionId);
  }
}
