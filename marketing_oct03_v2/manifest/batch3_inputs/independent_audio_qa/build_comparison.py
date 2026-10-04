import json,re,unicodedata,difflib,csv
from pathlib import Path
root=Path(__file__).resolve().parent.parent; out=root/'independent_audio_qa'
manifest=json.load(open(root/'production_manifest.json'))
def norm(s):
 s=unicodedata.normalize('NFKC',s).lower().replace('’',"'")
 s = re.sub(r'\b2024\b', 'twenty twenty four', s)
 return re.findall(r"[a-záéíóúüñ0-9]+(?:'[a-z]+)?",s)
report=[]
for v in manifest['videos']:
 ref=norm(v['narration'])
 for f in sorted(out.glob(v['slug']+'_*_unprompted.json')):
  d=json.load(open(f)); hyp=norm(d['transcript'])
  sm=difflib.SequenceMatcher(None,ref,hyp,autojunk=False)
  issues=[]; exact=0
  for tag,i,j,k,l in sm.get_opcodes():
   if tag=='equal': exact+=j-i
   else: issues.append({'type':tag,'expected':' '.join(ref[i:j]),'recognized':' '.join(hyp[k:l]),'expected_token_span':[i,j],'recognized_token_span':[k,l]})
  report.append({'content_id':v['content_id'],'file':Path(d['source']).name,'evidence_file':f.name,'model':d['model'],'transcript':d['transcript'],'normalized_script_words':len(ref),'normalized_hypothesis_words':len(hyp),'aligned_exact_words':exact,'differences':issues,'normalization':'Lowercase, punctuation removed except internal apostrophes; curly apostrophe normalized; 2024 expanded to twenty twenty four; all other numbers retained. This is an ASR-script comparison, not an intelligibility or listening grade.'})
  words=[dict(model=d['model'],**w) for s in d['segments'] for w in s['words']]
  with open(out/(f.stem.replace('_unprompted','')+'_word_timings.csv'),'w') as fh:
   wr=csv.DictWriter(fh,fieldnames=['model','start','end','word','probability']);wr.writeheader();wr.writerows(words)
(out/'comparison_summary.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
for r in report: print(r['file'],r['model'],str(r['aligned_exact_words'])+'/'+str(r['normalized_script_words']),r['differences'])
