// node tools/sheet.js out.png t1,t2,... [mode]  — contact sheet of frames via the real renderer
const L=require('./lib');
(async()=>{
 const ts=process.argv[3].split(',').map(Number), mode=+(process.argv[4]||2);
 const srv=await L.serve(); const b=await L.launch();
 const p=await b.newPage({viewport:{width:1080,height:1920}});
 p.on('console',m=>console.log('console:',m.text())); p.on('pageerror',e=>console.log('pageerror:',e.message));
 await p.goto(srv.url+'/tools/sheet.html');
 await p.waitForFunction('window.FE&&FE.logoReady&&FE.logoReady()');
 const per=+(process.env.PER||ts.length);
 await p.evaluate(({ts,mode,per})=>{
  const sc=0.5, cv=document.getElementById('o'); cv.width=Math.min(per,ts.length)*1080*sc; cv.height=Math.ceil(ts.length/per)*1920*sc;
  const o=cv.getContext('2d'), f=document.createElement('canvas'); f.width=1080;f.height=1920; const c=f.getContext('2d');
  ts.forEach((t,i)=>{FE.render(c,t,{mode}); const x=(i%per)*1080*sc,y=Math.floor(i/per)*1920*sc; o.drawImage(f,x,y,1080*sc,1920*sc); o.fillStyle='#fff';o.font='28px sans-serif';o.fillText('t='+t,x+10,y+30);});
 },{ts,mode,per});
 const d=await p.evaluate(()=>document.getElementById('o').toDataURL('image/png'));
 require('fs').writeFileSync(process.argv[2],Buffer.from(d.split(',')[1],'base64'));
 await b.close(); srv.close();
})();
