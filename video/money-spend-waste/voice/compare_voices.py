import sys, time, json, re, unicodedata, numpy as np, soundfile as sf
from tts_lib import *
def norm(s): s=unicodedata.normalize('NFD',s.lower()); s=''.join(c for c in s if unicodedata.category(c)!='Mn'); return re.sub(r'[^a-z ]','',s).split()
def wer(ref,hyp):
    r,h=norm(ref),norm(hyp); d=[[i+j if i*j==0 else 0 for j in range(len(h)+1)] for i in range(len(r)+1)]
    for i in range(1,len(r)+1):
        for j in range(1,len(h)+1): d[i][j]=min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(r[i-1]!=h[j-1]))
    return d[-1][-1]/max(1,len(r))
def f0_std(x,sr):  # rough pitch-variation proxy (autocorr on voiced frames), semitone std
    fr=int(sr*0.04); hop=int(sr*0.01); f=[]
    for i in range(0,len(x)-fr*2,hop):
        w=x[i:i+fr*2]; 
        if np.sqrt(np.mean(w**2))<0.02: continue
        a=np.correlate(w,w,'full')[len(w)-1:]; lo,hi=int(sr/300),int(sr/70)
        k=np.argmax(a[lo:hi])+lo
        if a[k]/a[0]>0.45: f.append(sr/k)
    f=np.array(f); return (float(np.std(12*np.log2(f/np.median(f)))), float(np.median(f))) if len(f)>10 else (0,0)
ES=["¿Gastar dinero y desperdiciarlo se dicen igual en inglés?","No significa que sea algo malo.","Waste expresa que no valió la pena.","¿Y tú? Completa la frase en voz alta.","Practica inglés con Fluent English. Escríbenos INGLÉS por mensaje."]
EN=["I spend money on groceries.","I wasted money on this gadget."]
cands={'es':[('piper:vits-piper-es_MX-claude-high',0),('piper:vits-piper-es_MX-ald-medium',0),('kokoro',28),('kokoro',29)],
       'en':[('piper:vits-piper-en_US-ryan-high',0),('piper:vits-piper-en_US-lessac-high',0),('piper:vits-piper-en_US-hfc_male-medium',0),('kokoro',16),('kokoro',11),('kokoro',3),('kokoro',13)]}
import os; os.makedirs('/tmp/x/cand',exist_ok=True)
for lang,texts in (('es',ES),('en',EN)):
    for eng,sid in cands[lang]:
        t0=time.time(); ws=[];sts=[];dur=0;chars=0
        for i,tx in enumerate(texts):
            x,sr=synth(eng,tx,sid=sid,speed=1.0)
            sf.write(f"/tmp/x/cand/{lang}_{eng.split(':')[-1]}_{sid}_{i}.wav",x,sr)
            hyp=transcribe(x,sr,lang); ws.append(wer(tx,hyp)); s,m=f0_std(x,sr); sts.append(s); dur+=len(x)/sr; chars+=len(tx)
            if i==0: print('   sample hyp:',hyp)
        print(f"{lang} {eng.split(':')[-1]:38s} sid={sid:<3} WER={np.mean(ws):.3f} f0std={np.mean(sts):.2f}st  rate={chars/dur:.1f} ch/s  synth {time.time()-t0:.1f}s",flush=True)
