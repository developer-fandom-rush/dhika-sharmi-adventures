#!/usr/bin/env python3
"""Check lossless source, scene evidence, state/recall links and canonical roles."""
from pathlib import Path
import hashlib,itertools,json
root=Path(__file__).resolve().parents[1]
load=lambda p:json.loads((root/p).read_text())
m=load('data/female_action_review/manifest.json');raw=(root/'raw/Dhika.txt').read_bytes();source=raw.decode('utf-8').split('\n')
assert hashlib.sha256(raw).hexdigest()==m['source']['sha256']
assert len(raw)==m['source']['bytes'] and len(source)==m['source']['lf_delimited_segments']==14046
assert len(m['episodes'])==69 and not m['coverage']['semantic_review_complete']
assert m['coverage']['reviewed_episodes']==1
reconstructed=list(m['preamble_lines']);ids=set();checked=[];candidates=[];prev={};packs={}
for number,entry in enumerate(m['episodes'],1):
 p=load(entry['file']);packs[p['episode_id']]=p
 assert entry['episode_id']==p['episode_id']==f'E{number:02d}'
 assert p['source_sha256']==m['source']['sha256']
 assert p['semantic_review_complete']==(number==1)
 assert p['source_line_count']==len(p['lines'])==entry['source_line_count']
 assert p['lines'][0]['text']==f'EPISODE {number}'
 assert p['previous_episode_id']==(f'E{number-1:02d}' if number>1 else None)
 assert p['next_episode_id']==(f'E{number+1:02d}' if number<69 else None)
 rows={r['line_id']:r for r in p['lines']};events={e['event_id']:e for e in p['events']}
 assert len(events)==len(p['events'])
 for i,row in enumerate(p['lines'],1):
  assert row['global_line']==p['global_line_start']+i-1 and row['episode_line']==i
  assert row['text']==source[row['global_line']-1]
  assert row['review_status']=='reviewed' if number==1 else row['review_status'] in ['pending_semantic_review','not_applicable']
  assert all(id in events for id in row['event_ids'])
 reconstructed.extend(p['lines'])
 for e in p['events']:
  assert e['event_id'] not in ids;ids.add(e['event_id']);row=rows[e['line_id']];q=e['source']
  assert q['global_line']==row['global_line'] and q['episode_line']==row['episode_line']
  assert row['text'][q['start']:q['end']]==q['quote']
  assert e['event_id'] in row['event_ids'] and e['action_type'] in [None,1,2]
  assert e['consent']=='not_stated'
  if e['record_kind']=='lexical_candidate':
   candidates.append(e);assert number!=1 and e['review_status']=='needs_review'
   assert not e['female_centres'] and not e['actor_ids'] and not e['recipient_ids']
   assert e['action'] is None and e['reality_status']=='unknown'
   for family in ['body_part_mentions','clothing_mentions','modality_negation_mentions']:
    for span in e['cues'][family]:assert row['text'][span['start']:span['end']]==span['text']
  elif e['record_kind']=='checked_event':
   checked.append(e);assert number==1 and e['review_status']=='scene_reviewed'
   for female in e['female_centres']:
    assert e['previous_event_by_female'][female]==prev.get(female);prev[female]=e['event_id']
   assert all(1<=n<=len(source) for n in e['context_global_lines'])
  else:raise AssertionError('Unknown record kind')
assert [r['global_line'] for r in reconstructed]==list(range(1,len(source)+1))
assert '\n'.join(r['text'] for r in reconstructed).encode('utf-8')==raw
assert len(checked)==m['coverage']['checked_events'] and len(candidates)==m['coverage']['lexical_candidates']
e01=packs['E01'];scenes=e01['scenes'];sc_by={s['scene_id']:s for s in scenes};ev={e['event_id']:e for e in checked}
assert [n for s in scenes for n in range(s['global_line_start'],s['global_line_end']+1)]==list(range(3,231))
assert len(e01['lines'])==228 and all(r['scene_id'] in sc_by for r in e01['lines'])
assert all(r['review_disposition'] for r in e01['lines'])
for e in checked:
 s=sc_by[e['scene_id']];assert s['global_line_start']<=e['source']['global_line']<=s['global_line_end']
 assert e['event_id'] in s['event_ids']
 for field in ['trigger_event_ids','recall_of_event_ids','reaction_to_event_ids','linked_response_event_ids','about_prior_event_ids']:
  assert all(id in ev for id in e.get(field,[]))
 for ref in e['recall_of_event_ids']:assert ev[ref]['source']['global_line']<e['source']['global_line']
 for field in ['clothing_state_by_character','body_position_by_character']:
  for value in e[field].values():assert all(3<=n<=230 for n in value['evidence_global_lines'])
 if e.get('mental_subject_id'):assert not e['recipient_ids'],'A thought about someone must not make them its physical recipient'
 assert 'ron' not in e['characters_involved'] and 'roh' not in e['characters_involved']
