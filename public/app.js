// Ödev Kontrol – arayüz (çerçevesiz, tek dosya).
const $app = document.getElementById("app");
let ME = null; // { user, child, thresholds }

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const VERDICT = {
  correct: "Doğru",
  wrong: "Yanlış",
  blank: "Boş",
  review: "Öğretmen bakacak",
  nokey: "Anahtar yok",
};
const STATE = { yapti: "Yaptı", eksik: "Eksik sayfa", gec: "Geç teslim", yapmadi: "Yapmadı", bos: "Boş sayfa", isleniyor: "İşleniyor" };
const badge = (cls, text) => `<span class="badge b-${esc(cls)}">${esc(text)}</span>`;

const fmtDate = (s) => {
  if (!s) return "";
  const d = new Date(s.length === 10 ? s + "T00:00:00" : s.replace(" ", "T") + "Z");
  return d.toLocaleString(
    "tr-TR",
    s.length === 10 ? { day: "numeric", month: "long" } : { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }
  );
};

function rateBar(rate) {
  const color = rate >= 75 ? "var(--ok)" : rate >= 60 ? "var(--mid)" : "var(--bad)";
  return `<div class="row" style="flex-wrap:nowrap"><div class="bar" style="flex:1"><span style="width:${rate}%;background:${color}"></span></div><b style="width:46px;text-align:right">%${rate}</b></div>`;
}

/** Fotoğrafı telefonda küçültür: yükleme hızlanır. Yazının okunması için 2400 piksel yeterli. */
function compressImage(file, maxSide = 2400, quality = 0.88) {
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

/** Kamera / galeri düğmeleri. onFile(file) seçilince çağrılır. */
function photoButtons(prefix, bigLabel, onFile) {
  setTimeout(() => {
    const cam = document.getElementById(`${prefix}-cam`);
    const gal = document.getElementById(`${prefix}-gal`);
    document.getElementById(`${prefix}-shoot`).onclick = () => cam.click();
    document.getElementById(`${prefix}-pick`).onclick = () => gal.click();
    const h = (e) => {
      const f = e.target.files[0];
      e.target.value = "";
      if (f) onFile(f);
    };
    cam.onchange = h;
    gal.onchange = h;
  });
  return `
    <input type="file" id="${prefix}-cam" accept="image/*" capture="environment" hidden />
    <input type="file" id="${prefix}-gal" accept="image/*" hidden />
    <button class="primary big" id="${prefix}-shoot">📷 ${esc(bigLabel)}</button>
    <button id="${prefix}-pick">🖼 Galeriden seç</button>`;
}

/** Resmin üstüne kutular çizen SVG katmanı. */
function figure(src, W, H, shapes) {
  return `<div class="fig"><img src="${src}" alt="Sayfa" loading="lazy" />
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${shapes}</svg></div>`;
}
const rect = (b, cls, label = "") =>
  `<rect class="${cls}" x="${b.x0}" y="${b.y0}" width="${b.x1 - b.x0}" height="${b.y1 - b.y0}" rx="6" />` +
  (label ? `<text class="${cls}-t" x="${b.x0 + 8}" y="${b.y0 + 34}">${esc(label)}</text>` : "");

// ---------- Yönlendirme ----------

const routes = [];
const route = (re, fn) => routes.push([re, fn]);

async function render() {
  if (!ME) ME = await api("/api/me");
  const u = ME.user;
  document.getElementById("who").innerHTML = u ? `${esc(u.name)} <button class="link" id="logout">Çıkış</button>` : "";
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
      return;
    }
  }
  $app.innerHTML = `<p>Sayfa bulunamadı. <a href="#/">Ana sayfa</a></p>`;
}
window.addEventListener("hashchange", () => {
  render();
  window.scrollTo(0, 0);
});

