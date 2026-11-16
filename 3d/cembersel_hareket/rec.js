// Kullanım: node rec.js 30 cikti.mp4        (video)
//           node rec.js 30 kare "3,8,15"    (belirli anların fotoğrafı)
const {chromium}=require('playwright');const {spawn}=require('child_process');const path=require('path');
const fps=+process.argv[2]||30, out=process.argv[3], only=process.argv[4];
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('console',m=>{if(m.type()==='error')console.log('JS:',m.text())});p.on('pageerror',e=>console.log('ERR:',e.message));
await p.goto('file://'+path.join(__dirname,'video.html'));await p.waitForLoadState('networkidle');await p.evaluate(()=>document.fonts.ready);await p.waitForFunction(()=>window.DUR);
require('fs').writeFileSync(path.join(__dirname,'olaylar.json'),JSON.stringify(await p.evaluate(()=>EVENTS)));
if(only){for(const t of only.split(',')){await p.evaluate(t=>render(+t),t);await p.screenshot({path:`${out}_${String(t).padStart(5,'0')}.png`});}await b.close();return;}
const dur=await p.evaluate(()=>window.DUR);const n=Math.round(dur*fps);
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',out],{stdio:['pipe','inherit','inherit']});
for(let i=0;i<n;i++){await p.evaluate(t=>render(t),i/fps);const buf=await p.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%300==0)console.log(i,'/',n);}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('frames',n);})();
