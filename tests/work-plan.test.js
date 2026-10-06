import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FIELDS } from '../preview/brief-model.js';
import { STORAGE_KEY, MAX_SNAPSHOT_BYTES, validatePlan, encodeSnapshot, decodeSnapshot, exportPlan, readSaved, saveDraft, removeSaved } from '../preview/work-plan.js';
const draft = Object.fromEntries(Object.keys(FIELDS).map(k => [k, '']));
const complete = { objective:'Compare two fictional page drafts.', inputs:'Public example A and B.', deliverable:'A one-page comparison.', constraints:'No spending or outreach.', success:'Each claim cites a source.', stopRule:'Stop after the draft for review.' };
const plan={nextAction:'Ask for the missing source.',unresolvedInputs:'Second draft\nDelivery-time source'};
function memory(){const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};}
test('round-trips partial drafts and local planning notes with exact user text',()=>{
 const x={...draft,objective:'  My unfinished direction  '};const raw=encodeSnapshot(x,plan);const y=decodeSnapshot(raw);assert.deepEqual(y.draft,x);assert.deepEqual(y.plan,plan);assert.equal(y.version,3);
});
test('rejects corrupt JSON, oversized bytes, unknown schemas, extra fields and unsafe types',()=>{
 for(const raw of ['{', 'x'.repeat(MAX_SNAPSHOT_BYTES+1),'"primitive"',JSON.stringify({version:2}),JSON.stringify({...JSON.parse(encodeSnapshot(draft,plan)),unexpected:'x'})])assert.throws(()=>decodeSnapshot(raw));
 const x=JSON.parse(encodeSnapshot(draft,plan));
 for(const value of [null,[],{...draft,objective:123},{...draft,objective:'x'.repeat(601)},{...draft,inputs:'bad\u0000input'},{...draft,unknown:'x'}])assert.throws(()=>decodeSnapshot(JSON.stringify({...x,draft:value})));
 assert.throws(()=>encodeSnapshot(draft,plan,'not-a-date'));
});
test('caps planning text and treats missing notes as unassessed rather than ready',()=>{
 assert.equal(validatePlan({...plan,nextAction:'x'.repeat(601)}).ok,false);assert.equal(validatePlan({...plan,unresolvedInputs:'x'.repeat(1601)}).ok,false);
 assert.equal(validatePlan({...plan,extra:'bad'}).ok,false);
 assert.match(exportPlan(complete,{nextAction:'',unresolvedInputs:''}),/readiness has not been established/);
});
test('export distinguishes incomplete brief, actual user plan and no execution',()=>{
 const text=exportPlan(draft,plan);assert.match(text,/INCOMPLETE BRIEF/);assert.match(text,/not executed/);assert.ok(text.includes(plan.nextAction));assert.ok(text.includes(plan.unresolvedInputs));assert.match(text,/\[Not supplied\]/);
 const full=exportPlan(complete,plan);assert.match(full,/\[ \] Each claim cites a source\./);assert.match(full,/not sent with the optional six-field/);
});
test('storage writes happen only through explicit save and remove preserves unrelated keys',()=>{
 const s=memory();s.setItem('unrelated','keep');assert.equal(readSaved(s),null);const result=saveDraft(s,draft,plan);assert.deepEqual(result,readSaved(s));removeSaved(s);assert.equal(readSaved(s),null);assert.equal(s.getItem('unrelated'),'keep');
});
test('quota, blocked reads, swallowed writes and swallowed deletion are reported',()=>{
 assert.throws(()=>saveDraft({setItem(){throw new Error('quota')}},draft,plan));
 assert.throws(()=>readSaved({getItem(){throw new Error('blocked')}}));
 assert.throws(()=>saveDraft({setItem(){},getItem(){return null}},draft,plan));
 assert.throws(()=>removeSaved({removeItem(){},getItem(){return 'retained'}}));
});
test('literal markup remains data through storage and text export',()=>{
 const x={...complete,inputs:'<img src=x onerror=alert(1)> & literal text'};assert.equal(decodeSnapshot(encodeSnapshot(x,plan)).draft.inputs,x.inputs);assert.ok(exportPlan(x,plan).includes(x.inputs));
});
