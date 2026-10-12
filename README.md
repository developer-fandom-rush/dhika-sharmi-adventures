# Dhika & Sharmi Adventures — Source-Locked Director Dashboard

This repository houses a preserved copy of the author's raw story and a source-indexed analysis of Episode 01.

## Review
Open `index.html` on a static web server or enable GitHub Pages for the repository root of `main`.

## Six interconnected JSON datasets
- `data/episodes/e01.json`: all 229 raw E01 lines, grouped into ordered scene beats.
- `data/physical_actions.json`: character-wise physical actions from E01, with exact source excerpts.
- `data/bond_evolution.json`: append-only character/relationship baselines and changes.
- `data/internal_heat_access.json`: exact evidence of private reactions, observed attention, access, and boundaries.
- `data/escalation_patterns.json`: ordered narrative/escalation pattern ledger, strictly source-based.
- `data/arousal_reader_curiosity.json`: how the original narrative conveys arousal and withholds information.

`raw/Dhika.txt` contains the complete original, including E01–E69, unmodified from the Drive source. Other episodes are preserved but **not analyzed** in this iteration.

## Integrity principles
1. `raw_lines[*].text` is an exact unedited line from the author’s source. Explanatory labels and interpretations are separate fields.
2. Every `line_start`/`line_end` is local to Episode 01, where `EPISODE 1` is line 1. Blank lines count.
3. All 229 lines are included once in the episode index; evidence pointers link back to it.
4. Relationships and character records are append-only in later episode additions; previous episode events are not rewritten into summaries.
5. `observed`, `narrated_private`, `inferred`, and `unknown` remain distinct.
6. Nonconsensual behavior is recorded as a boundary issue, not automatically treated as consensual intimacy.
7. Pappu is a child and remains in family context, never sexualized.
8. The raw source remains the primary evidence. Verify a cited line in the dashboard before relying on a conclusion.

## Privacy
**This GitHub repository is public.** Anyone who can access the repository can read `raw/Dhika.txt`.

## Local use
Serve this folder with any local HTTP server, e.g. `python -m http.server 8000`, then open `http://localhost:8000`. GitHub Pages may be enabled in **Settings → Pages → Deploy from branch → main → /(root)**.

No API keys or external JavaScript libraries required.

## Verifying source integrity

Run `node scripts/validate.mjs` from the repository root. It checks the source heading order, all 229 E01 lines, every quoted evidence field across the six JSON files, each record's episode/line coordinates, and duplicate IDs. The JSON records were also cross-checked against the source during the initial upload.

## Dashboard review workflow

Select a dataset tab, optionally filter by character, then choose a record. The right pane shows the author's exact cited source lines and a link into `raw/Dhika.txt`. Related source records across the other five datasets appear beneath the inspector controls. Tick the checkbox only after you verify a record. Marks are held in browser local storage and do not modify the repository.

GitHub Pages has not been confirmed active. To publish a static dashboard URL, go to repository **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/(root)**, then save. GitHub will provide the published address when deployment completes.

## AI Director learning from E01 (hypothetical, NOT the actual E02)
- `data/ai_director_e01.json`: 23 exact phrase triggers, one group-encounter participant matrix (Dhika/Bantu/Bobby), nine candidate next-episode execution scenes, and four practice drills.
- Browser tabs: **AI Director**, **Trigger Words**, **Practice**. The source viewer highlights verified trigger wording using exact character spans from `raw/Dhika.txt`.
- Every proposed scene has ordered position, character list, setting, conversation topic, **physical action name only**, heat level (0–5), reader curiosity level, E01 source evidence, an unresolved hook, and a canon/consent checkpoint.
- E01 is the only analyzed canon episode; hypothetical scenes are forecasts, not things that happened in the real E02. This distinction must never be erased.
- The projected peak candidate `Brief consensual handholding` is conditional on the involved adults freely choosing it on-page; if there is no mutual choice, `No touch` is the fallback.
- Group events: use an encounter ID with **separate motive, knowledge and action states per participant** rather than duplicating the same source passage as independent character progression.
