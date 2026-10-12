# Dhika & Sharmi Adventures — source-locked analysis dashboard

The **current active scope is Episodes 01 and 02**. The original raw text is preserved at `raw/Dhika.txt` (all 69 episode headings). E03 onward has not been analyzed.

**Dashboard:** https://developer-fandom-rush.github.io/dhika-sharmi-adventures/

## How to use

1. Choose **Episode 01** or **Episode 02** at the top; E02 is the default.
2. Open **Inner Evolution ★** to see *prior state → newly evidenced reaction/change*, one source-linked observation per checkpoint.
3. Select **Dhika**, **John**, **Uncle**, **Bantu**, **Bobby**, **Chotu**, or **Sharmi** in the character dropdown; source records remain episode-local.
4. Open **Trigger Words ✦** for exact highlighted author phrases and their specific importance. A sensual description is distinguished from a motive change, explicit thought, breach, callback or payoff.
5. Use **Group Events** to review a shared source passage once, with separate action/knowledge states for each actor. Individual history is not flattened into the group.
6. Other tabs retain source-indexed physical actions, bond evolution, internal access, escalation and reader curiosity.
7. Compare any statement to the verbatim source panel. The checkbox is **only your local review mark**; it does not send feedback to GitHub or modify source.

## Original and structured files

- `raw/Dhika.txt` — unchanged canonical raw source.
- `data/episodes/e01.json` — 229/229 lines in 44 indexed windows.
- `data/episodes/e02.json` — 160/160 lines in 28 indexed windows.
- `data/character_inner_evolution.json` — append-only person-specific psychological transitions across E01/E02.
- `data/reader_triggers.json` — author-exact highlighted phrases with precise offsets, source line and distinct significance.
- `data/group_encounters.json` — shared scenes plus participant-specific action/knowledge.
- `data/physical_actions.json`
- `data/bond_evolution.json`
- `data/internal_heat_access.json`
- `data/escalation_patterns.json`
- `data/arousal_reader_curiosity.json`

**Director predictions are paused.** The old E01-only forecast remains at `data/ai_director_e01.json` as an explicitly hypothetical historical artifact. It is not loaded into the current dashboard, and is not a claim about actual E02.

## Source rules

- Source text is never paraphrased inside `raw_lines[*].text`, `source_line`, or `shared_raw_lines`. Preserve spelling and punctuation, even typos.
- `line_start` and `line_end` use **episode-local** line numbers, counting blank lines; the viewer links to master file line numbers correctly.
- Metadata, character-change tags and significance explanations are **analysis**, not quotations.
- Interactions distinguish what characters know, what the reader knows, choice versus accident, contact versus looking and violation versus permission.
- E01 data stays intact when E02 records are appended. Do not silently compact prior states.
- Child characters are family-context only, never included in adult intimacy/action metrics.

## Integrity & development

Run `node scripts/validate.mjs` and `node --check app.js`. GitHub Actions runs these checks on changes. They verify all source excerpts, complete timeline line coverage, the indexed psychological changes, group source passages, and each highlighted exact phrase.

To run locally, serve the repository root via `python -m http.server 8000` and open `http://localhost:8000`. Opening `index.html` directly via `file://` will not load JSON in many browsers.

**Privacy warning:** this repository and `raw/Dhika.txt` are **public**.
