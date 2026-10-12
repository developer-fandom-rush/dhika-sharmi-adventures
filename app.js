"use strict";
const URLS={
  episode:"./data/episodes/e01.json",
  physical:"./data/physical_actions.json",
  bonds:"./data/bond_evolution.json",
  heat:"./data/internal_heat_access.json",
  escalation:"./data/escalation_patterns.json",
  curiosity:"./data/arousal_reader_curiosity.json",
  e02:"./data/episodes/e02.json",
  inner:"./data/character_inner_evolution.json",
  triggers:"./data/reader_triggers.json",
  groups:"./data/group_encounters.json"
};
const META={
  episode:{title:"Episode original timeline",tab:"Episode",note:"Uninterrupted original text, all lines preserved, each source segment uniquely indexed."},
  inner:{title:"Character inner thoughts & changing nature",tab:"Inner Evolution ★",note:"Before → shift, source voice, exact line; no character's feelings copied onto another."},
  triggers:{title:"Exact author trigger phrases",tab:"Trigger Words ✦",note:"Exact phrase highlighted. A hook, emotional shift, visual description and payoff are not interchangeable."},
  groups:{title:"Group encounters · separate character states",tab:"Group Events",note:"Shared original passage stored once; each character has independent actions, knowledge and reactions."},
  physical:{title:"Character physical actions",tab:"Physical actions",note:"What actually happened, who did it, and whether contact was intentional, accidental or uninvited."},
  bonds:{title:"Relationship / bond evolution",tab:"Bond evolution",note:"Append-only relationship evidence; E01 is never overwritten or compressed."},
  heat:{title:"Internal reactions & access",tab:"Heat / access",note:"Track actual access, discomfort, private thought and knowledge without invented numeric intensity."},
  escalation:{title:"Escalation and pacing",tab:"Escalation",note:"Ordered changes, actual physical boundaries, pace and mechanism with source evidence."},
  curiosity:{title:"Reader curiosity & arousal cues",tab:"Reader curiosity",note:"The author's wording shows what is revealed, concealed, repeated and contrasted."}
};
const CHARACTER_NAMES={
  dhika:"Dhika",john:"John",uncle:"Uncle",aunty:"Aunty",
  sharmi:"Sharmi",raj:"Raj",bantu:"Bantu",bobby:"Bobby",
  chotu:"Chotu / Babu",maami:"Bindu Maami",pappu:"Pappu (family only)"
};
const DATA={};
const STATE={view:"inner",episode:"E02",query:"",character:"",selected:null,showRaw:true};
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
 ["actor","target","subject","other_character","character_id","other_character_id"].forEach(k=>{if(item[k])ids.push(item[k]);});
 return [...new Set(ids)];
}
function listItems(view){
 const d=DATA[view];
 if(!d)return[];
 let base=[];
 if(view==="episode")base=[...DATA.episode.events,...DATA.e02.events];
 else if(view==="heat"||view==="curiosity")base=d.events;
 else if(view==="physical")base=d.characters.flatMap(c=>c.events.map(e=>({...e,character_label:c.name})));
 else if(view==="bonds")base=d.relationships.flatMap(r=>r.states.map(e=>({...e,relationship_id:r.id,participants:r.participants})));
 else if(view==="escalation")base=d.tracks.flatMap(t=>t.events.map(e=>({...e,relationship_id:t.relationship_id,participants:t.relationship_id.split("_")})));
 else if(view==="inner")base=Object.values(d.characters).flatMap(ch=>ch.states.map(state=>({...state,character_id:ch.character_id,is_inner:true})));
 else if(view==="triggers")base=d.triggers.map(trigger=>({...trigger,id:trigger.id,is_trigger:true,line_start:trigger.line,line_end:trigger.line,raw_lines:[{line:trigger.line,text:trigger.source_line}]}));
 else if(view==="groups")base=d.groups.map(group=>({...group,is_group:true,raw_lines:group.shared_raw_lines}));
 return base.sort((a,b)=>a.episode_id.localeCompare(b.episode_id)||a.line_start-b.line_start||String(a.id).localeCompare(String(b.id)));
}
function itemHeading(item){
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
   if(item.episode_id!==STATE.episode)return false;
   if(STATE.character&&!people.includes(STATE.character))return false;
   if(!q)return true;
   const searchable=[item.id,itemHeading(item),people.join(" "),itemTags(item).join(" "),
       item.change_marker,item.prior_state_or_expectation,item.observed_state_or_difference,item.why_this_exact_phrase_matters,item.label,item.observable_action,
       ...(item.raw_lines||[]).map(l=>l.text)].join(" ").toLowerCase();
   return searchable.includes(q);
 });
}
function renderStats(){
 const st=$("stats");st.replaceChildren();
 const scope=STATE.episode,records=view=>listItems(view).filter(x=>x.episode_id===scope);
 const ep=scope==="E01"?DATA.episode:DATA.e02;
 const values=[
 [ep.line_count+" / "+ep.line_count,"Source lines indexed"],
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
   b.onclick=()=>{STATE.view=view;STATE.selected=null;render();};
   wrap.append(b);
 }
}
function renderCharacterOptions(){
 const select=$("characterFilter");
 for(const id of Object.keys(CHARACTER_NAMES)){
   const opt=document.createElement("option");opt.value=id;opt.textContent=CHARACTER_NAMES[id];select.append(opt);
 }
}
function lineLabel(item){
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
 if(item.is_inner){
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
 $("datasetTitle").textContent=META[STATE.view].title;
 $("datasetNote").textContent=META[STATE.view].note;
 $("resultCount").textContent=countLabel(items.length);
 if(!items.length){
  area.append(text("div","No matching source records. Try clearing the search or character filter.","empty"));
  STATE.selected=null;renderSource(null);return;
 }
 if(!items.some(x=>x.id===STATE.selected))STATE.selected=items[0].id;
 for(const item of items){
  const node=text("article","","record"+(STATE.selected===item.id?" selected":""));
  node.setAttribute("role","button");node.setAttribute("tabindex","0");
  node.setAttribute("aria-label",itemHeading(item)+", "+lineLabel(item));
  node.append(text("div","","record-top"));
  node.lastChild.append(text("span",item.id,"record-id"),text("span",lineLabel(item),"record-range"));
  node.append(text("div",itemHeading(item),"record-label"));
  const characters=characterIds(item).map(id=>CHARACTER_NAMES[id]||id);
  if(characters.length)node.append(text("div",characters.join(" · "),"record-chars"));
  node.append(createTags(itemTags(item)));
  if(item.is_inner||item.is_trigger||item.is_group)appendSourceAnalysis(node,item);
  if(STATE.showRaw)node.append(rawSnippet(item));
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
   render();
  });
  wrap.append(b);
 }
 container.append(wrap);
}
function renderSourceHighlight(node,source,lineNumber,episodeId,query){
 const q=query.trim(),found=[];
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
 $("sourceHeading").textContent=itemHeading(item);
 $("sourceMeta").textContent=item.id+" · "+lineLabel(item)+" · "+(item.raw_lines||[]).length+" lines";
 const epData=item.episode_id==="E01"?DATA.episode:DATA.e02;
 const offset=(epData.source.master_first_line||3)-1;
 $("viewGithubLine").href=repoPath+"#L"+(item.line_start+offset)+"-L"+(item.line_end+offset);
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
 const payload=(STATE.view==="episode"&&STATE.episode==="E02")?DATA.e02:DATA[STATE.view];
 const data=JSON.stringify(payload,null,2)+"\n";
 const blob=new Blob([data],{type:"application/json;charset=utf-8"});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;
 a.download=URLS[(STATE.view==="episode"&&STATE.episode==="E02")?"e02":STATE.view].split("/").at(-1);a.click();URL.revokeObjectURL(url);
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
function render(){renderTabs();renderRecords();}
async function main(){
 try{
  const pairs=await Promise.all(Object.entries(URLS).map(async ([key,url])=>{
   const res=await fetch(url,{cache:"no-store"});
   if(!res.ok)throw Error(url+" → HTTP "+res.status);
   return [key,await res.json()];
  }));
  for(const [key,data] of pairs)DATA[key]=data;
  for(const key of ["episode","e02"]){
   const ep=DATA[key],nums=ep.events.flatMap(e=>e.raw_lines.map(z=>z.line));
   if(nums.length!==ep.line_count||new Set(nums).size!==ep.line_count||!nums.every((n,i)=>n===i+1))throw Error("Source integrity failed for "+ep.episode_id);
  }
  renderCharacterOptions();renderStats();
  $("loadStatus").textContent="E01: 229/229 · E02: 160/160 · character changes + exact triggers loaded";
  $("searchInput").addEventListener("input",e=>{STATE.query=e.target.value;renderRecords();});
  $("characterFilter").addEventListener("change",e=>{STATE.character=e.target.value;STATE.selected=null;renderRecords();});
  $("episodeFilter").addEventListener("change",e=>{STATE.episode=e.target.value;STATE.selected=null;renderStats();renderRecords();});
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
