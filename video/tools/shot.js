// Usage: node tools/shot.js <html path> <out.png> [selector]
const path=require('path');
const root=require('child_process').execSync('npm root -g').toString().trim();
const { chromium } = require(root+'/playwright');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const p=await b.newPage({viewport:{width:2160,height:1500}});
 p.on('console',m=>console.log('console:',m.text())); p.on('pageerror',e=>console.log('pageerror:',e.message));
 await p.goto('file://'+path.resolve(process.argv[2]));
 await p.waitForTimeout(300);
 await p.screenshot({path:process.argv[3]});
 await b.close();
})();
