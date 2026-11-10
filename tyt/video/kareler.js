// Onay için kareler: giriş, kapak, her sayfanın son hâli (kamera kaymadan hemen önce), kamera geçişi ortası, kapanış.
// Kullanım: PAGE="$PWD/konu.html?k=<içerik>&s=<sync>" node kareler.js <çıktı_klasörü>
const {chromium} = require('playwright'); const path = require('path'), fs = require('fs');
const out = process.argv[2]; fs.mkdirSync(out, {recursive: true});
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1080, height: 1920}});
  await p.goto('file://' + process.env.PAGE); await p.waitForFunction(() => window.DUR);
  const E = await p.evaluate(() => ({dur: DUR, moves: EVENTS.moves, segs: EVENTS.segs, sorular: EVENTS.sorular}));
  const shots = [['01_giris', 5.9], ['02_kapak', 7.6]];
  const nn = i => String(i).padStart(2, '0');
  if (E.sorular) {   // test kağıdı: bütün kağıt → her soru → uzak çekim → puan
    shots.push(['03_kagit', E.moves[0][0] - 0.1]);
    E.sorular.forEach((t, i) => shots.push([`${nn(i + 4)}_soru${i + 1}`, t]));
    shots.push(['uzak_kagit', E.moves[7][1] + 0.3], ['gecis_ortasi', (E.moves[1][0] + E.moves[1][1]) / 2]);
    const m = E.moves[E.moves.length - 2]; shots.push(['zy_puan', m[1] + 1.2]);
  } else {
    E.moves.forEach(([a, b2], i) => shots.push([`${nn(i + 3)}_soru${i + 1}`, a - 0.05]));
    shots.push([`${nn(E.moves.length + 3)}_soru${E.moves.length + 1}`, E.segs.outro - 0.5]);
    if (E.moves[0]) shots.push(['gecis_ortasi', (E.moves[0][0] + E.moves[0][1]) / 2]);
  }
  shots.push(['zz_kapanis', E.dur - 1.5]);
  for (const [ad, t] of shots) { await p.evaluate(t => render(t), t); await p.screenshot({path: path.join(out, ad + '.png')}); }
  console.log('süre', E.dur.toFixed(1), 'sn ·', shots.length, 'kare'); await b.close();
})();
