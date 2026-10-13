#!/usr/bin/env python3
"""Lossless source ledger and conservative, unverified lexical action candidates.

This is not a semantic parser. No-match lines remain awaiting review. Named
mentions, clothing words, body words and modal words are evidence cues, never
proof of roles, ownership, consent, nudity, or actual occurrence.
"""
from pathlib import Path
import hashlib
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'data' / 'female_action_review'
SOURCE = ROOT / 'raw' / 'Dhika.txt'
REPO = 'developer-fandom-rush/dhika-sharmi-adventures'

CHARACTERS = {
    'dhika': ['Dhika'], 'sharmi': ['Sharmi'], 'john': ['John'],
    'raj': ['Raj'], 'bantu': ['Bantu'], 'bobby': ['Bobby'],
    'chotu': ['Chotu'], 'uncle': ['Uncle'], 'aunty': ['Aunty'],
    'bindu_maami': ['Bindu Maami', 'Maami'], 'pappu': ['Pappu'],
    'iroh': ['Iroh'], 'zuko': ['Zuko'], 'scott': ['Scott'],
    'leo': ['Leo'], 'stacy': ['Stacy'], 'kate': ['Kate'],
    'jared': ['Jared'], 'ron': ['Ron'], 'stranger': ['Stranger'],
}
# These genders are grounded in the E01 descriptions; additional named people
# remain uncategorized until their own source evidence has been checked.
FEMALES = {'dhika', 'sharmi', 'aunty', 'bindu_maami'}
ACTION_RULES = {
    'touch': r'\b(?:touch(?:ed|ing|es)?|touched)\b',
    'hold': r'\b(?:hold(?:ing|s)?|held)\b',
    'rub': r'\b(?:rub(?:bed|bing|s)?)\b',
    'stroke': r'\b(?:strok(?:e|ed|ing|es))\b',
    'caress': r'\b(?:caress(?:ed|ing|es)?)\b',
    'pinch': r'\b(?:pinch(?:ed|ing|es)?)\b',
    'kiss': r'\b(?:kiss(?:ed|ing|es)?)\b',
    'lick': r'\b(?:lick(?:ed|ing|s)?)\b',
    'bite': r'\b(?:bit(?:e|es|ing)?|bitten)\b',
    'suck': r'\b(?:suck(?:ed|ing|s)?)\b',
    'press': r'\b(?:press(?:ed|ing|es)?)\b',
    'squeeze': r'\b(?:squeez(?:e|ed|es|ing))\b',
    'grab': r'\b(?:grab(?:bed|bing|s)?)\b',
    'pull': r'\b(?:pull(?:ed|ing|s)?)\b',
    'push': r'\b(?:push(?:ed|ing|es)?)\b',
    'hug': r'\b(?:hug(?:ged|ging|s)?)\b',
    'embrace': r'\b(?:embrac(?:e|ed|es|ing))\b',
    'sniff': r'\b(?:sniff(?:ed|ing|s)?)\b',
    'gaze': r'\b(?:gaz(?:e|ed|es|ing)|ogl(?:e|ed|es|ing)|peek(?:ed|ing|s)?|star(?:e|ed|es|ing))\b',
    'see': r'\b(?:see(?:ing|s)?|saw|seen|watch(?:ed|ing|es)?|look(?:ed|ing|s)?)\b',
    'feel': r'\b(?:feel(?:ing|s)?|felt)\b',
    'expose': r'\b(?:expos(?:e|ed|es|ing)|reveal(?:ed|ing|s)?|show(?:ed|ing|s|n)?)\b',
    'clothing_change': r'\b(?:remov(?:e|ed|es|ing)|undress(?:ed|ing|es)?|strip(?:ped|ping|s)?|unbutton(?:ed|ing|s)?|unzip(?:ped|ping|s)?|dress(?:ed|ing|es)?|wear(?:ing|s)?|wore|worn)\b',
    'motion': r'\b(?:bend(?:ing|s)?|bent|lean(?:ed|ing|s)?|kneel(?:ing|s)?|knelt|lay|laid|lying|lie|climb(?:ed|ing|s)?|roll(?:ed|ing|s)?|flipp(?:ed|ing)|wipe(?:d|s)?|wiping|tap(?:ped|ping|s)?|fiddl(?:e|ed|es|ing))\b',
    'body_response': r'\b(?:arous(?:al|e|ed|ing)|tingl(?:e|es|ed|ing)|shiver(?:ed|ing|s)?|trembl(?:e|ed|es|ing)|blush(?:ed|ing|es)?|groan(?:ed|ing|s)?|moan(?:ed|ing|s)?|excited|excitement|wet|moist|hard|erect(?:ion)?|orgasm(?:ed|ing|s)?|climax(?:ed|ing|es)?|cum(?:ming|s)?)\b',
    'sexual_action': r'\b(?:penetrat(?:e|ed|es|ing|ion)|thrust(?:ed|ing|s)?|masturbat(?:e|ed|es|ing|ion)|fuck(?:ed|ing|s)?|hump(?:ed|ing|s)?|grind(?:ing|s)?|ground|pump(?:ed|ing|s)?|fondl(?:e|ed|es|ing)|spank(?:ed|ing|s)?)\b',
    'intent_response': r'\b(?:seduc(?:e|ed|es|ing)|willing|unwilling|accidental(?:ly)?|deliberate(?:ly)?|refus(?:e|ed|es|ing)|resist(?:ed|ing|s)?|agree(?:d|s|ing)?|consent(?:ed|ing|s)?|allow(?:ed|ing|s)?|permi(?:t|tted|ssion)|stop(?:ped|ping|s)?)\b',
}
BODY = re.compile(r"\b(?:hands?|fingers?|thumbs?|palms?|arms?|shoulders?|waist|hips?|stomach|belly|navel|backs?|chest|breasts?|boobs?|tits?|nipples?|cleavage|lips?|mouth|tongue|cheeks?|face|eyes?|neck|hair|skin|legs?|thighs?|knees?|feet|foot|ass|buttocks?|bottom|pussy|vagina|clit(?:oris)?|cock|dick|penis|balls?|groin|crotch|spine)\b", re.I)
CLOTHES = re.compile(r'\b(?:saree|sari|kurti|salwar|shawl|dupatta|bra|panty|panties|underwear|blouse|shirt|t.?shirt|pyjamas?|pajamas?|trousers|pants|shorts|skirt|dress|robe|towel|sleeveless|naked|nude|bare|unclothed)\b', re.I)
MODAL = re.compile(r'\b(?:imagin(?:e|ed|es|ing)|thought|think(?:ing|s)?|dream(?:ed|ing|s)?|remember(?:ed|ing|s)?|memory|memories|wish(?:ed|ing|es)?|want(?:ed|ing|s)?|what if|would|could|might|probably|not|never|didn.t|wasn.t|can.t|will|going to|should)\b', re.I)
COMPILED = {k: re.compile(v,re.I) for k,v in ACTION_RULES.items()}

