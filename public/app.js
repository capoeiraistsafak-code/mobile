// Ödev Kontrol – arayüz (çerçevesiz, tek dosya).
const $app = document.getElementById("app");
let ME = null; // { user, child, aiMode, thresholds }

// ---------- Yardımcılar ----------

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

async function api(path, opts = {}) {
  const res = await fetch(path, {
    method: opts.method || (opts.body ? "POST" : "GET"),
    headers: opts.body ? { "Content-Type": "application/json" } : {},
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: "same-origin",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Hata (${res.status})`);
  return data;
}

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 3200);
}

const VERDICT = {
  correct: "Doğru",
  partial: "Kısmen doğru",
  wrong: "Yanlış",
  blank: "Boş",
  review: "Öğretmen bakacak",
};
const STATE = { yapti: "Yaptı", gec: "Geç teslim", yapmadi: "Yapmadı", bos: "Boş sayfa", isleniyor: "İşleniyor" };
const KEY_STATUS = { verified: "Doğrulandı", unverified: "Doğrulanmadı", disputed: "Şüpheli" };
const badge = (cls, text) => `<span class="badge b-${esc(cls)}">${esc(text)}</span>`;

const fmtDate = (s) => {
  if (!s) return "";
  const d = new Date(s.length === 10 ? s + "T00:00:00" : s.replace(" ", "T") + "Z");
  return d.toLocaleString("tr-TR", s.length === 10 ? { day: "numeric", month: "long" } : { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

function rateBar(rate) {
  const color = rate >= 75 ? "var(--ok)" : rate >= 60 ? "var(--mid)" : "var(--bad)";
  return `<div class="row" style="flex-wrap:nowrap"><div class="bar" style="flex:1"><span style="width:${rate}%;background:${color}"></span></div><b style="width:42px;text-align:right">%${rate}</b></div>`;
}

/** Fotoğrafı telefonda küçültür: hem yükleme hızlanır hem yapay zekâ maliyeti düşer. */
function compressImage(file, maxSide = 2000, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Fotoğraf açılamadı."));
    img.src = URL.createObjectURL(file);
  });
}

// ---------- Yönlendirme ----------

const routes = [];
const route = (re, fn) => routes.push([re, fn]);

async function render() {
  if (!ME) ME = await api("/api/me");
  const u = ME.user;
  document.getElementById("who").innerHTML = u
    ? `${esc(u.name)} <button class="link" id="logout">Çıkış</button>`
    : "";
  document.getElementById("banner").innerHTML =
    ME.aiMode === "mock"
      ? `<div class="warn">Deneme modu: yapay zekâ bağlı değil, sonuçlar örnek veridir.</div>`
      : "";
  document.getElementById("logout")?.addEventListener("click", async () => {
    await api("/api/auth/logout", { method: "POST" });
    ME = null;
    location.hash = "#/";
    render();
  });

  const hash = location.hash.slice(1) || "/";
  if (!u) return viewLogin();
  for (const [re, fn] of routes) {
    const m = re.exec(hash);
    if (m) {
      try {
        await fn(...m.slice(1));
      } catch (e) {
        $app.innerHTML = `<div class="card">⚠ ${esc(e.message)}</div><a href="#/">Ana sayfa</a>`;
      }
      window.scrollTo(0, 0);
      return;
    }
  }
  $app.innerHTML = `<p>Sayfa bulunamadı. <a href="#/">Ana sayfa</a></p>`;
}
window.addEventListener("hashchange", render);

route(/^\/$/, () => {
  const r = ME.user.role;
  if (r === "teacher") return viewTeacherHome();
  if (r === "student") return viewStudentHome();
  return viewStudentReport(ME.user.child_id);
});
route(/^\/sinif\/(\d+)(?:\/(\w+))?$/, (id, tab) => viewClass(id, tab || "odevler"));
route(/^\/odev\/(\d+)$/, (id) => viewAssignmentStatus(id));
route(/^\/ogrenci\/(\d+)$/, (id) => viewStudentReport(id));
route(/^\/gonderim\/(\d+)$/, (id) => viewSubmission(id));
route(/^\/raporum$/, () => viewStudentReport(ME.user.id));

// ---------- Giriş ----------

function viewLogin() {
  $app.innerHTML = `
    <h1>Hoş geldiniz</h1>
    <div class="tabs"><button data-t="code" class="on">Öğrenci / Veli</button><button data-t="teacher">Öğretmen</button></div>
    <div id="lf"></div>`;
  const tabs = $app.querySelectorAll(".tabs button");
  const show = (t) => {
    tabs.forEach((b) => b.classList.toggle("on", b.dataset.t === t));
    const lf = document.getElementById("lf");
    if (t === "code") {
      lf.innerHTML = `
        <form class="card stack" id="f">
          <div><label>Giriş kodu (öğretmeninizden alın)</label>
          <input name="code" autocomplete="one-time-code" autocapitalize="characters" maxlength="6" required placeholder="ör. K7MPA3" class="code" /></div>
          <button class="primary big">Giriş yap</button>
        </form>`;
      lf.querySelector("#f").onsubmit = async (e) => {
        e.preventDefault();
        await login({ code: e.target.code.value });
      };
    } else {
      lf.innerHTML = `
        <form class="card stack" id="f">
          <div><label>Kullanıcı adı</label><input name="username" autocomplete="username" required /></div>
          <div><label>Şifre</label><input name="password" type="password" autocomplete="current-password" required /></div>
          <button class="primary big">Giriş yap</button>
        </form>
        <details class="card"><summary>Yeni öğretmen hesabı aç</summary>
          <form class="stack" id="r" style="margin-top:10px">
            <div><label>Ad Soyad</label><input name="name" required /></div>
            <div><label>Kullanıcı adı</label><input name="username" autocomplete="username" required /></div>
            <div><label>Şifre (en az 6 karakter)</label><input name="password" type="password" minlength="6" autocomplete="new-password" required /></div>
            <button class="primary">Hesap aç</button>
          </form>
        </details>`;
      lf.querySelector("#f").onsubmit = async (e) => {
        e.preventDefault();
        await login({ username: e.target.username.value, password: e.target.password.value });
      };
      lf.querySelector("#r").onsubmit = async (e) => {
        e.preventDefault();
        const f = e.target;
        try {
          await api("/api/auth/register", { body: { name: f.name.value, username: f.username.value, password: f.password.value } });
          ME = null;
          render();
        } catch (err) {
          toast(err.message);
        }
      };
    }
  };
  tabs.forEach((b) => (b.onclick = () => show(b.dataset.t)));
  show("code");
}

async function login(body) {
  try {
    await api("/api/auth/login", { body });
    ME = null;
    location.hash = "#/";
    render();
  } catch (e) {
    toast(e.message);
  }
}

// ---------- Öğrenci ----------

async function viewStudentHome() {
  const [assignments, subs] = await Promise.all([api("/api/my/assignments"), api("/api/submissions")]);
  const today = new Date().toISOString().slice(0, 10);
  const open = assignments.filter((a) => !a.due_date || a.due_date >= today);
  $app.innerHTML = `
    <h1>Ödevimi kontrol et</h1>
    <div class="card stack">
      <div><label>Hangi ödev?</label>
        <select id="asg">
          <option value="">Serbest çalışma (ödev seçmeden)</option>
          ${assignments
            .map(
              (a) =>
                `<option value="${a.id}" ${a === open[0] ? "selected" : ""}>${esc(a.title)}${a.due_date ? ` – son gün ${fmtDate(a.due_date)}` : ""}${a.my_pages ? " ✓" : ""}</option>`
            )
            .join("")}
        </select></div>
      <input type="file" id="cam" accept="image/*" capture="environment" hidden />
      <input type="file" id="gal" accept="image/*" hidden />
      <button class="primary big" id="shoot">📷 Fotoğraf çek</button>
      <button id="pick">🖼 Galeriden seç</button>
      <p class="muted small">Sayfayı düz bir yere koyun, gölge düşürmeyin, bütün sayfa kareye sığsın. Her sayfa için ayrı fotoğraf çekin.</p>
    </div>
    <div id="progress"></div>
    <div class="row between"><h2>Gönderdiklerim</h2><a href="#/raporum">Eksik konularım →</a></div>
    <div id="subs">${subsList(subs)}</div>`;

  const cam = document.getElementById("cam");
  const gal = document.getElementById("gal");
  document.getElementById("shoot").onclick = () => cam.click();
  document.getElementById("pick").onclick = () => gal.click();
  const onFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    await upload(file, document.getElementById("asg").value);
  };
  cam.onchange = onFile;
  gal.onchange = onFile;
}

function subsList(subs) {
  if (!subs.length) return `<p class="muted">Henüz fotoğraf göndermediniz.</p>`;
  return subs
    .map((s) => {
      const st =
        s.status === "processing"
          ? `<span class="spinner"></span> İnceleniyor`
          : s.status === "failed"
            ? badge("wrong", "Okunamadı")
            : `${s.correct}/${s.n} doğru`;
      return `<a class="card row between" href="#/gonderim/${s.id}" style="text-decoration:none;color:inherit">
        <span><b>${esc(s.assignment_title || "Serbest çalışma")}</b><br><span class="muted small">${fmtDate(s.created_at)}</span></span>
        <span>${st}</span></a>`;
    })
    .join("");
}

async function upload(file, assignmentId) {
  const p = document.getElementById("progress");
  p.innerHTML = `<div class="card row"><span class="spinner"></span> Fotoğraf hazırlanıyor…</div>`;
  try {
    const image = await compressImage(file);
    p.innerHTML = `<div class="card row"><span class="spinner"></span> Yükleniyor…</div>`;
    const { id } = await api("/api/submissions", { body: { image, assignment_id: assignmentId ? Number(assignmentId) : null } });
    p.innerHTML = `<div class="card row"><span class="spinner"></span> Ödeviniz inceleniyor. Bu 30-60 saniye sürebilir…</div>`;
    await waitFor(id);
    location.hash = `#/gonderim/${id}`;
  } catch (e) {
    p.innerHTML = `<div class="card">⚠ ${esc(e.message)}</div>`;
  }
}

async function waitFor(id) {
  for (let i = 0; i < 100; i++) {
    const s = await api(`/api/submissions/${id}`);
    if (s.status !== "processing") return s;
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("İşlem uzun sürdü. Biraz sonra 'Gönderdiklerim' listesinden bakın.");
}

// ---------- Gönderim sonucu ----------

async function viewSubmission(id) {
  let s = await api(`/api/submissions/${id}`);
  if (s.status === "processing") {
    $app.innerHTML = `<div class="card row"><span class="spinner"></span> İnceleniyor…</div>`;
    s = await waitFor(id);
  }
  const teacher = ME.user.role === "teacher";
  const head = `
    <div class="row between"><h1>${esc(s.student_name)} – sonuç</h1><span class="muted small">${fmtDate(s.created_at)}</span></div>
    ${s.duplicate_of ? `<div class="card">${badge("wrong", "Uyarı")} Bu fotoğrafın aynısını başka bir öğrenci de yüklemiş.</div>` : ""}
    ${s.status === "done" && !s.has_handwriting ? `<div class="card">${badge("bos", "Boş")} Sayfada öğrenci yazısı bulunamadı; ödev yapılmamış görünüyor.</div>` : ""}
    <details class="card"><summary>Fotoğrafı göster</summary><img class="thumb" src="${s.image_url}" alt="Ödev fotoğrafı" loading="lazy" style="margin-top:8px"></details>`;

  if (s.status === "failed") {
    $app.innerHTML = head + `<div class="card">⚠ ${esc(s.error || "Fotoğraf işlenemedi.")}</div>`;
    return;
  }

  const counts = s.answers.reduce((m, a) => ((m[a.teacher_override || a.verdict] = (m[a.teacher_override || a.verdict] || 0) + 1), m), {});
  $app.innerHTML =
    head +
    `<div class="stats">
      ${["correct", "partial", "wrong", "blank"].map((v) => `<div class="stat"><b>${counts[v] || 0}</b>${VERDICT[v]}</div>`).join("")}
    </div>` +
    s.answers.map((a) => answerCard(a, teacher)).join("");

  if (teacher) {
    $app.querySelectorAll("[data-ov]").forEach((sel) => {
      sel.onchange = async () => {
        try {
          await api(`/api/answers/${sel.dataset.ov}`, { method: "PUT", body: { verdict: sel.value || null } });
          toast("Karar kaydedildi.");
          viewSubmission(id);
        } catch (e) {
          toast(e.message);
        }
      };
    });
  }
}

function answerCard(a, teacher) {
  const v = a.teacher_override || a.verdict;
  const src = [a.publisher, a.book, a.page && `s. ${a.page}`, a.question_no && `Soru ${a.question_no}`].filter(Boolean).join(" · ");
  const stepMap = new Map(a.step_results.map((r) => [r.step, r]));
  const stepIcon = { dogru: "✓", hatali: "✗", eksik: "–" };
  return `
  <div class="card">
    <div class="row between"><span class="muted small">${esc(src || a.subject)}</span>
      <span>${badge(v, VERDICT[v])}${a.teacher_override ? ` <span class="muted small">(öğretmen)</span>` : ""}</span></div>
    <p class="qtext">${esc(a.question_text)}</p>
    ${a.options.length ? `<p class="small">${a.options.map(esc).join("<br>")}</p>` : ""}
    <label>Öğrencinin çözümü (el yazısından okundu)</label>
    <div class="work">${esc(a.student_work || "(boş)")}</div>
    <p class="small">Öğrencinin cevabı: <b>${esc(a.student_final || "–")}</b> · Doğru cevap: <b>${esc(a.key_answer)}</b>
      ${a.step_score != null && !a.options.length ? ` · Çözüm yolu: <b>%${a.step_score}</b>` : ""}</p>
    ${a.reason ? `<p class="small"><b>${esc(a.reason)}</b></p>` : ""}
    ${a.feedback ? `<p class="small">💬 ${esc(a.feedback)}</p>` : ""}
    <details><summary class="small">Cevap anahtarı adımları ${badge(a.key_status, KEY_STATUS[a.key_status])}</summary>
      <ol class="steps small">${a.steps
        .map((st, i) => {
          const r = stepMap.get(i + 1);
          return `<li class="${r ? "st-" + r.status : ""}">${r ? stepIcon[r.status] + " " : ""}${esc(st.description)} → <i>${esc(st.expected)}</i>${r?.note ? `<br><span class="muted">${esc(r.note)}</span>` : ""}</li>`;
        })
        .join("")}</ol>
    </details>
    <p class="small muted">Konu: ${esc(a.topic)}${a.outcome_code ? ` · Kazanım ${esc(a.outcome_code)}` : ""}<br>${esc(a.outcome_text)}</p>
    ${
      teacher
        ? `<div class="row"><label style="margin:0">Kararı değiştir:</label>
           <select data-ov="${a.id}" style="width:auto">
             <option value="">Otomatik (${VERDICT[a.verdict]})</option>
             ${["correct", "partial", "wrong", "blank"].map((x) => `<option value="${x}" ${a.teacher_override === x ? "selected" : ""}>${VERDICT[x]}</option>`).join("")}
           </select></div>`
        : ""
    }
  </div>`;
}

// ---------- Rapor (öğrenci / veli / öğretmen) ----------

async function viewStudentReport(studentId) {
  const [r, subs] = await Promise.all([api(`/api/students/${studentId}/report`), api(`/api/submissions?student_id=${studentId}`)]);
  const t = r.totals;
  const weak = r.outcomes.filter((o) => o.weak);
  const today = new Date().toISOString().slice(0, 10);
  $app.innerHTML = `
    <h1>${esc(r.student.name)} – rapor</h1>
    <div class="stats">
      <div class="stat"><b>${t.pages || 0}</b>Sayfa</div>
      <div class="stat"><b>${t.questions || 0}</b>Soru</div>
      <div class="stat"><b>${t.correct || 0}</b>Doğru</div>
      <div class="stat"><b>${t.partial || 0}</b>Kısmen</div>
      <div class="stat"><b>${t.wrong || 0}</b>Yanlış</div>
    </div>

    <h2>Eksik olduğu kazanımlar</h2>
    ${
      weak.length
        ? weak.map((o) => outcomeCard(o)).join("")
        : `<p class="muted">${
            !r.outcomes.length
              ? "Henüz yeterli veri yok."
              : r.outcomes.some((o) => o.rate < ME.thresholds.weakOutcomeRate * 100)
                ? `Bazı konularda başarı düşük ama karar vermek için her konuda en az ${ME.thresholds.weakOutcomeMinAttempts} soru gerekiyor. Aşağıdaki tabloya bakın.`
                : "Eksik kazanım görünmüyor. 👏"
          }</p>`
    }

    ${
      r.assignments.length
        ? `<h2>Ödevler</h2><div class="card table-wrap"><table><tr><th>Ödev</th><th>Son gün</th><th>Durum</th></tr>
      ${r.assignments
        .map((a) => {
          const st = a.pages ? "yapti" : a.due_date && a.due_date < today ? "yapmadi" : "isleniyor";
          const label = a.pages ? `Yaptı (${a.pages} sayfa)` : st === "yapmadi" ? "Yapmadı" : "Bekleniyor";
          return `<tr><td>${esc(a.title)}</td><td>${fmtDate(a.due_date)}</td><td>${badge(st, label)}</td></tr>`;
        })
        .join("")}</table></div>`
        : ""
    }

    <h2>Bütün konular</h2>
    ${
      r.outcomes.length
        ? `<div class="card table-wrap"><table><tr><th>Konu / kazanım</th><th>Soru</th><th style="min-width:130px">Başarı</th></tr>
      ${r.outcomes
        .map(
          (o) =>
            `<tr><td><b>${esc(o.topic || o.key)}</b><br><span class="muted small">${esc(o.subject || "")}${o.outcome_code ? " · " + esc(o.outcome_code) : ""}</span></td><td>${o.attempts}</td><td>${rateBar(o.rate)}</td></tr>`
        )
        .join("")}</table></div>`
        : `<p class="muted">Henüz kontrol edilmiş ödev yok.</p>`
    }

    <h2>Gönderilen sayfalar</h2>
    ${subsList(subs)}`;
}

function outcomeCard(o) {
  return `<div class="card">
    <div class="row between"><b>${esc(o.topic || o.key)}</b>${badge("wrong", "%" + o.rate)}</div>
    <p class="small" style="margin:4px 0">${esc(o.subject || "")}${o.outcome_code ? ` · <b>${esc(o.outcome_code)}</b>` : ""}</p>
    <p class="small" style="margin:4px 0">${esc(o.outcome_text || "")}</p>
    <p class="small muted" style="margin:0">${o.attempts} soru: ${o.correct} doğru, ${o.partial} kısmen, ${o.wrong} yanlış, ${o.blank} boş</p>
    ${o.weakStudents != null ? `<p class="small" style="margin:4px 0 0">Bu kazanımda eksik olan öğrenci: <b>${o.weakStudents}</b></p>` : ""}
  </div>`;
}

// ---------- Öğretmen ----------

async function viewTeacherHome() {
  const classes = await api("/api/classes");
  $app.innerHTML = `
    <h1>Sınıflarım</h1>
    ${classes.map((c) => `<a class="card row between" href="#/sinif/${c.id}" style="text-decoration:none;color:inherit"><b>${esc(c.name)}</b><span class="muted">${c.student_count} öğrenci →</span></a>`).join("") || `<p class="muted">Henüz sınıf yok. Aşağıdan ekleyin.</p>`}
    <form class="card stack" id="nc">
      <h3>Yeni sınıf</h3>
      <div class="row" style="flex-wrap:nowrap">
        <input name="name" placeholder="ör. 8-A" required />
        <input name="grade" type="number" min="1" max="12" placeholder="Sınıf" style="width:100px" />
      </div>
      <button class="primary">Sınıf ekle</button>
    </form>`;
  document.getElementById("nc").onsubmit = async (e) => {
    e.preventDefault();
    try {
      const c = await api("/api/classes", { body: { name: e.target.name.value, grade: Number(e.target.grade.value) || null } });
      location.hash = `#/sinif/${c.id}/ogrenciler`;
    } catch (err) {
      toast(err.message);
    }
  };
}

async function viewClass(id, tab) {
  const c = await api(`/api/classes/${id}`);
  const tabs = { odevler: "Ödevler", ogrenciler: "Öğrenciler", kazanimlar: "Kazanımlar", anahtarlar: "Anahtarlar" };
  $app.innerHTML = `
    <a href="#/" class="small">← Sınıflar</a>
    <h1>${esc(c.name)}</h1>
    <div class="tabs">${Object.entries(tabs).map(([k, v]) => `<button class="${k === tab ? "on" : ""}" onclick="location.hash='#/sinif/${id}/${k}'">${v}</button>`).join("")}</div>
    <div id="tab"></div>`;
  const el = document.getElementById("tab");
  if (tab === "ogrenciler") return tabStudents(c, el);
  if (tab === "kazanimlar") return tabOutcomes(c, el);
  if (tab === "anahtarlar") return tabKeys(c, el);
  return tabAssignments(c, el);
}

async function tabAssignments(c, el) {
  const list = await api(`/api/classes/${c.id}/assignments`);
  el.innerHTML = `
    ${list.map((a) => `<a class="card row between" href="#/odev/${a.id}" style="text-decoration:none;color:inherit">
        <span><b>${esc(a.title)}</b><br><span class="muted small">${a.subject ? esc(a.subject) + " · " : ""}${a.due_date ? "Son gün " + fmtDate(a.due_date) : "Süresiz"}</span></span>
        <span><b>${a.submitted}</b>/${a.total} yaptı →</span></a>`).join("") || `<p class="muted">Henüz ödev verilmedi.</p>`}
    <form class="card stack" id="na">
      <h3>Yeni ödev</h3>
      <div><label>Başlık</label><input name="title" placeholder="ör. Üslü İfadeler – Soru Bankası s. 40-45" required /></div>
      <div class="row" style="flex-wrap:nowrap">
        <div style="flex:1"><label>Ders</label><input name="subject" placeholder="Matematik" /></div>
        <div style="flex:1"><label>Son gün</label><input name="due_date" type="date" /></div>
      </div>
      <div><label>Açıklama (isteğe bağlı)</label><input name="description" /></div>
      <button class="primary">Ödev ver</button>
    </form>`;
  el.querySelector("#na").onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target;
    try {
      await api(`/api/classes/${c.id}/assignments`, {
        body: { title: f.title.value, subject: f.subject.value, due_date: f.due_date.value || null, description: f.description.value },
      });
      toast("Ödev verildi.");
      tabAssignments(c, el);
    } catch (err) {
      toast(err.message);
    }
  };
}

function tabStudents(c, el) {
  el.innerHTML = `
    ${
      c.students.length
        ? `<div class="card table-wrap"><table>
      <tr><th>Öğrenci</th><th>Öğrenci kodu</th><th>Veli kodu</th><th>Sayfa</th></tr>
      ${c.students.map((s) => `<tr><td><a href="#/ogrenci/${s.id}">${esc(s.name)}</a></td><td class="code">${esc(s.login_code)}</td><td class="code">${esc(s.parent_code || "")}</td><td>${s.submission_count}</td></tr>`).join("")}
    </table></div>
    <button onclick="window.print()">🖨 Kodları yazdır</button>`
        : `<p class="muted">Öğrenci yok.</p>`
    }
    <form class="card stack" id="ns">
      <h3>Öğrenci ekle</h3>
      <div><label>Her satıra bir öğrenci adı (listeyi yapıştırabilirsiniz)</label><textarea name="names" required></textarea></div>
      <button class="primary">Ekle ve kod üret</button>
      <p class="muted small">Her öğrenciye ve velisine ayrı 6 haneli giriş kodu üretilir. Kodları öğrencilere dağıtın.</p>
    </form>`;
  el.querySelector("#ns").onsubmit = async (e) => {
    e.preventDefault();
    try {
      const r = await api(`/api/classes/${c.id}/students`, { body: { names: e.target.names.value } });
      toast(`${r.added} öğrenci eklendi.`);
      viewClass(c.id, "ogrenciler");
    } catch (err) {
      toast(err.message);
    }
  };
}

async function tabOutcomes(c, el) {
  const list = await api(`/api/classes/${c.id}/outcomes`);
  if (!list.length) return (el.innerHTML = `<p class="muted">Henüz kontrol edilmiş ödev yok.</p>`);
  el.innerHTML = `
    <p class="muted small">Başarı oranı %${Math.round(ME.thresholds.weakOutcomeRate * 100)}'in altında olan kazanımlar "eksik" sayılır (en az ${ME.thresholds.weakOutcomeMinAttempts} soru). Kısmen doğru yarım puan sayılır.</p>
    <div class="card table-wrap"><table>
      <tr><th>Konu / kazanım</th><th>Soru</th><th>Eksik öğrenci</th><th style="min-width:130px">Sınıf başarısı</th></tr>
      ${list
        .map(
          (o) => `<tr><td><b>${esc(o.topic || o.key)}</b><br><span class="muted small">${esc(o.subject || "")}${o.outcome_code ? " · " + esc(o.outcome_code) : ""}</span><br><span class="small">${esc(o.outcome_text || "")}</span></td>
          <td>${o.attempts}</td><td>${o.weakStudents}</td><td>${rateBar(o.rate)}</td></tr>`
        )
        .join("")}
    </table></div>`;
}

async function tabKeys(c, el) {
  const list = await api(`/api/questions`);
  el.innerHTML = `
    <p class="muted small">Yapay zekânın hazırladığı anahtarlar önce "doğrulanmadı" olarak kaydedilir. ${ME.thresholds.autoVerifyAgreements} öğrenci aynı sonucu bulunca ya da siz onaylayınca "doğrulandı" olur. Çok öğrenci aynı farklı cevabı verirse "şüpheli" işaretlenir. Düzeltirseniz o soruyu çözen bütün öğrenciler yeniden puanlanır.</p>
    ${list.map((q) => keyCard(q)).join("") || `<p class="muted">Öğrencileriniz henüz soru göndermedi.</p>`}`;
  el.querySelectorAll("form[data-q]").forEach((f) => {
    f.onsubmit = async (e) => {
      e.preventDefault();
      const btn = f.querySelector("button");
      btn.disabled = true;
      const steps = f.steps.value
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => {
          const [d, ...rest] = l.split("→");
          return { description: d.trim(), expected: rest.join("→").trim() };
        });
      try {
        const r = await api(`/api/questions/${f.dataset.q}`, {
          method: "PUT",
          body: { final_answer: f.final_answer.value, steps, topic: f.topic.value, outcome_code: f.outcome_code.value, outcome_text: f.outcome_text.value },
        });
        toast(r.regraded ? `Kaydedildi, ${r.regraded} cevap yeniden puanlandı.` : "Anahtar onaylandı.");
        tabKeys(c, el);
      } catch (err) {
        toast(err.message);
        btn.disabled = false;
      }
    };
  });
}

