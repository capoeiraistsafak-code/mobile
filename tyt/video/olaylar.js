// Zaman çizelgesini (EVENTS) JSON olarak kaydeder. Kullanım: PAGE=".../konu.html?m=test_motor&k=<icerik>&s=<sync>" node olaylar.js ev.json
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+process.env.PAGE);await p.waitForFunction(()=>window.DUR);
require('fs').writeFileSync(process.argv[2],JSON.stringify(await p.evaluate(()=>EVENTS)));await b.close();})();
