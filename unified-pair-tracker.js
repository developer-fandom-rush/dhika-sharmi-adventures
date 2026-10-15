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
loc+"unified_pair_audit_v2.json",
loc+"unified_pair_partial_scene_events_v2.json",
loc+"twins_e06_line_ledger_v1.json",loc+"twins_e07_line_ledger_v1.json",
loc+"twins_e01_e05_gap_repairs_v1.json",
loc+"twins_reader_e01_e07_v1.json",
loc+"twins_refinements_attribution_states_style_v1.json",
loc+"twins_e08_line_ledger_v1.json",
loc+"twins_e09_line_ledger_v1.json",
loc+"twins_e10_no_pair_encounter_ledger_v1.json",
loc+"twins_e10_reading_context_v1.json",
loc+"twins_e11_source_ledger_v1.json",
loc+"twins_e12_source_ledger_v1.json",
loc+"twins_e13_source_ledger_v1.json",
loc+"twins_e01_e68_navigation_review_v1.json?v=1",
"./raw/Dhika.txt"];
const trackNames={DB:"Dhika × Bantu",DY:"Dhika × Bobby",TRIO:"Dhika × Bantu × Bobby",DBC:"Dhika × Bobby × Chotu"};
let canon=[],episodes=[],curated=[],scenes=[],windows=[],states=[],gaps=[],audit={},writingNotes=[],lineAudits=[],readerBeats=[],readerEncounters=[],readerRefinements={},filtered=[],shown=0,tab="meetings";
let navigationReview={episodes:[],sections:[]},sourceMatches=[],sourceShown=0;
const selectedEpisodes=new Set();
function sharedEnabled(){return $("shared").checked;}
function trackIncluded(track,p){return track===p||(sharedEnabled()&&track==="TRIO"&&(p==="DB"||p==="DY"));}
function reviewSelect(r){return trackIncluded(r.track,$("pair").value)&&isInScope(r.episode);}
function reviewSearch(r,q){return !q||[r.title,r.reading,r.frame,r.track,r.source.join(" "),r.episode].join(" ").toLowerCase().includes(q)||getPlainSourceMatches(r.source[0],r.source[1],q);}
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
 const entries=d.records||d.rows||[];
 return entries.map((a,j)=>{
  const arr=Array.isArray(a);
  const line=+(arr?a[0]:(a.line??a.source_line??a.source?.global_line??0));
  const pair=arr?(a.length>=5?(a[1]||"TRIO"):"CONTEXT"):(a.pair||"TRIO");
  const actor=arr?(a.length>=5?(a[2]||"Unspecified"):"Narrator"):(a.actor||"Unspecified");
  const action=arr?(a.length>=5?(a[3]||"unspecified"):(a[1]||"context")):(a.action||"unspecified");
  const kind=arr?(a.length>=5?(a[4]||"source_action"):"context"):(a.type||a.kind||"source_action");
  return {id:arr?"E"+ep+"-P"+i+"-"+j:(a.id||"E"+ep+"-R"+i+"-"+j),
   episode:ep,line,pair,actor,action,kind,source_kind:"curated_first_pass",
   recordType:"action",file:loadPaths[i+1],raw:a,
   recipient:arr?"":(a.recipient||""),review:arr?"source_line_anchored_not_second_pass_certified":
   (a.review||a.review_status||d.review_status||d.validation_status||"first_pass"),
   status:arr?"source_anchor":(a.status||a.evidence||"first_pass")};
 });
}
function fnv1a(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,"0")}
function evidenceIntegrity(r){
 const a=r.raw,checksum=Array.isArray(a)?"":(a.source?.line_checksum_fnv1a||a.source_line_checksum_fnv1a||a.source_checksum||a.line_checksum||a.checksum||"");
 if(!Number.isInteger(r.line)||r.line<1||r.line>canon.length)return {label:"Invalid source line",bad:true};
 if(!checksum)return {label:"Source line linked; no checksum in record",bad:false};
 const actual=fnv1a(canon[r.line-1]);return {label:actual.toLowerCase()===String(checksum).toLowerCase()?"Source checksum matches":"Source checksum mismatch",bad:actual.toLowerCase()!==String(checksum).toLowerCase()};
}
function evidenceMeta(r){
 const a=r.raw,integ=evidenceIntegrity(r);
 if(Array.isArray(a))return '<p class="hint">Five-column original anchor retained: source line, pair, actor, action and classification. '+enc(integ.label)+'.</p>';
 const rows=[
  ["Record ID",r.id],["Actor",r.actor],["Recipient",r.recipient||"Not specified"],["Scene ID",a.scene_id||"Not specified"],["Outcome",a.outcome||"Not specified"],
  ["Observer",a.observer||a.observers||"Not specified"],
  ["Reported / observed",a.status||a.evidence||"Not specified"],
  ["Review status",r.review],["Record origin",r.file],
  ["Note",a.note||"Not specified"],["Verification",integ.label]
 ];
 const pos=a.source?.highlight_start!=null?[[a.source.highlight_start,a.source.highlight_end]]:
   (a.highlight_matches||a.highlights||a.word_cues||[]).map(x=>[x.start,x.end]);
 if(pos.length)rows.push(["Original offsets",JSON.stringify(pos)]);
 return '<dl class="metadata">'+rows.map(x=>'<div><dt>'+enc(x[0])+'</dt><dd>'+enc(Array.isArray(x[1])?x[1].join(", "):x[1])+'</dd></div>').join("")+'</dl>';
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
 if(r.recordType==="action"){
  if(trackIncluded(r.pair,p))return true;
  // A group reader retains the individually attributed actions inside an
  // established shared scene, without rewriting their original pair label.
  if(p==="TRIO"&&["DB","DY"].includes(r.pair))return navigationReview.sections.some(s=>s.track==="TRIO"&&["meeting","continuation","remote"].includes(s.frame)&&s.episode===r.episode&&r.line>=s.source[0]&&r.line<=s.source[1])||scenes.some(s=>s.track==="TRIO"&&s.episode===r.episode&&r.line>=s.start&&r.line<=s.end);
  return false;
 }
 if(r.recordType==="scene"){
  if(r.track!==p&&!sharedEnabled())return false;
  const n=new Set(r.participants||[]);
  if(p==="DB")return n.has("Dhika")&&n.has("Bantu");
  if(p==="DY")return n.has("Dhika")&&n.has("Bobby");
  if(p==="TRIO")return ["Dhika","Bantu","Bobby"].every(x=>n.has(x));
  if(p==="DBC")return ["Dhika","Bobby","Chotu"].every(x=>n.has(x));
  return false;
 }
 return (r.tracks||[]).includes(p);
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
 return '<span class="badge '+(status==="UNREVIEWED_MENTION_WINDOW"?"pending":"")+'">'+enc(status==="UNREVIEWED_MENTION_WINDOW"?"Unreviewed reference":status==="VERIFIED_SOURCE_SCENE"?"Verified scene anchor":status==="source_linked_partial"?"Partial scene event":status==="source_linked_first_pass"?"Source-indexed first pass":status==="SOURCE_LINKED_FIRST_PASS_SCENE"?"Source-reviewed scene":"Curated first pass")+'</span>'
}
function actionCard(r){
 const a=r.raw,integrity=evidenceIntegrity(r);
 const shared=r.pair==="TRIO"&&($("pair").value==="DB"||$("pair").value==="DY");
 const source=Array.isArray(a)?r.file:(a.source?.file||a.raw_source||a.source_ref||a.canonical_ref||r.file);
 return '<article class="card action-record"><div class="row"><div>'+statusChip(r.source_kind)+'<span class="badge source">E'+String(r.episode).padStart(2,"0")+'</span>'+(integrity.bad?'<span class="badge pending">CHECKSUM CONFLICT</span>':'')+'</div>'+link(r.line)+'</div>'+
 '<h3>'+enc(r.action.replaceAll("_"," "))+'</h3><p class="muted">Actor: '+enc(r.actor)+' · '+enc(r.kind)+' · '+enc(r.pair)+(shared?' · Shared group-context tag; not a pair-only act':'')+'</p>'+
 '<p class="hint">Status: '+enc(r.status)+' · QA: '+enc(r.review)+'</p>'+
 '<details><summary>Exact original line & full evidence metadata</summary><div class="evidence">'+cue(canon[r.line-1]||"",$("search").value.trim())+'</div>'+
 evidenceMeta(r)+'<p class="muted">Source: '+enc(source)+'</p>'+
 '<details><summary>Unmodified action record (all fields)</summary><pre class="raw-json">'+enc(JSON.stringify(a,null,2))+'</pre></details></details></article>';
}

