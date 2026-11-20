// Yapay zekâ adımları (Claude):
//  1) readPage    : fotoğraftan basılı soruları ve öğrencinin el yazısını ayrı ayrı okur
//  2) solveQuestion: soruyu çözer, cevap anahtarı + konu + kazanım üretir
//  3) gradeAnswer : öğrencinin el yazısı çözümünü anahtarla adım adım karşılaştırır
// ANTHROPIC_API_KEY yoksa (ya da AI_MODE=mock ise) sahte verilerle çalışır.
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";

const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";
export const AI_MODE = process.env.AI_MODE || (process.env.ANTHROPIC_API_KEY ? "claude" : "mock");
// Güvenlik filtresi bir isteği reddederse sunucu tarafında yedek modele geçilir.
// Sorun çıkarsa CLAUDE_FALLBACKS=off ile kapatılabilir.
const USE_FALLBACKS = process.env.CLAUDE_FALLBACKS !== "off";

const client = AI_MODE === "claude" ? new Anthropic() : null;

// ---------- Şemalar ----------

const PageSchema = z.object({
  page_has_handwriting: z.boolean().describe("Sayfada öğrenciye ait herhangi bir el yazısı/işaret var mı"),
  publisher: z.string().nullable().describe("Yayınevi adı, sayfada görünüyorsa"),
  book: z.string().nullable().describe("Kitap, fasikül ya da test adı"),
  page: z.string().nullable().describe("Sayfa numarası"),
  questions: z.array(
    z.object({
      question_no: z.string().nullable(),
      subject: z.string().describe("Ders: Matematik, Fen Bilimleri, Türkçe, Sosyal Bilgiler, İngilizce, Fizik, Kimya, Biyoloji, Tarih, Coğrafya, Edebiyat, Din Kültürü..."),
      grade: z.number().int().nullable().describe("Tahmini sınıf seviyesi 1-12"),
      question_text: z.string().describe("Basılı (makine yazısı) soru metni, aynen; şekil varsa kısaca [Şekil: ...] olarak tarif et"),
      options: z.array(z.string()).describe("Test şıkları 'A) ...' biçiminde; yoksa boş"),
      is_multiple_choice: z.boolean(),
      has_student_work: z.boolean().describe("Bu soruda öğrencinin el yazısı çözümü ya da işaretlemesi var mı"),
      student_work: z.string().describe("Öğrencinin el yazısıyla yazdığı her şey, satır satır, aynen (düzeltmeden)"),
      student_final_answer: z.string().describe("Öğrencinin vardığı son cevap ya da işaretlediği şık; yoksa boş"),
      read_confidence: z.number().describe("El yazısını okuma güvenin, 0 ile 1 arası"),
    })
  ),
});

const KeySchema = z.object({
  subject: z.string(),
  grade: z.number().int().nullable(),
  topic: z.string().describe("Konu adı, ör. 'Üslü İfadeler'"),
  outcome_code: z.string().nullable().describe("MEB öğretim programı kazanım kodu, ör. M.8.1.2.1; emin değilsen null"),
  outcome_text: z.string().describe("Kazanımın açıklaması"),
  final_answer: z.string().describe("Kesin son cevap; testse yalnız şık harfi ve değeri, ör. 'C) 12'"),
  steps: z.array(
    z.object({
      description: z.string().describe("Bu adımda ne yapılır"),
      expected: z.string().describe("Adımın beklenen ara sonucu"),
    })
  ),
  confidence: z.number().describe("Çözümün doğruluğuna güvenin, 0 ile 1 arası"),
});

