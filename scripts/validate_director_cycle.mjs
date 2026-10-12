#!/usr/bin/env node
// Additive integrity checks for the E05 -> E06 controlled Director experiment.
import fs from "node:fs";
import {execFileSync} from "node:child_process";
const read=p=>fs.readFileSync(p,"utf8");
const json=p=>JSON.parse(read(p));
const assert=(ok,m)=>{if(!ok)throw new Error(m);};
const hash=p=>execFileSync("git",["hash-object",p],{encoding:"utf8"}).trim();
const source="raw/Dhika.txt";
const lockedRawSha="590b4dce02db105b1ff150a118d309fcef7778f2";
const lockedPredictionSha="4a15aabf53c3740dd42653202d0cce963d217818";
assert(hash(source)===lockedRawSha,"Canonical raw source changed.");
const raw=read(source);
const heads=[...raw.matchAll(/^EPISODE\s+(\d+)\s*$/gm)];
assert(heads.length===69,"Expected 69 episode headings.");
const part=n=>{
 const a=heads.findIndex(x=>Number(x[1])===n);
 assert(a>=0,"Missing episode "+n);
 return raw.slice(heads[a].index,heads[a+1].index).split(/\r?\n/);
};
const e05=part(5),e06=part(6);
assert(e05.length===233&&e06.length===232,"E05/E06 local line counts differ.");
const checkQuote=(rows,original,getLoc,label)=>{
 for(const r of rows){
  const {line,verbatim,span_start,span_end}=getLoc(r);
  assert(Number.isInteger(line)&&line>=1&&line<=original.length,label+": bad line");
  assert(Number.isInteger(span_start)&&Number.isInteger(span_end),label+": missing offsets");
  assert(original[line-1].slice(span_start,span_end)===verbatim,label+": quote/source offset mismatch");
 }
 console.log("PASS "+label+": "+rows.length+" exact short source anchors");
};
const continuity=json("data/e05_non_graphic_continuity_ledger.json");
const audit=json("data/e06_prediction_audit_non_graphic.json");
const frozenPath="data/e06_director_prediction_frozen_v1.json";
const prediction=json(frozenPath);
assert(hash(frozenPath)===lockedPredictionSha,"Frozen E06 prediction was changed.");
assert(prediction.prediction_status==="FROZEN_HYPOTHESIS_NOT_CANON","Prediction is not clearly frozen.");
assert(prediction.source_cutoff==="E05"&&prediction.e06_original_was_accessed_for_this_blueprint===false,"Blind prediction cutoff was changed.");
assert(prediction.source_evidence_only.every(x=>x!=="E06"),"E06 included as prior evidence.");
assert(audit.freeze_commit==="3db87426f2a36af408b7569f4028bf3c0ef184ab","Audit freeze provenance changed.");
assert(audit.prediction_blob_sha===lockedPredictionSha,"Audit points at a different frozen blob.");
assert(audit.source_blob_sha===lockedRawSha,"Audit source identity mismatch.");
checkQuote(continuity.event_records,e05,r=>r.source_excerpt,"E05 action ledger");
checkQuote(continuity.psychology_checkpoints,e05,r=>({line:r.source_line,verbatim:r.short_verbatim,span_start:r.span_start,span_end:r.span_end}),"E05 psychology");
checkQuote(audit.safe_action_records,e06,r=>r.source,"E06 action audit");
checkQuote(audit.individual_psychology_checkpoints,e06,r=>r.source,"E06 psychology");
checkQuote(audit.new_style_mechanisms,e06,r=>r.source,"E06 style additions");
const verifyCoverage=(windows,n,label)=>{
 const covered=windows.flatMap(x=>Array.from({length:x.source_lines[1]-x.source_lines[0]+1},(_,i)=>x.source_lines[0]+i));
 assert(covered.length===n&&covered.every((v,i)=>v===i+1),label+" scene windows do not cover exactly all source lines");
 console.log("PASS "+label+" scene windows: "+windows.length);
};
verifyCoverage(continuity.scenes,233,"E05");
verifyCoverage(audit.scenes,232,"E06");
const known=new Set(prediction.scenes.map(x=>x.id));
assert(audit.marks.length===known.size,"Audit does not score every frozen scene");
for(const mark of audit.marks)assert(known.delete(mark.predicted_scene),"Unknown/duplicated prediction mark");
assert(!known.size,"Unscored frozen scenes");
for(const status of ["hit","partial","miss"]){
 const field=status==="hit"?"hits":status==="partial"?"partials":"misses";
 assert(audit.counts[field]===audit.marks.filter(x=>x.result===status).length,"Wrong audit "+field);
}
assert(audit.counts.hits===0&&audit.counts.partials===4&&audit.counts.misses===3,"Expected independently counted E06 rubric");
console.log("PASS frozen prediction, provenance, full index coverage, and audit accounting.");
