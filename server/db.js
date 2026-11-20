// Veritabanı: Node'un yerleşik SQLite modülü (ek kurulum gerekmez).
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = process.env.DATA_DIR || path.resolve("data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const db = new DatabaseSync(path.join(DATA_DIR, "odev-kontrol.db"));

db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  grade INTEGER,
  teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

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

-- Boş sayfa (şablon). Bütün öğretmenler arasında ortak havuz: aynı yayının sayfası bir kez eklenir.
CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,           -- ör. "X Yayınları 8. Sınıf Matematik s. 42"
  subject TEXT,
  photo_file TEXT NOT NULL,      -- öğretmenin çektiği fotoğraf
  template_file TEXT NOT NULL,   -- düzeltilmiş gri şablon (PNG)
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing','ready','failed')),
  error TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Sayfadaki sorular ve şık kutuları (koordinatlar şablon ölçeğinde).
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY,
  page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  region_json TEXT NOT NULL,     -- soru alanı {x0,y0,x1,y1}
  options_json TEXT NOT NULL,    -- [{letter, box}]
  key_letter TEXT,               -- öğretmenin girdiği doğru şık
  topic TEXT,                    -- konu
  outcome_code TEXT,             -- kazanım kodu (ör. M.8.1.2.1)
  outcome_text TEXT              -- kazanım açıklaması
);
CREATE INDEX IF NOT EXISTS idx_questions_page ON questions(page_id);

CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  due_date TEXT,                 -- YYYY-MM-DD
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assignment_pages (
  assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  sort INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (assignment_id, page_id)
);

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
  page_id INTEGER REFERENCES pages(id) ON DELETE SET NULL,  -- eşleşen boş sayfa
  image_file TEXT NOT NULL,
  overlay_file TEXT,             -- oturtulmuş sayfa, el yazısı maviye boyalı
  image_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing','done','failed')),
  error TEXT,
  match_score INTEGER,           -- resim benzerliği (ortak nokta sayısı)
  page_ink REAL,                 -- sayfadaki el yazısı oranı
  has_handwriting INTEGER,
  duplicate_of INTEGER REFERENCES submissions(id) ON DELETE SET NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS answers (
  id INTEGER PRIMARY KEY,
  submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  marked TEXT,                   -- işaretlenen şık
  state TEXT NOT NULL CHECK (state IN ('ok','none','multi')),
  share REAL,                    -- işaret benzerliği: seçilen şıkkın şıklardaki izden payı
  option_ratios_json TEXT,
  work_ratio REAL,               -- soru alanındaki el yazısı oranı
  has_work INTEGER NOT NULL DEFAULT 0,
  teacher_override TEXT,         -- öğretmen kararı değiştirdiyse
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_answers_q ON answers(question_id);
`);

/** Tek satır getir. */
export const one = (sql, ...p) => db.prepare(sql).get(...p);
/** Çok satır getir. */
export const all = (sql, ...p) => db.prepare(sql).all(...p);
/** Yaz, { lastInsertRowid, changes } döner. */
export const run = (sql, ...p) => db.prepare(sql).run(...p);
