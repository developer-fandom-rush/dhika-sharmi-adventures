#!/usr/bin/env node
// E01–E04 source and E05 prediction audit integrity validator. Run from repo root: node scripts/validate.mjs
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
const load=(p)=>JSON.parse(read(p));
const raw=read("raw/Dhika.txt");
const headers=[...raw.matchAll(/^EPISODE\s+(\d+)\s*$/gm)];
function assert(cond,msg){if(!cond)throw new Error(msg);}
assert(headers.length===69,"Expected exactly 69 source episode headers.");
headers.forEach((h,i)=>assert(Number(h[1])===i+1,"Episode ordering mismatch."));
const e01=raw.slice(headers[0].index,headers[1].index).split(/\r?\n/);
assert(e01.length===229,"E01 line count changed.");
const e02=raw.slice(headers[1].index,headers[2].index).split(/\r?\n/);
assert(e02.length===160,"E02 line count changed.");
const e03=raw.slice(headers[2].index,headers[3].index).split(/\r?\n/);
assert(e03.length===240,"E03 original source line count changed.");
const sources={E01:e01,E02:e02,E03:e03};
const routes=[
 "data/episodes/e01.json",
 "data/episodes/e02.json",
 "data/episodes/e03.json",
 "data/physical_actions.json",
 "data/bond_evolution.json",
 "data/internal_heat_access.json",
 "data/escalation_patterns.json",
 "data/arousal_reader_curiosity.json"
];
function entries(data){
 switch(data.kind){
  case "episode":return data.events;
  case "character_physical_actions":return data.characters.flatMap(c=>c.events);
  case "bond_evolution":return data.relationships.flatMap(r=>r.states);
  case "internal_heat_access":return data.events;
  case "escalation_patterns":return data.tracks.flatMap(t=>t.events);
  case "arousal_reader_curiosity":return data.events;
  default:throw Error("Unknown dataset kind: "+data.kind);
 }
}
const ids=new Set;
for(const route of routes){
 const d=load(route),records=entries(d);
 assert(records.length>0,"Empty dataset: "+route);
 for(const e of records){
  assert(Boolean(sources[e.episode_id]),`Unknown episode: ${e.id}`);
  assert(!ids.has(e.id),`Duplicate record ID: ${e.id}`);
  ids.add(e.id);
  assert(e.line_start>0&&e.line_end<=sources[e.episode_id].length&&e.line_start<=e.line_end,`Out-of-range: ${e.id}`);
  assert(e.raw_lines.length===e.line_end-e.line_start+1,`Excerpt length mismatch: ${e.id}`);
  e.raw_lines.forEach((line,i)=>{
   assert(line.line===e.line_start+i,`Wrong line number: ${e.id}`);
   assert(line.text===sources[e.episode_id][line.line-1],`Source mismatch ${e.episode_id} L${line.line} in ${e.id}`);
  });
 }
 console.log(`PASS ${route}: ${records.length} records`);
}
const indexed=entries(load(routes[0])).flatMap(e=>e.raw_lines.map(l=>l.line));
assert(indexed.length===229&&indexed.every((n,i)=>n===i+1),"E01 source index incomplete.");
const indexed2=entries(load(routes[1])).flatMap(e=>e.raw_lines.map(l=>l.line));
assert(indexed2.length===160&&indexed2.every((n,i)=>n===i+1),"E02 source index incomplete.");
const indexed3=entries(load(routes[2])).flatMap(e=>e.raw_lines.map(l=>l.line));
assert(indexed3.length===240&&indexed3.every((n,i)=>n===i+1),"E03 source index incomplete.");
// Check the AI Director forecast without confusing predictions with E01 canon.
const director=load("data/ai_director_e01.json");
assert(director.kind==="ai_director_analysis","Missing director schema.");
assert(director.training_scope.source_episode==="E01","Director training scope changed.");
assert(director.training_scope.read_existing_E02===false,"Director must not claim to have read the actual E02.");
for(const hook of director.reader_hook_highlights){
 assert(hook.line>0&&hook.line<=229,"Hook line out of range: "+hook.id);
 assert(e01[hook.line-1]===hook.source_line,"Hook source differs: "+hook.id);
 assert(hook.source_line.slice(hook.span_start,hook.span_end)===hook.phrase,"Hook phrase invalid: "+hook.id);
}
for(const scene of director.proposed_execution.ordered_scenes){
 assert(scene.scene_id.startsWith("DIRECTOR-E02-"),"Unexpected proposal ID");
 assert(typeof scene.physical_action_name==="string"&&scene.physical_action_name.length>0&&scene.physical_action_name.length<80,"Physical action should be name only: "+scene.scene_id);
 assert(scene.e01_evidence.length===scene.source_evidence.length,"Proposal reference mismatch: "+scene.scene_id);
 for(const evidence of scene.source_evidence){
  assert(evidence.episode_id==="E01","Non-E01 evidence: "+scene.scene_id);
  assert(e01[evidence.line-1]===evidence.text,"Proposal evidence differs: "+scene.scene_id+" L"+evidence.line);
 }
}
for(const drill of director.practice_session){
 assert(drill.e01_lines.length===drill.exact_source_evidence.length,"Practice lines mismatch: "+drill.id);
 for(const evidence of drill.exact_source_evidence)assert(e01[evidence.line-1]===evidence.text,"Practice evidence differs: "+drill.id);
}
assert(director.proposed_execution.ordered_scenes.length>0,"No AI Director scenes");
assert(director.proposed_execution.projected_episode_heat.overall_narrative_heat<=5,"Director heat scale invalid");
console.log("PASS: "+director.reader_hook_highlights.length+" exact text trigger highlights, "+director.proposed_execution.ordered_scenes.length+" proposed scenes, "+director.practice_session.length+" director drills.");

