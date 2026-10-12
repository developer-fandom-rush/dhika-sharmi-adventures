# Dhika & Sharmi Adventures — source-locked analysis dashboard

The **Evidence Room covers E01–E04 analytical action/relationship records and E01–E05 original source/style browsing**. E05 also has a frozen blind prediction and a separate after-reading audit. E05's detailed atomic/psychology ledger is not yet complete. The canonical `raw/Dhika.txt` (69 episode headings) remains unmodified.

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

The interactive Evidence Room now includes E04 source-pointer action and character records, plus E05 indexed original scenes. E05 is not yet fully indexed with individual action/psychology checkpoints. New analysis lives in GitHub JSON files, referencing exact E04-local line numbers in `raw/Dhika.txt` without duplicating its original prose:

- [E04 direction index](./data/episode04_direction_index.json): 17 source-indexed scene directions
- [E04 atomic ledger](./data/e04_atomic_director_ledger.json): 77 named actions, observations and reactions (pointer-based, not verbatim quote extracts)
- [E04 character progression](./data/e04_character_progression.json): 25 character psychology checkpoints and 4 relationship continuities
- [E04 author style guide](./data/e04_author_style_guide.json): 12 writing mechanisms, 5 voice profiles, director execution contract
- [E05 blind director prediction](./data/e05_director_prediction.json): 8 noncanonical proposed scenes and rubric, frozen before E05 source is read

**Verification distinction:** GitHub Actions validates the E04 pointer references, E05 indexed scene ranges, all 65 exact short style quotes, and the frozen E05 forecast/audit shapes. These structural/source checks do not prove the scene-level interpretations are exhaustive. The forecast is hypothetical, not E05 canon.

## Source-exact Author Style Mechanisms (E01–E05)

The new **Exact Style Examples ★** dashboard tab (`?view=mechanisms`) connects **65 exact short source spans** with their original episode/line, character-pair mechanism, writer direction, and the separate narrator/character voice rules. Open a record to inspect its original line in the source panel. Source quotations are substring-verified in CI; the raw text is never rewritten.

- [Scene- and character-specific style evidence](./data/source_verified_style_mechanisms_e01_e05.json): 65 verified phrase spans, 9 character evidence-status profiles, 9 pair/group writing signatures.
- [Episode 05 scene index](./data/e05_scene_index.json): 13 windows spanning all 233 E05 original lines; the full atomic E05 ledger remains a **known gap**.
- [E05 prediction audit](./data/e05_prediction_audit.json): 3 broad scene hits, 2 partials, 3 misses; no retroactive forecast editing.

Raj is marked **unestablished in E01–E05**; Sharmi is marked **limited E01 evidence**, not a mature invented voice profile. To continue in a new chat, start with the repository paths above, verify latest GitHub Actions and source, then extend individual E05 actions; freeze an E06 prediction before reading actual E06. Do not claim this sampled style index gives exhaustive per-scene coverage.

## E04 semantic correction and mandatory Director QA

Following a source re-audit, the E04 scene around local lines 123–177 is no longer compressed into generic clothing/dialogue tags. The source depicts significant partial upper-body visibility and then a separate spoken question/claim about the word “topless,” explicitly qualified by Dhika saying her blouse was still worn. The visual event, two separate participants' observations, the question, claim, and correction are now separate E04 source-pointer events. The E04 ledger contains **90** action records (13 added; the previous L123 generic label sharpened). The E01–E04 author-style guide now has **14** named writing mechanisms, including how narration differs from dialogue claims and actor/observer/reaction chains.

- [E04 corrected action ledger](./data/e04_atomic_director_ledger.json)
- [Updated source-grounded writing mechanisms](./data/e04_author_style_guide.json)
- [Required QA contract / no-assumptions checklist](./data/director_qa_contract.json)

The CI checks source references, pointer consistency, and explicit regression anchors. **Passing CI is NOT a claim that every source detail was exhaustively tagged**: a separate scene-by-scene editorial completeness pass is required before promoting an episode to 'fully reviewed.' Continue future episodes only with that rule, and never replace prior verified data with vague new summaries. A new E05–E06 experimental dataset and its frozen forecast exist separately; its validator must pass independently.
