// Doğruluk testi: yapay test sayfaları üzerinde sayfa düzeni bulma, şık okuma ve işlem tespiti.
// Çalıştırma: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { layoutPage, studentInk, renderPage, photograph, rng } from "./synthetic.js";
import { readTemplate, readStudentPage, shutdownVision } from "../server/vision.js";

test("boş sayfa, öğrenci fotoğrafları ve şık okuma doğruluğu", { timeout: 600_000 }, async (t) => {
  const PAGES = 2;
  const STUDENTS = 8;
  let total = 0;
  let correctMark = 0;
  let correctWork = 0;
  let foundQuestions = 0;
  const errors = [];
  const times = [];

  for (let p = 0; p < PAGES; p++) {
    const layout = layoutPage(p + 1);
    // Öğretmen boş sayfayı da telefonla çeker.
    const blankPhoto = await photograph(await renderPage(layout), 100 + p, 0.6);
    const tmpl = await readTemplate(blankPhoto);
    foundQuestions += tmpl.questions.length;
    t.diagnostic(`sayfa ${p + 1}: ${tmpl.questions.length}/${layout.questions.length} soru bulundu; başlık: "${tmpl.headerText}"`);
    const qs = tmpl.questions.map((q, i) => ({ ...q, key: q.number }));
    assert.ok(tmpl.questions.length >= layout.questions.length - 1, "soruların çoğu bulunmalı");

    for (let s = 0; s < STUDENTS; s++) {
      const r = rng(1000 * p + s + 1);
      const answers = layout.questions.map((q) => {
        const x = r();
        // %15 boş, %15 çözümsüz işaret, %5 iki şık, kalanı işlem + işaret
        if (x < 0.15) return { number: q.number, mark: null, work: false };
        const mark = "ABCD"[Math.floor(r() * 4)];
        if (x < 0.3) return { number: q.number, mark, work: false, style: r() < 0.3 ? "tick" : "circle" };
        if (x < 0.35) return { number: q.number, mark, mark2: mark === "A" ? "C" : "A", work: true };
        return { number: q.number, mark, work: true, style: r() < 0.2 ? "tick" : "circle" };
      });
      const photo = await photograph(await renderPage(layout, studentInk(layout, answers, 50 + s)), 200 + s + p * 31, 1);
      const t0 = Date.now();
      const res = await readStudentPage(photo, [{ id: p, png: tmpl.png, questions: qs }]);
      times.push(Date.now() - t0);
      assert.ok(res.matched, "sayfa eşleşmeli");
      for (const a of answers) {
        const got = res.answers.find((x) => x.question_key === a.number);
        if (!got) continue;
        total++;
        const expectState = a.mark2 ? "multi" : a.mark ? "ok" : "none";
        const ok = got.state === expectState && (expectState !== "ok" || got.marked === a.mark);
        if (ok) correctMark++;
        else errors.push(`s${p + 1} öğr${s + 1} soru ${a.number}: beklenen ${a.mark2 ? "çift" : a.mark || "boş"}, bulunan ${got.state === "ok" ? got.marked : got.state} ${JSON.stringify(got.option_ratios)}`);
        if (got.has_work === a.work) correctWork++;
      }
    }
  }
  await shutdownVision();
  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  t.diagnostic(`soru bulma: ${foundQuestions}/${PAGES * 8}`);
  t.diagnostic(`şık okuma doğruluğu: ${correctMark}/${total} = %${((100 * correctMark) / total).toFixed(1)}`);
  t.diagnostic(`işlem var/yok doğruluğu: ${correctWork}/${total} = %${((100 * correctWork) / total).toFixed(1)}`);
  t.diagnostic(`öğrenci sayfası başına ortalama süre: ${avg} ms`);
  for (const e of errors.slice(0, 15)) t.diagnostic(e);
  assert.ok(correctMark / total >= 0.9, "şık okuma en az %90 olmalı");
});
