// Ödev Kontrol sunucusu.
import express from "express";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { db, one, all, run, UPLOAD_DIR } from "./db.js";
import { processSubmission, keyFromRow } from "./pipeline.js";
import { outcomeReport, classOutcomeReport, decideVerdict, THRESHOLDS } from "./grading.js";
import { gradeAnswer, stepScoreOf, AI_MODE } from "./ai.js";

const PORT = Number(process.env.PORT || 3000);
// Maliyet koruması: bir öğrencinin günde yükleyebileceği en fazla fotoğraf.
const DAILY_UPLOAD_LIMIT = Number(process.env.DAILY_UPLOAD_LIMIT || 30);

const app = express();
app.use(express.json({ limit: "15mb" }));
app.use(express.static(path.resolve("public")));

// ---------- Yardımcılar ----------

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const fail = (status, msg) => {
  throw new HttpError(status, msg);
};
// Async route hatalarını yakalar.
const h = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString("hex");
  return `${salt}:${crypto.scryptSync(pw, salt, 64).toString("hex")}`;
}
function checkPassword(pw, stored) {
  const [salt, hash] = (stored || "").split(":");
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(pw, salt, 64);
  return crypto.timingSafeEqual(test, Buffer.from(hash, "hex"));
}
// Karışmayan harfler (0/O, 1/I yok).
const CODE_ALPHABET = "ABCDEFGHJKLMNPRSTUVYZ23456789";
function newLoginCode() {
  for (;;) {
    const code = Array.from(crypto.randomBytes(6), (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
    if (!one(`SELECT 1 FROM users WHERE login_code=?`, code)) return code;
  }
}

function startSession(res, userId) {
  const token = crypto.randomBytes(32).toString("hex");
  run(`INSERT INTO sessions (token, user_id) VALUES (?,?)`, token, userId);
  res.setHeader(
    "Set-Cookie",
    `sid=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 180}${process.env.HTTPS === "1" ? "; Secure" : ""}`
  );
}

function getToken(req) {
  const m = /(?:^|;\s*)sid=([a-f0-9]+)/.exec(req.headers.cookie || "");
  return m?.[1];
}

app.use((req, _res, next) => {
  const t = getToken(req);
  req.user = t
    ? one(`SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=?`, t) || null
    : null;
  next();
});

const need = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new HttpError(401, "Giriş yapmalısınız."));
  if (roles.length && !roles.includes(req.user.role)) return next(new HttpError(403, "Bu işlem için yetkiniz yok."));
  next();
};

function ownClass(user, classId) {
  const c = one(`SELECT * FROM classes WHERE id=? AND teacher_id=?`, classId, user.id);
  if (!c) fail(404, "Sınıf bulunamadı.");
  return c;
}

/** Kullanıcı bu öğrencinin verilerini görebilir mi? (kendisi, velisi, öğretmeni) */
function assertCanSeeStudent(user, studentId) {
  studentId = Number(studentId);
  if (user.role === "student" && user.id === studentId) return;
  if (user.role === "parent" && user.child_id === studentId) return;
  if (user.role === "teacher") {
    const ok = one(
      `SELECT 1 FROM users u JOIN classes c ON c.id=u.class_id WHERE u.id=? AND c.teacher_id=?`,
      studentId,
      user.id
    );
    if (ok) return;
  }
  fail(403, "Bu öğrencinin bilgilerini göremezsiniz.");
}

const publicUser = (u) =>
  u && { id: u.id, role: u.role, name: u.name, class_id: u.class_id, child_id: u.child_id };

// ---------- Giriş ----------

app.post(
  "/api/auth/register",
  h((req, res) => {
    const { name, username, password } = req.body || {};
    if (!name?.trim() || !username?.trim() || (password || "").length < 6)
      fail(400, "Ad, kullanıcı adı ve en az 6 karakterli şifre gerekli.");
    if (one(`SELECT 1 FROM users WHERE lower(username)=lower(?)`, username.trim()))
      fail(409, "Bu kullanıcı adı alınmış.");
    const r = run(
      `INSERT INTO users (role, name, username, password_hash) VALUES ('teacher',?,?,?)`,
      name.trim(),
      username.trim(),
      hashPassword(password)
    );
    startSession(res, r.lastInsertRowid);
    res.json({ user: publicUser(one(`SELECT * FROM users WHERE id=?`, r.lastInsertRowid)) });
  })
);

