import hashlib,json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
raw=(root/'raw/Dhika.txt').read_bytes();lines=raw.decode().split('\n')
d=json.loads((root/'data/chotu_dhika_tracker.json').read_text())
assert hashlib.sha256(raw).hexdigest()==d['scope']['source_sha256']
assert [e['episode_id'] for e in d['episodes']]==[f'E{i:02}' for i in range(1,69)]
pattern=re.compile(r'\bch+o+t+u+\b|\bb+a+b+u+\b',re.I)
for ep in d['episodes']:
 lo,hi=ep['source_range']; source={s['global_line']:s for s in ep['source_lines']}
 for s in source.values():
  assert s['text']==lines[s['global_line']-1]
  assert s['episode_line']==s['global_line']-lo+1
 for n in range(lo,hi+1):
  if pattern.search(lines[n-1]):assert n in source,(ep['episode_id'],n)
 for b in ep['bond_beats']:
  assert all(n in source for n in b['evidence_global_lines'])
 for a in ep['physical_actions']:
  for s in a['evidence']:
   assert s['quote'] in lines[s['global_line']-1]
   assert s['episode_line']==s['global_line']-lo+1,s
e1=d['episodes'][0]
assert len(e1['meetings'])==3
assert any(b['start']==137 or b['start']<=137<=b['end'] for b in e1['bond_beats'])
assert any(b['kind']=='trust_statement' and b['start']<=204<=b['end'] for b in e1['bond_beats'])
assert any(b['kind']=='inner_thought' and b['start']==207 for b in e1['bond_beats'])
assert any(b['kind']=='memory' and b['start']==166 for b in e1['bond_beats'])
assert not d['episodes'][1]['meetings']
assert any(x['from_global_line']==345 and x['to_global_line']==411 for x in d['evidence_links'])
assert d['episodes'][10]['meetings'][-1]['meeting_id']==d['episodes'][11]['meetings'][0]['meeting_id']
assert d['episodes'][14]['meetings'][0]['meeting_id']==d['episodes'][15]['meetings'][0]['meeting_id']
assert d['episodes'][27]['meetings'][0]['meeting_id']==d['episodes'][28]['meetings'][0]['meeting_id']
assert d['episodes'][66]['meetings'][-1]['meeting_id']==d['episodes'][67]['meetings'][0]['meeting_id']
assert any(11233 in [s['global_line'] for s in a['evidence']] for a in d['episodes'][56]['physical_actions'])
assert any(13888 in b['evidence_global_lines'] for b in d['episodes'][67]['bond_beats'])
assert any(13906 in b['evidence_global_lines'] for b in d['episodes'][67]['bond_beats'])
assert all(a['evidence'][0]['global_line']!=2630 for a in d['episodes'][13]['physical_actions'])
assert 'two-month' in str(d['source_uncertainties'])
print('PASS: 68 slots; all explicit name references retained; every quote and paragraph exact; trust, memory, refusal, chronology and continuation regressions pass.')
