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
assert(e01.length===229,"E01 source changed: expected 229 line positions.");
const routes=[
 "data/episodes/e01.json",
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
  assert(e.episode_id==="E01",`Non-E01 record ${e.id}`);
  assert(!ids.has(e.id),`Duplicate record ID: ${e.id}`);
  ids.add(e.id);
  assert(e.line_start>0&&e.line_end<=229&&e.line_start<=e.line_end,`Out-of-range: ${e.id}`);
  assert(e.raw_lines.length===e.line_end-e.line_start+1,`Excerpt length mismatch: ${e.id}`);
  e.raw_lines.forEach((line,i)=>{
   assert(line.line===e.line_start+i,`Wrong line number: ${e.id}`);
   assert(line.text===e01[line.line-1],`Wording mismatch at E01 L${line.line} in ${e.id}`);
  });
 }
 console.log(`PASS ${route}: ${records.length} records`);
}
const indexed=entries(load(routes[0])).flatMap(e=>e.raw_lines.map(l=>l.line));
assert(indexed.length===229&&indexed.every((n,i)=>n===i+1),"Episode index does not cover E01 exactly once.");
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
console.log("PASS: all 229 E01 source lines mapped exactly, no missing or duplicate lines.");
console.log("PASS: GitHub source has 69 complete episode headings; E02–E69 are preserved.");
