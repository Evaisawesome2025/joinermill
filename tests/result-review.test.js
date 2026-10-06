import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyResult, validateResult, editResult, recordResult, reviewResult, exportResult } from '../preview/result-review.js';
import { encodeSnapshot, decodeSnapshot, exportPlan, saveDraft, readSaved, STORAGE_KEY, MAX_SNAPSHOT_BYTES } from '../preview/work-plan.js';
const brief = { objective:'Compare two fictional repair offers.',inputs:'Public samples A and B.',deliverable:'A one-page comparison with one recommended headline.',constraints:'No spending or outreach.',success:'Each claim cites a source.\nName one tradeoff.',stopRule:'Stop after the draft for owner review.' };
const notes={nextAction:'Review draft B.',unresolvedInputs:''};
const first='2026-10-06T01:00:00.000Z',second='2026-10-06T01:01:00.000Z';
const draft=()=>({...emptyResult(),text:'Offer B explains its scope clearly. Offer A is shorter but leaves the time unspecified.',provenance:'Written by me from sample A and B, comparison-v1.txt.'});
const recorded=()=>recordResult(draft(),brief,first);
const accepted=()=>reviewResult(editResult(recorded(),'feedback','The comparison cites both samples and states the tradeoff.'),'accepted',second);
test('record captures canonical original brief and repeated record is idempotent',()=>{
 const record=recorded();assert.deepEqual(record.baseline,brief);assert.equal(record.recordedAt,first);assert.equal(record.decision,'unreviewed');assert.equal(recordResult(record,{...brief,deliverable:'Changed target.'},second),record);
 assert.throws(()=>recordResult(emptyResult(),brief));assert.throws(()=>recordResult(draft(),{}));
});
test('owner decision requires actual recorded result, source and explanatory feedback',()=>{
 assert.throws(()=>reviewResult(draft(),'accepted'));assert.throws(()=>reviewResult(recorded(),'accepted'));assert.throws(()=>reviewResult(recorded(),'auto_pass'));
 const record=accepted();assert.equal(record.decision,'accepted');assert.equal(record.reviewedAt,second);assert.equal(reviewResult(record,'accepted',first),record);
 assert.equal(reviewResult(record,'needs_revision',second).decision,'needs_revision');
});
test('result/source edits clear recording and decision, feedback edit clears decision only',()=>{
 for(const key of ['text','provenance','feedback']){const record=accepted();const edited=editResult(record,key,'A changed value.');assert.equal(edited.decision,'unreviewed');assert.equal(edited.reviewedAt,null);assert.deepEqual(edited.baseline,brief);assert.equal(edited.recordedAt,key==='feedback'?first:null);assert.equal(editResult(record,key,record[key]),record);}
 const revised=recordResult(editResult(accepted(),'text','A revised real result.'),{...brief,objective:'An unrelated current brief.'},second);assert.deepEqual(revised.baseline,brief);
});
test('strict result schema rejects forged shapes, impossible states, invalid dates and limits',()=>{
 const record=accepted();for(const patch of [{text:'x'.repeat(8001)},{provenance:'x'.repeat(1001)},{feedback:'x'.repeat(2001)},{text:'a\u0000b'},{baseline:{...brief,extra:'x'}},{baseline:{...brief,objective:123}},{decision:'verified'},{decision:['accepted']},{decision:['unreviewed']},{decision:{}},{decision:1},{decision:null},{decision:true},{recordedAt:null},{reviewedAt:null},{recordedAt:'2026-02-30T01:00:00.000Z'},{decision:'unreviewed',reviewedAt:second},{feedback:' '},{extra:'x'}])assert.equal(validateResult({...record,...patch}),false,JSON.stringify(patch));
 assert.equal(validateResult(null),false);assert.equal(validateResult([]),false);assert.equal(validateResult(emptyResult()),true);
});
test('version3 backup roundtrip preserves literal result, decision and original target exactly',()=>{
 const record={...accepted(),text:'<script>alert(1)</script> & actual result\nLine two.'};const raw=encodeSnapshot(brief,notes,second,record);const restored=decodeSnapshot(raw);assert.equal(restored.version,3);assert.deepEqual(restored.result,record);assert.deepEqual(restored.draft,brief);assert.equal(validateResult(restored.result),true);
});
test('legacy version1 restores empty result without writing or discarding its actual draft',()=>{
 const raw=JSON.stringify({version:1,savedAt:first,draft:brief,plan:notes});const store={getItem:k=>k===STORAGE_KEY?raw:null,setItem(){throw new Error('must not write')}};const data=readSaved(store);assert.deepEqual(data.result,emptyResult());assert.deepEqual(data.draft,brief);assert.equal(data.version,1);assert.equal(store.getItem(STORAGE_KEY),raw);
});
test('backup parser caps bytes before parsing and rejects unknown/inconsistent result schemas',()=>{
 const base=JSON.parse(encodeSnapshot(brief,notes,first,accepted()));for(const raw of ['{bad','雪'.repeat(MAX_SNAPSHOT_BYTES/2),JSON.stringify({...base,version:9}),JSON.stringify({...base,result:{...base.result,decision:'verified'}}),JSON.stringify({...base,extra:true})])assert.throws(()=>decodeSnapshot(raw));
 assert.throws(()=>encodeSnapshot(brief,notes,first,{...accepted(),provenance:null}));
});
test('readable export separates original review target from changed current intent and unverified claims',()=>{
 const changed={...brief,deliverable:'A different output.'};const result=accepted();const text=exportPlan(changed,notes,result);for(const value of [result.text,result.provenance,result.feedback,brief.deliverable,changed.deliverable])assert.ok(text.includes(value));assert.match(text,/Accepted by owner — for the captured brief only/);assert.match(text,/decision does not apply to the current brief/);assert.match(text,/not authenticated/);
 const unrecorded=exportResult(draft(),brief);assert.match(unrecorded,/Result draft; not recorded or reviewed/);assert.match(unrecorded,/No original review target/);
});
test('save verifies the result-inclusive snapshot and reports failed storage without claiming success',()=>{
 let raw=null;const store={setItem(k,v){raw=v},getItem(){return raw}};saveDraft(store,brief,notes,accepted());assert.deepEqual(readSaved(store).result,accepted());assert.throws(()=>saveDraft({setItem(){throw new Error('quota')}},brief,notes,accepted()));
});
