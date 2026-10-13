#!/usr/bin/env python3
"""Check lossless bytes, exact spans, references, chronology and review claims."""
from pathlib import Path
import hashlib,json

root=Path(__file__).resolve().parents[1]
load=lambda p:json.loads((root/p).read_text())
manifest=load('data/female_action_review/manifest.json')
raw=(root/'raw/Dhika.txt').read_bytes()
source=raw.decode('utf-8').split('\n')
assert hashlib.sha256(raw).hexdigest()==manifest['source']['sha256']
assert len(raw)==manifest['source']['bytes']
assert len(source)==manifest['source']['lf_delimited_segments']==14046
assert len(manifest['episodes'])==69
assert manifest['coverage']['semantic_review_complete'] is False
assert manifest['coverage']['reviewed_episodes']==0
reconstructed=list(manifest['preamble_lines'])
ids=set();checked=[];candidates=[];prev={}
for number,entry in enumerate(manifest['episodes'],1):
    p=load(entry['file'])
    assert entry['episode_id']==p['episode_id']==f'E{number:02d}'
    assert p['source_sha256']==manifest['source']['sha256']
    assert p['semantic_review_complete'] is False
    assert p['source_line_count']==len(p['lines'])==entry['source_line_count']
    assert p['lines'][0]['text']==f'EPISODE {number}'
    assert p['previous_episode_id']==(f'E{number-1:02d}' if number>1 else None)
    assert p['next_episode_id']==(f'E{number+1:02d}' if number<69 else None)
    rows={r['line_id']:r for r in p['lines']}
    events={e['event_id']:e for e in p['events']}
    assert len(events)==len(p['events'])
    for i,row in enumerate(p['lines'],1):
        assert row['global_line']==p['global_line_start']+i-1
        assert row['episode_line']==i
        assert row['text']==source[row['global_line']-1]
        assert row['review_status'] in ['pending_semantic_review','not_applicable']
        assert all(id in events for id in row['event_ids'])
    reconstructed.extend(p['lines'])
    for e in p['events']:
        assert e['event_id'] not in ids;ids.add(e['event_id'])
        row=rows[e['line_id']];q=e['source']
        assert q['global_line']==row['global_line']
        assert q['episode_line']==row['episode_line']
        assert row['text'][q['start']:q['end']]==q['quote']
        assert e['event_id'] in row['event_ids']
        assert e['action_type'] in [None,1,2]
        assert e['consent']=='not_stated'
        if e['record_kind']=='lexical_candidate':
            candidates.append(e)
            assert e['review_status']=='needs_review'
            assert not e['female_centres'] and not e['actor_ids'] and not e['recipient_ids']
            assert e['action'] is None and e['reality_status']=='unknown'
            for family in ['body_part_mentions','clothing_mentions','modality_negation_mentions']:
                for span in e['cues'][family]:
                    assert row['text'][span['start']:span['end']]==span['text']
        elif e['record_kind']=='checked_event':
            checked.append(e)
            assert e['episode_id']=='E01' and e['review_status']=='checked_span'
            for female in e['female_centres']:
                assert e['previous_event_by_female'][female]==prev.get(female)
                prev[female]=e['event_id']
            assert all(1<=n<=len(source) for n in e['context_global_lines'])
        else:raise AssertionError('Unknown record kind')
assert [r['global_line'] for r in reconstructed]==list(range(1,len(source)+1))
assert '\n'.join(r['text'] for r in reconstructed).encode('utf-8')==raw
assert len(checked)==manifest['coverage']['checked_events']==59
assert len(candidates)==manifest['coverage']['lexical_candidates']
# Key E01 semantic guards from the directly inspected source.
assert not any(e['action'] in ['kiss','lick','touch'] and 'chotu' in e['characters_involved'] for e in checked)
assert next(e for e in checked if e['action']=='tap_stomach')['contact_layer']=='through_clothing'
assert next(e for e in checked if e['action']=='rub_bare_hip')['contact_layer']=='direct_skin'
assert next(e for e in checked if e['action']=='question_possible_viewing')['action_type']==1
assert next(e for e in checked if e['action']=='make_eye_contact')['initiated_by'] is None
assert manifest['character_registry']['chotu']['age']==19
assert '19 year old' in source[manifest['character_registry']['chotu']['evidence_global_lines'][0]-1]
print(f'PASS: 69 episodes; {len(source)} unique segments; original bytes exact; {len(candidates)} unverified candidates; {len(checked)} checked E01 spans. Semantic review incomplete.')
