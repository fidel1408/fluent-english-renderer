// Verifies every IPA symbol used on screen belongs to the Fluent English Sound Chart set (+ the few non-phoneme marks noted).
import { SENTENCES, HOOK_PHRASES } from '../src/timeline.js';
const chart = ['æ','e','ɪ','ɔː','ʊ','ə','ʌ','iː','uː','ɑː','aɪ','eɪ','əʊ','aʊ','ɔɪ','ɑːr','er','ɔːr','ɜːr','p','ʒ','z','s','t','m','n','f','v','d','ð','θ','l','dʒ','w','r','b','g','ɡ','ʃ','tʃ','h','k','ŋ','j'];
const allowedExtra = { 'ˈ': 'primary stress mark', 'ː': 'length mark (part of chart symbols)', 'i': 'unstressed word-final "happy" vowel (Oxford convention; not a separate chart tile)' };
const strings = [...HOOK_PHRASES.map(p => p.ipa), ...Object.values(SENTENCES).flatMap(S => S.words.map(w => w.ipa).filter(Boolean))];
const chars = new Set(strings.join('').replace(/\s/g, '').split(''));
const chartChars = new Set(chart.join('').split(''));
let issues = 0;
for (const c of chars) { if (chartChars.has(c)) continue; if (allowedExtra[c]) { console.log(`note  ${c} (U+${c.codePointAt(0).toString(16)}): ${allowedExtra[c]}`); continue; } console.log(`NOT IN CHART: ${c}`); issues++; }
console.log([...new Set(strings)].join('   '));
console.log(issues ? `${issues} symbol(s) outside the chart` : 'All symbols are chart symbols or documented marks.');
process.exit(issues ? 1 : 0);
