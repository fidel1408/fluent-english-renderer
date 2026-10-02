"""Builds the 7 narration clips with local neural TTS (no API, no key, no upload).
 Spanish narrator  : Piper es_MX "claude" (high)      — Mexican Spanish
 English examples  : Kokoro am_michael (US male)       — the on-screen character says the example sentences
 English words inside Spanish lines (Spend / Waste / Fluent English): Kokoro af_sarah (US female) so the narrator's
                     line keeps one gender; each word is synthesised by an English voice, never by the Spanish model.
Pacing is set per clip (speed + explicit pauses), silences are trimmed, levels matched. Run: python3 voice/build_narration.py
"""
import json, os, sys, numpy as np, soundfile as sf, subprocess
sys.path.insert(0, os.path.dirname(__file__))
from tts_lib import synth, transcribe
OUT = os.path.join(os.path.dirname(__file__), '..', 'audio'); os.makedirs(OUT, exist_ok=True)
SR = 44100
ES = 'piper:vits-piper-es_MX-claude-high'
def resample(x, sr):
    if sr == SR: return x
    t = np.arange(int(len(x) * SR / sr)) / SR * sr
    return np.interp(t, np.arange(len(x)), x).astype(np.float32)
def trim(x, thr=0.012, pad=0.03):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0: return x
    a, b = max(0, idx[0] - int(pad * SR)), min(len(x), idx[-1] + int(pad * SR)); return x[a:b]
def level(x, rms=0.085):
    r = np.sqrt(np.mean(x ** 2)) + 1e-9; y = x * (rms / r); p = np.max(np.abs(y)); return y * min(1, 0.9 / p)
def fade(x, ms=8):
    n = int(SR * ms / 1000); x = x.copy(); x[:n] *= np.linspace(0, 1, n); x[-n:] *= np.linspace(1, 0, n); return x
def gap(s): return np.zeros(int(SR * s), np.float32)
import re, unicodedata
def _norm(t): t = unicodedata.normalize('NFD', t.lower()); return re.sub(r'[^a-z ]', '', ''.join(c for c in t if unicodedata.category(c) != 'Mn')).split()
def _score(ref, hyp):
    r, h = _norm(ref), _norm(hyp); return sum(1 for w in r if w in h) / max(1, len(r))
def _to16(x, sr): return np.interp(np.arange(int(len(x) * 16000 / sr)) / 16000 * sr, np.arange(len(x)), x).astype(np.float32)
TAKES = int(os.environ.get('TAKES', '10'))
def best_es(text, speed, ref=None):
    """Piper has per-run random variation; render several takes and keep the one a speech recogniser (Whisper small+medium)
    understands best. This is how weak consonants (initial 'g' in 'gastar') are caught without hand-editing audio."""
    best = None
    for k in range(TAKES):
        x, sr = synth(ES, text, speed=speed)
        h = transcribe(_to16(x, sr), 16000, 'es'); sc = _score(ref or text, h)
        if best is None or sc > best[0]: best = (sc, x, sr, h)
        if sc >= 1.0: break
    return best[1], best[2]
def _valleys(x, sr, lo=0.2, hi=1.3):
    n = int(sr * 0.005); e = np.array([np.sqrt(np.mean(x[i:i + n] ** 2)) for i in range(0, len(x) - n, n)])
    a, b = int(lo / 0.005), int(hi / 0.005); ks = [k for k in range(max(a, 2), min(b, len(e) - 2)) if e[k] <= e[k - 1] and e[k] <= e[k + 1] and e[k] < 0.35 * e[max(0, k - 12):k + 12].max()]
    return [k * n for k in ks], n
def cut_take(lead, text, must, speed=1.0, tries=20):
    """Piper under-voices a word-initial 'g' (gastar -> 'castar'/'hasta'). Word-internally after a vowel it is fine, so synthesise
    the phrase with a lead-in word, cut at an acoustic valley after the lead-in, and keep a take only if BOTH Whisper models
    transcribe the required word. Fully automatic; no hand-edited audio."""
    for k in range(tries):
        x, sr = synth(ES, lead + ' ' + text, speed=speed)
        i0 = int(np.argmax(np.abs(x) > 0.012)); x = x[i0:]
        cuts, n = _valleys(x, sr)
        for c in cuts:
            y = x[c:]
            h = transcribe(_to16(y, sr), 16000, 'es')
            nh = _norm(h)
            if nh[:len(must)] == must and _score(text, h) >= 0.75:
                return y, sr, h
            if len(must) == 2 and nh[:1] == must[:1] and _score(text, h) >= 0.7:   # 'es gastar': second opinion from the larger model
                h2 = transcribe(_to16(y, sr), 16000, 'es', 'medium')
                if _norm(h2)[:2] == must: return y, sr, h2
    return None
