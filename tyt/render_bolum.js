// Bir bölümün animasyonundan kareler: node render_bolum.js <konu> <bolum> [adet=6]
// → kareler/<konu>/<bolum>_seri.png (zaman sırasıyla yan yana) ve süreyi yazar
const {chromium}=require('playwright');const path=require('path');const {execSync}=require('child_process');const fs=require('fs');
const [konu,bolum,adet='6']=process.argv.slice(2);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('HATA',e.message));
await p.goto('file://'+path.resolve(__dirname,'konular',konu+'.html')+'?s='+bolum+'&t=0',{waitUntil:'networkidle'});
await p.evaluate(()=>document.fonts.ready);
const son=await p.evaluate(b=>zamanla(b)._son,bolum);
const z=await p.evaluate(b=>ZAMAN[b],bolum);
const tmp=fs.mkdtempSync('/tmp/seri_');const n=+adet;const ts=[];
for(let i=0;i<n;i++){const t=son*(i+1)/n;ts.push(t.toFixed(1));
 await p.evaluate(([b,t])=>canlandir(document.getElementById(b),t),[bolum,t]);
 await p.screenshot({path:`${tmp}/${i}.png`});}
await b.close();
const out=path.join(__dirname,'kareler',konu,bolum+'_seri.png');
execSync(`ffmpeg -loglevel error -y -i ${tmp}/%d.png -vf "scale=360:640,tile=${n}x1:padding=8:color=0x111111" -frames:v 1 ${out}`);
fs.rmSync(tmp,{recursive:true});console.log(bolum,'süre',son.toFixed(1),'sn · kareler',ts.join(' '),'\nişaretler',JSON.stringify(Object.fromEntries(Object.entries(z).map(([k,v])=>[k,+v.toFixed(1)]))))})();
