// Scene art. Every function is pure: (t absolute seconds) -> SVG string.
import { C, f, clamp, seg, smooth, easeOut, pop, poseAt, rad } from './util.js';
import { man, REST_L, REST_R } from './man.js';
import { coin, sparkle, apple, bag, basket, gadgetBox, iconBooks, iconFood, iconGame, iconTravel, bust } from './props.js';
import { CLIPS, PAUSE, SCENES } from './timeline.js';
const SC = (id) => SCENES.find(s => s.id === id).t0;

const speaking = (t) => CLIPS.some(c => c.lang === 'en' && t >= c.start && t <= c.start + c.dur);
const talk = (t, amt = 0.55) => { const w = Math.abs(Math.sin(t * 13.5)) * Math.abs(Math.sin(t * 5.3 + 1)); return amt * (0.25 + 0.75 * w); };
const esTalk = (t) => CLIPS.some(c => c.lang === 'es' && t >= c.start && t <= c.start + c.dur);
const mouthFor = (t, base = { open: 0, curve: 0.7 }) => {
  const talking = speaking(t) || esTalk(t);
  return talking ? { open: talk(t), curve: 0.55, w: 22 } : base;
};
const OPEN = (o) => ({ type: 'open', curl: [0.1, 0.12, 0.16, 0.22], spread: 1, thumbOut: 0.55, facing: 'palm', ...o });
const fade = (color, y0 = 1300, y1 = 1440) => `<defs><linearGradient id="ff${color.slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset="1" stop-color="${color}"/></linearGradient></defs><rect y="${y0}" width="1080" height="${y1 - y0}" fill="url(#ff${color.slice(1)})"/><rect y="${y1 - 1}" width="1080" height="${1921 - y1}" fill="${color}"/>`;
const bgRect = (c1, c2, id) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="1080" height="1920" fill="url(#${id})"/>`;

// ---------- 1. HOOK ----------
function storefront(x, y, w, col, t, seed) {
  let stripes = '';
  const n = 8, sw = w / n;
  for (let i = 0; i < n; i++) stripes += `<path d="M${f(x + i * sw)},${y} h${f(sw)} l${f(i % 2 ? 6 : -6)},58 h${f(-sw)}Z" fill="${i % 2 ? C.ivory : col}"/>`;
  return `<g><rect x="${x}" y="${y + 50}" width="${w}" height="330" fill="#0F2B55"/><rect x="${x + 22}" y="${y + 112}" width="${w - 44}" height="190" rx="10" fill="#183F7A" stroke="#2A5CA8" stroke-width="4"/>
  <path d="M${x + 22},${y + 112} l${f((w - 44) * .45)},0 l-60,190 h-${f((w - 44) * .15)}Z" fill="#fff" opacity=".07"/>
  ${stripes}<path d="M${x},${y + 58} h${w}" stroke="${col}" stroke-width="6" opacity=".5"/>
  <g transform="translate(${x + w / 2} ${y + 208})">${seed === 0 ? `<rect x="-70" y="-30" width="60" height="70" rx="8" fill="${C.coral}"/><rect x="10" y="-10" width="60" height="50" rx="8" fill="${C.gold}"/>` : seed === 1 ? `<circle cx="-40" cy="10" r="30" fill="#E5343A"/><circle cx="26" cy="14" r="26" fill="#FF9A2E"/><circle cx="70" cy="22" r="20" fill="#58B957"/>` : `<rect x="-62" y="-6" width="124" height="46" rx="10" fill="${C.teal}"/><circle cx="0" cy="-20" r="22" fill="${C.ivory}"/>`}</g></g>`;
}
export function sceneHook(t, mode) {
  const drift = t * 6;
  let far = '';
  for (let i = 0; i < 9; i++) { const h = 170 + ((i * 53) % 130); far += `<rect x="${f(-60 + i * 140 - drift % 140)}" y="${f(1060 - h)}" width="108" height="${h}" fill="#143868" opacity=".8"/>`; for (let r = 0; r < 4; r++) far += `<rect x="${f(-44 + i * 140 - drift % 140)}" y="${f(1090 - h + r * 38)}" width="22" height="22" rx="4" fill="${C.gold}" opacity="${(i + r) % 3 ? .18 : .55}"/>`; }
  let coins = '';
  [[120, 760, 24], [960, 700, 30], [900, 1010, 22], [170, 1000, 20]].forEach((c, i) => { coins += coin(c[0], c[1] + Math.sin(t * 2 + i) * 14, c[2], Math.sin(t * 1.6 + i) * 20); });
  const bg = bgRect('#0B2347', '#0E6F86', 'g1') +
    `<circle cx="540" cy="820" r="${f(420 + Math.sin(t * 1.5) * 8)}" fill="${C.gold}" opacity=".16"/>` + far +
    `<g transform="translate(${f(-Math.sin(t * .6) * 6)} 0)">${storefront(-30, 930, 380, C.coral, t, 0)}${storefront(370, 930, 340, C.emerald, t, 1)}${storefront(750, 930, 380, C.gold, t, 2)}</g>` +
    `<rect y="1262" width="1080" height="660" fill="#0A1E3F"/><rect y="1262" width="1080" height="10" fill="${C.teal}" opacity=".6"/>` + Array.from({length:6},(_,i)=>`<path d="M${f(-100+i*260-((t*40)%260))},1900 L${f(240+i*260-((t*40)%260)-120)},1300" stroke="#fff" stroke-opacity=".05" stroke-width="8"/>`).join('') + coins;
  const k = [
    { t: 0, armL: { a1: -9, a2: -6, fs: 1, hand: { type: 'grip', thumb: 1 } }, armR: { a1: 16, a2: 148, fs: .95, hand: OPEN({ thumbSide: 'in', spread: 1.3 }) }, head: { tilt: 3, dx: 0, dy: 0 }, brow: .7, browTilt: .2, look: { x: .3, y: -.2 } },
    { t: 1.5, armL: { a1: -9, a2: -6, fs: 1, hand: { type: 'grip', thumb: 1 } }, armR: { a1: 22, a2: 128, fs: .95, hand: OPEN({ thumbSide: 'in', spread: 1.3 }) }, head: { tilt: -4, dx: 0, dy: 0 }, brow: .9, browTilt: .35, look: { x: -.3, y: -.3 } },
    { t: 3.7, armL: { a1: -9, a2: -6, fs: 1, hand: { type: 'grip', thumb: 1 } }, armR: { a1: 14, a2: 160, fs: .95, hand: OPEN({ thumbSide: 'in', spread: 1.3 }) }, head: { tilt: 4, dx: 0, dy: 0 }, brow: .5, browTilt: .1, look: { x: 0, y: 0 } },
  ];
  const pose = { ...poseAt(k, t), mouth: mouthFor(t, { open: 0.15, curve: 0.8 }) };
  const hooks = { L: (A) => { const d = rad(A.W && -0); const g = [A.W[0] - 2, A.W[1] + 46]; return bag(g[0], g[1], Math.sin(t * 2.2) * 2.5, 150, 130); } };
  const m = man(pose, t, hooks);
  return bg + `<g transform="translate(540 850) scale(.9)">${m.svg}</g>` + fade('#0A1E3F', 1370, 1480);
}

// ---------- 2. SPEND (groceries) ----------
export function sceneSpend(t, mode) {
  const lt = t - SC('spend');
  let crates = '';
  const produce = [[C.coral, '#E5343A'], ['#FF9A2E', '#D9731A'], ['#58B957', '#2F8A3D'], ['#F7E04B', '#C9AE1F']];
  for (let row = 0; row < 3; row++) {
    crates += `<rect x="0" y="${300 + row * 190}" width="1080" height="14" fill="#C69B5A"/>`;
    for (let i = 0; i < 12; i++) {
      const p = produce[(i + row) % 4];
      crates += `<circle cx="${60 + i * 92}" cy="${272 + row * 190 + ((i * 7) % 3) * 4}" r="${28 + (i % 2) * 3}" fill="${p[0]}" stroke="${p[1]}" stroke-width="4"/><circle cx="${f(50 + i * 92)}" cy="${f(262 + row * 190)}" r="7" fill="#fff" opacity=".4"/>`;
    }
  }
  let tiles = '';
  for (let r = 0; r < 14; r++) for (let c = -2; c < 9; c++) tiles += `<path d="M${f(c * 150 - r * 25)},${1010 + r * 62} h150 v62 h-150Z" fill="${(r + c) % 2 ? '#E6D6B3' : '#F3E7C9'}"/>`;
  const sway = Math.sin(t * 2.3) * 2;
  let coins = '';
  // coins flow out from the hand toward the shelves ("spend")
  for (let i = 0; i < 4; i++) {
    const u = ((lt - 0.9 - i * 0.28) % 1.4) / 1.4;
    if (lt > 0.9 && u > 0) { const x = 780 + u * 250, y = 880 - Math.sin(u * Math.PI) * 200 - u * 90; coins += coin(x, y, 24 * (1 - u * .25), u * 540) + (u > .75 ? sparkle(x + 24, y - 18, 14, 1 - (u - .75) * 3) : ''); }
  }
  const bg = bgRect('#16866F', '#0E5E78', 'g2') +
    `<rect y="150" width="1080" height="720" fill="#F8EBCB"/><rect y="150" width="1080" height="140" fill="${C.teal}"/>` +
    `<g transform="translate(540 185)"><rect x="-250" y="-44" width="500" height="88" rx="22" fill="${C.ivory}" stroke="${C.navy}" stroke-width="6"/><text y="20" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="54" fill="${C.emerald}">FRESH MARKET</text></g>` +
    crates + `<rect y="880" width="1080" height="150" fill="#E2C690"/>` + tiles +
    [150, 540, 930].map(x => `<g><path d="M${x},130 v-0" /><circle cx="${x}" cy="150" r="14" fill="#FFF3B0"/></g>`).join('') + coins;
  const k = [
    { t: 0, armL: { a1: -8, a2: -4, fs: 1, hand: { type: 'grip', thumb: 1 } }, armR: { a1: 20, a2: 20, fs: .9, hand: OPEN({ thumbSide: 'in', facing: 'back', curl: [.3, .32, .38, .42], thumbOut: .3 }) }, head: { tilt: 2 }, brow: .3, look: { x: .2, y: .3 } },
    { t: 1.0, armL: { a1: -8, a2: -4, fs: 1, hand: { type: 'grip', thumb: 1 } }, armR: { a1: 26, a2: 168, fs: .88, hand: OPEN({ thumbSide: 'in', facing: 'palm', curl: [.5, .52, .56, .6], thumbOut: .9, spread: .8 }) }, head: { tilt: -3 }, brow: .5, look: { x: .5, y: -.1 } },
    { t: 3.0, armL: { a1: -8, a2: -4, fs: 1, hand: { type: 'grip', thumb: 1 } }, armR: { a1: 24, a2: 172, fs: .88, hand: OPEN({ thumbSide: 'in', facing: 'palm', curl: [.5, .52, .56, .6], thumbOut: .9, spread: .8 }) }, head: { tilt: 2 }, brow: .4, look: { x: 0, y: 0 } },
    { t: 6.6, armL: { a1: -8, a2: -4, fs: 1, hand: { type: 'grip', thumb: 1 } }, armR: { a1: 22, a2: 168, fs: .88, hand: OPEN({ thumbSide: 'in', facing: 'palm', curl: [.5, .52, .56, .6], thumbOut: .9, spread: .8 }) }, head: { tilt: -2 }, brow: .3, look: { x: 0, y: 0 } },
  ];
  const pose = { ...poseAt(k, lt), mouth: mouthFor(t, { open: 0, curve: 0.9 }) };
  const hooks = {
    L: (A) => basket(A.W[0] - 2, A.W[1] + 46, sway),
    R: (A) => { const d = [Math.sin(rad(pose.armR.a2)), Math.cos(rad(pose.armR.a2))]; return apple(A.W[0] + d[0] * 64, A.W[1] + d[1] * 64, 36, sway * 3); },
  };
  const m = man(pose, t, hooks);
  const enter = 1 - easeOut(seg(lt, 0, .45));
  return bg + `<g transform="translate(${f(540 + enter * 300)} 850) scale(.88)">${m.svg}</g>` + fade('#ECDFBE');
}

// ---------- 3. WASTE (unused gadget) ----------
export function sceneWaste(t, mode) {
  const lt = t - SC('waste');
  let shelf = '';
  const plants = [[160, C.emerald], [880, C.teal]];
  let books = '';
  const cols = [C.coral, C.teal, C.gold, C.navy3, C.emerald, C.coralD];
  for (let i = 0; i < 9; i++) { const h = 60 + (i * 17) % 34; books += `<rect x="${720 + i * 36}" y="${760 - h}" width="32" height="${h}" rx="3" fill="${cols[i % 6]}"/>`; }
  const motes = Array.from({ length: 9 }, (_, i) => `<circle cx="${f(150 + i * 110 + Math.sin(t * .8 + i) * 18)}" cy="${f(300 + ((i * 97 + t * 20) % 600))}" r="${3 + i % 3}" fill="#fff" opacity=".35"/>`).join('');
  const sunset = `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB86B"/><stop offset="1" stop-color="#FF7A59"/></linearGradient></defs>`;
  const bg = bgRect('#F7E7C6', '#EBD6A9', 'g3') + sunset +
    `<rect y="150" width="1080" height="1100" fill="#F6E6C4"/>` +
    Array.from({ length: 12 }, (_, i) => `<circle cx="${60 + i * 95}" cy="${200 + (i % 2) * 70}" r="9" fill="${C.gold}" opacity=".18"/>`).join('') +
    `<rect y="1000" width="1080" height="400" fill="${C.navy2}"/><rect y="992" width="1080" height="14" fill="${C.gold}"/>` +
    `<g transform="translate(50 620)"><rect width="300" height="340" rx="22" fill="${C.navy}"/><rect x="16" y="16" width="268" height="308" rx="12" fill="url(#sk)"/><circle cx="190" cy="236" r="56" fill="#FFE29A"/><path d="M16,310 L110,214 L172,276 L230,228 L284,296 L284,324 L16,324Z" fill="#7C3A5B"/><path d="M150,16 V324 M16,170 H284" stroke="${C.navy}" stroke-width="11"/></g>` +
    `<rect x="720" y="760" width="340" height="14" rx="5" fill="#B07C3A"/>${books}` +
    `<g transform="translate(980 700)"><path d="M-22,0 L22,0 L16,40 L-16,40Z" fill="${C.coral}"/><path d="M0,0 Q-40,-30 -32,-64 Q-8,-40 0,0 Q8,-52 36,-60 Q34,-24 0,0Z" fill="${C.emerald}" stroke="${C.emeraldD}" stroke-width="3"/></g>` +
    `<g transform="translate(120 150)"><path d="M0,0 V120" stroke="${C.navy}" stroke-width="6"/><path d="M-50,170 Q0,100 50,170Z" fill="${C.gold}" stroke="${C.goldD}" stroke-width="5"/><circle cx="0" cy="172" r="12" fill="#FFF3B0"/></g>` + motes;
  const holdEnd = 3.3;       // seconds into scene when the box is set down
  const k = [
    { t: 0, armL: { a1: -12, a2: 14, fs: .8, hand: OPEN({ thumbSide: 'up', facing: 'back', curl: [.55, .58, .62, .66], thumbOut: .25 }) }, armR: { a1: 12, a2: -14, fs: .8, hand: OPEN({ thumbSide: 'up', facing: 'back', curl: [.55, .58, .62, .66], thumbOut: .25 }) }, head: { tilt: 0, dy: 6 }, brow: .1, browTilt: .5, look: { x: 0, y: .8 } },
    { t: 1.6, armL: { a1: -12, a2: 14, fs: .8, hand: OPEN({ thumbSide: 'up', facing: 'back', curl: [.55, .58, .62, .66], thumbOut: .25 }) }, armR: { a1: 12, a2: -14, fs: .8, hand: OPEN({ thumbSide: 'up', facing: 'back', curl: [.55, .58, .62, .66], thumbOut: .25 }) }, head: { tilt: 5, dy: 0 }, brow: .5, browTilt: .6, look: { x: 0, y: 0 }, squint: .3 },
    { t: 3.0, armL: { a1: -12, a2: 14, fs: .8, hand: OPEN({ thumbSide: 'up', facing: 'back', curl: [.55, .58, .62, .66], thumbOut: .25 }) }, armR: { a1: 12, a2: -14, fs: .8, hand: OPEN({ thumbSide: 'up', facing: 'back', curl: [.55, .58, .62, .66], thumbOut: .25 }) }, head: { tilt: 6 }, brow: .6, browTilt: .6, look: { x: -.4, y: 0 } },
    // set the box down, then an easy open-palm shrug
    { t: 3.7, armL: { a1: -20, a2: -70, fs: .96, hand: OPEN({ thumbSide: 'in', facing: 'palm', curl: [.2, .22, .26, .3], thumbOut: .7 }) }, armR: { a1: 20, a2: 70, fs: .96, hand: OPEN({ thumbSide: 'in', facing: 'palm', curl: [.2, .22, .26, .3], thumbOut: .7 }) }, head: { tilt: -5 }, brow: .8, browTilt: .6, look: { x: 0, y: 0 } },
    { t: 5.2, armL: { a1: -22, a2: -86, fs: .96, hand: OPEN({ thumbSide: 'in', facing: 'palm', curl: [.22, .24, .28, .32], thumbOut: .7 }) }, armR: { a1: 22, a2: 86, fs: .96, hand: OPEN({ thumbSide: 'in', facing: 'palm', curl: [.22, .24, .28, .32], thumbOut: .7 }) }, head: { tilt: 5 }, brow: .5, browTilt: .6, look: { x: 0, y: 0 } },
    { t: 6.7, armL: { a1: -20, a2: -76, fs: .96, hand: OPEN({ thumbSide: 'in', facing: 'palm', curl: [.2, .22, .26, .3], thumbOut: .7 }) }, armR: { a1: 20, a2: 76, fs: .96, hand: OPEN({ thumbSide: 'in', facing: 'palm', curl: [.2, .22, .26, .3], thumbOut: .7 }) }, head: { tilt: -2 }, brow: .4, browTilt: .5, look: { x: 0, y: 0 } },
  ];
  const sad = lt > 2.8 ? { open: 0, curve: 0.25 } : { open: 0, curve: 0.55 };
  const pose = { ...poseAt(k, lt), mouth: mouthFor(t, sad) };
  const held = lt < holdEnd;
  const hooks = { mid: (A, B) => held ? gadgetBox((A.W[0] + B.W[0]) / 2, (A.W[1] + B.W[1]) / 2 - 8, Math.sin(lt * 1.4) * 3 - (lt > 1 ? 3 : 0), .95) : '' };
  const m = man(pose, t, hooks);
  const drop = smooth(seg(lt, holdEnd, holdEnd + .55));
  const settled = lt >= holdEnd;
  const boxY = 1215 - (1 - drop) * 70 + (settled ? Math.sin(seg(lt, holdEnd + .4, holdEnd + .8) * Math.PI) * -10 : 0);
  const table = `<rect x="-40" y="1215" width="1160" height="720" fill="#8C5A2B"/>${Array.from({length:8},(_,i)=>`<path d="M-40,${1290+i*80} H1120" stroke="#6E4420" stroke-width="4" opacity=".5"/>`).join('')}<rect x="-40" y="1209" width="1160" height="22" fill="#C58B45"/>`;
  const dust = lt > holdEnd + .7 ? `<g opacity="${f(smooth(seg(lt, holdEnd + .7, holdEnd + 1.4)))}"><path d="M400,1040 q40,-30 80,0 M600,1020 q40,-30 80,0" stroke="#C9B38A" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="660" cy="1070" r="5" fill="#fff" opacity=".6"/></g>` : '';
  const boxOnTable = settled ? `<g>${gadgetBox(540, boxY - 100, -4, 1.0)}${dust}</g>` : '';
  const enter = 1 - easeOut(seg(lt, 0, .45));
  return bg + `<g transform="translate(${f(540 - enter * 300)} 850) scale(.9)">${m.svg}</g>` + table + boxOnTable;
}

