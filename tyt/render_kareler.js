// Örnek kareleri üretir: node render_kareler.js  → kareler/*.png
const {chromium}=require('playwright');const path=require('path');
const sahneler=['giris','kapak','a1','a2','a3','a4','a5','a6','a7','kapanis'];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
for(const [i,s] of sahneler.entries()){await p.goto('file://'+path.resolve(__dirname,'sablon.html')+'?s='+s,{waitUntil:'networkidle'});
await p.evaluate(()=>document.fonts.ready);
await p.screenshot({path:path.join(__dirname,'kareler',String(i+1).padStart(2,'0')+'_'+s+'.png')});}
await b.close();})();
