"""Verify source integrity and the new all-episode tracker wiring."""
import hashlib
import json
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]


def fnv(s):
    h=2166136261
    # JavaScript charCodeAt operates on UTF-16 code units.
    b=s.encode('utf-16-le')
    for i in range(0,len(b),2):
        h=((h^(b[i]+256*b[i+1]))*16777619)&0xffffffff
    return f'{h:08x}'


def main():
    raw=(ROOT/'raw/Dhika.txt').read_bytes()
    assert hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()=='590b4dce02db105b1ff150a118d309fcef7778f2', 'Canonical source changed'
    lines=raw.decode().split('\n')
    d=json.loads((ROOT/'data/twins_e01_e68_navigation_review_v1.json').read_text())
    assert d['source_sha256']==hashlib.sha256(raw).hexdigest()
    assert d['atomic_complete'] is False
    assert [x['episode'] for x in d['episodes']]==list(range(1,69))
    previous=2
    for ep in d['episodes']:
        a,b=ep['source']
        assert a==previous+1
        assert lines[a-1]==f"EPISODE {ep['episode']}"
        assert lines[b]==f"EPISODE {ep['episode']+1}"
        assert ep['line_count']==b-a+1
        assert ep['semantic_complete'] is False
        expected=[n for n in range(a,b+1) if re.search(r'\b(?:Bantu|Bobby|twins?)\b',lines[n-1],re.I)]
        assert ep['explicit_name_lines']==expected
        previous=b
    assert previous==13912
    ids=set()
    for r in d['sections']:
        assert r['id'] not in ids;ids.add(r['id'])
        a,b=r['source'];ep=d['episodes'][r['episode']-1]
        assert ep['source'][0]<=a<=b<=ep['source'][1]
        assert r['track'] in ['DB','DY','TRIO','DBC']
        assert r['atomic_complete'] is False
        assert hashlib.sha256('\n'.join(lines[a-1:b]).encode()).hexdigest()==r['source_sha256']
        assert r['id'] in ep['section_ids']
    count=0
    for e in [11,12,13]:
        p=ROOT/f'data/twins_e{e}_source_ledger_v1.json';ledger=json.loads(p.read_text())
        a,b=ledger['source_range']
        assert len(ledger['line_index'])==b-a+1
        for row in ledger['line_index']:
            assert row['source_checksum_fnv1a']==fnv(lines[row['line']-1]), (p,row['line'])
        for event in ledger['events']:
            assert event['source_line_checksum_fnv1a']==fnv(lines[event['line']-1]), (p,event['id'])
            count+=1
    js=(ROOT/'unified-pair-tracker.js').read_text()
    paths=re.search(r'const loadPaths=\[(.*?)\];',js,re.S)[1]
    for rel in re.findall(r'loc\+"([^"]+)"',paths):
        assert (ROOT/'data'/rel.split('?')[0]).is_file(), rel
    assert all(f'twins_e{e}_source_ledger_v1.json' in paths for e in [11,12,13])
    css=(ROOT/'unified-pair-tracker.css').read_text()
    assert 'color-scheme:light' in css and 'color-scheme:dark' not in css
    html=(ROOT/'unified-pair-tracker.html').read_text()
    assert 'tracker-hub.html' in html and 'id="shared"' in html and 'id="checks"' in html
    print(f'PASS: immutable raw source; 68 contiguous episode ranges / 13,910 original lines; {len(ids)} section hashes; {count} E11–E13 event checksums; data wiring; light theme.')
    print('LIMIT: source and structural validation do not certify exhaustive semantic/atomic extraction.')


if __name__=='__main__':main()
