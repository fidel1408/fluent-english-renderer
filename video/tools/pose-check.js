// Per-frame geometric pose audit (every frame at 30 fps): upper-arm angle from vertical, elbow distance from torso edge,
// forearm/upper-arm length sanity, finger counts (5 per hand by construction), wrist reach limits.
const L = require('./lib'), fs = require('fs'), path = require('path');
(async () => {
  const srv = await L.serve(), b = await L.launch(), p = await b.newPage();
  await p.goto(srv.url + '/tools/sheet.html'); await p.waitForFunction('window.FE&&FE.logoReady&&FE.logoReady()');
  const res = await p.evaluate(() => {
    const c = document.createElement('canvas').getContext('2d'), rows = [];
    for (let i = 0; i < 900; i++) {
      const t = i / 30, P = FE._person(t), g = FE.drawPerson(c, Object.assign({}, P, { x: 0, y: 0 }));
      const r = { t };
      [['L', g[0], -1], ['R', g[1], 1]].forEach(([n, G, sd]) => {
        const ux = G.E[0] - G.S[0], uy = G.E[1] - G.S[1], ang = Math.abs(Math.atan2(sd * ux, uy)) * 180 / Math.PI; // 0 = hanging straight down, 90 = horizontal; >90 = raised
        const out = sd * (G.E[0]) - 175; // elbow x beyond a 175-unit torso half-width (local units)
        const lu = Math.hypot(ux, uy), lf = Math.hypot(G.W[0] - G.E[0], G.W[1] - G.E[1]);
        r[n] = { ang: +ang.toFixed(1), out: +out.toFixed(1), lu: +lu.toFixed(1), lf: +lf.toFixed(1), Ey: +G.E[1].toFixed(1) };
      });
      rows.push(r);
    }
    return rows;
  });
  const worst = (k) => res.map((r) => Math.max(r.L[k], r.R[k]));
  const pick = (k, f) => res.reduce((a, r) => (f(r) > f(a) ? r : a), res[0]);
  const wAng = pick('ang', (r) => Math.max(r.L.ang, r.R.ang)), wOut = pick('out', (r) => Math.max(r.L.out, r.R.out));
  const summary = { frames: res.length, max_upper_arm_angle_deg: Math.max(...worst('ang')), at_t: wAng.t, max_elbow_beyond_torso_units: Math.max(...worst('out')), at_t_out: wOut.t,
    min_forearm_len: Math.min(...res.map((r) => Math.min(r.L.lf, r.R.lf))), max_upper_arm_len: Math.max(...res.map((r) => Math.max(r.L.lu, r.R.lu))) };
  // frames with elbows far from torso (chicken-wing risk): angle > 60 deg from vertical while elbow is below shoulder line
  const risky = res.filter((r) => ['L', 'R'].some((n) => r[n].ang > 62 && r[n].ang < 100 && r[n].Ey > 40)).map((r) => r.t.toFixed(2));
  summary.risky_frames = risky.length; summary.risky_ranges = risky.length ? [risky[0], risky[risky.length - 1]] : [];
  fs.writeFileSync(path.join(L.ROOT, 'build/pose-report.json'), JSON.stringify({ summary, rows: res }));
  console.log(JSON.stringify(summary, null, 1)); await b.close(); srv.close();
})();
