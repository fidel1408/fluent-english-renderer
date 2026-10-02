// Jointed male character rig. Local origin = centre of the shoulder line, +y down.
// Arms are built from shoulder -> elbow -> wrist -> palm -> 3-segment fingers, so every
// joint is physically connected (no floating forearms or detached hands).
import { C, f, rad } from './util.js';

export const SH = 122;          // shoulder joint x offset
export const L1 = 158;          // upper arm length
export const L2 = 140;          // forearm length (elbow -> wrist)
const SLEEVE = C.navy2, SLEEVE_D = C.navy, CUFF = C.navy3;

// ---------- limbs ----------
function taper(p0, p1, w0, w1) {
  const dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  return `M${f(p0[0] + nx * w0 / 2)},${f(p0[1] + ny * w0 / 2)} L${f(p1[0] + nx * w1 / 2)},${f(p1[1] + ny * w1 / 2)} L${f(p1[0] - nx * w1 / 2)},${f(p1[1] - ny * w1 / 2)} L${f(p0[0] - nx * w0 / 2)},${f(p0[1] - ny * w0 / 2)}Z`;
}
const pt = (o, ang, len) => [o[0] + Math.sin(rad(ang)) * len, o[1] + Math.cos(rad(ang)) * len];

// ---------- hands ----------
// h: {type:'open'|'grip', curl:[idx,mid,ring,pinky] (0..1), spread, thumb:+1|-1 (local x side),
//     thumbOut, facing:'back'|'palm', scale}
function finger(bx, by, ang, len, w, curl, nail) {
  // 3 phalanges; curl foreshortens (finger bends toward/away from viewer)
  const ratio = [0.46, 0.29, 0.25];
  const bends = [curl * 68, curl * 68 + curl * 84, curl * 68 + curl * 84 + curl * 55];
  const pts = [[bx, by]];
  let cur = [bx, by];
  for (let i = 0; i < 3; i++) {
    const proj = Math.max(0.2, Math.cos(rad(Math.min(bends[i], 150)))) ;
    const a = rad(ang);
    const l = len * ratio[i] * (i === 0 ? Math.max(0.42, proj) : Math.max(0.3, proj));
    cur = [cur[0] + Math.sin(a) * l, cur[1] + Math.cos(a) * l];
    pts.push(cur);
  }
  const d = 'M' + pts.map(p => `${f(p[0])},${f(p[1])}`).join(' L');
  const tip = pts[3], pre = pts[2];
  const ta = Math.atan2(tip[0] - pre[0], tip[1] - pre[1]);
  let s = `<path d="${d}" fill="none" stroke="${C.skinD}" stroke-width="${w + 3.4}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${C.skin}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  // knuckle creases
  for (const k of [1, 2]) {
    const p = pts[k];
    s += `<path d="M${f(p[0] - w * 0.28)},${f(p[1])} q${f(w * 0.28)},${f(w * 0.12)} ${f(w * 0.56)},0" stroke="${C.skinD}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".7"/>`;
  }
  if (nail) {
    const nx = tip[0] - Math.sin(ta) * w * 0.35, ny = tip[1] - Math.cos(ta) * w * 0.35;
    s += `<ellipse cx="${f(nx)}" cy="${f(ny)}" rx="${f(w * 0.3)}" ry="${f(w * 0.36)}" transform="rotate(${f(-ta * 180 / Math.PI)} ${f(nx)} ${f(ny)})" fill="${C.skinL}" stroke="${C.skinD}" stroke-width="1.1"/>`;
  }
  return s;
}

