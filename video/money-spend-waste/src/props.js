// Illustrated props. All shapes are plain SVG so the animation stays lightweight.
import { C, f, rad } from './util.js';

export function coin(x, y, r, rot = 0) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})"><circle r="${r}" fill="${C.gold}" stroke="${C.goldD}" stroke-width="${f(r * .12)}"/><circle r="${f(r * .68)}" fill="none" stroke="${C.goldD}" stroke-width="${f(r * .09)}" opacity=".6"/><path d="M${f(-r * .22)},${f(-r * .38)} L${f(r * .3)},${f(-r * .38)} M${f(-r * .22)},${f(r * .38)} L${f(r * .3)},${f(r * .38)} M${f(-r * .22)},${f(-r * .38)} Q${f(-r * .42)},0 ${f(-r * .22)},0 L${f(r * .18)},0 Q${f(r * .42)},${f(r * .2)} ${f(r * .18)},${f(r * .38)}" stroke="${C.goldD}" stroke-width="${f(r * .12)}" fill="none" stroke-linecap="round"/></g>`;
}
export function sparkle(x, y, r, o = 1) {
  return `<path transform="translate(${f(x)} ${f(y)})" d="M0,${-r} Q${f(r * .15)},${f(-r * .15)} ${r},0 Q${f(r * .15)},${f(r * .15)} 0,${r} Q${f(-r * .15)},${f(r * .15)} ${-r},0 Q${f(-r * .15)},${f(-r * .15)} 0,${-r}Z" fill="${C.gold}" opacity="${o}"/>`;
}
export function apple(x, y, r = 36, rot = 0) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot})">
  <path d="M0,${-r * .72} C${r * .5},${-r * 1.08} ${r * 1.12},${-r * .5} ${r * .95},${r * .22} C${r * .8},${r * .9} ${r * .35},${r * 1.05} 0,${r * .92} C${-r * .35},${r * 1.05} ${-r * .8},${r * .9} ${-r * .95},${r * .22} C${-r * 1.12},${-r * .5} ${-r * .5},${-r * 1.08} 0,${-r * .72}Z" fill="#E5343A" stroke="#A81F2A" stroke-width="3"/>
  <path d="M${-r * .55},${-r * .35} Q${-r * .7},${r * .05} ${-r * .5},${r * .35}" stroke="#fff" stroke-opacity=".55" stroke-width="${f(r * .14)}" fill="none" stroke-linecap="round"/>
  <path d="M0,${-r * .72} Q${r * .05},${-r * 1.0} ${r * .22},${-r * 1.18}" stroke="#5A3A22" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M${r * .08},${-r * .9} Q${r * .55},${-r * 1.25} ${r * .8},${-r * .95} Q${r * .4},${-r * .7} ${r * .08},${-r * .9}Z" fill="#3FA34D" stroke="#2B7A37" stroke-width="2"/></g>`;
}
function orange(x, y, r) { return `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="#FF9A2E" stroke="#D9731A" stroke-width="3"/><circle cx="${f(x - r * .35)}" cy="${f(y - r * .35)}" r="${f(r * .18)}" fill="#fff" opacity=".45"/>`; }
function lemon(x, y, r) { return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r * 1.2)}" ry="${r}" fill="#F7E04B" stroke="#C9AE1F" stroke-width="3"/>`; }
function lettuce(x, y, r) { return `<g transform="translate(${f(x)} ${f(y)})"><circle r="${r}" fill="#58B957" stroke="#2F8A3D" stroke-width="3"/><path d="M0,${-r} Q${r * .3},0 0,${r} M${-r * .6},${-r * .6} Q${-r * .15},0 ${-r * .6},${r * .6} M${r * .6},${-r * .6} Q${r * .15},0 ${r * .6},${r * .6}" stroke="#A9E39B" stroke-width="3" fill="none"/></g>`; }
function carrot(x, y, rot = 0, len = 60) { return `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot})"><path d="M-9,0 L9,0 L0,${len}Z" fill="#FF8A1F" stroke="#D5650E" stroke-width="2.5" stroke-linejoin="round"/><path d="M-6,${len * .3} h8 M-4,${len * .55} h6" stroke="#D5650E" stroke-width="2"/><path d="M0,0 Q-14,-16 -12,-30 M0,0 Q0,-20 2,-34 M0,0 Q12,-16 14,-28" stroke="#3FA34D" stroke-width="5" fill="none" stroke-linecap="round"/></g>`; }
function baguette(x, y, rot) { return `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot})"><rect x="-14" y="-80" width="28" height="160" rx="14" fill="#E4A957" stroke="#B87A2E" stroke-width="3"/><path d="M-9,-52 l18,10 M-9,-20 l18,10 M-9,12 l18,10 M-9,44 l18,10" stroke="#B87A2E" stroke-width="3.5" stroke-linecap="round"/></g>`; }
function milk(x, y) { return `<g transform="translate(${f(x)} ${f(y)})"><path d="M-22,-40 L22,-40 L22,40 L-22,40Z" fill="#fff" stroke="#9FB5D3" stroke-width="3"/><path d="M-22,-40 L0,-62 L22,-40Z" fill="#DCE8F7" stroke="#9FB5D3" stroke-width="3" stroke-linejoin="round"/><rect x="-22" y="-8" width="44" height="26" fill="${C.teal}"/><circle cx="0" cy="5" r="7" fill="#fff"/></g>`; }
function tomato(x, y, r) { return `<g transform="translate(${f(x)} ${f(y)})"><circle r="${r}" fill="#EF4B3C" stroke="#B02E24" stroke-width="3"/><path d="M-9,-${r - 3} L0,-${r - 10} L9,-${r - 3} M0,-${r - 10} L0,-${r + 4}" stroke="#2F8A3D" stroke-width="4" stroke-linecap="round"/></g>`; }