def say_cut(lead, text, must, speed=1.0, rms=0.085):
    r = cut_take(lead, text, must, speed)
    if r is None:
        print('WARNING: no verified take for', text); x, sr = best_es(text, speed)
    else:
        x, sr, h = r; print('   verified cut take:', h)
    return fade(level(trim(resample(x, sr)), rms))
def gastar_word(speed=1.0, tries=25):
    """Verified take of the single word 'gastar' (taken from a verified lead-in take, trimmed at the next word boundary)."""
    for k in range(tries):
        r = cut_take('Voy a', 'gastar dinero y desperdiciarlo', ['gastar'], speed, tries=1)
        if not r: continue
        y, sr, _ = r
        y = y[int(np.argmax(np.abs(y) > 0.012)):]
        cuts, n = _valleys(y, sr, lo=0.3, hi=0.9)
        for c in cuts:
            w = y[:c + n]
            if _norm(transcribe(_to16(w, sr), 16000, 'es')) == ['gastar'] and _norm(transcribe(_to16(w, sr), 16000, 'es', 'medium')) == ['gastar']:
                return w, sr
    return None
def say_gastar(speed=1.0):
    r = gastar_word(speed)
    if r is None: print('WARNING: no verified single-word take for gastar'); return say('es', 'gastar.', speed)
    w, sr = r; print('   verified single-word take: gastar')
    return fade(level(trim(resample(w, sr)), 0.085))
def say(kind, text, speed=1.0, rms=0.085, ref=None):
    if kind == 'es': x, sr = best_es(text, speed, ref)
    elif kind == 'en_m': x, sr = synth('kokoro', text, sid=16, speed=speed)
    else: x, sr = synth('kokoro', text, sid=9, speed=speed)
    return fade(level(trim(resample(x, sr)), rms))
def seq(*parts):
    return np.concatenate([p if isinstance(p, np.ndarray) else gap(p) for p in parts])

CLIPS = {
  'es_hook':  (lambda: seq(say_cut('Voy a', 'gastar dinero y desperdiciarlo ¿se dicen igual en inglés?', ['gastar'], 1.06)), 'es', '¿Gastar dinero y desperdiciarlo se dicen igual en inglés?'),
  'en_spend': (lambda: seq(say('en_m', 'I spend money on groceries.', 0.96)), 'en', 'I spend money on groceries.'),
  'es_spend': (lambda: seq(say('en_f', 'Spend', 0.95), 0.07, say('es', 'es gaastar. No significa que sea algo malo.', 1.0, ref='es gastar no significa que sea algo malo')), 'es', 'Spend es gastar. No significa que sea algo malo.'),
  'en_waste': (lambda: seq(say('en_m', 'I wasted money on this gadget.', 0.96)), 'en', 'I wasted money on this gadget.'),
  'es_waste': (lambda: seq(say('en_f', 'Waste', 0.95), 0.07, say('es', 'expresa que no valió la pena.', 1.0)), 'es', 'Waste expresa que no valió la pena.'),
  'es_speak': (lambda: seq(say('es', '¿Y tú?', 0.98), 0.28, say('es', 'Completa la frase en voz alta.', 1.0)), 'es', '¿Y tú? Completa la frase en voz alta.'),
  'es_cta':   (lambda: seq(say('es', 'Practica inglés con', 1.02), 0.06, say('en_f', 'Fluent English.', 0.95), 0.4, say('es', 'Escríbenos', 1.0), 0.12, say('es', 'INGLÉS', 0.92), 0.1, say('es', 'por mensaje.', 1.0)), 'es', 'Practica inglés con Fluent English. Escríbenos INGLÉS por mensaje.'),
}
report = {}
only = sys.argv[1:]
for cid, (fn, lang, text) in CLIPS.items():
    if only and cid not in only: continue
    x = fn(); path = os.path.join(OUT, cid + '.wav'); sf.write(path, x, SR, subtype='PCM_16')
    # round-trip check: transcribe our own clip with Whisper (speech-to-text) and compare
    x16 = resample(x, SR) if False else x
    hyp = transcribe(np.interp(np.arange(int(len(x) * 16000 / SR)) / 16000 * SR, np.arange(len(x)), x).astype(np.float32), 16000, lang)
    report[cid] = {'dur': round(len(x) / SR, 2), 'text': text, 'asr': hyp, 'rms': round(float(np.sqrt(np.mean(x ** 2))), 4), 'peak': round(float(np.max(np.abs(x))), 3)}
    print(cid, report[cid], flush=True)
rp = os.path.join(OUT, 'narration_report.json')
old = json.load(open(rp)) if os.path.exists(rp) else {}
old.update(report); json.dump(old, open(rp, 'w'), ensure_ascii=False, indent=2)
