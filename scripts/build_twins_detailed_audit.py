"""Compile manually authored neutral audit annotations; never extract via name matches.

A record may cover a linked request/response sequence. These records supplement the
original granular ledgers and are not an exhaustive atomic-event certification.
"""
import hashlib
import json
import re
from pathlib import Path

def fnv(text):
    h=2166136261
    units=text.encode('utf-16-le')
    for i in range(0,len(units),2): h=((h^(units[i]+256*units[i+1]))*16777619)&0xffffffff
    return f'{h:08x}'

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'raw/Dhika.txt'

def build():
    raw = SOURCE.read_bytes()
    lines = raw.decode().splitlines()
    nav = json.loads((ROOT/'data/twins_e01_e68_navigation_review_v1.json').read_text())
    episodes = nav['episodes']
    events = []
    line_counts = {}
    for path in sorted((ROOT/'scripts/twins_audit').glob('*.tsv')):
        for row, text in enumerate(path.read_text().splitlines(), 1):
            if not text or text.startswith('#'): continue
            fields = text.split('|')
            assert len(fields) == 8, (path, row, fields)
            anchor, track, actor, recipient, kind, outcome, action, knowledge = fields
            span = list(map(int, anchor.split(':')))
            a, b = span[0], span[-1]
            ep = next(e for e in episodes if e['source'][0] <= a <= b <= e['source'][1])['episode']
            context = [s for s in nav['sections'] if s['episode'] == ep and s['source'][0] <= a <= s['source'][1]]
            section = context[0] if context else None
            frame = section['frame'] if section else 'source_sequence'
            if 12943<=a<=13004 or 13009<=a<=13017 or 13027<=a<=13055 or 13173<=a<=13391 or 13401<=a<=13467: frame='flashback'
            if kind in ('dream','preview','replay','hypothetical','counterfactual'): frame=kind
            if kind.startswith('flashback') or outcome == 'narrated_flashback': frame = 'flashback'
            if kind in ('private_thought','private_intention','private_reaction'): frame = 'private_thought'
            digest = hashlib.sha256('\n'.join(lines[a-1:b]).encode()).hexdigest()
            line_counts[a] = line_counts.get(a, 0) + 1
            events.append(dict(id=f'DET-E{ep:02d}-L{a}-{line_counts[a]:02d}', episode=ep,
                line=a, end_line=b, source=[a,b], track=track, actor=actor, recipient=recipient,
                kind=kind, outcome=outcome, action=action, knowledge_limit=knowledge,
                frame=frame, section_id=section['id'] if section else None,
                source_ref=f'raw/Dhika.txt#L{a}-L{b}', source_sha256=digest,
                source_line_checksum_fnv1a=fnv(lines[a-1]),
                shared_scene=any(x<=a<=y for x,y in [(3111,3202),(3229,3341),(3744,3829),(6793,6813),(7026,7271)]),
                review='source_checked_neutral_sequence', atomic_complete=False,
                authored_in=f'{path.relative_to(ROOT)}:{row}'))
    events.sort(key=lambda e: (e['line'], e['id']))
    context_review = json.loads((ROOT/'scripts/twins_audit/context_review.json').read_text())
    for r in context_review:
        a,b=r['source']
        r['source_sha256']=hashlib.sha256('\n'.join(lines[a-1:b]).encode()).hexdigest()
        r['atomic_complete']=False
    continuity=json.loads((ROOT/'scripts/twins_audit/continuity.json').read_text())
    for fact in continuity:
        fact['episodes']=sorted({e['episode'] for a,b in fact['sources'] for e in episodes if e['source'][0]<=a<=b<=e['source'][1]})
        fact['source_hashes']=[hashlib.sha256('\n'.join(lines[a-1:b]).encode()).hexdigest() for a,b in fact['sources']]
    review_by_episode=[]
    for ep in episodes:
        e=ep['episode'];count=sum(r['episode']==e for r in events)
        status='EXISTING_DETAILED_LEDGER' if e<=13 else 'DETAILED_SEQUENCE_REVIEW' if count else 'CONTEXT_REVIEW_NO_TWIN_EVENT_IDENTIFIED'
        review_by_episode.append(dict(episode=e,status=status,new_sequence_records=count,atomic_complete=False))
    return dict(schema='twins_detailed_source_audit_v1', date='2026-10-15', source='raw/Dhika.txt',
        source_sha256=hashlib.sha256(raw).hexdigest(), atomic_complete=False,
        policy=['Manually authored source checks; no lexical extraction is called a semantic audit.',
            'Neutral sequence annotations supplement earlier action records; some linked steps share a record.',
            'Actor, recipient, outcome and knowledge limits remain separate; silence is not blanket consent.',
            'Original source and all earlier ledgers remain unchanged.',
            'Unresolved source ambiguities remain visible. No exhaustive episode sign-off is inferred from record counts.'],
        reviewed_episodes=sorted(set(e['episode'] for e in events)), context_review=context_review, continuity=continuity, review_by_episode=review_by_episode, events=events)

if __name__ == '__main__':
    data=build()
    (ROOT/'data/twins_detailed_source_audit_v1.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    print(f"Wrote {len(data['events'])} source-checked sequence records across {len(data['reviewed_episodes'])} episodes")
