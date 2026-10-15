// Functional regression checks using a minimal DOM fixture. This is not a layout test.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=await fs.readFile(path.join(root,'unified-pair-tracker.html'),'utf8');
const elements=new Map(),buttons=[],checks=[];
class Element {
 constructor(id){this.id=id;this.value='';this.checked=false;this.options=[];this.textContent='';this.hidden=false;this.disabled=false;this.html='';this.dataset={};}
 set innerHTML(s){this.html=s;}
 get innerHTML(){return this.html;}
 insertAdjacentHTML(_position,s){this.html+=s;for(const m of s.matchAll(/<option value="([^"]+)"/g))this.options.push({value:m[1]});if(this.id==='checks')for(const m of s.matchAll(/class="selected-episode" type="checkbox" value="([^"]+)"/g)){const c=new Element('check'+m[1]);c.value=m[1];checks.push(c);}}
 addEventListener(){}
 setAttribute(k,v){this[k]=v;}
 querySelectorAll(){return [];}
}
const el=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id);};
for(const m of html.matchAll(/id="([^"]+)"/g))el(m[1]);
for(const m of html.matchAll(/data-tab="([^"]+)"/g)){const b=new Element('tab-'+m[1]);b.dataset.tab=m[1];buttons.push(b);}
for(const m of html.matchAll(/<select id="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g)){
 const options=[...m[2].matchAll(/<option value="([^"]+)"/g)].map(x=>({value:x[1]}));el(m[1]).options=options;el(m[1]).value=options[0]?.value||'';
}
el('shared').checked=true;
const sandbox={console,URLSearchParams,Blob,URL,location:{search:''},history:{replaceState(){}},document:{getElementById:el,querySelectorAll:s=>s==='[data-tab]'?buttons:s==='.selected-episode'?checks:[]},fetch:async rel=>{const text=await fs.readFile(path.join(root,rel.split('?')[0]),'utf8');return {ok:true,json:async()=>JSON.parse(text),text:async()=>text};}};
vm.createContext(sandbox);
vm.runInContext(await fs.readFile(path.join(root,'unified-pair-tracker.js'),'utf8'),sandbox);
for(let i=0;i<100&&el('status').textContent==='';i++)await new Promise(resolve=>setTimeout(resolve,10));
assert.match(el('status').textContent,/E01–E68 complete source browsing/);
const run=code=>vm.runInContext(code,sandbox);
assert.equal(run('episodes.length'),68);
for(const [e,count] of [[11,5],[12,66],[13,18]])assert.equal(run(`curated.filter(r=>r.episode===${e}).length`),count);

el('episode').value='68';el('scope').value='single';el('pair').value='DY';
run('tab="source";render()');
assert.equal(run('sourceMatches.length'),210);
assert.equal(run('sourceMatches.at(0).n'),13703);
assert.equal(run('sourceMatches.at(-1).n'),13912);
assert.equal(run('sourceShown'),100);
run('renderChunk();renderChunk()');
assert.equal(run('sourceShown'),210);assert.equal(el('more').hidden,true);
el('episode').value='all';run('readerExact()');assert.equal(run('sourceMatches.length'),13910);

el('episode').value='12';el('pair').value='DB';el('shared').checked=false;
assert.equal(run('getFilter().some(r=>r.pair==="TRIO")'),false);
assert.equal(run('readerSelect({episode:12,tracks:["DB","DY","TRIO"]})'),false);
el('shared').checked=true;assert.equal(run('readerSelect({episode:12,tracks:["DB","DY","TRIO"]})'),true);
el('pair').value='TRIO';
assert(run('getFilter().some(r=>r.recordType==="action"&&r.episode===12&&r.pair==="DB")'));
assert(run('getFilter().some(r=>r.recordType==="action"&&r.episode===12&&r.pair==="DY")'));
// A later private Bobby call does not become a trio encounter.
assert.equal(run('relevant({recordType:"action",episode:68,line:13808,pair:"DY"},"TRIO")'),false);
el('pair').value='DY';

el('scope').value='selected';run('selectedEpisodes.clear();selectedEpisodes.add(2);selectedEpisodes.add(68)');
const payload=JSON.parse(run('JSON.stringify(exportPayload())'));
assert.deepEqual(payload.selected_episodes,[2,68]);
assert(payload.records.every(r=>[2,68].includes(r.episode)));
assert(payload.navigation_sections.every(r=>[2,68].includes(r.episode)));
assert.equal(payload.atomic_complete,false);
el('search').value='no-such-source-phrase-8aac';
assert.equal(run('exportPayload().records.length'),0);assert.equal(run('exportPayload().navigation_sections.length'),0);
el('search').value='';

el('scope').value='single';el('episode').value='68';run('readerCumulative()');
assert.match(el('results').innerHTML,/through E68/);
assert.match(el('results').innerHTML,/Later source history through E68/);
el('scope').value='selected';run('selectedEpisodes.clear();tab="episodeMap";render()');
assert.match(el('results').innerHTML,/Select at least one episode/);

console.log('PASS: boot, 68 episodes, restored E11–E13 records, all E68 source lines, source pagination, all-source scope, strict/shared pair attribution, arbitrary episode export, search filtering, E68 cumulative cutoff, empty selections.');
console.log('LIMIT: DOM fixture checks behavior, not browser layout or exhaustive source semantics.');