export function hand(h) {
  const sc = h.scale ?? 1.2;
  const th = h.thumb ?? 1;
  const palmView = h.facing === 'palm';
  if (h.type === 'grip') {
    // fist wrapped around a (already drawn) handle: 4 side-by-side finger capsules + thumb over
    const gs = h.scale ?? 1.4;
    const under = `<path d="M-15,-8 L-24,14 Q-29,40 -25,56 L25,56 Q29,40 24,14 L15,-8Z" fill="${C.skin}" stroke="${C.skinD}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M-20,30 Q0,20 20,30" stroke="${C.skinD}" stroke-width="1.8" fill="none" opacity=".45"/>`;
    let over = '';
    const xs = [-18.5, -6.2, 6.2, 18.5];
    xs.forEach((x, i) => {
      const len = [30, 33, 31, 26][i];
      const y0 = 26 + (i === 0 || i === 3 ? 3 : 0), y1 = y0 + len;
      over += `<path d="M${x},${y0} L${x},${y1}" stroke="${C.skinD}" stroke-width="15.6" stroke-linecap="round"/>` +
        `<path d="M${x},${y0} L${x},${y1}" stroke="${C.skin}" stroke-width="12.4" stroke-linecap="round"/>` +
        `<path d="M${x - 5},${y0 + 8} q5,3.2 10,0" stroke="${C.skinD}" stroke-width="1.7" fill="none" stroke-linecap="round" opacity=".8"/>` +
        `<path d="M${x - 5},${y0 + 19} q5,3.2 10,0" stroke="${C.skinD}" stroke-width="1.7" fill="none" stroke-linecap="round" opacity=".7"/>` +
        `<ellipse cx="${x}" cy="${y1 - 3}" rx="4.4" ry="3.4" fill="${C.skinL}" stroke="${C.skinD}" stroke-width="1.1"/>`;
    });
    // thumb wrapping across the front toward the index side
    over += `<path d="M${-th * 24},8 Q${-th * 10},14 ${th * 10},30" fill="none" stroke="${C.skinD}" stroke-width="18.6" stroke-linecap="round"/>` +
      `<path d="M${-th * 24},8 Q${-th * 10},14 ${th * 10},30" fill="none" stroke="${C.skin}" stroke-width="15" stroke-linecap="round"/>` +
      `<ellipse cx="${th * 9}" cy="29" rx="4.6" ry="5.4" transform="rotate(${th * -40} ${th * 9} 29)" fill="${C.skinL}" stroke="${C.skinD}" stroke-width="1.1"/>`;
    const wr = (sv) => `<g transform="translate(${f(h.x)} ${f(h.y)}) rotate(${f(h.rot)}) scale(${gs})">${sv}</g>`;
    return { under: wr(under), over: wr(over) };
  }
  // open / relaxed hand
  const curl = h.curl ?? [0.12, 0.14, 0.18, 0.24];
  const spread = h.spread ?? 1;
  const bx = [16.5, 5.6, -5.6, -16.5].map(v => v * th);
  const ang = [10, 3.5, -4, -13].map(a => a * spread * th);
  const lens = [41, 45, 41, 33];
  let under = `<path d="M-14.5,-8 L-21.5,14 Q-25,32 -22,46 Q0,53 22,46 Q25,32 21.5,14 L14.5,-8Z" fill="${C.skin}" stroke="${C.skinD}" stroke-width="2.6" stroke-linejoin="round"/>`;
  if (palmView) {
    under += `<path d="M${-th * 15},22 Q${-th * 2},31 ${th * 14},24" stroke="${C.skinD}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".6"/>` +
      `<path d="M${th * 14},14 Q${th * 4},36 ${th * 6},44" stroke="${C.skinD}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".5"/>`;
  } else {
    for (let i = 0; i < 4; i++) under += `<circle cx="${f(bx[i])}" cy="42" r="2.2" fill="${C.skinD}" opacity=".35"/>`;
  }
  let over = '';
  // draw pinky first so the index finger overlaps correctly
  for (const i of [3, 2, 1, 0]) over += finger(bx[i], 44, ang[i], lens[i], 11.6, curl[i] ?? 0.15, !palmView);
  // thumb: base on the palm side edge
  const tOut = h.thumbOut ?? 0.5;
  const t1 = 24 + tOut * 36;                         // angle away from fingers axis
  const base = [th * 19, 20];
  const a1 = rad(t1) * th;
  const m = [base[0] + Math.sin(a1) * 25, base[1] + Math.cos(a1) * 25];
  const a2 = rad(t1 - 14) * th;
  const tip = [m[0] + Math.sin(a2) * 23, m[1] + Math.cos(a2) * 23];
  const td = `M${f(base[0])},${f(base[1])} L${f(m[0])},${f(m[1])} L${f(tip[0])},${f(tip[1])}`;
  const thumbSvg = `<path d="${td}" fill="none" stroke="${C.skinD}" stroke-width="17.4" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${td}" fill="none" stroke="${C.skin}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="M${f(m[0] - 5)},${f(m[1])} q5,3 10,0" stroke="${C.skinD}" stroke-width="1.5" fill="none" opacity=".7"/>` +
    (!palmView ? `<ellipse cx="${f(tip[0] - Math.sin(a2) * 5)}" cy="${f(tip[1] - Math.cos(a2) * 5)}" rx="4.4" ry="5.2" transform="rotate(${f(-a2 * 180 / Math.PI)} ${f(tip[0] - Math.sin(a2) * 5)} ${f(tip[1] - Math.cos(a2) * 5)})" fill="${C.skinL}" stroke="${C.skinD}" stroke-width="1.1"/>` : '');
  // palm-view: thumb in front of palm; back-view: thumb behind fingers
  const wrap = (s) => `<g transform="translate(${f(h.x)} ${f(h.y)}) rotate(${f(h.rot)}) scale(${sc})">${s}</g>`;
  if (palmView) return { under: wrap(under), over: wrap(over + thumbSvg) };
  return { under: wrap(thumbSvg + under), over: wrap(over) };
}