const GradeSchema = z.object({
  final_correct: z.boolean().describe("Öğrencinin son cevabı anahtarla matematiksel/anlamca aynı mı"),
  alternative_method: z.boolean().describe("Öğrenci anahtardan farklı ama geçerli bir yol izlemiş mi"),
  step_results: z.array(
    z.object({
      step: z.number().int().describe("Anahtardaki adım sırası, 1'den başlar"),
      status: z.enum(["dogru", "hatali", "eksik"]),
      note: z.string(),
    })
  ),
  method_score: z.number().int().describe("Farklı yol izlendiyse yolun doğruluğu 0-100; aksi halde 0"),
  error_type: z.enum(["yok", "islem_hatasi", "kavram_hatasi", "eksik_cozum", "soruyu_yanlis_anlama", "okunamadi"]),
  feedback: z.string().describe("Öğrenciye 1-3 cümlelik, nazik ve öğretici açıklama"),
});

// ---------- Ortak çağrı ----------

async function ask({ schema, system, content, effort }) {
  const params = {
    model: MODEL,
    max_tokens: 16000,
    system,
    output_config: { effort, format: betaZodOutputFormat(schema) },
    messages: [{ role: "user", content }],
  };
  if (USE_FALLBACKS) {
    params.betas = ["server-side-fallback-2026-07-01"];
    params.fallbacks = "default";
  }
  try {
    const res = await client.beta.messages.parse(params);
    if (res.stop_reason === "refusal") throw new Error("Yapay zekâ bu isteği işlemedi (güvenlik reddi).");
    if (res.stop_reason === "max_tokens") throw new Error("Yanıt çok uzun, kesildi.");
    if (!res.parsed_output) throw new Error("Yapay zekâ yanıtı okunamadı.");
    return res.parsed_output;
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) throw new Error("ANTHROPIC_API_KEY geçersiz.");
    if (err instanceof Anthropic.RateLimitError) throw new Error("Yapay zekâ servisi meşgul, biraz sonra tekrar deneyin.");
    if (err instanceof Anthropic.BadRequestError) throw new Error(`Yapay zekâ isteği hatalı: ${err.message}`);
    if (err instanceof Anthropic.APIError) throw new Error(`Yapay zekâ servisi hatası (${err.status}).`);
    throw err;
  }
}

// ---------- 1) Sayfayı oku ----------

const READ_SYSTEM = `Sen Türk okullarında ödev kontrolü yapan bir asistansın. Sana öğrencinin telefonla çektiği bir ödev sayfası fotoğrafı gelecek.
Görevin sayfadaki iki tür yazıyı AYIRMAK:
- MAKİNE YAZISI (basılı): kitap/test sorusu, şıklar, yayınevi adı, sayfa ve soru numaraları.
- EL YAZISI: öğrencinin kalemle yazdığı çözüm, işlemler, işaretlediği şık, karalamalar.
Kurallar:
- Basılı soru metnini olduğu gibi yaz. Öğrencinin yazdıklarını DÜZELTME; yanlış da olsa gördüğün gibi aktar.
- Sayfadaki her soruyu ayrı ayrı listele. Soru kesik ya da tamamen görünmüyorsa atla.
- Öğrenci bir soruya hiç dokunmamışsa has_student_work=false, student_work boş olsun.
- Yuvarlak içine alınmış / işaretlenmiş şıkkı student_final_answer olarak yaz.
- Okuyamadığın kısımlar için [okunamadı] yaz ve read_confidence'ı düşür.
- Yayınevi, kitap ve sayfa bilgisi sayfa üst/alt kenarında olabilir; yoksa null.
Bütün metin alanları Türkçe olsun.`;