function rangeCard(r){
 const a=r.start,b=r.end,candidate=r.recordType==="candidate",inside=curated.filter(x=>x.line>=a&&x.line<=b&&relevant(x,$("pair").value));
 const label=candidate?"Names mentioned — participation not yet reviewed":r.kind.replaceAll("_"," ");
 const participants=candidate?(r.names||[]).join(", "):(r.participants||[]).join(", ");
 const suffix=candidate?'<p class="hint">Unreviewed lexical window. Name co-occurrence is not an encounter, completed action, or shared knowledge.</p>':
 '<p class="hint">Indexed participants: '+enc(participants)+'. '+enc(r.roles||"")+'</p>';
 const overlap=r.recordType==="scene"&&r.track!==$("pair").value?'<p class="hint">Cross-track shared scene; displayed due to participants, NOT proof of pair-specific contact.</p>':"";
 return '<article class="card"><div class="row"><div>'+statusChip(r.source_kind)+'<span class="badge source">E'+String(r.episode).padStart(2,"0")+' · '+a+'–'+b+'</span></div>'+link(a)+'</div>'+
 '<h3>'+enc(label)+'</h3>'+suffix+overlap+
 '<p class="muted">'+(candidate?"Name-hit lines: "+r.hits:"Source-tagged actions in range: "+inside.length)+'</p>'+
 '<details><summary>Original source lines ('+(b-a+1)+')</summary>'+getLines(a,b,$("search").value.trim(),0)+
 (inside.length?'<details><summary>Source-tagged action records ('+inside.length+')</summary>'+inside.map(x=>'<div class="mini">'+link(x.line)+' · '+enc(x.pair)+" · "+enc(x.action.replaceAll("_"," "))+' · '+enc(x.review)+'</div>').join("")+'</details>':"")+
 '<details><summary>Unmodified scene/index metadata</summary><pre class="raw-json">'+enc(JSON.stringify(r.recordType==="scene"?{id:r.id,episode:r.episode,start:r.start,end:r.end,track:r.track,participants:r.participants,absent:r.absent,roles:r.roles,status:r.source_kind}:r,null,2))+'</pre></details>'+
 '</details></article>';
}