// ---------- arm ----------
export function arm(side, a) {
  // side: -1 = screen-left, +1 = screen-right
  const S = [side * SH, 8];
  const E = pt(S, a.a1, L1 * (a.us ?? 1));
  const W = pt(E, a.a2, L2 * (a.fs ?? 1));
  const cuffT = 0.52;
  const C1 = [E[0] + (W[0] - E[0]) * cuffT, E[1] + (W[1] - E[1]) * cuffT];
  const rot = -a.a2 + (a.hand?.twist ?? 0);
  const hh = { ...a.hand, x: W[0], y: W[1], rot };
  if (a.hand?.thumbSide) {
    // choose which local side the thumb sits on so it ends up 'in' (toward body), 'out', 'up' or 'down' on screen
    const cx = Math.cos(rad(rot)), cy = Math.sin(rad(rot));   // screen direction of local +x
    const want = { in: [-side, 0], out: [side, 0], up: [0, -1], down: [0, 1] }[a.hand.thumbSide];
    hh.thumb = (cx * want[0] + cy * want[1]) >= 0 ? 1 : -1;
  }
  const H = hand(hh);
  const sleeves =
    `<path d="${taper(S, E, 58, 48)}" fill="${SLEEVE}"/>` +
    `<path d="${taper(E, C1, 48, 42)}" fill="${SLEEVE}"/>` +
    `<path d="${taper(C1, W, 31, 26)}" fill="${C.skin}" stroke="${C.skinD}" stroke-width="2.2"/>` +
    `<path d="${taper(E, C1, 46, 40).replace(/Z$/, 'Z')}" fill="none"/>` +
    `<circle cx="${f(S[0])}" cy="${f(S[1])}" r="31" fill="${SLEEVE}"/>` +
    `<circle cx="${f(E[0])}" cy="${f(E[1])}" r="24" fill="${SLEEVE}"/>` +
    // rolled cuff band
    `<path d="${taper(pt(C1, a.a2, -9), pt(C1, a.a2, 9), 43, 43)}" fill="${CUFF}"/>` +
    // soft fold highlight on the upper arm
    `<path d="${taper(pt(S, a.a1, 22), pt(E, a.a1, -22), 10, 8)}" fill="${C.navy3}" opacity=".35"/>`;
  return { sleeves, under: H.under, over: H.over, S, E, W };
}

