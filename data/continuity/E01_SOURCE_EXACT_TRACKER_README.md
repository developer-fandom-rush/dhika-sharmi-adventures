# Episode 01 — Source-Exact Character Continuity Vault

**Scope:** Two DISTINCT fictional works: **DHIKA E01** and **FWFS E01**. Never merge their events or characters as if they share a canon.

## Mandatory rules — for any new chat/editor

1. **DO NOT SUMMARIZE THE EPISODE OR REPLACE ITS LAYOUT WITH A SHORT VERSION.** The original exact prose, scene order, stage directions, dialogue, perspective changes, physical interactions, observations, private thoughts and ambiguous points remain in the PRIMARY source files.
2. Treat the tracker as a **locator and relationship evidence index**, not as a replacement for prose. For every claim or revision, open the indicated source and read the **entire relevant original range**. When needed, extend one scene backward/forward rather than inferring from an isolated keyword.
3. Track **observer vs subject**, **physical contact vs observation**, **what narrator reveals vs what each character knows**, **intent vs accident**, **consent vs absence of consent**, **actual vs imagined**, **part-specific outfits and locations**, and **what remains unresolved**. Never invent anatomical details, actions or precise physiological states that are not established in the exact source.
4. Character, relationship and search-facet tags are metadata to navigate sources; some facets are keyword-detected search aids and **DO NOT themselves confirm an event happened**. Present detailed original lines when user requests evidence. Do not replace the source with a condensed beat map.
5. Preserve chronology and version boundaries. The FWFS Part 7 single current reading order is **Shreya Tuesday 9:25 AM → Taniya 2:00 PM → Ankita 4:03 PM → Shivani ~7 PM**. Parts 3–4 and several other draft approvals remain pending; **FWFS E01 is not fully canon-locked** merely because P7 has a full reader.
6. Keep Grok/user supplied original manuscripts unchanged in their archives. New revisions need independent review and separate versions. Do not silently revise graphical text or overwrite source.
7. Source references must remain stable, and new notes should cite exact E01-L / FWFS-E01-Pxx-L / reader block IDs. Store **source evidence**, not unverified interpretation.

## Tracker pointers

### DHIKA E01 — original source only
- Source-exact tracker: `data/continuity/dhika_e01_source_exact_tracker_v1.json`
- Read-only original line source: `data/episodes/e01.json` — **229 exact local E01 lines**, indexed into **44 original source events**.
- Independent line-range evidence: `data/director_reanalysis_e01_line_index_v1.json` — 34 editorial evidence ranges; descriptions are commentary, NOT new source facts.
- Master source: `raw/Dhika.txt` (do not modify).
- Character/relationship ledger: 11 evidence-linked relationship edges in DHIKA tracker.

### FWFS E01 — working fiction and candidate readers
- Source-exact tracker: `data/continuity/fwfs_e01_source_exact_tracker_v1.json`
- Source anchor coverage: **P1 55 paragraph IDs; P2 226 labelled lines; P3 24 prose beats; P4 four director plans (NOT completed prose); P5 280 numbered lines; P6 82 indexed paragraph blocks; P7 232 source-exact reader blocks**.
- P1 and P3 original/current reading copy source: `four-walls-story-lab/index.html` keyed by `FWFS-E01-P01-Lxxx` or `FWFS-E01-P3-X-Lxxx`.
- P2: `data/stories/e01_part2_complete_working_draft.md`
- P4: `data/stories/e01_part4_*_director_*.md` — director plans, not accepted final prose.
- P5: `data/stories/e01_part5_selective_merge_v1.md`
- P6: `data/stories/e01_part6_the_four_decisions_draft.md`
- P7: `data/stories/e01_part7_shreya_grok_reader_v3.json`, `data/stories/e01_part7_taniya_grok_reader_v2.json`, `data/stories/e01_part7_ankita_grok_reader_v1.json`, `data/stories/e01_part7_shivani_grok_reader_v1.json`
- One chronological reader: `data/stories/e01_part7_four_encounters_working_reader_v2_20261024.md`. This is only **Part 7**, not the entire episode's final approved canon.

## How to use in a future chat

Open both tracker JSON files. Filter by **character pair, event category, source part and evidence status**. For a finding, fetch the exact original prose from the listed primary source using the line ID or JSON block ID. If asked to change an event, first show the precise source boundary, what is known, what is not, and proposed downstream effects; request director approval before changing primary text. Do not substitute a summary for the source or flatten graphic passages into generic statements.

## UI

The Story Lab provides separate **DHIKA E01 Source Vault** and **FWFS E01 Source Vault** views. Both let readers filter indexed observations, physical acts, inner-thought references, dialogue and privacy/boundary evidence, then expand the exact original source passage on demand. The two stories do not share a canon.