function keyCard(q) {
  const src = [q.publisher, q.book, q.page && `s. ${q.page}`, q.question_no && `Soru ${q.question_no}`].filter(Boolean).join(" · ");
  return `<details class="card" ${q.status === "disputed" ? "open" : ""}>
    <summary class="row between"><span>${badge(q.status, KEY_STATUS[q.status])} <span class="small">${esc(src || q.subject)}</span></span>
      <span class="muted small">${q.answer_count} öğrencinizin cevabı · toplam ${q.use_count} kullanım</span></summary>
    <p class="qtext">${esc(q.question_text)}</p>
    ${q.options.length ? `<p class="small">${q.options.map(esc).join("<br>")}</p>` : ""}
    <form class="stack" data-q="${q.id}">
      <div><label>Doğru cevap</label><input name="final_answer" value="${esc(q.final_answer)}" required /></div>
      <div><label>Çözüm adımları (her satır: adım → beklenen sonuç)</label>
        <textarea name="steps">${esc(q.steps.map((s) => `${s.description} → ${s.expected}`).join("\n"))}</textarea></div>
      <div class="row" style="flex-wrap:nowrap">
        <div style="flex:2"><label>Konu</label><input name="topic" value="${esc(q.topic)}" /></div>
        <div style="flex:1"><label>Kazanım kodu</label><input name="outcome_code" value="${esc(q.outcome_code || "")}" /></div>
      </div>
      <div><label>Kazanım</label><input name="outcome_text" value="${esc(q.outcome_text)}" /></div>
      <button class="primary">${q.status === "verified" ? "Kaydet" : "Onayla / düzelt"}</button>
    </form>
  </details>`;
}

