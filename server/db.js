// Veritabanı: Node'un yerleşik SQLite modülü (ek kurulum gerekmez).
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = process.env.DATA_DIR || path.resolve("data");
fs.mkdirSync(path.join(DATA_DIR, "uploads"), { recursive: true });

export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
export const db = new DatabaseSync(path.join(DATA_DIR, "odev.db"));

db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('teacher','student','parent')),
  name TEXT NOT NULL,
  username TEXT UNIQUE,          -- öğretmen girişi
  password_hash TEXT,            -- öğretmen girişi
  login_code TEXT UNIQUE,        -- öğrenci/veli girişi (öğretmen üretir)
  class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
  child_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- veli -> öğrenci
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  grade INTEGER,
  teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  due_date TEXT,                 -- YYYY-MM-DD
  created_at TEXT DEFAULT (datetime('now'))
);

-- Ortak cevap anahtarı havuzu: aynı yayın + soru başka öğrenciden gelince tekrar kullanılır.
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY,
  publisher TEXT,                -- yayınevi
  book TEXT,                     -- kitap / fasikül adı
  page TEXT,
  question_no TEXT,
  subject TEXT,
  grade INTEGER,
  question_text TEXT NOT NULL,   -- basılı soru metni (makine yazısı)
  options_json TEXT,             -- test şıkları
  norm_text TEXT NOT NULL,       -- eşleştirme için sadeleştirilmiş metin
  topic TEXT,                    -- konu
  outcome_code TEXT,             -- kazanım kodu (ör. M.8.1.1.1)
  outcome_text TEXT,             -- kazanım açıklaması
  final_answer TEXT,
  steps_json TEXT,               -- anahtar çözüm adımları
  status TEXT NOT NULL DEFAULT 'unverified' CHECK (status IN ('unverified','verified','disputed')),
  verified_by INTEGER REFERENCES users(id),
  use_count INTEGER NOT NULL DEFAULT 0,
  agree_count INTEGER NOT NULL DEFAULT 0,  -- öğrencinin son cevabı anahtarla aynı çıkan
  created_by INTEGER REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_q_source ON questions(publisher, page, question_no);

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
  image_file TEXT NOT NULL,
  image_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing','done','failed')),
  error TEXT,
  has_handwriting INTEGER,       -- sayfada öğrenci el yazısı var mı (ödev yapılmış mı)
  duplicate_of INTEGER REFERENCES submissions(id), -- aynı fotoğraf başka öğrenciden geldiyse
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS answers (
  id INTEGER PRIMARY KEY,
  submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  student_work TEXT,             -- el yazısından okunan çözüm
  student_final TEXT,            -- öğrencinin son cevabı
  read_confidence REAL,          -- el yazısı okuma güveni 0-1
  final_correct INTEGER,         -- son cevap doğru mu (0/1)
  step_score INTEGER,            -- çözüm yolu puanı 0-100
  verdict TEXT NOT NULL CHECK (verdict IN ('correct','partial','wrong','blank','review')),
  reason TEXT,                   -- kısmi doğrunun nedeni
  feedback TEXT,                 -- öğrenciye açıklama
  step_results_json TEXT,
  teacher_override TEXT,         -- öğretmen kararı değiştirdiyse
  created_at TEXT DEFAULT (datetime('now'))
);
`);

/** Tek satır getir. */
export const one = (sql, ...p) => db.prepare(sql).get(...p);
/** Çok satır getir. */
export const all = (sql, ...p) => db.prepare(sql).all(...p);
/** Yaz, { lastInsertRowid, changes } döner. */
export const run = (sql, ...p) => db.prepare(sql).run(...p);
