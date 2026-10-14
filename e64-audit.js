"use strict";
const ROOT="https://github.com/developer-fandom-rush/dhika-sharmi-adventures/blob/main/raw/Dhika.txt#L";
const partFiles=[1,2,3,4,5,6,7].map(n=>"./data/e64_actions_p"+n+".json");
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pairNames={DB:"Dhika–Bantu",DJ:"Dhika–John",DT:"Dhika–Bobby",DI:"Dhika–Iroh",DZ:"Dhika–Zuko",DJR:"Dhika–Jared",D:"Dhika",B:"Bantu",TW:"Dhika–Twins",I:"Iroh",Z:"Zuko"};
const cue=/\b(blush\w*|excite\w*|nervous|shiver\w*|horny|hot|heat|moan\w*|arous\w*|squirm\w*|sigh\w*|felt|feeling|wonder\w*|thought|remember\w*|imag\w*|kiss\w*|touch\w*|hand\w*|finger\w*|gaze|look\w*|eyes?|watch\w*|saw|shirt|robe|dress|clothes|sweater|neck|shoulder\w*|back|chest|breast\w*|nipples?|navel|waist|hip\w*|thigh\w*|leg\w*|lips?|mouth|stop|wait|refus\w*|pull\w*|press\w*|naked|flinch\w*|twitch\w*)\b/gi;
let all=[],raw=[],mode="actions",selected=[],showCount=0;
function offsets(s,q){const out=[];const pattern=new RegExp(cue.source,"gi");for(const m of s.matchAll(pattern))out.push({start:m.index,end:m.index+m[0].length,type:"author_cue"});if(q&&q.length>1){let i=0,lower=s.toLowerCase();while((i=lower.indexOf(q.toLowerCase(),i))>=0){out.push({start:i,end:i+q.length,type:"query"});i+=q.length}}out.sort((a,b)=>a.start-b.start||b.end-a.end);const keep=[];let prev=0;for(const t of out){if(t.start>=prev){keep.push(t);prev=t.end}}return keep}
function highlighted(s,terms){let pos=0,html="";for(const t of terms){html+=esc(s.slice(pos,t.start))+"<mark>"+esc(s.slice(t.start,t.end))+"</mark>";pos=t.end}return html+esc(s.slice(pos))}
function rank(n){
 if(n>=12718&&n<=12745)return 100000+n;
 if(n>=12700&&n<=12717)return 200000+n;
 if(n>=12746&&n<=12763)return 300000+n;
 if(n>=12764&&n<=12910)return 400000+n;
 return n;
}
function sceneFrame(n){
 if(n>=12718&&n<=12745)return "before_shower";
 if((n>=12700&&n<=12717)||(n>=12746&&n<=12763))return "shower";
 if(n>=12764&&n<=12786)return "ride";
 if(n>=12787&&n<=12823)return "repair";
 if(n>=12824&&n<=12862)return "tea";
 if(n>=12863&&n<=12904)return "zuko";
 if(n>=12905&&n<=12910)return "video";
 return "metadata";
}
function pairMatches(x,p){
 if(p==="all"||x.actor===p)return true;
 if(x.actor==="B"&&p==="DB")return true;
 if(x.actor!=="D")return false;
 if(p==="DB")return (x.line>=12700&&x.line<=12786);
 if(p==="DI")return (x.line>=12787&&x.line<=12895);
 if(p==="DZ")return x.line>=12863&&x.line<=12904;
 if(p==="DJR")return x.line>=12805&&x.line<=12823;
 if(p==="DJ")return x.line>=12905&&x.line<=12910;
 return false;
}
function select(){
 const pair=$("pair").value,q=$("query").value.trim().toLowerCase(),fr=$("frame").value;
 selected=(mode==="lines"?Array.from({length:218},(_,i)=>({line:12696+i,action:"original_source_line",actor:"all",state:"not_semantically_certified",id:"L"+(12696+i)})):all)
 .filter(x=>(mode==="lines"||pairMatches(x,pair))&&(fr==="all"||sceneFrame(x.line)===fr)&&
 (q===""||String(x.line).includes(q)||JSON.stringify(x).toLowerCase().includes(q)||(raw[x.line-1]||"").toLowerCase().includes(q)))
 .sort((a,b)=>$("order").value==="story"?rank(a.line)-rank(b.line):a.line-b.line);
 showCount=0;$("results").innerHTML="";next()
}
function next(){const batch=selected.slice(showCount,showCount+24);showCount+=batch.length;const q=$("query").value.trim();
$("results").insertAdjacentHTML("beforeend",batch.map(x=>{const s=raw[x.line-1]||"",o=offsets(s,q);return '<article class="record"><div class="bar"><a href="'+ROOT+x.line+'" target="_blank" rel="noopener">L'+x.line+' ↗</a><span class="tag">'+esc(pairNames[x.actor]||x.actor)+'</span><span class="tag">'+esc(x.action)+'</span><small>'+esc(x.state||"source located")+'</small></div><p class="source">'+highlighted(s,o)+'</p><small>'+o.length+' exact-word highlight(s); original source line, not rewritten text</small></article>'}).join(""));
$("status").textContent=showCount+" / "+selected.length+" records shown · "+all.length+" curated action anchors · E64 raw lines: 218";}
function save(){const q=$("query").value.trim();const rows=selected.map(x=>({...x,source_uri:"raw/Dhika.txt#L"+x.line,source_text:raw[x.line-1]||"",highlights:offsets(raw[x.line-1]||"",q)}));const b=new Blob([JSON.stringify({episode:64,source:"raw/Dhika.txt",type:mode,review:"not a certified exhaustive semantic extraction",records:rows},null,2)],{type:"application/json"});let u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="e64-"+mode+"-source-index.json";a.click();setTimeout(()=>URL.revokeObjectURL(u),500)}
$("pair").onchange=select;$("frame").onchange=select;$("order").onchange=select;$("query").oninput=select;$("toggle").onclick=()=>{mode=mode==="actions"?"lines":"actions";$("toggle").textContent=mode==="actions"?"View all lines":"View curated actions";select()};$("more").onclick=next;$("download").onclick=save;
(async()=>{try{const responses=await Promise.all([...partFiles.map(x=>fetch(x)),fetch("./raw/Dhika.txt")]);if(responses.some(x=>!x.ok))throw Error("Required file request failed.");let sets=await Promise.all(responses.slice(0,-1).map(x=>x.json()));raw=(await responses[responses.length-1].text()).split(/\r?\n/);all=sets.flatMap((d,k)=>d.rows.map((r,i)=>({id:"E64-"+(k+1)+"-"+(i+1),line:r[0],actor:r[1],action:r[2],state:r[3],phase:k+1}))).sort((a,b)=>a.line-b.line||a.phase-b.phase);if(raw[12695]!=="EPISODE 64")throw Error("Original line numbering mismatch");select()}catch(e){$("status").textContent="Source loading failed: "+e.message}})();