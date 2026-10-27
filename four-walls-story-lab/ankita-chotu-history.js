/* FWFS E01 Ankita × Chotu — versioned source-exact history renderer.
 * The primary story text is read from the existing canonical reader unchanged.
 * This file records no new fiction and does not promote drafts to canon. */
(function(){
"use strict";
var host=document.getElementById("ankita-chotu-history-root");if(!host)return;
var base="../",repo="https://github.com/developer-fandom-rush/dhika-sharmi-adventures/blob/main/";
var ledgerPath="data/continuity/fwfs_e01_ankita_chotu_history_latest_20261027.json";
var readerPath="data/stories/e01_all_seven_parts_continuous_reader_v1.json";
var dhikaPath="data/episodes/e01.json";
var style=document.createElement("style");style.textContent=`
.ach-history{color:#e7edf4}.ach-history .ach-intro{background:#182a3c;border:1px solid #465a75;border-radius:12px;padding:16px;margin:14px 0;line-height:1.7}
.ach-history .ach-diff{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;margin:14px 0}
.ach-history .ach-diff article{padding:14px;border:1px solid #3a526c;background:#18283f;border-radius:12px}
.ach-history .ach-diff strong{color:#efc88a}.ach-history .ach-subline{font-size:12px;color:#b8c8da}
.ach-history .ach-controls{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:18px 0}
.ach-history .ach-controls input[type=search]{padding:10px 12px;background:#0e1c2c;color:#f4f6fa;border:1px solid #6a7890;border-radius:9px;min-width:235px;flex:1}
.ach-history .ach-controls label{display:flex;align-items:center;gap:7px;font-size:13px}
.ach-history .ach-count{color:#c0d1df;font-size:13px;margin:10px 0}
.ach-history .ach-phase{margin:16px 0;border:1px solid #3e516e;border-radius:13px;overflow:hidden;background:#142338}
.ach-history .ach-phase>summary{padding:17px 18px;cursor:pointer;font-weight:700;color:#f1c994;background:#1e3048}
.ach-history .ach-phase .ach-phase-body{padding:8px 16px 18px}
.ach-history .ach-stage{font-weight:750;color:#c2e3e6;font-size:14px;padding:12px 0 7px;border-bottom:1px solid #3b5369;margin:15px 0 7px}
.ach-history .ach-stage small{display:block;font-weight:400;color:#b5c5d5;line-height:1.5;margin-top:3px}
.ach-history .ach-line{display:grid;grid-template-columns:minmax(130px,210px) minmax(0,1fr);column-gap:13px;border-bottom:1px solid #35475d;padding:11px 0}
.ach-history .ach-line-id{font:12px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace;color:#e6ca95;overflow-wrap:anywhere}
.ach-history .ach-line-text{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:14px;color:#e6edf4}
.ach-history .ach-end-marker{display:inline-block;margin-top:6px;border:1px solid #b08e5c;border-radius:6px;padding:2px 6px;color:#f1d0a0;font-size:11px}
.ach-history .ach-context{font-size:11px;color:#abc7d9;display:block}
.ach-history .ach-sourcefoot{border-top:1px solid #435773;margin-top:16px;padding-top:10px;font-size:13px}
.ach-history a{color:#f1cb8f}.ach-history .ach-compare{margin-top:24px;border:1px solid #667b91;border-radius:12px;padding:13px}
.ach-history .ach-compare>summary{cursor:pointer;color:#e9c58d;font-weight:700}
.ach-history .ach-original-row{padding:9px 0;border-bottom:1px solid #384e63;display:grid;grid-template-columns:95px 1fr;gap:12px}
.ach-history .ach-original-row span:first-child{font:12px/1.6 ui-monospace,monospace;color:#dbbe89}
@media(max-width:650px){.ach-history .ach-line,.ach-history .ach-original-row{grid-template-columns:1fr}.ach-history .ach-line-id{padding-bottom:4px}}
`;document.head.appendChild(style);
function node(tag,cls,value){var e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=value;return e;}
function get(path){return fetch(new URL(base+path,location.href),{cache:"no-store"}).then(function(r){if(!r.ok)throw Error(path+": HTTP "+r.status);return r.json();});}
host.innerHTML='<div class="ach-history"><p role="status">Loading exact source IDs from saved history ledger…</p></div>';
Promise.all([get(ledgerPath),get(readerPath)]).then(function(result){
var manifest=result[0],reader=result[1],all=new Map();
reader.parts.forEach(function(p){p.blocks.forEach(function(b){if(all.has(b.source_id))throw Error("Duplicate source ID "+b.source_id);all.set(b.source_id,b.text);});});
var missing=manifest.source_rows.filter(function(r){return !all.has(r.source_id);});if(missing.length)throw Error(missing.length+" evidence lines are missing from the canonical reader");
var root=node("div","ach-history");host.textContent="";host.appendChild(root);
var intro=node("div","ach-intro");intro.appendChild(node("h2","",manifest.tab_name));
intro.appendChild(node("p","","FWFS Episode 01. Source-ordered, block-by-block extraction from the current reader. The source text below is displayed unchanged and every source ID is preserved. This is an evidence ledger, NOT an episode recap or a new scene."));
intro.appendChild(node("p","ach-subline","Editorial status: Part 5 merged review draft · Part 6 working draft · Part 7 revised Grok review copy (NOT CANON). The latest consolidated reader itself says canon lock is pending Director resolution."));
intro.appendChild(node("p","ach-subline","Boundary rule: a character's private thoughts after Chotu leaves are reader-only, not knowledge available to Chotu. The separate laundry/Mahendra thread must not be attributed to him."));
root.appendChild(intro);
var comparison=node("div","ach-diff");
var fw= node("article");fw.appendChild(node("strong","","FWFS — Ankita × Chirag (Chotu)"));fw.appendChild(node("p","","Chirag is 22; a familiar delivery worker. Bansal home, Rey's rocket, then delivery-app verification. Saturday → Sunday → Monday preparation → Tuesday encounter."));
var dh= node("article");dh.appendChild(node("strong","","DHIKA — Dhika × Babu (Chotu)"));dh.appendChild(node("p","","Babu is 19; a departmental-store worker. Grocery errands and next-day meal. Different woman, family, narrative calendar, and escalation staging. Original E01-L116–224 is a structural reference only."));
comparison.append(fw,dh);root.appendChild(comparison);
var controls=node("div","ach-controls"),search=node("input");search.type="search";search.placeholder="Filter exact source ID or text…";search.setAttribute("aria-label","Search Ankita Chotu source lines");var only=node("input");only.type="checkbox";only.id="ach-only-shared";var label=node("label");label.htmlFor=only.id;label.appendChild(only);label.appendChild(document.createTextNode("Shared scenes only (hide private/parallel lines)"));controls.append(search,label);root.appendChild(controls);
var counter=node("div","ach-count");root.appendChild(counter);
var groupsHost=node("div");root.appendChild(groupsHost);
function render(){
 var query=search.value.trim().toLowerCase(),onlyShared=only.checked,count=0;groupsHost.textContent="";
 manifest.groups.forEach(function(group){
  var rs=manifest.source_rows.filter(function(r){return r.phase===group.key&&( !onlyShared||r.has_chotu_on_scene) && (!query||r.source_id.toLowerCase().includes(query)||all.get(r.source_id).toLowerCase().includes(query)||r.stage_note.toLowerCase().includes(query));});
  if(!rs.length)return;count+=rs.length;
  var box=node("details","ach-phase");box.open=true;
  var summ=node("summary","",group.title+" · "+rs.length+"/"+group.source_block_count+" blocks");box.appendChild(summ);
  var body=node("div","ach-phase-body");
  body.appendChild(node("p","ach-subline",group.status+" · in-person ending: "+(group.shared_scene_last_source_id||"no in-person visit")+" · section ending: "+group.section_last_source_id));
  var prev=null;
  rs.forEach(function(row){
   if(row.stage!==prev){var stage=node("div","ach-stage",row.stage.replace(/_/g," ").toUpperCase());stage.appendChild(node("small","",row.stage_note));body.appendChild(stage);prev=row.stage;}
   var item=node("div","ach-line");item.id="ach-"+row.source_id;var lead=node("div","ach-line-id");lead.appendChild(node("div","",row.source_id));lead.appendChild(node("span","ach-context",row.has_chotu_on_scene?"Chotu physically present":"No Chotu present / reader context"));
   if(group.shared_scene_last_source_id===row.source_id)lead.appendChild(node("span","ach-end-marker","SHARED SCENE ENDS HERE"));
   if(group.section_last_source_id===row.source_id)lead.appendChild(node("span","ach-end-marker","SECTION ENDS HERE"));
   item.append(lead,node("div","ach-line-text",all.get(row.source_id)));body.appendChild(item);
  });
  box.appendChild(body);groupsHost.appendChild(box);
 });
 counter.textContent="Showing "+count+" / "+manifest.record_count+" exact source blocks across "+groupsHost.children.length+" chronological sections.";
}
search.addEventListener("input",render);only.addEventListener("change",render);render();
var compare=node("details","ach-compare");compare.appendChild(node("summary","","Separate DHIKA E01 original source (lines 116–224) · inspect without mixing with FWFS"));
var note=node("p","ach-subline","Original E01 line numbers below are native to DHIKA, not FWFS. This reference is only for mechanism/interval comparison; no original source passage is attributed to Ankita.");compare.appendChild(note);
var original=node("div");original.appendChild(node("p","","Expand to load original source lines without editing them."));compare.appendChild(original);root.appendChild(compare);
var loaded=false;compare.addEventListener("toggle",function(){if(!compare.open||loaded)return;loaded=true;original.textContent="Loading original source lines…";get(dhikaPath).then(function(d){var indexed=new Map();d.events.forEach(function(ev){ev.raw_lines.forEach(function(l){indexed.set(l.line,l.text);});});original.textContent="";for(var n=116;n<=224;n++){var line=node("div","ach-original-row");line.appendChild(node("span","","DHIKA-L"+String(n).padStart(3,"0")));line.appendChild(node("span","",indexed.get(n)||""));original.appendChild(line);} }).catch(function(e){original.textContent="Unable to load DHIKA source: "+e.message;loaded=false;});});
var foot=node("p","ach-sourcefoot");[[readerPath,"FWFS complete E01 reading source"],[ledgerPath,"Saved history evidence ledger"],[dhikaPath,"Original DHIKA E01 indexed source"]].forEach(function(e,i){if(i)foot.appendChild(document.createTextNode(" · "));var a=node("a","",e[1]);a.href=repo+e[0];a.target="_blank";a.rel="noopener noreferrer";foot.appendChild(a);});root.appendChild(foot);
}).catch(function(e){host.textContent="History loading failed: "+e.message;});
})();