/* FWFS E03 Shreya user-approved Google Doc story reader. Manuscripts rendered verbatim, as text. */
(function(){
"use strict";
var manifestPath="../data/stories/fwfs_e03_shreya_approval_manifest_20261026.json";
var cache=null;
function elem(tag,cls,value){var e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=value;return e;}
window.loadE03Approved=function(){
 var target=document.getElementById("e03-approved-scenes-content");
 if(!target||target.dataset.loaded==="1")return;
 target.dataset.loaded="1";
 target.textContent="Loading four user-approved scenes…";
 if(!cache)cache=fetch(manifestPath,{cache:"no-store"}).then(function(r){if(!r.ok)throw Error("Manifest HTTP "+r.status);return r.json()}).then(function(m){
  if(!m.scenes||m.scenes.length!==4)throw Error("Expected four approved scenes");
  return Promise.all(m.scenes.map(function(s){return fetch("../data/stories/"+s.file,{cache:"no-store"}).then(function(r){if(!r.ok)throw Error(s.id+" HTTP "+r.status);return r.text()}).then(function(raw){return {info:s,raw:raw};});}));
 });
 cache.then(function(rows){
  target.textContent="";
  var toc=elem("nav","e02-inline-toc");toc.setAttribute("aria-label","Approved scene index");
  rows.forEach(function(item){
   var b=elem("button","e02-inline-action","Scene "+String(item.info.scene).padStart(2,"0")+" · "+item.info.title);
   b.type="button";b.setAttribute("data-e03-jump","fwfs-e03-s"+item.info.scene);toc.appendChild(b);
  });target.appendChild(toc);
  rows.forEach(function(item){
   var scene=elem("section","e02-inapp-scene");scene.id="fwfs-e03-s"+item.info.scene;
   scene.appendChild(elem("h2","", "Scene "+String(item.info.scene).padStart(2,"0")+" · "+item.info.title));
   scene.appendChild(elem("p","e02-reference-line","USER APPROVED · "+item.info.numbered_lines+" numbered lines · Source verbatim"));
   var lines=[...item.raw.matchAll(new RegExp("E03-S0"+item.info.scene+"-L\\d{3}","g"))].length;
   if(lines!==item.info.numbered_lines)scene.appendChild(elem("p","warn-lite","Integrity warning: "+lines+" line IDs found, "+item.info.numbered_lines+" expected."));
   var pre=elem("pre","e03-source-prose",item.raw);
   pre.style.whiteSpace="pre-wrap";pre.style.overflowWrap="anywhere";pre.style.font="inherit";pre.style.margin="12px 0 22px";scene.appendChild(pre);
   target.appendChild(scene);
  });
 }).catch(function(e){target.dataset.loaded="";target.textContent="Approved scenes could not load: "+e.message;});
};
document.addEventListener("click",function(e){var b=e.target.closest("[data-e03-jump]");if(!b)return;var t=document.getElementById(b.getAttribute("data-e03-jump"));if(t)t.scrollIntoView({behavior:"smooth",block:"start"});});
})();
