'use strict';
const $=id=>document.getElementById(id);
const state={manifest:null,pairs:null,pairItems:[],mode:'pairs',packs:new Map(),pack:null,items:[],page:0,pageSize:35,selected:null,notes:{},loadSequence:0};
const STORAGE='dhika-female-action-review-v1';
function node(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function badge(text,cls=''){return node('span',text,'badge '+cls);}
function pretty(value){return JSON.stringify(value,null,2);}
function display(value){return value===null||value===undefined?'Unresolved':Array.isArray(value)?(value.length?value.map(x=>typeof x==='object'?JSON.stringify(x):x).join(', '):'Unresolved'):typeof value==='object'?pretty(value):String(value);}
async function json(url){const response=await fetch(url);if(!response.ok)throw new Error('Could not load '+url+' ('+response.status+')');return response.json();}
function nameOf(id){return state.pairs.characters.find(c=>c.id===id)?.name||id||'Not established';}
function names(ids){return ids?.length?ids.map(nameOf).join(' + '):'Not established';}
const actionLabels={gaze_at_dhika:'Looked at Dhika',pinch_waist:'Pinched the waist',handle_dhika_bra:'Handled Dhika’s bra',imagine_dhika_body:'Imagined Dhika’s body',sniff_dhika_bra:'Sniffed Dhika’s bra',drop_dhika_bra:'Dropped Dhika’s bra',see_exposed_hip:'Saw the exposed hip',see_dhika_walking:'Watched Dhika walking',look_at_dhika:'Looked at Dhika',want_to_sit_close:'Wanted to sit close',permit_holding_for_balance:'Allowed holding for balance',put_hands_around_hip:'Put hands around the hip',hold_stomach:'Held the stomach',intend_shoulder_support:'Intended shoulder support',tap_stomach:'Tapped the stomach',rub_bare_hip:'Rubbed the bare hip',bend_to_hand_glass:'Bent down to hand over a glass',question_possible_viewing:'Wondered what the other person saw',say_kisses_on_phone:'Said “kisses” over the phone',want_to_test_viewing:'Wanted to find out whether he would look',notice_absent_dupatta:'Noticed the missing dupatta',see_partial_breast_area:'Saw a partially exposed breast area',look_toward_chotu:'Looked toward Chotu',make_eye_contact:'Made eye contact'};
const categoryLabels={contact:'Physical action',observation:'Looking / observing',thought:'Thought / intention',object:'Garment / object',dialogue:'Spoken / instructed'};
const realityLabels={actual:'Actually happened',imagined:'Imagined · not performed',intended:'Intended · not performed here',hypothetical:'Hypothetical · not confirmed',uncertain_perception:'Uncertain viewing · not confirmed',remembered:'Remembered · not a new event',instruction:'Instruction · not proof of contact',historical_habit:'Habitual description · not one new encounter'};
function formatBody(parts){return parts.length?parts.map(p=>nameOf(p.owner_id)+' · '+p.part).join('; '):'Not specified';}
function formatClothing(states){const entries=Object.entries(states);return entries.length?entries.map(([id,s])=>nameOf(id)+': '+s.description).join('; '):'Not specified for this action';}
function pairKey(a,b){return [a,b].sort().join('__');}
function renderPairs(){
  if(!state.pairs)return;
  const a=$('characterA').value,b=$('characterB').value,ep=$('pairEpisode').value,cat=$('pairCategory').value,q=$('pairSearch').value.toLowerCase().trim();
  $('pairTitle').textContent=nameOf(a)+' ↔ '+nameOf(b);
  if(a===b){state.pairItems=[];$('pairScope').textContent='Choose two different characters.';$('pairResults').replaceChildren(node('div','Pick a different second character to see interactions between them.','empty'));$('downloadPair').disabled=true;return;}
  let events=state.pairs.events.filter(e=>e.pair_keys.includes(pairKey(a,b)));
  if(ep!=='ALL')events=events.filter(e=>e.episode_id===ep);
  if(cat!=='ALL')events=events.filter(e=>e.interaction_category===cat);
  if(q)events=events.filter(e=>([actionLabels[e.action]||e.action,e.source.quote,formatBody(e.body_parts_involved),e.reality_status,...e.event_state].join(' ')).toLowerCase().includes(q));
  events.sort((x,y)=>x.source.global_line-y.source.global_line||x.source.start-y.source.start);
  state.pairItems=events;$('downloadPair').disabled=!events.length;
  $('pairScope').textContent=events.length+' checked interaction'+(events.length===1?'':'s')+' · '+(ep==='ALL'?'All episodes selected':ep)+' · full story verification pending';
  const frag=document.createDocumentFragment();let lastEpisode;
  if(!events.length){const empty=node('div',undefined,'pair-empty');empty.append(node('h3','No checked actions available for this selection yet'),node('p','This is not evidence that '+nameOf(a)+' and '+nameOf(b)+' never interact. The current checked pair records cover E01 spans; the rest of the story is still awaiting verification.'));if(q||cat!=='ALL'||ep!=='ALL')empty.append(node('p','The episode, category, or search filter may also exclude available checked actions.'));frag.append(empty);}
  for(const e of events){
    if(lastEpisode!==e.episode_id){frag.append(node('h3','Episode '+Number(e.episode_id.slice(1)),'episode-divider'));lastEpisode=e.episode_id;}
    const card=node('article',undefined,'action-card');
    const top=node('div',undefined,'action-card-top');top.append(badge(realityLabels[e.reality_status]||e.reality_status,e.action_type===1?'pending':'checked'),badge(categoryLabels[e.interaction_category]));if(e.group_event_id)top.append(badge('Part of a group scene'));card.append(top);
    card.append(node('h3',actionLabels[e.action]||e.action.replaceAll('_',' '),'action-title'));
    card.append(node('p',names(e.actor_ids)+' → '+names(e.recipient_ids),'action-direction'));
    const dl=node('dl');field(dl,'Initiated by',names(e.initiated_by));field(dl,'Body part',formatBody(e.body_parts_involved));field(dl,'Clothing',formatClothing(e.clothing_state_by_character));field(dl,'Contact',({through_clothing:'Through clothing',direct_skin:'Direct skin contact',no_contact:'No physical contact',garment_object:'Garment / object only',unknown:'Not specified'})[e.contact_layer]||e.contact_layer);field(dl,'Response / state',e.event_state.length?e.event_state.join(', '):'Not specified');card.append(dl);
    if(e.interaction_category==='object')card.append(node('p','The action involves the character’s garment. It does not establish that both characters were physically together.','note-text'));
    if(e.ambiguity_notes.length)card.append(node('p',e.ambiguity_notes.join(' '),'note-text'));
    const evidence=node('details',undefined,'evidence-disclosure');evidence.append(node('summary','Evidence · '+e.episode_id+' · source line '+e.source.global_line));
    for(const r of e.evidence_lines){const row=node('div',undefined,'source-line'+(r.global_line===e.source.global_line?' focus':''));row.append(node('span','L'+r.global_line,'number'),node('div',r.text,'raw'));evidence.append(row);}
    const link=node('a','Open original source ↗');link.href='https://github.com/'+state.pairs.repository+'/blob/'+state.pairs.source_commit_sha+'/'+state.pairs.source_path+'#L'+e.source.global_line;link.target='_blank';link.rel='noopener';evidence.append(link);
    const raw=node('details');raw.append(node('summary','Technical JSON'),node('pre',pretty(e)));evidence.append(raw);card.append(evidence);frag.append(card);
  }
  $('pairResults').replaceChildren(frag);
}
async function setMode(mode){
  state.mode=mode;const pairs=mode==='pairs';$('pairReview').hidden=!pairs;$('sourceReview').hidden=pairs;$('scopeHelp').hidden=pairs;
  for(const [id,active]of [['pairMode',pairs],['sourceMode',!pairs]]){$(id).classList.toggle('active',active);$(id).setAttribute('aria-pressed',String(active));}
  $('scope').textContent=pairs?'Checked interactions currently come from E01 spans. The 69-episode source is preserved, but the full action list is not yet verified.':state.manifest.status_note;
  if(pairs){renderPairs();notify('Choose two characters to browse their checked actions.');}else if(!state.pack)await loadEpisode($('episode').value);
}
function saveFile(name,value){const blob=new Blob([pretty(value)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),a=node('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function notify(message){$('status').textContent=message;}
function noteFor(key){return state.notes[key]||{};}
function markStatus(item){return noteFor(item.event_id||item.line_id).status||item.review_status;}
async function loadEpisode(id){const seq=++state.loadSequence;notify('Loading '+id+'…');$('downloadEpisode').disabled=true;const entry=state.manifest.episodes.find(e=>e.episode_id===id);let pack=state.packs.get(id);if(!pack){pack=await json('./'+entry.file);state.packs.set(id,pack);}if(seq!==state.loadSequence)return;state.pack=pack;$('downloadEpisode').disabled=false;state.selected=null;state.page=0;filter();notify(id+' · '+pack.source_line_count.toLocaleString()+' preserved source segments · semantic review pending');$('detailTitle').textContent='Select a source line or event';$('detail').replaceChildren(node('div','Every source line remains available, including lines with no keyword matches.','empty'));}
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
    [state.manifest,state.pairs]=await Promise.all([json('./data/female_action_review/manifest.json'),json('./data/action_pair_index.json')]);const m=state.manifest;
    if(state.pairs.source_sha256!==m.source.sha256)throw Error('Pair index does not match the current source.');
    for(const person of state.pairs.characters){for(const id of ['characterA','characterB']){const o=node('option',person.name);o.value=person.id;$(id).append(o);}}
    $('characterA').value='dhika';$('characterB').value='uncle';
    for(const e of m.episodes){const o=node('option','Episode '+Number(e.episode_id.slice(1)));o.value=e.episode_id;$('pairEpisode').append(o);}
    for(const id of ['characterA','characterB','pairEpisode','pairCategory'])$(id).addEventListener('change',renderPairs);$('pairSearch').addEventListener('input',renderPairs);
    $('pairMode').addEventListener('click',()=>setMode('pairs').catch(e=>notify(e.message)));$('sourceMode').addEventListener('click',()=>setMode('source').catch(e=>notify(e.message)));
    $('downloadPair').addEventListener('click',()=>saveFile('actions-'+$('characterA').value+'-'+$('characterB').value+'.json',{source_sha256:state.pairs.source_sha256,selected_characters:[$('characterA').value,$('characterB').value],episode_filter:$('pairEpisode').value,category_filter:$('pairCategory').value,scope:state.pairs.scope,events:state.pairItems}));
    for(const e of m.episodes){const o=node('option',e.episode_id+' · '+e.source_line_count+' segments');o.value=e.episode_id;$('episode').append(o);}
    for(const [value,label]of [[m.source.episode_count,'Episodes preserved'],[m.source.lf_delimited_segments.toLocaleString(),'Source segments · 0 missing'],[m.coverage.checked_events,'Checked event spans · E01'],[state.pairs.events.length,'Checked pair interactions']]){const card=node('div',undefined,'stat');card.append(node('strong',value),node('span',label));$('stats').append(card);}
    $('integrity').textContent='Source SHA-256: '+m.source.sha256;
    $('episode').addEventListener('change',()=>loadEpisode($('episode').value).catch(e=>notify(e.message)));
    for(const id of ['view','female'])$(id).addEventListener('change',filter);$('search').addEventListener('input',filter);
    $('previousPage').addEventListener('click',()=>{state.page--;renderList();});$('nextPage').addEventListener('click',()=>{state.page++;renderList();});
    $('jump').addEventListener('keydown',e=>{if(e.key==='Enter')jump().catch(e=>notify(e.message));});
    $('downloadEpisode').addEventListener('click',()=>saveFile(state.pack.episode_id.toLowerCase()+'-female-action-review.json',state.pack));$('downloadAll').addEventListener('click',downloadAll);
    $('exportReview').addEventListener('click',()=>saveFile('dhika-review-notes.json',{schema_version:'female-action-review-notes-1.0',source_sha256:m.source.sha256,notes:state.notes}));
    $('importReview').addEventListener('change',async e=>{try{const f=e.target.files[0];if(!f)return;const d=JSON.parse(await f.text());if(d.source_sha256!==m.source.sha256||d.schema_version!=='female-action-review-notes-1.0'||!d.notes||typeof d.notes!=='object'||Array.isArray(d.notes))throw Error('Review notes do not match this source or schema.');for(const [key,n]of Object.entries(d.notes)){if(!/^E\d{2}-(?:L\d{4}(?:-C\d+)?|CHK-\d+)$/.test(key)||!n||typeof n!=='object'||typeof n.notes!=='string')throw Error('Invalid review note record.');}state.notes={...state.notes,...d.notes};localStorage.setItem(STORAGE,JSON.stringify(state.notes));renderList();notify('Imported review notes. Canonical source and dataset unchanged.');}catch(err){notify(err.message);}});
    const params=new URLSearchParams(location.search),requested=params.get('episode');if(m.episodes.some(e=>e.episode_id===requested)){$('episode').value=requested;$('pairEpisode').value=requested;}
    for(const [param,id]of [['a','characterA'],['b','characterB']])if(state.pairs.characters.some(c=>c.id===params.get(param)))$(id).value=params.get(param);
    await setMode(params.get('mode')==='source'?'source':'pairs');
  }catch(e){notify('Review could not load: '+e.message);$('detail').replaceChildren(node('p','Reload or open the repository to inspect the source.','warning'));}
}
init();
