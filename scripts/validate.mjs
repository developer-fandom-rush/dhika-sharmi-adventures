#!/usr/bin/env node
// E01 source-lock validator. Run from repo root: node scripts/validate.mjs
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
const sources={E01:e01,E02:e02};
const routes=[
 "data/episodes/e01.json",
 "data/episodes/e02.json",
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
assert(atomic.scenes.length===21,"Expected 21 shared scene setups.");
assert(atomic.atomic_events.length===73,"Expected 73 indexed atomic actions.");
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
assert(!atomic.atomic_events.some(a=>a.action_name==="kiss_on_lips"&&["dhika","chotu"].includes(a.character_id)&&["dhika","chotu"].includes(a.counterpart_id)),"An unsupported Dhika/Chotu kiss was inferred.");
console.log("PASS: "+atomic.scenes.length+" shared scene setups and "+atomic.atomic_events.length+" exact, discrete actions/imaginations.");

console.log("PASS: both episode indexes reproduce all 389 original lines.");

console.log("PASS: GitHub source has 69 complete episode headings; E02–E69 are preserved.");