const inner=load("data/character_inner_evolution.json");
let innerCount=0;
for(const person of Object.values(inner.characters)){
 person.states.forEach((state,i)=>{
  assert(state.sequence_in_character===i+1,"Inner state order invalid: "+state.id);
  assert(state.previous_state_id===(i?person.states[i-1].id:null),"Inner state link invalid: "+state.id);
  const lines=sources[state.episode_id];
  assert(state.raw_lines.every(x=>x.text===lines?.[x.line-1]),"Inner source mismatch: "+state.id);
  innerCount++;
 });
}
const triggers=load("data/reader_triggers.json");
for(const t of triggers.triggers){
 const original=sources[t.episode_id]?.[t.line-1];
 assert(original===t.source_line,"Trigger original differs: "+t.id);
 assert(original?.slice(t.span_start,t.span_end)===t.phrase,"Trigger span differs: "+t.id);
}
assert(triggers.triggers.filter(x=>x.episode_id==="E01"&&x.line===215).length>=3,"Missing E01 L215 triggers.");
const groups=load("data/group_encounters.json");
for(const g of groups.groups){
 assert(g.shared_raw_lines.length===g.line_end-g.line_start+1,"Invalid group length: "+g.id);
 for(const l of g.shared_raw_lines)assert(l.text===sources[g.episode_id]?.[l.line-1],"Group source mismatch: "+g.id);
 for(const actor of g.participant_tracks){
  assert(g.characters.includes(actor.character_id),"Unknown group participant: "+g.id);
  assert(actor.evidence_line_refs.every(x=>x>=g.line_start&&x<=g.line_end),"Group reference out of bounds: "+g.id);
 }
}
console.log("PASS: "+innerCount+" inner changes, "+triggers.triggers.length+" exact trigger phrases, "+groups.groups.length+" group encounters.");

