#!/usr/bin/env node
// Relationship Timeline integrity: run from repository root.
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const load=name=>JSON.parse(fs.readFileSync(path.join(root,name),"utf8"));
const check=(truth,msg)=>{if(!truth)throw Error(msg);};
const bonds=load("data/bond_evolution.json");
const mind=load("data/character_inner_evolution.json");
const links=load("data/relationship_links.json");
const pairs=new Map(bonds.relationships.map(r=>[r.id,r.participants]));
const states=Object.values(mind.characters).flatMap(c=>c.states.map(s=>({id:s.id,character:c.character_id,episode_id:s.episode_id})));
const known=new Map(states.map(s=>[s.id,s]));
check(known.size===states.length,"Nonunique inner state IDs.");
check(Object.keys(links.inner_state_links).length===states.length,"Inner-state link coverage incomplete.");
for(const [id,pairIds] of Object.entries(links.inner_state_links)){
 const st=known.get(id);check(st,"Orphaned inner-state link: "+id);
 check(Array.isArray(pairIds)&&pairIds.length>0,"No pair assigned: "+id);
 for(const p of pairIds){
  const people=pairs.get(p);check(people&&people.includes(st.character),"Invalid relationship link: "+id+" -> "+p);
 }
}
for(const id of known.keys())check(links.inner_state_links[id],"Missing link: "+id);
check(pairs.has("dhika_uncle"),"Dhika/Uncle relationship missing.");
const pair="dhika_uncle",people=pairs.get(pair);
const records={
 bonds:bonds.relationships.flatMap(r=>r.states.map(e=>({...e,relationship_id:r.id}))),
 inner:states.filter(s=>links.inner_state_links[s.id].includes(pair)),
 physical:load("data/atomic_action_registry.json").atomic_events.filter(e=>people.every(x=>[e.character_id,e.counterpart_id].includes(x))),
 heat:load("data/internal_heat_access.json").events.filter(e=>people.every(x=>[e.actor,e.target].includes(x))),
 escalation:load("data/escalation_patterns.json").tracks.filter(t=>t.relationship_id===pair).flatMap(t=>t.events),
 curiosity:load("data/arousal_reader_curiosity.json").events.filter(e=>people.every(x=>e.characters.includes(x))),
 triggers:load("data/reader_triggers.json").triggers.filter(e=>people.every(x=>[e.character_id,e.other_character_id].includes(x))),
 groups:load("data/group_encounters.json").groups.filter(e=>people.every(x=>e.characters.includes(x)))
};
records.bonds=records.bonds.filter(e=>e.relationship_id===pair);
records.inner=states.filter(s=>links.inner_state_links[s.id].includes(pair));
const all=Object.values(records).flat();
check(all.some(x=>x.episode_id==="E01")&&all.some(x=>x.episode_id==="E02"),"Combined timeline missing an episode.");
const ids=new Set();
for(const e of all){check(!ids.has(e.id),"Evidence ID duplicated across facets: "+e.id);ids.add(e.id);}
console.log("PASS: "+states.length+" character inner records linked to supported relationship pairs.");
console.log("PASS: Dhika/Uncle all-episodes relationship index has "+all.length+" distinct evidence records.");
console.log("PASS: E01="+all.filter(x=>x.episode_id==="E01").length+", E02="+all.filter(x=>x.episode_id==="E02").length);
