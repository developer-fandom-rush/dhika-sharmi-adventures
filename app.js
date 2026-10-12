"use strict";
const URLS={
  episode:"./data/episodes/e01.json",
  physical:"./data/physical_actions.json",
  bonds:"./data/bond_evolution.json",
  heat:"./data/internal_heat_access.json",
  escalation:"./data/escalation_patterns.json",
  curiosity:"./data/arousal_reader_curiosity.json"
};
const META={
  episode:{title:"Episode 01 timeline",tab:"Episode",note:"44 uninterrupted original-text windows; every one of E01's 229 lines appears once."},
  physical:{title:"Character physical actions",tab:"Physical actions",note:"Only source-evidenced movement/contact, with contact status kept separate from assumption."},
  bonds:{title:"Relationship / bond evolution",tab:"Bond evolution",note:"Append-only relationship transitions; earlier source records are preserved."},
  heat:{title:"Internal reactions & access",tab:"Heat / access",note:"Reader knowledge, narrator-private response, observed access, and permission are not interchangeable."},
  escalation:{title:"Escalation and pacing",tab:"Escalation",note:"Source order and timing, not invented numeric intensity scores."},
  curiosity:{title:"Reader curiosity & arousal cues",tab:"Reader curiosity",note:"Original wording shows what is revealed, withheld, repeated and remembered."}
};
const CHARACTER_NAMES={
  dhika:"Dhika",john:"John",uncle:"Uncle",aunty:"Aunty",
  sharmi:"Sharmi",raj:"Raj",bantu:"Bantu",bobby:"Bobby",
  chotu:"Chotu / Babu",maami:"Bindu Maami",pappu:"Pappu (family only)"
};
const DATA={};
const STATE={view:"episode",query:"",character:"",selected:null,showRaw:true};
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
 ["actor","target","subject","other_character"].forEach(k=>{if(item[k])ids.push(item[k]);});
 return [...new Set(ids)];
}
function listItems(view){
 const d=DATA[view];
 if(!d)return[];
 let base=[];
 if(view==="episode"||view==="heat"||view==="curiosity")base=d.events;
 else if(view==="physical")base=d.characters.flatMap(c=>c.events.map(e=>({...e,character_label:c.name})));
 else if(view==="bonds")base=d.relationships.flatMap(r=>r.states.map(e=>({...e,relationship_id:r.id,participants:r.participants})));
 else if(view==="escalation")base=d.tracks.flatMap(t=>t.events.map(e=>({...e,relationship_id:t.relationship_id,participants:t.relationship_id.split("_")})));
 return base.slice().sort((a,b)=>a.line_start-b.line_start||(a.sequence||0)-(b.sequence||0));
}
function itemHeading(item){
 return titleCase(item.label||item.action||item.state_tag||item.stage||item.narrative_device||item.id);
}
function itemTags(item){
 const words=[...(item.tags||[])];
 ["relationship_id","action_domain","contact_evidence","consent_status","channel","access_evidenced","knowledge_visibility","mechanism","source_pacing","narrative_device","reader_information","state_tag"].forEach(k=>{
   if(item[k]&&!words.includes(item[k]))words.push(item[k]);
 });
 return words;
}
function filteredItems(){
 const q=STATE.query.toLowerCase().trim();
 return listItems(STATE.view).filter(item=>{
   const people=characterIds(item);
   if(STATE.character&&!people.includes(STATE.character))return false;
   if(!q)return true;
   const searchable=[item.id,itemHeading(item),people.join(" "),itemTags(item).join(" "),...(item.raw_lines||[]).map(l=>l.text)].join(" ").toLowerCase();
   return searchable.includes(q);
 });
}
function renderStats(){
 const st=$("stats");st.replaceChildren();
 const values=[
 ["229 / 229","Raw lines indexed"],
 [DATA.episode.events.length,"Timeline windows"],
 [listItems("physical").length,"Physical actions"],
 [DATA.bonds.relationships.length,"Relationships"],
 [listItems("escalation").length,"Escalation markers"],
 [listItems("curiosity").length,"Reader cues"]
 ];
 for(const [number,label] of values){
  const box=text("div","","stat");
  box.append(text("div",number,"number"),text("div",label,"label"));
  st.append(box);
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
function lineLabel(item){return "E01 L"+String(item.line_start).padStart(3,"0")+"–L"+String(item.line_end).padStart(3,"0");}
function createTags(tags,max=4){
 const r=text("div","","tag-row");
 for(const tag of tags.slice(0,max))r.append(text("span",titleCase(tag),"tag"));
 return r;
}
function rawSnippet(item){
 const block=text("div","","record-snippet");
 (item.raw_lines||[]).forEach((line,i)=>{
   const x=text("div","L"+String(line.line).padStart(3,"0")+"  "+(line.text||""),"snippet-line");
   block.append(x);
 });
 return block;
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
function renderCrossReferences(item){
 let container=document.getElementById("relatedRecords");
 if(!container){
  container=text("div","","related-records");container.id="relatedRecords";
  document.querySelector(".source-top").append(container);
 }
 container.replaceChildren();
 if(!item)return;
 const related=[];
 for(const view of Object.keys(META)){
  if(view===STATE.view)continue;
  for(const e of listItems(view)){
   const overlap=Math.min(item.line_end,e.line_end)-Math.max(item.line_start,e.line_start)+1;
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
   STATE.view=x.view;STATE.character="";STATE.query="";STATE.selected=x.e.id;
   $("characterFilter").value="";$("searchInput").value="";
   render();
  });
  wrap.append(b);
 }
 container.append(wrap);
}
function renderSource(item){
 const pane=$("sourceLines");pane.replaceChildren();
 const copy=$("copySource");copy.disabled=!item;
 if(!item){
  renderCrossReferences(null);
  $("sourceHeading").textContent="Select an evidence record";
  $("sourceMeta").textContent="Every excerpt is original author wording from E01.";
  $("viewGithubLine").href=repoPath;
  pane.append(text("div","Choose a source record to inspect exact lines.","placeholder"));
  return;
 }
 renderCrossReferences(item);
 $("sourceHeading").textContent=itemHeading(item);
 $("sourceMeta").textContent=item.id+" · "+lineLabel(item)+" · "+(item.raw_lines||[]).length+" lines";
 // E01 begins at L003 of the complete master, so E01-local L001 -> master L003.
 $("viewGithubLine").href=repoPath+"#L"+(item.line_start+2)+"-L"+(item.line_end+2);
 for(const line of item.raw_lines||[]){
  const row=text("div","","source-line");
  row.append(text("span","L"+String(line.line).padStart(3,"0"),"line-no"));
  const code=text("span","","line-text"+(line.text===""?" blank":""));
  if(line.text==="")code.textContent="↵ blank";
  else appendHighlighted(code,line.text,STATE.query.trim());
  row.append(code);pane.append(row);
 }
 pane.scrollTop=0;
}
function downloadActive(){
 const data=JSON.stringify(DATA[STATE.view],null,2)+"\n";
 const blob=new Blob([data],{type:"application/json;charset=utf-8"});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;
 a.download=URLS[STATE.view].split("/").at(-1);a.click();URL.revokeObjectURL(url);
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
  const all=DATA.episode.events.flatMap(x=>x.raw_lines.map(z=>z.line));
  if(all.length!==229||new Set(all).size!==229||!all.every((n,i)=>n===i+1))throw Error("Source integrity: line coverage failed");
  renderCharacterOptions();renderStats();
  $("loadStatus").textContent="229/229 lines indexed · 6 JSON datasets loaded";
  $("searchInput").addEventListener("input",e=>{STATE.query=e.target.value;renderRecords();});
  $("characterFilter").addEventListener("change",e=>{STATE.character=e.target.value;renderRecords();});
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
