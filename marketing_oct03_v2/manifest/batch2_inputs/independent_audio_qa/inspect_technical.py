import subprocess,json,hashlib,datetime
from pathlib import Path
import numpy as np
root=Path(__file__).resolve().parent.parent
out=root/'independent_audio_qa'
results=[]
for f in sorted((root/'audio').glob('*.mp3')):
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(f)]))
    st=probe['streams'][0]; sr=int(st['sample_rate']); ch=int(st['channels'])
    p=subprocess.run(['ffmpeg','-v','error','-i',str(f),'-f','f32le','-'],capture_output=True,check=True)
    a=np.frombuffer(p.stdout,dtype=np.float32)
    peak=float(np.max(np.abs(a))); rms=float(np.sqrt(np.mean(a.astype(float)**2)))
    ebu=subprocess.run(['ffmpeg','-hide_banner','-i',str(f),'-af','ebur128=peak=true','-f','null','-'],capture_output=True,text=True,check=True)
    (out/(f.stem+'_ebur128.log')).write_text(ebu.stderr)
    summary=ebu.stderr.rsplit('Summary:',1)[-1]
    sil=subprocess.run(['ffmpeg','-hide_banner','-i',str(f),'-af','silencedetect=noise=-40dB:d=0.12','-f','null','-'],capture_output=True,text=True,check=True)
    (out/(f.stem+'_silencedetect.log')).write_text(sil.stderr)
    # RMS/peak 10ms bins for approximate source-speech onsets; these are not phonetic boundaries.
    mono=a.reshape(-1,ch).mean(axis=1)
    hop=round(sr*.01)
    bins=[]
    for i in range(0,len(mono),hop):
        x=mono[i:i+hop].astype(float)
        bins.append({'start':i/sr,'end':min(i+hop,len(mono))/sr,'rms_dbfs':20*np.log10(max(float(np.sqrt(np.mean(x*x))),1e-12)), 'peak_dbfs':20*np.log10(max(float(np.max(np.abs(x))),1e-12))})
    (out/(f.stem+'_energy10ms.json')).write_text(json.dumps(bins,indent=2))
    d={'file':str(f),'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'bytes':f.stat().st_size,'ffprobe':probe,'decode_exit_code':p.returncode,'decode_stderr':p.stderr.decode(),'decoded_frames':len(a)//ch,'decoded_duration_seconds':len(a)/ch/sr,'sample_peak_linear':peak,'sample_peak_dbfs':20*np.log10(max(peak,1e-12)),'rms_dbfs':20*np.log10(max(rms,1e-12)),'samples_absolute_ge_one':int(np.sum(np.abs(a)>=1)),'samples_absolute_ge_0999':int(np.sum(np.abs(a)>=.999)),'ebu_r128_summary':summary.strip(),'limitations':'Decode/measurement only; no human listening or subjective quality judgment.'}
    results.append(d)
    print(f.name,round(d['decoded_duration_seconds'],3),'peak',round(d['sample_peak_dbfs'],2),'rms',round(d['rms_dbfs'],2),summary.strip(),flush=True)
(out/'source_metadata.json').write_text(json.dumps(results,indent=2))