// handheld shopping bag (paper bag with rope handle); (gx,gy) = point gripped by the fist
export function bag(gx, gy, sway = 0, w = 176, h = 170) {
  const top = gy + 92, x0 = gx - w / 2, x1 = gx + w / 2;
  const strap = `M${f(gx - w * .34)},${top + 6} C${f(gx - w * .36)},${f(gy + 70)} ${f(gx - 12)},${f(gy + 22)} ${f(gx)},${f(gy + 12)} C${f(gx + 12)},${f(gy + 22)} ${f(gx + w * .36)},${f(gy + 70)} ${f(gx + w * .34)},${top + 6}`;
  return `<g transform="rotate(${f(sway)} ${f(gx)} ${f(gy)})">
  <g transform="translate(0 ${top - 30})">
    ${baguette(gx - 46, 8, -14)}${lettuce(gx + 30, 24, 36)}${carrot(gx + 62, 8, 12, 62)}
  </g>
  <path d="M${f(x0)},${top} L${f(x1)},${top} L${f(x1 - 12)},${top + h} Q${f(gx)},${top + h + 14} ${f(x0 + 12)},${top + h}Z" fill="${C.coral}" stroke="${C.coralD}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M${f(x1)},${top} L${f(x1 - 12)},${top + h} L${f(x1 - 46)},${top + h + 8} L${f(x1 - 40)},${top}Z" fill="${C.coralD}" opacity=".35"/>
  <path d="M${f(x0)},${top} L${f(x1)},${top}" stroke="${C.coralD}" stroke-width="8"/>
  <path d="${strap}" fill="none" stroke="${C.goldD}" stroke-width="13" stroke-linecap="round"/>
  <path d="${strap}" fill="none" stroke="${C.gold}" stroke-width="8" stroke-linecap="round"/>
  <g transform="translate(${f(gx - 10)} ${top + h * .55})"><circle r="${f(h * .3)}" fill="${C.ivory}" stroke="${C.coralD}" stroke-width="4"/><path d="M-20,6 Q-6,-22 0,-26 Q6,-22 20,6Z M-20,12 h40" fill="${C.emerald}" stroke="${C.emeraldD}" stroke-width="3" stroke-linejoin="round"/><circle cy="-26" r="4" fill="${C.emeraldD}"/></g>
  </g>`;
}