route(/^\/$/, () => {
  const r = ME.user.role;
  if (r === "teacher") return viewTeacherHome();
  if (r === "student") return viewStudentHome();
  return viewStudentReport(ME.user.child_id);
});
route(/^\/sinif\/(\d+)(?:\/(\w+))?$/, (id, tab) => viewClass(id, tab || "odevler"));
route(/^\/odev\/(\d+)$/, (id) => viewAssignment(id));
route(/^\/sayfa\/(\d+)$/, (id) => viewPageEditor(id));
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
      lf.querySelector("#f").onsubmit = (e) => {
        e.preventDefault();
        login({ code: e.target.code.value });
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
      lf.querySelector("#f").onsubmit = (e) => {
        e.preventDefault();
        login({ username: e.target.username.value, password: e.target.password.value });
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
          ${assignments
            .map(
              (a) =>
                `<option value="${a.id}" ${a === open[0] ? "selected" : ""}>${esc(a.title)}${a.due_date ? ` – son gün ${fmtDate(a.due_date)}` : ""} (${a.my_pages}/${a.page_count} sayfa)</option>`
            )
            .join("")}
          <option value="">Ödev seçmeden (sayfayı kendisi bulsun)</option>
        </select></div>
      ${photoButtons("st", "Sayfanın fotoğrafını çek", (f) => upload(f, document.getElementById("asg").value))}
      <p class="muted small">Sayfayı düz bir yere koyun, gölge düşürmeyin, bütün sayfa kareye sığsın. Cevabınızı şıkkın etrafını daire içine alarak işaretleyin. Her sayfa için ayrı fotoğraf çekin.</p>
    </div>
    <div id="progress"></div>
    <div class="row between"><h2>Gönderdiklerim</h2><a href="#/raporum">Eksik konularım →</a></div>
    <div id="subs">${subsList(subs)}</div>`;
}

function subsList(subs) {
  if (!subs.length) return `<p class="muted">Henüz fotoğraf yok.</p>`;
  return subs
    .map((s) => {
      const st =
        s.status === "processing"
          ? `<span class="spinner"></span>`
          : s.status === "failed"
            ? badge("wrong", "Okunamadı")
            : s.nokey === s.n
              ? badge("nokey", "Anahtar bekleniyor")
              : `<b>${s.correct}</b>/${s.n} doğru`;
      return `<a class="card row between" href="#/gonderim/${s.id}" style="text-decoration:none;color:inherit">
        <span><b>${esc(s.assignment_title || "Ödev seçilmedi")}</b><br><span class="muted small">${esc(s.page_title || "")} · ${fmtDate(s.created_at)}</span></span>
        <span>${st}</span></a>`;
    })
    .join("");
}

async function upload(file, assignmentId) {
  const p = document.getElementById("progress");
  p.innerHTML = `<div class="card row"><span class="spinner"></span> Yükleniyor…</div>`;
  try {
    const image = await compressImage(file);
    const { id } = await api("/api/submissions", { body: { image, assignment_id: assignmentId ? Number(assignmentId) : null } });
    p.innerHTML = `<div class="card row"><span class="spinner"></span> Sayfa okunuyor…</div>`;
    await waitFor(`/api/submissions/${id}`);
    location.hash = `#/gonderim/${id}`;
  } catch (e) {
    p.innerHTML = `<div class="card">⚠ ${esc(e.message)}</div>`;
  }
}

async function waitFor(url) {
  for (let i = 0; i < 120; i++) {
    const s = await api(url);
    if (s.status !== "processing") return s;
    await sleep(1500);
  }
  throw new Error("İşlem uzun sürdü. Biraz sonra listeden bakın.");
}

// ---------- Gönderim sonucu ----------

