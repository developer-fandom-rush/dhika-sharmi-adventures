# Dhika & Sharmi Adventures — source-locked analysis dashboard

## Unified twins tracker detail pass (15 October 2026)

[All trackers](https://developer-fandom-rush.github.io/dhika-sharmi-adventures/tracker-hub.html)
· [Detailed twins audit](https://developer-fandom-rush.github.io/dhika-sharmi-adventures/unified-pair-tracker.html?pair=TRIO&episode=all&scope=single&view=detailed&shared=true&evidence=all)

The light paper/cream/green reader preserves all earlier E01–E13 ledgers, including
89 formerly unloaded E11–E13 records. It adds **891 manually authored neutral
source-checked sequences across 47 later episodes**, **8 contextual episode
reviews**, and **36 chronology/knowledge checks**. The review-status table covers
all 68 episodes, distinguishing retained early ledgers, new sequences, and context
checks with no twin event identified. No absence is inferred from name matching.

Each new record preserves actor, recipient, action class, outcome, knowledge
limits, narrative frame, master source range, SHA-256 range hash, first-line FNV
checksum, and the authoring row. Linked requests/responses sometimes share a
sequence: this is **not an exhaustive per-clause atomic certification**. All 18
broader atomic requirements remain available without fabricated sign-off.

Corrections include the E25 dream, E26/E37 previews, E36/E37 clasp replay and stop
response, E38/E51 unequal knowledge and later disclosure, the E44/E45 duplicate
call, E64's actual opening plus retrospective explanation, E66/E67's extended
flashback, E67's internal no-touch thought versus later spoken stop, and E68's
private Bobby camera view. E23 L4229's actor conflict remains unresolved rather
than silently reassigned. Reports, hypotheticals and unknown observers retain
explicit limits. The unshown hour in E67 remains a later report, not invented prose.

The 200 navigation sections are separate from action sequences and unique
encounters. E01–E68 full source browsing retains all 13,910 master lines. The raw
source blob is unchanged. Filters support one, cumulative or arbitrary episodes,
strict/shared pair context, search and paginated detailed records. v5 filtered
exports include original records, new sequences, contextual reviews and chronology
checks. Physical, bond, clothing and cumulative views use the added evidence
without turning old checkpoints into a supposedly verified current state.

Authoring inputs are in `scripts/twins_audit/`; regenerate with
`python3 scripts/build_twins_review.py` and
`python3 scripts/build_twins_detailed_audit.py`. Validate using
`python3 scripts/validate_twins_tracker.py` and
`node scripts/test_twins_tracker.mjs`, plus the repository's existing checks.
Functional tests use a DOM fixture; live browser verification is separate.

## Current E01 scene repair (13 October 2026)

The **Characters & actions** page now uses the scene-level E01 review in
`data/e01_scene_review.json`: 228 reviewed source segments, 23 scene/context
sections, and 326 annotated event records. These are records, not 326 separate
encounters. The scope includes physical/visual actions, inner thoughts,
reactions, relevant interaction dialogue, historical/remembered events, and
separate family/domestic context. Ambiguous source claims remain marked.

Clothing and current position use earlier/later scene evidence. Night memories
show current bed/sleepwear separately from the earlier hall/kurti scene. Thoughts
about absent people do not make them physical recipients or present participants.
Response links are source-context associations, not inferred sole causes. Shared
handover perspectives and action continuations retain their joint/continuation IDs.

Choose **Related character → All** for one person's actions, self actions,
thoughts and responses; select a named counterpart to narrow to a pair. Source
evidence remains optional. John is the canonical character for user-confirmed
typos **Ron** and **Roh**. Babu is an explicitly sourced alias of Chotu. The
original source spelling is untouched.

E01 review completion is within the stated scope, with the conflicting speaker
label at master line 45, literal 10 PM at 173, and unnamed imagined fingers at 67
retained as ambiguities. **E02–E69 semantic review remains pending.** Older E01
datasets and earlier scope descriptions below are historical, not this active
review's completeness status.

The **Evidence Room covers E01–E04 analytical action/relationship records and E01–E05 original source/style browsing**. E05 also has a frozen blind prediction and a separate after-reading audit. E05's detailed atomic/psychology ledger is not yet complete. The canonical `raw/Dhika.txt` (69 episode headings) remains unmodified.

**Dashboard:** https://developer-fandom-rush.github.io/dhika-sharmi-adventures/

## Female-centred line and action review (E01–E69)

**Review page:** https://developer-fandom-rush.github.io/dhika-sharmi-adventures/action-review.html

The default **Characters & actions** view is for readers: select the first and
second character, then see their checked interactions in episode/source order.
Cards show the action, initiator, body part, clothing/contact evidence, and
actual-versus-imagined status. **Evidence** expands exact supporting text; JSON
is nested inside that optional disclosure. Episode/category/search filters and
pair-specific JSON downloads are available. **Source review** retains the
line-by-line audit interface. An empty pair result explicitly means no checked
record in the current dataset, not absence of an interaction in the story.

`data/action_pair_index.json` is generated from checked actor-to-recipient roles
by `python3 scripts/build_action_pair_index.py`. Co-occurring names alone never
create pair actions, and imagined/object interactions are labelled separately.

This separate page preserves every source segment across all 69 episodes. It
does **not** claim that semantic event extraction is complete. The current
dataset contains 59 directly checked E01 event spans and unverified lexical
candidates across E01–E69. Lines without matches remain pending semantic review.
Named mentions in candidates do not establish actors, recipients, body-part
owners, scene presence, consent, or a female centre.

- **Every source line** shows all episode lines, including blanks and metadata.
- **Checked event spans** displays source-supported roles and distinctions for
  the checked E01 actions; this is not an episode-completeness certification.
- **Unverified candidates** displays exact keyword offsets and cues for further
  semantic work. Candidates can be false positives and can miss actions.
- **Female centre** filters checked assignments, rather than assigning a woman
  from pronouns or nearby names. Group records retain each action's roles.
- **Go to source line** uses master-file line numbers. Enter a number and press
  Enter. Episode-local numbers are also displayed beside the source.
- Downloads include one episode or all 69 episode ledgers plus the manifest.
- Review notes are browser-local. Export/import notes to retain or share them;
  they do not change canonical JSON or GitHub. Local notes cannot certify a
  machine candidate as a checked event.

`data/female_action_review/manifest.json` records the source hash and exact scope.
Each `eNN.json` holds lossless source lines and separately typed candidate/checked
records. `data/female_action_review_e01_checked.json` holds the checked annotations.
The source uses 14,046 LF-delimited segments, including the final empty segment;
the 14,045 LF-terminated physical lines and the two leading preamble segments are
preserved. Episode boundaries are not duplicated. Concatenating every segment
with LF reproduces the original 1,339,181 bytes exactly.

Run `python3 scripts/validate_female_action_review.py` for exact byte
reconstruction, line/ID/reference checks, evidence offsets, and checked
female-centred chronology. Original `raw/Dhika.txt` remains unchanged.

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

## Semantic-completeness pilot and release rules (2026-10-12)

- [E05 line-to-event pilot](./data/e05_semantic_trace_pilot.json) — **only E05 local lines 005–050**, 46 line dispositions with 66 individually keyed, exact-short-span-anchored observations/actions. This includes separate actor/target mappings and a source speaker name discrepancy at E05 L035 (Ron vs Leo). It does **not** claim full E05 analysis.
- [Project QA contract](./data/director_qa_contract.json) — contains known requirements and release gates.
- [Main source validator](./scripts/validate.mjs) — now validates this limited pilot's every line-to-event pointer and selected semantic regression anchors; **it cannot establish full semantic completeness of E05 L051–233 or any later episode.**

**Release gate (two independent checks):** (1) all source line indices, short phrase offsets, distinct actor events and cross-references must pass machine validation; (2) an editorial pass must show every meaningful event/observation/inner thought/dialogue turn has a source-linked record, and explain intentionally untagged material. A source line appearing in a broad scene window never counts as proof that its separate events were extracted. Use `unreviewed` / `uncertain` instead of treating a generic summary as complete. Keep original raw and frozen predictions unchanged.

**Expected working sequence:** choose one original source scene → annotate line by line → split multiple events per line and multiple actors per shared encounter → link character-wise psychology and pair/group voice → record precise setup/payoff and scene boundary → run source/semantic tests → perform separate editorial completeness check → append to the cumulative ledgers; repeat for the next scene. Do not promote an episode as complete before all its scenes pass both gates. Subsequent blind predictions are allowed only after their cutoff state is explicit and the target source has not already been read.
