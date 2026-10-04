"""Unprompted span recognition. No expected narration text is supplied to the model."""
import json,subprocess,dataclasses,hashlib,time
from pathlib import Path
import numpy as np
from faster_whisper import WhisperModel
root=Path(__file__).resolve().parent.parent; out=root/'independent_audio_qa'
model=WhisperModel('medium',device='cpu',compute_type='int8',cpu_threads=6,download_root='/tmp/fluent-asr/models',local_files_only=True)
cases=[('clarify_deadline_take1','practice',12.0,16.8,[None,'es']),('clarify_deadline_take2','english_question_1',2.1,4.1,[None,'en']),('clarify_deadline_take2','english_question_2',7.7,9.2,[None,'en']),('clarify_deadline_take2','practice',11.0,14.9,[None,'es'])]
results=[]
for name,label,start,end,langs in cases:
 f=root/'audio'/(name+'.mp3')
 raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(f),'-f','f32le','-ac','1','-ar','16000','-'])
 audio=np.frombuffer(raw,dtype=np.float32)
 for lang in langs:
  params=dict(language=lang,task='transcribe',beam_size=5,word_timestamps=True,multilingual=lang is None,initial_prompt=None,prefix=None,hotwords=None,condition_on_previous_text=False,vad_filter=False)
  segs,info=model.transcribe(audio[round(start*16000):round(end*16000)],**params)
  ss=[dataclasses.asdict(s) for s in segs]
  d={'source':str(f),'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'label':label,'source_start_seconds':start,'source_end_seconds':end,'model':'medium','parameters':params,'info':dataclasses.asdict(info),'segments':ss,'transcript':''.join(s['text'] for s in ss).strip(),'limitations':'Timestamps are relative to span; add source_start_seconds. Language-only constrained evidence is supplementary, not a listening test. No lexical prompt or expected script is provided.'}
  results.append(d); print(name,label,lang,d['transcript'],flush=True)
  (out/'disputed_spans.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