export function basket(gx, gy, sway = 0) {
  const w = 220, top = gy + 70, h = 100;
  let weave = '';
  for (let i = 0; i < 4; i++) weave += `<path d="M${f(gx - w / 2 + 10 + i * 2)},${top + 22 + i * 20} L${f(gx + w / 2 - 10 - i * 2)},${top + 22 + i * 20}" stroke="#A9702F" stroke-width="3" opacity=".7"/>`;
  for (let i = -5; i <= 5; i++) weave += `<path d="M${f(gx + i * 20)},${top + 6} L${f(gx + i * 16)},${top + h - 6}" stroke="#A9702F" stroke-width="3" opacity=".6"/>`;
  const hd = `M${f(gx - w / 2 + 8)},${top} C${f(gx - w / 2 + 6)},${f(gy + 30)} ${f(gx - 30)},${f(gy + 8)} ${f(gx)},${f(gy + 8)} C${f(gx + 30)},${f(gy + 8)} ${f(gx + w / 2 - 6)},${f(gy + 30)} ${f(gx + w / 2 - 8)},${top}`;
  return `<g transform="rotate(${f(sway)} ${f(gx)} ${f(gy)})">
  <g>${milk(gx - 78, top - 14)}${baguette(gx + 62, top - 18, 22)}${lettuce(gx - 18, top - 8, 38)}${apple(gx + 14, top - 30, 28)}${tomato(gx + 82, top + 6, 24)}${carrot(gx - 40, top - 50, -18, 62)}</g>
  <path d="M${f(gx - w / 2)},${top} L${f(gx + w / 2)},${top} L${f(gx + w / 2 - 22)},${top + h} Q${f(gx)},${top + h + 10} ${f(gx - w / 2 + 22)},${top + h}Z" fill="#D49A4B" stroke="#8D5B22" stroke-width="5" stroke-linejoin="round"/>
  ${weave}
  <path d="M${f(gx - w / 2 - 6)},${top} L${f(gx + w / 2 + 6)},${top}" stroke="#8D5B22" stroke-width="12" stroke-linecap="round"/>
  <path d="${hd}" fill="none" stroke="#6E4418" stroke-width="15" stroke-linecap="round"/>
  <path d="${hd}" fill="none" stroke="#B9782F" stroke-width="9" stroke-linecap="round"/></g>`;
}

// boxed gadget: smart "ring light" style gadget with sealed film; held at (cx,cy)
export function gadgetBox(cx, cy, tilt = 0, s = 1) {
  const w = 250, h = 190;
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${f(tilt)}) scale(${s})">
  <path d="M${-w / 2},${-h / 2} L${w / 2},${-h / 2} L${w / 2 + 26},${-h / 2 - 22} L${-w / 2 + 26},${-h / 2 - 22}Z" fill="#7FD6D0" stroke="${C.tealD}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M${w / 2},${-h / 2} L${w / 2 + 26},${-h / 2 - 22} L${w / 2 + 26},${h / 2 - 22} L${w / 2},${h / 2}Z" fill="${C.tealD}" stroke="${C.tealD}" stroke-width="4" stroke-linejoin="round"/>
  <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="8" fill="${C.teal}" stroke="${C.tealD}" stroke-width="5"/>
  <rect x="${-w / 2 + 14}" y="${-h / 2 + 14}" width="${w - 28}" height="${h - 28}" rx="6" fill="${C.ivory}"/>
  <g transform="translate(-30 -2)"><circle r="46" fill="${C.navy2}"/><circle r="30" fill="${C.teal}"/><circle r="12" fill="${C.ivory}"/><path d="M52,-22 q14,22 0,44 M66,-34 q24,34 0,68" stroke="${C.coral}" stroke-width="6" fill="none" stroke-linecap="round"/></g>
  <rect x="${w / 2 - 98}" y="${-h / 2 + 30}" width="68" height="14" rx="7" fill="${C.coral}"/><rect x="${w / 2 - 98}" y="${-h / 2 + 54}" width="46" height="10" rx="5" fill="#C5D0E2"/>
  <rect x="${-w / 2 + 24}" y="${h / 2 - 44}" width="${w - 48}" height="14" rx="7" fill="${C.gold}" opacity=".9"/>
  <path d="M${-w / 2 + 8},${-h / 2 + 8} L${w / 2 - 8},${h / 2 - 8}" stroke="#fff" stroke-opacity=".28" stroke-width="22"/>
  <path d="M${-w / 2 - 6},${-12} L${w / 2 + 6},${-12}" stroke="#EAF6F5" stroke-opacity=".75" stroke-width="12"/>
  </g>`;
}

// ----- card icons for "I spend money on ___" -----
export function iconBooks() {
  return `<g><rect x="-62" y="10" width="124" height="30" rx="5" fill="${C.teal}" stroke="${C.tealD}" stroke-width="4"/><rect x="-52" y="-20" width="108" height="30" rx="5" fill="${C.coral}" stroke="${C.coralD}" stroke-width="4"/><rect x="-44" y="-50" width="94" height="30" rx="5" fill="${C.gold}" stroke="${C.goldD}" stroke-width="4"/><path d="M-30,-35 h40 M-40,-5 h50 M-48,25 h60" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/><path d="M-62,40 h124" stroke="${C.tealD}" stroke-width="4"/></g>`;
}
export function iconFood() {
  return `<g><path d="M-62,6 a62,62 0 0 0 124,0Z" fill="${C.coral}" stroke="${C.coralD}" stroke-width="4" stroke-linejoin="round"/><path d="M-62,6 h124" stroke="${C.coralD}" stroke-width="4"/><path d="M-50,-4 q10,-34 28,-8 q14,-32 30,-4 q14,-30 30,0" fill="#58B957" stroke="#2F8A3D" stroke-width="4" stroke-linejoin="round"/><circle cx="-18" cy="22" r="6" fill="#fff" opacity=".7"/><circle cx="18" cy="30" r="6" fill="#fff" opacity=".7"/><circle cx="0" cy="-26" r="14" fill="#EF4B3C" stroke="#B02E24" stroke-width="3"/><path d="M-30,-70 q-8,-14 0,-26 M0,-76 q-8,-14 0,-26 M30,-70 q-8,-14 0,-26" stroke="${C.navy3}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/></g>`;
}
export function iconGame() {
  return `<g><path d="M-70,-10 C-70,-44 -40,-48 -22,-44 L22,-44 C40,-48 70,-44 70,-10 C70,24 62,52 44,52 C30,52 26,30 14,30 L-14,30 C-26,30 -30,52 -44,52 C-62,52 -70,24 -70,-10Z" fill="${C.navy3}" stroke="${C.navy}" stroke-width="5" stroke-linejoin="round"/><path d="M-44,-22 v26 M-57,-9 h26" stroke="#fff" stroke-width="9" stroke-linecap="round"/><circle cx="38" cy="-20" r="9" fill="${C.coral}"/><circle cx="56" cy="-4" r="9" fill="${C.gold}"/><circle cx="22" cy="-4" r="9" fill="${C.emerald}"/><circle cx="38" cy="12" r="9" fill="${C.teal}"/></g>`;
}
export function iconTravel() {
  return `<g><g transform="rotate(-28)"><path d="M-70,0 L50,-12 C74,-12 78,12 50,14 L-70,6Z" fill="#fff" stroke="${C.navy3}" stroke-width="4" stroke-linejoin="round"/><path d="M-20,-6 L-52,-56 L-30,-56 L18,-8Z M-20,10 L-52,60 L-30,60 L18,12Z" fill="${C.coral}" stroke="${C.coralD}" stroke-width="4" stroke-linejoin="round"/><path d="M-70,0 L-80,-30 L-62,-30 L-48,-4Z" fill="${C.teal}" stroke="${C.tealD}" stroke-width="4" stroke-linejoin="round"/></g><path d="M-70,52 q36,30 90,8" stroke="${C.gold}" stroke-width="5" fill="none" stroke-dasharray="2 12" stroke-linecap="round"/></g>`;
}

