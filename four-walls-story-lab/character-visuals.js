(function(){
  'use strict';
  var root=document.querySelector('[data-view="story-visuals"]');
  if(!root)return;
  var portraits=[],active=0,opener=null;
  var dialog=document.getElementById('portrait-dialog');
  var image=dialog.querySelector('[data-large-portrait]');
  var heading=dialog.querySelector('[data-portrait-heading]');
  var position=dialog.querySelector('[data-portrait-position]');
  var download=dialog.querySelector('[data-portrait-download]');
  var source=dialog.querySelector('[data-portrait-source]');
  function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
  function showPortrait(index){
    active=(index+portraits.length)%portraits.length;
    var p=portraits[active];
    image.src=p.image;image.alt=p.name+' — original Midnight Bet character reference';
    heading.textContent=p.name;position.textContent=(active+1)+' / '+portraits.length;
    download.href=p.image;download.download=p.filename;
    source.href=p.sourceUrl;
  }
  function openPortrait(index,button){opener=button;showPortrait(index);dialog.showModal();}
  function closePortrait(){dialog.close();}
  dialog.querySelector('[data-close-portrait]').addEventListener('click',closePortrait);
  dialog.querySelector('[data-prev-portrait]').addEventListener('click',function(){showPortrait(active-1);});
  dialog.querySelector('[data-next-portrait]').addEventListener('click',function(){showPortrait(active+1);});
  dialog.addEventListener('close',function(){if(opener)opener.focus();});
  dialog.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'){e.preventDefault();showPortrait(active-1);}if(e.key==='ArrowRight'){e.preventDefault();showPortrait(active+1);}});
  dialog.addEventListener('click',function(e){if(e.target===dialog){var r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closePortrait();}});
  var tabs=Array.from(root.querySelectorAll('[role="tab"]'));
  function chooseTab(tab){tabs.forEach(function(b){var on=b===tab;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;document.getElementById(b.getAttribute('aria-controls')).hidden=!on;});}
  tabs.forEach(function(tab,i){tab.addEventListener('click',function(){chooseTab(tab);});tab.addEventListener('keydown',function(e){var n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();chooseTab(tabs[n]);tabs[n].focus();});});
  function personButton(p){var button=el('button','visual-person');button.type='button';button.dataset.go='story-characters';button.dataset.person=String(p.id);button.setAttribute('aria-label','Open profile for '+p.name);button.append(el('span','visual-initials',p.initials));var text=el('span');text.append(el('strong','',p.name+', '+p.age),el('small','',p.role));button.append(text);return button;}
  fetch('character-visuals.json').then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}).then(function(data){
    portraits=data.portraits;
    var gallery=root.querySelector('[data-portrait-grid]');gallery.textContent='';
    portraits.forEach(function(p,i){
      var card=el('article','portrait-card');var button=el('button','portrait-open');button.type='button';button.setAttribute('aria-label','View '+p.name+' portrait');
      var img=el('img');img.src=p.image;img.alt=p.name+' — Midnight Bet reference';img.width=p.width;img.height=p.height;img.loading=i<3?'eager':'lazy';img.decoding='async';
      img.addEventListener('error',function(){var replacement=el('span','image-missing','Portrait unavailable — use the source link below.');img.replaceWith(replacement);});
      var caption=el('div','portrait-caption');caption.append(el('small','','MIDNIGHT BET · '+String(i+1).padStart(2,'0')),el('h2','',p.name),el('span','','View full portrait ↗'));
      button.append(img,caption);button.addEventListener('click',function(){openPortrait(i,button);});
      var link=el('a','portrait-source','View original file ↗');link.href=p.sourceUrl;link.target='_blank';link.rel='noopener';card.append(button,link);gallery.append(card);
    });
    root.querySelector('[data-portrait-count]').textContent=String(portraits.length);
    var byId=new Map(data.currentCast.map(function(p){return [p.id,p];}));var families=root.querySelector('[data-family-grid]');families.textContent='';
    data.families.forEach(function(f){var card=el('article','cast-family');card.append(el('h2','',f.label),personButton(byId.get(f.members[0])),el('div','family-connector','Married couple'),personButton(byId.get(f.members[1])),el('p','family-detail',f.detail));families.append(card);});
    var roster=root.querySelector('[data-supporting-roster]');roster.textContent='';data.currentCast.filter(function(p){return p.id>=8;}).forEach(function(p){roster.append(personButton(p));});
    root.querySelector('[data-current-count]').textContent=String(data.currentCast.length);
  }).catch(function(error){root.querySelector('[data-portrait-grid]').replaceChildren(el('p','visual-error','Unable to load the visual cast. Reload this page to try again.'));console.error('Character visuals:',error);});
})();
