/* TYT animasyon motoru — öğeler seslendirme metnindeki işaretlere bağlanır.
   Metin: window.METIN = { bolumId: "… [[isaret]] …" }  (işaretler seslendirmede okunmaz)
   Öğe:   data-a="tur:isaret[:sure]"   tur = gir | pop | fosfor | ciz | yaz
          isaret yerine sayı yazılırsa bölüm başından itibaren saniye kabul edilir.
   Zaman: Ses yokken kelime sayısından tahmin edilir (KELIME sn/kelime, cümle sonunda +CUMLE).
          Ses üretilince window.GERCEK_ZAMAN = { bolumId: { isaret: sn, _son: sn } } ile değiştirilir.
   Özel hareketler: window.OZEL[bolumId] = (t, z, bolum) => { … } */
(function () {
  const KELIME = 0.40, CUMLE = 0.30, BASLANGIC = 0.4, SON_BOSLUK = 0.8;
  const SURE = { gir: .5, pop: .45, fosfor: .9, ciz: 1.2, yaz: 1.4 };
  const sinir = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const yum = x => x * x * (3 - 2 * x);
  window.ZAMAN = {}; window.OZEL = window.OZEL || {};

  window.zamanla = function (id) {
    const metin = (window.METIN || {})[id] || '';
    const z = {}; let t = BASLANGIC;
    for (const p of metin.split(/(\[\[\w+\]\])/)) {
      const m = p.match(/^\[\[(\w+)\]\]$/);
      if (m) { z[m[1]] = t; continue; }
      for (const k of p.split(/\s+/).filter(Boolean)) { t += KELIME; if (/[.?!…]$/.test(k)) t += CUMLE; }
    }
    z._son = t + SON_BOSLUK;
    return (ZAMAN[id] = Object.assign(z, (window.GERCEK_ZAMAN || {})[id] || {}));
  };

  window.canlandir = function (bolum, t) {
    const z = ZAMAN[bolum.id] || zamanla(bolum.id);
    bolum.querySelectorAll('[data-a]').forEach(el => {
      const [tur, isaret, s] = el.dataset.a.split(':');
      const bas = isaret in z ? z[isaret] : (+isaret || 0);
      const d = +(s || SURE[tur] || .5);
      const p = sinir((t - bas) / d), e = yum(p);
      if (tur === 'gir') { el.style.opacity = e; el.style.transform = `translateY(${(1 - e) * 24}px)`; }
      else if (tur === 'pop') {
        el.style.opacity = e; el.style.transformBox = 'fill-box'; el.style.transformOrigin = 'center';
        el.style.transform = `scale(${.6 + .4 * (p < 1 ? Math.min(1.08, e * 1.08) : 1)})`;
      }
      else if (tur === 'fosfor') { el.style.backgroundSize = `${e * 100}% 100%`; }
      else if (tur === 'ciz') {
        const L = el.getTotalLength ? el.getTotalLength() : 1000;
        el.style.strokeDasharray = L; el.style.strokeDashoffset = L * (1 - e); el.style.opacity = p > 0 ? 1 : 0;
      }
      else if (tur === 'yaz') { el.style.opacity = p > 0 ? 1 : 0; el.style.clipPath = `inset(-30% ${(1 - e) * 100}% -30% 0)`; }
    });
    if (OZEL[bolum.id]) OZEL[bolum.id](t, z, bolum);
  };

  // Sayfa açılınca: ?s=bolum&t=sn → o an; t yoksa bölümün son hâli
  window.addEventListener('load', () => {
    const q = new URLSearchParams(location.search), s = q.get('s');
    const b = s && document.getElementById(s);
    if (!b || s === 'giris' || !window.METIN || !(s in METIN)) return;
    const z = zamanla(s);
    if (q.get('oynat')) { const t0 = performance.now(); (function d() { canlandir(b, ((performance.now() - t0) / 1000) % z._son); requestAnimationFrame(d); })(); }
    else canlandir(b, q.has('t') ? +q.get('t') : z._son);
  });
})();