async function viewSubmission(id) {
  let s = await api(`/api/submissions/${id}`);
  if (s.status === "processing") {
    $app.innerHTML = `<div class="card row"><span class="spinner"></span> Sayfa okunuyor…</div>`;
    s = await waitFor(`/api/submissions/${id}`);
  }
  const teacher = ME.user.role === "teacher";
  const head = `
    <div class="row between"><h1>${esc(s.student_name)}</h1><span class="muted small">${fmtDate(s.created_at)}</span></div>
    ${s.page ? `<p class="muted" style="margin-top:-8px">${esc(s.page.title)}</p>` : ""}
    ${s.duplicate_of ? `<div class="card">${badge("wrong", "Uyarı")} Bu fotoğrafın aynısını başka bir öğrenci de yüklemiş.</div>` : ""}
    ${s.status === "done" && !s.has_handwriting ? `<div class="card">${badge("bos", "Boş")} Sayfada öğrenci yazısı bulunamadı; ödev yapılmamış görünüyor.</div>` : ""}`;

  if (s.status === "failed") {
    $app.innerHTML =
      head +
      `<div class="card">⚠ ${esc(s.error || "Fotoğraf işlenemedi.")}</div>
       <details class="card"><summary>Gönderilen fotoğraf</summary><img class="thumb" src="${s.image_url}" alt="" style="margin-top:8px"></details>`;
    return;
  }

  const c = s.counts;
  // Sayfa üstünde: işaretlenen şık yeşil (doğru) / kırmızı (yanlış), doğru şık kesikli yeşil.
  const shapes = s.answers
    .map((a) => {
      let out = a.region ? `<text class="qn" x="${a.region.x0 + 8}" y="${a.region.y0 + 30}">${a.number}</text>` : "";
      for (const o of a.options) {
        if (a.marked === o.letter) out += rect(o.box, a.verdict === "correct" ? "m-ok" : a.verdict === "wrong" ? "m-bad" : "m-mid");
        else if (a.key === o.letter && a.verdict === "wrong") out += rect(o.box, "m-key");
        else if (a.state === "multi" && a.option_ratios[o.letter] >= ME.thresholds.markMultiMin) out += rect(o.box, "m-mid");
      }
      return out;
    })
    .join("");

  $app.innerHTML =
    head +
    `<div class="stats">
      <div class="stat"><b>${c.correct}</b>Doğru</div>
      <div class="stat"><b>${c.wrong}</b>Yanlış</div>
      <div class="stat"><b>${c.blank}</b>Boş</div>
      ${c.review ? `<div class="stat"><b>${c.review}</b>Kontrol</div>` : ""}
      ${c.nokey ? `<div class="stat"><b>${c.nokey}</b>Anahtar yok</div>` : ""}
    </div>
    ${s.overlay_url ? figure(s.overlay_url, s.page.width, s.page.height, shapes) : ""}
    <p class="muted small">Mavi: öğrencinin el yazısı (basılı yazıdan ayrıldı). Yeşil kutu: doğru işaret, kırmızı: yanlış işaret, kesikli yeşil: doğru şık.</p>
    <div class="card table-wrap"><table>
      <tr><th>Soru</th><th>İşaret</th><th>Doğru</th><th>Sonuç</th><th>İşlem</th></tr>
      ${s.answers
        .map(
          (a) => `<tr>
          <td><b>${a.number}</b>${a.topic ? `<br><span class="muted small">${esc(a.topic)}</span>` : ""}</td>
          <td>${a.marked ? `<b>${a.marked}</b> <span class="muted small">%${Math.round(a.share * 100)}</span>` : a.state === "multi" ? "Birden fazla" : "–"}</td>
          <td>${a.key ? `<b>${a.key}</b>${a.key_source === "crowd" ? ` <span class="muted small" title="Öğrenci çoğunluğu">(ç)</span>` : ""}` : "?"}</td>
          <td>${badge(a.verdict, VERDICT[a.verdict])}${a.teacher_override ? `<br><span class="muted small">öğretmen</span>` : ""}
            ${
              teacher
                ? `<br><select data-ov="${a.id}" class="small" style="width:auto;padding:4px;margin-top:4px">
                  <option value="">Otomatik</option>
                  ${["correct", "wrong", "blank"].map((x) => `<option value="${x}" ${a.teacher_override === x ? "selected" : ""}>${VERDICT[x]}</option>`).join("")}
                </select>`
                : ""
            }</td>
          <td>${a.has_work ? "✓ var" : `<span class="muted">yok</span>`}</td>
        </tr>`
        )
        .join("")}
    </table></div>
    <p class="muted small">"İşaret" yanındaki yüzde: işaretin o şıkta yoğunlaşma oranı (işaret benzerliği). (ç): anahtar öğretmen yerine öğrenci çoğunluğundan geldi.
    "İşlem yok" ama doğru olan sorular, çözülmeden işaretlenmiş olabilir.</p>
    <details class="card"><summary>Gönderilen fotoğraf</summary><img class="thumb" src="${s.image_url}" alt="" loading="lazy" style="margin-top:8px"></details>`;

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

// ---------- Rapor (öğrenci / veli / öğretmen) ----------

async function viewStudentReport(studentId) {
  const [r, subs] = await Promise.all([api(`/api/students/${studentId}/report`), api(`/api/submissions?student_id=${studentId}`)]);
  const t = r.totals;
  const weak = r.outcomes.filter((o) => o.weak);
  const today = new Date().toISOString().slice(0, 10);
  $app.innerHTML = `
    <h1>${esc(r.student.name)}</h1>
    <div class="stats">
      <div class="stat"><b>${t.pages}</b>Sayfa</div>
      <div class="stat"><b>${t.correct}</b>Doğru</div>
      <div class="stat"><b>${t.wrong}</b>Yanlış</div>
      <div class="stat"><b>${t.blank}</b>Boş</div>
      <div class="stat"><b>${t.nowork}</b>İşlemsiz doğru</div>
    </div>

    <h2>Eksik olduğu kazanımlar</h2>
    ${
      weak.length
        ? weak.map(outcomeCard).join("")
        : `<p class="muted">${
            !r.outcomes.length
              ? "Henüz yeterli veri yok."
              : r.outcomes.some((o) => o.rate < ME.thresholds.weakOutcomeRate * 100)
                ? `Bazı konularda başarı düşük, ama karar için her konuda en az ${ME.thresholds.weakOutcomeMinAttempts} soru gerekiyor. Aşağıdaki tabloya bakın.`
                : "Eksik kazanım görünmüyor. 👏"
          }</p>`
    }

    ${
      r.assignments.length
        ? `<h2>Ödevler</h2><div class="card table-wrap"><table><tr><th>Ödev</th><th>Son gün</th><th>Durum</th></tr>
      ${r.assignments
        .map((a) => {
          const done = a.pages > 0;
          const st = done ? (a.page_count && a.pages < a.page_count ? "eksik" : "yapti") : a.due_date && a.due_date < today ? "yapmadi" : "isleniyor";
          const label = done ? `${a.pages}/${a.page_count} sayfa` : st === "yapmadi" ? "Yapmadı" : "Bekleniyor";
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
    ${o.outcome_text ? `<p class="small" style="margin:4px 0">${esc(o.outcome_text)}</p>` : ""}
    <p class="small muted" style="margin:0">${o.attempts} soru: ${o.correct} doğru, ${o.wrong} yanlış, ${o.blank} boş</p>
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
  const tabs = { odevler: "Ödevler", ogrenciler: "Öğrenciler", kazanimlar: "Kazanımlar" };
  $app.innerHTML = `
    <a href="#/" class="small">← Sınıflar</a>
    <h1>${esc(c.name)}</h1>
    <div class="tabs">${Object.entries(tabs).map(([k, v]) => `<button class="${k === tab ? "on" : ""}" onclick="location.hash='#/sinif/${id}/${k}'">${v}</button>`).join("")}</div>
    <div id="tab"></div>`;
  const el = document.getElementById("tab");
  if (tab === "ogrenciler") return tabStudents(c, el);
  if (tab === "kazanimlar") return tabOutcomes(c, el);
  return tabAssignments(c, el);
}

async function tabAssignments(c, el) {
  const list = await api(`/api/classes/${c.id}/assignments`);
  el.innerHTML = `
    ${list
      .map(
        (a) => `<a class="card row between" href="#/odev/${a.id}" style="text-decoration:none;color:inherit">
        <span><b>${esc(a.title)}</b><br><span class="muted small">${a.page_count} sayfa · ${a.due_date ? "Son gün " + fmtDate(a.due_date) : "Süresiz"}</span></span>
        <span><b>${a.submitted}</b>/${a.total} yaptı →</span></a>`
      )
      .join("") || `<p class="muted">Henüz ödev verilmedi.</p>`}
    <form class="card stack" id="na">
      <h3>Yeni ödev</h3>
      <div><label>Başlık</label><input name="title" placeholder="ör. Üslü İfadeler – Test 3" required /></div>
      <div class="row" style="flex-wrap:nowrap">
        <div style="flex:1"><label>Ders</label><input name="subject" placeholder="Matematik" /></div>
        <div style="flex:1"><label>Son gün</label><input name="due_date" type="date" /></div>
      </div>
      <button class="primary">Ödev oluştur ve sayfa ekle →</button>
    </form>`;
  el.querySelector("#na").onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target;
    try {
      const a = await api(`/api/classes/${c.id}/assignments`, {
        body: { title: f.title.value, subject: f.subject.value, due_date: f.due_date.value || null },
      });
      location.hash = `#/odev/${a.id}`;
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
      <p class="muted small">Her öğrenciye ve velisine ayrı 6 haneli giriş kodu üretilir.</p>
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
  if (!list.length) return (el.innerHTML = `<p class="muted">Henüz kontrol edilmiş ödev yok. Konu ve kazanımları sayfa ekranından girebilirsiniz.</p>`);
  el.innerHTML = `
    <p class="muted small">Başarı %${Math.round(ME.thresholds.weakOutcomeRate * 100)}'in altındaysa (en az ${ME.thresholds.weakOutcomeMinAttempts} soru) kazanım "eksik" sayılır.</p>
    <div class="card table-wrap"><table>
      <tr><th>Konu / kazanım</th><th>Soru</th><th>Eksik öğrenci</th><th style="min-width:130px">Sınıf başarısı</th></tr>
      ${list
        .map(
          (o) => `<tr><td><b>${esc(o.topic || o.key)}</b><br><span class="muted small">${esc(o.subject || "")}${o.outcome_code ? " · " + esc(o.outcome_code) : ""}</span>${o.outcome_text ? `<br><span class="small">${esc(o.outcome_text)}</span>` : ""}</td>
          <td>${o.attempts}</td><td>${o.weakStudents}</td><td>${rateBar(o.rate)}</td></tr>`
        )
        .join("")}
    </table></div>`;
}

async function viewAssignment(id) {
  const [a, st] = await Promise.all([api(`/api/assignments/${id}`), api(`/api/assignments/${id}/status`)]);
  const count = (s) => st.students.filter((x) => x.state === s).length;
  const processing = a.pages.some((p) => p.status === "processing");
  $app.innerHTML = `
    <a href="#/sinif/${a.class_id}" class="small">← Ödevler</a>
    <h1>${esc(a.title)}</h1>
    <p class="muted" style="margin-top:-8px">${a.subject ? esc(a.subject) + " · " : ""}${a.due_date ? "Son gün " + fmtDate(a.due_date) : "Süresiz"}</p>

    <h2>Sayfalar</h2>
    ${a.pages
      .map((p) => {
        const info =
          p.status === "processing"
            ? `<span class="spinner"></span> Okunuyor…`
            : p.status === "failed"
              ? badge("wrong", "Okunamadı")
              : `${p.question_count} soru · ${p.teacher_keys} anahtar${p.crowd_keys ? ` · ${p.crowd_keys} öğrenci çoğunluğu` : ""}`;
        const missing = p.status === "ready" && p.teacher_keys + p.crowd_keys < p.question_count;
        return `<div class="card">
          <div class="row between"><b>${esc(p.title || "Sayfa")}</b><span class="small">${info}</span></div>
          ${p.error ? `<p class="small" style="color:var(--bad)">${esc(p.error)}</p>` : ""}
          ${missing ? `<p class="small" style="color:var(--mid)">Bazı soruların anahtarı yok. Girin ya da öğrenci çoğunluğunu bekleyin.</p>` : ""}
          <div class="row">
            ${p.status === "ready" ? `<a class="btn primary" href="#/sayfa/${p.id}">Anahtar ve konuları gir</a>` : ""}
            <button data-unlink="${p.id}">Çıkar</button>
          </div></div>`;
      })
      .join("") || `<p class="muted">Henüz sayfa yok. Öğrencilerin çözeceği sayfaların <b>boş</b> hâlinin fotoğrafını çekin.</p>`}
    <div class="card stack">
      ${photoButtons("pg", "Boş sayfa fotoğrafı çek", addPage)}
      <p class="muted small">Sayfa boş (işaretsiz) olmalı. Düz koyun, bütün sayfa görünsün. Program soruları ve şıkları kendisi bulur. Bu sayfa daha önce başka bir öğretmen tarafından eklendiyse hazır anahtarı kullanılır.</p>
      <div id="pgp"></div>
    </div>

    <h2>Kim yaptı?</h2>
    <div class="stats">
      <div class="stat"><b>${count("yapti")}</b>Yaptı</div>
      <div class="stat"><b>${count("eksik") + count("gec")}</b>Eksik / geç</div>
      <div class="stat"><b>${count("bos")}</b>Boş sayfa</div>
      <div class="stat"><b>${count("yapmadi")}</b>Yapmadı</div>
    </div>
    <div class="card table-wrap"><table>
      <tr><th>Öğrenci</th><th>Durum</th><th>Sayfa</th><th>D / Y / B</th><th>İşlemsiz doğru</th></tr>
      ${st.students
        .map(
          (s) => `<tr><td><a href="#/ogrenci/${s.student_id}">${esc(s.name)}</a>${s.duplicate ? ` ${badge("wrong", "Kopya foto")}` : ""}${s.review ? ` ${badge("review", s.review + " kontrol")}` : ""}</td>
          <td>${badge(s.state, STATE[s.state])}</td><td>${s.pages}/${st.page_count}</td>
          <td>${s.n ? `${s.correct} / ${s.wrong} / ${s.blank}` : "–"}</td><td>${s.nowork || "–"}</td></tr>`
        )
        .join("")}
    </table></div>
    <p class="muted small">D: doğru, Y: yanlış, B: boş. "İşlemsiz doğru": doğru şık işaretlenmiş ama soru alanında işlem yok (tahmin ya da kopya olabilir).</p>
    <button id="del" style="color:var(--bad)">Ödevi sil</button>`;

  $app.querySelectorAll("[data-unlink]").forEach((b) => {
    b.onclick = async () => {
      if (!confirm("Bu sayfa ödevden çıkarılsın mı?")) return;
      await api(`/api/assignments/${id}/pages/${b.dataset.unlink}`, { method: "DELETE" });
      viewAssignment(id);
    };
  });
  document.getElementById("del").onclick = async () => {
    if (!confirm("Bu ödev silinsin mi?")) return;
    await api(`/api/assignments/${id}`, { method: "DELETE" });
    location.hash = `#/sinif/${a.class_id}`;
  };

  async function addPage(file) {
    const p = document.getElementById("pgp");
    p.innerHTML = `<p class="row small"><span class="spinner"></span> Yükleniyor…</p>`;
    try {
      const image = await compressImage(file, 3000, 0.9);
      await api(`/api/assignments/${id}/pages`, { body: { image } });
      viewAssignment(id);
    } catch (e) {
      p.innerHTML = `<p class="small">⚠ ${esc(e.message)}</p>`;
    }
  }

  if (processing) {
    await sleep(2000);
    if (location.hash === `#/odev/${id}`) viewAssignment(id);
  }
}

async function viewPageEditor(id) {
  const p = await api(`/api/pages/${id}`);
  const shapes = p.questions
    .map(
      (q) =>
        rect(q.region, "q-reg", String(q.number)) +
        q.options.map((o) => rect(o.box, (q.key_letter || q.crowd_key) === o.letter ? "m-ok" : "opt")).join("")
    )
    .join("");
  $app.innerHTML = `
    <a href="javascript:history.back()" class="small">← Geri</a>
    <h1>Sayfa</h1>
    <div class="card stack">
      <div><label>Sayfa adı (yayın, kitap, sayfa)</label><input id="ptitle" value="${esc(p.title)}" /></div>
      <div><label>Ders</label><input id="psubj" value="${esc(p.subject || "")}" /></div>
      <div><label>Cevap anahtarı (hızlı giriş): "1C 2A 3D…" ya da sırayla "CAD…"</label>
        <input id="pkeys" autocapitalize="characters" placeholder="${esc(p.questions.map((q) => q.number + (q.key_letter || "?")).join(" "))}" /></div>
      <details><summary class="small">Bütün sorulara aynı konu / kazanım</summary>
        <div class="stack" style="margin-top:8px">
          <input id="ptopic" placeholder="Konu, ör. Üslü İfadeler" />
          <input id="pcode" placeholder="Kazanım kodu, ör. M.8.1.2.1" />
          <input id="ptext" placeholder="Kazanım açıklaması" />
          <p class="muted small">Yalnızca konusu boş olan sorulara yazılır.</p>
        </div></details>
      <button class="primary" id="psave">Kaydet</button>
    </div>
    ${(() => {
      const nums = p.questions.map((q) => q.number);
      const max = Math.max(0, ...nums);
      const missing = Array.from({ length: max }, (_, i) => i + 1).filter((n) => !nums.includes(n));
      return missing.length
        ? `<div class="card" style="border-color:var(--bad)">⚠ <b>${missing.join(", ")}. soru bulunamadı.</b> Bu soru(lar) kontrol edilemez. Sayfayı daha düz, yakın ve gölgesiz çekip yeniden ekleyin.</div>`
        : "";
    })()}
    <p class="muted small">Program ${p.questions.length} soru buldu. Turuncu: soru alanı, gri: şık kutusu, yeşil: doğru şık. Bir soru eksik ya da kutular yanlışsa sayfayı daha düz ve net çekip yeniden ekleyin.</p>
    ${figure(`/api/pages/${p.id}/image`, p.width, p.height, shapes)}
    <h2>Sorular</h2>
    ${p.questions
      .map(
        (q) => `<div class="card stack" data-q="${q.id}">
        <div class="row between"><b>Soru ${q.number}</b>
          <span class="muted small">${Object.keys(q.votes).length ? "Öğrenciler: " + Object.entries(q.votes).map(([k, v]) => `${k} ${v}`).join(", ") : ""}</span></div>
        <div class="row keys">${q.options
          .map((o) => `<button type="button" data-k="${o.letter}" class="${q.key_letter === o.letter ? "primary" : ""}">${o.letter}</button>`)
          .join("")}
          ${q.key_letter ? `<button type="button" data-k="" class="link small">Temizle</button>` : q.crowd_key ? `<span class="small muted">Öğrenci çoğunluğu: <b>${q.crowd_key}</b> (onaylamak için dokunun)</span>` : `<span class="small muted">Anahtar yok</span>`}
        </div>
        <div class="row" style="flex-wrap:nowrap">
          <input name="topic" placeholder="Konu" value="${esc(q.topic || "")}" style="flex:2" />
          <input name="outcome_code" placeholder="Kazanım kodu" value="${esc(q.outcome_code || "")}" style="flex:1" />
        </div>
        <input name="outcome_text" placeholder="Kazanım açıklaması" value="${esc(q.outcome_text || "")}" />
      </div>`
      )
      .join("")}`;

  document.getElementById("psave").onclick = async () => {
    try {
      await api(`/api/pages/${id}`, {
        method: "PUT",
        body: {
          title: document.getElementById("ptitle").value,
          subject: document.getElementById("psubj").value,
          keys: document.getElementById("pkeys").value,
          topic: document.getElementById("ptopic").value,
          outcome_code: document.getElementById("pcode").value,
          outcome_text: document.getElementById("ptext").value,
        },
      });
      toast("Kaydedildi.");
      viewPageEditor(id);
    } catch (e) {
      toast(e.message);
    }
  };
  $app.querySelectorAll("[data-q]").forEach((card) => {
    const qid = card.dataset.q;
    const save = async (body, reload) => {
      try {
        await api(`/api/questions/${qid}`, { method: "PUT", body });
        toast("Kaydedildi.");
        if (reload) viewPageEditor(id);
      } catch (e) {
        toast(e.message);
      }
    };
    card.querySelectorAll("[data-k]").forEach((b) => (b.onclick = () => save({ key_letter: b.dataset.k }, true)));
    card.querySelectorAll("input").forEach((inp) => (inp.onchange = () => save({ [inp.name]: inp.value })));
  });
}

// ---------- Başlat ----------

if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
render().catch((e) => ($app.innerHTML = `<div class="card">⚠ ${esc(e.message)}</div>`));