# Regression checks for the reported scene/context failures.
def find(action,line=None):return next(e for e in checked if e['action']==action and (line is None or e['source']['global_line']==line))
glass=find('bend_to_hand_glass');assert set([117,130,145])<=set(glass['clothing_state_by_character']['dhika']['evidence_global_lines'])
assert 'Bending' in glass['body_position_by_character']['dhika']['description']
assert glass['linked_response_event_ids'] and find('stop_laughing')['event_id'] in glass['linked_response_event_ids']
night=find('recall_first_glass_scene');assert 'bed' in night['body_position_by_character']['dhika']['description']
assert 'Pyjamas' in night['clothing_state_by_character']['dhika']['description']
assert 'kurti' in night['referenced_scene_context']['clothing_state_by_character']['dhika']['description']
assert night['recall_of_event_ids'] and night['related_character_ids']==['chotu'] and not night['recipient_ids']
assert not find('notice_john_absence').get('referenced_scene_context')
assert find('lightly_hit_shoulder')['recipient_ids']==['bobby']
assert find('tap_stomach')['contact_layer']=='through_clothing'
assert find('rub_bare_hip')['contact_layer']=='direct_skin'
assert find('make_eye_contact')['initiated_by'] is None
assert not any(e['action'] in ['kiss','lick','touch'] and 'chotu' in e['characters_involved'] for e in checked)
assert find('feel_tingle_between_legs')['reaction_to_event_ids']!=[find('take_payment')['event_id']]
assert m['character_aliases']['Ron']==m['character_aliases']['Roh']=='john'
assert m['character_registry']['chotu']['age']==19 and '19 year old' in source[119]
p=load('data/action_pair_index.json');assert p['source_sha256']==m['source']['sha256'] and p['scope']['complete_episodes']==['E01']
assert len(p['events'])==len(checked)
assert not any(c['id'] in ['ron','roh'] for c in p['characters'])
assert next(c for c in p['characters'] if c['id']=='john')['aliases']==['Ron','Roh']
for e in p['events']:
 original=ev[e['event_id']];assert e['actor_ids']==original['actor_ids'] and e['recipient_ids']==original['recipient_ids']
 expected={'__'.join(sorted((a,b))) for a in e['actor_ids'] for b in e['recipient_ids'] if a!=b}
 owners=[e['mental_subject_id']] if e.get('mental_subject_id') else e['actor_ids']
 expected|={'__'.join(sorted((a,b))) for a in owners for b in e.get('related_character_ids',[]) if a!=b}
 expected|={'__'.join(sorted((a,b))) for a,b in itertools.combinations(e['actor_ids'],2)}
 assert e['pair_keys']==sorted(expected)
 assert all(r['text']==source[r['global_line']-1] for r in e['evidence_lines'])
 assert e['interaction_category'] in ['contact','observation','thought','object','dialogue','response','family']
assert p['scope']['pair_event_records']==sum(bool(e['pair_keys']) for e in p['events'])
assert not any('sharmi__uncle' in e['pair_keys'] for e in p['events'])
print(f'PASS: E01 {len(scenes)} scene/context sections, {len(checked)} reviewed records, 228 reviewed source segments; context, recall, response and alias regressions pass.')
print(f'PASS: all 69 episodes reconstruct {len(raw)} original bytes exactly. E02–E69 ({len(candidates)} candidates) remain unreviewed.')
