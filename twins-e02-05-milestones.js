(function(){
"use strict";
let cached=null;
const host=document.getElementById("milestoneList"),filter=document.getElementById("mPair");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const source=n=>"https://github.com/developer-fandom-rush/dhika-sharmi-adventures/blob/main/raw/Dhika.txt#L"+n;
function render(){
 if(!cached)return;
 const p=filter.value,shown=cached.filter(r=>p==="all"||r.pair===p);
 host.innerHTML=shown.map(r=>'<article class="entry"><span class="tag">E0'+r.episode+' · L'+r.source_line+'</span><span class="tag">'+esc(r.pair)+'</span><h3>'+esc(r.event)+'</h3><div class="meta">'+esc(r.classification)+' / '+esc(r.evidence_state)+'</div><a href="'+source(r.source_line)+'" target="_blank" rel="noopener">Exact original line ↗</a></article>').join("");
}
async function load(){
 if(cached){render();return}
 try{const response=await fetch("./data/twins_e01_e05_milestones_v1.json");if(!response.ok)throw Error("HTTP "+response.status);cached=(await response.json()).milestones;render()}
 catch(e){host.textContent="Milestone data unavailable: "+e.message}
}
document.querySelector('nav button[data-view="milestones"]').addEventListener("click",load);
filter.addEventListener("change",load);
})();