// simple friendly bust for the online-class scene
export function bust(x, y, s, o) {
  const { skin = '#C98A5E', skinD = '#9C633B', hair = '#2A1B14', shirt = C.coral, style = 'short', glasses = false, bg } = o;
  let hairBack = '', hairFront = '';
  if (style === 'long') { hairBack = `<path d="M-54,-10 C-60,-90 60,-90 54,-10 L58,70 L-58,70Z" fill="${hair}"/>`; hairFront = `<path d="M-48,-26 C-44,-84 48,-84 48,-26 C30,-50 -20,-52 -48,-26Z" fill="${hair}"/>`; }
  else if (style === 'bun') { hairBack = `<circle cx="0" cy="-86" r="24" fill="${hair}"/>`; hairFront = `<path d="M-48,-22 C-46,-80 46,-80 48,-22 C30,-48 -24,-50 -48,-22Z" fill="${hair}"/>`; }
  else { hairFront = `<path d="M-48,-20 C-52,-82 52,-82 48,-20 C34,-46 -30,-48 -48,-20Z" fill="${hair}"/>`; }
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${s})">
  ${hairBack}
  <path d="M-92,150 C-92,70 -56,52 0,52 C56,52 92,70 92,150Z" fill="${shirt}"/>
  <rect x="-16" y="30" width="32" height="34" rx="12" fill="${skin}"/>
  <ellipse cx="0" cy="-12" rx="50" ry="58" fill="${skin}" stroke="${skinD}" stroke-width="3"/>
  ${hairFront}
  <circle cx="-19" cy="-8" r="5" fill="#241812"/><circle cx="19" cy="-8" r="5" fill="#241812"/>
  ${glasses ? `<rect x="-36" y="-22" width="30" height="24" rx="9" fill="none" stroke="${C.navy}" stroke-width="4"/><rect x="6" y="-22" width="30" height="24" rx="9" fill="none" stroke="${C.navy}" stroke-width="4"/><path d="M-6,-12 h12" stroke="${C.navy}" stroke-width="4"/>` : ''}
  <path d="M-18,22 Q0,38 18,22" stroke="#7A2E2E" stroke-width="5" fill="none" stroke-linecap="round"/>
  </g>`;
}