app.post(
  "/api/auth/login",
  h((req, res) => {
    const { username, password, code } = req.body || {};
    let u;
    if (code) {
      u = one(`SELECT * FROM users WHERE login_code=?`, String(code).trim().toUpperCase());
      if (!u) fail(401, "Kod hatalı.");
    } else {
      u = one(`SELECT * FROM users WHERE lower(username)=lower(?) AND role='teacher'`, (username || "").trim());
      if (!u || !checkPassword(password || "", u.password_hash)) fail(401, "Kullanıcı adı ya da şifre hatalı.");
    }
    startSession(res, u.id);
    res.json({ user: publicUser(u) });
  })
);

app.post(
  "/api/auth/logout",
  h((req, res) => {
    const t = getToken(req);
    if (t) run(`DELETE FROM sessions WHERE token=?`, t);
    res.setHeader("Set-Cookie", "sid=; Path=/; Max-Age=0");
    res.json({ ok: true });
  })
);

app.get("/api/me", (req, res) => {
  const child = req.user?.role === "parent" ? one(`SELECT id, name FROM users WHERE id=?`, req.user.child_id) : null;
  res.json({ user: publicUser(req.user), child, aiMode: AI_MODE, thresholds: THRESHOLDS });
});

// ---------- Öğretmen: sınıflar ve öğrenciler ----------

app.get(
  "/api/classes",
  need("teacher"),
  h((req, res) => {
    res.json(
      all(
        `SELECT c.*, (SELECT count(*) FROM users u WHERE u.class_id=c.id AND u.role='student') AS student_count
           FROM classes c WHERE teacher_id=? ORDER BY c.name`,
        req.user.id
      )
    );
  })
);

app.post(
  "/api/classes",
  need("teacher"),
  h((req, res) => {
    const { name, grade } = req.body || {};
    if (!name?.trim()) fail(400, "Sınıf adı gerekli.");
    const r = run(`INSERT INTO classes (name, grade, teacher_id) VALUES (?,?,?)`, name.trim(), grade || null, req.user.id);
    res.json(one(`SELECT * FROM classes WHERE id=?`, r.lastInsertRowid));
  })
);

app.get(
  "/api/classes/:id",
  need("teacher"),
  h((req, res) => {
    const c = ownClass(req.user, req.params.id);
    const students = all(
      `SELECT s.id, s.name, s.login_code,
              (SELECT p.login_code FROM users p WHERE p.child_id=s.id AND p.role='parent' LIMIT 1) AS parent_code,
              (SELECT count(*) FROM submissions x WHERE x.student_id=s.id) AS submission_count,
              (SELECT max(created_at) FROM submissions x WHERE x.student_id=s.id) AS last_submission
         FROM users s WHERE s.class_id=? AND s.role='student' ORDER BY s.name`,
      c.id
    );
    res.json({ ...c, students });
  })
);

app.post(
  "/api/classes/:id/students",
  need("teacher"),
  h((req, res) => {
    const c = ownClass(req.user, req.params.id);
    // Tek tek ya da alt alta yapıştırılmış isim listesi.
    const names = String(req.body?.names || "")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!names.length) fail(400, "En az bir öğrenci adı yazın.");
    db.exec("BEGIN");
    try {
      for (const name of names) {
        const s = run(
          `INSERT INTO users (role, name, login_code, class_id) VALUES ('student',?,?,?)`,
          name,
          newLoginCode(),
          c.id
        );
        run(
          `INSERT INTO users (role, name, login_code, child_id) VALUES ('parent',?,?,?)`,
          `${name} velisi`,
          newLoginCode(),
          s.lastInsertRowid
        );
      }
      db.exec("COMMIT");
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
    res.json({ added: names.length });
  })
);

