// Konu anlatımı videoları · ortak motor. Seslendirmeye eşlenir:
// her bölümün (giriş, okuma, adım, kapanış) süresi SYNC.segs'ten gelir; fosfor, animasyon ve kalem o bölümün içinde ilerler.
(async () => {
const {meta: M, P} = window.KONU;
if (M.tema === 'koyu') document.body.classList.add('koyu');
const SEG = (window.SYNC && window.SYNC.segs) || {};
const segDur = (id, fb) => SEG[id] != null ? SEG[id] : fb;
const WORDS = (window.SYNC && window.SYNC.words) || {};
// bölüm içinde bir kelimenin söylendiği an (bölüm başına göre); bulunamazsa null
const wordAt = (sid, key) => { const L = WORDS[sid]; if (!L || !key) return null; const k = normW(key);
  const w = L.find(x => normW(x[0]).startsWith(k)); return w ? w[1] : null; };
// okuma bölümünde metnin f kesri (0-1) söylenince geçen süre: kelimelerin harf sayısına göre
function fracTime(sid, f, dur) { const L = WORDS[sid]; if (!L) return f * dur;
  const c = L.map(x => normW(x[0]).length), C = c.reduce((a, b) => a + b, 0); let acc = 0;
  for (let i = 0; i < L.length; i++) { const n = acc + c[i]; if (n / C >= f - 1e-9) { const k = c[i] ? (f * C - acc) / c[i] : 1; return lerp(L[i][1], L[i][2], cl(k)); } acc = n; }
  return dur; }

// ---------- kapak ----------
$('cover').innerHTML = `<div class="cv-1dk"><span>⏱</span>1 DAKİKADA FİZİK</div>
  <div class="cv-top">${M.sinif}. SINIF FİZİK</div>
  ${M.kanca ? `<div class="cv-hook">${M.kanca.replace(/([A-ZÇĞİÖŞÜ]{3,})/g, '<em>$1</em>')}</div>` : ''}
  <div class="cv-logo${M.kanca ? ' sm' : ''}"><div class="cv-img"></div></div>
  <div class="cv-k">KONU ANLATIMI</div>
  <div class="cv-t">${M.baslik}</div>
  <div class="cv-s">${M.kapakAlt}</div>
  <div class="cv-code">${M.kazanim} · 2026-2027</div>
  <div class="cv-bot">Şafak Hoca · Fizik</div>`;
$('bend').innerHTML = `<b>KONU BİTTİ</b><span>Sıradaki: ${M.sonraki}</span>`;

// ---------- sayfalar ----------
const GAP = 560, pagesEl = $('pages');
P.forEach((p, i) => {
  const d = document.createElement('div'); d.className = 'pg'; d.style.left = (i * GAP) + 'px';
  d.innerHTML = `<div class="hd"><div class="t1">${M.sinif}. SINIF FİZİK · KONU ANLATIMI</div><div class="t2">${M.baslik.toLocaleUpperCase('tr')} · ${M.kazanim} · ŞAFAK HOCA</div>
    <div class="un"><span class="uname">${M.unite}</span><span class="ucnt">${i + 1} / ${P.length}</span></div></div><div class="slot"></div>
    <div class="q"><b class="n">ADIM ${i + 1} <i>${p.konu.toLocaleUpperCase('tr')}</i></b>${p.html}</div>`;
  pagesEl.appendChild(d); p.el = d.querySelector('.q'); if (p.init) p.init();
});
$('bands').innerHTML = P.map((p, i) => `<div class="band" id="bq${i}"><b>ADIM ${i + 1} / ${P.length}</b><span>${p.konu}</span></div>`).join('');
await document.fonts.ready;

// ---------- ölçüm ----------
$('cam').style.transform = 'none';
const hls = P.map(p => {
  const blk = p.el, qt = blk.querySelector('.qt'), B = blk.getBoundingClientRect(), words = [];
  const walk = n => { for (const c of [...n.childNodes]) {
    if (c.nodeType === 3) { const frag = document.createDocumentFragment();
      for (const w of c.textContent.split(/(\s+)/)) { if (!w) continue; if (/^\s+$/.test(w)) frag.appendChild(document.createTextNode(w)); else { const sp = document.createElement('span'); sp.textContent = w; words.push(sp); frag.appendChild(sp); } }
      c.replaceWith(frag); }
    else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c); } };
  walk(qt);
  const lines = [];
  for (const sp of words) { const r = sp.getBoundingClientRect(); const L = lines.find(l => Math.abs(l.top - r.top) < 8);
    if (L) { L.left = Math.min(L.left, r.left); L.right = Math.max(L.right, r.right); L.height = Math.max(L.height, r.height); }
    else lines.push({top: r.top, left: r.left, right: r.right, height: r.height}); }
  return lines.map(l => { const d = document.createElement('div'); d.className = 'hl';
    Object.assign(d.style, {left: (l.left - B.left - 3) + 'px', top: (l.top - B.top + l.height * 0.14) + 'px', width: (l.right - l.left + 6) + 'px', height: (l.height * 0.78) + 'px'});
    blk.insertBefore(d, blk.firstChild); return {el: d, w: l.right - l.left}; });
});

// ---------- zaman çizelgesi (sese göre) ----------
const ZS = 2.15, TOPY = 250;
const CAMS = P.map((_, i) => ({s: ZS, x: 40 - i * GAP * ZS, y: TOPY}));
const moves = [], fades = [], items = [], fpulses = [], follows = [], HL = [], ANIMS = [], SEGT = {};
let t = 0;
const move = (A, B, d, dip = 0) => { moves.push([t, t + d, A, B, dip]); t += d; };
const fadeEl = (el, a, b, c = 1e9, d = 1e9) => { const f = [el, a, b, c, d]; fades.push(f); return f; };

// giriş: kapak + selamlama
SEGT.intro = 0.6; const introEnd = 0.6 + segDur('intro', 4.5);
const HK = window.KONU.hook;
// giriş animasyonu: soru + hikâye animasyonu; "Ben Şafak Hoca" denince kısa kapak + Takip Et
const wIntro = key => { const v = wordAt('intro', key); return v == null ? null : SEGT.intro + v; };
const benT = HK ? (wIntro('Ben') ?? introEnd - 2.5) : null;
let HKW = [];
if (HK) {
  const words = HK.soru.split(/\s+/), spoken = WORDS.intro || []; let j = 0;
  $('hook').innerHTML = `<div class="hk-top"><span>⏱</span>1 DAKİKADA FİZİK · ${M.sinif}. SINIF</div><div class="hk-q">${words.map((w, i) =>
    `<span class="hkw${/[A-ZÇĞİÖŞÜ]{3,}/.test(w) ? ' vrg' : ''}" id="hkw${i}">${w}</span>`).join(' ')}</div><div class="hk-sc">${HK.html}</div>`;
  words.forEach((w, i) => { const k = normW(w); while (j < spoken.length && !normW(spoken[j][0]).startsWith(k.slice(0, 3))) j++;
    HKW.push(j < spoken.length ? SEGT.intro + spoken[j][1] : 0.6 + i * 0.3); if (j < spoken.length) j++; });
  fadeEl($('hook'), -1, 0, benT - 0.05, benT + 0.3);
  fadeEl($('cover'), benT - 0.15, benT + 0.2, introEnd + 0.2, introEnd + 0.8);
  follows.push(benT + 0.35);                                      // takip kartı: kapakla birlikte, gelip gider
} else {
  fadeEl($('cover'), -1, 0, introEnd + 0.2, introEnd + 0.8);
}
t = introEnd + 0.5;
fadeEl($('flogo'), t, t + 0.5);
let band = fadeEl($('bq0'), t, t + 0.5);
t += 0.6;
if (!HK) follows.push(t);                                         // takip kartı: başta (okuma sırasında, notlar boşken)
const MID = Math.floor(P.length / 2) - 1;
P.forEach((p, i) => {
  // tanımı oku: fosfor, konuşmayla aynı hızda satır satır
  const rid = `p${i}r`, rd = segDur(rid, 6);
  SEGT[rid] = t; const tw = hls[i].reduce((a, h) => a + h.w, 0); let acc = 0, prev = t + fracTime(rid, 0, rd);
  for (const h of hls[i]) { acc += h.w; const e = t + fracTime(rid, acc / tw, rd); HL.push({el: h.el, a: prev, b: e}); prev = e; }
  t += rd + 0.35;
  const els = [...p.el.querySelectorAll('[data-o]')];
  p.steps.forEach((sp, k) => {
    const sid = `p${i}s${k}`, sd = segDur(sid, 3); SEGT[sid] = t;
    const aw = wordAt(sid, sp.aw) || 0;                              // animasyon belirli bir kelimeyle başlayabilir
    const ad = Math.min(sp.d, Math.max(0.6, sd - aw));               // animasyon konuşmanın içine sığar
    ANIMS.push({a: t + aw, d: ad, f: sp.f, sc: sp.d / ad});
    const its = els.filter(e => sp.o.includes(+e.dataset.o)).sort((a, b) => a.dataset.o - b.dataset.o).map(el => {
      if (el.tagName === 'line') return {el, kind: 'line', nat: Math.max(0.45, Math.hypot(el.x2.baseVal.value - el.x1.baseVal.value, el.y2.baseVal.value - el.y1.baseVal.value) / 150)};
      return {el, kind: 'h', nat: Math.max(0.5, el.textContent.trim().length * 0.045)};
    });
    const nat = its.reduce((a, it) => a + it.nat + 0.18, 0);
    const ws = t + (sp.wAt != null ? sp.wAt : Math.min(ad * 0.7, sd * 0.35));
    const sc = its.length ? Math.max(0.85, Math.min(1.6, (t + sd + 0.2 - ws) / nat)) : 1;  // kalem konuşmayla birlikte biter
    let w = ws;
    for (const it of its) {
      const kw = wordAt(sid, it.el.dataset && it.el.dataset.w);       // kalem, o kelime söylenince başlar
      let d = it.nat * sc; if (kw != null) { w = Math.max(w, t + kw); d = it.nat; }
      items.push({el: it.el, kind: it.kind, a: w, b: w + d}); w += d + 0.18 * sc;
      const ck = it.el.querySelector && it.el.querySelector('.ck'); if (ck) items.push({el: ck, kind: 'ck', a: w - 0.25, b: w + 0.1});
    }
    t = Math.max(t + sd, w, t + aw + ad) + 0.3;
  });
  t += 0.4;
  if (i === MID && P.length > 1) { follows.push(t); t += 3.0; }    // takip kartı: ortada
  band[3] = t; band[4] = t + 0.4;
  if (i < P.length - 1) {
    fpulses.push([t + 0.2, t + 1.4]);
    move(CAMS[i], CAMS[i + 1], 1.4, 0.35);
    band = fadeEl($('bq' + (i + 1)), t - 0.5, t);
    t += 0.3;
  }
});
// kapanış
fadeEl($('bend'), t, t + 0.5);
fpulses.push([t + 0.2, t + 1.4]);
SEGT.outro = t + 0.4;
follows.push(t + 0.6);                                            // takip kartı: sonda
t = Math.max(t + 0.4 + segDur('outro', 6), t + 3.8);
const DUR = t + 0.9;

// ---------- kalem ----------
for (const it of items) {
  if (it.kind === 'line') { const S = it.el.ownerSVGElement.getBoundingClientRect(), b = v => v.baseVal.value;
    it.p0 = {x: S.left + b(it.el.x1), y: S.top + b(it.el.y1)}; it.p1 = {x: S.left + b(it.el.x2), y: S.top + b(it.el.y2)}; }
  else { const r = it.el.getBoundingClientRect(); it.r = {x: r.left, y: r.top, w: r.width, h: r.height}; it.chars = it.kind === 'h' ? it.el.textContent.trim().length : 4; }
}
function penPoint(it, k) {
  if (it.kind === 'line') return {x: lerp(it.p0.x, it.p1.x, k), y: lerp(it.p0.y, it.p1.y, k)};
  const r = it.r;
  if (it.kind === 'h') return {x: r.x + Math.max(0, r.w - 14) * k, y: r.y + r.h * 0.72 + 2.2 * Math.sin(k * it.chars * Math.PI * 1.3)};
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  return k < .35 ? {x: cx - 9 + 8 * k / .35, y: cy - 2 + 8 * k / .35} : {x: cx - 1 + 16 * (k - .35) / .65, y: cy + 6 - 22 * (k - .35) / .65};
}
const groups = [];
for (const it of items) { const g = groups[groups.length - 1]; if (g && it.a - g[g.length - 1].b < 0.8) g.push(it); else groups.push([it]); }
function penAt(time) {
  for (const g of groups) {
    const a = g[0].a, b = g[g.length - 1].b;
    if (time < a - 0.4 || time > b + 0.45) continue;
    if (time < a) { const k = prog(time, a - 0.4, a); return {...penPoint(g[0], 0), o: k, lift: (1 - k) * 40}; }
    if (time > b) { const k = prog(time, b, b + 0.45); return {...penPoint(g[g.length - 1], 1), o: 1 - k, lift: k * 40}; }
    for (let j = 0; j < g.length; j++) {
      const it = g[j]; if (time >= it.a && time <= it.b) return {...penPoint(it, prog(time, it.a, it.b)), o: 1, lift: 0};
      const nx = g[j + 1];
      if (nx && time > it.b && time < nx.a) { const k = ease(prog(time, it.b, nx.a)), p0 = penPoint(it, 1), p1 = penPoint(nx, 0);
        return {x: lerp(p0.x, p1.x, k), y: lerp(p0.y, p1.y, k), o: 1, lift: Math.sin(Math.PI * k) * 14}; }
    }
  }
  return null;
}

// ---------- çizim ----------
function camAt(time) {
  let c = CAMS[0];
  for (const [a, b, A, B, dip] of moves) {
    if (time < a) break;
    if (time >= b) { c = B; continue; }
    const k = ease(prog(time, a, b)), s = A.s - dip * Math.sin(Math.PI * k);
    const cx = lerp((540 - A.x) / A.s, (540 - B.x) / B.s, k), cy = lerp((960 - A.y) / A.s, (960 - B.y) / B.s, k);
    c = {s, x: 540 - cx * s, y: 960 - cy * s};
  }
  return c;
}
const beat = k => Math.sin(Math.PI * cl(k));
const pulseAt = (L, time) => { let p = 0; for (const [a, b] of L) if (time >= a && time <= b) p = prog(time, a, b); return p; };
function applyPulse(img, rings, p) {
  img.style.transform = `scale(${1 + 0.22 * beat(p / 0.5) + 0.12 * beat((p - 0.5) / 0.5)})`;
  img.style.boxShadow = p > 0 && p < 1 ? `0 0 ${30 * beat(p)}px ${10 * beat(p)}px rgba(245,163,0,.75)` : '0 8px 24px rgba(0,0,0,.4)';
  rings.forEach(([id, d]) => { const k = cl((p - d) / 0.65); $(id).style.opacity = k > 0 && k < 1 ? (1 - k) * 0.8 : 0; $(id).style.transform = `scale(${1 + 1.4 * k})`; });
}
function render(time) {
  const c = camAt(time), moving = moves.some(([a, b]) => time > a && time < b);
  $('cam').style.transform = `translate(${c.x}px,${c.y}px) scale(${c.s})`;
  $('fade').style.opacity = (window.NOFADE ? 0 : 1 - prog(time, 0, 0.5)) + prog(time, DUR - 0.8, DUR);
  const seen = new Map();
  for (const [el, a, b, cc, d] of fades) seen.set(el, Math.max(seen.get(el) || 0, prog(time, a, b) * (1 - prog(time, cc, d))));
  for (const [el, v] of seen) { el.style.opacity = v;
    el.style.transform = el.id === 'flogo' ? `scale(${0.6 + 0.4 * ease(v)})` : el.id === 'cover' ? `scale(${1 + 0.04 * (1 - v)})` : `translateY(${(1 - ease(v)) * -30}px)`; }
  if (moving) $('flogo').style.opacity = 0;
  if (HK && time < benT + 0.4) { HKW.forEach((a, i) => { const k = prog(time, a - 0.05, a + 0.2); const e = $('hkw' + i);
      e.style.opacity = k; e.style.transform = `translateY(${(1 - ease(k)) * 24}px) scale(${0.9 + 0.1 * ease(k)})`; });
    HK.f(time, wIntro); }
  for (const h of HL) h.el.style.transform = `scaleX(${prog(time, h.a, h.b)})`;
  for (const an of ANIMS) an.f(Math.max(0, Math.min(an.d, time - an.a)) * an.sc);
  for (const it of items) {
    const k = prog(time, it.a, it.b);
    if (it.kind === 'h') it.el.style.clipPath = `inset(-12px ${100 - 100 * k}% -12px -6px)`;
    else if (it.kind === 'line') it.el.setAttribute('stroke-dashoffset', 100 * (1 - k));
    else { const sc = k < .6 ? k / .6 * 1.4 : 1.4 - (k - .6) / .4 * .4; it.el.style.transform = `scale(${k ? sc : 0}) rotate(${(1 - k) * -20}deg)`; }
  }
  for (const p of P) if (p.late) p.late(time);
  const pp = penAt(time), pen = $('pen');
  if (pp) { const sx = c.x + pp.x * c.s, sy = c.y + (pp.y - pp.lift * 0.4) * c.s; pen.style.opacity = pp.o; pen.style.left = (sx - 61) + 'px'; pen.style.top = (sy - 54) + 'px'; pen.style.transform = 'rotate(165deg)'; }
  else pen.style.opacity = 0;
  applyPulse($('fimg'), [['fr1', 0], ['fr2', 0.35]], pulseAt(fpulses, time));
  let ft = -1; for (const a of follows) if (time >= a && time <= a + 3.0) ft = time - a;
  const fo = ft >= 0 ? prog(ft, 0, 0.45) * (1 - prog(ft, 2.6, 3.0)) : 0, card = $('follow');
  card.style.opacity = fo; card.style.transform = `translateY(${(1 - ease(fo)) * 120}px) scale(${0.92 + 0.08 * ease(fo)})`;
  const tap = prog(ft, 1.0, 1.5);
  $('tap').style.opacity = ft >= 0 && tap > 0 && tap < 1 ? 1 - tap : 0; $('tap').style.transform = `scale(${0.4 + 0.9 * tap})`;
  const done = ft >= 1.25, btn = $('flbtn');
  btn.classList.toggle('done', done); btn.textContent = done ? 'Takip ediliyor ✓' : 'Takip Et';
  btn.style.transform = `scale(${ft >= 1.0 && ft < 1.25 ? 0.9 : 1})`;
}
function charMap(el) {
  $('cam').style.transform = 'none';
  const R = el.getBoundingClientRect(), out = [], tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
  while ((n = tw.nextNode())) for (let i = 0; i < n.length; i++) { const rg = document.createRange(); rg.setStart(n, i); rg.setEnd(n, i + 1); const r = rg.getBoundingClientRect(); out.push([n.data[i], (r.left - R.left) / R.width, (r.right - R.left) / R.width]); }
  return out;
}
window.EVENTS = {dur: DUR, segs: SEGT, writes: items.filter(it => it.kind !== 'ck').map(it => [it.a, it.b, it.kind, it.kind === 'h' ? charMap(it.el) : null]),
  checks: items.filter(it => it.kind === 'ck').map(it => it.a), highlights: HL.map(h => [h.a, h.b]), moves: moves.map(m => [m[0], m[1]]), follows};
window.render = render; window.DUR = DUR;
render(0);
})();
