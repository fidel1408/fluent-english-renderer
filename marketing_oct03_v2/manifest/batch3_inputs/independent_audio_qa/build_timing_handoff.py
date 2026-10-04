"""Post-recognition indexing only: no reference text is passed to an ASR model."""
import json,csv,re,unicodedata
from pathlib import Path
root=Path(__file__).resolve().parent.parent; out=root/'independent_audio_qa'
chosen={'since_for':'take1','used_to':'take2','trial_faq':'take2'}
def norm(s):
 s=unicodedata.normalize('NFKC',s).lower().replace('’',"'")
 s=re.sub(r'\b2024\b','twenty twenty four',s).replace('indicaduración','indica duración')
 s=''.join(c for c in unicodedata.normalize('NFKD',s) if not unicodedata.combining(c))
 return re.findall(r"[a-z0-9]+(?:'[a-z]+)?",s)
phrases={
'since_for':[
('hook','Esto empezó antes y sigue ahora',0),
('duration_example',"I've lived here for two years",0),
('duration_rule','For indica duración',0),
('duration_repeat','two years',1),
('start_example',"I've lived here since 2024",0),
('start_rule','Since señala cuándo empezó',0),
('start_repeat','2024',1),
('practice_lead','Ahora tú',0),
('practice_prefix',"I've studied English",0),
('practice_duration','six months',0),
('practice_question','Since o for',0),
('cta_offer','Clases en línea',0),
('cta_action','Manda grupo por mensaje privado',0)],
'used_to':[
('hook','Piensa en algo que hacías antes',0),
('example','I used to play soccer after school',0),
('translation','Antes jugaba fútbol después de la escuela',0),
('changed_habit','Para un hábito de antes que ya cambió',0),
('structure','usa used to más verbo base',0),
('base_word','play',1),
('practice_lead','Ahora tú',0),
('practice_fragment','I used to',1),
('practice_question','Cómo completarías la frase',0),
('cta_offer','Clases en línea',0),
('cta_action','Manda grupo por mensaje privado',0)],
 'trial_faq':[
('hook','Qué pasa después de la semana de prueba',0),
('trial','En grupos y Speaking Club pruebas la primera semana sin pagar por adelantado',0),
('stop_condition','Si no continúas no pagas',0),
('continue_condition','Si continúas el pago cubre las cuatro semanas completas incluida la primera',0),
('four_weeks','las cuatro semanas completas',0),
('week1_included','incluida la primera',0),
('details','Consulta los precios en la descripción',0),
('cta','Manda grupo o club por privado',0)]}
rows=[]
for slug,pp in phrases.items():
 models={}
 for model in ['small','medium']:
  d=json.load(open(out/f'{slug}_{chosen[slug]}_{model}_unprompted.json'))
  models[model]=[dict(token=token,**w) for s in d['segments'] for w in s['words'] for token in norm(w['word'])]
 for label,phrase,occ in pp:
  target=norm(phrase); estimates={}
  for model,words in models.items():
   tokens=[w['token'] for w in words]
   indices=[i for i in range(len(tokens)-len(target)+1) if tokens[i:i+len(target)]==target]
   if len(indices)<=occ: raise ValueError((slug,model,label,indices))
   i=indices[occ]
   estimates[model]={'start':words[i]['start'],'end':words[i+len(target)-1]['end']}
  row={'source_file':f'{slug}_{chosen[slug]}.mp3','phrase_id':label,'indexed_phrase':phrase,'start_min':min(v['start'] for v in estimates.values()),'start_max':max(v['start'] for v in estimates.values()),'end_min':min(v['end'] for v in estimates.values()),'end_max':max(v['end'] for v in estimates.values()),'estimates':estimates}
  rows.append(row)
(out/'chosen_phrase_timings.json').write_text(json.dumps({'time_basis':'Original decoded-source seconds, before inserted silence. ASR estimates, not sample-exact audio boundaries. Min/max is model spread, not a confidence interval. True errors can be larger.','index_normalization':'Only for finding already-recognized words: apostrophe/case/punctuation, accent folding, 2024 to twenty twenty four, and joined indicaduración split. This does not alter raw ASR or the strict comparison.','chosen_takes':chosen,'phrases':rows},ensure_ascii=False,indent=2))
keys=['source_file','phrase_id','indexed_phrase','start_min','start_max','end_min','end_max']
with open(out/'chosen_phrase_timings.csv','w') as f:
 w=csv.DictWriter(f,fieldnames=keys);w.writeheader();w.writerows({k:r[k] for k in keys} for r in rows)
for r in rows: print(r['source_file'],r['phrase_id'],f"start {r['start_min']:.2f}–{r['start_max']:.2f}; end {r['end_min']:.2f}–{r['end_max']:.2f}")