const atomic=load("data/atomic_action_registry.json");
const sceneMap=new Map(atomic.scenes.map(s=>[s.scene_id,s]));
assert(atomic.scenes.length===35,"Expected 35 shared scene setups.");
assert(atomic.atomic_events.length===134,"Expected 134 indexed atomic actions.");
for(const scene of atomic.scenes){
 const expected=sources[scene.episode_id];
 assert(Boolean(expected),"Unknown scene episode: "+scene.scene_id);
 assert(scene.raw_lines.length===scene.line_end-scene.line_start+1,"Wrong scene length: "+scene.scene_id);
 for(const ln of scene.raw_lines)assert(expected[ln.line-1]===ln.text,"Verbatim scene mismatch: "+scene.scene_id+" L"+ln.line);
}
const checked=new Set();
for(const action of atomic.atomic_events){
 assert(!checked.has(action.id),"Duplicate action ID: "+action.id);checked.add(action.id);
 const scene=sceneMap.get(action.scene_id),original=sources[action.episode_id]?.[action.source_action.line-1];
 assert(Boolean(scene)&&scene.episode_id===action.episode_id,"Action has no source scene: "+action.id);
 assert(action.source_action.line>=scene.line_start&&action.source_action.line<=scene.line_end,"Action line outside scene: "+action.id);
 assert(original?.slice(action.source_action.span_start,action.source_action.span_end)===action.source_action.exact_phrase,"Exact action phrase mismatch: "+action.id);
 assert(/^[a-z][a-z0-9_]*$/.test(action.action_name),"Action name is not a compact machine-readable name: "+action.id);
 for(const m of action.original_author_imagery||[]){
  assert(sources[action.episode_id]?.[m.line-1]?.slice(m.span_start,m.span_end)===m.exact_phrase,"Original metaphor span changed: "+action.id);
 }
}
assert(atomic.atomic_events.some(a=>a.action_name==="kiss_on_forehead"&&a.temporal_status==="historical_backstory"),"Missing history-versus-present distinction.");
assert(atomic.atomic_events.some(a=>a.action_name==="imagine_breasts"&&a.temporal_status==="imagined_not_performed"&&a.original_author_imagery.length>0),"Missing imaginary-metaphor record.");
assert(atomic.atomic_events.some(a=>a.episode_id==="E03"&&a.character_id==="chotu"&&a.counterpart_id==="dhika"&&a.action_name==="kiss_on_lips"&&a.source_action.line===92),"Actual E03 L092 first kiss missing.");
assert(atomic.atomic_events.some(a=>a.episode_id==="E03"&&a.character_id==="dhika"&&a.counterpart_id==="chotu"&&a.action_name==="kiss_back_on_lips"&&a.source_action.line===93),"Actual E03 L093 reciprocal kiss missing.");
assert(!atomic.atomic_events.some(a=>a.episode_id!=="E03"&&a.action_name==="kiss_on_lips"&&a.character_id==="chotu"),"E03 kiss should not be backdated to E01/E02.");
console.log("PASS: "+atomic.scenes.length+" shared scene setups and "+atomic.atomic_events.length+" exact, discrete actions/imaginations.");

const progression=load("data/action_progression_e03.json");
assert(progression.is_prediction===false,"Progression must contain canon observations, not future predictions.");
const validActionIds=new Set(atomic.atomic_events.map(a=>a.id));
const seenStages=new Set;
for(const pair of progression.pairs){
 for(const step of pair.stages){
  assert(!seenStages.has(step.id),"Duplicate progression stage: "+step.id);seenStages.add(step.id);
  const lines=sources[step.episode_id];
  assert(lines?.[step.line_start-1]!==undefined&&lines?.[step.line_end-1]!==undefined,"Bad progression line range: "+step.id);
  for(const id of step.atomic_action_ids)assert(validActionIds.has(id),"Progression missing action ID: "+id);
 }
}
console.log("PASS: "+seenStages.size+" source-grounded action progression stages.");

console.log("PASS: all three episode indexes reproduce all 629 original lines.");

