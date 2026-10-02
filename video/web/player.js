(function(){
  const q=new URLSearchParams(location.search), EXPORT=q.has('export');
  if(EXPORT) document.body.classList.add('export');
  const st=document.getElementById('stage'); let mode='ipa';
  try{ mode=localStorage.getItem('fe_cc_mode')||(q.get('mode')||'ipa'); }catch(e){ mode=q.get('mode')||'ipa'; }
  if(q.get('mode')) mode=q.get('mode');
  let T=0;
  function draw(t){ T=t; st.innerHTML=FE.frame(t,mode); const c=document.getElementById('clock'); if(c){c.textContent=t.toFixed(1)+' / 30.0 s'; document.getElementById('tbar').value=t;} }
  window.renderCover=()=>{ st.innerHTML=FE.cover(); return true; };
  window.renderAt=(t,m)=>{ if(m) mode=m; draw(t); return true; };
  window.fontsReady=()=>document.fonts.load("800 40px 'Plus Jakarta Sans'").then(()=>document.fonts.load("400 40px 'Gentium Plus'")).then(()=>document.fonts.load("500 40px 'Plus Jakarta Sans'")).then(()=>document.fonts.ready).then(()=>true);
  function setMode(m){ mode=m; try{localStorage.setItem('fe_cc_mode',m);}catch(e){} document.querySelectorAll('[data-m]').forEach(b=>b.classList.toggle('on',b.dataset.m===m)); draw(T); }
  if(EXPORT){ fontsReady().then(()=>{ if(q.has('cover')) window.renderCover(); else draw(+q.get('t')||0); }); return; }
  // ---- preview player with per-layer audio ----
  const LAYERS=[['narration','Narración (es-MX)','../audio/stems/narration.mp3'],['english','Voz de inglés','../audio/stems/english.mp3'],['music','Música','../audio/stems/music.mp3'],['sfx','Efectos','../audio/stems/sfx.mp3'],['ambience','Ambiente','../audio/stems/ambience.mp3']];
  const auds={}, box=document.getElementById('layers');
  LAYERS.forEach(([k,label,src])=>{ const a=new Audio(); a.preload='auto'; a.src=src; auds[k]=a;
    const row=document.createElement('div'); row.className='lay'; row.innerHTML=`<span>${label}</span><input type=range min=0 max=1.5 step=.01 value=1 data-k=${k}><label class=imp>Importar<input type=file accept="audio/*" data-i=${k}></label>`; box.appendChild(row); });
  box.addEventListener('input',e=>{ const k=e.target.dataset.k; if(k) auds[k].volume=Math.min(1,+e.target.value); });
  box.addEventListener('change',e=>{ const k=e.target.dataset.i; if(k&&e.target.files[0]){ auds[k].src=URL.createObjectURL(e.target.files[0]); auds[k].currentTime=T; } });
  let playing=false, t0=0, base=0;
  function tick(){ if(!playing) return; const t=base+(performance.now()-t0)/1000; if(t>=30){ playing=false; document.getElementById('play').textContent='▶ Reproducir'; draw(29.99); Object.values(auds).forEach(a=>a.pause()); return; }
    Object.values(auds).forEach(a=>{ if(Math.abs(a.currentTime-t)>0.08) a.currentTime=t; }); draw(t); requestAnimationFrame(tick); }
  function play(){ if(playing){ playing=false; Object.values(auds).forEach(a=>a.pause()); document.getElementById('play').textContent='▶ Reproducir'; return; }
    base=T>=29.9?0:T; t0=performance.now(); playing=true; document.getElementById('play').textContent='⏸ Pausa'; Object.values(auds).forEach(a=>{a.currentTime=base; a.play().catch(()=>{});}); requestAnimationFrame(tick); }
  document.getElementById('play').onclick=play;
  document.getElementById('restart').onclick=()=>{ playing=false; Object.values(auds).forEach(a=>{a.pause();a.currentTime=0;}); document.getElementById('play').textContent='▶ Reproducir'; draw(0); };
  document.getElementById('tbar').oninput=e=>{ const t=+e.target.value; if(playing){ base=t; t0=performance.now(); } Object.values(auds).forEach(a=>a.currentTime=t); draw(t); };
  document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>setMode(b.dataset.m));
  fontsReady().then(()=>setMode(mode));
})();
