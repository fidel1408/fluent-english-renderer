/* 35-finish: cinematic finish over every scene — film grain, vignette, floating dust in the light, grounded warmth */
(function () {
  'use strict';
  const FE = window.FE, { el } = FE;
  let grainURL = null;
  function grain() {
    if (grainURL) return grainURL;
    try {
      const c = document.createElement('canvas'); c.width = c.height = 192; const x = c.getContext('2d'); const d = x.createImageData(192, 192); const r = FE.rng(77);
      for (let i = 0; i < d.data.length; i += 4) { const v = 90 + Math.floor(r() * 140); d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
      x.putImageData(d, 0, 0); grainURL = c.toDataURL('image/png');
    } catch (e) { grainURL = ''; }
    return grainURL;
  }
  FE.Finish = {
    apply(S) {
      const svg = S.dom.scene, defs = svg.querySelector('defs');
      defs.insertAdjacentHTML('beforeend', `<radialGradient id="fvig" cx=".5" cy=".46" r=".78"><stop offset=".55" stop-color="#0a0e22" stop-opacity="0"/><stop offset="1" stop-color="#0a0e22" stop-opacity=".46"/></radialGradient>
        <radialGradient id="fmote"><stop offset="0" stop-color="#fff7d6" stop-opacity=".9"/><stop offset="1" stop-color="#fff7d6" stop-opacity="0"/></radialGradient>
        <linearGradient id="ffloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#05060f" stop-opacity=".28"/></linearGradient>`);
      const g = el('g', { class: 'finish', 'pointer-events': 'none' });
      const gu = grain();
      if (gu) { defs.insertAdjacentHTML('beforeend', `<pattern id="fgrain" width="192" height="192" patternUnits="userSpaceOnUse"><image href="${gu}" width="192" height="192"/></pattern>`); g.appendChild(el('rect', { width: 1920, height: 1080, fill: 'url(#fgrain)', opacity: 0.075, style: 'mix-blend-mode:overlay' })); }
      g.appendChild(el('rect', { y: 700, width: 1920, height: 380, fill: 'url(#ffloor)' }));
      g.appendChild(el('rect', { width: 1920, height: 1080, fill: 'url(#fvig)' }));
      const motes = el('g', {}); const r = FE.rng(5); const ms = [];
      for (let i = 0; i < 16; i++) { const m = { x: r() * 1920, y: 80 + r() * 800, s: 0.4 + r() * 0.8, p: r() * 6.28, rad: 3 + r() * 6 }; ms.push(m); m.e = el('circle', { r: m.rad, fill: 'url(#fmote)' }); motes.appendChild(m.e); }
      g.appendChild(motes); svg.appendChild(g);
      S.anim.push((dt, t) => { const tt = S.t; ms.forEach((m) => { m.e.setAttribute('cx', (m.x + Math.sin(tt * 0.2 * m.s + m.p) * 40).toFixed(1)); m.e.setAttribute('cy', ((m.y - tt * 6 * m.s) % 900 + 900) % 900 + 60 + ''); m.e.setAttribute('opacity', (0.25 + 0.25 * Math.sin(tt * 0.7 * m.s + m.p)).toFixed(2)); }); });
    },
  };
})();