// E04 pointer-pack validation: metadata stores references, never a duplicate of original lines.
const e04=raw.slice(headers[3].index,headers[4].index).split(/\r?\n/);
assert(e04.length===207,"E04 original source must contain 207 lines.");
const direction=load("data/episode04_direction_index.json");
assert(direction.episode_id==="E04"&&direction.scenes.length===17,"E04 direction index changed.");
let previous=4;const sceneIDs=new Set();
for(const scene of direction.scenes){
 const [a,b]=scene.source_lines;
 assert(a===previous+1&&b>=a&&b<=202,"Non-contiguous E04 direction window: "+scene.id);
 previous=b;assert(!sceneIDs.has(scene.id),"Repeated E04 scene: "+scene.id);sceneIDs.add(scene.id);
}
assert(previous===202,"E04 direction scenes must cover L005–L202.");
const e04actions=load("data/e04_atomic_director_ledger.json");
assert(e04actions.episode_id==="E04"&&e04actions.events.length===90,"Expected 90 E04 atomic pointers.");
const aIDs=new Set();
for(const act of e04actions.events){
 assert(act.source_line>=5&&act.source_line<=202,"E04 action line invalid "+act.id);
 assert(/^[a-z][a-z0-9_]*$/.test(act.action_name),"Invalid E04 action name "+act.id);
 assert(["dhika","chotu","bantu","bobby","narrator"].includes(act.actor),"Unknown E04 actor "+act.id);
 assert(!aIDs.has(act.id),"Repeated E04 action "+act.id);aIDs.add(act.id);
}
const bondsForE04=new Set(load("data/bond_evolution.json").relationships.map(x=>x.id));
// Guard against conflating a line of dialogue with what the narrator observed.
const e04ActionNames=(line)=>e04actions.events.filter(x=>x.source_line===line).map(x=>x.action_name);
assert(e04ActionNames(123).includes("deliberately_remove_and_drop_pallu"),"Missing actual clothing adjustment E04 L123");
assert(e04ActionNames(124).includes("observe_substantial_partial_chest_exposure"),"Missing significant partial visual observation E04 L124");
assert(e04ActionNames(152).includes("describe_substantial_partial_exposure"),"Missing narrated extent E04 L152");
assert(e04ActionNames(173).includes("ask_about_prior_topless_viewing"),"Missing question E04 L173");
assert(e04ActionNames(175).includes("claim_first_topless_view"),"Missing claim E04 L175");
assert(e04ActionNames(176).includes("correct_topless_term_blouse_still_on"),"Missing correction E04 L176");
assert(e04[123].includes("50%")&&e04[151].includes("50%"),"Extent anchors for partial exposure changed");
assert(e04[172].toLowerCase().includes("topless")&&e04[175].toLowerCase().includes("blouse"),"Dialogue contrast source changed");
for(const act of e04actions.events.filter(x=>[173,175,176].includes(x.source_line)))assert(!!act.asserted_claim_vs_actual,"Missing claim-vs-visual distinction");
const e04mind=load("data/e04_character_progression.json");
assert(e04mind.character_state_count===25&&e04mind.character_checkpoints.length===25,"E04 mind count mismatch");
const mindIDs=new Set();
for(const state of e04mind.character_checkpoints){
 assert(state.source_line_start>=5&&state.source_line_end<=202&&state.source_line_start<=state.source_line_end,"Bad E04 state range "+state.id);
 assert(!mindIDs.has(state.id),"Repeated E04 mind "+state.id);mindIDs.add(state.id);
}
for(const thread of e04mind.relationship_threads){
 assert(bondsForE04.has(thread.pair),"E04 unknown relationship "+thread.pair);
 for(const stage of thread.stages){
  const [a,b]=stage.range;
  assert(a>=5&&b<=202&&a<=b,"Invalid E04 pair stage "+thread.pair);
 }
}
const style=load("data/e04_author_style_guide.json");
assert(style.features.length===14&&Object.keys(style.character_voice_profiles).length===5,"E04 author style incomplete");
for(const feature of style.features)for(const [ep,a,b] of feature.evidence){
 const ref=sources[ep]||(ep==="E04"?e04:null);
 assert(ref&&a>=1&&b<=ref.length&&a<=b,"Invalid author-style anchor "+feature.id);
}
const forecast=load("data/e05_director_prediction.json");
assert(forecast.prediction_id==="E05-BLIND-V1"&&forecast.target_episode_raw_read===false&&forecast.scenes.length===8,"Frozen E05 prediction metadata changed");
const e05=raw.slice(headers[4].index,headers[5].index).split(/\r?\n/);
const audit=load("data/e05_prediction_audit.json");
assert(e05.length===233&&audit.marks.length===8,"E05 comparison evidence size mismatch");
const forecastIDs=new Set(forecast.scenes.map(x=>x.id)),markIDs=new Set();
for(const mark of audit.marks){
 assert(forecastIDs.has(mark.predicted_scene_id)&&!markIDs.has(mark.predicted_scene_id),"Bad prediction match "+mark.predicted_scene_id);
 markIDs.add(mark.predicted_scene_id);
 assert(["hit","partial","miss"].includes(mark.result),"Invalid result "+mark.predicted_scene_id);
 if(mark.actual_source_lines)assert(mark.actual_source_lines[0]>=5&&mark.actual_source_lines[1]<=233&&mark.actual_source_lines[0]<=mark.actual_source_lines[1],"Invalid E05 source pointer "+mark.predicted_scene_id);
}
const counts={hit:0,partial:0,miss:0};
for(const mark of audit.marks)counts[mark.result]++;
assert(counts.hit===audit.counts.hits&&counts.partial===audit.counts.partials&&counts.miss===audit.counts.misses,"E05 score inconsistent");
console.log("PASS: E04 207 source lines, 17 scenes, 90 action pointers, 25 mind changes and 14 writing mechanics.");
console.log("PASS: E05 frozen forecast and eight evidence-backed review marks; "+counts.hit+" hit, "+counts.partial+" partial, "+counts.miss+" miss.");
const mechanisms=load("data/source_verified_style_mechanisms_e01_e05.json");
assert(mechanisms.kind==="source_verified_scene_writing_mechanisms","Missing forensic style guide");
assert(mechanisms.source_examples.length===65&&mechanisms.mechanism_count===65,"Expected 65 exact-style examples");
const sourceForStyle={E01:e01,E02:e02,E03:e03,E04:e04,E05:e05};
const styleIds=new Set();
for(const example of mechanisms.source_examples){
 assert(!styleIds.has(example.id),"Duplicate forensic style evidence: "+example.id);
 styleIds.add(example.id);
 const line=sourceForStyle[example.episode_id]?.[example.line-1];
 assert(typeof line==="string","Unknown forensic style line: "+example.id);
 assert(line.slice(example.span_start,example.span_end)===example.quote,"Verbatim style phrase mismatch: "+example.id);
 assert(example.writer_instruction.length>=35,"Style instruction too generic: "+example.id);
 assert(Boolean(mechanisms.relationship_specific_voice_rules[example.character_pair]),"Missing pair style profile: "+example.id);
}
for(const e of ["E01","E02","E03","E04","E05"])assert(mechanisms.source_examples.some(x=>x.episode_id===e),"Missing style mechanism episode: "+e);
const styleActors=Object.keys(mechanisms.character_profiles);
assert(styleActors.length===9&&mechanisms.character_profiles.raj.status==="not_established_by_E01_E05","Evidence-limited voice definitions lost");
for(const [actor,profile] of Object.entries(mechanisms.character_profiles)){
 for(const [ep,line] of profile.evidence){
  assert(Boolean(sourceForStyle[ep]?.[line-1]),"Invalid voice evidence for "+actor);
 }
}
const indexE05=load("data/e05_scene_index.json");
let nextE05=1;
for(const scene of indexE05.scenes){
 const [a,b]=scene.source_lines;
 assert(a===nextE05&&b>=a&&b<=233,"E05 scene index gap at "+scene.id);
 nextE05=b+1;
}
assert(nextE05===234,"E05 scene index missing last lines");
console.log("PASS: 65 short author quotes exactly matched E01–E05 source; 9 voice profiles; 8 interaction signatures; full E05 indexed.");

