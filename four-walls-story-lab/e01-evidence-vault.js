/* Source-exact evidence navigation for DHIKA E01 and FWFS E01.
 * DO NOT summarize primary prose. Show unchanged original source on selection. */
(function(){
"use strict";
var prefix=location.pathname.indexOf("/four-walls-story-lab/")>=0?"../":"./";
var cached={};
function getText(path){if(!cached[path])cached[path]=fetch(prefix+path,{cache:"no-store"}).then(function(r){if(!r.ok)throw Error("HTTP "+r.status+" for "+path);return r.text();});return cached[path];}
function getJson(path){return getText(path).then(function(s){return JSON.parse(s);});}
var facetLabels={appearance:"Clothing / visual",observation:"Observation / gaze",contact:"Contact / proximity cue",inner_thought:"Private thoughts",privacy_boundary:"Privacy / knowledge boundary",dialogue:"Dialogue",photography:"Photography",source_descriptive:"Original descriptive slot",body_specific:"Body-specific source details",imagination:"Imagined / fantasy cues",inner_physical_response:"Internal physical-response cues",outfit_mechanics:"Garment / draping mechanics",plan_only:"Plan only"};
function id(x){return document.getElementById(x);}
function element(tag,cls,label){var e=document.createElement(tag);if(cls)e.className=cls;if(label!==undefined)e.textContent=label;return e;}
function fillOptions(select,values,placeholder){select.textContent="";var all=element("option","",placeholder);all.value="";select.appendChild(all);values.forEach(function(value){var o=element("option","",value);o.value=value;select.appendChild(o);});}
function buildVault(prefixId,kind,path){
 var root=id(prefixId);if(!root)return;
 var charSel=root.querySelector('[data-vault-filter="character"]'),facetSel=root.querySelector('[data-vault-filter="facet"]'),partSel=root.querySelector('[data-vault-filter="part"]'),search=root.querySelector('[data-vault-filter="search"]');
 var results=root.querySelector(".vault-results"),relHost=root.querySelector(".vault-relationships"),status=root.querySelector(".vault-count"),proof=root.querySelector(".vault-proof"),pages=root.querySelector(".vault-pages");
 var dataset,records=[],relations=[],page=0,pair=null,mode="records",perPage=40;
 function alertStatus(msg){status.textContent=msg;}
 function openSource(x){
  proof.hidden=false;proof.textContent="";var title=element("h3","",x.id);proof.appendChild(title);
  var pre=element("pre","","Loading exact original source…");proof.appendChild(pre);
  if(x.source_url){var a=element("a","","Open primary source in GitHub / reader");a.href=x.source_url;a.target="_blank";a.rel="noopener noreferrer";proof.appendChild(a);}
  proof.scrollIntoView({behavior:"smooth",block:"start"});
  var job;
  if(kind==="dhika"){
   job=getJson("data/episodes/e01.json").then(function(d){var e=d.events.find(function(z){return z.id===x.id});if(!e)throw Error("DHIKA source ID absent");return e.raw_lines.map(function(line){return "E01-L"+String(line.line).padStart(3,"0")+" | "+line.text;}).join("\n");});
  }else if(x.source_kind==="html_line"){
   job=Promise.resolve().then(function(){var section=document.querySelector('[data-view="'+x.route+'"]');if(!section)throw Error("Original Story Lab view missing");var found=Array.from(section.querySelectorAll(".draft-line")).find(function(row){var label=row.querySelector(".lno");return label&&label.textContent.trim()===x.source_ref;});if(!found)throw Error("Exact paragraph anchor not found");return found.textContent;});
  }else if(x.source_kind==="reader_json_block"){
   job=getJson(x.source).then(function(j){var b=j.blocks.find(function(z){return z.id===x.source_ref;});if(!b)throw Error("Exact reader block not found");return b.text;});
  }else if(x.source_kind==="markdown_line"){
   job=getText(x.source).then(function(t){var hits=t.split(/\r?\n/).filter(function(line){return x.part==="P05"?line.indexOf("**"+x.source_ref+"**")>=0:line.indexOf(x.source_ref)===0;});if(hits.length!==1)throw Error("Expected one exact source line; found "+hits.length);return hits[0];});
  }else if(x.source_kind==="markdown_line_number"){job=getText(x.source).then(function(t){var line=t.split(/\r?\n/)[x.line_index];if(line===undefined)throw Error("Recovered exact prose line not found");return line;});
  }else if(x.source_kind==="markdown_paragraph"){
   job=getText(x.source).then(function(t){var para=t.split(/\n\s*\n/)[x.paragraph_index];if(!para)throw Error("Exact source paragraph missing");return para;});
  }else if(x.source_kind==="director_plan_only"){job=getText(x.source);}
  else job=Promise.reject(new Error("No source adapter for "+x.source_kind));
  job.then(function(content){pre.textContent=content;}).catch(function(e){pre.textContent="Could not load exact source: "+e.message;});
 }
 function matchEntry(x){
  if(charSel.value&&!(x.actors||x.characters||[]).includes(charSel.value))return false;
  if(facetSel.value&&!(x.facets||x.searchFacets||[]).includes(facetSel.value))return false;
  if(partSel.value&&x.part!==partSel.value)return false;
  if(pair&&(!((x.actors||x.characters||[]).includes(pair[0])&&(x.actors||x.characters||[]).includes(pair[1]))))return false;
  var query=search.value.trim().toLowerCase();if(query){var t=[x.id,x.source_ref,x.source_label,x.scene_heading,x.section,x.part,x.subscene,(x.actors||x.characters||[]).join(" "),((x.facets||x.searchFacets)||[]).join(" ")].join(" ").toLowerCase();if(t.indexOf(query)===-1)return false;}
  return true;
 }
 function renderRecords(){
  var found=records.filter(matchEntry),max=Math.max(1,Math.ceil(found.length/perPage));page=Math.min(page,max-1);
  results.textContent="";relHost.hidden=true;results.hidden=false;pages.hidden=false;
  alertStatus(found.length+" of "+records.length+" source-anchored entries"+(pair?" · pair: "+pair.join(" × "):"")+" · Page "+(page+1)+" of "+max+". Source language is not summarized.");
  found.slice(page*perPage,(page+1)*perPage).forEach(function(x){
   var c=element("article","vault-entry"),title=element("h3","",x.id);c.appendChild(title);
   var chars=x.actors||x.characters||[];c.appendChild(element("p","","Part "+x.part.replace(/^P0?/,"")+" · "+chars.join(" · ")+(x.story_time?" · "+x.story_time:"")));
   var tags=element("div","vault-labels");(x.facets||x.searchFacets||[]).forEach(function(z){tags.appendChild(element("span","",facetLabels[z]||z));});if(x.source_kind==="director_plan_only")tags.appendChild(element("span","","NOT finished prose"));c.appendChild(tags);
   var open=element("button","","Open exact source");open.type="button";open.addEventListener("click",function(){openSource(x)});c.appendChild(open);results.appendChild(c);
  });
  pages.textContent="";var back=element("button","","Previous"),num=element("span","",String(page+1)+" / "+max),next=element("button","","Next");back.disabled=page===0;next.disabled=page>=max-1;back.onclick=function(){page--;renderRecords()};next.onclick=function(){page++;renderRecords()};pages.append(back,num,next);
 }
 function renderRelations(){
  results.hidden=true;pages.hidden=true;relHost.hidden=false;relHost.textContent="";
  alertStatus(relations.length+" source-linked relationships. Clicking a pair filters its source evidence; the label does not substitute for source text.");
  relations.forEach(function(r){
   var c=element("article","vault-relation");c.appendChild(element("h3","",r.a+" × "+r.b));c.appendChild(element("p","",r.role||r.type));
   var small=element("p","",(r.beatRefs||r.evidenceIDs||[]).join(" · "));c.appendChild(small);
   var btn=element("button","","Inspect pair evidence");btn.onclick=function(){pair=[r.a,r.b];mode="records";setModeButtons();charSel.value="";facetSel.value="";partSel.value="";search.value="";page=0;renderRecords();};c.appendChild(btn);relHost.appendChild(c);
  });
 }
 function setModeButtons(){root.querySelectorAll("[data-vault-mode]").forEach(function(b){b.setAttribute("aria-pressed",String(b.getAttribute("data-vault-mode")===mode));});}
 root.querySelectorAll("[data-vault-mode]").forEach(function(b){b.addEventListener("click",function(){mode=b.getAttribute("data-vault-mode");setModeButtons();if(mode==="records")renderRecords();else renderRelations();});});
 [charSel,facetSel,partSel].forEach(function(sel){sel.addEventListener("change",function(){pair=null;page=0;renderRecords();});});
 search.addEventListener("input",function(){pair=null;page=0;renderRecords()});
 root.querySelector("[data-vault-clear]").onclick=function(){pair=null;charSel.value="";facetSel.value="";partSel.value="";search.value="";page=0;mode="records";setModeButtons();renderRecords();proof.hidden=true;};
 alertStatus("Loading source-exact metadata…");
 getJson(path).then(function(d){
  dataset=d;records=(kind==="dhika"?d.events:d.items);relations=d.relationships||[];
  var people=[...new Set(records.flatMap(function(x){return x.actors||x.characters||[]}))].sort();
  fillOptions(charSel,people,"All characters");
  var tags=[...new Set(records.flatMap(function(x){return x.facets||x.searchFacets||[]}))].sort();
  fillOptions(facetSel,tags,"All evidence categories");Array.from(facetSel.options).forEach(function(o){if(o.value)o.textContent=facetLabels[o.value]||o.value;});
  fillOptions(partSel,[...new Set(records.map(function(x){return x.part}))].sort(),"All source parts");
  var info=root.querySelector(".vault-data-count");if(info)info.textContent=(kind==="dhika"?"229 E01 local slots (228 physical lines + terminal blank) · 44 events":records.length+" indexed source locators")+" · "+relations.length+" relationship links";
  renderRecords();
 }).catch(function(e){alertStatus("Tracker loading failed: "+e.message);});
}
buildVault("dhika-e01-vault","dhika","data/continuity/dhika_e01_source_exact_tracker_v1.json");
buildVault("fwfs-e01-vault","fwfs","data/continuity/fwfs_e01_source_exact_tracker_v1.json");
})();
