"""Unprompted ASR. Expected narration is not read by this script."""
import json, time, hashlib, dataclasses, argparse, subprocess
import numpy as np
from pathlib import Path
from faster_whisper import WhisperModel

p=argparse.ArgumentParser()
p.add_argument('--model',default='small')
p.add_argument('--files',nargs='*',default=['since_for_take1','since_for_take2','used_to_take1','used_to_take2','trial_faq_take1','trial_faq_take2'])
a=p.parse_args()
root=Path(__file__).resolve().parent.parent
out=root/'independent_audio_qa'
model=WhisperModel(a.model,device='cpu',compute_type='int8',cpu_threads=6,download_root='/tmp/fluent-asr/models',local_files_only=True)
for name in a.files:
    f=root/'audio'/(name+'.mp3')
    t=time.monotonic()
    params=dict(language=None,task='transcribe',beam_size=5,word_timestamps=True,multilingual=True,initial_prompt=None,prefix=None,hotwords=None,condition_on_previous_text=False,vad_filter=False)
    pcm=subprocess.check_output(['ffmpeg','-v','error','-i',str(f),'-f','f32le','-ac','1','-ar','16000','-'])
    audio=np.frombuffer(pcm,dtype=np.float32)
    segments,info=model.transcribe(audio,**params)
    ss=[]
    for s in segments:
        print(name, f'{s.start:.3f}-{s.end:.3f}',s.text,flush=True)
        ss.append(dataclasses.asdict(s))
    d={'source':str(f),'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'model':a.model,'implementation':'faster-whisper 1.2.1','parameters':params,'info':dataclasses.asdict(info),'segments':ss,'seconds_elapsed':time.monotonic()-t,'transcript':''.join(s['text'] for s in ss).strip(),'limitations':'Automated recognition, not human listening. Word timestamps and probabilities are model estimates, not calibrated quality scores.'}
    (out/f'{name}_{a.model}_unprompted.json').write_text(json.dumps(d,ensure_ascii=False,indent=2))
    print('SAVED',name,'in',d['seconds_elapsed'],flush=True)
