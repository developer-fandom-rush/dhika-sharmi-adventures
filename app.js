"use strict";
const URLS={
  episode:"./data/episodes/e01.json",
  physical:"./data/atomic_action_registry.json",
  bonds:"./data/bond_evolution.json",
  heat:"./data/internal_heat_access.json",
  escalation:"./data/escalation_patterns.json",
  curiosity:"./data/arousal_reader_curiosity.json",
  e02:"./data/episodes/e02.json",
  e03:"./data/episodes/e03.json",
  inner:"./data/character_inner_evolution.json",
  triggers:"./data/reader_triggers.json",
  groups:"./data/group_encounters.json",
  links:"./data/relationship_links.json",
  progression:"./data/action_progression_e03.json",
  e04Direction:"./data/episode04_direction_index.json",
  e04Actions:"./data/e04_atomic_director_ledger.json",
  e04Mind:"./data/e04_character_progression.json",
  e04Style:"./data/e04_author_style_guide.json",
  e05Prediction:"./data/e05_director_prediction.json",
  e05Review:"./data/e05_prediction_audit.json",
  e05Scenes:"./data/e05_scene_index.json",
  mechanisms:"./data/source_verified_style_mechanisms_e01_e05.json"
};
const META={
  mechanisms:{title:"Exact Author Examples & Character-Specific Writing ★",tab:"Exact Style Examples ★",note:"65 source-verified short quotations with scene function and writer direction; 9 character profiles and 9 pair/group interaction patterns. Open the original source line on the right."},
  directorStyle:{title:"Author Writing Mechanics · E01–E04",tab:"Author Style ★",note:"14 named narrative mechanisms with source anchors and practical writer instructions, plus five voice profiles."},
  directorForecast:{title:"Blind E05 Director Blueprint · Frozen",tab:"E05 Prediction ◇",note:"Hypothetical eight-scene forecast, written before viewing E05; action names are NOT canonical."},
  predictionReview:{title:"Frozen Prediction vs Actual E05",tab:"Prediction Audit ★",note:"Three hits, two partials, three misses. E05 source line references are grounded, prediction unchanged."},
  progression:{title:"Actual Action Progression · E01–E04",tab:"Action Progression ★",note:"Pair-wise observed sequence: original setup → precise action names → aftermath and updated boundary; no future predictions."},
  relationship:{title:"Relationship History · All Episodes",tab:"Relationship Timeline ★",note:"Chronological E01–E04 actions, inner thoughts, bond changes, exact trigger phrases and group events; source text unchanged."},
  episode:{title:"Episode original timeline",tab:"Episode",note:"Uninterrupted original text, all lines preserved, each source segment uniquely indexed."},
  inner:{title:"Character inner thoughts & changing nature",tab:"Inner Evolution ★",note:"Before → shift, source voice, exact line; no character's feelings copied onto another."},
  triggers:{title:"Exact author trigger phrases",tab:"Trigger Words ✦",note:"Exact phrase highlighted. A hook, emotional shift, visual description and payoff are not interchangeable."},
  groups:{title:"Group encounters · separate character states",tab:"Group Events",note:"Shared original passage stored once; each character has independent actions, knowledge and reactions."},
  physical:{title:"Exact action registry · source scene preserved",tab:"Physical Actions ★",note:"Short named actions (actual / imagined / observed / historic); click any action to read its FULL verbatim scene setup, exact quote and original author imagery."},
  bonds:{title:"Relationship / bond evolution",tab:"Bond evolution",note:"Append-only relationship evidence; E01 is never overwritten or compressed."},
  heat:{title:"Internal reactions & access",tab:"Heat / access",note:"Track actual access, discomfort, private thought and knowledge without invented numeric intensity."},
  escalation:{title:"Escalation and pacing",tab:"Escalation",note:"Ordered changes, actual physical boundaries, pace and mechanism with source evidence."},
  curiosity:{title:"Reader curiosity & arousal cues",tab:"Reader curiosity",note:"The author's wording shows what is revealed, concealed, repeated and contrasted."}
};
const CHARACTER_NAMES={
  dhika:"Dhika",john:"John",uncle:"Uncle",aunty:"Aunty",
  sharmi:"Sharmi",raj:"Raj",leo:"Leo",bantu:"Bantu",bobby:"Bobby",
  chotu:"Chotu / Babu",maami:"Bindu Maami",pappu:"Pappu (family only)"
};
const DATA={};
const STATE={view:"relationship",episode:"ALL",relationship:"dhika_uncle",facet:"ALL",query:"",character:"",selected:null,showRaw:false};
const $=id=>document.getElementById(id);
const repoPath="https://github.com/developer-fandom-rush/dhika-sharmi-adventures/blob/main/raw/Dhika.txt";
const titleCase=s=>String(s||"").replace(/[_-]/g," ").replace(/\b\w/g,x=>x.toUpperCase());
const countLabel=n=>n===1?"1 record":n+" records";
function reviewKey(id){return "dhika-e01-reviewed:"+id;}
function isReviewed(id){try{return localStorage.getItem(reviewKey(id))==="yes";}catch{return false;}}
function markReviewed(id,checked){try{if(checked)localStorage.setItem(reviewKey(id),"yes");else localStorage.removeItem(reviewKey(id));}catch{}}
function text(tag,content,cls){
 const el=document.createElement(tag);
 if(cls)el.className=cls;
 el.textContent=content==null?"":String(content);
 return el;
}
function characterIds(item){
 const ids=[...(item.characters||[]),...(item.participants||[])];
 ["actor","target","subject","other_character","character_id","other_character_id","counterpart_id"].forEach(k=>{if(item[k])ids.push(item[k]);});
 return [...new Set(ids)];
}
const RELATIONSHIP_VIEWS=["bonds","inner","physical","heat","escalation","curiosity","triggers","groups"];
const RELATIONSHIP_LABELS={bonds:"Bond evolution",inner:"Inner thoughts",physical:"Physical action",heat:"Inner reaction / access",escalation:"Pacing / escalation",curiosity:"Reader curiosity",triggers:"Exact trigger",groups:"Group encounter"};
function relationshipPeople(pairId){
 const found=DATA.bonds?.relationships?.find(r=>r.id===pairId);
 return found?.participants||pairId.split("_");
}
function belongsToRelationship(item,view,pairId){
 if(item.paired_relationships?.includes(pairId))return true;
 const pair=relationshipPeople(pairId);
 if(view==="inner")return(DATA.links?.inner_state_links?.[item.id]||[]).includes(pairId);
 if(view==="bonds"||view==="escalation")return item.relationship_id===pairId ||(item.participants?.length===2&&pair.every(x=>item.participants.includes(x)));
 if(view==="physical")return pair.every(x=>[item.character_id,item.counterpart_id].includes(x));
 if(view==="heat")return pair.every(x=>[item.actor,item.target].includes(x));
 if(view==="triggers")return pair.every(x=>[item.character_id,item.other_character_id].includes(x));
 if(view==="groups"||view==="curiosity")return pair.every(x=>item.characters?.includes(x));
 return false;
}
function listRelationshipRecords(pairId){
 const output=[];
 for(const view of RELATIONSHIP_VIEWS)for(const item of listItems(view)){
  if(!belongsToRelationship(item,view,pairId))continue;
  output.push({...item,related_view:view,facet_label:RELATIONSHIP_LABELS[view],relationship_id:pairId,is_relationship_record:true});
 }
 return output.sort((a,b)=>{
  const order=a.episode_id.localeCompare(b.episode_id)||a.line_start-b.line_start;
  return order||RELATIONSHIP_VIEWS.indexOf(a.related_view)-RELATIONSHIP_VIEWS.indexOf(b.related_view);
 });
}

