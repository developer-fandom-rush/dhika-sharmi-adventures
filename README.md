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