function renderChunk(){
 if(tab==="source"){renderSourceChunk();return;}
 const slice=filtered.slice(shown,shown+18);shown+=slice.length;
 $("results").insertAdjacentHTML("beforeend",slice.map(r=>r.recordType==="action"?actionCard(r):rangeCard(r)).join(""));
 $("more").hidden=shown>=filtered.length;$("info").textContent=shown+" / "+filtered.length+" items displayed. Source-text results may be candidates; use verified scene records for confirmed co-presence."
}
function getFilter(){
 const p=$("pair").value,e=$("episode").value,k=$("kind").value,q=$("search").value.trim().toLowerCase();
 let all=curated.concat(scenes,windows).filter(r=>relevant(r,p));
 if(k==="verified")all=all.filter(r=>r.source_kind!=="UNREVIEWED_MENTION_WINDOW");
 if(k==="candidate")all=all.filter(r=>r.source_kind==="UNREVIEWED_MENTION_WINDOW");
 // Episode scope is applied by render() using isInScope(), including cumulative selections.
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
function isInScope(ep){
 const selected=$("episode").value,scope=$("scope").value;
 if(scope==="selected")return selectedEpisodes.has(ep);
 return selected==="all"||scope==="through"?selected==="all"||ep<=+selected:ep===+selected;
}
function stateView(){
 const p=$("pair").value,e=$("episode").value;
 const rows=states.filter(x=>(p==="TRIO"?x[1]==="TRIO":p==="DBC"?false:(x[1]===p||x[1]==="TRIO"))&&isInScope(x[0]));
 const mini=rows.map(x=>'<article class="card"><span class="badge source">E'+String(x[0]).padStart(2,"0")+' · '+enc(x[1])+'</span><h3>'+enc(x[2])+'</h3><p>'+link(x[3][0])+'</p><p class="hint">Prior state note: source-scoped first-pass interpretation, NOT later canon or verified prediction.</p></article>');
 if(p==="DBC")mini.unshift('<article class="card"><h3>Group-state caution</h3><p>No certified longitudinal Dhika–Bobby–Chotu state sequence is supplied. E06 has a shared painting anchor, E67 includes a larger group, and E68 is a remote Bobby call.</p>'+link(1143)+'</article>');
 $("results").innerHTML=mini.join("")||'<article class="card">No certified longitudinal state for this selection. Historical context must not be treated as completed encounter proof.</article>';
 $("info").textContent=rows.length+" source-scoped prior state notes; no future probabilities.";$("more").hidden=true
}
function bodyView(){
 const all=curated.filter(r=>relevant(r,$("pair").value)&&isInScope(r.episode)&&/clothing|garment|posture|visible|visibility|gaze|observ|visual|contact|touch|withdraw|physical|hand|body|boundary|embrace|hug|kiss/i.test(r.kind+" "+r.action));
 const query=$("search").value.trim().toLowerCase();
 filtered=all.filter(r=>searched(r,query)).sort((a,b)=>a.episode-b.episode||a.line-b.line);shown=0;$("results").innerHTML=
 '<p class="hint">Source-tagged visual, clothing, boundary or contact-related references. This lexical filter includes thoughts and reported events; it is NOT a verified body-part or completed-contact chronology. Multi-action QA is pending.</p>';renderChunk();
}
function styleView(){
 const p=$("pair").value,query=$("search").value.trim().toLowerCase();
 const notes=writingNotes.filter(w=>isInScope(w.episode)&&
   (trackIncluded(w.track,p)||scenes.some(s=>s.id===w.anchor_id&&relevant(s,p)))&&
   (!query||JSON.stringify(w).toLowerCase().includes(query)||searched({id:w.id,action:w.observation,actor:"",kind:"writing",episode:w.episode,start:w.start,end:w.end},query)));
 $("results").innerHTML=notes.map(w=>'<article class="card"><span class="badge source">E'+String(w.episode).padStart(2,"0")+'</span><h3>'+enc(w.scope)+'</h3><p>'+enc(w.observation)+'</p><p class="hint">'+enc(w.status.replaceAll("_"," "))+' · Source '+w.start+'–'+w.end+'</p><details><summary>View original scene evidence</summary>'+getLines(w.start,w.end,$("search").value.trim(),0)+'</details></article>').join("")||
 '<article class="card">No separately source-linked writing mechanism note for this track / episode. Do not extrapolate style from incomplete action data.</article>';
 const detailed=(readerRefinements.writing_map||[]).filter(w=>readerSelect(w)&&(!query||JSON.stringify(w).toLowerCase().includes(query)));
 const notesHtml=detailed.map(w=>'<article class="card"><div class="row"><h3>E'+w.episode+' · '+enc(w.title)+'</h3>'+link(w.source[0])+'</div>'+
 '<p><b>Scene:</b> '+enc(w.scene_frame)+'</p><p><b>Narration:</b> '+enc(w.narration)+'</p>'+
 '<p><b>Dialogue:</b> '+enc(w.speech)+'</p><p><b>Private thoughts:</b> '+enc(w.private_thought)+'</p>'+
 '<p><b>Knowledge boundary:</b> '+enc(w.who_knows)+'</p><p><b>Sequence:</b> '+enc(w.sequence)+'</p>'+
 '<details><summary>Source for this writing sequence</summary>'+getLines(w.source[0],w.source[1],query,0)+'</details></article>').join("");
 if(detailed.length)$("results").innerHTML='<p class="reader-notice">Detailed narration, dialogue, private thought and knowledge boundaries (source-linked first pass).</p>'+notesHtml+'<details class="reader-meeting"><summary>Earlier writing observations</summary>'+$("results").innerHTML+'</details>';
 $("info").textContent=detailed.length+" detailed writing maps + "+notes.length+" earlier notes";$("more").hidden=true;
}
function coverageMetrics(ep,p){
 const ac=curated.filter(x=>x.episode===ep&&relevant(x,p)).length;
 const sc=scenes.filter(x=>x.episode===ep&&relevant(x,p)).length;
 const wc=windows.filter(x=>x.episode===ep&&relevant(x,p)).length;
 const first=curated.some(x=>x.episode===ep&&relevant(x,p)&&x.source_kind==="curated_first_pass");
 const linePass=lineAudits.some(x=>x.episode===ep);
 const partial=curated.some(x=>x.episode===ep&&relevant(x,p)&&x.source_kind==="source_linked_partial");
 const sections=navigationReview.sections.filter(x=>x.episode===ep&&trackIncluded(x.track,p)).length;
 return {episode:ep,actions:ac,scenes:sc,windows:wc,sections,status:ep===10?"NO_NEW_TWIN_ENCOUNTER_FIRST_PASS":first?"CURATED_FIRST_PASS":linePass?"LINE_DISPOSITION_FIRST_PASS":partial?"PARTIAL_SCENE_EVENTS":sections?"SECTION_MAP_FIRST_PASS":sc?"SCENE_ANCHOR_ONLY":wc?"DISCOVERY_ONLY":"PRONOUN_CONTEXT_REVIEW_PENDING"};
}
function coverageView(){
 const p=$("pair").value;
 const rows=episodes.filter(e=>isInScope(e.id)).map(e=>coverageMetrics(e.id,p));
 $("results").innerHTML='<article class="card"><h2>Episode-by-episode QA, not story completion</h2><p class="hint">No episode has been signed off as exhaustively action-verified. A source-linked scene anchor is distinct from an audited encounter. Zero names does not prove that no relevant continuation occurs.</p><div class="table-wrap"><table><thead><tr><th>Episode</th><th>Indexed action tags</th><th>Scene anchors</th><th>Discovery windows</th><th>QA classification</th></tr></thead><tbody>'+
 rows.map(m=>'<tr><td><button type="button" class="jump-episode" data-episode="'+m.episode+'">E'+String(m.episode).padStart(2,"0")+'</button></td><td>'+m.actions+'</td><td>'+m.scenes+' anchors / '+m.sections+' map sections</td><td>'+m.windows+'</td><td>'+enc(m.status.replaceAll("_"," "))+'</td></tr>').join("")+
 '</tbody></table></div></article>';
 for(const b of $("results").querySelectorAll("[data-episode]"))b.onclick=()=>{$("episode").value=b.dataset.episode;$("scope").value="single";tab="history";render()};
 $("info").textContent="Coverage: "+rows.length+" episode slots shown · source-backed verification pending for all E01–E68.";$("more").hidden=true;
}
function lineqaView(){
 const q=$("search").value.trim().toLowerCase(),p=$("pair").value;
 const rows=episodes.filter(e=>isInScope(e.id)).map(e=>{
  const ledger=lineAudits.find(x=>x.episode===e.id),m=coverageMetrics(e.id,p);
  return '<tr><td>E'+String(e.id).padStart(2,"0")+'</td><td>'+link(e.start)+'–'+e.end+'</td><td>'+(e.end-e.start+1)+'</td><td>'+(ledger?ledger.line_index.length+' earlier dispositions':'No earlier line-disposition ledger')+'</td><td>'+m.actions+' tags · '+m.sections+' section notes</td><td>Atomic sign-off pending</td></tr>';
 });
 $("results").innerHTML='<article class="card"><h2>All-episode source and review status</h2><p class="hint">Every episode can be read in full under Exact source. Earlier E06–E13 line dispositions are retained in the downloadable export. Source availability, lexical matches, section annotations and exhaustive semantic review are different measures.</p><div class="table-wrap"><table><thead><tr><th>Episode</th><th>Master lines</th><th>All source lines</th><th>Earlier line QA</th><th>Selected track</th><th>Sign-off</th></tr></thead><tbody>'+rows.join("")+'</tbody></table></div></article>';
 if(q)$("results").innerHTML+='<p class="hint">Search is applied to source/event views; review-status rows remain visible for every selected episode.</p>';
 $("info").textContent=rows.length+' episodes · source index is complete; semantic sign-off remains pending';$("more").hidden=true;
}
function sourceView(){
 const p=$("pair").value,q=$("search").value.trim().toLowerCase();
 filtered=scenes.concat(windows).filter(r=>relevant(r,p)&&isInScope(r.episode)&&searched(r,q))
 .sort((a,b)=>a.episode-b.episode||a.start-b.start);shown=0;$("results").innerHTML=
 '<p class="hint">The original canonical text is shown per source-linked scene/window, with line numbers. Windows may be name-only leads. Open the raw file for context beyond the displayed range.</p>';renderChunk();
}

function qaView(){
 const p=$("pair").value,counts=episodes.filter(e=>isInScope(e.id)).map(e=>coverageMetrics(e.id,p));
 const firstPass=counts.filter(x=>x.actions>0).length,anchor=counts.filter(x=>x.scenes>0).length,discovery=counts.filter(x=>x.windows>0).length;
 $("results").innerHTML='<article class="card"><h2>Pinned Audit · G01–G18</h2><p>No P0/P1 episode-wide closure is claimed. Read every requirement before interpreting the timeline or using it as continuity evidence.</p>'+
 gaps.map(g=>'<div class="mini"><span class="badge pending">'+enc(g.id)+' · '+enc(g.priority)+' · '+enc(g.status||"OPEN")+'</span><strong>'+enc(g.title)+'</strong><p class="muted">'+enc(g.closure)+'</p></div>').join("")+
 '</article><article class="card"><h2>Scope & evidence integrity</h2><p>In this selection: '+firstPass+' episode slots with first-pass or partial action tags, '+anchor+' with scene anchors, '+discovery+' with name-match windows. Counts overlap.</p>'+
 '<p><strong>Not inferred:</strong> direct contact from co-presence; completed acts from requests; consent from silence; equal knowledge across twins; continuous time from flashback; absence from zero lexical mentions.</p>'+
 '<p><strong>Source checks:</strong> Record-level checksum status shown in action metadata. Original records, with source highlights, remain available via expandable JSON.</p>'+
 '<p><a href="./data/unified_pair_e01_e07_source_qa_v1.json">E01–E07 coverage report ↗</a> · <a href="./data/twins_e07_line_ledger_v1.json">E07 source audit ↗</a> · <a href="./data/twins_e06_line_ledger_v1.json">E06 source audit ↗</a> · <a href="./data/unified_pair_audit_v2.json">G01–G18 audit JSON ↗</a> · <a href="./data/unified_pair_scene_anchors.json">Original scene anchors ↗</a></p></article>';
 $("info").textContent="All 18 audit issues OPEN. E01–E05 first-pass source index plus five repaired references; E06/E07 complete line disposition (not semantic sign-off); E67–E68 fragmentary. G01–G18 remain open overall.";$("more").hidden=true
}


function readerSelect(a){const p=$("pair").value,tracks=a.tracks||[];return tracks.includes(p)&&isInScope(a.episode)&&(sharedEnabled()||!tracks.includes("TRIO")||p==="TRIO");}
function readerSearch(a,q){return !q||[a.title,a.reading,a.note,a.place,a.meeting_id,a.episode].join(" ").toLowerCase().includes(q)||
 (a.source&&getPlainSourceMatches(a.source[0],a.source[1],q))}
function getPlainSourceMatches(start,end,q){
 for(let n=start;n<=end;n++){if((canon[n-1]||"").toLowerCase().includes(q))return true;}
 return false;
}
function readerEvidence(b){
 return '<details class="reader-proof"><summary>Read original paragraphs · L'+b.source[0]+'–'+b.source[1]+' ↗</summary>'+
 getLines(b.source[0],b.source[1],$("search").value.trim(),0)+'</details>';
}
function readerBeatCard(b,number){
 return '<section class="reader-beat" id="'+enc(b.id)+'"><div class="reader-order"><span class="reader-step">'+number+'</span>'+
 '<div><p class="reader-overline">E'+String(b.episode).padStart(2,"0")+' · '+(b.time_frame?enc(b.time_frame.replaceAll("_"," ")):"story sequence")+' · '+link(b.source[0])+'</p>'+
 '<h3>'+enc(b.title)+'</h3></div></div>'+((b.tracks||[]).includes("TRIO")&&$("pair").value!=="TRIO"?'<p class="frame-label">Shared group context · not a pair-only action</p>':'')+'<p class="reader-reading">'+enc(b.reading)+'</p>'+
 (b.milestone?'<p class="reader-milestone">Key story milestone · source-established</p>':"")+
 (b.before_after?'<p class="reader-effect"><strong>What changes:</strong> '+enc(b.before_after)+'</p>':"")+
 readerEvidence(b)+'</section>'
}
function readerMeetings(){
 const p=$("pair").value,q=$("search").value.trim().toLowerCase(),groups=readerEncounters.filter(a=>readerSelect(a));
 if(!groups.length){$("results").innerHTML='<article class="card">No reviewed meeting-by-meeting reading map for this selected episode yet. The older source index is available under Source index. This does not establish absence of encounters.</article>';$("info").textContent="No signed reading map for this selection";$("more").hidden=true;return;}
 let count=0,visible=0,markup='<p class="reader-notice">Read top to bottom. Every meeting contains ordered phases; a memory is labelled separately. Open “Original paragraphs” only when you need the source. A group meeting is not automatically a pair-specific physical action.</p>';
 for(const g of groups){
   const bs=readerBeats.filter(b=>b.meeting_id===g.id&&readerSelect(b)&&readerSearch(b,q)).sort((a,b)=>a.order-b.order);
   if(!bs.length)continue;
   const noVisit=!!g.non_encounter||/memory|aftermath|follow-up/i.test(g.title)||/off-scene/i.test(g.note);
   const title=g.section_map?"Source section · first pass":g.no_pair_encounter?"No new twin encounter":noVisit?"Memory / aftermath":g.continuation_of?"Continued encounter":g.remote?"Remote encounter":"Meeting";
   count++;visible+=bs.length;
   markup+='<details class="reader-meeting" '+(groups.length===1||$("episode").value!=="all"?'open':"")+'><summary><span class="reader-meetno">E'+String(g.episode).padStart(2,"0")+' · '+title+' '+count+'</span><strong>'+enc(g.title)+'</strong><small>'+enc(g.place)+' · L'+g.start+'–'+g.end+'</small></summary>'+
   '<p class="reader-context">'+enc(g.note)+'</p>'+
   bs.map((b,i)=>readerBeatCard(b,i+1)).join("")+
   '<details class="reader-proof"><summary>Complete encounter source · L'+g.start+'–'+g.end+'</summary>'+getLines(g.start,g.end,$("search").value.trim(),0)+'</details></details>';
 }
 $("results").innerHTML=markup;
 if(!count)markup+='<article class="card">No matching narrative phase for these filters. Try Episode map or Exact source; an empty result is not evidence of no encounter.</article>';
 $("info").textContent=count+" source/context groups · "+visible+" narrative phases · groups are not a count of unique encounters";$("more").hidden=true;$("results").innerHTML=markup;
}
function readerBond(){
 const q=$("search").value.trim().toLowerCase();
 const bs=readerBeats.filter(b=>readerSelect(b)&&b.channels.includes("bond")&&readerSearch(b,q)).sort((a,b)=>a.episode-b.episode||a.source[0]-b.source[0]);
 $("results").innerHTML='<p class="reader-notice">A bond entry describes what this scene establishes and who knows it. A private thought, memory, or third-party report is not a new encounter.</p>'+
 bs.map(b=>'<article class="card reader-bond"><div class="reader-order"><span class="badge source">E'+String(b.episode).padStart(2,"0")+'</span><h3>'+enc(b.title)+'</h3></div><p>'+enc(b.reading)+'</p>'+
 (b.before_after?'<p class="reader-effect"><strong>State / memory:</strong> '+enc(b.before_after)+'</p>':"")+
 (b.time_frame?'<p class="hint">Frame: '+enc(b.time_frame.replaceAll("_"," "))+' · No new meeting inferred</p>':"")+
 readerEvidence(b)+'</article>').join("")||
 '<article class="card">No additional source-reviewed bond beats in this selection. Consult Exact source for the unchanged text.</article>';
 $("info").textContent=bs.length+" bond, reaction and memory beats";$("more").hidden=true;
}
function readerPhysical(){
 const q=$("search").value.trim().toLowerCase();
 const bs=readerBeats.filter(b=>readerSelect(b)&&b.channels.includes("physical")&&readerSearch(b,q)).sort((a,b)=>a.episode-b.episode||a.source[0]-b.source[0]);
 $("results").innerHTML='<p class="reader-notice">Distinguish incidental visual events, practical contact, requests, refusals and completed actions. A grouped scene is not proof that both twins did the same thing. Read the original source for exact action and observer attribution.</p>'+
 bs.map((b,i)=>readerBeatCard(b,i+1)).join("")||
 '<article class="card">No individually interpreted physical/visual beat mapped for this selection yet. This does not mean no action appears in source.</article>';
 const pair=$("pair").value;
 const kinds=/contact|observ|garment|clothing|posture|accident|care|help|boundary|request|refusal|reaction|movement|visual|nonverbal|motion/i;
 const relevantTags=curated.filter(r=>isInScope(r.episode)&&kinds.test(r.kind+" "+r.action)&&searched(r,q)&&relevant(r,pair));
 if(relevantTags.length){
  const tags=relevantTags.sort((a,b)=>a.episode-b.episode||a.line-b.line);
  const detail=tags.map(r=>{
   const context=r.pair!==pair;
   return '<div class="reader-body-row"><div class="row"><strong>E'+r.episode+' · '+enc(r.action.replaceAll("_"," "))+'</strong>'+link(r.line)+'</div>'+
   '<p class="hint">Actor: '+enc(r.actor)+' · Source tag: '+enc(r.kind)+' · '+(context?'Shared scene context; individual recipient must be checked':'Pair source tag')+'</p>'+
   '<details><summary>Exact source line</summary><div class="evidence">'+cue(canon[r.line-1]||"",q)+'</div></details></div>';
  });
  $("results").innerHTML+='<article class="card"><h3>Available action and observation ledgers</h3><p class="hint">Earlier records are preserved in source order. These first-pass tags include requests, observations and responses, not just completed contact. Later navigation sections do not fabricate missing atomic actions.</p>'+detail.join("")+'</article>';
 }
 if(!bs.length&&!relevantTags.length)$("results").innerHTML+='<article class="card">No individually tagged action available for these filters yet. Read Episode map and Exact source; this is a review gap, not an absence claim.</article>';
 $("info").textContent=bs.length+" narrative phases + "+relevantTags.length+" earlier source-linked action tags";$("more").hidden=true;
}
function readerBody(){
 const q=$("search").value.trim().toLowerCase();
 const entries=readerBeats.filter(b=>isInScope(b.episode)).flatMap(b=>(b.body_refs||[]).filter(ref=>(ref.tracks||[]).includes($("pair").value)).map(ref=>({...ref,beat:b}))).filter(x=>!q||[x.owner,x.area,x.mode,x.reading].join(" ").toLowerCase().includes(q)||(canon[x.line-1]||"").toLowerCase().includes(q));
 const grouped=new Map();
 for(const x of entries){const key=x.area+"|"+x.owner;if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(x)}
 $("results").innerHTML='<p class="reader-notice">This view is a structured reference to clothing, visible state, and actual or attempted contact. “Observed” is not “touched”; “requested” is not “completed.” Source-owner and observer must be checked before extending the chronology. Further episodes are not yet independently complete.</p>'+
 [...grouped.entries()].map(([key,arr])=>'<article class="card"><h3>'+enc(arr[0].owner)+' · '+enc(arr[0].area)+'</h3>'+
 arr.map(x=>'<div class="reader-body-row"><div class="row"><strong>E'+String(x.beat.episode).padStart(2,"0")+' · '+enc(x.mode)+'</strong>'+link(x.line)+'</div>'+
 '<p>'+enc(x.reading)+'</p>'+readerEvidence({...x.beat,source:[x.line,x.line]})+'</div>').join("")+'</article>').join("")||
 '<article class="card">No individually classified visual/body-reference record for this selection yet. See Exact source and Source index; no absence is inferred.</article>';
 $("info").textContent=entries.length+" first-pass body/clothing/visual history entries";$("more").hidden=true;
}
function readerCumulative(){
 const p=$("pair").value,last=$("episode").value==="all"?68:+$("episode").value;
 const m=(readerRefinements.state_milestones||[]).filter(x=>x.track===p&&x.episode<=last);
 const checkpoint=m.map(x=>'<section class="reader-state-stage"><h3>E'+x.episode+' · '+enc(x.title)+'</h3><p>'+link(x.source[0])+'</p><p><b>Established by this point</b></p><ul>'+x.established.map(s=>'<li>'+enc(s)+'</li>').join("")+'</ul><details><summary>Not established</summary><ul>'+x.not_established.map(s=>'<li>'+enc(s)+'</li>').join("")+'</ul></details></section>').join("");
 const prefix='<article class="card"><h2>Resulting state — evidence checkpoints</h2><p class="hint">Cumulative history, not just the latest isolated event. Each checkpoint distinguishes established observations from unproved assumptions.</p>'+checkpoint+'</article>';
 const later=last>10?'<p class="reader-notice">The detailed dimension checkpoints below come from the earlier ledgers and retain their stated episode dates. Later source sections are shown separately; they do not silently turn an old checkpoint into a verified current state.</p>':"";
 const names={familiarity:"Familiarity & everyday access",communication:"Communication and openness",emotional_reaction:"Reactions and hesitations",trust:"Trust and practical permissions",access:"Access / visit arrangements",separate_knowledge:"What each person knows",character_knowledge:"Source versus character knowledge",visual_milestone:"Accidental visual milestones",boundaries:"Requests and boundaries",boundary_response:"Boundary responses",physical_history:"Documented contact / physical history",memory:"Recalls and references",uncertainty:"Uncertainty and unshared information",role:"Teacher/student role",solo_access:"Solo visits",continuity:"Continuity across encounters",repair:"Reassurance / repair",openness:"Willingness to talk",care:"Practical care",study:"Study activity",co_presence:"Group scene presence"};
 const bs=readerBeats.filter(b=>b.episode<=last&&(b.tracks||[]).includes(p)).sort((a,b)=>a.episode-b.episode||a.source[0]-b.source[0]);
 const keys=[...new Set(bs.flatMap(b=>b.state_fields||[]))],rows=keys.map(key=>{
  const found=bs.filter(b=>(b.state_fields||[]).includes(key)),latest=found.at(-1);
  return '<tr><td>'+enc(names[key]||key.replaceAll("_"," "))+'</td><td><strong>E'+String(latest.episode).padStart(2,"0")+' · '+enc(latest.title)+'</strong><p>'+enc(latest.before_after||latest.reading)+'</p>'+link(latest.source[0])+'</td>'+
  '<td><details><summary>'+found.length+' source-linked stages</summary>'+found.map(b=>'<p><strong>E'+b.episode+'</strong> · '+enc(b.title)+' · '+link(b.source[0])+'</p>').join("")+'</details></td></tr>';
 });
 $("results").innerHTML='<article class="card"><h2>Cumulative relationship state through E'+String(last).padStart(2,"0")+'</h2><p class="hint">Source-linked latest state for each dimension, not a numeric relationship score. This deliberately includes earlier E01–E'+last+' even when you select a single episode.</p><div class="table-wrap"><table class="reader-state-table"><thead><tr><th>Area</th><th>Latest source-backed reading</th><th>Earlier stages</th></tr></thead><tbody>'+rows.join("")+'</tbody></table></div></article>';
 const laterSections=navigationReview.sections.filter(r=>r.episode<=last&&trackIncluded(r.track,p)).map(r=>'<tr><td>E'+r.episode+'</td><td>'+enc(r.frame.replaceAll("_"," "))+'</td><td><strong>'+enc(r.title)+'</strong><p>'+enc(r.reading)+'</p></td><td>'+link(r.source[0])+'</td></tr>');
 $("results").innerHTML=prefix+later+$("results").innerHTML+(laterSections.length?'<article class="card"><h2>Later source history through E'+last+'</h2><p class="hint">Narrative source order. Flashbacks, reports and hypotheses remain labelled; these rows are not independent encounter counts or certified state transitions.</p><div class="table-wrap"><table><thead><tr><th>Episode</th><th>Frame</th><th>Source-linked section</th><th>Evidence</th></tr></thead><tbody>'+laterSections.join("")+'</tbody></table></div></article>':"");
 $("info").textContent=keys.length+" cumulative relationship categories through Episode "+last;$("more").hidden=true;
}
function readerExact(){
 const q=$("search").value.trim().toLowerCase();sourceMatches=[];sourceShown=0;
 for(const e of episodes.filter(x=>isInScope(x.id)))for(let n=e.start;n<=e.end;n++)if(!q||(canon[n-1]||"").toLowerCase().includes(q)||String(n)===q)sourceMatches.push({n,episode:e.id,local:n-e.start+1});
 $("results").innerHTML='<article class="card"><h2>Complete original episode source</h2><p class="reader-notice">All original lines in the selected episode scope, including pronoun-only passages and unrelated context. Relationship selection does not remove source lines or prove participation. Clear Search to read the complete selection. Lines are paginated for readability.</p><div id="sourcePage"></div></article>';
 renderSourceChunk();
}

function renderSourceChunk(){
 const rows=sourceMatches.slice(sourceShown,sourceShown+100);sourceShown+=rows.length;
 $("sourcePage").insertAdjacentHTML("beforeend",rows.map(x=>'<div class="mini reader-source-row"><div class="row">'+link(x.n)+'<span class="muted">E'+String(x.episode).padStart(2,"0")+' · episode line '+x.local+'</span></div><div class="evidence">'+cue(canon[x.n-1]||"",$("search").value.trim())+'</div></div>').join(""));
 if(!sourceMatches.length)$("sourcePage").innerHTML='<p>No source lines match these filters.</p>';
 $("info").textContent=sourceShown+' / '+sourceMatches.length+' original lines displayed';$("more").hidden=sourceShown>=sourceMatches.length;
}

function mapSectionCard(r){
 const shared=r.track!==$("pair").value;
 return '<article class="map-section"><div class="row"><span class="frame-label">E'+String(r.episode).padStart(2,"0")+' · '+enc(r.frame.replaceAll("_"," "))+'</span>'+link(r.source[0])+'</div><h3>'+enc(r.title)+'</h3><p>'+enc(r.reading)+'</p><p class="hint">'+enc(trackNames[r.track])+' · '+(shared?'Shared group context; no pair-specific action implied. ':'')+'First-pass source section, not exhaustive atomic review.</p>'+readerEvidence(r)+'</article>';
}
function episodeMapView(){
 const q=$("search").value.trim().toLowerCase();let count=0;
 const parts=episodes.filter(e=>isInScope(e.id)).map(e=>{
  const ss=navigationReview.sections.filter(r=>r.episode===e.id&&reviewSelect(r)&&reviewSearch(r,q));count+=ss.length;
  const old=readerBeats.filter(b=>b.episode===e.id&&!b.section_map&&readerSelect(b)&&readerSearch(b,q));
  const meta=navigationReview.episodes.find(x=>x.episode===e.id);
  const noNames=meta&&!meta.explicit_name_lines.length;
  return '<section class="episode-map"><h2>E'+String(e.id).padStart(2,"0")+'</h2><p class="hint">Complete source: '+link(e.start)+'–'+e.end+' · '+(e.end-e.start+1)+' lines.</p>'+(old.length?old.map((b,i)=>readerBeatCard(b,i+1)).join(""):"")+ss.map(mapSectionCard).join("")+
  (!old.length&&!ss.length?'<div class="coverage-strip">'+(noNames?'No explicit Bantu/Bobby/twins name match in this episode. Pronoun and context review remains pending; no absence is certified.':'No source-section note matches this track and these filters. This does not prove no relevant interaction.')+' Read Exact source for the full episode.</div>':"")+'</section>';
 });
 $("results").innerHTML='<p class="reader-notice">Source-linked first-pass navigation through E01–E68. Meetings, remote contact, private thoughts, memories, reports, comparisons and hypotheses remain separate. A section is not an atomic action or a unique encounter.</p>'+parts.join("");
 if(!parts.length)$("results").innerHTML+='<article class="card">Select at least one episode using the episode checkboxes.</article>';
 $("info").textContent=parts.length+' episode slots · '+count+' later source sections · exhaustive semantic sign-off pending';$("more").hidden=true;
}

function render(){
 $("kind").disabled=tab!=="history";
 $("episodeChoices").open=$("scope").value==="selected";
 $("episode").disabled=$("scope").value==="selected";
 $("previous").disabled=$("scope").value==="selected"||$("episode").value==="1";
 $("next").disabled=$("scope").value==="selected"||$("episode").value==="68";
 for(const btn of document.querySelectorAll("[data-tab]"))btn.setAttribute("aria-pressed",String(btn.dataset.tab===tab));
 if(tab==="episodeMap"){episodeMapView()}
 else if(tab==="meetings"){readerMeetings()}
 else if(tab==="bond"){readerBond()}
 else if(tab==="physical"){readerPhysical()}
 else if(tab==="history"){
  filtered=getFilter().filter(r=>isInScope(r.episode));shown=0;$("results").innerHTML="";renderChunk();
 }else if(tab==="scenes"){
  const list=scenes.filter(s=>relevant(s,$("pair").value)&&isInScope(s.episode)&&searched(s,$("search").value.trim().toLowerCase()));
  $("results").innerHTML=list.map(rangeCard).join("")||'<article class="card">No verified scene anchor in this selection. This is not evidence of no encounter.</article>';
  $("info").textContent=list.length+" source-established scene anchors, not exhaustive chapter review";$("more").hidden=true;
 }else if(tab==="states")readerCumulative();
 else if(tab==="body")readerBody();
 else if(tab==="style")styleView();
 else if(tab==="coverage")coverageView();
 else if(tab==="source")readerExact();
 else if(tab==="lineqa")lineqaView();
 else if(tab==="qa")qaView();
 const params=new URLSearchParams({pair:$("pair").value,episode:$("episode").value,scope:$("scope").value,view:tab,shared:String(sharedEnabled())});
 if($("scope").value==="selected")params.set("episodes",[...selectedEpisodes].sort((a,b)=>a-b).join(","));
 if($("search").value)params.set("q",$("search").value);
 params.set("evidence",$("kind").value);
 if(globalThis.history?.replaceState)globalThis.history.replaceState(null,"","?"+params.toString());
}
function exportPayload(){
 const p=$("pair").value,e=$("episode").value,scope=$("scope").value;
 const matched=getFilter().filter(r=>isInScope(r.episode));
 const records=matched.map(r=>r.recordType==="action"?{record_type:r.source_kind==="source_linked_partial"?"partial_scene_event":"first_pass_action",id:r.id,episode:r.episode,source_line:r.line,source_file:r.file,source_integrity:evidenceIntegrity(r).label,source_record:r.raw}:r.recordType==="scene"?{record_type:"verified_scene_anchor",...r}:{record_type:"unreviewed_lexical_window",...r});
 const q=$("search").value.trim().toLowerCase();
 return {schema:"unified_pair_filtered_export_v4",track:p,episode:e,scope,selected_episodes:episodes.filter(x=>isInScope(x.id)).map(x=>x.id),include_shared_context:sharedEnabled(),search:$("search").value,evidence:$("kind").value,source:"raw/Dhika.txt",source_sha256:navigationReview.source_sha256,atomic_complete:false,
  episode_source_ranges:navigationReview.episodes.filter(x=>isInScope(x.episode)),
  episode_line_dispositions:lineAudits.filter(x=>isInScope(x.episode)).map(x=>({episode:x.episode,note:"Whole-episode QA context, not pair actions",line_index:x.line_index})),
  navigation_sections:navigationReview.sections.filter(x=>reviewSelect(x)&&reviewSearch(x,q)),
  reader_phases:readerBeats.filter(x=>readerSelect(x)&&readerSearch(x,q)),
  warning:"Source-linked first-pass records and navigation sections; exhaustive atomic review is not certified. Shared context does not prove pair-specific acts. Earlier source-record metadata is preserved.",audit_gaps:gaps.map(x=>({id:x.id,status:x.status||"OPEN"})),records};
}
function downloadSelection(){
 const p=$("pair").value,payload=exportPayload();
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="dhika-"+p.toLowerCase()+"-source-index.json";document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);
}