function sourceDataFor(id){return {E01:DATA.episode,E02:DATA.e02,E03:DATA.e03,E04:DATA.e04,E05:DATA.e05}[id];}
function e04Lines(a,b){
 return DATA.e04.events.flatMap(e=>e.raw_lines).filter(l=>l.line>=a&&l.line<=b);
}
function e04Pairs(item){
 if(item.target==="self"&&item.actor==="dhika")return item.source_line<=29?["dhika_chotu"]:["dhika_bantu","dhika_bobby"];
 return [];
}
function e04Actions(){
 return DATA.e04Actions.events.map(a=>{
   const sc=DATA.e04Direction.scenes.find(x=>a.source_line>=x.source_lines[0]&&a.source_line<=x.source_lines[1]);
   const start=sc?.source_lines[0]||a.source_line,end=sc?.source_lines[1]||a.source_line;
   return {...a,is_e04_action:true,episode_id:"E04",character_id:a.actor,counterpart_id:a.target,
     line_start:start,line_end:end,raw_lines:e04Lines(start,end),
     scene_id:sc?.id||"E04-POINTER",scene_title:sc?.title||"Source line",
     paired_relationships:e04Pairs(a),characters:[a.actor,a.target].filter(x=>x!=="self"),
     tags:[a.action_type,a.temporal_status,a.body_part_or_focus,a.observed_reaction]};
 });
}
function e04Inner(){
 return DATA.e04Mind.character_checkpoints.map(a=>({
   ...a,episode_id:"E04",character_id:a.actor,is_inner:true,
   line_start:a.source_line_start,line_end:a.source_line_end,
   raw_lines:e04Lines(a.source_line_start,a.source_line_end),
   change_marker:a.change_marker,prior_state_or_expectation:a.prior_chain,
   observed_state_or_difference:a.observation,
   paired_relationships:a.paired_relationships
 }));
}
function e04Bonds(){
 return DATA.e04Mind.relationship_threads.flatMap(pair=>pair.stages.map((a,i)=>({
   id:pair.pair+":E04:"+(i+1),episode_id:"E04",relationship_id:pair.pair,
   participants:pair.pair.split("_"),line_start:a.range[0],line_end:a.range[1],
   raw_lines:e04Lines(...a.range),state_tag:a.name,evidence_kind:a.insight,
   paired_relationships:[pair.pair]
 })));
}

