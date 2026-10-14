"use strict";
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const git=n=>"https://github.com/developer-fandom-rush/dhika-sharmi-adventures/blob/main/raw/Dhika.txt#L"+n;
const pairNames={DB:"Dhika–Bantu",DY:"Dhika–Bobby",TRIO:"Shared scene / twins",UNKNOWN:"Unresolved attribution"};
let data=null,original=[],subset=[],shown=0;
function checksum(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,"0")}
function markText(line,position){
 if(!position||position.highlight_start<0)return esc(line);
 let a=position.highlight_start,b=position.highlight_end;
 return esc(line.slice(0,a))+'<mark class="anchor">'+esc(line.slice(a,b))+'</mark>'+esc(line.slice(b))
}
function sceneByLine(n){return data.scene_order.find(s=>n>=s.lines[0]&&n<=s.lines[1])||null}
function buildFilters(){
 const types=[...new Set(data.records.map(r=>r.type))].sort();
 $("kind").innerHTML='<option value="all">All types</option>'+types.map(t=>'<option value="'+esc(t)+'">'+esc(t)+'</option>').join("");
 $("scene").innerHTML='<option value="all">All source scenes</option>'+data.scene_order.map(s=>'<option value="'+s.id+'">'+esc(s.label)+'</option>').join("");
}
function select(){
 const p=$("pair").value,t=$("kind").value,sc=$("scene").value,q=$("search").value.toLowerCase().trim();
 subset=data.records.filter(r=>(p==="all"||r.pair===p)&&(t==="all"||r.type===t)&&(sc==="all"||sceneByLine(r.line)?.id===sc)&&(!q||String(r.line).includes(q)||r.action.toLowerCase().includes(q)||r.note.toLowerCase().includes(q)||(original[r.line-1]||"").toLowerCase().includes(q)));
 shown=0;$("records").innerHTML="";showMore();
}
function showMore(){
 let batch=subset.slice(shown,shown+20);shown+=batch.length;
 $("records").insertAdjacentHTML("beforeend",batch.map(r=>{
 const text=original[r.line-1]||"",current=checksum(text),valid=current===r.source.line_checksum_fnv1a;
 return '<article class="record"><div><span class="tag">'+esc(pairNames[r.pair]||r.pair)+'</span><span class="tag">'+esc(r.type)+'</span><span class="tag">'+esc(r.status)+'</span></div><h3>'+esc(r.action.replaceAll("_"," "))+'</h3><div class="small">Actor: '+esc(r.actor)+' → recipient: '+esc(r.recipient)+' · Global L'+r.line+' · '+(valid?"Source verified":"SOURCE CHECKSUM MISMATCH")+'</div><p class="proof">'+markText(text,r.source)+'</p><p>'+esc(r.note)+'</p><a href="'+git(r.line)+'" target="_blank" rel="noopener">Open exact source line ↗</a></article>'
 }).join(""));
 $("counter").textContent=shown+" / "+subset.length+" action records shown";
 $("more").hidden=shown>=subset.length;
}
function download(filename,body){
 const blob=new Blob([JSON.stringify(body,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200)
}
function exportRows(all){
 const chosen=all?data.records:subset;
 download("dhika-twins-e01-"+(all?"all":"filtered")+"-source-pointers.json",{schema:data.schema,episode:1,source:data.source,source_sha:data.source_sha,scope:data.scope,records:chosen.map(r=>({...r,source_uri:"raw/Dhika.txt#L"+r.line}))})
}
function showScenes(){
 $("sceneCards").innerHTML=data.scene_order.map(s=>{
 const n=data.records.filter(r=>r.line>=s.lines[0]&&r.line<=s.lines[1]).length;
 return '<article class="panel"><strong>'+esc(s.label)+'</strong><p class="small">E01 global L'+s.lines[0]+'–'+s.lines[1]+' · '+n+' action/observation/POV records</p><p><a target="_blank" rel="noopener" href="'+git(s.lines[0])+'">Original source ↗</a></p><button data-scene="'+s.id+'">Inspect all '+n+' entries</button></article>'
 }).join("");
 document.querySelectorAll("[data-scene]").forEach(b=>b.onclick=()=>{$("pair").value="all";$("kind").value="all";$("scene").value=b.dataset.scene;$("search").value="";document.querySelector('.nav button[data-tab="events"]').click();select()})
}
function showBaseline(){
 const v=data.relationship_baseline;
 $("baseline").innerHTML='<div class="grid">'+
 '<div class="panel"><h3>Dhika × Bantu</h3><p>'+esc(v.dhika_bantu)+'</p><a href="'+git(44)+'" target="_blank" rel="noopener">L44 baseline ↗</a></div>'+
 '<div class="panel"><h3>Dhika × Bobby</h3><p>'+esc(v.dhika_bobby)+'</p><a href="'+git(99)+'" target="_blank" rel="noopener">L99–103 physical action ↗</a></div>'+
 '<div class="panel"><h3>Shared twins dynamic</h3><p>'+esc(v.trio)+'</p><a href="'+git(108)+'" target="_blank" rel="noopener">L108 knowledge gap ↗</a></div>'+
 '<div class="panel"><h3>Open questions for E02+</h3><p>Does either twin discuss the ride? Does Dhika&#39;s interpretation change after new evidence? Are later interactions independent, observed or jointly participated in?</p><p class="small">Questions are not source claims or predictions.</p></div></div>'
}
function showWarnings(){
 $("warnings").innerHTML=data.source_warnings.map(w=>'<div class="panel"><a href="'+git(w.line)+'" target="_blank" rel="noopener">L'+w.line+' ↗</a> — '+esc(w.issue)+'</div>').join("")
}
function verify(){
 const failed=data.records.filter(r=>checksum(original[r.line-1]||"")!==r.source.line_checksum_fnv1a||
 (original[r.line-1]||"").slice(r.source.highlight_start,r.source.highlight_end).length===0);
 $("metrics").textContent=data.records.length+" tagged records · "+new Set(data.records.map(r=>r.line)).size+" unique lines · "+data.scene_order.length+" linked scenes · "+failed.length+" exact-source mismatches";
 if(failed.length)$("metrics").textContent+=" (inspect reference integrity)";
}
document.querySelectorAll(".nav button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".nav button").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".content").forEach(x=>x.classList.toggle("active",x.id===b.dataset.tab))});
["pair","kind","scene","search"].forEach(id=>$(id).addEventListener(id==="search"?"input":"change",()=>{if(data)select()}));
$("reset").onclick=()=>{["pair","kind","scene"].forEach(id=>$(id).value="all");$("search").value="";select()};
$("more").onclick=showMore;$("export").onclick=()=>exportRows(false);$("exportall").onclick=()=>exportRows(true);
(async()=>{try{
 const [a,b]=await Promise.all([fetch("./data/twins_e01_source_actions_v1.json"),fetch("./raw/Dhika.txt")]);
 if(!a.ok||!b.ok)throw Error("Original file or index unavailable: "+a.status+"/"+b.status);
 data=await a.json();original=(await b.text()).split(/\r?\n/);
 if(original[2]!=="EPISODE 1"||original[230]!=="EPISODE 2")throw Error("Global line numbering differs from canonical source");
 buildFilters();showScenes();showBaseline();showWarnings();verify();select();
}catch(err){$("metrics").textContent="Source loading failed: "+String(err)}})();
