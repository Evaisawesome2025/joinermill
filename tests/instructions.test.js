import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInstructions, encodeInstructions, decodeInstructions, startFromInstructions, validateDirections, saveInstructions, readInstructions, removeInstructions, INSTRUCTIONS_KEY, MAX_INSTRUCTIONS_BYTES } from '../preview/instructions.js';
import { emptyResult } from '../preview/result-review.js';
import { encodeSnapshot, decodeSnapshot, exportPlan, STORAGE_KEY } from '../preview/work-plan.js';
const brief = { objective:'Compare two fictional repair offers.', inputs:'Public samples A and B.', deliverable:'A short comparison.', constraints:'No outreach or spending.', success:'Name one source per claim.', stopRule:'Stop after one draft for review.' };
const directions = { title:'Offer review method', owner:'Business owner', blocker:'Ask for both samples before beginning.', handoff:'Give the comparison to the owner for review.' };
const def = () => createInstructions(brief, directions);
const plan = {nextAction:'', unresolvedInputs:''};
const stamp = '2026-10-06T02:00:00.000Z';
test('instructions roundtrip normalizes only definition fields and keeps literal text', () => {
 const value=createInstructions({...brief,objective:'  '+brief.objective+'  '},{...directions,handoff:'<script>literal instructions</script>'});
 const copy=decodeInstructions(encodeInstructions(value));assert.equal(copy.brief.objective,brief.objective);assert.equal(copy.directions.handoff,'<script>literal instructions</script>');assert.deepEqual(Object.keys(copy),['kind','version','brief','directions']);
});
test('definition schema refuses full work, extras, inherited result claims, unsafe types and byte excess', () => {
 for(const raw of ['{','null','[]','x'.repeat(MAX_INSTRUCTIONS_BYTES+1),'雪'.repeat(MAX_INSTRUCTIONS_BYTES/2),encodeSnapshot(brief,plan),JSON.stringify({...def(),version:2}),JSON.stringify({...def(),result:emptyResult()}),JSON.stringify({...def(),kind:['joinermill.work-instructions']})])assert.throws(()=>decodeInstructions(raw));
 for(const x of [null,[],{}, {...directions,extra:'x'}, {...directions,owner:123}, {...directions,handoff:'x'.repeat(1001)}, {...directions,title:'  '}, {...directions,blocker:'bad\0text'}]){assert.equal(validateDirections(x),false);assert.throws(()=>createInstructions(brief,x));}
 assert.throws(()=>createInstructions({...brief,success:''},directions));assert.throws(()=>decodeInstructions(JSON.stringify({...def(),brief:{...brief,extra:'x'}})));
});
test('repeated starts create independent clean result and directions objects with no execution metadata', () => {
 const source=def(), a=startFromInstructions(source), b=startFromInstructions(source);
 assert.deepEqual(a,{draft:brief,directions,plan,result:emptyResult()});assert.notEqual(a.result,b.result);assert.notEqual(a.draft,b.draft);assert.notEqual(a.directions,b.directions);
 a.result.text='Prior result';a.result.decision='accepted';a.directions.owner='Other owner';a.draft.objective='Changed objective';
 assert.deepEqual(b.result,emptyResult());assert.deepEqual(source,def());assert.deepEqual(b,startFromInstructions(source));
});
test('new active backup preserves directions while legacy versions default null without altering results', () => {
 const result={...emptyResult(),text:'Existing draft result',provenance:'Written by the owner.'};
 const raw=encodeSnapshot(brief,plan,stamp,result,directions);const copy=decodeSnapshot(raw);assert.equal(copy.version,3);assert.deepEqual(copy.directions,directions);assert.deepEqual(copy.result,result);
 for(const version of [1,2]){const legacy={version,savedAt:stamp,draft:brief,plan,...(version===2?{result}:{})};const migrated=decodeSnapshot(JSON.stringify(legacy));assert.equal(migrated.directions,null);assert.deepEqual(migrated.result,version===2?result:emptyResult());assert.equal(migrated.version,version);}
 for(const patch of [{directions:{}},{directions:[]},{directions:{...directions,extra:'x'}},{directions:{...directions,owner:null}},{kind:'joinermill.work-instructions'}])assert.throws(()=>decodeSnapshot(JSON.stringify({...copy,...patch})));
 assert.throws(()=>decodeSnapshot(encodeInstructions(def())));assert.throws(()=>decodeSnapshot(JSON.stringify({version:2,savedAt:stamp,draft:brief,plan,result,directions})));
});
test('directions export remains owner-written context and does not claim verified responsibility', () => {
 const text=exportPlan(brief,plan,emptyResult(),directions);for(const value of Object.values(directions))assert.ok(text.includes(value));assert.match(text,/No assignment, scheduling, notification or authenticated identity/);assert.match(text,/not an enforced gate/);assert.match(text,/acceptance covers the captured six-field brief, not these contextual labels/);assert.match(text,/not sent with the optional six-field/);
});
test('separate explicit instructions save and removal preserve active work and unrelated storage', () => {
 const data=new Map([[STORAGE_KEY,'active backup'],['unrelated','keep']]);let writes=0;
 const storage={getItem:k=>data.get(k)??null,setItem(k,v){writes++;data.set(k,v)},removeItem:k=>data.delete(k)};
 assert.equal(readInstructions(storage),null);assert.equal(writes,0);saveInstructions(storage,def());assert.equal(writes,1);assert.deepEqual(readInstructions(storage),def());assert.equal(data.get(STORAGE_KEY),'active backup');removeInstructions(storage);assert.equal(data.has(INSTRUCTIONS_KEY),false);assert.equal(data.get(STORAGE_KEY),'active backup');assert.equal(data.get('unrelated'),'keep');
});
test('corrupt, blocked, quota and silent failed instructions storage operations are reported', () => {
 assert.throws(()=>readInstructions({getItem(){return '{bad'}}));assert.throws(()=>readInstructions({getItem(){throw Error('blocked')}}));assert.throws(()=>saveInstructions({setItem(){throw Error('quota')}},def()));assert.throws(()=>saveInstructions({setItem(){},getItem(){return null}},def()));assert.throws(()=>removeInstructions({removeItem(){},getItem(){return 'retained'}}));
});