function listItems(view){
 const d=DATA[view];
 if(!d&&!["relationship","directorStyle","directorForecast","predictionReview"].includes(view))return[];
 let base=[];
 if(view==="relationship")base=listRelationshipRecords(STATE.relationship);
 else if(view==="mechanisms")base=d.source_examples.map(x=>({
  ...x,id:x.id,is_mechanism:true,line_start:x.line,line_end:x.line,
  characters:x.character_pair.split("_").filter(y=>!["self","group"].includes(y)),
  label:x.mechanism,raw_lines:[{line:x.line,text:sourceDataFor(x.episode_id).events.flatMap(y=>y.raw_lines).find(z=>z.line===x.line)?.text||""}],
  tags:[x.character_pair,x.mechanism,"VERBATIM PHRASE"]
 }));
 else if(view==="directorStyle")base=DATA.e04Style.features.map(f=>{
  const anchor=f.evidence.find(v=>v[0]==="E04")||f.evidence[0];
  const ep=anchor[0],seg={E01:DATA.episode,E02:DATA.e02,E03:DATA.e03,E04:DATA.e04}[ep];
  return {...f,id:f.id,is_style:true,episode_id:ep,line_start:anchor[1],line_end:anchor[2],
   label:f.name,raw_lines:seg.events.flatMap(x=>x.raw_lines).filter(l=>l.line>=anchor[1]&&l.line<=anchor[2])};
 });
 else if(view==="directorForecast")base=DATA.e05Prediction.scenes.map(p=>({
  ...p,episode_id:"E05",line_start:0,line_end:0,raw_lines:[],
  is_forecast:true,label:p.title,tags:[p.confidence,p.category]
 }));
 else if(view==="predictionReview")base=DATA.e05Review.marks.map((m,i)=>({
  ...m,id:m.predicted_scene_id,episode_id:"E05",
  line_start:m.actual_source_lines?.[0]||0,line_end:m.actual_source_lines?.[1]||0,raw_lines:[],
  is_prediction_result:true,label:m.predicted_scene_id+" — "+m.result,tags:[m.result]
 }));
 else if(view==="progression"){
  const pair=d.pairs.find(x=>x.relationship_id===STATE.relationship);
  base=(pair?.stages||[]).map(stage=>{
   const epSource={E01:DATA.episode,E02:DATA.e02,E03:DATA.e03,E04:DATA.e04}[stage.episode_id];
   const original=epSource.events.flatMap(x=>x.raw_lines).filter(z=>z.line>=stage.line_start&&z.line<=stage.line_end);
   return {...stage,is_progression:true,characters:relationshipPeople(STATE.relationship),
    label:stage.stage_name,raw_lines:original,tags:["ACTUAL SOURCE","PAIR HISTORY",stage.observed_contact]};
  });
  const e04pair=DATA.e04Mind.relationship_threads.find(x=>x.pair===STATE.relationship);
  for(const [i,stage] of (e04pair?.stages||[]).entries()){
    const matching=e04Actions().filter(x=>x.source_line>=stage.range[0]&&x.source_line<=stage.range[1]&&
      belongsToRelationship(x,"physical",STATE.relationship));
    base.push({id:"PROG-"+STATE.relationship+"-E04-"+String(i+1).padStart(2,"0"),
      episode_id:"E04",relationship_id:STATE.relationship,stage_name:stage.name,is_progression:true,
      line_start:stage.range[0],line_end:stage.range[1],raw_lines:e04Lines(...stage.range),
      setup_analysis:stage.insight,observed_contact:"Source-grounded E04 stage (see named actions and original lines)",
      atomic_action_ids:matching.map(x=>x.id),atomic_action_names:matching.map(x=>x.action_name),
      source_line_reference:"E04 L"+stage.range[0]+"–L"+stage.range[1],
      characters:relationshipPeople(STATE.relationship),tags:["ACTUAL SOURCE","E04"]
    });
  }
 }
 else if(view==="episode")base=[...DATA.episode.events,...DATA.e02.events,...DATA.e03.events,...DATA.e04.events,...DATA.e05.events];
 else if(view==="heat"||view==="curiosity")base=d.events;
 else if(view==="physical"){
   const sceneMap=new Map(d.scenes.map(x=>[x.scene_id,x]));
   base=d.atomic_events.map(act=>{
     const sc=sceneMap.get(act.scene_id);
     return {...act,id:act.id,is_atomic:true,characters:[act.character_id,act.counterpart_id].filter(x=>x!=="self"),
       line_start:sc.line_start,line_end:sc.line_end,
       label:act.action_name,raw_lines:sc.raw_lines,
       tags:[act.action_type,act.temporal_status,act.agency_and_permission],
       source_line:act.source_action.line,
       setup:sc.setup_analysis,scene_title:sc.title
     };
   });
   base.push(...e04Actions());
 }
 else if(view==="bonds")base=[...d.relationships.flatMap(r=>r.states.map(e=>({...e,relationship_id:r.id,participants:r.participants}))),...e04Bonds()];
 else if(view==="escalation")base=d.tracks.flatMap(t=>t.events.map(e=>({...e,relationship_id:t.relationship_id,participants:t.relationship_id.split("_")})));
 else if(view==="inner")base=[...Object.values(d.characters).flatMap(ch=>ch.states.map(state=>({...state,character_id:ch.character_id,is_inner:true}))),...e04Inner()];
 else if(view==="triggers")base=d.triggers.map(trigger=>({...trigger,id:trigger.id,is_trigger:true,line_start:trigger.line,line_end:trigger.line,raw_lines:[{line:trigger.line,text:trigger.source_line}]}));
 else if(view==="groups")base=d.groups.map(group=>({...group,is_group:true,raw_lines:group.shared_raw_lines}));
 return base.sort((a,b)=>a.episode_id.localeCompare(b.episode_id)||a.line_start-b.line_start||String(a.id).localeCompare(String(b.id)));
}
function itemHeading(item){
 if(item.is_mechanism)return titleCase(item.mechanism)+" · "+titleCase(item.character_pair);
 if(item.is_style)return titleCase(item.name);
 if(item.is_forecast)return item.title;
 if(item.is_prediction_result)return item.predicted_scene_id+" — "+item.result.toUpperCase();
 if(item.is_progression)return titleCase(item.stage_name);
 if(item.is_e04_action)return titleCase(item.action_name);
 if(item.is_atomic)return titleCase(item.action_name);
 if(item.is_trigger)return item.phrase;
 if(item.is_inner)return titleCase(item.change_marker);
 return titleCase(item.label||item.action||item.state_tag||item.stage||item.narrative_device||item.id);
}
function itemTags(item){
 const words=[...(item.tags||[])];
 ["relationship_id","action_domain","contact_evidence","consent_status","channel","access_evidenced","knowledge_visibility","mechanism","source_pacing","narrative_device","reader_information","state_tag","change_marker","trigger_kind","importance","source_voice"].forEach(k=>{
   if(item[k]&&!words.includes(item[k]))words.push(item[k]);
 });
 return words;
}
function filteredItems(){
 const q=STATE.query.toLowerCase().trim();
 return listItems(STATE.view).filter(item=>{
   const people=characterIds(item);
   if(!["directorStyle","directorForecast","predictionReview"].includes(STATE.view)&&STATE.episode!=="ALL"&&item.episode_id!==STATE.episode)return false;
   if(STATE.view==="relationship"&&STATE.facet!=="ALL"&&item.related_view!==STATE.facet)return false;
   if(STATE.view!=="relationship"&&STATE.character&&!people.includes(STATE.character))return false;
   if(!q)return true;
   const searchable=[item.id,itemHeading(item),item.character_pair,item.writer_instruction,item.quote,people.join(" "),itemTags(item).join(" "),
       item.change_marker,item.prior_state_or_expectation,item.observed_state_or_difference,item.why_this_exact_phrase_matters,item.label,item.observable_action,item.action_name,item.setup,item.scene_title,item.observation,item.reason,item.mechanic,item.writer_instruction,item.objective,item.directions?.join(" "),item.source_action?.exact_phrase,...(item.original_author_imagery||[]).map(x=>x.exact_phrase),
       ...(item.raw_lines||[]).map(l=>l.text)].join(" ").toLowerCase();
   return searchable.includes(q);
 });
}
function renderStats(){
 const st=$("stats");st.replaceChildren();
 const scope=STATE.episode,records=view=>listItems(view).filter(x=>scope==="ALL"||x.episode_id===scope);
 const episodes={E01:DATA.episode,E02:DATA.e02,E03:DATA.e03,E04:DATA.e04,E05:DATA.e05};
 const totalLines=scope==="ALL"?Object.values(episodes).reduce((n,e)=>n+e.line_count,0):episodes[scope].line_count;
 const values=STATE.view==="relationship"?[
 [totalLines+" / "+totalLines,"Raw lines indexed"],
 [filteredItems().length,"Matching evidence records"],
 [records("inner").filter(x=>belongsToRelationship(x,"inner",STATE.relationship)).length,"Inner state changes"],
 [records("physical").filter(x=>belongsToRelationship(x,"physical",STATE.relationship)).length,"Physical actions"],
 [records("bonds").filter(x=>belongsToRelationship(x,"bonds",STATE.relationship)).length,"Bond checkpoints"],
 [records("triggers").filter(x=>belongsToRelationship(x,"triggers",STATE.relationship)).length,"Exact trigger phrases"]
 ]:[
 [totalLines+" / "+totalLines,"Source lines indexed"],
 [records("episode").length,"Timeline windows"],
 [records("inner").length,"Inner nature checkpoints"],
 [records("triggers").length,"Exact triggers"],
 [records("physical").length,"Physical actions"],
 [records("groups").length,"Shared group events"]
 ];
 for(const [number,label] of values){
  const box=text("div","","stat");box.append(text("div",number,"number"),text("div",label,"label"));st.append(box);
 }
}
function renderTabs(){
 const wrap=$("views");wrap.replaceChildren();
 for(const [view,meta] of Object.entries(META)){
   const b=text("button",meta.tab,"tab"+(STATE.view===view?" active":""));
   b.type="button";b.setAttribute("aria-pressed",STATE.view===view?"true":"false");
   b.onclick=()=>{STATE.view=view;STATE.selected=null;updateToolbar();render();};
   wrap.append(b);
 }
}
function renderRelationshipOptions(){
 const select=$("relationshipFilter");
 select.replaceChildren();
 for(const pair of DATA.bonds.relationships){
  const option=document.createElement("option");
  option.value=pair.id;
  option.textContent=pair.participants.map(id=>CHARACTER_NAMES[id]||titleCase(id)).join(" ↔ ");
  select.append(option);
 }
 if(!DATA.bonds.relationships.some(x=>x.id===STATE.relationship))STATE.relationship=DATA.bonds.relationships[0]?.id||"dhika_uncle";
 select.value=STATE.relationship;
}
function updateToolbar(){
 const rel=STATE.view==="relationship"||STATE.view==="progression";
 $("relationshipWrap").hidden=!rel;
 $("facetWrap").hidden=STATE.view!=="relationship";
 $("characterWrap").hidden=rel;
 $("episodeFilter").value=STATE.episode;
 if(rel){
  $("relationshipFilter").value=STATE.relationship;
  $("facetFilter").value=STATE.facet;
 }
}
function renderCharacterOptions(){
 const select=$("characterFilter");
 for(const id of Object.keys(CHARACTER_NAMES)){
   const opt=document.createElement("option");opt.value=id;opt.textContent=CHARACTER_NAMES[id];select.append(opt);
 }
}
function lineLabel(item){
 if(item.is_mechanism)return item.episode_id+" L"+String(item.line).padStart(3,"0")+" · exact source phrase";
 if(item.is_e04_action)return "E04 L"+String(item.source_line).padStart(3,"0")+" · "+item.scene_id;
 if(item.is_forecast)return "E05 FORECAST · not canon";
 if(item.is_prediction_result)return item.actual_source_lines?"E05 L"+item.line_start+"–"+item.line_end:"No matching E05 scene";
 if(item.is_atomic)return item.episode_id+" L"+String(item.source_line).padStart(3,"0")+" · "+item.scene_id;
 if(item.is_proposed||item.is_practice)return (item.raw_lines||[]).length+" E01 evidence anchors";
 return item.episode_id+" L"+String(item.line_start).padStart(3,"0")+"–L"+String(item.line_end).padStart(3,"0");
}
function createTags(tags,max=4){
 const r=text("div","","tag-row");
 for(const tag of tags.slice(0,max))r.append(text("span",titleCase(tag),"tag"));
 return r;
}
function rawSnippet(item){
 const block=text("div","","record-snippet");
 (item.raw_lines||[]).forEach((line,i)=>{
   const x=text("div",item.episode_id+" L"+String(line.line).padStart(3,"0")+"  "+(line.text||""),"snippet-line");
   block.append(x);
 });
 return block;
}
function appendField(container,label,value){
 if(value==null||value==="")return;
 const row=text("div","","detail-row");
 row.append(text("span",label,"detail-key"),text("span",String(value),"detail-value"));
 container.append(row);
}
function appendSourceAnalysis(node,item){
 const block=text("div","","director-details");
 if(item.is_mechanism){
  const dictionary=DATA.mechanisms;
  const voice=dictionary.relationship_specific_voice_rules[item.character_pair];
  appendField(block,"CHARACTER / PAIR",item.character_pair.replaceAll("_"," ↔ "));
  appendField(block,"EXACT SOURCE WORDING",item.quote);
  appendField(block,"WRITING MECHANISM",item.mechanism);
  appendField(block,"HOW TO DIRECT THIS BEAT",item.writer_instruction);
  appendField(block,"PAIR VOICE / INTERACTION RHYTHM",voice?.pattern);
  appendField(block,"PAIR CHECKLIST",voice?.requires?.join(" · "));
  for(const character of item.characters){
   const person=dictionary.character_profiles[character];
   if(person){appendField(block,character.toUpperCase()+" — VOICE",person.voice||"Not yet evidenced; no assumptions");
     appendField(block,character.toUpperCase()+" — EVIDENCE STATUS",person.status);}
  }
  appendField(block,"EXACT VERBATIM LINE",item.episode_id+" L"+String(item.line).padStart(3,"0"));
 }else if(item.is_e04_action){
  appendField(block,"ACTION NAME",item.action_name);
  appendField(block,"ACTOR",CHARACTER_NAMES[item.actor]||item.actor);
  appendField(block,"OBSERVED / ADDRESSED",CHARACTER_NAMES[item.target]||item.target);
  appendField(block,"FOCUS",item.body_part_or_focus);
  appendField(block,"EVENT TYPE",item.action_type+" · "+item.temporal_status);
  appendField(block,"IMMEDIATE REACTION",item.observed_reaction);
  appendField(block,"SOURCE STATUS",item.evidence_mode);
  appendField(block,"CLAIM VS CANONICAL VISUAL EVENT",item.asserted_claim_vs_actual);
  appendField(block,"SCENE",item.scene_title);
  appendField(block,"SOURCE","E04 L"+String(item.source_line).padStart(3,"0")+" (pointer; inspect unchanged original)");
 }else if(item.is_style){
  appendField(block,"MECHANISM",item.name);
  appendField(block,"HOW THE AUTHOR STRUCTURES IT",item.mechanic);
  appendField(block,"WRITER EXECUTION",item.writer_instruction);
  appendField(block,"ALL SOURCE ANCHORS",item.evidence.map(a=>a[0]+" L"+a[1]+"–"+a[2]).join(" | "));
 }else if(item.is_forecast){
  appendField(block,"PREDICTION, NOT CANON",item.title);
  appendField(block,"CONFIDENCE",item.confidence);
  appendField(block,"OBJECTIVE",item.objective);
  appendField(block,"PARTICIPANTS",item.participants.join(", "));
  appendField(block,"SETTING",item.setting);
  appendField(block,"DIRECTIONS",item.directions.map((x,i)=>(i+1)+". "+x).join("  |  "));
  appendField(block,"PROPOSED ACTION NAMES",item.action_names.join(" → "));
  appendField(block,"TENSION",item.inner_tension);
  appendField(block,"SCENE EXIT",item.exit);
  appendField(block,"ONLY KNOWN PRIOR REFERENCES",item.setup_from.join(" | "));
 }else if(item.is_prediction_result){
  appendField(block,"AUDIT RESULT",item.result.toUpperCase());
  appendField(block,"E05 SOURCE",item.actual_source_lines?"E05 L"+item.actual_source_lines.join("–"):"No matching E05 passage");
  appendField(block,"GROUNDED REASON",item.reason);
  appendField(block,"REVIEW NOTE","This result assesses a previously frozen forecast; not a new scene prediction.");
 }else if(item.is_progression){
  appendField(block,"PAIR",relationshipPeople(item.relationship_id).map(x=>CHARACTER_NAMES[x]||x).join(" ↔ "));
  appendField(block,"PROGRESSION STAGE",item.stage_name);
  appendField(block,"SOURCE SETUP",item.setup_analysis);
  appendField(block,"PHYSICAL PROGRESSION",item.observed_contact);
  appendField(block,"EXACT ACTION NAMES",(item.atomic_action_names||[]).join(" → ")||"No discrete action recorded for this stage");
  appendField(block,"ACTION RECORD IDS",(item.atomic_action_ids||[]).join(", ")||"No matching action IDs");
  appendField(block,"SOURCE",item.source_line_reference);
 }else if(item.is_atomic){
  appendField(block,"ACTION NAME",item.action_name);
  appendField(block,"ACTOR",CHARACTER_NAMES[item.character_id]||item.character_id);
  appendField(block,"TARGET / SUBJECT",CHARACTER_NAMES[item.counterpart_id]||titleCase(item.counterpart_id));
  appendField(block,"RECORDED AS",item.action_type+" · "+item.temporal_status);
  appendField(block,"SCENE SETUP",item.scene_title+" — "+item.setup);
  appendField(block,"AUTHOR'S EXACT ACTION WORDS",item.source_action.exact_phrase);
  appendField(block,"ORIGINAL METAPHORS",(item.original_author_imagery||[]).map(z=>z.exact_phrase).join(" | "));
  appendField(block,"ORIGINAL LINE",item.episode_id+" L"+String(item.source_action.line).padStart(3,"0"));
  appendField(block,"SOURCE WINDOW",item.episode_id+" L"+String(item.line_start).padStart(3,"0")+"–L"+String(item.line_end).padStart(3,"0"));
 }else if(item.is_inner){
  appendField(block,"CHARACTER",CHARACTER_NAMES[item.character_id]||item.character_id);
  appendField(block,"BEFORE / PRIOR STATE",item.prior_state_or_expectation);
  appendField(block,"WHAT CHANGED / NEW EVIDENCE",item.observed_state_or_difference);
  appendField(block,"SOURCE VOICE",item.source_voice);
  appendField(block,"EVIDENCE CONFIDENCE",item.evidence_confidence);
  appendField(block,"PREVIOUS STATE ID",item.previous_state_id||"First indexed observation");
 }else if(item.is_trigger){
  appendField(block,"TRIGGER CLASS",item.trigger_kind);
  appendField(block,"SOURCE SIGNIFICANCE",item.why_this_exact_phrase_matters);
  appendField(block,"IMPORTANCE",item.importance);
  appendField(block,"EXACT MATCH",item.source_quote_verified?"VERIFIED — original source spelling":"Unverified");
 }else if(item.is_group){
  appendField(block,"SHARED SCENE","Raw passage stored once. Each actor separately below:");
  for(const actor of item.participant_tracks||[]){
   const who=CHARACTER_NAMES[actor.character_id]||actor.character_id;
   appendField(block,who+" — ACTION",actor.observable_action);
   appendField(block,who+" — KNOWS",actor.known_to_character);
   appendField(block,who+" — UNKNOWN",actor.not_known_or_not_shown);
   appendField(block,who+" — EVIDENCE",actor.evidence_line_refs.map(n=>item.episode_id+" L"+String(n).padStart(3,"0")).join(", "));
  }
 }
 node.append(block);
}
function renderRecords(){
 const area=$("records"), items=filteredItems();area.replaceChildren();
 $("datasetTitle").textContent=STATE.view==="relationship"
  ?relationshipPeople(STATE.relationship).map(x=>CHARACTER_NAMES[x]||titleCase(x)).join(" ↔ ")+" · Relationship History"
  :STATE.view==="progression"?relationshipPeople(STATE.relationship).map(x=>CHARACTER_NAMES[x]||titleCase(x)).join(" ↔ ")+" · Action Progression":META[STATE.view].title;
 $("datasetNote").textContent=META[STATE.view].note+(STATE.view==="relationship"?" E01 → E02 → E03 → E04; different analytical records can cite the same original line.":"");
 $("resultCount").textContent=countLabel(items.length);
 if(!items.length){
  area.append(text("div","No matching source records. Try clearing the search or character filter.","empty"));
  STATE.selected=null;renderSource(null);return;
 }
 if(!items.some(x=>x.id===STATE.selected))STATE.selected=items[0].id;
 let lastEpisode="";
 for(const item of items){
  if((STATE.view==="relationship"||STATE.view==="progression")&&item.episode_id!==lastEpisode){
   lastEpisode=item.episode_id;
   area.append(text("div","EPISODE "+item.episode_id.slice(-2)+" · SOURCE-ORDERED HISTORY","timeline-episode-label"));
  }
  const node=text("article","","record"+(STATE.selected===item.id?" selected":""));
  node.setAttribute("role","button");node.setAttribute("tabindex","0");
  node.setAttribute("aria-label",itemHeading(item)+", "+lineLabel(item));
  node.append(text("div","","record-top"));
  node.lastChild.append(text("span",(item.facet_label?item.facet_label+" · ":"")+item.id,"record-id"),text("span",lineLabel(item),"record-range"));
  node.append(text("div",itemHeading(item),"record-label"));
  const characters=characterIds(item).map(id=>CHARACTER_NAMES[id]||id);
  if(characters.length)node.append(text("div",characters.join(" · "),"record-chars"));
  node.append(createTags(itemTags(item)));
  if(item.is_inner||item.is_trigger||item.is_group||item.is_atomic||item.is_progression||item.is_e04_action||item.is_style||item.is_mechanism||item.is_forecast||item.is_prediction_result)appendSourceAnalysis(node,item);
  if(STATE.showRaw&&!item.is_atomic&&!item.is_progression&&!item.is_e04_action)node.append(rawSnippet(item));
  if(item.is_atomic||item.is_e04_action||item.is_progression)node.append(text("div","Click to read original scene →","record-chars"));
  const box=text("label","","verify-row");
  const check=document.createElement("input");check.type="checkbox";check.checked=isReviewed(item.id);
  check.setAttribute("aria-label","Verified "+item.id);
  check.addEventListener("click",e=>e.stopPropagation());
  check.addEventListener("change",e=>{e.stopPropagation();markReviewed(item.id,check.checked);});
  box.append(check,text("span","I checked this against the source","verify-text"));
  box.addEventListener("click",e=>e.stopPropagation());
  node.append(box);
  const choose=()=>{STATE.selected=item.id;renderRecords();renderSource(item);};
  node.onclick=choose;node.onkeydown=e=>{if(e.target!==node)return;if(e.key==="Enter"||e.key===" "){e.preventDefault();choose();}};
  area.append(node);
 }
 renderSource(items.find(x=>x.id===STATE.selected));
}
function appendHighlighted(node,source,query){
 if(!query){node.textContent=source;return;}
 const q=query.toLowerCase(),lower=source.toLowerCase();
 let from=0,i=0;
 while((i=lower.indexOf(q,from))>=0){
  if(i>from)node.append(document.createTextNode(source.slice(from,i)));
  node.append(text("mark",source.slice(i,i+query.length)));
  from=i+query.length;
 }
 if(from<source.length)node.append(document.createTextNode(source.slice(from)));
}
function itemLineSet(item){return new Set((item.raw_lines||[]).map(l=>l.line));}
function renderCrossReferences(item){
 let container=document.getElementById("relatedRecords");
 if(!container){
  container=text("div","","related-records");container.id="relatedRecords";
  document.querySelector(".source-top").append(container);
 }
 container.replaceChildren();
 if(!item)return;
 const related=[],currentLines=itemLineSet(item);
 for(const view of Object.keys(META)){
  if(view===STATE.view)continue;
  for(const e of listItems(view)){
   if(e.episode_id!==item.episode_id)continue;
   const overlap=(e.raw_lines||[]).filter(l=>currentLines.has(l.line)).length;
   if(overlap>0)related.push({view,e,overlap});
  }
 }
 related.sort((a,b)=>b.overlap-a.overlap||a.e.line_start-b.e.line_start);
 if(!related.length)return;
 container.append(text("div","Related source evidence","related-title"));
 const wrap=text("div","","related-links");
 for(const x of related.slice(0,14)){
  const b=text("button",META[x.view].tab+" · "+x.e.id,"relation-button");
  b.type="button";b.title=lineLabel(x.e);
  b.addEventListener("click",()=>{
   STATE.view=x.view;STATE.episode=x.e.episode_id;STATE.character="";STATE.query="";STATE.selected=x.e.id;
   $("characterFilter").value="";$("episodeFilter").value=STATE.episode;$("searchInput").value="";
   updateToolbar();render();
  });
  wrap.append(b);
 }
 container.append(wrap);
}
function renderSourceHighlight(node,source,lineNumber,episodeId,query){
 const q=query.trim(),found=[];
 if(STATE.selected){
  const selected=filteredItems().find(x=>x.id===STATE.selected);
  if(selected?.is_mechanism&&selected.episode_id===episodeId&&selected.line===lineNumber){
   const a=selected.span_start,b=selected.span_end;
   if(source.slice(a,b)===selected.quote)found.push({start:a,end:b,priority:4});
  }
  if(selected?.is_atomic&&selected.episode_id===episodeId){
   const spans=[selected.source_action,...(selected.original_author_imagery||[])];
   for(const span of spans)if(span.line===lineNumber&&source.slice(span.span_start,span.span_end)===(span.exact_phrase||span.phrase)){
     found.push({start:span.span_start,end:span.span_end,priority:3});
   }
  }
 }
 if(DATA.triggers){
  for(const h of DATA.triggers.triggers||[]){
   if(h.episode_id===episodeId&&h.line===lineNumber&&source.slice(h.span_start,h.span_end)===h.phrase){
    found.push({start:h.span_start,end:h.span_end,priority:2});
   }
  }
 }
 if(q){
  const lower=source.toLowerCase(),needle=q.toLowerCase();
  let offset=0,pos;
  while((pos=lower.indexOf(needle,offset))>=0){found.push({start:pos,end:pos+q.length,priority:1});offset=pos+Math.max(1,q.length);}
 }
 found.sort((a,b)=>a.start-b.start||b.priority-a.priority);
 const spans=[],len=source.length;
 for(const x of found){
   if(spans.length&&x.start<=spans[spans.length-1].end)spans[spans.length-1].end=Math.max(spans[spans.length-1].end,x.end);
   else spans.push({...x});
 }
 let from=0;
 for(const part of spans){
   if(part.start>from)node.append(document.createTextNode(source.slice(from,part.start)));
   node.append(text("mark",source.slice(part.start,part.end)));
   from=part.end;
 }
 if(from<len)node.append(document.createTextNode(source.slice(from)));
}
function renderSource(item){
 const pane=$("sourceLines");pane.replaceChildren();
 const copy=$("copySource");copy.disabled=!item;
 if(!item){
  renderCrossReferences(null);
  $("sourceHeading").textContent="Select an evidence record";
  $("sourceMeta").textContent="Every excerpt is original author wording from "+STATE.episode+".";
  $("viewGithubLine").href=repoPath;
  pane.append(text("div","Choose a source record to inspect exact lines.","placeholder"));
  return;
 }
 renderCrossReferences(item);
 $("sourceHeading").textContent=(item.is_atomic?itemHeading(item)+" · "+item.scene_title:itemHeading(item));
 $("sourceMeta").textContent=item.id+" · "+lineLabel(item)+" · "+(item.raw_lines||[]).length+" original scene lines";
 const epData={E01:DATA.episode,E02:DATA.e02,E03:DATA.e03,E04:DATA.e04,E05:DATA.e05}[item.episode_id];
 const offset=(epData?.source?.master_first_line||3)-1;
 if(item.is_forecast){
  $("viewGithubLine").href="https://github.com/developer-fandom-rush/dhika-sharmi-adventures/blob/main/data/e05_director_prediction.json";
  pane.append(text("div","Frozen forecast only — no E05 source excerpt is asserted here.","placeholder"));
 }else if(item.is_prediction_result){
  $("viewGithubLine").href=repoPath+"#L"+(DATA.e05RawOffset+item.line_start)+"-L"+(DATA.e05RawOffset+item.line_end);
  pane.append(text("div","E05 comparison uses line references; open the source link for exact wording.","placeholder"));
 }else $("viewGithubLine").href=repoPath+"#L"+(item.line_start+offset)+"-L"+(item.line_end+offset);
 for(const line of item.raw_lines||[]){
  const row=text("div","","source-line");
  row.append(text("span","L"+String(line.line).padStart(3,"0"),"line-no"));
  const code=text("span","","line-text"+(line.text===""?" blank":""));
  if(line.text==="")code.textContent="↵ blank";
  else renderSourceHighlight(code,line.text,line.line,item.episode_id,STATE.query);
  row.append(code);pane.append(row);
 }
 pane.scrollTop=0;
}
function downloadActive(){
 let payload,filename;
 if(STATE.view==="relationship"){
  payload={
   schema_version:1,
   kind:"relationship_timeline_export",
   relationship_id:STATE.relationship,
   participant_ids:relationshipPeople(STATE.relationship),
   episode_scope:STATE.episode==="ALL"?["E01","E02","E03","E04","E05"]:[STATE.episode],
   source:"raw/Dhika.txt",
   note:"Chronological references from the source-locked datasets. Overlapping quoted lines may recur across distinct analysis categories. Raw source remains unchanged.",
   records:filteredItems().map(e=>({
    id:e.id,episode_id:e.episode_id,source_kind:e.related_view,
    line_start:e.line_start,line_end:e.line_end,raw_lines:e.raw_lines,
    analysis:{
     label:itemHeading(e),action:e.action||null,
     prior_state:e.prior_state_or_expectation||null,observed_change:e.observed_state_or_difference||null,
     source_voice:e.source_voice||null,trigger_phrase:e.phrase||null,
     why_phrase_matters:e.why_this_exact_phrase_matters||null,
     consent_status:e.consent_status||null,inner_reaction:e.state_tag||null,
     reader_information:e.reader_information||null,
     group_participants:e.participant_tracks||null
    }
   }))
  };
  filename=STATE.relationship+"_timeline_"+STATE.episode.toLowerCase()+".json";
 }else{
  payload=STATE.view==="episode"?(STATE.episode==="ALL"?{kind:"combined_episode_index",episodes:[DATA.episode,DATA.e02,DATA.e03,DATA.e04,DATA.e05]}:
  STATE.episode==="E05"?DATA.e05:STATE.episode==="E04"?DATA.e04:STATE.episode==="E03"?DATA.e03:STATE.episode==="E02"?DATA.e02:DATA.episode):
  STATE.view==="directorStyle"?DATA.e04Style:STATE.view==="directorForecast"?DATA.e05Prediction:STATE.view==="predictionReview"?DATA.e05Review:DATA[STATE.view];
  filename=STATE.view==="episode"?"source_index_"+STATE.episode.toLowerCase()+".json":
  URLS[STATE.view==="directorStyle"?"e04Style":STATE.view==="directorForecast"?"e05Prediction":STATE.view==="predictionReview"?"e05Review":STATE.view].split("/").at(-1);
 }
 const data=JSON.stringify(payload,null,2)+"\n";
 const blob=new Blob([data],{type:"application/json;charset=utf-8"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);
}
function copySelected(){
 const item=filteredItems().find(x=>x.id===STATE.selected);if(!item)return;
 const txt=(item.raw_lines||[]).map(l=>l.text).join("\n");
 if(navigator.clipboard?.writeText)navigator.clipboard.writeText(txt).then(()=>{
   const b=$("copySource");b.textContent="Copied original wording ✓";
   setTimeout(()=>b.textContent="Copy cited lines",1200);
 }).catch(()=>fallbackCopy(txt));
 else fallbackCopy(txt);
}
function fallbackCopy(txt){
 const area=document.createElement("textarea");area.value=txt;area.style.position="fixed";area.style.opacity="0";
 document.body.append(area);area.select();document.execCommand("copy");area.remove();
 $("copySource").textContent="Copied original wording ✓";
 setTimeout(()=>$("copySource").textContent="Copy cited lines",1200);
}
function render(){renderTabs();renderStats();renderRecords();}

function makeE05FromCanonical(raw){
 const headers=[...raw.matchAll(/^EPISODE\s+(\d+)\s*$/gm)];
 if(headers.length!==69)throw Error("Expected original source headings");
 const lines=raw.slice(headers[4].index,headers[5].index).split(/\r?\n/);
 if(lines.length!==233)throw Error("E05 expected 233 exact source lines");
 let prev=0;
 const events=DATA.e05Scenes.scenes.map((scene,i)=>{
   const [a,b]=scene.source_lines;
   if(a!==prev+1||b>233)throw Error("E05 source range mismatch: "+scene.id);
   prev=b;
   return{id:scene.id,episode_id:"E05",label:scene.title,line_start:a,line_end:b,
     raw_lines:lines.slice(a-1,b).map((text,j)=>({line:a+j,text}))};
 });
 if(prev!==233)throw Error("E05 unindexed source lines");
 return{kind:"episode",episode_id:"E05",line_count:233,
   source:{master_first_line:raw.slice(0,headers[4].index).split(/\r?\n/).length},events};
}
function makeE04FromCanonical(raw){
 const heads=[...raw.matchAll(/^EPISODE\s+(\d+)\s*$/gm)];
 if(heads.length!==69||heads[3][1]!=="4")throw Error("Unexpected raw source headings");
 const lines=raw.slice(heads[3].index,heads[4].index).split(/\r?\n/);
 if(lines.length!==207)throw Error("E04 source has "+lines.length+" lines instead of 207");
 const windows=[[1,4,"episode_header"],...DATA.e04Direction.scenes.map(s=>[...s.source_lines,s.title]),[203,207,"closing"]];
 let prev=0;
 const events=windows.map(([a,b,label],i)=>{
  if(a!==prev+1||b>207||a>b)throw Error("Noncontiguous E04 scene index near "+label);
  prev=b;
  return{id:"E04-B"+String(i+1).padStart(3,"0"),episode_id:"E04",label,
   line_start:a,line_end:b,raw_lines:lines.slice(a-1,b).map((str,j)=>({line:a+j,text:str}))};
 });
 if(prev!==207)throw Error("E04 index incomplete");
 return{kind:"episode",episode_id:"E04",line_count:207,
  source:{master_first_line:raw.slice(0,heads[3].index).split(/\r?\n/).length},
  events};
}

async function main(){
 try{
  const pairs=await Promise.all(Object.entries(URLS).map(async ([key,url])=>{
   const res=await fetch(url,{cache:"no-store"});
   if(!res.ok)throw Error(url+" → HTTP "+res.status);
   return [key,await res.json()];
  }));
  for(const [key,data] of pairs)DATA[key]=data;
  const rawResponse=await fetch("./raw/Dhika.txt",{cache:"no-store"});
  if(!rawResponse.ok)throw Error("Canonical source → HTTP "+rawResponse.status);
  const completeRaw=await rawResponse.text();
  DATA.e04=makeE04FromCanonical(completeRaw);
  DATA.e05=makeE05FromCanonical(completeRaw);
  const headers=[...completeRaw.matchAll(/^EPISODE\s+(\d+)\s*$/gm)];
  DATA.e05RawOffset=completeRaw.slice(0,headers[4].index).split(/\r?\n/).length-1;
  for(const key of ["episode","e02","e03","e04","e05"]){
   const ep=DATA[key],nums=ep.events.flatMap(e=>e.raw_lines.map(z=>z.line));
   if(nums.length!==ep.line_count||new Set(nums).size!==ep.line_count||!nums.every((n,i)=>n===i+1))throw Error("Source integrity failed for "+ep.episode_id);
  }
  renderCharacterOptions();renderRelationshipOptions();
  const url=new URL(window.location.href),pair=url.searchParams.get("pair"),ep=url.searchParams.get("episode"),view=url.searchParams.get("view");
  if(view&&Object.prototype.hasOwnProperty.call(META,view))STATE.view=view;
  if(pair&&DATA.bonds.relationships.some(r=>r.id===pair))STATE.relationship=pair;
  if(["ALL","E01","E02","E03","E04","E05"].includes(ep))STATE.episode=ep;
  updateToolbar();
  $("loadStatus").textContent="E01–E05 original indexed · E05 prediction audited · 65 exact style examples";
  $("searchInput").addEventListener("input",e=>{STATE.query=e.target.value;renderRecords();});
  $("characterFilter").addEventListener("change",e=>{STATE.character=e.target.value;STATE.selected=null;renderRecords();});
  $("episodeFilter").addEventListener("change",e=>{STATE.episode=e.target.value;STATE.selected=null;render();});
  $("relationshipFilter").addEventListener("change",e=>{
   STATE.relationship=e.target.value;STATE.selected=null;render();
   const url=new URL(window.location.href);url.searchParams.set("pair",STATE.relationship);
   window.history.replaceState(null,"",url);
  });
  $("facetFilter").addEventListener("change",e=>{STATE.facet=e.target.value;STATE.selected=null;render();});
  $("showRaw").addEventListener("change",e=>{STATE.showRaw=e.target.checked;renderRecords();});
  $("downloadJson").onclick=downloadActive;
  $("copySource").onclick=copySelected;
  render();
 }catch(e){
  $("loadStatus").textContent="Unable to load evidence: "+e.message;
  $("loadStatus").classList.add("error");
  $("records").append(text("div","Dashboard requires a web server or GitHub Pages. Do not open index.html directly from a file:// URL. Details: "+e.message,"empty error"));
 }
}
main();
