// Konu modülleri için ortak araçlar. Her konu: bir 3D sahne + konu anlatımı (dersler) + soru çözümü (görevler).
// Konu anlatımı "Tahmin et → Gözle → Açıkla" düzenindedir: önce tahmin sorusu, sonra sahnede olay, sonra kural.
(function () {
  const { THREE, V3, mesh, setPlate, camGoal, scene, loopSnd } = FZ;
  FZ.sahne = function (o) {
    const g = new THREE.Group(); g.visible = false; scene.add(g);
    const nes = o.kur ? o.kur(g) || {} : {};
    return {
      group: g, icon: o.icon || '🔬', data: o.data || [], notlar: o.notlar, nes,
      reset() {
        this.S = Object.assign({ t: 0 }, o.S0 ? o.S0() : {});
        const pl = o.plate || [12, 8, 0, 0]; setPlate(...pl);
        const c = o.cam || [[0, 6, 14], [0, 1.5, 0]]; camGoal(c[0], c[1], true);
        this.sesTur = o.ses || null; this.snd = o.ses ? loopSnd(o.ses) : { set() {}, stop() {} };
        if (o.basla) o.basla(this.S, nes);
      },
      tick(dt) { const S = this.S; S.t += dt; S.ses = null; if (o.tick) o.tick(S, dt, nes); const z = S.ses || [0, 0]; this.snd.set(z[0], z[1]); this.camFor(); },
      qp(at) { return o.qp ? o.qp(at, this.S, nes) : V3(0, 3, 0); },
      camFor() { if (o.cam2) { const c = o.cam2(this.S); if (c) camGoal(c[0], c[1], false); } },
    };
  };
  const yap = (taban, a, ders) => Object.assign(Object.create(taban), a, { ders, kisa: a.kisa || a.task, data: a.data || taban.data, notlar: a.notlar || taban.notlar });
  FZ.gorev = (taban, a) => yap(taban, a, false);
  FZ.ders = (taban, a) => yap(taban, a, true);
  // kısa yazım yardımcıları
  FZ.ok = (renk, tid) => { const a = FZ.arrow(renk); a.tid = tid; return a; };
  FZ.etiket = (id, html, bg, fg) => FZ.tag(id, html, bg, fg || '#fff');
  FZ.kart = (id, html, renk) => FZ.tag(id, html, renk || '#F5C400', '#fff', true);
  FZ.kutu = (g, w, h, d, renk, x, y, z, ops) => { const m = mesh(new THREE.BoxGeometry(w, h, d), renk, ops); m.position.set(x, y, z); g.add(m); return m; };
  FZ.top = (g, r, renk, x, y, z, ops) => { const m = mesh(new THREE.SphereGeometry(r, 28, 18), renk, ops); m.position.set(x, y, z); g.add(m); return m; };
  FZ.silindir = (g, r1, r2, h, renk, x, y, z, ops) => { const m = mesh(new THREE.CylinderGeometry(r1, r2, h, 32), renk, ops); m.position.set(x, y, z); g.add(m); return m; };
  FZ.cizgi = (g, renk, pts) => { const l = FZ.dashLine(renk); g.add(l); if (pts) FZ.setLine(l, pts); return l; };
  FZ.levha = (g, txt, w, h, bg, fg, x, y, z) => { const m = FZ.textSprite(txt, w, h, bg, fg); m.position.set(x, y, z); g.add(m); return m; };
})();