export async function readPage(imageBase64, mediaType = "image/jpeg") {
  if (AI_MODE === "mock") return mockReadPage();
  return ask({
    schema: PageSchema,
    system: READ_SYSTEM,
    effort: "medium",
    content: [
      { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
      { type: "text", text: "Bu ödev sayfasını oku: basılı soruları ve öğrencinin el yazısını ayır." },
    ],
  });
}

// ---------- 2) Soruyu çöz, cevap anahtarı üret ----------

const SOLVE_SYSTEM = `Sen Türkiye MEB öğretim programlarını iyi bilen uzman bir öğretmensin. Verilen soruyu çöz ve cevap anahtarı hazırla.
- Soruyu dikkatle, kendin baştan çöz; sonucu ikinci kez kontrol et. Bu anahtar başka öğrencilerin ödevini puanlamakta kullanılacak, hata yapmamak çok önemli.
- steps: öğrencinin izlemesi beklenen 2-6 temel adım. Her adım puanlanabilir olsun (ör. "Verilenleri yaz", "Formülü kur", "İşlemi yap").
  Sözel/yorum sorularında adımlar cevapta bulunması gereken ana fikirler olsun.
- final_answer kısa ve kesin olsun. Açık uçlu sorularda beklenen cevabın özünü yaz.
- topic ve outcome_text: sorunun ölçtüğü konu ve kazanım. outcome_code için MEB kazanım kodunu (ör. M.8.1.2.1, F.7.3.1.2, T.6.3.4) yalnızca eminsen yaz, değilsen null.
- Soru eksik/okunamaz ise confidence düşük olsun.
Bütün metin alanları Türkçe olsun.`;

export async function solveQuestion(q) {
  if (AI_MODE === "mock") return mockSolve(q);
  const text = [
    `Ders: ${q.subject || "?"}`,
    q.grade ? `Sınıf: ${q.grade}` : null,
    `Soru: ${q.question_text}`,
    q.options?.length ? `Şıklar:\n${q.options.join("\n")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  return ask({ schema: KeySchema, system: SOLVE_SYSTEM, effort: "high", content: [{ type: "text", text }] });
}

// ---------- 3) Öğrenci çözümünü anahtarla karşılaştır ----------

const GRADE_SYSTEM = `Sen dikkatli ve adil bir öğretmensin. Öğrencinin el yazısından okunmuş çözümünü cevap anahtarıyla karşılaştır.
- final_correct: son cevap anahtarla AYNI DEĞERDE mi? Yazım farkları önemli değil: "0,5" = "1/2" = "%50"; "12 cm" = "12"; testte şık harfi aynıysa doğru.
  Sözel sorularda anlam aynıysa doğru say.
- step_results: anahtardaki HER adım için öğrencinin çözümünde o adım var mı (dogru), yanlış yapılmış mı (hatali), hiç yok mu (eksik).
- Öğrenci farklı ama geçerli bir yoldan gittiyse alternative_method=true ve method_score ile o yolu 0-100 puanla; adımları yine de işaretle.
- Okuma hatası olabilecek yerlerde öğrencinin aleyhine karar verme; okunamadıysa error_type=okunamadi.
- feedback: öğrenciye hitaben, nerede hata yaptığını ve doğrusunu kısaca söyle.
Bütün metin alanları Türkçe olsun.`;

export async function gradeAnswer(key, student) {
  if (AI_MODE === "mock") return mockGrade(key, student);
  const steps = key.steps.map((s, i) => `${i + 1}. ${s.description} → ${s.expected}`).join("\n");
  const text = `SORU:\n${key.question_text}${key.options?.length ? `\nŞıklar:\n${key.options.join("\n")}` : ""}

CEVAP ANAHTARI:
Son cevap: ${key.final_answer}
Adımlar:
${steps}

ÖĞRENCİNİN ÇÖZÜMÜ (el yazısından okundu):
${student.student_work || "(boş)"}
Öğrencinin son cevabı: ${student.student_final_answer || "(yok)"}`;
  return ask({ schema: GradeSchema, system: GRADE_SYSTEM, effort: "medium", content: [{ type: "text", text }] });
}

/** Adım sonuçlarından 0-100 çözüm yolu puanı. */
export function stepScoreOf(grade, stepCount) {
  if (!stepCount) return 0;
  const pts = grade.step_results.reduce(
    (s, r) => s + (r.status === "dogru" ? 1 : r.status === "hatali" ? 0.25 : 0),
    0
  );
  const byKey = Math.round((Math.min(pts, stepCount) / stepCount) * 100);
  return grade.alternative_method ? Math.max(byKey, grade.method_score) : byKey;
}

// ---------- Deneme (mock) modu ----------

const MOCK_BANK = [
  {
    question_no: "1",
    subject: "Matematik",
    grade: 8,
    question_text: "2³ · 2⁴ işleminin sonucu kaçtır?",
    options: ["A) 2⁷", "B) 2¹²", "C) 4⁷", "D) 2¹"],
    is_multiple_choice: true,
    key: {
      topic: "Üslü İfadeler",
      outcome_code: "M.8.1.2.1",
      outcome_text: "Tam sayıların, tam sayı kuvvetlerini hesaplar ve üslü ifadelerle çarpma yapar.",
      final_answer: "A) 2⁷",
      steps: [
        { description: "Tabanların aynı olduğunu fark et", expected: "Taban 2" },
        { description: "Üsleri topla", expected: "3 + 4 = 7" },
      ],
    },
    answers: [
      { work: "tabanlar aynı üsler toplanır 3+4=7 → 2⁷", final: "A" },
      { work: "3·4=12 → 2¹²", final: "B" },
    ],
  },
  {
    question_no: "2",
    subject: "Fen Bilimleri",
    grade: 7,
    question_text: "Kütlesi 4 kg olan bir cisme 20 N net kuvvet uygulanıyor. Cismin ivmesi kaç m/s² olur?",
    options: [],
    is_multiple_choice: false,
    key: {
      topic: "Kuvvet ve Hareket",
      outcome_code: null,
      outcome_text: "Net kuvvet, kütle ve ivme arasındaki ilişkiyi kullanarak problem çözer.",
      final_answer: "5 m/s²",
      steps: [
        { description: "Verilenleri yaz", expected: "m = 4 kg, F = 20 N" },
        { description: "Formülü kur", expected: "F = m · a" },
        { description: "İvmeyi hesapla", expected: "a = 20 / 4 = 5 m/s²" },
      ],
    },
    answers: [
      { work: "m=4kg F=20N\nF=m.a\n20=4.a\na=5", final: "5" },
      { work: "a=5", final: "5" },
      { work: "F=m.a\n20=4.a\na=80", final: "80" },
    ],
  },
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function mockReadPage() {
  return {
    page_has_handwriting: true,
    publisher: "Örnek Yayınları",
    book: "8. Sınıf Soru Bankası",
    page: "42",
    questions: MOCK_BANK.map((m) => {
      const a = pick(m.answers);
      return {
        question_no: m.question_no,
        subject: m.subject,
        grade: m.grade,
        question_text: m.question_text,
        options: m.options,
        is_multiple_choice: m.is_multiple_choice,
        has_student_work: true,
        student_work: a.work,
        student_final_answer: a.final,
        read_confidence: 0.9,
      };
    }),
  };
}

function mockSolve(q) {
  const m = MOCK_BANK.find((x) => x.question_text === q.question_text) || MOCK_BANK[0];
  return { subject: m.subject, grade: m.grade, ...m.key, confidence: 0.95 };
}

function mockGrade(key, student) {
  const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const f = norm(student.student_final_answer);
  const final_correct = !!f && norm(key.final_answer).startsWith(f);
  const work = student.student_work || "";
  const step_results = key.steps.map((s, i) => {
    const found = norm(work).includes(norm(s.expected).slice(-3));
    return { step: i + 1, status: found ? "dogru" : "eksik", note: found ? "Adım yapılmış." : "Bu adım yazılmamış." };
  });
  return {
    final_correct,
    alternative_method: false,
    step_results,
    method_score: 0,
    error_type: final_correct ? "yok" : "islem_hatasi",
    feedback: final_correct ? "Tebrikler, doğru!" : `Doğru cevap ${key.final_answer}. Adımlarını tekrar kontrol et.`,
  };
}
