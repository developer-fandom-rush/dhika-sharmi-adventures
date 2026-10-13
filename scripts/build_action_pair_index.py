#!/usr/bin/env python3
"""Checked character/pair timeline: direct roles, linked thoughts and responses."""
import itertools,json
from pathlib import Path
from build_female_action_review import CHARACTERS
ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'data/female_action_review/manifest.json').read_text())
characters=[{'id':cid,'name':aliases[0],'aliases':aliases[1:], 'context':'family_only' if cid=='pappu' else 'source_character'} for cid,aliases in CHARACTERS.items()]
events=[];all_scenes=[]
for entry in manifest['episodes']:
    pack=json.loads((ROOT/entry['file']).read_text());rows={r['global_line']:r for r in pack['lines']}
    all_scenes.extend(pack.get('scenes',[]))
    for event in pack['events']:
        if event['record_kind']!='checked_event':continue
        record=dict(event);pair_relations={}
        def pair(a,b,kind):
            if a and b and a!=b:pair_relations.setdefault('__'.join(sorted((a,b))),[]).append(kind)
        for a in event['actor_ids']:
            for b in event['recipient_ids']:pair(a,b,'direct_interaction')
        related=event.get('related_character_ids',[])
        subject=event.get('mental_subject_id')
        owners=[subject] if subject else event['actor_ids']
        for a in owners:
            for b in related:pair(a,b,'thought_about' if event.get('event_domain')=='mental' else 'response_or_context')
        if len(event['actor_ids'])>1:
            for a,b in itertools.combinations(event['actor_ids'],2):pair(a,b,'explicit_shared_action')
        record['pair_keys']=sorted(pair_relations)
        record['pair_relation_by_key']={k:sorted(set(v)) for k,v in pair_relations.items()}
        record['character_ids_for_filter']=sorted(set(event['actor_ids']+event['recipient_ids']+event['observer_ids']+related+([subject] if subject else [])))
        context=set(event.get('context_global_lines',[]))|{event['source']['global_line']}
        for v in event.get('clothing_state_by_character',{}).values():context.update(v.get('evidence_global_lines',[]))
        for v in event.get('body_position_by_character',{}).values():context.update(v.get('evidence_global_lines',[]))
        record['evidence_lines']=[{'global_line':n,'episode_line':rows[n]['episode_line'],'text':rows[n]['text']} for n in sorted(context) if n in rows]
        domain=event.get('event_domain')
        if domain=='family' or event.get('scope')=='family_domestic':category='family'
        elif domain=='mental' or event['reality_status'] in ['imagined','hypothetical','intended','remembered','uncertain_perception']:category='thought'
        elif domain=='reaction':category='response'
        elif domain=='object' or event['contact_layer']=='garment_object':category='object'
        elif domain=='dialogue':category='dialogue'
        elif domain=='perception':category='observation'
        else:category='contact'
        record['interaction_category']=category;events.append(record)
out={'schema_version':'action-pairs-2.0','source_sha256':manifest['source']['sha256'],
     'source_commit_sha':manifest['source']['git_commit_sha'],'repository':manifest['source']['repository'],
     'source_path':manifest['source']['path'],'characters':characters,'character_aliases':manifest.get('character_aliases',{}),
     'events':events,'scenes':all_scenes,
     'scope':{'checked_event_spans':manifest['coverage']['checked_events'],
              'pair_event_records':sum(bool(e['pair_keys']) for e in events),'character_event_records':len(events),
              'checked_span_episodes':sorted({e['episode_id'] for e in events}),
              'complete_episodes':[e['episode_id'] for e in manifest['episodes'] if e['semantic_review_complete']],
              'episode_count':69,'semantic_review_complete':False},
     'note':'E01 scene review is complete within its stated physical/mental/reaction/interaction and family-context scope, with source ambiguities retained. Pair results include clearly labelled thoughts about absent people and related responses. E02–E69 remain unreviewed.'}
(ROOT/'data/action_pair_index.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':'))+'\n')
print(f"{len(events)} character records; {out['scope']['pair_event_records']} pair-linked records; completed episodes {out['scope']['complete_episodes']}")
