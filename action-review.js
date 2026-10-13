'use strict';
const $=id=>document.getElementById(id);
const state={manifest:null,packs:new Map(),pack:null,items:[],page:0,pageSize:35,selected:null,notes:{},loadSequence:0};
const STORAGE='dhika-female-action-review-v1';
function node(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function badge(text,cls=''){return node('span',text,'badge '+cls);}
function pretty(value){return JSON.stringify(value,null,2);}
function display(value){return value===null||value===undefined?'Unresolved':Array.isArray(value)?(value.length?value.map(x=>typeof x==='object'?JSON.stringify(x):x).join(', '):'Unresolved'):typeof value==='object'?pretty(value):String(value);}
async function json(url){const response=await fetch(url);if(!response.ok)throw new Error('Could not load '+url+' ('+response.status+')');return response.json();}
function saveFile(name,value){const blob=new Blob([pretty(value)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),a=node('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function notify(message){$('status').textContent=message;}
function noteFor(key){return state.notes[key]||{};}
function markStatus(item){return noteFor(item.event_id||item.line_id).status||item.review_status;}
async function loadEpisode(id){const seq=++state.loadSequence;notify('Loading '+id+'…');const entry=state.manifest.episodes.find(e=>e.episode_id===id);let pack=state.packs.get(id);if(!pack){pack=await json('./'+entry.file);state.packs.set(id,pack);}if(seq!==state.loadSequence)return;state.pack=pack;state.selected=null;state.page=0;filter();notify(id+' · '+pack.source_line_count.toLocaleString()+' preserved source segments · semantic review pending');$('detailTitle').textContent='Select a source line or event';$('detail').replaceChildren(node('div','Every source line remains available, including lines with no keyword matches.','empty'));}
function filter(){
  if(!state.pack)return;
  const view=$('view').value,female=$('female').value,q=$('search').value.toLowerCase().trim();
  const rows=new Map(state.pack.lines.map(l=>[l.global_line,l]));
  let items=view==='lines'?state.pack.lines:state.pack.events.filter(e=>view==='checked'?e.record_kind==='checked_event':view==='candidates'?e.record_kind==='lexical_candidate':true);
  if(female)items=items.filter(i=>view==='lines'?(i.female_mentions.includes(female)||i.event_ids.some(id=>state.pack.events.find(e=>e.event_id===id)?.female_centres.includes(female))):i.female_centres.includes(female));
  if(q)items=items.filter(i=>JSON.stringify(i).toLowerCase().includes(q)||(i.source&&rows.get(i.source.global_line).text.toLowerCase().includes(q)));
  state.items=items;state.page=0;renderList();
}
function renderList(){
  const total=state.items.length,pages=Math.max(1,Math.ceil(total/state.pageSize));state.page=Math.min(state.page,pages-1);
  $('listTitle').textContent=$('view').selectedOptions[0].textContent;
  $('count').textContent=total.toLocaleString()+' records';$('pageInfo').textContent=(state.page+1)+' / '+pages;
  $('previousPage').disabled=state.page===0;$('nextPage').disabled=state.page+1>=pages;
  const frag=document.createDocumentFragment();
  for(const item of state.items.slice(state.page*state.pageSize,(state.page+1)*state.pageSize)){
    const isLine='text'in item,key=isLine?item.line_id:item.event_id;
    const b=node('button',undefined,'record'+(state.selected===key?' selected':''));b.type='button';
    b.append(node('div',key+' · master L'+(isLine?item.global_line:item.source.global_line),'label'));
    b.append(badge(isLine?markStatus(item):item.review_status,item.record_kind==='checked_event'?'checked':'pending'));
    if(!isLine)b.append(badge(item.female_centres.length?item.female_centres.join(' + '):'Female centre unresolved'));
    b.append(node('span',isLine?(item.text||'[empty source segment]'):item.action||('Candidate: '+item.cues.action_family+' · '+item.source.quote),'excerpt'));
    b.addEventListener('click',()=>inspect(item));frag.append(b);
  }
  if(!total)frag.append(node('div',$('female').value?'No checked female-centred records match this filter. Candidates are intentionally not assigned by name co-occurrence.':'No matching records.','empty'));
  $('list').replaceChildren(frag);
}
function field(dl,label,value){dl.append(node('dt',label),node('dd',display(value)));}
function sourceWindow(target,ev){
  const box=document.createElement('div');
  const indices=new Set();
  for(let n=target-3;n<=target+3;n++)indices.add(n);
  (ev?.context_global_lines||[]).forEach(n=>indices.add(n));
  for(const r of state.pack.lines.filter(l=>indices.has(l.global_line))){
    const row=node('div',undefined,'source-line'+(r.global_line===target?' focus':''));row.append(node('span','L'+r.global_line+' / '+r.episode_line,'number'));
    const t=node('div',undefined,'raw');
    if(ev&&r.global_line===target){const chars=Array.from(r.text);t.append(document.createTextNode(chars.slice(0,ev.source.start).join('')),node('mark',chars.slice(ev.source.start,ev.source.end).join('')),document.createTextNode(chars.slice(ev.source.end).join('')));}
    else t.textContent=r.text||'[empty source segment]';row.append(t);box.append(row);
  }return box;
}
function reviewEditor(key,item){
  const box=document.createElement('div');box.append(node('h3','Your review notes'));
  const select=node('select');select.setAttribute('aria-label','Local review status');
  for(const [value,text] of [['','No local status'],['reviewed','Reviewed against source'],['needs_correction','Needs correction'],['no_event_confirmed','No relevant event after review']]){const o=node('option',text);o.value=value;select.append(o);}select.value=noteFor(key).status||'';
  const area=node('textarea');area.setAttribute('aria-label','Review notes');area.placeholder='Record missing actions, role corrections, uncertainty, or group details. Exact source is unchanged.';area.value=noteFor(key).notes||'';
  const save=node('button','Save note in this browser');save.type='button';
  save.addEventListener('click',()=>{try{state.notes[key]={status:select.value,notes:area.value,source_sha256:state.manifest.source.sha256,updated_at:new Date().toISOString()};localStorage.setItem(STORAGE,JSON.stringify(state.notes));notify('Saved local review note for '+key+'. Export notes to retain or share them.');renderList();}catch(e){notify('Could not save review note: '+e.message);}});
  box.append(select,area,node('div','Local review marks do not promote machine candidates into verified dataset events.','note-text'),save);return box;
}
function inspect(item){
  const isLine='text'in item,key=isLine?item.line_id:item.event_id;state.selected=key;renderList();
  const target=isLine?item.global_line:item.source.global_line;const wrap=document.createElement('div');
  $('detailTitle').textContent=key;$('githubSource').href='https://github.com/'+state.manifest.source.repository+'/blob/'+state.manifest.source.git_commit_sha+'/'+state.manifest.source.path+'#L'+target;
  if(!isLine){
    wrap.append(badge(item.record_kind==='checked_event'?'Checked source span':'Unverified keyword candidate',item.record_kind==='checked_event'?'checked':'pending'));
    const dl=document.createElement('dl');for(const [label,f]of [['Female centre','female_centres'],['Characters involved','characters_involved'],['Actor','actor_ids'],['Recipient','recipient_ids'],['Observers','observer_ids'],['Initiated by','initiated_by'],['Action','action'],['Action type (1/2)','action_type'],['Reality','reality_status'],['Event state','event_state'],['Body parts / owners','body_parts_involved'],['Clothing per person','clothing_state_by_character'],['Contact layer','contact_layer'],['Intent','intent'],['Consent','consent'],['Group ID','group_event_id'],['Previous by female','previous_event_by_female']])field(dl,label,item[f]);wrap.append(dl);
    for(const text of item.ambiguity_notes||[])wrap.append(node('p',text,'warning'));
  }else{
    wrap.append(badge(item.review_status,'pending'),node('p',item.event_ids.length+' linked records. These may include unverified candidates.','note-text'));
    for(const id of item.event_ids){const ev=state.pack.events.find(e=>e.event_id===id);if(!ev)continue;const b=node('button',(ev.record_kind==='checked_event'?'✓ ':'? ')+(ev.action||ev.cues.action_family)+' · '+id);b.addEventListener('click',()=>inspect(ev));const row=node('div',undefined,'note-row');row.append(b);wrap.append(row);}
  }
  wrap.append(node('h3','Original evidence · verbatim'),sourceWindow(target,isLine?null:item));
  const details=node('details'),summary=node('summary','Inspect JSON');details.append(summary,node('pre',pretty(item)));wrap.append(details,reviewEditor(key,item));$('detail').replaceChildren(wrap);
}
async function downloadAll(){const b=$('downloadAll');b.disabled=true;try{const packs=[];for(const e of state.manifest.episodes){let p=state.packs.get(e.episode_id);if(!p){p=await json('./'+e.file);state.packs.set(e.episode_id,p);}packs.push(p);notify('Preparing download: '+packs.length+' / 69 episodes');}saveFile('dhika-female-action-review-e01-e69.json',{manifest:state.manifest,episodes:packs});notify('Downloaded all 69 source ledgers and event records. Semantic review remains incomplete.');}catch(e){notify(e.message);}finally{b.disabled=false;}}
async function jump(){const n=Number($('jump').value);if(!Number.isInteger(n)||n<1)return;const e=state.manifest.episodes.find(x=>n>=x.global_line_start&&n<=x.global_line_end);if(!e){notify('That master line is outside episode content; the two preamble lines are retained in the manifest.');return;}$('episode').value=e.episode_id;$('view').value='lines';$('female').value='';$('search').value='';await loadEpisode(e.episode_id);const row=state.pack.lines.find(r=>r.global_line===n);state.page=Math.floor(state.pack.lines.indexOf(row)/state.pageSize);renderList();inspect(row);}
async function init(){
  try{
    try{state.notes=JSON.parse(localStorage.getItem(STORAGE)||'{}');}catch{state.notes={};}
    state.manifest=await json('./data/female_action_review/manifest.json');const m=state.manifest;
    $('scope').textContent=m.status_note;
    for(const e of m.episodes){const o=node('option',e.episode_id+' · '+e.source_line_count+' segments');o.value=e.episode_id;$('episode').append(o);}
    for(const [value,label]of [[m.source.episode_count,'Episodes preserved'],[m.source.lf_delimited_segments.toLocaleString(),'Source segments · 0 missing'],[m.coverage.checked_events,'Checked event spans · E01'],[m.coverage.lexical_candidates.toLocaleString(),'Unverified keyword candidates']]){const card=node('div',undefined,'stat');card.append(node('strong',value),node('span',label));$('stats').append(card);}
    $('integrity').textContent='Source SHA-256: '+m.source.sha256;
    $('episode').addEventListener('change',()=>loadEpisode($('episode').value).catch(e=>notify(e.message)));
    for(const id of ['view','female'])$(id).addEventListener('change',filter);$('search').addEventListener('input',filter);
    $('previousPage').addEventListener('click',()=>{state.page--;renderList();});$('nextPage').addEventListener('click',()=>{state.page++;renderList();});
    $('jump').addEventListener('keydown',e=>{if(e.key==='Enter')jump().catch(e=>notify(e.message));});
    $('downloadEpisode').addEventListener('click',()=>saveFile(state.pack.episode_id.toLowerCase()+'-female-action-review.json',state.pack));$('downloadAll').addEventListener('click',downloadAll);
    $('exportReview').addEventListener('click',()=>saveFile('dhika-review-notes.json',{schema_version:'female-action-review-notes-1.0',source_sha256:m.source.sha256,notes:state.notes}));
    $('importReview').addEventListener('change',async e=>{try{const f=e.target.files[0];if(!f)return;const d=JSON.parse(await f.text());if(d.source_sha256!==m.source.sha256||d.schema_version!=='female-action-review-notes-1.0'||!d.notes||typeof d.notes!=='object'||Array.isArray(d.notes))throw Error('Review notes do not match this source or schema.');for(const [key,n]of Object.entries(d.notes)){if(!/^E\d{2}-(?:L\d{4}(?:-C\d+)?|CHK-\d+)$/.test(key)||!n||typeof n!=='object'||typeof n.notes!=='string')throw Error('Invalid review note record.');}state.notes={...state.notes,...d.notes};localStorage.setItem(STORAGE,JSON.stringify(state.notes));renderList();notify('Imported review notes. Canonical source and dataset unchanged.');}catch(err){notify(err.message);}});
    const requested=new URLSearchParams(location.search).get('episode');if(m.episodes.some(e=>e.episode_id===requested))$('episode').value=requested;
    await loadEpisode($('episode').value);
  }catch(e){notify('Review could not load: '+e.message);$('detail').replaceChildren(node('p','Reload or open the repository to inspect the source.','warning'));}
}
init();