// ---------- head ----------
function brow(x, y, raise, tilt, mirror) {
  const t = tilt * mirror;
  return `<path d="M${f(x - 20)},${f(y + raise * -7 + t * 6)} Q${f(x)},${f(y - 8 + raise * -7)} ${f(x + 20)},${f(y + raise * -7 - t * 6)}" stroke="${C.hair}" stroke-width="7.5" fill="none" stroke-linecap="round"/>`;
}
function eye(x, y, lx, ly, blink, squint) {
  const ry = Math.max(0.6, 11.5 * (1 - blink) * (1 - squint * 0.35));
  const clip = `M${f(x - 15)},${y} Q${f(x)},${f(y - ry * 1.9)} ${f(x + 15)},${y} Q${f(x)},${f(y + ry * 1.5)} ${f(x - 15)},${y}Z`;
  if (blink > 0.85) return `<path d="M${f(x - 14)},${y} Q${f(x)},${y + 5} ${f(x + 14)},${y}" stroke="${C.hair}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`;
  return `<path d="${clip}" fill="#fff" stroke="${C.hair}" stroke-width="2"/>` +
    `<circle cx="${f(x + lx * 6)}" cy="${f(y + ly * 4)}" r="7.2" fill="#4A2E1E"/><circle cx="${f(x + lx * 6)}" cy="${f(y + ly * 4)}" r="3.6" fill="#120A06"/>` +
    `<circle cx="${f(x + lx * 6 + 2.4)}" cy="${f(y + ly * 4 - 2.6)}" r="1.9" fill="#fff"/>`;
}
function mouth(m) {
  const w = m.w ?? 24, o = m.open ?? 0, c = m.curve ?? 0.6;
  const y0 = 0;
  const cy = c * 26;
  const top = `M${-w},${y0} Q0,${f(cy + y0)} ${w},${y0}`;
  if (o < 0.04) {
    return `<path d="${top}" stroke="#5A2323" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  }
  const ob = o * 34;
  const full = `M${-w},${y0} Q0,${f(cy)} ${w},${y0} Q0,${f(cy + ob + 6)} ${-w},${y0}Z`;
  return `<path d="${full}" fill="#5B1F25" stroke="#3A1216" stroke-width="2.4" stroke-linejoin="round"/>` +
    `<path d="M${-w * 0.86},${y0 + 1.2} Q0,${f(cy + 1.6)} ${w * 0.86},${y0 + 1.2} Q0,${f(cy + ob * 0.45 + 2)} ${-w * 0.86},${y0 + 1.2}Z" fill="#FFF8EC"/>` +
    `<ellipse cx="0" cy="${f((cy + ob + 6) / 2 - 3.5)}" rx="${f(w * 0.45)}" ry="${f(Math.max(1, ob * 0.16))}" fill="#D9606B"/>`;
}

export function head(p, t) {
  const blinkPhase = (t % 3.2);
  const blink = blinkPhase > 3.05 ? 1 - Math.abs(blinkPhase - 3.125) / 0.075 : 0;
  const bl = Math.max(0, Math.min(1, blink));
  const hd = p.head ?? {};
  const look = p.look ?? { x: 0, y: 0 };
  const m = p.mouth ?? { open: 0, curve: 0.6 };
  const br = p.brow ?? 0, bt = p.browTilt ?? 0;
  return `<g transform="translate(${f(hd.dx ?? 0)} ${f(hd.dy ?? 0)}) rotate(${f(hd.tilt ?? 0)} 0 -64)">
    <path d="M-30,-66 L-30,-20 Q0,-6 30,-20 L30,-66Z" fill="${C.skin}" stroke="${C.skinD}" stroke-width="2.4"/>
    <path d="M-30,-48 Q0,-30 30,-48 L30,-62 L-30,-62Z" fill="${C.skinD}" opacity=".35"/>
    <ellipse cx="-67" cy="-158" rx="12" ry="20" fill="${C.skin}" stroke="${C.skinD}" stroke-width="2.4"/>
    <ellipse cx="67" cy="-158" rx="12" ry="20" fill="${C.skin}" stroke="${C.skinD}" stroke-width="2.4"/>
    <path d="M-66,-178 C-66,-250 66,-250 66,-178 L62,-124 C58,-90 30,-66 0,-64 C-30,-66 -58,-90 -62,-124Z" fill="${C.skin}" stroke="${C.skinD}" stroke-width="2.6" stroke-linejoin="round"/>
    <ellipse cx="-38" cy="-128" rx="15" ry="9" fill="${C.coral}" opacity=".16"/><ellipse cx="38" cy="-128" rx="15" ry="9" fill="${C.coral}" opacity=".16"/>
    <path d="M-65,-172 C-70,-252 70,-252 65,-172 C58,-206 38,-222 6,-222 C-26,-224 -54,-212 -65,-172Z" fill="${C.hair}"/>
    <path d="M-52,-208 C-30,-236 24,-240 54,-206 C28,-222 -22,-226 -52,-208Z" fill="#4A3329" opacity=".55"/>
    <path d="M-64,-150 C-64,-100 -36,-68 0,-64 C36,-68 64,-100 64,-150 C60,-122 50,-110 38,-104 C24,-112 -24,-112 -38,-104 C-50,-110 -60,-122 -64,-150Z" fill="${C.hair}"/>
    <path d="M-34,-110 Q-16,-120 0,-112 Q16,-120 34,-110 Q16,-104 0,-106 Q-16,-104 -34,-110Z" fill="${C.hair}"/>
    <path d="M0,-170 C-4,-150 -9,-140 -8,-130 Q0,-124 9,-130" fill="none" stroke="${C.skinD}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>
    ${eye(-27, -166, look.x, look.y, bl, p.squint ?? 0)}${eye(27, -166, look.x, look.y, bl, p.squint ?? 0)}
    ${brow(-27, -190, br, bt, -1)}${brow(27, -190, br, bt, 1)}
    <g transform="translate(0 ${f(-93 + (m.dy ?? 0))})">${mouth(m)}</g>
  </g>`;
}

// ---------- full figure ----------
// pose: {armL:{a1,a2,fs,hand}, armR:{...}, head, look, mouth, brow, browTilt, sy(torso bob), sx}
// hooks: {L:(arm)=>svg drawn between palm and fingers, R:..., behind:()=>svg drawn before the body}
export function man(pose, t, hooks = {}) {
  const bob = Math.sin(t * 2.1) * 3.2;
  const armL = arm(-1, pose.armL), armR = arm(1, pose.armR);
  const torso = `
    <path d="M-128,320 L-6,320 L-12,780 L-116,780Z" fill="#C9A56B" stroke="#9E7B45" stroke-width="3" stroke-linejoin="round"/>
    <path d="M128,320 L6,320 L12,780 L116,780Z" fill="#C9A56B" stroke="#9E7B45" stroke-width="3" stroke-linejoin="round"/>
    <path d="M-70,360 Q-60,520 -64,780 M70,360 Q60,520 64,780" stroke="#B48C52" stroke-width="5" fill="none" opacity=".6"/>
    <path d="M-148,16 C-150,-18 -112,-28 -70,-30 L-34,-36 Q0,-28 34,-36 L70,-30 C112,-28 150,-18 148,16 L150,86 L144,372 L-144,372 L-150,86Z" fill="${C.navy2}"/>
    <path d="M-148,16 C-150,-18 -112,-28 -70,-30 L-34,-36 L-30,-30 C-70,-20 -120,-14 -142,22Z" fill="${C.navy3}" opacity=".55"/>
    <path d="M-36,-36 Q0,-24 36,-36 L52,372 L-52,372Z" fill="${C.ivory}"/>
    <rect x="-52" y="338" width="104" height="24" fill="#6B4524"/><rect x="-14" y="341" width="28" height="18" rx="3" fill="${C.gold}" stroke="${C.goldD}" stroke-width="2"/>
    <path d="M-34,-36 Q0,-26 34,-36 Q22,-8 0,34 Q-22,-8 -34,-36Z" fill="${C.ivory2}"/>
    <path d="M-38,-38 L-84,-8 L-60,70 L-8,6 L-24,-18Z" fill="${C.navy}"/>
    <path d="M38,-38 L84,-8 L60,70 L8,6 L24,-18Z" fill="${C.navy}"/>
    <path d="M-60,70 L-52,372 L-72,372 L-84,100Z" fill="${C.navy}" opacity=".5"/>
    <path d="M60,70 L52,372 L72,372 L84,100Z" fill="${C.navy}" opacity=".5"/>
    <circle cx="0" cy="130" r="5" fill="${C.gold}"/><circle cx="0" cy="210" r="5" fill="${C.gold}"/><circle cx="0" cy="290" r="5" fill="${C.gold}"/>
    <path d="M-60,160 L-100,174 L-96,214 L-60,206Z" fill="${C.navy}" stroke="${C.navy3}" stroke-width="2.5"/>`;
  const body = `<g transform="translate(${f(pose.sx ?? 0)} ${f(bob)})">
    ${hooks.behind ? hooks.behind() : ''}
    ${torso}
    ${head(pose, t)}
    ${armL.sleeves}${armR.sleeves}
    ${hooks.mid ? hooks.mid(armL, armR) : ''}
    ${armL.under}${hooks.L ? hooks.L(armL) : ''}${armL.over}
    ${armR.under}${hooks.R ? hooks.R(armR) : ''}${armR.over}
  </g>`;
  return { svg: body, armL, armR };
}

export const REST_L = { a1: -7, a2: -3, fs: 1, hand: { type: 'open', curl: [0.2, 0.25, 0.3, 0.36], spread: 0.6, thumb: 1, thumbOut: 0.25, facing: 'back' } };
export const REST_R = { a1: 7, a2: 3, fs: 1, hand: { type: 'open', curl: [0.2, 0.25, 0.3, 0.36], spread: 0.6, thumb: -1, thumbOut: 0.25, facing: 'back' } };
