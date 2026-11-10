const {chromium}=require('playwright');const {spawn}=require('child_process');
const fps=+process.argv[2]||30, out=process.argv[3], only=process.argv[4];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+(process.env.PAGE||'/home/user/format-referans/video.html')+'');await p.waitForLoadState('networkidle');await p.evaluate(()=>document.fonts.ready);await p.waitForFunction(()=>window.DUR);
if(only){for(const t of only.split(',')){await p.evaluate(t=>render(+t),t);await p.screenshot({path:`${out}_${t}.png`});}await b.close();return;}
const dur=await p.evaluate(()=>DUR);const n=Math.round(dur*fps);
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-profile:v','high','-movflags','+faststart',out],{stdio:['pipe','inherit','inherit']});
for(let i=0;i<n;i++){await p.evaluate(t=>render(t),i/fps);const buf=await p.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('frames',n);})();
