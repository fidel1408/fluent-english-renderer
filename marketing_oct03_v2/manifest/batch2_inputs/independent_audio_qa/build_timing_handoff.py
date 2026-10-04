import json,csv,re,unicodedata
from pathlib import Path
root=Path(__file__).resolve().parent.parent; out=root/'independent_audio_qa'
def norm(s):
 s=unicodedata.normalize('NFKC',s).lower().replace('’',"'").replace('10','diez')
 return re.findall(r"[a-záéíóúüñ]+(?:'[a-z]+)?",s)
phrases={
 'clarify_deadline':[
 ('hook','Necesitas que te aclaren una fecha'),
 ('clarify_english','Could you clarify the deadline'),
 ('clarify_spanish','Podrías aclarar la fecha límite'),
 ('confirm_lead','Para confirmar'),
 ('confirm_english','Do you mean this Friday'),
 ('confirm_spanish','Te refieres a este viernes'),
 ('practice','Ahora cambia the deadline for the next step'),
 ('practice_deadline','the deadline'),
 ('practice_connector_disputed','for'),
 ('practice_next_step','the next step'),
 ('cta_offer','Clases en línea para tu equipo'),
 ('cta_action','Manda empresa por mensaje privado')],
 'tell_me_more':[
 ('hook',"Y después de that's nice"),
 ('setup','I tried a new restaurant'),
 ('question_english','Oh nice what was it like'),
 ('question_spanish','Cómo estuvo'),
 ('alternative_lead','También puedes decir'),
 ('alternative_english','Tell me more about it'),
 ('alternative_spanish','Cuéntame más'),
 ('practice_lead','Ahora tú'),
 ('practice_english','I watched a movie last night'),
 ('practice_question','Qué preguntarías después'),
 ('cta_offer','Speaking Club para intermedios y avanzados'),
 ('cta_action','Manda club por mensaje privado')],
 'private_company':[
 ('hook','Buscas una clase privada o clases para tu equipo'),
 ('private','Las privadas pueden ser para una dos o tres personas'),
 ('private_counts','una dos o tres'),
 ('company','Las clases para empresas son en línea para un máximo de diez por clase'),
 ('company_online','en línea'),
 ('company_capacity','un máximo de diez por clase'),
 ('cta_question','Cuéntanos qué necesitan practicar'),
 ('cta_action','Manda privado o empresa por mensaje privado')]
}
all_rows=[]
for slug,pp in phrases.items():
 models={}
 for model in ['small','medium']:
  d=json.load(open(out/f'{slug}_take1_{model}_unprompted.json'))
  ws=[]
  for s in d['segments']:
   for w in s['words']:
    for token in norm(w['word']): ws.append(dict(token=token,**w))
  models[model]=ws
 for label,phrase in pp:
  ts=norm(phrase); estimates={}
  for model,ws in models.items():
   tokens=[w['token'] for w in ws]
   inds=[i for i in range(len(tokens)-len(ts)+1) if tokens[i:i+len(ts)]==ts]
   # The practice's second occurrence of the deadline is intentional.
   i=inds[-1] if label=='practice_deadline' else inds[0]
   estimates[model]={'start':ws[i]['start'],'end':ws[i+len(ts)-1]['end']}
  row={'source_file':slug+'_take1.mp3','phrase_id':label,'recognized_phrase':phrase,'start_min':min(x['start'] for x in estimates.values()),'start_max':max(x['start'] for x in estimates.values()),'end_min':min(x['end'] for x in estimates.values()),'end_max':max(x['end'] for x in estimates.values()),'estimates':estimates}
  all_rows.append(row)
(out/'chosen_phrase_timings.json').write_text(json.dumps({'time_basis':'Seconds from original source MP3 decoded to PCM. These are independent ASR estimates, not sample-exact boundaries. Min/max is model spread, not a confidence interval. Real errors can exceed this range.','selected_take':'take1 for all three; Clarify provisional due disputed por/for','phrases':all_rows},ensure_ascii=False,indent=2))
with open(out/'chosen_phrase_timings.csv','w') as f:
 names=['source_file','phrase_id','recognized_phrase','start_min','start_max','end_min','end_max']
 wr=csv.DictWriter(f,fieldnames=names);wr.writeheader();wr.writerows({k:r[k] for k in names} for r in all_rows)
for slug in phrases:
 print('\n'+slug)
 for r in all_rows:
  if r['source_file']!=slug+'_take1.mp3': continue
  print(f"- {r['phrase_id']}: onset {r['start_min']:.2f}–{r['start_max']:.2f}; end {r['end_min']:.2f}–{r['end_max']:.2f}; {r['recognized_phrase']}")
