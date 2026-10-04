"""Visual-only settle recommendations cross-checked against threshold waveform activity."""
import json,re,hashlib,shutil
from pathlib import Path
root=Path(__file__).resolve().parent.parent; out=root/'independent_audio_qa'
# (phrase, recommended settled-by source second, threshold gap start/end)
points={
'since_for_take1':[
('duration_example',2.75,2.333401,2.849501),
('duration_rule',5.00,4.629002,5.137551),
('start_example',8.45,7.901270,8.565624),
('start_rule',11.00,10.538322,11.109819),
('practice_lead',15.40,14.956145,15.569320),
('cta_offer',21.75,21.047710,21.952744)],
'used_to_take2':[
('example',2.25,1.835828,2.435465),
('changed_habit',7.80,7.190317,7.927506),
('structure',10.40,10.234943,10.529252),
('practice_lead',14.40,13.853787,14.592472),
('cta_offer',19.60,18.871837,19.954966)],
 'trial_faq_take2':[
('trial',2.20,1.850544,2.399184),
('stop_condition',7.05,6.723220,7.194989),
('continue_condition',9.10,8.918844,9.318730),
('details',14.55,14.262086,14.793741),
('cta',16.65,16.472381,16.826599)]}
phrases=json.load(open(out/'chosen_phrase_timings.json'))['phrases']
rows=[]
for file,pp in points.items():
 energy=json.load(open(out/f'{file}_energy10ms.json'))
 for phrase,settle,gapstart,gapend in pp:
  p=next(r for r in phrases if r['source_file']==file+'.mp3' and r['phrase_id']==phrase)
  assert gapstart<settle<gapend
  row={'source_file':file+'.mp3','phrase_id':phrase,'visual_settled_by_source_seconds':settle,'independent_asr_start_spread':[p['start_min'],p['start_max']],'measured_minus40dB_gap':[gapstart,gapend],'gap_duration_seconds':gapend-gapstart,'waveform_bins_near_transition':[e for e in energy if gapend-.15<=e['start']<=max(gapend,p['start_max'])+.15]}
  if phrase=='changed_habit': row['note']='Gap ends at a single-sample threshold crossing around 7.9275. Energy remains low until approximately 8.0952; conservative settle 7.80 precedes both. Threshold activity is not a phonetic boundary.'
  rows.append(row)
(out/'visual_settle_anchors.json').write_text(json.dumps({'purpose':'Visual entrance completion targets only. Do not use as audio partition/cut instructions. Do not move audio to these times. Source seconds must be mapped through actual sample-preserving final cue map.','threshold':'FFmpeg silencedetect -40 dB, minimum 0.12 s; 10 ms RMS/peak bins retained. Threshold silence may contain breaths or low-level phonemes.','anchors':rows},ensure_ascii=False,indent=2))
shutil.copyfile(root/'production_manifest.json',out/'production_manifest_snapshot.json')
manifest_hash=hashlib.sha256((root/'production_manifest.json').read_bytes()).hexdigest()
(out/'analysis_provenance.json').write_text(json.dumps({'date_utc':'2026-10-04','manifest_sha256':manifest_hash,'scope':'Offline examination of six existing MP3 originals. No browser, paid service, network, voice generation, video generation or original-file editing.','framework':'faster-whisper 1.2.1','compute':'CPU int8, 6 threads, locally cached official SYSTRAN models','small_revision':'536b0662742c02347bc0e980a01041f333bce120','medium_revision':'08e178d48790749d25932bbc082711ddcfdfbc4f','full_file_small':['since_for_take1','since_for_take2','used_to_take1','used_to_take2','trial_faq_take1','trial_faq_take2'],'full_file_medium':['since_for_take1','since_for_take2','used_to_take2','trial_faq_take2'],'bounded_span_runs':[],'bounded_span_reason':'Selected takes have corroborated intended content; further snippets would not replace genuine listening or resolve homophone spelling reliably.','asr_input':'Decoded mono 16000 Hz float32 audio only; expected script never supplied to decoders. Auto language, transcribe, multilingual, beam 5, no prompt/prefix/hotwords, no VAD, no prior-text conditioning.','tools':'Python 3.12.14; FFmpeg 7.1.5','hearing':'Unavailable; automated recognition and measurements are not auditory or subjective quality review.'},indent=2))
try:
 import matplotlib
 matplotlib.use('Agg')
 import matplotlib.pyplot as plt
 for file,pp in points.items():
  es=json.load(open(out/f'{file}_energy10ms.json'))
  fig,ax=plt.subplots(figsize=(16,4.5))
  ax.plot([e['start'] for e in es],[e['rms_dbfs'] for e in es],linewidth=.75,color='#174A5B',label='10 ms RMS')
  ax.axhline(-40,color='gray',alpha=.5,linestyle=':',label='-40 dB reference (silencedetect is sample threshold)')
  for j,(phrase,settle,gs,ge) in enumerate(pp):
   ax.axvspan(gs,ge,color='#80CBB5',alpha=.18)
   ax.axvline(settle,color='#B55334',linewidth=.8,linestyle='--')
   ax.text(settle,-4-(j%2)*10,phrase.replace('_',' ')+'\n'+str(settle)+' s',rotation=0,fontsize=7,ha='center',va='top')
  ax.set(xlim=(0,es[-1]['end']),ylim=(-85,2),xlabel='Source seconds (before added read holds)',ylabel='dBFS',title=file+': visual settle targets; NOT audio cut points or hearing evidence')
  ax.legend(loc='lower right',fontsize=8);fig.tight_layout();fig.savefig(out/f'{file}_waveform_anchors.png',dpi=140);plt.close(fig)
except ImportError:
 pass
print('Saved',len(rows),'source-relative visual anchors and provenance. Manifest:',manifest_hash)
