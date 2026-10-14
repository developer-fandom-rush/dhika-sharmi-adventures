"use strict";
const $=id=>document.getElementById(id);
const enc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const srcUrl=n=>"https://github.com/developer-fandom-rush/dhika-sharmi-adventures/blob/main/raw/Dhika.txt#L"+n;
const loc="./data/";
const loadPaths=[
loc+"unified_pair_scene_anchors.json",
loc+"twins_e01_source_actions_v1.json",
loc+"twins_e02_actions_v1.json",loc+"twins_e02_scene_completion_v1.json",
loc+"twins_e03_actions_v1.json",loc+"twins_e03_scene_completion_v1.json",
loc+"twins_e04_actions_v1.json",
loc+"twins_e05_actions_p1.json",loc+"twins_e05_actions_p2.json",loc+"twins_e05_actions_p3.json",
loc+"twins_e05_callbacks.json",loc+"twins_e01_e05_state_index_v1.json",
"./raw/Dhika.txt"];
const trackNames={DB:"Dhika × Bantu",DY:"Dhika × Bobby",TRIO:"Dhika × Bantu × Bobby",DBC:"Dhika × Bobby × Chotu"};
let canon=[],episodes=[],curated=[],scenes=[],windows=[],states=[],gaps=[],filtered=[],shown=0,tab="history";
function link(n){return '<a href="'+srcUrl(n)+'" target="_blank" rel="noopener">Raw L'+n+' ↗</a>'}
function has(s,k){return k==="Bantu"?/\bbantu\b/i.test(s):k==="Bobby"?/\bbobby\b/i.test(s):k==="Chotu"?/\b(chotu|babu)\b/i.test(s):/\btwins?\b/i.test(s)}
function epFor(n){return episodes.find(e=>n>=e.start&&n<=e.end)?.id||0}
function cue(s,find){
 if(!find)return enc(s);
 const lower=s.toLowerCase(),word=find.toLowerCase(),idx=lower.indexOf(word);
 if(idx<0)return enc(s);
 return enc(s.slice(0,idx))+"<mark>"+enc(s.slice(idx,idx+find.length))+"</mark>"+enc(s.slice(idx+find.length))
}
function getLines(a,b,query="",limit=0){
 let len=b-a+1,arr=[],cut=limit?Math.min(b,a+limit-1):b;
 for(let n=a;n<=cut;n++){
  let s=canon[n-1]||"";
  arr.push('<div class="mini"><div class="row">'+link(n)+'<span class="muted">E'+String(epFor(n)).padStart(2,"0")+'</span></div><div class="evidence">'+cue(s,query)+'</div></div>')
 }
 if(limit&&len>limit)arr.push('<p class="muted">'+(len-limit)+' more original source lines. Expand below to read the complete scene.</p>');
 return arr.join("")
}
function normalize(d,ep,i){
 const r=d.records||d.rows||[];
 return r.map((a,j)=>{
 if(Array.isArray(a)){
  return {id:"E"+ep+"-P"+i+"-"+j,episode:ep,line:+a[0],pair:a.length>=5?a[1]:"TRIO",actor:a.length>=5?a[2]:"Narrator",action:a.length>=5?a[3]:a[1],kind:a.length>=5?a[4]:"context",source_kind:"curated_first_pass"}
 }
 return {id:a.id||"E"+ep+"-R"+i+"-"+j,episode:ep,line:+(a.line||a.source_line),pair:a.pair||"TRIO",actor:a.actor||"Narrator",action:a.action||"unspecified",kind:a.type||a.kind||"source_action",source_kind:"curated_first_pass"}
 })
}
function parseChapters(){
 const entries=[];for(let i=0;i<canon.length;i++){const m=canon[i].match(/^EPISODE (\d+)$/);if(m&&+m[1]<=69)entries.push({id:+m[1],start:i+1})}
 return entries.filter(e=>e.id<=68).map(e=>({...e,end:entries.find(x=>x.id===e.id+1).start-1}))
}
function makeWindows(){
 const all=[];
 for(const e of episodes){
  const hits=[];for(let n=e.start;n<=e.end;n++){
   const text=canon[n-1],names=["Bantu","Bobby","Chotu","Twins"].filter(k=>has(text,k));
   if(names.length)hits.push({n,names});
  }
  const chunks=[];for(const h of hits){
   const prev=chunks.at(-1);
   if(prev&&h.n-prev.last<=6&&h.n-prev.start<75){prev.last=h.n;prev.hits.push(h)}
   else chunks.push({start:h.n,last:h.n,hits:[h]});
  }
  for(const c of chunks){
   const allNames=new Set(c.hits.flatMap(h=>h.names));
   const tracks=[];
   if(allNames.has("Bantu")||allNames.has("Twins"))tracks.push("DB");
   if(allNames.has("Bobby")||allNames.has("Twins"))tracks.push("DY");
   if((allNames.has("Bantu")&&allNames.has("Bobby"))||allNames.has("Twins"))tracks.push("TRIO");
   if(allNames.has("Bobby")&&allNames.has("Chotu"))tracks.push("DBC");
   all.push({id:"CAND-"+e.id+"-"+c.start,recordType:"candidate",episode:e.id,start:Math.max(e.start,c.start-2),end:Math.min(e.end,c.last+2),tracks,source_kind:"UNREVIEWED_MENTION_WINDOW",hits:c.hits.length,names:[...allNames]});
  }
 }
 return all
}
function relevant(r,p){
 if(r.recordType==="action")return r.pair===p;
 if(r.recordType==="scene")return r.track===p||p==="DB"&&r.track==="TRIO"||p==="DY"&&r.track==="TRIO";
 return r.tracks.includes(p)
}
function searched(r,q){
 if(!q)return true;
 const hay=(r.id+" "+r.action+" "+r.actor+" "+r.kind+" "+r.episode+" "+r.line+" "+r.start+" "+r.end+" "+(r.title||"")+" "+(r.roles||"")).toLowerCase();
 if(hay.includes(q))return true;
 const a=r.line||r.start,b=r.line||r.end;
 for(let i=a;i<=b;i++)if((canon[i-1]||"").toLowerCase().includes(q))return true;
 return false
}
function statusChip(status){
 return '<span class="badge '+(status==="UNREVIEWED_MENTION_WINDOW"?"pending":"")+'">'+enc(status==="UNREVIEWED_MENTION_WINDOW"?"Unreviewed reference":status==="VERIFIED_SOURCE_SCENE"?"Verified scene anchor":"Curated first pass")+'</span>'
}
function actionCard(r){
 return '<article class="card"><div class="row"><div>'+statusChip(r.source_kind)+'<span class="badge source">E'+String(r.episode).padStart(2,"0")+'</span></div>'+link(r.line)+'</div>'+
 '<h3>'+enc(r.action.replaceAll("_"," "))+'</h3><div class="muted">Actor: '+enc(r.actor)+' · '+enc(r.kind)+' · pair '+enc(r.pair)+'</div>'+
 '<div class="evidence">'+cue(canon[r.line-1]||"",$("search").value.trim())+'</div><p class="muted">Source text retained verbatim. Classification is an annotation, not a replacement.</p></article>'
}
function rangeCard(r){
 const a=r.start,b=r.end,candidate=r.recordType==="candidate",inside=curated.filter(x=>x.line>=a&&x.line<=b);
 const label=candidate?"Names mentioned within a source window — no encounter inferred":r.kind.replaceAll("_"," ");
 const suffix=candidate?'<p class="hint">Co-mention is NOT proof of a shared scene, action, or knowledge.</p>':'<p class="hint">'+enc(r.roles||"")+'</p>';
 return '<article class="card"><div class="row"><div>'+statusChip(r.source_kind)+'<span class="badge source">E'+String(r.episode).padStart(2,"0")+' · '+a+'–'+b+'</span></div>'+link(a)+'</div><h3>'+enc(label)+'</h3>'+suffix+
 '<p class="muted">'+(candidate?"Name-hit paragraphs: "+r.hits:"Linked action records in range: "+inside.length)+'</p>'+
 '<details><summary>Open all original lines ('+(b-a+1)+')</summary>'+getLines(a,b,$("search").value.trim(),0)+
 (inside.length?'<details><summary>Source-indexed actions ('+inside.length+')</summary>'+inside.map(x=>'<div class="mini">'+link(x.line)+' · '+enc(x.pair)+" · "+enc(x.action.replaceAll("_"," "))+'</div>').join("")+'</details>':"")+
 '</details></article>'
}
function renderChunk(){
 const slice=filtered.slice(shown,shown+18);shown+=slice.length;
 $("results").insertAdjacentHTML("beforeend",slice.map(r=>r.recordType==="action"?actionCard(r):rangeCard(r)).join(""));
 $("more").hidden=shown>=filtered.length;$("info").textContent=shown+" / "+filtered.length+" items displayed. Source-text results may be candidates; use verified scene records for confirmed co-presence."
}
function getFilter(){
 const p=$("pair").value,e=$("episode").value,k=$("kind").value,q=$("search").value.trim().toLowerCase();
 let all=curated.concat(scenes,windows).filter(r=>relevant(r,p));
 if(k==="verified")all=all.filter(r=>r.source_kind!=="UNREVIEWED_MENTION_WINDOW");
 if(k==="candidate")all=all.filter(r=>r.source_kind==="UNREVIEWED_MENTION_WINDOW");
 if(e!=="all")all=all.filter(r=>r.episode===+e);
 if(q)all=all.filter(r=>searched(r,q));
 return all.sort((a,b)=>a.episode-b.episode||(a.line||a.start)-(b.line||b.start)||String(a.id).localeCompare(String(b.id)))
}
function history(){
 filtered=getFilter();shown=0;$("results").innerHTML="";renderChunk()
}
function sceneView(){
 const p=$("pair").value,e=$("episode").value,q=$("search").value.trim().toLowerCase();
 const list=scenes.filter(s=>relevant(s,p)&&(e==="all"||s.episode===+e)&&searched(s,q));
 $("results").innerHTML=list.map(rangeCard).join("");
 $("info").textContent=list.length+" source-established scene groups; historical coverage is not exhaustive across all 68 episodes.";
 $("more").hidden=true
}
function stateView(){
 const p=$("pair").value,e=$("episode").value;
 const rows=states.filter(x=>(p==="TRIO"||p==="DBC"?x[1]==="TRIO":x[1]===p||x[1]==="TRIO")&&(e==="all"||x[0]===+e));
 const mini=rows.map(x=>'<article class="card"><span class="badge source">E'+String(x[0]).padStart(2,"0")+' · '+enc(x[1])+'</span><h3>'+enc(x[2])+'</h3><p>'+link(x[3][0])+'</p><p class="hint">A historical state reading; not a claim of inevitable future behavior.</p></article>');
 if(p==="DBC")mini.unshift('<article class="card"><h3>Group-specific source baseline</h3><p>Confirmed group scene: E06 lines 1143–1199. For later scenes, co-presence, remote interaction and individual relationships must remain separate.</p>'+link(1143)+'</article>');
 $("results").innerHTML=mini.join("")||'<article class="card">No certified relationship state for this selection yet. Consult source windows and the QA gaps before drawing conclusions.</article>';
 $("info").textContent=rows.length+" earlier state entries; no prediction probability assigned.";$("more").hidden=true
}
function qaView(){
 const p=$("pair").value,e=$("episode").value;
 const c=curated.filter(x=>relevant(x,p)&&(e==="all"||x.episode===+e));
 const n=windows.filter(x=>relevant(x,p)&&(e==="all"||x.episode===+e));
 $("results").innerHTML='<article class="card"><h2>Audit contract · 12 persistent gaps</h2><p>These items define what must be checked before this tracker can be treated as a complete prediction input. Existing pages remain unchanged.</p>'+
 gaps.map(g=>'<div class="mini"><span class="badge pending">'+enc(g.id)+' · '+enc(g.priority)+'</span><strong>'+enc(g.title)+'</strong><p class="muted">'+enc(g.closure)+'</p></div>').join("")+
 '</article><article class="card"><h2>Scope validation</h2><p>Curated first-pass records in this filter: '+c.length+'. Candidate windows requiring review: '+n.length+'.</p>'+
 '<p><strong>Do not infer:</strong> relationship status from body contact, completion from requests, group presence from co-mentions, or actual chronology from narration order.</p>'+
 '<p><strong>Names:</strong> Bantu and Bobby are source names; Chotu and Babu are verified aliases. Bunty/Mantu remain unconfirmed spellings in source.</p>'+
 '<p><a href="./data/unified_pair_scene_anchors.json">View QA and scene evidence JSON ↗</a></p></article>';
 $("info").textContent="Auditable gaps persist; no confidence percentage or prediction accuracy is implied.";$("more").hidden=true
}
function render(){
 for(const btn of document.querySelectorAll("[data-tab]"))btn.setAttribute("aria-pressed",String(btn.dataset.tab===tab));
 if(tab==="history")history();if(tab==="scenes")sceneView();if(tab==="states")stateView();if(tab==="qa")qaView()
}
(async function boot(){
 try{
  const responses=await Promise.all(loadPaths.map(p=>fetch(p)));
  const bad=responses.map((r,i)=>!r.ok?loadPaths[i]:null).filter(Boolean);if(bad.length)throw Error("Missing data: "+bad.join(", "));
  const data=await Promise.all(responses.slice(0,-1).map(x=>x.json()));canon=(await responses.at(-1).text()).split(/\r?\n/);
  episodes=parseChapters();if(episodes.length!==68||canon[2]!=="EPISODE 1"||canon[13702]!=="EPISODE 68")throw Error("Unexpected original source boundaries");
  scenes=data[0].scenes.map(s=>({...s,recordType:"scene",source_kind:s.status}));
  gaps=data[0].qa_gaps;states=data[11].states;
  const epIndex=[1,2,2,3,3,4,5,5,5,5];
  curated=data.slice(1,11).flatMap((d,i)=>normalize(d,epIndex[i],i)).map(r=>({...r,recordType:"action"}));
  windows=makeWindows();
  for(let i=1;i<=68;i++){$("episode").insertAdjacentHTML("beforeend",'<option value="'+i+'">Episode '+String(i).padStart(2,"0")+'</option>')}
  $("stats").innerHTML=[
   [68,"Episode slots scanned"],[curated.length,"Curated first-pass tags"],[scenes.length,"Verified scene anchors"],[windows.length,"Unreviewed discovery windows"]
  ].map(a=>'<div><strong>'+a[0]+'</strong><small>'+a[1]+'</small></div>').join("");
  $("status").textContent="Ready · original source plus prior curated records loaded. E06–E68 need additional semantic audit; do not treat all name hits as encounters.";
  for(const id of ["pair","episode","kind","search"])$(id).addEventListener(id==="search"?"input":"change",render);
  for(const b of document.querySelectorAll("[data-tab]"))b.onclick=()=>{tab=b.dataset.tab;render()};
  $("more").onclick=renderChunk;render();
 }catch(e){$("status").textContent="Could not finish loading source tracker: "+String(e)}
})();