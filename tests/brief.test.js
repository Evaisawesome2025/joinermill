import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBrief, exportBrief, digestText } from '../preview/brief-model.js';
const draft={objective:'Compare two fictional offers.',inputs:'Public sample notes.',deliverable:'One page with source links.',constraints:'No spend or external action.',success:'Every claim names a source.\nA tradeoff is stated.',stopRule:'Stop at a draft for human review.'};
test('six actual fields survive preparation and plain text export, with checks unverified',async()=>{
 const n=normalizeBrief(draft);assert.equal(n.ok,true);assert.deepEqual(n.brief,draft);
 const text=exportBrief(n.brief);for(const [k,v] of Object.entries(draft)){if(k!=='success')assert.ok(text.includes(v));}
 assert.match(text,/\[ \] A tradeoff is stated\./);assert.match(text,/not executed/);assert.equal((await digestText(text)).length,64);
});
test('does not fill missing user choices from a canned example',()=>{
 assert.equal(normalizeBrief({objective:draft.objective}).ok,false);
 assert.equal(normalizeBrief({...draft,success:'x'}).ok,false);
 assert.equal(normalizeBrief({...draft,stopRule:[]} ).ok,false);
});
