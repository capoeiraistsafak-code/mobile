// Sessiz video kareleri + ses olayları: node render_video.js <konu> <bolum,bolum,...> <cikti_klasoru> [fps=30]
// Kareler: <cikti>/kare_%05d.jpg · Olaylar: <cikti>/olaylar.json [{tur,bas,sure}] (video başından saniye)
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const [konu,liste,cikti,fpsS='30']=process.argv.slice(2);const fps=+fpsS;fs.mkdirSync(cikti,{recursive:true});
const GIRIS_OLAY=[]; // girişte efekt yok; bölüm geçişlerinde 'gecis' sesi
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('HATA',e.message));
let n=0, ofset=0; const olaylar=[];
for(const bolum of liste.split(',')){
  await p.goto('file://'+path.resolve(__dirname,'konular',konu+'.html')+'?s='+bolum+'&t=0',{waitUntil:'networkidle'});
  await p.evaluate(()=>document.fonts.ready);
  let sure;
  if(bolum==='giris'){ sure=await p.evaluate(()=>GIRIS_SURE); GIRIS_OLAY.forEach(o=>olaylar.push({...o,bas:o.bas+ofset})); }
  else {
    const r=await p.evaluate(b=>{const z=zamanla(b);const el=document.getElementById(b);
      const SURE={gir:.5,pop:.45,fosfor:.9,ciz:1.2,yaz:1.4};
      return {son:z._son,ol:[...el.querySelectorAll('[data-a]')].map(e=>{const [tur,is,s]=e.dataset.a.split(':');
        return {tur,bas:(is in z?z[is]:(+is||0)),sure:+(s||SURE[tur]||.5),onay:!!e.querySelector('.ok')}})}},bolum);
    sure=r.son;
    r.ol.filter(o=>['yaz','ciz','fosfor'].includes(o.tur)).forEach(o=>{olaylar.push({...o,bas:o.bas+ofset}); if(o.onay) olaylar.push({tur:'onay',bas:o.bas+o.sure+ofset});});
    if(bolum==='kapak') olaylar.push({tur:'takip',bas:ofset+4.6});
  }
  if(ofset>0) olaylar.push({tur:'gecis',bas:ofset});
  const kare=Math.round(sure*fps);
  for(let i=0;i<kare;i++){const t=i/fps;
    await p.evaluate(([b,t])=>b==='giris'?ciz(t):canlandir(document.getElementById(b),t),[bolum,t]);
    await p.screenshot({path:path.join(cikti,`kare_${String(n++).padStart(5,'0')}.jpg`),type:'jpeg',quality:90});}
  console.log(bolum,'→',sure.toFixed(2),'sn');
  ofset+=kare/fps;
}
fs.writeFileSync(path.join(cikti,'olaylar.json'),JSON.stringify({sure:ofset,olaylar},null,1));
await b.close();console.log('toplam',ofset.toFixed(2),'sn,',n,'kare');})();
