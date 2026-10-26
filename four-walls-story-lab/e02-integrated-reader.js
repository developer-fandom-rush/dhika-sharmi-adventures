/* Episode 02 integrated, same-panel reader; source data kept outside this script. */
(function(){
 "use strict";
 var dataPromise=null;
 var sourceUrl="../data/stories/fwfs_e02_integrated_reader_data_20261026.json";
 function getData(){
   if(!dataPromise)dataPromise=fetch(sourceUrl).then(function(r){
      if(!r.ok)throw Error("Episode 02 reader data HTTP "+r.status);
      return r.json();
   }).then(function(d){
      if(!d||!Array.isArray(d.scenes)||d.scenes.length!==15||!d.part3||d.part3.lines.length!==72)throw Error("Incomplete E02 source payload");
      return d;
   });
   return dataPromise;
 }
 function make(tag,cls,text){
   var el=document.createElement(tag);
   if(cls)el.className=cls;
   if(text!==undefined)el.textContent=text;
   return el;
 }
 function control(text,target,kind){
   var b=make("button","e02-inline-action"+(kind==="secondary"?" e02-inline-alt":""),text);
   b.type="button";b.setAttribute("data-e02-jump",target);
   return b;
 }
 function appendTo(node,children){children.forEach(function(el){node.appendChild(el);});}
 function sectionButtonBar(node,previous,next){
   var bar=make("div","e02-inline-pager");
   if(previous)bar.appendChild(control("← Previous",previous,"secondary"));
   bar.appendChild(control("↑ Scene index","e02-part2-scene-menu","secondary"));
   if(next)bar.appendChild(control("Next →",next));
   node.appendChild(bar);
 }
 function renderPart2(d){
   var target=document.getElementById("e02-integrated-scene-content");
   if(!target||target.dataset.ready==="1")return;
   target.textContent="";
   var toc=make("nav","e02-inline-toc");
   toc.id="e02-part2-scene-menu";
   var labels={"scene-11-exit":"Departure","scene-11-night":"11 · Night"};
   d.scenes.forEach(function(scene){
     toc.appendChild(control(labels[scene.id]||scene.id.replace("scene-","Scene "),scene.id));
   });
   target.appendChild(toc);
   d.scenes.forEach(function(scene,i){
     var sec=make("section","e02-inapp-scene");
     sec.id=scene.id;
     sec.innerHTML=scene.html;
     // Reuse old approved/reader-origin line markup without rewriting any prose.
     if(scene.id==="scene-13"||scene.id==="scene-14"){
       sec.classList.add("e02-approved-source");
     }
     sectionButtonBar(sec,i?d.scenes[i-1].id:null,d.scenes[i+1]?d.scenes[i+1].id:null);
     target.appendChild(sec);
   });
   target.dataset.ready="1";
 }
 function renderPart3(d){
   var target=document.getElementById("e02-integrated-part3-content");
   if(!target||target.dataset.ready==="1")return;
   target.textContent="";
   var sets=[
     {id:"e02-p3-office",title:"Office · Flirting and private favour",a:79,b:109},
     {id:"e02-p3-home",title:"Shop · Apartment · Unexpected incident",a:110,b:135},
     {id:"e02-p3-after",title:"Ritvik conversation · Next-morning hook",a:136,b:150}
   ];
   var nav=make("nav","e02-inline-toc");
   nav.id="e02-p3-index";
   sets.forEach(function(c){nav.appendChild(control(c.title,c.id));});
   target.appendChild(nav);
   sets.forEach(function(set,i){
     var sec=make("section","e02-inapp-scene");
     sec.id=set.id;
     sec.appendChild(make("h2","",set.title));
     sec.appendChild(make("p","e02-reference-line","DHIKA-reference-aligned FWFS lines "+set.a+"–"+set.b));
     d.part3.lines.filter(function(line){return line.number>=set.a&&line.number<=set.b;}).forEach(function(line){
        var p=make("p","e02-inline-numbered");
        p.appendChild(make("span","e02-inline-num",String(line.number).padStart(3,"0")));
        p.appendChild(make("span","e02-inline-prose",line.text));
        sec.appendChild(p);
     });
     var bar=make("div","e02-inline-pager");
     if(i>0)bar.appendChild(control("← Previous",sets[i-1].id,"secondary"));
     bar.appendChild(control("↑ Part 3 index","e02-p3-index","secondary"));
     if(i<sets.length-1)bar.appendChild(control("Next →",sets[i+1].id));
     sec.appendChild(bar);
     target.appendChild(sec);
   });
   target.dataset.ready="1";
 }
 window.loadE02Integrated=function(key){
   getData().then(function(data){
      if(key==="story-e02-part2")renderPart2(data);
      else if(key==="story-e02-part3")renderPart3(data);
   }).catch(function(e){
      var target=document.getElementById(key==="story-e02-part2"?"e02-integrated-scene-content":"e02-integrated-part3-content");
      if(target){target.textContent="Unable to load Episode 02 content: "+e.message;}
   });
 };
 document.addEventListener("click",function(e){
   var b=e.target.closest("[data-e02-jump]");
   if(!b)return;
   var id=b.getAttribute("data-e02-jump");
   var target=document.getElementById(id);
   if(target){target.scrollIntoView({block:"start",behavior:"smooth"});b.setAttribute("aria-current","location");}
 });
})();
