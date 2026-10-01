#!/usr/bin/env python3
"""Build src/generated/lexicon.json: American English IPA per word, in Oxford Learner's (NAmE) notation conventions.
Source: CMU Pronouncing Dictionary (American) converted algorithmically + tools/lexicon-manual.json overrides.
NOT verified against Oxford Learner's Dictionaries (site unreachable from this environment); see docs/QC_REPORT.md."""
import json, re, sys, pathlib
import cmudict
root = pathlib.Path(__file__).resolve().parent.parent
words = json.loads((root/'src/generated/words.json').read_text())
manual = json.loads((root/'tools/lexicon-manual.json').read_text()) if (root/'tools/lexicon-manual.json').exists() else {}
cmu = cmudict.dict()
V = {'AA':'ɑː','AE':'æ','AH':'ʌ','AO':'ɔː','AW':'aʊ','AY':'aɪ','EH':'e','ER':'ɜːr','EY':'eɪ','IH':'ɪ','IY':'iː','OW':'oʊ','OY':'ɔɪ','UH':'ʊ','UW':'uː'}
CN = {'B':'b','CH':'tʃ','D':'d','DH':'ð','F':'f','G':'ɡ','HH':'h','JH':'dʒ','K':'k','L':'l','M':'m','N':'n','NG':'ŋ','P':'p','R':'r','S':'s','SH':'ʃ','T':'t','TH':'θ','V':'v','W':'w','Y':'j','Z':'z','ZH':'ʒ'}
ONSETS = {('P','R'),('P','L'),('B','R'),('B','L'),('T','R'),('D','R'),('K','R'),('K','L'),('G','R'),('G','L'),('F','R'),('F','L'),('TH','R'),('SH','R'),('S','P'),('S','T'),('S','K'),('S','M'),('S','N'),('S','L'),('S','W'),('K','W'),('T','W'),('D','W'),('S','F'),('HH','Y'),('M','Y'),('N','Y'),('F','Y'),('P','Y'),('B','Y'),('K','Y'),('V','Y')}
def conv(phs):
    ph = [(re.sub(r'\d','',p), (re.search(r'\d',p).group() if re.search(r'\d',p) else '')) for p in phs]
    # syllable nuclei
    nuc = [i for i,(p,s) in enumerate(ph) if p in V]
    if not nuc: return None
    # syllable starts via maximal onset
    starts = [0]
    for a,b in zip(nuc, nuc[1:]):
        cons = list(range(a+1,b))
        if not cons: starts.append(b); continue
        k = len(cons)
        # choose split: onset as long as legal
        on = 0
        if k >= 1: on = 1
        if k >= 2 and (ph[cons[-2]][0], ph[cons[-1]][0]) in ONSETS: on = 2
        if k >= 3 and (ph[cons[-3]][0], ph[cons[-2]][0]) == ('S','T') and (ph[cons[-2]][0],ph[cons[-1]][0]) in ONSETS: on = 3
        starts.append(b - on)
    out = []
    for si,(i) in enumerate(starts):
        j = starts[si+1] if si+1 < len(starts) else len(ph)
        seg = []
        for p,s in ph[i:j]:
            if p in V:
                if p=='AH': seg.append('ə' if s=='0' else 'ʌ')
                elif p=='IY' and s=='0': seg.append('i')
                elif p=='ER': seg.append('ər' if s=='0' else 'ɜːr')
                else: seg.append(V[p])
            else: seg.append(CN[p])
        stress = max((s for p,s in ph[i:j] if p in V), key=lambda x: {'1':3,'2':2,'0':1,'':0}[x]) if si>=0 else ''
        st = [s for p,s in ph[i:j] if p in V][0]
        out.append((st, ''.join(seg)))
    if len(out) == 1: syl = [out[0][1]]
    else: syl = [('ˈ' if st=='1' else 'ˌ' if st=='2' else '') + t for st,t in out]
    # OLD-style stress: single primary; drop secondary marks that follow the primary or sit right before it
    prim=[i for i,(st,t) in enumerate(out) if st=='1']
    keep=[]
    for i,(st,t) in enumerate(out):
        if st=='1' and i!=(prim[0] if prim else -1): st='0'
        if st=='2':
            if prim and i>prim[0]: st='0'
            elif prim and i==prim[0]-1: st='0'
        keep.append((st,t))
    out=keep
    syl = [('ˈ' if st=='1' else 'ˌ' if st=='2' else '') + t for st,t in out] if len(out)>1 else [out[0][1]]
    s = ''.join(syl)
    # r-coloured vowel clean-up (OLD style)
    s = s.replace('ɑːrr','ɑːr')
    s = re.sub(r'ɑːr(?=[^ɑ-ʼ]|$)', 'ɑːr', s)
    s = s.replace('ɔːr','ɔːr').replace('eɪər','eɪər')
    s = re.sub(r'(?<=[ˈˌ])([bcdfghjklmnpqrstvwxzðθʃʒŋ]*)ɜːrr', r'\1ɜːr', s)
    # unstressed word-final iː -> i (happy)
    s = re.sub(r'iː$', lambda m: 'i' if len(out)>1 and out[-1][0]=='0' else 'iː', s)
    # syllabic n / l after consonants (OLD convention)
    s = re.sub(r'(?<=[tdsz ʃʒ])ən$', 'n', s)
    s = re.sub(r'(?<=[bpdtkɡsʃʒzfvθðnm])əl$', 'l', s)
    return s
lex = {}; missing = []
for w in words:
    k = w.lower()
    if k in manual: lex[k] = manual[k]; continue
    if k in cmu:
        ipa = conv(cmu[k][0])
        if ipa: lex[k] = ipa; continue
    missing.append(k)
for k,v in manual.items(): lex.setdefault(k, v)
(root/'src/generated/lexicon.json').write_text(json.dumps(lex, ensure_ascii=False, sort_keys=True, indent=0))
(root/'src/generated/lexicon-missing.json').write_text(json.dumps(sorted(missing)))
print('lexicon', len(lex), 'missing', len(missing))
if missing: print(' '.join(missing[:200]))