(async function boot(){
 try{
  const responses=await Promise.all(loadPaths.map(p=>fetch(p)));
  const bad=responses.map((r,i)=>!r.ok?loadPaths[i]:null).filter(Boolean);if(bad.length)throw Error("Missing data: "+bad.join(", "));
  const data=await Promise.all(responses.slice(0,-1).map(x=>x.json()));canon=(await responses.at(-1).text()).split(/\r?\n/);
  episodes=parseChapters();if(episodes.length!==68||canon[2]!=="EPISODE 1"||canon[13702]!=="EPISODE 68")throw Error("Unexpected original source boundaries");
  scenes=data[0].scenes.map(s=>({...s,recordType:"scene",source_kind:s.status}));
  audit=data[12];gaps=audit.gaps;writingNotes=audit.writing_observations||[];states=data[11].states;
  const epIndex=[1,2,2,3,3,4,5,5,5,5];
  curated=data.slice(1,11).flatMap((d,i)=>normalize(d,epIndex[i],i)).map(r=>({...r,recordType:"action"}));
  curated.push(...data[13].records.filter(a=>a.episode!==6).map(a=>({id:a.id,episode:a.episode,line:a.line,pair:a.pair,actor:a.actor,recipient:a.recipient,action:a.action,kind:a.type,source_kind:a.source_kind,recordType:"action",file:loadPaths[13],raw:a,review:a.review,status:"fragment_only"})));
  lineAudits=[data[14],data[15],data[19],data[20],data[21]];
  readerBeats=data[17].beats.concat(data[22].beats);readerEncounters=data[17].encounters.concat(data[22].encounters);readerRefinements=data[18];
  navigationReview=data[26];
  for(let i=23;i<=25;i++){
   lineAudits.push(data[i]);
   curated.push(...data[i].events.filter(a=>["DB","DY","TRIO","DBC"].includes(a.track)).map(a=>({id:a.id,episode:a.episode,line:a.line,pair:a.track,actor:a.actor,recipient:a.recipient||"",action:a.action,kind:a.kind,source_kind:"source_linked_first_pass",recordType:"action",file:loadPaths[i],raw:a,review:a.review,status:a.outcome||"first_pass"})));
  }
  for(const s of navigationReview.sections){
   const tracks=s.track==="TRIO"?["DB","DY","TRIO"]:[s.track];
   readerEncounters.push({id:s.id,episode:s.episode,start:s.source[0],end:s.source[1],title:s.title,place:s.frame.replaceAll("_"," "),note:s.reading,tracks,section_map:true,non_encounter:!["meeting","continuation","remote"].includes(s.frame),remote:s.frame==="remote"});
   readerBeats.push({id:s.id+"-PHASE",episode:s.episode,meeting_id:s.id,order:1,source:s.source,title:s.title,reading:s.reading,tracks,channels:["meetings","bond"],state_fields:[],time_frame:s.frame,section_map:true});
  }
  curated.push(...data[16].records.map(a=>({id:a.id,episode:a.episode,line:a.line,pair:a.track,actor:a.actor,recipient:"",action:a.action,kind:a.kind,source_kind:"source_linked_first_pass",recordType:"action",file:loadPaths[16],raw:a,review:a.review,status:a.outcome})));
  for(let i=14;i<=15;i++){
    curated.push(...data[i].events.filter(a=>a.track!=="NON_TWIN_CONTEXT").map(a=>({
      id:a.id,episode:a.episode,line:a.line,pair:a.track,actor:a.actor,recipient:a.recipient||"",
      action:a.action,kind:a.kind,source_kind:"source_linked_first_pass",
      recordType:"action",file:loadPaths[i],raw:a,review:a.review,status:a.outcome
    })));
  }
  curated.push(...data[19].events.filter(a=>a.track!=="CONTEXT"&&a.kind!=="unsplit_first_pass_line").map(a=>({
    id:a.id,episode:a.episode,line:a.line,pair:a.track,actor:a.actor,
    recipient:"",action:a.action,kind:a.kind,source_kind:"source_linked_first_pass",
    recordType:"action",file:loadPaths[19],raw:a,review:a.review,status:a.outcome
  })));
  curated.push(...data[20].events.filter(a=>a.track==="DY").map(a=>({
    id:a.id,episode:a.episode,line:a.line,pair:a.track,actor:a.actor,recipient:a.recipient,
    action:a.action,kind:a.kind,source_kind:"source_linked_first_pass",recordType:"action",
    file:loadPaths[20],raw:a,review:a.review,status:a.outcome
  })));
  scenes.push(
    {id:"E09-BOBBY-SKYPE-END",episode:9,start:1762,end:1787,track:"DY",participants:["Dhika","Bobby"],absent:["Bantu"],roles:"Continuation of E08 Bobby Skype; same remote call ends here. No new meeting starts in E09.",kind:"bobby_remote_skype_e08_continuation_closes",recordType:"scene",source_kind:"SOURCE_LINKED_FIRST_PASS_SCENE"}
  );
  scenes.push(
    {id:"E08-REMOTE-END",episode:8,start:1544,end:1553,track:"TRIO",participants:["Dhika","Bantu","Bobby"],roles:"Closure of E07 group video call; not an additional meeting",kind:"continuation_group_call_closes",recordType:"scene",source_kind:"SOURCE_LINKED_FIRST_PASS_SCENE"},
    {id:"E08-BANTU-VISIT",episode:8,start:1566,end:1686,track:"DB",participants:["Dhika","Bantu"],absent:["Bobby"],roles:"New same-day solo visit following closed E07 group call",kind:"new_bantu_repair_visit_and_assistance",recordType:"scene",source_kind:"SOURCE_LINKED_FIRST_PASS_SCENE"},
    {id:"E08-BOBBY-PHONE",episode:8,start:1688,end:1688,track:"DY",participants:["Dhika","Bobby"],absent:["Bantu"],roles:"Apology telephone conversation, separate from later video call",kind:"bobby_phone_apology",recordType:"scene",source_kind:"SOURCE_LINKED_FIRST_PASS_SCENE"},
    {id:"E08-BOBBY-SKYPE",episode:8,start:1689,end:1753,track:"DY",participants:["Dhika","Bobby"],absent:["Bantu"],roles:"New one-to-one video call, continues immediately into E09",kind:"bobby_remote_skype_open_to_e09",recordType:"scene",source_kind:"SOURCE_LINKED_FIRST_PASS_SCENE"}
  );
  scenes.push(
    {id:"E06-SOLO",episode:6,start:1082,end:1138,track:"DY",participants:["Dhika","Bobby"],absent:["Bantu"],roles:"Bobby solo visit; Chotu arrives only later",kind:"bobby_solo_visit_and_tuition",recordType:"scene",source_kind:"SOURCE_LINKED_FIRST_PASS_SCENE"},
    {id:"E07-SOLO",episode:7,start:1370,end:1501,track:"DB",participants:["Dhika","Bantu"],absent:["Bobby"],roles:"Single Monday visit. Bobby reported/remembered, not present",kind:"bantu_solo_visit_continuous",recordType:"scene",source_kind:"SOURCE_LINKED_FIRST_PASS_SCENE"},
    {id:"E07-REMOTE",episode:7,start:1509,end:1535,track:"TRIO",participants:["Dhika","Bantu","Bobby"],roles:"Remote session continues directly in E08 L1544; no resolution in E07",kind:"remote_tuition_continues_e08",recordType:"scene",source_kind:"SOURCE_LINKED_FIRST_PASS_SCENE"}
  );
  windows=makeWindows();
  for(let i=1;i<=68;i++){$("episode").insertAdjacentHTML("beforeend",'<option value="'+i+'">Episode '+String(i).padStart(2,"0")+'</option>');$("checks").insertAdjacentHTML("beforeend",'<label><input class="selected-episode" type="checkbox" value="'+i+'">E'+String(i).padStart(2,"0")+'</label>');}
  $("episode").value="1";
  $("stats").innerHTML=[
   [68,"Episodes in source · not certified"],[curated.length,"Source tags · first pass"],[scenes.length,"Scene anchors · incomplete"],[windows.length,"Unreviewed name windows"]
  ].map(a=>'<div><strong>'+a[0]+'</strong><small>'+a[1]+'</small></div>').join("");
  $("status").textContent="E01–E68 complete source browsing · "+navigationReview.sections.length+" additional first-pass source sections · E11–E13 event ledgers restored. Exhaustive atomic review is not certified. Check QA coverage for the selected relationship.";
  const params=new URLSearchParams(globalThis.location?.search||"");
  for(const id of ["pair","episode","scope","kind"]){const value=params.get(id==="kind"?"evidence":id);if(value&&[...$(id).options].some(o=>o.value===value))$(id).value=value;}
  if(params.get("shared")==="false")$("shared").checked=false;
  $("search").value=params.get("q")||"";
  const requested=params.get("view");if(requested&&[...document.querySelectorAll("[data-tab]")].some(b=>b.dataset.tab===requested))tab=requested;
  for(const n of (params.get("episodes")||"").split(",").map(Number))if(n>=1&&n<=68)selectedEpisodes.add(n);
  for(const input of document.querySelectorAll(".selected-episode")){input.checked=selectedEpisodes.has(+input.value);input.addEventListener("change",()=>{if(input.checked)selectedEpisodes.add(+input.value);else selectedEpisodes.delete(+input.value);render();});}
  for(const id of ["pair","episode","scope","kind","search","shared"])$(id).addEventListener(id==="search"?"input":"change",render);
  for(const b of document.querySelectorAll("[data-tab]"))b.onclick=()=>{tab=b.dataset.tab;render()};
  $("previous").onclick=()=>{const n=$("episode").value==="all"?1:+$("episode").value;$("episode").value=Math.max(1,n-1);render();};
  $("next").onclick=()=>{const n=$("episode").value==="all"?0:+$("episode").value;$("episode").value=Math.min(68,n+1);render();};
  $("more").onclick=renderChunk;$("download").onclick=downloadSelection;render();
 }catch(e){$("status").textContent="Could not finish loading source tracker: "+String(e)}
})();
