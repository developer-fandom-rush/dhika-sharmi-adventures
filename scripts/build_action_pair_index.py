#!/usr/bin/env python3
"""Publish a small end-user index of checked interactions, not keyword matches."""
import json
from pathlib import Path
from build_female_action_review import CHARACTERS

ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'data/female_action_review/manifest.json').read_text())
characters=[{'id':cid,'name':aliases[0],'context':'family_only' if cid=='pappu' else 'source_character'} for cid,aliases in CHARACTERS.items()]
events=[]
for entry in manifest['episodes']:
    pack=json.loads((ROOT/entry['file']).read_text())
    rows={r['global_line']:r for r in pack['lines']}
    for event in pack['events']:
        if event['record_kind']!='checked_event':continue
        # A pair requires supported directed roles. Co-occurrence and female
        # centre alone must not create a relationship/action edge.
        pairs=sorted({tuple(sorted((a,b))) for a in event['actor_ids'] for b in event['recipient_ids'] if a!=b})
        if not pairs:continue
        record=dict(event)
        record['pair_keys']=['__'.join(p) for p in pairs]
        context=set(event.get('context_global_lines',[]))|{event['source']['global_line']}
        record['evidence_lines']=[{'global_line':n,'episode_line':rows[n]['episode_line'],'text':rows[n]['text']} for n in sorted(context) if n in rows]
        if event['reality_status'] in ['imagined','hypothetical','intended','remembered','uncertain_perception']:
            category='thought'
        elif event['contact_layer']=='garment_object':category='object'
        elif event['action'] in ['say_kisses_on_phone','permit_holding_for_balance']:category='dialogue'
        elif event['contact_layer']=='no_contact' or event['action'].startswith(('see_','gaze_','look_')):category='observation'
        else:category='contact'
        record['interaction_category']=category
        events.append(record)
out={'schema_version':'action-pairs-1.0','source_sha256':manifest['source']['sha256'],
     'source_commit_sha':manifest['source']['git_commit_sha'],'repository':manifest['source']['repository'],
     'source_path':manifest['source']['path'],'characters':characters,'events':events,
     'scope':{'checked_event_spans':manifest['coverage']['checked_events'],
              'pair_event_records':len(events),'checked_span_episodes':sorted({e['episode_id'] for e in events}),
              'complete_episodes':[],'episode_count':69,'semantic_review_complete':False},
     'note':'Only checked actor-to-recipient interactions appear. No result means no checked record in the current dataset, not that the story contains no interaction.'}
(ROOT/'data/action_pair_index.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':'))+'\n')
print(f'{len(events)} checked pair records; full story verification remains pending.')
