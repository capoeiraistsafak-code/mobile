// Instagram kapağı: videodaki kapak, Takip Et kartı olmadan. Kullanım: PAGE=".../konu.html?..." node kapak.js kapak.png
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+process.env.PAGE);await p.waitForFunction(()=>window.DUR);
const t=await p.evaluate(()=>EVENTS.follows[0]+1.5);await p.evaluate(t=>{render(t);document.getElementById('follow').style.display='none';document.getElementById('tap').style.display='none';},t);
await p.screenshot({path:process.argv[2]});await b.close();})();
