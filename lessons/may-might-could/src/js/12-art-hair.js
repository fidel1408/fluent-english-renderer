/* 12-art-hair: strand-built hair (flow lines, highlight bands, shadow under the hairline). Head-local coordinates. */
(function () {
  'use strict';
  const FE = window.FE, Art = FE.Art, SH = FE.shade;
  const f = (n) => (+n).toFixed(1);

  Art.hair = (c) => {
    const d = c.def, u = c.uid, base = d.hair.color, hi = d.hair.hi || SH(base, 0.22), rng = FE.rng(FE.hash(d.id) + 3);
    const lo = SH(base, -0.07), mid = SH(base, 0.1, 0.0), hi2 = SH(hi, 0.1);
    const cols = [lo, base, base, mid, hi];
    c.defs.insertAdjacentHTML('beforeend', `
      <linearGradient id="${u}hg" x1="0" y1="0" x2="0.25" y2="1"><stop offset="0" stop-color="${SH(base, -0.05)}"/><stop offset=".4" stop-color="${base}"/><stop offset="1" stop-color="${SH(base, 0.04)}"/></linearGradient>
      <radialGradient id="${u}hsh" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`);
    const G = `url(#${u}hg)`;
    const shadowUnder = (path) => `<path d="${path}" fill="none" stroke="#000" stroke-width="9" opacity=".13" stroke-linecap="round"/>`;
    const band = (path, w = 6, op = 0.34) => `<path d="${path}" fill="none" stroke="${hi2}" stroke-width="${w}" opacity="${op}" stroke-linecap="round"/><path d="${path}" fill="none" stroke="#fff" stroke-width="${w * 0.22}" opacity="${op * 0.45}" stroke-linecap="round"/>`;
    const out = { back: '', front: '' }; let mode = 'f'; const U = u;
    /* n strands, each a quadratic curve from rootFn(t) to tipFn(t), bent by bendFn(t) */
  function strands(rng, n, rootFn, tipFn, bendFn, cols, w0, w1, op) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const t = Math.min(1, Math.max(0, i / (n - 1) + (rng() - 0.5) * 0.5 / n)), [x1, y1] = rootFn(t), [x2, y2] = tipFn(t);
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, b = bendFn(t) + (rng() - 0.5) * 3;
      const cx = mx - (dy / L) * b, cy = my + (dx / L) * b, col = cols[Math.floor(rng() * cols.length)];
      s += `<path d="M${f(x1)},${f(y1)} Q${f(cx)},${f(cy)} ${f(x2)},${f(y2)}" stroke="${col}" stroke-width="${f(w0 + rng() * (w1 - w0))}" fill="none" stroke-linecap="round" opacity="${f(op * (0.6 + rng() * 0.5))}"/>`;
    }
    return `<g clip-path="url(#${U}h${mode}c)">${s}</g>`;
  }



    switch (d.hair.style) {
      case 'wavy': {
        const b = 'M-53,-20 C-68,26 -66,92 -50,126 C-24,136 24,136 50,126 C66,92 68,26 53,-20 C51,-66 -51,-66 -53,-20Z';
        mode = 'b'; out.back = `<path d="${b}" fill="${G}"/>` + strands(rng, 40, (t) => [-48 + 96 * t, -40 + Math.pow(2 * t - 1, 2) * 10], (t) => [(-48 + 96 * t) * 1.1, 122 + Math.sin(t * 9) * 5], (t) => Math.sin(t * 13) * 10, cols, 0.8, 1.7, 0.7)
          + `<ellipse cx="0" cy="104" rx="42" ry="30" fill="url(#${u}hsh)" opacity=".55"/>`;
        mode = 'f'; out.front = `<path d="M-47,-4 C-57,-52 -28,-71 6,-70 C42,-69 60,-42 49,0 C47,-17 41,-30 31,-39 C19,-31 -5,-36 -21,-31 C-35,-27 -43,-16 -47,-4Z" fill="${G}"/>`
          + `<path d="M-46,-10 C-57,20 -62,62 -53,100 C-44,72 -42,32 -38,2Z" fill="${G}"/><path d="M46,-8 C57,22 60,62 51,96 C43,68 41,32 38,2Z" fill="${G}"/>`
          + strands(rng, 26, (t) => [-8 + t * 22, -68 + t * 3], (t) => [30 + t * 20, -36 + t * 36], (t) => 8 + t * 4, cols, 0.7, 1.5, 0.75)
          + strands(rng, 14, (t) => [-9 - t * 8, -67 + t * 3], (t) => [-45 + t * 4, -8 + t * 18], (t) => -7, cols, 0.7, 1.4, 0.7)
          + strands(rng, 12, (t) => [-47 + t * 6, -4 + t * 6], (t) => [-52 + t * 6, 56 + t * 36 + Math.sin(t * 6) * 4], (t) => Math.sin(t * 7) * 6, cols, 0.7, 1.5, 0.7)
          + strands(rng, 12, (t) => [47 - t * 6, -2 + t * 6], (t) => [52 - t * 6, 54 + t * 34], (t) => -Math.sin(t * 7) * 6, cols, 0.7, 1.5, 0.7)
          + `<path d="M-6,-69 C-8,-60 -11,-52 -15,-44" stroke="${SH(base, -0.15)}" stroke-width="1.5" fill="none" opacity=".6"/>`
          + shadowUnder('M-20,-31 C-6,-36 18,-35 30,-39') + band('M-36,-52 C-14,-67 22,-67 42,-46', 7, 0.34);
        break;
      }
      case 'long': {
        mode = 'b'; out.back = `<path d="M-52,-20 C-68,40 -64,120 -50,182 L50,182 C64,120 68,40 52,-20 C50,-66 -50,-66 -52,-20Z" fill="${G}"/>`
          + strands(rng, 44, (t) => [-48 + 96 * t, -40 + Math.pow(2 * t - 1, 2) * 10], (t) => [(-48 + 96 * t) * 1.08, 176 + Math.sin(t * 8) * 4], (t) => Math.sin(t * 11) * 4, cols, 0.8, 1.6, 0.7)
          + `<ellipse cx="0" cy="120" rx="40" ry="50" fill="url(#${u}hsh)" opacity=".5"/>`;
        mode = 'f'; out.front = `<path d="M0,-69 C-34,-68 -55,-46 -49,2 C-48,-18 -38,-32 -22,-38 C-12,-40 -4,-44 0,-46 C4,-44 12,-40 22,-38 C38,-32 48,-18 49,2 C55,-46 34,-68 0,-69Z" fill="${G}"/>`
          + `<path d="M-47,-6 C-58,34 -58,90 -52,132 C-40,100 -36,50 -37,10Z" fill="${G}"/><path d="M47,-6 C58,34 58,90 52,132 C40,100 36,50 37,10Z" fill="${G}"/>`
          + strands(rng, 22, (t) => [-2 - t * 4, -66 + t * 4], (t) => [-46 + t * 6, -6 + t * 6], (t) => -6, cols, 0.7, 1.4, 0.75)
          + strands(rng, 22, (t) => [2 + t * 4, -66 + t * 4], (t) => [46 - t * 6, -6 + t * 6], (t) => 6, cols, 0.7, 1.4, 0.75)
          + strands(rng, 14, (t) => [-47 + t * 8, -4 + t * 10], (t) => [-52 + t * 12, 100 + t * 32], (t) => Math.sin(t * 5) * 3, cols, 0.7, 1.5, 0.7)
          + strands(rng, 14, (t) => [47 - t * 8, -4 + t * 10], (t) => [52 - t * 12, 100 + t * 32], (t) => -Math.sin(t * 5) * 3, cols, 0.7, 1.5, 0.7)
          + `<path d="M0,-69 L0,-47" stroke="${SH(base, -0.15)}" stroke-width="1.6" opacity=".6"/>` + shadowUnder('M-30,-34 C-14,-42 14,-42 30,-34')
          + band('M-38,-48 C-18,-64 18,-64 38,-48', 7, 0.36) + band('M-50,20 C-52,50 -52,80 -50,110', 5, 0.22) + band('M50,20 C52,50 52,80 50,110', 5, 0.22);
        break;
      }
      case 'bun': {
        mode = 'b'; out.back = `<circle cx="0" cy="-74" r="24" fill="${G}"/>` + (() => { let s = ''; for (let i = 0; i < 9; i++) s += `<path d="M${f(-22 + i * 5)},-62 C${f(-26 + i * 6)},-88 ${f(14 - i * 4)},-96 ${f(20 - i * 5)},-70" stroke="${i % 2 ? mid : lo}" stroke-width="1.2" fill="none" opacity=".6"/>`; return s; })()
          + `<path d="M-18,-92 C-6,-100 10,-100 18,-92" stroke="${hi2}" stroke-width="4" fill="none" opacity=".35" stroke-linecap="round"/><ellipse cx="0" cy="-56" rx="18" ry="6" fill="url(#${u}hsh)" opacity=".4"/>`;
        mode = 'f'; out.front = `<path d="M-46,-4 C-52,-44 -26,-64 0,-64 C26,-64 52,-44 46,-4 C44,-22 34,-34 22,-38 C8,-31 -8,-31 -22,-38 C-34,-34 -44,-22 -46,-4Z" fill="${G}"/>`
          + strands(rng, 38, (t) => [-40 + 80 * t, -34 - Math.sin(t * Math.PI) * 4 + Math.abs(t - 0.5) * 12], (t) => [(-40 + 80 * t) * 0.3, -66], (t) => (t < 0.5 ? 6 : -6), cols, 0.7, 1.4, 0.78)
          + `<path d="M-42,-26 C-45,-12 -44,4 -43,12" stroke="${lo}" stroke-width="1.2" fill="none" opacity=".7"/><path d="M42,-26 C45,-12 44,4 43,12" stroke="${lo}" stroke-width="1.2" fill="none" opacity=".7"/>`
          + shadowUnder('M-22,-33 C-8,-37 8,-37 22,-33') + band('M-34,-46 C-14,-60 14,-60 34,-46', 6, 0.38);
        break;
      }
      case 'sidePart': {
        mode = 'f'; out.front = `<path d="M-46,-6 C-52,-46 -26,-68 8,-68 C40,-67 56,-44 46,-6 C45,-20 40,-30 32,-37 C22,-30 -2,-36 -18,-33 C-32,-30 -42,-20 -46,-6Z" fill="${G}"/>`
          + strands(rng, 30, (t) => [-14 + t * 18, -66 + t * 4], (t) => [20 + t * 24, -36 + t * 26], (t) => 7, cols, 0.7, 1.5, 0.78)
          + strands(rng, 14, (t) => [-15 - t * 6, -66 + t * 3], (t) => [-44 + t * 4, -10 + t * 8], (t) => -5, cols, 0.7, 1.3, 0.7)
          + `<path d="M-14,-67 C-16,-58 -18,-48 -20,-38" stroke="${SH(base, -0.15)}" stroke-width="1.4" fill="none" opacity=".6"/>` + shadowUnder('M-18,-33 C-2,-36 22,-34 32,-37') + band('M-32,-54 C-12,-66 20,-66 40,-48', 6, 0.32);
        break;
      }
      case 'crop': {
        mode = 'f'; out.front = `<path d="M-45,-6 C-50,-44 -28,-64 2,-64 C32,-64 52,-44 45,-6 C43,-20 36,-30 26,-35 C14,-31 -12,-33 -26,-33 C-36,-28 -42,-18 -45,-6Z" fill="${G}"/>`
          + (() => { let s = ''; for (let i = 0; i < 78; i++) { const th = Math.PI * (0.06 + rng() * 0.88), r1 = 0.45 + rng() * 0.5, x = -Math.cos(th) * 41 * r1, y = -30 - Math.sin(th) * 33 * r1, sg = x < 0 ? -1 : 1; s += `<path d="M${f(x)},${f(y + 2.6)} q${f(sg * 2.6)},${f(-2.8)} ${f(sg * 5.5)},${f(-1.2)}" stroke="${cols[Math.floor(rng() * cols.length)]}" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".8"/>`; } return `<g clip-path="url(#${u}hfc)">${s}</g>`; })()
          + `<path d="M-45,-6 C-43,-18 -38,-26 -30,-31 C-36,-24 -40,-14 -42,-4Z" fill="${base}" opacity=".5"/>` + shadowUnder('M-26,-33 C-10,-36 14,-35 26,-35') + band('M-30,-54 C-8,-64 18,-62 34,-48', 6, 0.3);
        break;
      }
      default: { // shortBeard: tousled short hair
        mode = 'f'; out.front = `<path d="M-46,-4 C-55,-46 -32,-66 2,-67 C36,-67 58,-46 46,-4 C44,-18 38,-28 30,-33 C24,-26 18,-33 8,-30 C-2,-27 -8,-34 -18,-30 C-30,-27 -40,-22 -46,-4Z" fill="${G}"/>`
          + strands(rng, 46, (t) => [-40 + 80 * t, -40 - Math.sin(t * Math.PI) * 18], (t) => [(-40 + 80 * t) * 1.08 + (rng() - 0.5) * 8, -34 - Math.sin(t * Math.PI) * 30 - rng() * 6], (t) => (t - 0.5) * 22, cols, 0.7, 1.5, 0.8)
          + shadowUnder('M-22,-30 C-6,-34 14,-32 30,-33') + band('M-32,-52 C-12,-64 20,-64 38,-48', 6, 0.32);
      }
    }
    const clipOf = (str) => (str.match(/<(?:path|circle)[^>]*fill="url\(#[^"]*hg\)"[^>]*\/>/g) || []).map((t) => t.replace(/ fill="[^"]*"/, '')).join('');
    c.defs.insertAdjacentHTML('beforeend', `<clipPath id="${u}hfc">${clipOf(out.front)}</clipPath><clipPath id="${u}hbc">${clipOf(out.back) || '<rect x="0" y="0" width="0" height="0"/>'}</clipPath>`);
    return out;
  };
})();
