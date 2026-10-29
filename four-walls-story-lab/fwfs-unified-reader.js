/* FWFS single-page episode/part reader. Reads saved manuscripts only. */
(function(){
"use strict";
const ROOT="../data/stories/";
const EP={
 "01":{title:"The Four Walls",parts:[
 ["Part 1 · Four Walls",{kind:"e01",part:"P01"}],
 ["Part 2 · Four Women",{kind:"e01",part:"P02"}],
 ["Part 3 · Private Secrets",{kind:"e01",part:"P03"}],
 ["Part 4 · Encounters",{kind:"e01",part:"P04"}],
 ["Part 5 · The Four Tracks",{kind:"e01",part:"P05"}],
 ["Part 6 · Four Decisions",{kind:"e01",part:"P06"}],
 ["Part 7 · Four Encounters",{kind:"e01",part:"P07"}]
 ]},
 "02":{title:"Four Homes",parts:[
 ["Part 1 · Four Homes",{kind:"markdown",path:"e02_part1_grok_revised_complete_working_reader_20261025.md",pattern:"e02p1",expected:82,status:"Working manuscript: restored invitations and proposed times; not entirely canon-locked."}],
 ["Part 2 · Mahendra Dinner",{kind:"e02part2",status:"Approved scenes, with Scene 1 reconstructed from approved beats where original prose was missing."}],
 ["Part 3 · Ankita Thursday",{kind:"e02part3",status:"Approved reader adaptation; source references retained."}]
 ]},
 "03":{title:"Shivani & Shreya",parts:[
 ["Part 1 · Shivani Tuesday",{kind:"markdown",path:"e03_shivani_part1_tuesday_night_revised_reader.md",pattern:"plain3",status:"Revised working reader; not a full canon-approved episode."}],
 ["Part 2 · Shreya Friday (12 Scenes)",{kind:"e03friday",status:"12 published Friday source scenes; 191 numbered lines, mixed approval states."}],
 ["Part 3 · Shreya Saturday",{kind:"markdown",path:"fwfs_e03_part03_shreya_next_day_approved_20261026.md",pattern:"decimal",expected:72,status:"Director-approved Saturday Shreya episode."}]
 ]},
 "04":{title:"Ankita & Chirag",parts:[
 ["Part 1 · Friday Arrival",{kind:"e04",part:1}],
 ["Part 2 · Ice Cream",{kind:"e04",part:2}],
 ["Part 3 · Friday Continuation",{kind:"e04",part:3}],
 ["Part 4 · Saturday Aftermath",{kind:"e04",part:4}],
 ["Part 5 · Karan–Aman Monday",{kind:"e04",part:5}],
 ["Part 6 · Tuesday–Wednesday",{kind:"e04",part:6}],
 ["Part 7 · The First Pantry Shelf",{kind:"e04",part:7}]
 ]},
 "05":{title:"Shivani — Three Gazes & Tuition",parts:[
 ["Part 1 · Saturday Arora Visit",{kind:"markdown",path:"fwfs_e03_shivani_three_gazes_plot_corrected_director_draft_20261029.md",pattern:"strong",expected:150,status:"Grok-origin 150-line plot/continuity-corrected review draft. Shivani's knowledge of Prakash's earlier incident remains limited."}],
 ["Part 2 · Tuition & First Visit",{kind:"markdown",path:"fwfs_e05_p02_shivani_raghav_rishabh_dhika_e02_l079_121_source_close_review_20261029.md",pattern:"strong",expected:43,status:"SOURCE-CLOSE REVIEW: DHIKA E02 L079–L121 (names/job and continuity changed). Earlier 31-line assistant rewrite was NOT verbatim. Later L122–L150 incident has not been added."}]
 ]}
};
const FILE04={
1:"fwfs_e04_part01_ankita_chotu_qa_reader_v2_20261028.json",
2:"fwfs_e04_part02_ankita_chotu_source_faithful_reader_20261028.json",
3:"fwfs_e04_part03_ankita_chotu_source_faithful_reader_20261028.json",
4:"fwfs_e04_part04_grok_review_reader_20261028.json",
5:"fwfs_e04_part05_karan_aman_grok_review_reader_20261028.json",
6:"fwfs_e04_part06_karan_aman_grok_review_reader_20261028.json",
7:"fwfs_e04_part07_ankita_pantry_targeted_revision_20261029.json"
};
let host=null,currentEp="01",currentPart=1,seq=0;
const cache={};
function h(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;}
async function getText(path){if(!cache[path])cache[path]=fetch(path,{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("HTTP "+r.status+" · "+path);return r.text()}).catch(err=>{delete cache[path];throw err;});return cache[path];}
async function getJSON(path){const raw=await getText(path);return JSON.parse(raw);}
function rowsFromSource(text,rx,expected){
const matches=[...text.matchAll(rx)];
if(expected&&matches.length!==expected)throw Error("Expected "+expected+" numbered beats; found "+matches.length);
return matches.map((m,i)=>({id:m[1],text:text.slice(m.index+m[0].length,i+1<matches.length?matches[i+1].index:text.length).trim()}));
}
function mdRows(text,mode,expected){
let rows;
if(mode==="strong"){
 const re=/\*\*L(\d{3})\*\*\s*\n/g;
 const all=[...text.matchAll(re)];
 if(expected&&all.length!==expected)throw Error("Expected "+expected+" numbered lines; got "+all.length);
 rows=all.map((m,i)=>{
 const from=m.index+m[0].length;const to=i+1<all.length?all[i+1].index:text.length;
 let body=text.slice(from,to).trim();
 if(i===all.length-1)body=body.split(/\n---\s*\n/)[0].trim();
 return{id:"L"+m[1],text:body};
 });
}else if(mode==="e02p1"){
 const re=/^(?:\*\*)?FWFS-E02-P01-L(\d{3})(?:\*\*)?\s+/gm;
 rows=rowsFromSource(text,re,expected).map(r=>({id:"L"+r.id,text:r.text}));
}else if(mode==="decimal"){
 const re=/^(\d{3})\.\s*/gm;
 rows=rowsFromSource(text,re,expected).map(r=>({id:"L"+r.id,text:r.text}));
}else if(mode==="plain3"){
 const re=/^(\d{3})\s+/gm;
 rows=rowsFromSource(text,re).map(r=>({id:"L"+r.id,text:r.text}));
}else throw Error("Unsupported source type: "+mode);
return [{title:"Original manuscript, numbered text",rows}];
}
function e01Groups(doc,part){
const sections=doc.parts.filter(p=>p.part===part);
if(!sections.length)throw Error("Missing Episode 01 "+part);
return sections.map(s=>({title:s.title,rows:(s.blocks||[]).map((b,i)=>({id:b.source_id||String(i+1),text:b.text||""}))}));
}
async function loadE03Friday(){
 const m=await getJSON("e03-friday-scenes-manifest.json");
 if(m.scenes.length!==12)throw Error("Expected 12 Friday scenes");
 return Promise.all(m.scenes.map(async info=>{
 const raw=await getText(info.source);
 const prefix="E03-S"+String(info.number).padStart(2,"0")+"-L";
 const re=new RegExp(prefix+"(\\d{3})\\.\\s*","g");
 const found=[...raw.matchAll(re)];
 if(found.length!==info.lines)throw Error("Scene "+info.number+" expected "+info.lines+" lines; got "+found.length);
 const rows=found.map((match,i)=>({id:"S"+String(info.number).padStart(2,"0")+"-L"+match[1],text:raw.slice(match.index+match[0].length,i+1<found.length?found[i+1].index:raw.length).trim()}));
 return {title:"Scene "+String(info.number).padStart(2,"0")+" · "+info.title,rows};
 }));
}
async function loadPart(ep,part){
const item=EP[ep]?.parts[part-1];if(!item)throw Error("Episode/part not found");
const d=item[1];
if(d.kind==="e01"){const src=await getJSON(ROOT+"e01_all_seven_parts_continuous_reader_v1.json");return e01Groups(src,d.part);}
if(d.kind==="markdown")return mdRows(await getText(ROOT+d.path),d.pattern,d.expected);
if(d.kind==="e02part2"){
const src=await getJSON(ROOT+"fwfs_e02_integrated_reader_data_20261026.json");
return src.scenes.map((sc,i)=>{
 const parsed=new DOMParser().parseFromString(sc.html,"text/html");
 const title=parsed.querySelector("h2")?.textContent?.trim()||"Scene "+(i+1);
 const paragraph=[...parsed.querySelectorAll("p.line, p.e02-main-line, p.e02-story-line")];
 const selected=paragraph.length?paragraph:[...parsed.querySelectorAll("p")].filter(x=>/^(?:S\d+[- ]L\d+)/.test(x.textContent.trim()));
 if(!selected.length)throw Error("Scene "+(i+1)+" had no readable manuscript paragraphs");
 return {title,rows:selected.map((p,j)=>{const raw=p.textContent.trim();const m=/^(S\d+[- ]L\d+)\.?\s*/.exec(raw);return{id:m?m[1]:"L"+String(j+1).padStart(3,"0"),text:m?raw.slice(m[0].length):raw};})};
});
}
if(d.kind==="e02part3"){const src=await getJSON(ROOT+"fwfs_e02_integrated_reader_data_20261026.json");const lines=src.part3.lines;if(!lines?.length)throw Error("E02 P3 has no lines");return [{title:"Ankita — Thursday",rows:lines.map(x=>({id:"L"+x.number,text:x.text}))}];}
if(d.kind==="e03friday")return loadE03Friday();
if(d.kind==="e04"){const src=await getJSON(ROOT+FILE04[d.part]);const lines=d.part===1?src.blocks:src.lines;
 if(!lines?.length)throw Error("E04 P"+d.part+" missing source blocks");
 return [{title:src.title||item[0],rows:lines.map((x,i)=>({id:x.id||"L"+String(i+1).padStart(3,"0"),text:x.text||""}))}];}
throw Error("Unrecognized reader source");
}
function stateHash(ep,part){return"#fwfs-e"+ep+"-p"+String(part).padStart(2,"0");}
function status(part){return part[1].status||(part[1].kind==="e04"&&part[1].part>=4?"Director review draft; not canon locked.":"Source reader; source approval status is preserved.");}
function episodeButtons(){
 const box=host.querySelector(".fwfs-r-episodes");box.textContent="";
 Object.keys(EP).forEach(ep=>{const b=h("button","", "Episode "+ep);b.type="button";b.dataset.fwfsEp=ep;b.setAttribute("aria-selected",String(ep===currentEp));box.appendChild(b)});
}
function partButtons(){
 const box=host.querySelector(".fwfs-r-parts");box.textContent="";
 EP[currentEp].parts.forEach(([name],i)=>{const b=h("button","",name);b.type="button";b.dataset.fwfsPart=String(i+1);b.setAttribute("aria-selected",String(i+1===currentPart));box.appendChild(b)});
}
async function render(){
 if(!host)return;const ticket=++seq;
 episodeButtons();partButtons();
 const item=EP[currentEp].parts[currentPart-1],heading=EP[currentEp];
 host.querySelector(".fwfs-r-title").textContent="Episode "+currentEp+" · "+heading.title;
 host.querySelector(".fwfs-r-label").textContent=item[0];
 host.querySelector(".fwfs-r-status").textContent=status(item);
 host.querySelector(".fwfs-r-counter").textContent="Loading manuscript…";
 const body=host.querySelector(".fwfs-r-body");body.textContent="";
 try{
 const groups=await loadPart(currentEp,currentPart);
 if(ticket!==seq)return;let sum=0;
 groups.forEach(section=>{
 body.appendChild(h("h2","fwfs-r-subhead",section.title));
 section.rows.forEach(line=>{
 const row=h("div","fwfs-r-row");
 row.appendChild(h("span","fwfs-r-num",line.id));
 row.appendChild(h("div","fwfs-r-prose",line.text));
 body.appendChild(row);sum++;
 });
 });
 host.querySelector(".fwfs-r-counter").textContent=sum+" numbered blocks · "+groups.length+" section(s)";
 }catch(err){
 if(ticket!==seq)return;body.appendChild(h("p","fwfs-r-error","Source loading error: "+err.message));
 host.querySelector(".fwfs-r-counter").textContent="Source error";
 }
}
function select(ep,part,write=true){
 ep=String(ep).padStart(2,"0");if(!EP[ep])ep="01";
 part=Number(part)||1;part=Math.max(1,Math.min(EP[ep].parts.length,part));
 currentEp=ep;currentPart=part;
 const picker=document.getElementById("fwfs-episode-picker");if(picker)picker.value=ep;
 window.setFWFSStoryMenu?.(ep);
 window.fwfsNavigate?.();
 if(location.hash!==stateHash(ep,part))history.replaceState(null,"",stateHash(ep,part));
 render();
}
function chooseHash(){
 const m=/^#fwfs-e(0[1-5])-p0?(\d{1,2})$/.exec(location.hash);
 return m?{ep:m[1],part:Number(m[2])}:null;
}
function init(){
 host=document.getElementById("fwfs-reader");if(!host)return;
 host.addEventListener("click",e=>{
 const episode=e.target.closest("[data-fwfs-ep]");if(episode){select(episode.dataset.fwfsEp,1);return;}
 const part=e.target.closest("[data-fwfs-part]");if(part){select(currentEp,part.dataset.fwfsPart);return;}
 if(e.target.closest("[data-fwfs-prev]")){if(currentPart>1)select(currentEp,currentPart-1);else{const eps=Object.keys(EP);const i=eps.indexOf(currentEp);if(i>0)select(eps[i-1],EP[eps[i-1]].parts.length);}return;}
 if(e.target.closest("[data-fwfs-next]")){if(currentPart<EP[currentEp].parts.length)select(currentEp,currentPart+1);else{const eps=Object.keys(EP);const i=eps.indexOf(currentEp);if(i<eps.length-1)select(eps[i+1],1);}return;}
 });
 document.addEventListener("click",e=>{const b=e.target.closest("[data-fwfs-navpart]");if(b)select(b.dataset.fwfsNavEp,b.dataset.fwfsNavpart);});
 window.addEventListener("hashchange",()=>{const st=chooseHash();if(st&&(st.ep!==currentEp||st.part!==currentPart))select(st.ep,st.part,false);});
 const st=chooseHash();if(st)select(st.ep,st.part,false);else select(document.getElementById("fwfs-episode-picker")?.value||"01",1,false);
}
window.FWFSReader={select,selectEpisode:ep=>select(ep,1),episodes:EP};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();