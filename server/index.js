// Ödev Kontrol sunucusu.
import express from "express";
import crypto from "node:crypto";
import path from "node:path";
import { db, one, all, run, UPLOAD_DIR } from "./db.js";
import { enqueue, processPage, processSubmission, pageQuestions, saveFile, removeFile } from "./pipeline.js";
import {
  THRESHOLDS,
  answerRows,
  withVerdicts,
  crowdVotes,
  keyFor,
  outcomeReport,
  classOutcomeReport,
  countVerdicts,
} from "./grading.js";
import { shutdownVision } from "./vision.js";

const PORT = Number(process.env.PORT || 3000);
// Kötüye kullanıma karşı: bir öğrencinin günde yükleyebileceği en fazla fotoğraf.
const DAILY_UPLOAD_LIMIT = Number(process.env.DAILY_UPLOAD_LIMIT || 60);

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
const h = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString("hex");
  return `${salt}:${crypto.scryptSync(pw, salt, 64).toString("hex")}`;
}
function checkPassword(pw, stored) {
  const [salt, hash] = (stored || "").split(":");
  if (!salt || !hash) return false;
  return crypto.timingSafeEqual(crypto.scryptSync(pw, salt, 64), Buffer.from(hash, "hex"));
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
const getToken = (req) => /(?:^|;\s*)sid=([a-f0-9]+)/.exec(req.headers.cookie || "")?.[1];

app.use((req, _res, next) => {
  const t = getToken(req);
  req.user = t ? one(`SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=?`, t) || null : null;
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
function ownAssignment(user, id) {
  const a = one(`SELECT * FROM assignments WHERE id=?`, id);
  if (!a) fail(404, "Ödev bulunamadı.");
  ownClass(user, a.class_id);
  return a;
}

/** Kullanıcı bu öğrencinin verilerini görebilir mi? (kendisi, velisi, öğretmeni) */
function assertCanSeeStudent(user, studentId) {
  studentId = Number(studentId);
  if (user.role === "student" && user.id === studentId) return;
  if (user.role === "parent" && user.child_id === studentId) return;
  if (
    user.role === "teacher" &&
    one(`SELECT 1 FROM users u JOIN classes c ON c.id=u.class_id WHERE u.id=? AND c.teacher_id=?`, studentId, user.id)
  )
    return;
  fail(403, "Bu öğrencinin bilgilerini göremezsiniz.");
}

const publicUser = (u) => u && { id: u.id, role: u.role, name: u.name, class_id: u.class_id, child_id: u.child_id };

/** "data:image/jpeg;base64,..." biçimindeki fotoğrafı çözer. */
function decodeImage(dataUrl) {
  const m = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(dataUrl || "");
  if (!m) fail(400, "Fotoğraf okunamadı (JPEG, PNG ya da WEBP olmalı).");
  const buf = Buffer.from(m[2], "base64");
  if (buf.length > 8 * 1024 * 1024) fail(413, "Fotoğraf 8 MB'tan büyük olamaz.");
  return { buf, ext: m[1].replace("jpeg", "jpg") };
}

// ---------- Giriş ----------

app.post(
  "/api/auth/register",
  h((req, res) => {
    const { name, username, password } = req.body || {};
    if (!name?.trim() || !username?.trim() || (password || "").length < 6)
      fail(400, "Ad, kullanıcı adı ve en az 6 karakterli şifre gerekli.");
    if (one(`SELECT 1 FROM users WHERE lower(username)=lower(?)`, username.trim())) fail(409, "Bu kullanıcı adı alınmış.");
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
  res.json({ user: publicUser(req.user), child, thresholds: THRESHOLDS });
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
              (SELECT count(*) FROM submissions x WHERE x.student_id=s.id AND x.status='done') AS submission_count
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
    const names = String(req.body?.names || "")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!names.length) fail(400, "En az bir öğrenci adı yazın.");
    db.exec("BEGIN");
    try {
      for (const name of names) {
        const s = run(`INSERT INTO users (role, name, login_code, class_id) VALUES ('student',?,?,?)`, name, newLoginCode(), c.id);
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
    for (const s of all(`SELECT image_file, overlay_file FROM submissions WHERE student_id=?`, req.params.id)) {
      removeFile(s.image_file);
      removeFile(s.overlay_file);
    }
    run(`DELETE FROM users WHERE id=? AND role='student'`, req.params.id);
    res.json({ ok: true });
  })
);

// ---------- Ödevler ve boş sayfalar ----------

app.get(
  "/api/classes/:id/assignments",
  need("teacher"),
  h((req, res) => {
    const c = ownClass(req.user, req.params.id);
    res.json(
      all(
        `SELECT a.*,
                (SELECT count(*) FROM assignment_pages ap WHERE ap.assignment_id=a.id) AS page_count,
                (SELECT count(DISTINCT s.student_id) FROM submissions s WHERE s.assignment_id=a.id AND s.status='done') AS submitted,
                (SELECT count(*) FROM users u WHERE u.class_id=a.class_id AND u.role='student') AS total
           FROM assignments a WHERE a.class_id=? ORDER BY COALESCE(a.due_date,'9999') DESC, a.id DESC`,
        c.id
      )
    );
  })
);

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

function pagesOfAssignment(assignmentId) {
  const pages = all(
    `SELECT p.id, p.title, p.subject, p.status, p.error, p.width, p.height
       FROM pages p JOIN assignment_pages ap ON ap.page_id=p.id
      WHERE ap.assignment_id=? ORDER BY ap.sort, p.id`,
    assignmentId
  );
  for (const p of pages) {
    const qs = all(`SELECT id, key_letter FROM questions WHERE page_id=?`, p.id);
    const votes = crowdVotes(qs.map((q) => q.id));
    p.question_count = qs.length;
    p.teacher_keys = qs.filter((q) => q.key_letter).length;
    p.crowd_keys = qs.filter((q) => !q.key_letter && keyFor(q, votes).letter).length;
  }
  return pages;
}

app.get(
  "/api/assignments/:id",
  need("teacher"),
  h((req, res) => {
    const a = ownAssignment(req.user, req.params.id);
    res.json({ ...a, pages: pagesOfAssignment(a.id) });
  })
);

app.delete(
  "/api/assignments/:id",
  need("teacher"),
  h((req, res) => {
    const a = ownAssignment(req.user, req.params.id);
    run(`DELETE FROM assignments WHERE id=?`, a.id);
    res.json({ ok: true });
  })
);

/** Öğretmen ödeve boş sayfa fotoğrafı ekler. Sayfa havuzda varsa eskisi (anahtarıyla) kullanılır. */
app.post(
  "/api/assignments/:id/pages",
  need("teacher"),
  h((req, res) => {
    const a = ownAssignment(req.user, req.params.id);
    const { buf, ext } = decodeImage(req.body?.image);
    const photo = saveFile(buf, ext);
    const r = run(
      `INSERT INTO pages (title, subject, photo_file, template_file, width, height, created_by) VALUES (?,?,?,?,0,0,?)`,
      (req.body?.title || "").trim(),
      a.subject,
      photo,
      "",
      req.user.id
    );
    const pageId = Number(r.lastInsertRowid);
    const sort = one(`SELECT COALESCE(max(sort),0)+1 AS n FROM assignment_pages WHERE assignment_id=?`, a.id).n;
    run(`INSERT INTO assignment_pages (assignment_id, page_id, sort) VALUES (?,?,?)`, a.id, pageId, sort);
    enqueue(async () => {
      const usedId = await processPage(pageId);
      if (usedId !== pageId) {
        // Aynı sayfa havuzda vardı: ödeve eskisini bağla (yenisi silindi).
        run(`INSERT OR IGNORE INTO assignment_pages (assignment_id, page_id, sort) VALUES (?,?,?)`, a.id, usedId, sort);
      }
    });
    res.json({ id: pageId, status: "processing" });
  })
);

app.delete(
  "/api/assignments/:id/pages/:pageId",
  need("teacher"),
  h((req, res) => {
    const a = ownAssignment(req.user, req.params.id);
    run(`DELETE FROM assignment_pages WHERE assignment_id=? AND page_id=?`, a.id, req.params.pageId);
    res.json({ ok: true });
  })
);

/** Sayfa ve soruları (şık kutuları, anahtar, öğrenci çoğunluğu). Sayfalar bütün öğretmenlerin ortak havuzudur. */
app.get(
  "/api/pages/:id",
  need("teacher"),
  h((req, res) => {
    const p = one(`SELECT id, title, subject, status, error, width, height FROM pages WHERE id=?`, req.params.id);
    if (!p) fail(404, "Sayfa bulunamadı.");
    const qs = pageQuestions(p.id);
    const votes = crowdVotes(qs.map((q) => q.id));
    res.json({
      ...p,
      questions: qs.map((q) => {
        const k = keyFor(q, votes);
        return {
          id: q.id,
          number: q.number,
          region: q.region,
          options: q.options,
          key_letter: q.key_letter,
          crowd_key: k.source === "crowd" ? k.letter : null,
          votes: votes.get(q.id) || {},
          topic: q.topic,
          outcome_code: q.outcome_code,
          outcome_text: q.outcome_text,
        };
      }),
    });
  })
);

app.get(
  "/api/pages/:id/image",
  need(),
  h((req, res) => {
    const p = one(`SELECT template_file, photo_file FROM pages WHERE id=?`, req.params.id);
    if (!p) fail(404, "Bulunamadı.");
    res.sendFile(path.join(UPLOAD_DIR, path.basename(p.template_file || p.photo_file)));
  })
);

app.put(
  "/api/pages/:id",
  need("teacher"),
  h((req, res) => {
    const p = one(`SELECT * FROM pages WHERE id=?`, req.params.id);
    if (!p) fail(404, "Sayfa bulunamadı.");
    const { title, subject, keys, topic, outcome_code, outcome_text } = req.body || {};
    run(`UPDATE pages SET title=?, subject=? WHERE id=?`, title ?? p.title, subject ?? p.subject, p.id);
    // Toplu anahtar: "1C 2A 3D" ya da "CAD..." (sırayla).
    if (typeof keys === "string" && keys.trim()) {
      const pairs = [...keys.toUpperCase().matchAll(/(\d+)\s*[-.:)]?\s*([A-E])/g)];
      if (pairs.length) {
        for (const [, n, L] of pairs) run(`UPDATE questions SET key_letter=? WHERE page_id=? AND number=?`, L, p.id, Number(n));
      } else {
        // Sırayla yazıldıysa: 1. harf 1. sorunun, 2. harf 2. sorunun... (bulunamayan soru araya kayma yapmasın)
        const letters = keys.toUpperCase().replace(/[^A-E]/g, "").split("");
        letters.forEach((L, i) => run(`UPDATE questions SET key_letter=? WHERE page_id=? AND number=?`, L, p.id, i + 1));
      }
    }
    // Sayfadaki bütün sorulara aynı konu/kazanım (boş olanlara).
    if (topic || outcome_code || outcome_text) {
      run(
        `UPDATE questions SET topic=COALESCE(NULLIF(topic,''),?), outcome_code=COALESCE(NULLIF(outcome_code,''),?), outcome_text=COALESCE(NULLIF(outcome_text,''),?) WHERE page_id=?`,
        topic || null,
        outcome_code || null,
        outcome_text || null,
        p.id
      );
    }
    res.json({ ok: true });
  })
);

app.put(
  "/api/questions/:id",
  need("teacher"),
  h((req, res) => {
    const q = one(`SELECT * FROM questions WHERE id=?`, req.params.id);
    if (!q) fail(404, "Soru bulunamadı.");
    const b = req.body || {};
    if (b.key_letter != null && b.key_letter !== "" && !/^[A-E]$/.test(b.key_letter)) fail(400, "Anahtar A-E arası olmalı.");
    run(
      `UPDATE questions SET key_letter=?, topic=?, outcome_code=?, outcome_text=? WHERE id=?`,
      b.key_letter === undefined ? q.key_letter : b.key_letter || null,
      b.topic ?? q.topic,
      b.outcome_code === undefined ? q.outcome_code : b.outcome_code || null,
      b.outcome_text ?? q.outcome_text,
      q.id
    );
    res.json({ ok: true });
  })
);

/** Ödevi kim yaptı, kim yapmadı. */
app.get(
  "/api/assignments/:id/status",
  need("teacher"),
  h((req, res) => {
    const a = ownAssignment(req.user, req.params.id);
    const students = all(`SELECT id, name FROM users WHERE class_id=? AND role='student' ORDER BY name`, a.class_id);
    const pageCount = one(`SELECT count(*) AS n FROM assignment_pages WHERE assignment_id=?`, a.id).n;
    const rows = students.map((st) => {
      const subs = all(`SELECT * FROM submissions WHERE assignment_id=? AND student_id=? ORDER BY created_at`, a.id, st.id);
      const done = subs.filter((s) => s.status === "done");
      const c = countVerdicts(
        answerRows("s.assignment_id = ? AND s.student_id = ? AND s.status='done'", a.id, st.id)
      );
      const pages = new Set(done.map((s) => s.page_id)).size;
      const first = done[0]?.created_at;
      let state = "yapmadi";
      if (subs.some((s) => s.status === "processing")) state = "isleniyor";
      else if (done.length && done.every((s) => !s.has_handwriting)) state = "bos";
      else if (done.length) {
        state = a.due_date && first && first.slice(0, 10) > a.due_date ? "gec" : "yapti";
        if (pageCount && pages < pageCount) state = state === "gec" ? "gec" : "eksik";
      }
      return { student_id: st.id, name: st.name, state, pages, duplicate: subs.some((s) => s.duplicate_of), ...c };
    });
    res.json({ assignment: a, page_count: pageCount, students: rows });
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
        `SELECT a.*,
                (SELECT count(*) FROM assignment_pages ap WHERE ap.assignment_id=a.id) AS page_count,
                (SELECT count(DISTINCT s.page_id) FROM submissions s WHERE s.assignment_id=a.id AND s.student_id=? AND s.status='done') AS my_pages
           FROM assignments a WHERE a.class_id=? ORDER BY COALESCE(a.due_date,'9999') DESC, a.id DESC`,
        sid,
        st?.class_id ?? -1
      )
    );
  })
);

// ---------- Öğrenci fotoğrafı ve sonuçlar ----------

/**
 * Fotoğraf yükleme. İki yol:
 *  - Öğretmen: öğrencinin gönderdiği fotoğrafı (ör. WhatsApp'tan) kendisi yükler; student_id ve assignment_id verir.
 *  - Öğrenci: kendi koduyla girip kendisi yükler.
 */
app.post(
  "/api/submissions",
  need("student", "teacher"),
  h((req, res) => {
    const { image, assignment_id } = req.body || {};
    const { buf, ext } = decodeImage(image);
    let studentId;
    if (req.user.role === "teacher") {
      studentId = Number(req.body?.student_id);
      if (!studentId) fail(400, "Öğrenci seçin.");
      assertCanSeeStudent(req.user, studentId);
      if (!assignment_id) fail(400, "Ödev seçin.");
      const st = one(`SELECT class_id FROM users WHERE id=?`, studentId);
      if (!one(`SELECT 1 FROM assignments WHERE id=? AND class_id=?`, assignment_id, st.class_id)) fail(400, "Ödev bulunamadı.");
    } else {
      studentId = req.user.id;
      const today = one(`SELECT count(*) AS n FROM submissions WHERE student_id=? AND date(created_at)=date('now')`, studentId).n;
      if (today >= DAILY_UPLOAD_LIMIT) fail(429, `Günlük ${DAILY_UPLOAD_LIMIT} fotoğraf sınırına ulaştınız.`);
      if (assignment_id && !one(`SELECT 1 FROM assignments WHERE id=? AND class_id=?`, assignment_id, req.user.class_id))
        fail(400, "Ödev bulunamadı.");
    }

    // Aynı fotoğraf daha önce yüklendi mi? (kopya kontrolü)
    const hash = crypto.createHash("sha256").update(buf).digest("hex");
    if (one(`SELECT 1 FROM submissions WHERE image_hash=? AND student_id=? AND status!='failed'`, hash, studentId))
      fail(409, "Bu fotoğraf bu öğrenci için zaten yüklenmiş.");
    const dupOther = one(`SELECT id FROM submissions WHERE image_hash=? AND student_id!=?`, hash, studentId);

    const r = run(
      `INSERT INTO submissions (student_id, assignment_id, image_file, image_hash, duplicate_of) VALUES (?,?,?,?,?)`,
      studentId,
      assignment_id || null,
      saveFile(buf, ext),
      hash,
      dupOther?.id || null
    );
    const id = Number(r.lastInsertRowid);
    enqueue(() => processSubmission(id));
    res.json({ id, status: "processing" });
  })
);

/** Öğretmen yanlış öğrenciye yüklenen fotoğrafı siler. */
app.delete(
  "/api/submissions/:id",
  need("teacher"),
  h((req, res) => {
    const s = one(`SELECT * FROM submissions WHERE id=?`, req.params.id);
    if (!s) fail(404, "Bulunamadı.");
    assertCanSeeStudent(req.user, s.student_id);
    run(`DELETE FROM submissions WHERE id=?`, s.id);
    removeFile(s.image_file);
    removeFile(s.overlay_file);
    res.json({ ok: true });
  })
);

app.get(
  "/api/submissions",
  need(),
  h((req, res) => {
    const sid =
      req.user.role === "student" ? req.user.id : req.user.role === "parent" ? req.user.child_id : Number(req.query.student_id);
    assertCanSeeStudent(req.user, sid);
    const subs = all(
      `SELECT s.id, s.status, s.error, s.created_at, s.has_handwriting, s.duplicate_of, a.title AS assignment_title, p.title AS page_title
         FROM submissions s LEFT JOIN assignments a ON a.id=s.assignment_id LEFT JOIN pages p ON p.id=s.page_id
        WHERE s.student_id=? ORDER BY s.id DESC LIMIT 100`,
      sid
    );
    for (const s of subs) Object.assign(s, countVerdicts(answerRows("a.submission_id = ?", s.id)));
    res.json(subs);
  })
);

app.get(
  "/api/submissions/:id",
  need(),
  h((req, res) => {
    const s = one(`SELECT * FROM submissions WHERE id=?`, req.params.id);
    if (!s) fail(404, "Gönderim bulunamadı.");
    assertCanSeeStudent(req.user, s.student_id);
    const page = s.page_id ? one(`SELECT id, title, subject, width, height FROM pages WHERE id=?`, s.page_id) : null;
    const qs = page ? new Map(pageQuestions(page.id).map((q) => [q.id, q])) : new Map();
    const answers = withVerdicts(
      all(
        `SELECT a.*, q.key_letter, q.number, q.topic, q.outcome_code, q.outcome_text
           FROM answers a JOIN questions q ON q.id=a.question_id WHERE a.submission_id=? ORDER BY q.number`,
        s.id
      )
    ).map((a) => ({
      ...a,
      option_ratios: JSON.parse(a.option_ratios_json || "{}"),
      options: qs.get(a.question_id)?.options || [],
      region: qs.get(a.question_id)?.region || null,
    }));
    const student = one(`SELECT name FROM users WHERE id=?`, s.student_id);
    res.json({
      id: s.id,
      status: s.status,
      error: s.error,
      created_at: s.created_at,
      has_handwriting: s.has_handwriting,
      duplicate_of: s.duplicate_of,
      match_score: s.match_score,
      student_name: student?.name,
      page,
      image_url: `/api/submissions/${s.id}/image`,
      overlay_url: s.overlay_file ? `/api/submissions/${s.id}/overlay` : null,
      answers,
      counts: countVerdicts(answers),
    });
  })
);

for (const [route, col] of [
  ["image", "image_file"],
  ["overlay", "overlay_file"],
]) {
  app.get(
    `/api/submissions/:id/${route}`,
    need(),
    h((req, res) => {
      const s = one(`SELECT * FROM submissions WHERE id=?`, req.params.id);
      if (!s || !s[col]) fail(404, "Bulunamadı.");
      assertCanSeeStudent(req.user, s.student_id);
      res.sendFile(path.join(UPLOAD_DIR, path.basename(s[col])));
    })
  );
}

/** Öğretmen bir sorunun kararını elle değiştirir. */
app.put(
  "/api/answers/:id",
  need("teacher"),
  h((req, res) => {
    const a = one(`SELECT a.*, s.student_id FROM answers a JOIN submissions s ON s.id=a.submission_id WHERE a.id=?`, req.params.id);
    if (!a) fail(404, "Cevap bulunamadı.");
    assertCanSeeStudent(req.user, a.student_id);
    const v = req.body?.verdict ?? null;
    if (v !== null && !["correct", "wrong", "blank"].includes(v)) fail(400, "Geçersiz karar.");
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
    const rows = answerRows("s.student_id = ? AND s.status='done'", st.id);
    const totals = {
      pages: one(`SELECT count(*) AS n FROM submissions WHERE student_id=? AND status='done'`, st.id).n,
      ...countVerdicts(rows),
    };
    const assignments = all(
      `SELECT a.id, a.title, a.due_date,
              (SELECT count(*) FROM assignment_pages ap WHERE ap.assignment_id=a.id) AS page_count,
              (SELECT count(DISTINCT s.page_id) FROM submissions s WHERE s.assignment_id=a.id AND s.student_id=? AND s.status='done' AND s.has_handwriting=1) AS pages
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

// ---------- Hata yakalama ----------

app.use("/api", (_req, _res, next) => next(new HttpError(404, "Bulunamadı.")));
app.use((err, _req, res, _next) => {
  if (!(err instanceof HttpError)) console.error(err);
  res.status(err.status || 500).json({ error: err instanceof HttpError ? err.message : "Sunucu hatası." });
});

// Sunucu yeniden başladıysa yarım kalan işleri tekrar kuyruğa al.
for (const p of all(`SELECT id FROM pages WHERE status='processing'`)) enqueue(() => processPage(p.id));
for (const s of all(`SELECT id FROM submissions WHERE status='processing'`)) enqueue(() => processSubmission(s.id));

const server = app.listen(PORT, () => {
  console.log(`Ödev Kontrol çalışıyor: http://localhost:${PORT}`);
});
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, async () => {
    server.close();
    await shutdownVision();
    process.exit(0);
  });
}
