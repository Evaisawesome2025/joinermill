const {chromium}=require('playwright');
const {default:AxeBuilder}=require('@axe-core/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const BASE=process.env.BRIEF_TEST_URL||'http://127.0.0.1:8765/',OUT=process.env.BRIEF_TEST_OUTPUT||path.resolve(__dirname,'../test-results');
(async()=>{
 const model=await import('../preview/work-plan.js'),rm=await import('../preview/result-review.js');await fs.mkdir(OUT,{recursive:true});
 const brief={objective:'Review the fictional original comparison.',inputs:'Original synthetic samples.',deliverable:'Original comparison draft.',constraints:'No outreach or spending.',success:'Cite the original source.',stopRule:'Stop for owner review.'};
 const record=(label,draft)=>rm.recordResult({...rm.emptyResult(),text:label+' actual comparison.',provenance:'Owner-created synthetic fixture '+label+'.',feedback:'Feedback for '+label+' only.'},draft,'2026-10-06T01:00:00.000Z');
 const notes={nextAction:'',unresolvedInputs:''};
 const a=model.encodeSnapshot(brief,notes,'2026-10-06T01:01:00.000Z',record('Original',brief));
 const other={...brief,objective:'Review a different fictional project.',deliverable:'Different result not yet reviewed by the owner.'};
 const b=model.encodeSnapshot(other,notes,'2026-10-06T01:02:00.000Z',record('Different',other));
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const results=[],pageErrors=[],unexpected=[];let active;
 const file=async(page,raw,name='backup.json')=>{await page.locator('.transfer-controls').evaluate(e=>e.open=true);await page.locator('#import-backup').setInputFiles({name,mimeType:'application/json',buffer:Buffer.from(raw)})};
 async function fixture({saved=null,width=1440}={}){
  if(active)await active.close();active=await browser.newContext({viewport:{width,height:1000},acceptDownloads:true});
  if(saved)await active.addInitScript(({key,raw})=>localStorage.setItem(key,raw),{key:model.STORAGE_KEY,raw:saved});
  await active.route('https://**',route=>{unexpected.push(route.request().url());return route.abort()});
  const page=await active.newPage();page.on('pageerror',e=>pageErrors.push(e.message));await page.goto(BASE);await file(page,a);await page.getByRole('button',{name:'Import into this tab',exact:true}).click();return page;
 }
 async function delay(page){await page.evaluate(()=>{window.nativeFileText=File.prototype.text;window.readJobs={};File.prototype.text=function(){const file=this;return new Promise((resolve,reject)=>{window.readJobs[file.name]={finish:()=>window.nativeFileText.call(file).then(resolve),fail:()=>reject(new Error('synthetic read failure'))}})}})}
 async function finish(page,name='backup.json',fail=false){await page.evaluate(({name,fail})=>fail?window.readJobs[name].fail():window.readJobs[name].finish(),{name,fail});await page.waitForTimeout(50)}
 const target=async(page,objective=brief.objective)=>assert.equal(await page.locator('#desk-objective').textContent(),objective);
 const only=async(page,title)=>assert.deepEqual(await page.locator('dialog[open] h2').allTextContents(),[title]);
 async function check(name,fn){await fn();results.push({name,status:'pass'});console.log('PASS '+name)}
 try{
 await check('delayed import cannot stack over acceptance or transfer acceptance to another result',async()=>{
  const p=await fixture();await delay(p);await file(p,b);await p.locator('#accept-result').click();await finish(p);await only(p,'Accept this result as owner?');await target(p);assert.match(await p.locator('#import-status').textContent(),/Import cancelled because another confirmation/);
  await p.getByRole('button',{name:'Record owner acceptance',exact:true}).click();assert.equal(await p.locator('#result-badge').textContent(),'Accepted by owner');await target(p);
  await p.evaluate(()=>File.prototype.text=window.nativeFileText);await file(p,b);await p.getByRole('button',{name:'Import into this tab',exact:true}).click();await target(p,other.objective);assert.equal(await p.locator('#result-badge').textContent(),'Not reviewed by owner');await p.getByRole('button',{name:'Record owner acceptance',exact:true,includeHidden:true}).evaluate(b=>b.click());assert.equal(await p.locator('#result-badge').textContent(),'Not reviewed by owner');assert.equal(await p.evaluate(k=>localStorage.getItem(k),model.STORAGE_KEY),null);
 });
 await check('opening reset cancels pending import before either cancellation or confirmed clearing',async()=>{
  for(const confirm of [false,true]){const p=await fixture({saved:a});await delay(p);await file(p,b);await p.locator('#view-review [data-reset]').click();await finish(p);await only(p,'Clear this draft?');await target(p);assert.equal(await p.locator(':focus').textContent(),'Keep editing');
   if(confirm){await p.getByRole('button',{name:'Clear draft',exact:true}).click();await p.waitForURL('**/#workspace');assert.equal(await p.locator('#result-text').inputValue(),'');assert.equal(await p.locator('#result-baseline-content').textContent(),'');}
   else{await p.keyboard.press('Escape');await target(p);assert.equal(await p.locator('#result-text').inputValue(),'Original actual comparison.');}
   assert.equal(await p.locator('#import-title').isVisible(),false);assert.equal(await p.evaluate(k=>localStorage.getItem(k),model.STORAGE_KEY),a);
  }
 });
 await check('opening restore cancels pending import without changing saved or current work until chosen',async()=>{
  for(const confirm of [false,true]){const p=await fixture({saved:b});await delay(p);await file(p,a);await p.locator('#restore-draft').click();await finish(p);await only(p,'Replace this tab’s draft?');await target(p);assert.equal(await p.locator(':focus').textContent(),'Keep current draft');
   if(confirm){await p.getByRole('button',{name:'Restore copy',exact:true}).click();await target(p,other.objective);}else{await p.keyboard.press('Escape');await target(p);}
   assert.equal(await p.locator('#result-badge').textContent(),'Not reviewed by owner');assert.equal(await p.locator('#import-title').isVisible(),false);assert.equal(await p.evaluate(k=>localStorage.getItem(k),model.STORAGE_KEY),b);
  }
 });
 await check('cancelled file failures cannot overwrite active accept/reset/restore confirmation or status',async()=>{
  for(const [selector,title] of [['#accept-result','Accept this result as owner?'],['#view-review [data-reset]','Clear this draft?'],['#restore-draft','Replace this tab’s draft?']]){const p=await fixture({saved:b});await delay(p);await file(p,b);await p.locator(selector).click();await finish(p,'backup.json',true);await only(p,title);assert.match(await p.locator('#import-status').textContent(),/Import cancelled because another confirmation/);await p.keyboard.press('Escape');await target(p);assert.equal(await p.locator('#result-badge').textContent(),'Not reviewed by owner');}
 });
 await check('acceptance is bound to its exact result; stale and repeated confirmation events cannot change replaced work',async()=>{
  const p=await fixture();await p.locator('#accept-result').click();
  // Simulates a state change from an asynchronous callback while native controls are inert.
  await p.locator('#result-feedback').evaluate(el=>{el.value='Changed feedback needs a fresh owner decision.';el.dispatchEvent(new Event('input',{bubbles:true}))});await p.getByRole('button',{name:'Record owner acceptance',exact:true}).click();assert.equal(await p.locator('#result-badge').textContent(),'Not reviewed by owner');assert.match(await p.locator('#result-error').textContent(),/changed while confirmation was open/);
  await p.locator('#accept-result').evaluate(b=>{b.click();b.click()});await only(p,'Accept this result as owner?');await p.getByRole('button',{name:'Record owner acceptance',exact:true,includeHidden:true}).evaluate(b=>{b.click();b.click()});assert.equal(await p.locator('#result-badge').textContent(),'Accepted by owner');assert.equal(await p.locator('#result-error').isVisible(),false);
  await file(p,b);await p.getByRole('button',{name:'Import into this tab',exact:true}).click();for(const name of ['Record owner acceptance','Restore copy','Clear draft','Import into this tab'])await p.getByRole('button',{name,exact:true,includeHidden:true}).evaluate(b=>b.click());await target(p,other.objective);assert.equal(await p.locator('#result-badge').textContent(),'Not reviewed by owner');
 });
 await check('a fresh import after interruption still confirms normally; superseded reads and Escape cannot resurrect candidates',async()=>{
  const p=await fixture();await delay(p);await file(p,b,'older.json');await p.locator('#accept-result').click();await p.keyboard.press('Escape');await file(p,b,'newer.json');await finish(p,'older.json');assert.equal(await p.locator('#import-title').isVisible(),false);await finish(p,'newer.json');await only(p,'Replace this tab with the backup?');await p.keyboard.press('Escape');await p.getByRole('button',{name:'Import into this tab',exact:true,includeHidden:true}).evaluate(b=>b.click());await target(p);
  await p.evaluate(()=>File.prototype.text=window.nativeFileText);await file(p,b);await p.getByRole('button',{name:'Import into this tab',exact:true}).click();await target(p,other.objective);assert.equal(await p.locator('#result-badge').textContent(),'Not reviewed by owner');
 });
 await check('queued close callbacks cannot steal the next field focus or route result edits into feedback',async()=>{
  const p=await fixture();await p.locator('#accept-result').click();
  await p.getByRole('button',{name:'Record owner acceptance',exact:true}).evaluate(button=>{button.click();document.querySelector('#result-text').focus()});await p.waitForTimeout(50);assert.equal(await p.locator(':focus').getAttribute('id'),'result-text');
  await p.keyboard.insertText('Revised result text.');assert.ok((await p.locator('#result-text').inputValue()).includes('Revised result text.'));assert.equal(await p.locator('#result-feedback').inputValue(),'Feedback for Original only.');assert.equal(await p.locator('#result-badge').textContent(),'Result draft');
  await p.locator('#view-review [data-reset]').click();await p.getByRole('button',{name:'Keep editing',exact:true}).evaluate(button=>{button.click();document.querySelector('#result-provenance').focus()});await p.waitForTimeout(50);assert.equal(await p.locator(':focus').getAttribute('id'),'result-provenance');
  await file(p,b);await p.getByRole('button',{name:'Keep current work',exact:true}).evaluate(button=>{button.click();document.querySelector('#result-text').focus()});await p.waitForTimeout(50);assert.equal(await p.locator(':focus').getAttribute('id'),'result-text');await target(p);
 });
 await check('interrupted-operation dialogs retain mobile/desktop focus, reflow and accessible controls',async()=>{
  for(const width of [1440,390,320]){const p=await fixture({width,saved:b});await delay(p);await file(p,b);await p.locator('#accept-result').click();await finish(p);await only(p,'Accept this result as owner?');assert.equal(await p.locator(':focus').textContent(),'Keep reviewing');assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const axe=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations.map(v=>v.id),[]);await fs.writeFile(path.join(OUT,'confirmation-axe-'+width+'.json'),JSON.stringify(axe.violations));if(width!==320)await p.screenshot({path:path.join(OUT,'confirmation-'+width+'.png')});await p.keyboard.press('Escape');await target(p);
   if(width===320){for(const [name,selector] of [['reset','#view-review [data-reset]'],['restore','#restore-draft']]){await file(p,b,name+'.json');await p.locator(selector).click();await finish(p,name+'.json');const check=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(check.violations.map(v=>v.id),[]);await fs.writeFile(path.join(OUT,'confirmation-axe-'+name+'.json'),JSON.stringify(check.violations));await p.keyboard.press('Escape');await target(p);}}
  }
 });
 assert.deepEqual(pageErrors,[]);assert.deepEqual(unexpected,[]);await fs.writeFile(path.join(OUT,'confirmation-results.json'),JSON.stringify({results,pageErrors,unexpectedExternalRequests:unexpected},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