const pilot=load("data/e05_semantic_trace_pilot.json");
assert(pilot.kind==="e05_semantic_trace_pilot"&&pilot.fully_reviewed_whole_episode===false,"E05 pilot cannot claim total completeness");
assert(pilot.analyzed_range[0]===5&&pilot.analyzed_range[1]===50,"Pilot source window changed");
assert(pilot.records.length===pilot.atomic_records&&pilot.line_disposition.length===46,"Pilot record count mismatch");
const pilotIds=new Set(),pilotByLine=new Map();
for(const event of pilot.records){
 assert(event.episode_id==="E05"&&event.line>=5&&event.line<=50,"Pilot record outside scoped lines: "+event.id);
 assert(!pilotIds.has(event.id),"Duplicate pilot record: "+event.id);pilotIds.add(event.id);
 const line=e05[event.line-1],quote=event.source.verbatim_short_span;
 assert(line.slice(event.source.span_start,event.source.span_end)===quote,"Pilot exact span mismatch: "+event.id);
 assert(/^[a-z][a-z0-9_]*$/.test(event.action_name),"Pilot action name malformed: "+event.id);
 const v=pilotByLine.get(event.line)||[];v.push(event.id);pilotByLine.set(event.line,v);
}
for(let line=5;line<=50;line++){
 const state=pilot.line_disposition.find(x=>x.line===line),ids=pilotByLine.get(line)||[];
 assert(state?.status==="provisionally_annotated"&&ids.length>0,"Pilot unreviewed line: E05 L"+line);
 assert(ids.length===state.record_ids.length&&ids.every(id=>state.record_ids.includes(id)),"Pilot line->event pointers mismatch: E05 L"+line);
}
assert(pilot.records.filter(x=>x.line===16&&x.action_name==="kiss_on_cheek").length===2,"Separate twins' cheek gestures lost");
assert(pilot.records.some(x=>x.line===19&&x.actor==="bobby"&&x.action_name==="return_for_cheek_peck"),"Bobby separate parting action lost");
assert(pilot.records.some(x=>x.line===35&&x.certainty==="ambiguous"&&x.action_name==="unresolved_guest_speaker_label"),"Leo/Ron speaker ambiguity was silently normalized");
assert(JSON.stringify(pilot.known_unreviewed_line_ranges)==="[[51,233]]","E05 pilot must mark remaining lines unreviewed");
console.log("PASS: E05 semantic pilot checks 46 of 233 lines and "+pilot.records.length+" source-anchored events; rest NOT reviewed.");

console.log("PASS: GitHub source has 69 complete episode headings; E01–E04 analyzed, E05 audited.");
