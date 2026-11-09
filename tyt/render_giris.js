// Girişin sessiz önizleme videosu: node render_giris.js <konu> [sn=8] [fps=30]
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');const {execSync}=require('child_process');
const [konu,sure='8',fps='30']=process.argv.slice(2);
const html='file://'+path.resolve(__dirname,'konular',konu+'.html')+'?s=giris&t=0';
const tmp=fs.mkdtempSync('/tmp/giris_');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto(html,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
const n=Math.round(+sure*+fps);
for(let i=0;i<n;i++){await p.evaluate(t=>window.ciz(t),i/+fps);
 await p.screenshot({path:`${tmp}/${String(i).padStart(4,'0')}.jpg`,type:'jpeg',quality:92});}
await b.close();
const out=path.join(__dirname,'kareler',konu,'giris_onizleme.mp4');
execSync(`ffmpeg -loglevel error -y -framerate ${fps} -i ${tmp}/%04d.jpg -c:v libx264 -pix_fmt yuv420p -crf 20 ${out}`);
fs.rmSync(tmp,{recursive:true});console.log(out)})();