async function viewAssignmentStatus(id) {
  const { assignment: a, students } = await api(`/api/assignments/${id}/status`);
  const count = (s) => students.filter((x) => x.state === s).length;
  $app.innerHTML = `
    <a href="#/sinif/${a.class_id}" class="small">← Ödevler</a>
    <h1>${esc(a.title)}</h1>
    <p class="muted">${a.subject ? esc(a.subject) + " · " : ""}${a.due_date ? "Son gün " + fmtDate(a.due_date) : "Süresiz"}${a.description ? "<br>" + esc(a.description) : ""}</p>
    <div class="stats">
      <div class="stat"><b>${count("yapti")}</b>Yaptı</div>
      <div class="stat"><b>${count("gec")}</b>Geç</div>
      <div class="stat"><b>${count("bos")}</b>Boş sayfa</div>
      <div class="stat"><b>${count("yapmadi")}</b>Yapmadı</div>
    </div>
    <div class="card table-wrap"><table>
      <tr><th>Öğrenci</th><th>Durum</th><th>Sayfa</th><th>D / K / Y / B</th></tr>
      ${students
        .map(
          (s) => `<tr><td><a href="#/ogrenci/${s.student_id}">${esc(s.name)}</a>${s.duplicate ? ` ${badge("wrong", "Kopya foto")}` : ""}${s.review ? ` ${badge("review", s.review + " kontrol")}` : ""}</td>
          <td>${badge(s.state, STATE[s.state])}</td><td>${s.pages}</td>
          <td>${s.n ? `${s.correct || 0} / ${s.partial || 0} / ${s.wrong || 0} / ${s.blank || 0}` : "–"}</td></tr>`
        )
        .join("")}
    </table></div>
    <p class="muted small">D: doğru, K: kısmen doğru, Y: yanlış, B: boş. Öğrencinin adına dokunarak sayfalarını ve eksik kazanımlarını görebilirsiniz.</p>
    <button id="del" style="color:var(--bad)">Ödevi sil</button>`;
  document.getElementById("del").onclick = async () => {
    if (!confirm("Bu ödev silinsin mi? Öğrencilerin gönderdiği sayfalar silinmez.")) return;
    await api(`/api/assignments/${id}`, { method: "DELETE" });
    location.hash = `#/sinif/${a.class_id}`;
  };
}

// ---------- Başlat ----------

if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
render().catch((e) => ($app.innerHTML = `<div class="card">⚠ ${esc(e.message)}</div>`));