// ---------- 4. SPEAK ----------
export function sceneSpeak(t, mode) {
  const lt = t - SC('speak');
  let rays = '';
  for (let i = 0; i < 14; i++) rays += `<path d="M540,860 L${f(540 + Math.cos(i * Math.PI / 7 + t * .06) * 1200)},${f(860 + Math.sin(i * Math.PI / 7 + t * .06) * 1200)} L${f(540 + Math.cos((i + .5) * Math.PI / 7 + t * .06) * 1200)},${f(860 + Math.sin((i + .5) * Math.PI / 7 + t * .06) * 1200)}Z" fill="#fff" opacity=".035"/>`;
  let conf = '';
  for (let i = 0; i < 16; i++) conf += sparkle(60 + (i * 197) % 960, 520 + ((i * 131 + t * 18) % 600), 8 + (i % 3) * 3, .6);
  const bg = bgRect('#0B2347', '#0E6F86', 'g4') + rays + conf;
  const icons = [[iconBooks(), C.ivory, 'a'], [iconFood(), C.ivory, 'b'], [iconGame(), C.ivory, 'c'], [iconTravel(), C.ivory, 'd']];
  let cards = '';
  const cyc = (lt - 1.2) / 0.85;
  icons.forEach((ic, i) => {
    const sc = pop(lt, 0.3 + i * 0.18, .5);
    const hot = lt > 1.2 && Math.floor(cyc) % 4 === i && lt < 4.9 ? Math.sin((cyc % 1) * Math.PI) : 0;
    const x = 540 + (i - 1.5) * 222;
    const bob = Math.sin(t * 2.2 + i) * 6;
    cards += `<g transform="translate(${f(x)} ${f(335 + bob)}) scale(${f(sc * (1 + hot * .1) * .84)})"><rect x="-108" y="-112" width="216" height="224" rx="36" fill="#000" opacity=".25" transform="translate(5 9)"/><rect x="-108" y="-112" width="216" height="224" rx="36" fill="${ic[1]}" stroke="${hot > .1 ? C.gold : '#fff'}" stroke-width="${f(6 + hot * 6)}"/><g transform="scale(1.02)">${ic[0]}</g></g>`;
  });
  const k = [
    { t: 0, armL: { a1: -14, a2: -150, fs: .9, hand: OPEN({ thumbSide: 'in', facing: 'palm', spread: 1.3 }) }, armR: { a1: 38, a2: 120, fs: 1, hand: OPEN({ thumbSide: 'up', facing: 'palm', spread: .9, curl: [.15, .18, .22, .28] }) }, head: { tilt: 3 }, brow: .7, look: { x: 0, y: -.2 } },
    { t: 1.4, armL: { a1: -20, a2: -158, fs: .88, hand: OPEN({ thumbSide: 'in', facing: 'palm', spread: 1.4 }) }, armR: { a1: 46, a2: 112, fs: 1, hand: OPEN({ thumbSide: 'up', facing: 'palm', spread: 1, curl: [.15, .18, .22, .28] }) }, head: { tilt: -3 }, brow: .8, look: { x: .3, y: -.4 } },
    { t: 2.9, armL: { a1: -22, a2: -78, fs: .92, hand: OPEN({ thumbSide: 'in', facing: 'palm', spread: .9, curl: [.2, .22, .26, .3] }) }, armR: { a1: 22, a2: 78, fs: .92, hand: OPEN({ thumbSide: 'in', facing: 'palm', spread: .9, curl: [.2, .22, .26, .3] }) }, head: { tilt: 3 }, brow: .8, look: { x: 0, y: -.1 } },
    { t: 4.4, armL: { a1: -18, a2: -70, fs: .92, hand: OPEN({ thumbSide: 'in', facing: 'palm', spread: .9, curl: [.22, .24, .28, .32] }) }, armR: { a1: 18, a2: 70, fs: .92, hand: OPEN({ thumbSide: 'in', facing: 'palm', spread: .9, curl: [.22, .24, .28, .32] }) }, head: { tilt: -3 }, brow: .9, look: { x: 0, y: -.1 } },
    { t: 6.0, armL: { a1: -22, a2: -78, fs: .92, hand: OPEN({ thumbSide: 'in', facing: 'palm', spread: .9, curl: [.2, .22, .26, .3] }) }, armR: { a1: 22, a2: 78, fs: .92, hand: OPEN({ thumbSide: 'in', facing: 'palm', spread: .9, curl: [.2, .22, .26, .3] }) }, head: { tilt: 2 }, brow: .8, look: { x: 0, y: -.1 } },
  ];
  const inPause = t >= PAUSE.start && t <= PAUSE.end;
  const pose = { ...poseAt(k, lt), mouth: inPause ? { open: 0, curve: 0.9 } : mouthFor(t, { open: 0, curve: 0.85 }) };
  const m = man(pose, t, {});
  // listening rings during the genuine pause
  let rings = '';
  if (inPause) {
    const u = (t - PAUSE.start) / (PAUSE.end - PAUSE.start);
    for (let i = 0; i < 3; i++) { const p = ((t * .8) + i / 3) % 1; rings += `<circle cx="540" cy="790" r="${f(110 + p * 190)}" fill="none" stroke="${C.gold}" stroke-width="${f(8 * (1 - p))}" opacity="${f((1 - p) * .8)}"/>`; }
    const R = 74;
    rings += `<g transform="translate(905 1255)"><circle r="${R}" fill="${C.navy}" opacity=".85"/><circle r="${R}" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="12"/><circle r="${R}" fill="none" stroke="${C.gold}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${f(2 * Math.PI * R)}" stroke-dashoffset="${f(2 * Math.PI * R * u)}" transform="rotate(-90)"/><rect x="-14" y="-34" width="28" height="44" rx="14" fill="#fff"/><path d="M-26,-4 q0,30 26,30 q26,0 26,-30 M0,26 v14 M-14,40 h28" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/></g>`;
  }
  return bg + `<g transform="translate(540 930) scale(.85)">${m.svg}</g>` + fade('#0E6A86', 1320, 1440) + rings + cards;
}