def spans(pattern, text):
    return [{'text':m.group(), 'start':m.start(), 'end':m.end()} for m in pattern.finditer(text)]

def mentions(text):
    result=[]
    for cid, aliases in CHARACTERS.items():
        for alias in aliases:
            for m in re.finditer(r'\b'+re.escape(alias)+r'\b',text,re.I):
                result.append({'character_id':cid,'text':m.group(),'start':m.start(),'end':m.end()})
    return sorted(result,key=lambda x:x['start'])

def dump(path, obj):
    path.write_text(json.dumps(obj, ensure_ascii=False, separators=(',',':'))+'\n')

def build():
    original=SOURCE.read_bytes()
    text=original.decode('utf-8')
    # LF split preserves the terminal empty segment and reconstructs bytes
    # without inventing a duplicate empty boundary line for each episode.
    lines=text.split('\n')
    headers=[(i,int(m.group(1))) for i,t in enumerate(lines) if (m:=re.fullmatch(r'EPISODE\s+(\d+)',t.strip()))]
    assert [n for _,n in headers]==list(range(1,70))
    sha=hashlib.sha256(original).hexdigest()
    OUT.mkdir(parents=True,exist_ok=True)
    catalog=[]
    all_event_ids=[]
    previous_by_female={}
    # Explicit manually reviewed E01 additions live separately and are merged
    # only after their exact source quotes and line references validate.
    manual_path=ROOT/'data/female_action_review_e01_checked.json'
    manual=json.loads(manual_path.read_text()) if manual_path.exists() else []
    for e in manual:
        assert lines[e['source']['global_line']-1][e['source']['start']:e['source']['end']]==e['source']['quote'],e['event_id']
    for pos,(start,number) in enumerate(headers):
        stop=headers[pos+1][0] if pos+1<len(headers) else len(lines)
        eid=f'E{number:02d}'
        records=[]
        candidates=[]
        for ix in range(start,stop):
            raw=lines[ix]
            local=ix-start+1
            lid=f'{eid}-L{local:04d}'
            ms=mentions(raw)
            females=sorted({m['character_id'] for m in ms}&FEMALES)
            meta=(not raw.strip() or raw.startswith('URL:') or bool(re.fullmatch(r'[=\s\u200b]+',raw)) or raw.startswith('EPISODE '))
            record={'line_id':lid,'global_line':ix+1,'episode_line':local,'text':raw,
                    'line_kind':'metadata_or_blank' if meta else 'source',
                    'review_status':'not_applicable' if meta else 'pending_semantic_review',
                    'character_mentions':ms,'female_mentions':females,'event_ids':[],
                    'is_terminal_empty_segment':ix==len(lines)-1 and raw==''}
            if not meta:
                body=spans(BODY,raw); clothes=spans(CLOTHES,raw); modal=spans(MODAL,raw)
                hits=sorted([(m.start(),m.end(),k,m.group()) for k,rx in COMPILED.items() for m in rx.finditer(raw)])
                for seq,(a,b,kind,token) in enumerate(hits,1):
                    ev_id=f'{lid}-C{seq:02d}'
                    # No lexical candidate asserts who touched whom. These
                    # require clause-level semantic review, including negation.
                    ev={'event_id':ev_id,'episode_id':eid,'line_id':lid,
                        'sequence_in_line':seq,'record_kind':'lexical_candidate',
                        'review_status':'needs_review','female_centres':[],
                        'female_mentions':females,'characters_involved':[],
                        'actor_ids':[],'recipient_ids':[],'observer_ids':[],
                        'initiated_by':None,'action':None,'action_type':None,
                        'reality_status':'unknown','event_state':[],
                        'intent':'unknown','consent':'not_stated',
                        'body_parts_involved':[], 'clothing_state_by_character':{},
                        'contact_layer':'unknown','group_event_id':None,
                        'simultaneous_group_id':None,'previous_event_by_female':{},
                        'source':{'global_line':ix+1,'episode_line':local,'start':a,'end':b,'quote':token},
                        'cues':{'action_family':kind,'body_part_mentions':body,'clothing_mentions':clothes,'modality_negation_mentions':modal},
                        'ambiguity_notes':['Keyword occurrence is not a verified event. Resolve clause, roles, reality, negation and body ownership from context.']}
                    if any(m['character_id']=='pappu' for m in ms):
                        ev['ambiguity_notes'].append('Child is mentioned in this line. Separate domestic/family context from adult events; do not assign an adult action to the child.')
                    candidates.append(ev);record['event_ids'].append(ev_id)
            records.append(record)
        checked=sorted([e for e in manual if e['episode_id']==eid],key=lambda e:(e['source']['global_line'],e['source']['start']))
        for ev in checked:
            row=records[ev['source']['global_line']-1-start]
            row['event_ids'].append(ev['event_id'])
            for centre in ev['female_centres']:
                ev['previous_event_by_female'][centre]=previous_by_female.get(centre)
                previous_by_female[centre]=ev['event_id']
        # Do not mark an entire line/episode as reviewed because one span is
        # checked. Additional actions could be present in that same line.
        events=sorted(candidates+checked,key=lambda x:(x['source']['global_line'],x['source']['start'],x['record_kind']))
        all_event_ids.extend(e['event_id'] for e in events)
        file=f'{eid.lower()}.json'
        pack={'schema_version':'female-action-review-1.0','episode_id':eid,
              'previous_episode_id':f'E{number-1:02d}' if number>1 else None,
              'next_episode_id':f'E{number+1:02d}' if number<69 else None,
              'source_sha256':sha,'global_line_start':start+1,'global_line_end':stop,
              'source_line_count':stop-start,'semantic_review_complete':False,
              'lines':records,'events':events}
        dump(OUT/file,pack)
        catalog.append({'episode_id':eid,'file':f'data/female_action_review/{file}',
                        'global_line_start':start+1,'global_line_end':stop,
                        'source_line_count':len(records),'lexical_candidates':len(candidates),
                        'checked_events':len(checked),'semantic_review_complete':False})
    assert len(all_event_ids)==len(set(all_event_ids))
    preamble=[{'global_line':i+1,'text':t,'review_status':'not_applicable'} for i,t in enumerate(lines[:headers[0][0]])]
    manifest={'schema_version':'female-action-review-1.0','title':'Female-centred source and action review',
        'source':{'repository':REPO,'path':'raw/Dhika.txt','git_blob_sha':'590b4dce02db105b1ff150a118d309fcef7778f2',
                  'git_commit_sha':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),
                  'sha256':sha,'bytes':len(original),'line_numbering':'1-based LF split; terminal empty segment retained; no duplicated episode boundaries',
                  'lf_delimited_segments':len(lines),'physical_lines':text.count('\n'),'episode_count':69},
        'coverage':{'source_preservation_complete':True,'semantic_review_complete':False,
                    'missing_source_lines':0,'duplicate_source_lines':0,
                    'lexical_candidates':sum(e['lexical_candidates'] for e in catalog),
                    'checked_events':len(manual),'reviewed_episodes':0},
        'status_note':'All source lines preserved. Automated lexical candidates across E01–E69 are NOT a complete or verified event extraction. E01 checked spans are explicit separate records. No-match lines still require semantic review.',
        'rules':['Female mentions are not participants. A female centre is assigned only in checked records.',
                 'Empty role/body/clothing fields mean unresolved, not absence.',
                 'Thought, memory, dream, intention, reported event and current occurrence must be separated.',
                 'Consent is not inferred from arousal, silence, nudity, friendship or a prior event.',
                 'One source line can contain multiple actions or group participants. Each checked action has its own roles.',
                 'Chronology links connect checked female-centred records only; they are not causal claims.',
                 'Source text is read-only. Local UI corrections are exported separately and do not modify GitHub.'],
        'preamble_lines':preamble,'episodes':catalog,
        'character_registry':{'dhika':{'gender':'female','age':29,'evidence_global_lines':[9,10]},
                              'sharmi':{'gender':'female','age':None,'evidence_global_lines':[57,58]},
                              'aunty':{'gender':'female','age':'early 60s','evidence_global_lines':[21]},
                              'bindu_maami':{'gender':'female','age':53,'evidence_global_lines':[118]},
                              'chotu':{'age':19,'evidence_global_lines':[120]},
                              'pappu':{'age':'2 / 2.3','family_context_only':True,'evidence_global_lines':[14,111]}},
        'adult_disclaimer':{'global_line':16,'quote':'All sexually involved characters are 18 years and above.'}}
    dump(OUT/'manifest.json',manifest)
    rebuilt='\n'.join([r['text'] for r in preamble]+[r['text'] for e in catalog for r in json.loads((ROOT/e['file']).read_text())['lines']])
    assert rebuilt.encode('utf-8')==original,'Source reconstruction differs'
    print(json.dumps({'episodes':69,'source_segments':len(lines),'bytes':len(original),'candidate_records':manifest['coverage']['lexical_candidates'],'checked_events':len(manual),'source_sha256':sha,'semantic_review_complete':False}))

if __name__=='__main__':
    build()