app.delete(
  "/api/students/:id",
  need("teacher"),
  h((req, res) => {
    assertCanSeeStudent(req.user, req.params.id);
    for (const s of all(`SELECT image_file FROM submissions WHERE student_id=?`, req.params.id))
      fs.rm(path.join(UPLOAD_DIR, s.image_file), { force: true }, () => {});
    run(`DELETE FROM users WHERE id=? AND role='student'`, req.params.id);
    res.json({ ok: true });
  })
);

// ---------- Ödevler ----------

app.get(
  "/api/classes/:id/assignments",
  need("teacher"),
  h((req, res) => {
    const c = ownClass(req.user, req.params.id);
    res.json(assignmentsWithStats(c.id));
  })
);

function assignmentsWithStats(classId) {
  return all(
    `SELECT a.*,
            (SELECT count(DISTINCT s.student_id) FROM submissions s WHERE s.assignment_id=a.id AND s.status!='failed') AS submitted,
            (SELECT count(*) FROM users u WHERE u.class_id=a.class_id AND u.role='student') AS total
       FROM assignments a WHERE a.class_id=? ORDER BY COALESCE(a.due_date,'9999') DESC, a.id DESC`,
    classId
  );
}

app.post(
  "/api/classes/:id/assignments",
  need("teacher"),
  h((req, res) => {
    const c = ownClass(req.user, req.params.id);
    const { title, description, subject, due_date } = req.body || {};
    if (!title?.trim()) fail(400, "Ödev başlığı gerekli.");
    const r = run(
      `INSERT INTO assignments (class_id, title, description, subject, due_date) VALUES (?,?,?,?,?)`,
      c.id,
      title.trim(),
      description || null,
      subject || null,
      due_date || null
    );
    res.json(one(`SELECT * FROM assignments WHERE id=?`, r.lastInsertRowid));
  })
);

app.delete(
  "/api/assignments/:id",
  need("teacher"),
  h((req, res) => {
    const a = one(`SELECT * FROM assignments WHERE id=?`, req.params.id);
    if (!a) fail(404, "Ödev bulunamadı.");
    ownClass(req.user, a.class_id);
    run(`DELETE FROM assignments WHERE id=?`, a.id);
    res.json({ ok: true });
  })
);

/** Ödevi kim yaptı, kim yapmadı. */
app.get(
  "/api/assignments/:id/status",
  need("teacher"),
  h((req, res) => {
    const a = one(`SELECT * FROM assignments WHERE id=?`, req.params.id);
    if (!a) fail(404, "Ödev bulunamadı.");
    ownClass(req.user, a.class_id);
    const students = all(`SELECT id, name FROM users WHERE class_id=? AND role='student' ORDER BY name`, a.class_id);
    const rows = students.map((st) => {
      const subs = all(
        `SELECT * FROM submissions WHERE assignment_id=? AND student_id=? ORDER BY created_at`,
        a.id,
        st.id
      );
      const ok = subs.filter((s) => s.status === "done");
      const counts = one(
        `SELECT count(*) AS n,
                sum(COALESCE(teacher_override,verdict)='correct') AS correct,
                sum(COALESCE(teacher_override,verdict)='partial') AS partial,
                sum(COALESCE(teacher_override,verdict)='wrong') AS wrong,
                sum(COALESCE(teacher_override,verdict)='blank') AS blank,
                sum(COALESCE(teacher_override,verdict)='review') AS review
           FROM answers WHERE submission_id IN (SELECT id FROM submissions WHERE assignment_id=? AND student_id=?)`,
        a.id,
        st.id
      );
      const first = subs[0]?.created_at;
      let state = "yapmadi";
      if (subs.some((s) => s.status === "processing")) state = "isleniyor";
      else if (ok.length && ok.every((s) => !s.has_handwriting)) state = "bos";
      else if (ok.length) state = a.due_date && first && first.slice(0, 10) > a.due_date ? "gec" : "yapti";
      return {
        student_id: st.id,
        name: st.name,
        state,
        pages: ok.length,
        duplicate: subs.some((s) => s.duplicate_of),
        first_at: first || null,
        ...counts,
      };
    });
    res.json({ assignment: a, students: rows });
  })
);

