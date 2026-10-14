"use strict";
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const url=n=>"https://github.com/developer-fandom-rush/dhika-sharmi-adventures/blob/main/raw/Dhika.txt#L"+n;
const bounds={2:[231,389],3:[390,628],4:[629,834],5:[835,1066]};
const pairNames={DB:"Dhika–Bantu",DY:"Dhika–Bobby",TRIO:"Shared trio / supporting context",DJ:"John-related"};
const paths=[
"./data/twins_e02_actions_v1.json","./data/twins_e02_scene_completion_v1.json",
"./data/twins_e03_actions_v1.json","./data/twins_e03_scene_completion_v1.json",
"./data/twins_e04_actions_v1.json",
"./data/twins_e05_actions_p1.json","./data/twins_e05_actions_p2.json",
"./data/twins_e05_actions_p3.json","./data/twins_e05_callbacks.json",
"./data/twins_e05_source_offsets_v1.json","./data/twins_e01_e05_state_index_v1.json",
"./raw/Dhika.txt"];
let original=[],records=[],scenes=[],states=[],proofs={},filtered=[],shown=0;
const keywords=/\b(saw|see|look\w*|glanc\w*|eyes?|gaze|touch\w*|hand\w*|finger\w*|kiss\w*|hug\w*|hold\w*|held|pinch\w*|shirt|blouse|dress|saree|pallu|dupatta|skirt|shorts|bra|chain|skin|hips?|thighs?|waist|neck|chest|breast\w*|cheeks?|stomach|legs?|cry\w*|fear\w*|afraid|horrif\w*|shy|blush\w*|trust\w*|sorry|please|stop|wait|wanted|wonder\w*|felt|feeling|thought|thinking|remember\w*)\b/gi;
function checksum(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16).padStart(8,"0")}
function tags(s,needle){
 const out=[],regexp=new RegExp(keywords.source,"gi");
 for(const m of s.matchAll(regexp))out.push({a:m.index,b:m.index+m[0].length,mode:"cue"});
 if(needle&&needle.length>1){let n=0,lo=s.toLowerCase();while((n=lo.indexOf(needle.toLowerCase(),n))>=0){out.push({a:n,b:n+needle.length,mode:"chosen"});n+=needle.length}}
 return out.sort((a,b)=>a.a-b.a||b.b-a.b).filter((t,i,a)=>i===0||t.a>=a.slice(0,i).reduce((m,x)=>Math.max(m,x.b),0));
}
function highlight(s,terms){let p=0,t="";for(const x of terms){if(x.a<p)continue;t+=esc(s.slice(p,x.a))+'<mark class="'+(x.mode==="chosen"?"emph":"")+'">'+esc(s.slice(x.a,x.b))+'</mark>';p=x.b}return t+esc(s.slice(p))}
function normalize(ep,d,idx){
 if(d.records)return d.records.map((r,i)=>({id:r.id||("E0"+ep+"-R"+idx+"-"+i),episode:ep,line:r.line||r.source_line,pair:r.pair||"TRIO",actor:r.actor||"Narrator",action:r.action||"source_line",kind:r.type||r.kind||"action",mode:r.evidence||r.status||"narrated",source_checksum:r.source_checksum||r.line_checksum||r.checksum||null,review:r.review_status||r.review||"line_indexed"}));
 const list=d.rows||[];
 return list.map((a,i)=>Array.isArray(a)&&a.length>=5?{id:"E0"+ep+"-P"+idx+"-"+i,episode:ep,line:+a[0],pair:a[1]||"TRIO",actor:a[2]||"Narrator",action:a[3]||"line_context",kind:a[4]||"source_annotation",mode:a[5]||"source_line",source_checksum:null,review:"source_pointer_checked"}:{id:"E0"+ep+"-P"+idx+"-"+i,episode:ep,line:+a[0],pair:"TRIO",actor:"Narrator",action:a[1]||"context",kind:"callback",mode:"source_pointer",source_checksum:null,review:"line_pointer_only"});
}
function sceneFor(ep,n){return scenes.find(s=>s.episode===ep&&n>=s.source_range[0]&&n<=s.source_range[1])}
function quality(r){const s=original[r.line-1]||"",sum=r.source_checksum||proofs[r.line]?.checksum;if(!sum)return "Source linked";return checksum(s)===sum?"Exact line checksum passed":"SOURCE CHECKSUM MISMATCH"}
function recordCard(r){
 const s=original[r.line-1]||"",needle=$("search").value.trim(),terms=tags(s,needle);
 return '<article class="entry"><div class="row"><div><span class="tag">E0'+r.episode+' · L'+r.line+'</span><span class="tag">'+esc(pairNames[r.pair]||r.pair)+'</span><span class="tag">'+esc(r.kind)+'</span></div><a href="'+url(r.line)+'" target="_blank" rel="noopener">Raw line ↗</a></div><h3>'+esc(r.action.replaceAll("_"," "))+'</h3><div class="meta">Actor: '+esc(r.actor)+' · evidence: '+esc(r.mode)+' · '+quality(r)+'</div><p class="quote">'+highlight(s,terms)+'</p><div class="meta">Highlights are exact source terms, not independent proof of an action; consult the record classification.</div></article>';
}
function renderBatch(){const b=filtered.slice(shown,shown+25);shown+=b.length;$("results").insertAdjacentHTML("beforeend",b.map(recordCard).join(""));$("count").textContent=shown+" of "+filtered.length+" records shown";$("more").hidden=shown>=filtered.length}
function doFilter(){
 const ep=$("ep").value,p=$("pair").value,k=$("kind").value,q=$("search").value.trim().toLowerCase();
 filtered=records.filter(r=>(ep==="all"||r.episode===+ep)&&(p==="all"||r.pair===p)&&(k==="all"||r.kind===k)&&(!q||String(r.line).includes(q)||r.action.toLowerCase().includes(q)||r.actor.toLowerCase().includes(q)||(original[r.line-1]||"").toLowerCase().includes(q)));
 shown=0;$("results").innerHTML="";renderBatch();
}
function makeScenes(){
 $("scenesGrid").innerHTML=scenes.map(s=>'<article class="panel sceneItem"><div class="tag">E0'+s.episode+' · L'+s.source_range[0]+'–'+s.source_range[1]+'</div><h3>'+esc(s.label||s.title||s.id)+'</h3><p class="meta">'+records.filter(r=>r.episode===s.episode&&r.line>=s.source_range[0]&&r.line<=s.source_range[1]).length+' linked records</p><button data-scene="'+esc(s.id)+'">View every original line</button> <a target="_blank" rel="noopener" href="'+url(s.source_range[0])+'">Raw start ↗</a></article>').join("");
 document.querySelectorAll("[data-scene]").forEach(btn=>btn.onclick=()=>{let s=scenes.find(x=>x.id===btn.dataset.scene);$("rawEp").value=String(s.episode);fillRawScenes();$("rawScene").value=s.id;document.querySelector('nav button[data-view="reader"]').click();renderOriginal()})
}
function fillRawScenes(){
 let e=+$("rawEp").value;let parts=scenes.filter(s=>s.episode===e);
 $("rawScene").innerHTML='<option value="entire">Entire E0'+e+' chapter (all source lines)</option>'+parts.map(s=>'<option value="'+s.id+'">'+esc(s.label||s.title||s.id)+' (L'+s.source_range.join("–")+')</option>').join("");
}
function renderOriginal(){
 let e=+$("rawEp").value,s=scenes.find(x=>x.id===$("rawScene").value),range=s?s.source_range:bounds[e],words=$("words").value.split(",").map(x=>x.trim()).filter(Boolean);
 const lines=Array.from({length:range[1]-range[0]+1},(_,i)=>range[0]+i);
 $("sourceLines").innerHTML=lines.map(n=>{
 const raw=original[n-1]||"",exact=words.length?words.flatMap(w=>tags(raw,w).filter(t=>t.mode==="chosen")):tags(raw,""),match=records.filter(r=>r.episode===e&&r.line===n);
 return '<article class="entry"><div class="row"><a href="'+url(n)+'" target="_blank" rel="noopener">Global L'+n+' ↗</a><span class="meta">'+match.length+' reviewed tags</span></div><p class="quote">'+highlight(raw,exact)+'</p><div class="meta">'+match.map(m=>esc(m.action.replaceAll("_"," "))).join(" · ")+'</div></article>';
 }).join("");
 $("readCount").textContent=lines.length+" original lines displayed, including untagged lines";
}
function makeStates(){
 $("stateCards").innerHTML=states.map(s=>'<article class="panel"><span class="tag">E0'+s[0]+'</span><span class="tag">'+esc(pairNames[s[1]]||s[1])+'</span><h3>'+esc(s[2])+'</h3><p><a href="'+url(s[3][0])+'" target="_blank" rel="noopener">Source L'+s[3][0]+'–'+s[3][1]+' ↗</a></p></article>').join("")
}
function download(name,value){let b=new Blob([JSON.stringify(value,null,2)],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1200)}
function exportRows(all){let rs=all?records:filtered;download("twins-e02-e05-"+(all?"all":"filtered")+".json",{schema:"twins-e02-e05-evidence-export-v1",source:"raw/Dhika.txt",note:"Classification is curated but exhaustive multi-action QA remains pending for some scenes. Full source text exported for evidence review.",records:rs.map(r=>({...r,source_uri:"raw/Dhika.txt#L"+r.line,source_text:original[r.line-1]||"",highlight_offsets:tags(original[r.line-1]||"","")}))})}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{document.querySelectorAll("nav button").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".content").forEach(x=>x.classList.toggle("active",x.id===b.dataset.view))});
["ep","pair","kind","search"].forEach(id=>$(id).addEventListener(id==="search"?"input":"change",()=>{if(records.length)doFilter()}));
$("reset").onclick=()=>{["ep","pair","kind"].forEach(k=>$(k).value="all");$("search").value="";doFilter()};
$("more").onclick=renderBatch;$("exportSelection").onclick=()=>exportRows(false);$("exportAll").onclick=()=>exportRows(true);
$("rawEp").onchange=fillRawScenes;$("read").onclick=renderOriginal;
(async()=>{try{
 const f=await Promise.all(paths.map(p=>fetch(p)));if(f.some(x=>!x.ok))throw Error("Some source or JSON files did not load: "+f.map((r,i)=>r.ok?"":paths[i]).filter(Boolean).join(", "));
 const d=await Promise.all(f.slice(0,-1).map(x=>x.json()));original=(await f[f.length-1].text()).split(/\r?\n/);
 if(original[230]!=="EPISODE 2"||original[389]!=="EPISODE 3"||original[628]!=="EPISODE 4"||original[834]!=="EPISODE 5")throw Error("Canonical global line offsets do not match expected episodes");
 const episodes=[2,2,3,3,4,5,5,5,5];records=d.slice(0,9).flatMap((x,i)=>normalize(episodes[i],x,i)).sort((a,b)=>a.episode-b.episode||a.line-b.line||a.id.localeCompare(b.id));
 scenes=[...d[0].scenes.map(s=>({...s,episode:2})),...d[2].scenes.map(s=>({...s,episode:3})),...d[4].scenes.map(s=>({...s,episode:4})),
 {episode:5,id:"E05-start",source_range:[839,854],label:"Continuation from E04 and separate farewells"},
 {episode:5,id:"E05-shopping",source_range:[885,952],label:"Bantu-only shopping encounter"},
 {episode:5,id:"E05-aftermath",source_range:[953,994],label:"Later mentions and canceled tuition"}];
 proofs=Object.fromEntries(d[9].source_lines.map(x=>[x.line,x]));states=d[10].states;
 const kindList=[...new Set(records.map(r=>r.kind))].sort();$("kind").innerHTML='<option value="all">All types</option>'+kindList.map(k=>'<option value="'+esc(k)+'">'+esc(k)+'</option>').join("");
 let checked=records.filter(x=>x.source_checksum||proofs[x.line]?.checksum),bad=checked.filter(r=>quality(r)!=="Exact line checksum passed");
 const byEp=[2,3,4,5].map(e=>"E0"+e+": "+records.filter(r=>r.episode===e).length).join(" · ");
 $("metrics").textContent=records.length+" records · "+byEp+" · "+checked.length+" checked lines/records · "+bad.length+" mismatches";
 $("qa").innerHTML='<p><strong>Verified line checksums:</strong> '+checked.length+' records (repeats included); '+bad.length+' mismatches.</p><p><strong>Coverage:</strong> E02 L309–380, E03 L490–572, E04 L660–830 and E05 L839–854 / L885–952 are represented in source review, with separate untagged scene-line dispositions where necessary. This does not certify semantic completeness.</p>';
 makeScenes();makeStates();fillRawScenes();doFilter();
}catch(e){$("metrics").textContent="Cannot load evidence: "+String(e)}})();