// ---------- 5. CTA ----------
export function sceneCta(t, mode, logoHref) {
  const lt = t - SC('cta');
  const wave = (y, c, o, ph) => `<path d="M0,${y} q135,-40 270,0 t270,0 t270,0 t270,0 V1920 H0Z" fill="${c}" opacity="${o}" transform="translate(${f(Math.sin(t * .7 + ph) * 18)} 0)"/>`;
  const bg = bgRect('#FBF4E4', '#F1E6CC', 'g5') + wave(560, C.teal, .16, 0) + wave(640, C.emerald, .14, 1.4) +
    `<circle cx="940" cy="330" r="150" fill="${C.gold}" opacity=".16"/>`;
  const logoK = pop(lt, 0.05, .6);
  const logo = `<g data-ui="logo" transform="translate(540 440) scale(${f((.92 + logoK * .08) * .86)})" opacity="${f(smooth(seg(lt, 0, .4)))}"><rect x="-370" y="-218" width="740" height="436" rx="44" fill="#fff" stroke="${C.navy}" stroke-opacity=".08" stroke-width="3"/><image href="${logoHref}" x="-352" y="-192" width="704" height="383" preserveAspectRatio="xMidYMid meet"/></g>`;
  // online class scene
  const s = smooth(seg(lt, .35, .95));
  const tile = (x, y, w, h, c, content) => `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${c}"/>${content}</g>`;
  const tileClip = (id, x, y, w, h) => `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14"/></clipPath>`;
  const sx = 340, sy = 700, sw = 400, sh = 250;
  const wob = Math.sin(t * 3) * 2;
  const screen = `<defs>${tileClip('tcA', sx + 10, sy + 10, 250, 230)}${tileClip('tcB', sx + 268, sy + 10, 122, 72)}${tileClip('tcC', sx + 268, sy + 88, 122, 72)}${tileClip('tcD', sx + 268, sy + 166, 122, 72)}</defs>
  <rect x="${sx - 14}" y="${sy - 14}" width="${sw + 28}" height="${sh + 28}" rx="24" fill="${C.navy}"/><rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="14" fill="#CFE9EA"/>
  <g clip-path="url(#tcA)"><rect x="${sx + 10}" y="${sy + 10}" width="250" height="230" fill="#BFE3D6"/>${bust(sx + 135, sy + 118 + wob, .98, { skin: '#E0A57C', skinD: '#B87A52', hair: '#2A1B14', shirt: C.coral, style: 'long' })}</g>
  <g clip-path="url(#tcB)"><rect x="${sx + 268}" y="${sy + 10}" width="122" height="72" fill="#F6D9A0"/>${bust(sx + 329, sy + 52, .4, { skin: '#A86F48', skinD: '#7F4E2C', hair: '#1E140F', shirt: C.teal, glasses: true })}</g>
  <g clip-path="url(#tcC)"><rect x="${sx + 268}" y="${sy + 88}" width="122" height="72" fill="#C9D8F2"/>${bust(sx + 329, sy + 130, .4, { skin: '#E8B48C', skinD: '#B98059', hair: '#4A2A1A', shirt: C.gold, style: 'bun' })}</g>
  <g clip-path="url(#tcD)"><rect x="${sx + 268}" y="${sy + 166}" width="122" height="72" fill="#F2C9C0"/>${bust(sx + 329, sy + 208, .4, { skin: '#C48A5E', skinD: '#966137', hair: '#2A1B14', shirt: C.navy3 })}</g>
  <path d="M${sx - 60},${sy + sh + 14} h${sw + 120} l22,26 h-${sw + 164}Z" fill="#9FB1C9"/><rect x="${sx - 60}" y="${sy + sh + 14}" width="${sw + 120}" height="9" fill="#C6D3E4"/>`;
  const bubble = `<g transform="translate(${sx + 40} ${f(sy - 42 + Math.sin(t * 2) * 4)}) scale(${f(pop(lt, 1.0, .5))})"><path d="M0,0 h150 a28,28 0 0 1 28,28 v22 a28,28 0 0 1 -28,28 h-100 l-34,26 l6,-26 h-20 a28,28 0 0 1 -28,-28 v-22 a28,28 0 0 1 28,-28Z" fill="#fff" stroke="${C.navy}" stroke-width="5" transform="translate(-14 -10) scale(.92)"/><text x="68" y="48" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="38" fill="${C.emerald}">Hello!</text></g>`;
  const phone = `<g transform="translate(${f(836 - (1 - s) * 80)} 760) rotate(8)"><rect x="-64" y="-120" width="128" height="240" rx="26" fill="${C.navy}"/><rect x="-54" y="-104" width="108" height="208" rx="16" fill="#E8F4EE"/><rect x="-44" y="-64" width="82" height="36" rx="16" fill="#fff"/><rect x="-34" y="-14" width="84" height="40" rx="16" fill="${C.emerald}"/><text x="8" y="14" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="19" fill="#fff">INGLÉS</text><rect x="-44" y="-62" width="60" height="26" rx="12" fill="#fff"/></g>`;
  const mug = `<g transform="translate(250 940)"><path d="M0,0 h66 v50 a16,16 0 0 1 -16,16 h-34 a16,16 0 0 1 -16,-16Z" fill="${C.coral}"/><path d="M66,12 q28,0 28,22 q0,22 -28,22" fill="none" stroke="${C.coral}" stroke-width="9"/><path d="M20,-14 q-8,-14 0,-26 M44,-14 q-8,-14 0,-26" stroke="${C.tealD}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/></g>`;
  const headset = `<g transform="translate(236 780)"><path d="M0,70 a62,62 0 0 1 124,0" fill="none" stroke="${C.navy}" stroke-width="12" stroke-linecap="round"/><rect x="-14" y="56" width="28" height="56" rx="12" fill="${C.teal}"/><rect x="110" y="56" width="28" height="56" rx="12" fill="${C.teal}"/></g>`;
  const scene = `<g transform="translate(0 ${f((1 - s) * 60)})" opacity="${f(s)}"><g transform="translate(540 915) scale(1.25) translate(-540 -835)">${screen}${bubble}${phone}${mug}</g></g>`;
  return bg + logo + scene;
}