app.get(
  "/api/my/assignments",
  need("student", "parent"),
  h((req, res) => {
    const sid = req.user.role === "student" ? req.user.id : req.user.child_id;
    const st = one(`SELECT class_id FROM users WHERE id=?`, sid);
    res.json(
      all(
        `SELECT a.*, (SELECT count(*) FROM submissions s WHERE s.assignment_id=a.id AND s.student_id=? AND s.status='done') AS my_pages
           FROM assignments a WHERE a.class_id=? ORDER BY COALESCE(a.due_date,'9999') DESC, a.id DESC`,
        sid,
        st?.class_id ?? -1
      )
    );
  })
);

// ---------- Fotoğraf yükleme ve sonuçlar ----------

app.post(
  "/api/submissions",
  need("student"),
  h((req, res) => {
    const { image, assignment_id } = req.body || {};
    const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(image || "");
    if (!m) fail(400, "Fotoğraf okunamadı (JPEG, PNG ya da WEBP olmalı).");
    const [, mediaType, b64] = m;
    const buf = Buffer.from(b64, "base64");
    if (buf.length > 5 * 1024 * 1024) fail(413, "Fotoğraf 5 MB'tan büyük olamaz.");

    const today = one(
      `SELECT count(*) AS n FROM submissions WHERE student_id=? AND date(created_at)=date('now')`,
      req.user.id
    ).n;
    if (today >= DAILY_UPLOAD_LIMIT) fail(429, `Günlük ${DAILY_UPLOAD_LIMIT} fotoğraf sınırına ulaştınız.`);

    if (assignment_id) {
      const a = one(`SELECT * FROM assignments WHERE id=? AND class_id=?`, assignment_id, req.user.class_id);
      if (!a) fail(400, "Ödev bulunamadı.");
    }

    // Aynı fotoğraf daha önce yüklendi mi? (kopya kontrolü)
    const hash = crypto.createHash("sha256").update(buf).digest("hex");
    const dupSelf = one(`SELECT id FROM submissions WHERE image_hash=? AND student_id=? AND status!='failed'`, hash, req.user.id);
    if (dupSelf) fail(409, "Bu fotoğrafı zaten yüklediniz.");
    const dupOther = one(`SELECT id FROM submissions WHERE image_hash=? AND student_id!=?`, hash, req.user.id);

    const ext = mediaType.split("/")[1].replace("jpeg", "jpg");
    const file = `${crypto.randomUUID()}.${ext}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, file), buf);
    const r = run(
      `INSERT INTO submissions (student_id, assignment_id, image_file, image_hash, duplicate_of) VALUES (?,?,?,?,?)`,
      req.user.id,
      assignment_id || null,
      file,
      hash,
      dupOther?.id || null
    );
    // Arka planda işlenir; uygulama sonucu birkaç saniyede bir sorar.
    processSubmission(r.lastInsertRowid, b64, mediaType);
    res.json({ id: r.lastInsertRowid, status: "processing" });
  })
);

app.get(
  "/api/submissions",
  need(),
  h((req, res) => {
    const sid = req.user.role === "student" ? req.user.id : req.user.role === "parent" ? req.user.child_id : Number(req.query.student_id);
    assertCanSeeStudent(req.user, sid);
    res.json(
      all(
        `SELECT s.id, s.status, s.error, s.created_at, s.has_handwriting, s.duplicate_of, a.title AS assignment_title,
                (SELECT count(*) FROM answers x WHERE x.submission_id=s.id) AS n,
                (SELECT count(*) FROM answers x WHERE x.submission_id=s.id AND COALESCE(x.teacher_override,x.verdict)='correct') AS correct
           FROM submissions s LEFT JOIN assignments a ON a.id=s.assignment_id
          WHERE s.student_id=? ORDER BY s.id DESC LIMIT 100`,
        sid
      )
    );
  })
);

app.get(
  "/api/submissions/:id",
  need(),
  h((req, res) => {
    const s = one(`SELECT * FROM submissions WHERE id=?`, req.params.id);
    if (!s) fail(404, "Gönderim bulunamadı.");
    assertCanSeeStudent(req.user, s.student_id);
    const answers = all(
      `SELECT a.*, q.question_text, q.question_no, q.publisher, q.book, q.page, q.subject, q.topic, q.outcome_code, q.outcome_text,
              q.final_answer AS key_answer, q.steps_json, q.options_json, q.status AS key_status
         FROM answers a JOIN questions q ON q.id=a.question_id WHERE a.submission_id=? ORDER BY a.id`,
      s.id
    ).map((a) => ({
      ...a,
      steps: JSON.parse(a.steps_json || "[]"),
      options: JSON.parse(a.options_json || "[]"),
      step_results: JSON.parse(a.step_results_json || "[]"),
    }));
    const student = one(`SELECT name FROM users WHERE id=?`, s.student_id);
    res.json({ ...s, student_name: student?.name, image_url: `/api/submissions/${s.id}/image`, answers });
  })
);

app.get(
  "/api/submissions/:id/image",
  need(),
  h((req, res) => {
    const s = one(`SELECT * FROM submissions WHERE id=?`, req.params.id);
    if (!s) fail(404, "Bulunamadı.");
    assertCanSeeStudent(req.user, s.student_id);
    res.sendFile(path.join(UPLOAD_DIR, path.basename(s.image_file)));
  })
);

/** Öğretmen bir sorunun kararını elle değiştirir. */
app.put(
  "/api/answers/:id",
  need("teacher"),
  h((req, res) => {
    const a = one(`SELECT a.*, s.student_id FROM answers a JOIN submissions s ON s.id=a.submission_id WHERE a.id=?`, req.params.id);
    if (!a) fail(404, "Cevap bulunamadı.");
    assertCanSeeStudent(req.user, a.student_id);
    const v = req.body?.verdict;
    if (v !== null && !["correct", "partial", "wrong", "blank"].includes(v)) fail(400, "Geçersiz karar.");
    run(`UPDATE answers SET teacher_override=? WHERE id=?`, v, a.id);
    res.json({ ok: true });
  })
);

// ---------- Raporlar ----------

app.get(
  "/api/students/:id/report",
  need(),
  h((req, res) => {
    assertCanSeeStudent(req.user, req.params.id);
    const st = one(`SELECT id, name, class_id FROM users WHERE id=?`, req.params.id);
    const totals = one(
      `SELECT count(DISTINCT s.id) AS pages, count(a.id) AS questions,
              sum(COALESCE(a.teacher_override,a.verdict)='correct') AS correct,
              sum(COALESCE(a.teacher_override,a.verdict)='partial') AS partial,
              sum(COALESCE(a.teacher_override,a.verdict)='wrong') AS wrong,
              sum(COALESCE(a.teacher_override,a.verdict)='blank') AS blank
         FROM submissions s LEFT JOIN answers a ON a.submission_id=s.id
        WHERE s.student_id=? AND s.status='done'`,
      st.id
    );
    const assignments = all(
      `SELECT a.id, a.title, a.due_date,
              (SELECT count(*) FROM submissions s WHERE s.assignment_id=a.id AND s.student_id=? AND s.status='done' AND s.has_handwriting=1) AS pages
         FROM assignments a WHERE a.class_id=? ORDER BY COALESCE(a.due_date,'9999') DESC`,
      st.id,
      st.class_id ?? -1
    );
    res.json({ student: st, totals, outcomes: outcomeReport(st.id), assignments });
  })
);

app.get(
  "/api/classes/:id/outcomes",
  need("teacher"),
  h((req, res) => {
    const c = ownClass(req.user, req.params.id);
    res.json(classOutcomeReport(c.id));
  })
);

// ---------- Cevap anahtarları ----------

/** Öğretmenin öğrencilerinin kullandığı anahtarlar (kontrol bekleyenler önce). */
app.get(
  "/api/questions",
  need("teacher"),
  h((req, res) => {
    const status = req.query.status;
    res.json(
      all(
        `SELECT q.*, count(a.id) AS answer_count FROM questions q
           JOIN answers a ON a.question_id=q.id
           JOIN submissions s ON s.id=a.submission_id
           JOIN users u ON u.id=s.student_id
           JOIN classes c ON c.id=u.class_id
          WHERE c.teacher_id=? ${status ? "AND q.status=?" : ""}
          GROUP BY q.id
          ORDER BY CASE q.status WHEN 'disputed' THEN 0 WHEN 'unverified' THEN 1 ELSE 2 END, q.id DESC
          LIMIT 200`,
        ...(status ? [req.user.id, status] : [req.user.id])
      ).map((q) => ({ ...q, steps: JSON.parse(q.steps_json || "[]"), options: JSON.parse(q.options_json || "[]") }))
    );
  })
);

/** Öğretmen anahtarı onaylar ya da düzeltir. Düzeltilirse eski cevaplar yeniden puanlanır. */
app.put(
  "/api/questions/:id",
  need("teacher"),
  h(async (req, res) => {
    const q = one(`SELECT * FROM questions WHERE id=?`, req.params.id);
    if (!q) fail(404, "Soru bulunamadı.");
    const { final_answer, steps, topic, outcome_code, outcome_text } = req.body || {};
    const keyChanged =
      (final_answer != null && final_answer !== q.final_answer) ||
      (steps != null && JSON.stringify(steps) !== q.steps_json);
    run(
      `UPDATE questions SET final_answer=?, steps_json=?, topic=?, outcome_code=?, outcome_text=?, status='verified', verified_by=? WHERE id=?`,
      final_answer ?? q.final_answer,
      steps ? JSON.stringify(steps) : q.steps_json,
      topic ?? q.topic,
      outcome_code === undefined ? q.outcome_code : outcome_code || null,
      outcome_text ?? q.outcome_text,
      req.user.id,
      q.id
    );
    let regraded = 0;
    if (keyChanged) regraded = await regradeQuestion(q.id);
    res.json({ ok: true, regraded });
  })
);

async function regradeQuestion(questionId) {
  const key = keyFromRow(one(`SELECT * FROM questions WHERE id=?`, questionId));
  const answers = all(`SELECT * FROM answers WHERE question_id=? AND verdict NOT IN ('blank','review')`, questionId);
  let agree = 0;
  for (const a of answers) {
    const grade = await gradeAnswer(key, {
      student_work: a.student_work,
      student_final_answer: a.student_final,
      read_confidence: a.read_confidence,
    });
    const stepScore = stepScoreOf(grade, key.steps.length);
    const { verdict, reason } = decideVerdict({
      hasWork: true,
      finalCorrect: grade.final_correct,
      stepScore,
      readConfidence: a.read_confidence,
      isMultipleChoice: key.options.length > 0,
    });
    if (grade.final_correct) agree++;
    run(
      `UPDATE answers SET final_correct=?, step_score=?, verdict=?, reason=?, feedback=?, step_results_json=? WHERE id=?`,
      grade.final_correct ? 1 : 0,
      stepScore,
      verdict,
      reason,
      grade.feedback,
      JSON.stringify(grade.step_results),
      a.id
    );
  }
  run(`UPDATE questions SET agree_count=? WHERE id=?`, agree, questionId);
  return answers.length;
}

// ---------- Hata yakalama ----------

app.use("/api", (_req, _res, next) => next(new HttpError(404, "Bulunamadı.")));
app.use((err, _req, res, _next) => {
  if (!(err instanceof HttpError)) console.error(err);
  res.status(err.status || 500).json({ error: err instanceof HttpError ? err.message : "Sunucu hatası." });
});

// Sunucu yeniden başladıysa yarım kalan işlemleri "başarısız" işaretle.
run(`UPDATE submissions SET status='failed', error='Sunucu yeniden başladı, fotoğrafı tekrar yükleyin.' WHERE status='processing'`);

app.listen(PORT, () => {
  console.log(`Ödev Kontrol çalışıyor: http://localhost:${PORT}`);
  console.log(
    AI_MODE === "mock"
      ? "⚠ DENEME MODU: ANTHROPIC_API_KEY yok, yapay zekâ yerine örnek veriler kullanılıyor."
      : "Yapay zekâ: Claude"
  );
});
