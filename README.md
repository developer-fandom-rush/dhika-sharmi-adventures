# Dhika & Sharmi Adventures — source-locked analysis dashboard

The **fully integrated interactive source-evidence dashboard covers E01–E03**. E04 has a separate new director-analysis pack and E05 has a blind, hypothetical forecast. The unmodified original remains at `raw/Dhika.txt` (69 episode headings).

**Dashboard:** https://developer-fandom-rush.github.io/dhika-sharmi-adventures/

## How to use

1. Open **Relationship Timeline ★** (the default view). Choose a pair such as **Dhika ↔ Uncle**; choose **All Episodes (E01 + E02 + E03)** to see continuous chronological evidence, or select one episode. Use **Evidence** to isolate inner thoughts, bond changes, physical actions or exact triggers.
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
- `data/episodes/e03.json` — 240/240 lines in 25 indexed windows.
- `data/character_inner_evolution.json` — append-only person-specific psychological transitions across E01/E02/E03.
- `data/reader_triggers.json` — author-exact highlighted phrases with precise offsets, source line and distinct significance.
- `data/group_encounters.json` — shared scenes plus participant-specific action/knowledge.
- `data/relationship_links.json` — explicit relationship pointers for 58 inner-state records; the original E01/E02 mind records were not rewritten.
- `data/atomic_action_registry.json` — **active Physical Actions registry**: 35 complete verbatim shared scene windows, 134 atomic named actions, direct quote offsets, preserved author metaphors, and actual vs imagined vs historical distinction.
- `data/physical_actions.json` — legacy broad-label index preserved as history; **not loaded** by the active Physical Actions tab.
- `data/bond_evolution.json`
- `data/internal_heat_access.json`
- `data/escalation_patterns.json`
- `data/arousal_reader_curiosity.json`

**Prediction status:** `data/e05_director_prediction.json` contains a frozen eight-scene forecast written using E01–E04 only, with no access to the actual E05. The older E01 director experiment remains historical and is not canon.

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

## All-episodes pair timelines

The **Relationship Timeline** tab joins the existing episode-indexed JSON evidence rather than physically merging or overwriting it. E01, E02 and E03 headers separate the chronological records. Select **Dhika ↔ Uncle** or another available bond pair, and use the **Evidence** dropdown to include all facets or narrow to one kind of source. A single story event may legitimately appear in several evidence facets; these are *different annotations of the same source*, not multiple encounters.

Quick link: https://developer-fandom-rush.github.io/dhika-sharmi-adventures/?pair=dhika_uncle

**Download JSON ↓** on the Relationship Timeline exports the selected pair, episode scope, and currently filtered chronological source records as a combined JSON file. It includes raw source citations and separate analysis metadata. It does not change the committed JSON datasets. The old "I checked this against the source" checkmarks are retained by browser storage key.

## Atomic action standard (E01–E03 correction)

In **Physical Actions ★**, records have one precise name (such as `pinch_waist`, `hold_hips_and_stomach`, `kiss_on_forehead`, or `imagine_breasts`). They are not generic scene summaries. Click an action: the left card shows the exact words and attached original metaphor, while the right inspector renders the **complete, unmodified original source scene**. Source wording appears once in a shared `scenes` entry; action records refer to it by `scene_id` and exact phrase position. `kiss_on_forehead` appears only as historical marital backstory in E02. No Dhika–Chotu kiss is documented in E01–E02. The reader-focused analysis treats this work as adult erotica with complex character psychology; all evidence remains verbatim.

The canonical action registry is checked by `node scripts/validate.mjs` alongside the original E01, E02 and E03 source text. Director forecasts remain paused until requested again.

## Episode 03: Actual physical progression

Open the dashboard **Episode → E03** for all 240 exact raw lines or **Physical Actions ★ → E03** for 61 precisely named actions (including actions, gestures, observed gazes and imagined acts). **Action Progression ★** displays the chronological observed action sequence by character pair and links individual source lines back to the original. No future-scene predictions are part of that dataset.

Important E03 grounded distinctions: Dhika–Chotu's `flying_kiss` is noncontact (E03 L081), `kiss_on_lips` is Chotu's actual action (L092), and `kiss_back_on_lips` is Dhika's reciprocal response (L093). E03 L094–095 repeat a nearly identical sentence; they are not coded as a second pair of kisses. The aftermath appears under Inner Evolution and pair history. For twins, Wednesday tutoring's cheek-pinch and Friday Bobby's `wipe_tears_from_cheek` are separate acts under different settings. Original metaphor lines remain in the immutable raw source and are linked to atomic actions.

- `data/action_progression_e03.json` — 28 source-referenced observed stages across Dhika–Chotu, Dhika–Bobby, Dhika–Bantu, Dhika–Uncle and Dhika–John; no hypothetical continuation.
- Director selection methodology records past contact, private reaction, changed relationship stage and repeat-meeting setup; prediction-and-canon comparison will be enabled only when the user resumes it.

## New E04 Director Pack · E05 blind forecast

The main interactive Evidence Room remains E01–E03 until E04's pointer-based records are integrated. New analysis lives in GitHub JSON files, referencing exact E04-local line numbers in `raw/Dhika.txt` without duplicating its original prose:

- [E04 direction index](./data/episode04_direction_index.json): 17 source-indexed scene directions
- [E04 atomic ledger](./data/e04_atomic_director_ledger.json): 77 named actions, observations and reactions (pointer-based, not verbatim quote extracts)
- [E04 character progression](./data/e04_character_progression.json): 25 character psychology checkpoints and 4 relationship continuities
- [E04 author style guide](./data/e04_author_style_guide.json): 12 writing mechanisms, 5 voice profiles, director execution contract
- [E05 blind director prediction](./data/e05_director_prediction.json): 8 noncanonical proposed scenes and rubric, frozen before E05 source is read

**Verification distinction:** E01–E03 GitHub Actions tests do **not yet validate the new E04 pointer-based records or the forecast**. Do not treat the E04 pack as fully QA-passed or as included in the main interactive dashboard yet. The E05 forecast is hypothetical, never evidence of an E05 event.
