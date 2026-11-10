// Kullanım: node render_kareler.js <konu>   (ör. isi_sicaklik)
// konular/<konu>.html içindeki her <section class="sahne"> için kareler/<konu>/NN_<id>.png üretir.
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const konu=process.argv[2]; if(!konu){console.error('konu adı ver');process.exit(1)}
const html=path.resolve(__dirname,'konular',konu+'.html'); const out=path.join(__dirname,'kareler',konu);
fs.mkdirSync(out,{recursive:true});
const ids=[...fs.readFileSync(html,'utf8').matchAll(/<section class="sahne" id="([^"]+)"/g)].map(m=>m[1]);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
for(const [i,s] of ids.entries()){await p.goto('file://'+html+'?s='+s,{waitUntil:'networkidle'});
await p.evaluate(()=>document.fonts.ready);
await p.screenshot({path:path.join(out,String(i+1).padStart(2,'0')+'_'+s+'.png')});}
await b.close();console.log(ids.length+' kare → '+out)})();
