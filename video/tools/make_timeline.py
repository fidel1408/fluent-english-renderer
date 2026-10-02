"""Build web/timeline.js + audio/timeline.json from the real voice files.
- English word timings: pocketsphinx segmentation of the actual audio.
- Spanish caption chunk boundaries: lowest-energy point near the proportional character position."""
import json, os, numpy as np, soundfile as sf
from scipy.signal import resample_poly
from pocketsphinx import Decoder, Config
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
man = json.load(open("audio/voice/voice_manifest.json"))
# start time (s) of each voice clip on the 30 s timeline
START = {"n1_hook":0.40,"n2_first":4.45,"e1_normal":8.75,"e2_slow":10.75,"n4_you":14.40,"n5_school":20.60,"n6_cta":25.35}
CHUNKS = {
 "n1_hook":["¿Entiendes inglés,","pero te bloqueas al hablar?"],
 "n2_first":["Empieza con una frase","que puedas hacer tuya."],
 "n4_you":["Ahora tú:","¿qué te gustaría hacer?"],
 "n5_school":["Practica inglés con Fluent English,","en clases en línea."],
 "n6_cta":["Escríbenos “INGLÉS”","y conoce las opciones."],
}
def env(x, sr, win=0.01):
    n=int(win*sr); e=np.sqrt(np.convolve(x**2,np.ones(n)/n,'same')); return e
def split_point(name, text_chunks):
    x,sr=sf.read(f"audio/voice/{name}.wav"); e=env(x,sr)
    L=[len(c) for c in text_chunks]; frac=sum(L[:1])/sum(L)
    c=int(frac*len(x)); lo,hi=int((frac-.12)*len(x)),int((frac+.12)*len(x))
    seg=e[lo:hi]; k=np.argmin(np.convolve(seg,np.ones(int(.06*sr))/int(.06*sr),'same')); return (lo+k)/sr
caps=[]
for name,ch in CHUNKS.items():
    s=START[name]; d=man[name]["duration"]; sp=split_point(name,ch)
    caps.append(dict(clip=name,text=ch[0],t0=round(s-0.05,3),t1=round(s+sp-0.06,3)))
    caps.append(dict(clip=name,text=ch[1],t0=round(s+sp-0.05,3),t1=round(s+d+0.45,3)))
def words(name):
    x,sr=sf.read(f"audio/voice/{name}.wav"); y=resample_poly(x,1,3); y=(np.clip(y,-1,1)*32767).astype(np.int16).tobytes()
    d=Decoder(Config()); d.start_utt(); d.process_raw(y,False,True); d.end_utt()
    seg=[(s.start_frame/100,s.end_frame/100) for s in d.seg() if not s.word.startswith('<')]
    assert len(seg)==5, seg
    return [dict(w=w,t0=round(START[name]+a,3),t1=round(START[name]+b,3)) for w,(a,b) in zip(["I'd","like","to","learn","English"],seg)]
def wave(name, hz=50):
    x,sr=sf.read(f"audio/voice/{name}.wav"); n=int(sr/hz); m=len(x)//n
    e=np.sqrt((x[:m*n].reshape(m,n)**2).mean(1)); e=e/e.max(); return [round(float(v),3) for v in e]
tl=dict(duration=30.0,fps=30,
 scenes=dict(s1=[0,4.2],s2=[4.2,8.2],s3=[8.2,14.2],s4=[14.2,20.2],s5=[20.2,25.0],s6=[25.0,30.0]),
 clips={k:dict(start=START[k],dur=man[k]["duration"],end=round(START[k]+man[k]["duration"],3)) for k in START},
 captions=caps,
 english=dict(normal=words("e1_normal"),slow=words("e2_slow")),
 wave=dict(normal=wave("e1_normal"),slow=wave("e2_slow"),hz=50),
 ipa=["aɪd","laɪk","tə","lɜːrn","ˈɪŋɡlɪʃ"],
 speakWindow=[16.55,19.75])
json.dump(tl,open("audio/timeline.json","w"),ensure_ascii=False,indent=1)
open("web/timeline.js","w").write("window.TIMELINE="+json.dumps(tl,ensure_ascii=False)+";")
for c in caps: print(c)
print(tl["english"])
