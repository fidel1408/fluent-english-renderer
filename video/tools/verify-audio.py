#!/usr/bin/env python3
"""Numeric audio checks on the rendered stems / final MP4. Writes build/audio-report.json and prints a table."""
import json, subprocess, sys, re, os
import numpy as np
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
mp4 = sys.argv[1] if len(sys.argv) > 1 else os.path.join(root, 'out/pide-tu-cafe-en-ingles.mp4')
def load(p, sr=48000):
    raw = subprocess.run(['ffmpeg','-v','error','-i',p,'-f','f32le','-ac','1','-ar',str(sr),'-'],capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)
sr = 48000
A = os.path.join(root,'build/audio')
v, m, a, s = [load(os.path.join(A,f+'.wav')) for f in ('voice','music','amb','sfx')]
mix = load(mp4)
voices = json.load(open(os.path.join(root,'build/voices.json')))['cues']
cfg = json.loads(subprocess.run(['node','-e',"const vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(require('fs').readFileSync('src/config.js','utf8'),c);console.log(JSON.stringify({cues:c.window.FE.CUES,pause:c.window.FE.PAUSE,sfx:c.window.FE.SFX}))"],capture_output=True,cwd=root,text=True).stdout)
db = lambda x: 20*np.log10(max(x,1e-9))
rms = lambda x: float(np.sqrt(np.mean(np.square(x)))) if len(x) else 0.0
seg = lambda x,t0,t1: x[int(t0*sr):int(t1*sr)]
report = {'cues':[], 'checks':{}}
_g = json.load(open(os.path.join(root,'tools/mix.json'))); G = dict(m=_g['music'], a=_g['amb'], s=_g['sfx'])
print('%-4s %-3s %6s %6s | voice dB  bed dB  margin' % ('cue','lang','start','end'))
ok_margin = True
for q in cfg['cues']:
    d = voices[q['id']]['dur']; t0, t1 = q['t'], q['t']+d
    vr = db(rms(seg(v,t0,t1)))
    bed = seg(m,t0,t1)*G['m'] + seg(a,t0,t1)*G['a'] + seg(s,t0,t1)*G['s']
    br = db(rms(bed)); mg = vr-br
    print('%-4s %-3s %6.2f %6.2f | %8.1f %7.1f %7.1f' % (q['id'],q['lang'],t0,t1,vr,br,mg))
    report['cues'].append(dict(id=q['id'],start=t0,end=t1,voice_db=round(vr,1),bed_db=round(br,1),margin_db=round(mg,1)))
    ok_margin &= mg >= 10
p0,p1 = cfg['pause']['t0'], cfg['pause']['t1']
pv = db(rms(seg(v,p0,p1)))
print('response pause %.2f-%.2f: narration level %.1f dB (silence expected) ; final-mix level %.1f dB' % (p0,p1,pv,db(rms(seg(mix,p0,p1)))))
# any voice energy inside pause?
report['checks']['pause_narration_silent'] = bool(pv < -80)
# SFX windows vs voices
clash = []
for e in cfg['sfx']:
    if e['id'] in ('iceClink','textChange','yourTurn','doneChime','cupPlace','doorChime'):
        for q in cfg['cues']:
            d = voices[q['id']]['dur']
            if q['t']-0.02 <= e['t'] <= q['t']+d+0.02: clash.append((e['id'], e['t'], q['id']))
print('SFX landing inside a spoken word window:', clash or 'none')
report['checks']['sfx_clear_of_speech'] = not clash
# levels
peak = float(np.max(np.abs(mix))); print('final mix sample peak: %.2f dBFS' % db(peak))
out = subprocess.run(['ffmpeg','-nostats','-i',mp4,'-af','loudnorm=print_format=json','-vn','-f','null','-'],capture_output=True,text=True).stderr
j = json.loads(out[out.rfind('{'):out.rfind('}')+1])
print('integrated loudness %s LUFS, true peak %s dBTP, LRA %s' % (j['input_i'], j['input_tp'], j['input_lra']))
report['checks'].update(peak_dbfs=round(db(peak),2), lufs=float(j['input_i']), true_peak=float(j['input_tp']), margin_ge_10db=bool(ok_margin))
# layers present in final mix: correlate stems with mix bands is overkill; check each stem is non-silent and mix has energy in each section
for name,x in (('voice',v),('music',m),('ambience',a),('sfx',s)):
    report['checks'][name+'_rms_db'] = round(db(rms(x)),1)
print({k: report['checks'][k] for k in report['checks'] if k.endswith('_rms_db')})
secs = [(0,4),(4,11),(11,17),(17,24),(24,30)]
print('final-mix RMS by scene:', [round(db(rms(seg(mix,*r))),1) for r in secs])
tail = db(rms(seg(mix,29.8,30.0))); print('last 0.2 s level %.1f dB (clean ending)' % tail)
report['checks']['clean_ending_db'] = round(tail,1)
# prove every stem is present inside the MP4's audio: align (limiter/codec delay), then regress the mix on the four stems
n = min(len(mix), len(v), len(m), len(a), len(s))
ref = v[:n]*_g['voice'] + m[:n]*_g['music'] + a[:n]*_g['amb'] + s[:n]*_g['sfx']
F = 1 << int(np.ceil(np.log2(2*n)))
cc = np.fft.irfft(np.fft.rfft(mix[:n], F) * np.conj(np.fft.rfft(ref, F)), F)
lag = int(np.argmax(np.abs(cc))); lag = lag if lag < F//2 else lag - F
corr = float(cc[lag % F] / (np.linalg.norm(mix[:n]) * np.linalg.norm(ref)))
k = n - abs(lag)
ya = mix[max(lag,0):max(lag,0)+k]; sh = lambda x: x[max(-lag,0):max(-lag,0)+k]
X = np.stack([sh(v[:n]), sh(m[:n]), sh(a[:n]), sh(s[:n])], 1); coef = np.linalg.lstsq(X, ya, rcond=None)[0]
r2 = 1 - np.sum((ya - X@coef)**2) / np.sum((ya - ya.mean())**2)
print('alignment lag %d samples (%.1f ms), correlation with reference mix %.4f' % (lag, lag/48.0, corr))
print('mix = %.2f*voice + %.2f*music + %.2f*ambience + %.2f*sfx   (R^2 = %.3f; all four layers must be > 0)' % (*coef, r2))
report['checks']['stem_regression'] = dict(lag_ms=round(lag/48.0,1), corr=round(corr,4), voice=round(float(coef[0]),3), music=round(float(coef[1]),3), ambience=round(float(coef[2]),3), sfx=round(float(coef[3]),3), r2=round(float(r2),3), all_layers_present=bool((coef>0).all() and r2>0.9))
json.dump(report, open(os.path.join(root,'build/audio-report.json'),'w'), indent=1)
