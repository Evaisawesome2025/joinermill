const {chromium}=require('playwright');
const {default:AxeBuilder}=require('@axe-core/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),BASE=process.env.BRIEF_TEST_URL||'http://127.0.0.1:8765/',OUT=process.env.BRIEF_TEST_OUTPUT||path.join(ROOT,'test-results');
const brief={objective:'Compare two fictional repair offers.',inputs:'Public sample drafts A and B.',deliverable:'A one-page comparison with one recommended headline.',constraints:'No spending, outreach or publishing.',success:'Each claim cites sample A or B.\nName one tradeoff.',stopRule:'Stop after the draft for owner review.'};
const actual='Draft comparison: sample B names the repair scope; sample A is shorter but omits the turnaround estimate. Suggested headline: Know what your repair includes.';
const source='Written by me from fictional samples A and B. Local file comparison-v1.txt.';
const feedback='The comparison names both samples and explains the tradeoff. I accept it for this original brief.';
(async()=>{
 await fs.mkdir(OUT,{recursive:true});const model=await import('../preview/work-plan.js');const worker=(await import('../../evaos-v05/worker/src/release.js')).default;
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});const page=await ctx.newPage();const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));let requests=[],slow=false;
 await ctx.addInitScript(()=>{const set=Storage.prototype.setItem;window.saveWrites=0;Storage.prototype.setItem=function(k,v){window.saveWrites++;return set.call(this,k,v)}});
 await page.route('https://evaos-v05-ask.joinermill-ask.workers.dev/brief/validate',async route=>{
  const body=JSON.parse(route.request().postData());requests.push(body);assert.deepEqual(Object.keys(body).sort(),Object.keys(brief).sort());if(slow)await new Promise(r=>setTimeout(r,350));
  const r=await worker.fetch(new Request(route.request().url(),{method:'POST',headers:{Origin:'http://127.0.0.1:8765','Content-Type':'application/json'},body:JSON.stringify(body)}),new Proxy({},{get(){throw new Error('Unexpected binding')}}));
  await route.fulfill({status:r.status,headers:Object.fromEntries(r.headers),body:await r.text()});
 });
 const results=[];async function check(name,fn){await fn();results.push({name,status:'pass'});console.log('PASS '+name)}
 const show=async view=>{await page.evaluate(v=>location.hash=v,view);await page.waitForSelector('#view-'+view+':visible')};
 const backup=async()=>{await page.locator('.transfer-controls').evaluate(e=>e.open=true);const d=page.waitForEvent('download');await page.locator('#download-backup').click();const result=await d;const raw=await fs.readFile(await result.path(),'utf8');await page.waitForFunction(()=>!document.querySelector('#download-backup').disabled);return raw};
 const importRaw=async raw=>{await page.locator('.transfer-controls').evaluate(e=>e.open=true);await page.locator('#import-backup').setInputFiles({name:'local-backup.json',mimeType:'application/json',buffer:Buffer.from(raw)});};
 const accept=async()=>{await page.locator('#accept-result').click();await page.getByRole('button',{name:'Record owner acceptance',exact:true}).click();};
 await page.goto(BASE);await show('brief');for(const [key,value] of Object.entries(brief))await page.locator('#edit-'+key).fill(value);await page.getByRole('button',{name:'Review my brief',exact:true}).click();await page.waitForSelector('#view-review:visible');
 await check('empty result cannot be decided; recording validates actual text and provenance',async()=>{
  assert.ok(await page.locator('#accept-result').isDisabled());assert.ok(await page.locator('#needs-revision').isDisabled());await page.locator('#record-result').click();assert.match(await page.locator('#result-error').textContent(),/Add a result and its source/);assert.equal(requests.length,0);
 });
 await check('actual result captures original brief; repeated record click cannot duplicate or change timestamp',async()=>{
  await page.locator('#result-text').fill(actual);await page.locator('#result-provenance').fill(source);await page.locator('#record-result').evaluate(b=>{b.click();b.click()});assert.ok(await page.locator('#record-result').isDisabled());
  const data=JSON.parse(await backup());assert.equal(data.result.text,actual);assert.equal(data.result.provenance,source);assert.deepEqual(data.result.baseline,brief);assert.equal(data.result.decision,'unreviewed');assert.equal(await page.evaluate(()=>saveWrites),0);
 });
 await check('owner decisions require feedback; revision and acceptance are explicit and keyboard-cancellable',async()=>{
  await page.locator('#needs-revision').click();assert.match(await page.locator('#result-error').textContent(),/Add feedback/);await page.locator('#result-feedback').fill('Add the source for the turnaround estimate.');await page.locator('#needs-revision').click();assert.equal(await page.locator('#result-badge').textContent(),'Needs revision');
  await page.locator('#result-feedback').fill(feedback);assert.equal(await page.locator('#result-badge').textContent(),'Not reviewed by owner');await page.locator('#accept-result').click();assert.equal(await page.locator(':focus').textContent(),'Keep reviewing');await page.keyboard.press('Escape');assert.equal(await page.locator('#result-badge').textContent(),'Not reviewed by owner');
  await page.locator('#accept-result').evaluate(b=>{b.click();b.click()});await page.getByRole('button',{name:'Record owner acceptance',exact:true}).evaluate(b=>{b.click();b.click()});assert.equal(await page.locator('#result-badge').textContent(),'Accepted by owner');assert.ok(await page.locator('#accept-result').isDisabled());
 });
 await check('result/source edits invalidate decision and recording; original target survives brief edits and back navigation',async()=>{
  for(const [id,value] of [['result-text',actual+' Revised.'],['result-provenance',source+' Version 2.']]){await page.locator('#'+id).fill(value);assert.equal(await page.locator('#result-badge').textContent(),'Result draft');assert.ok(await page.locator('#accept-result').isDisabled());await page.locator('#record-result').click();await accept();}
  await show('brief');await page.locator('#edit-deliverable').fill('A different intended output for later work.');await page.getByRole('button',{name:'Review my brief',exact:true}).click();await page.waitForSelector('#view-review:visible');assert.ok(await page.locator('#result-mismatch').isVisible());assert.equal(await page.locator('#result-badge').textContent(),'Accepted by owner');assert.match(await page.locator('#result-state').textContent(),/captured brief only/);assert.ok((await page.locator('#result-baseline-content').textContent()).includes(brief.deliverable));
  await show('team');await page.goBack();await page.waitForSelector('#view-review:visible');assert.ok(await page.locator('#result-mismatch').isVisible());
 });
 await check('readable export preserves actual result/source/feedback and distinguishes changed brief from review target',async()=>{
  const data=JSON.parse(await backup());const d=page.waitForEvent('download');await page.locator('.result-keep [data-download-plan]').click();assert.equal(await fs.readFile(await (await d).path(),'utf8'),model.exportPlan(data.draft,data.plan,data.result));assert.ok(model.exportPlan(data.draft,data.plan,data.result).includes('decision does not apply to the current brief'));
 });
 await check('backend format check sends only six current brief fields; result review causes no automatic transmission',async()=>{
  assert.equal(requests.length,0);await page.locator('#check-brief').click();await page.waitForFunction(()=>document.querySelector('#check-status').textContent.startsWith('Format checked.'));assert.equal(requests.length,1);assert.ok(!JSON.stringify(requests[0]).includes(actual));assert.match(await page.locator('#check-status').textContent(),/result and owner review stayed local/);
 });
 let savedRaw;
 await check('explicit save and reload preserve record but do not restore until requested or retain backend verification',async()=>{
  await page.locator('.result-keep [data-save]').evaluate(b=>{b.click();b.click()});assert.equal(await page.evaluate(()=>saveWrites),1);savedRaw=await page.evaluate(k=>localStorage.getItem(k),model.STORAGE_KEY);await page.reload();await page.waitForSelector('#view-brief:visible');assert.equal(await page.locator('#result-text').inputValue(),'');assert.equal(await page.locator('#result-baseline-content').textContent(),'');assert.equal(requests.length,1);
  await page.locator('#restore-draft').click();await page.waitForSelector('#view-review:visible');assert.equal(await page.locator('#result-text').inputValue(),actual+' Revised.');assert.equal(await page.locator('#result-badge').textContent(),'Accepted by owner');assert.match(await page.locator('#result-origin').textContent(),/not authenticated approval/);assert.equal(await page.locator('#check-status').textContent(),'');
 });
 await check('JSON import cancel preserves current work; confirmation restores exact content without saving or sending',async()=>{
  await page.locator('#result-feedback').fill('Unsaved current feedback.');await importRaw(savedRaw);await page.waitForSelector('#import-title:visible');assert.equal(await page.locator(':focus').textContent(),'Keep current work');await page.keyboard.press('Escape');assert.equal(await page.locator('#result-feedback').inputValue(),'Unsaved current feedback.');
  await importRaw(savedRaw);await page.getByRole('button',{name:'Import into this tab',exact:true}).evaluate(b=>{b.click();b.click()});assert.equal(await page.locator('#result-feedback').inputValue(),feedback);assert.equal(await page.locator('#result-badge').textContent(),'Accepted by owner');assert.match(await page.locator('#result-origin').textContent(),/Imported a local file/);assert.equal(await page.evaluate(()=>saveWrites),0);assert.equal(requests.length,1);assert.equal(await page.evaluate(k=>localStorage.getItem(k),model.STORAGE_KEY),savedRaw);
 });
 await check('import cancels pending format check and refuses a late result from the old brief',async()=>{
  slow=true;await page.locator('#check-brief').click();await importRaw(savedRaw);await page.getByRole('button',{name:'Import into this tab',exact:true}).click();await page.waitForTimeout(450);assert.equal(await page.locator('#check-status').textContent(),'');assert.equal(await page.locator('#check-brief').isDisabled(),false);slow=false;
 });
 await check('invalid/corrupt/oversized/impossible backups preserve current result and saved copy',async()=>{
  const before=await page.locator('#result-text').inputValue();const data=JSON.parse(savedRaw);
  for(const raw of ['{bad','x'.repeat(model.MAX_SNAPSHOT_BYTES+1),JSON.stringify({...data,version:9}),JSON.stringify({...data,result:{...data.result,decision:'verified'}}),JSON.stringify({...data,result:{...data.result,decision:['accepted']}})]){await importRaw(raw);await page.waitForFunction(()=>document.querySelector('#import-status').textContent.startsWith('Cannot import:'));assert.equal(await page.locator('#result-text').inputValue(),before);assert.equal(await page.evaluate(k=>localStorage.getItem(k),model.STORAGE_KEY),savedRaw);assert.equal(await page.locator('#import-title').isVisible(),false);}
  await page.evaluate(()=>{window.nativeFileText=File.prototype.text;File.prototype.text=()=>Promise.reject(new Error('read failed'))});await importRaw(savedRaw);await page.waitForFunction(()=>document.querySelector('#import-status').textContent.startsWith('Cannot import:'));assert.equal(await page.locator('#result-text').inputValue(),before);await page.evaluate(()=>File.prototype.text=window.nativeFileText);
 });
 await check('markup and dangerous-looking references remain literal text; no result URLs are fetched',async()=>{
  const data=JSON.parse(savedRaw);data.result.text='<img src=https://result.invalid/pixel onerror=alert(1)> actual output';data.result.provenance='javascript:alert(1) <script>literal source</script>';data.result.feedback='<svg onload=alert(1)> literal owner feedback';data.result.baseline.objective='<img src=x onerror=alert(1)> literal target';let unexpected=0;await page.route('https://result.invalid/**',r=>{unexpected++;return r.abort()});
  await importRaw(JSON.stringify(data));await page.getByRole('button',{name:'Import into this tab',exact:true}).click();assert.equal(await page.locator('#result-text').inputValue(),data.result.text);assert.equal(await page.locator('#result-baseline-content img').count(),0);assert.ok((await page.locator('#result-baseline-content').textContent()).includes(data.result.baseline.objective));assert.equal(unexpected,0);
  await importRaw(savedRaw);await page.getByRole('button',{name:'Import into this tab',exact:true}).click();
 });
 await check('desktop/mobile result and import/accept dialogs pass axe and reflow; screenshots show real synthetic record',async()=>{
  await page.locator('.transfer-controls').evaluate(e=>e.open=false);await page.locator('#result-baseline').evaluate(e=>e.open=true);
  for(const width of [1440,390,320]){await page.setViewportSize({width,height:1000});await page.locator('.result-section').scrollIntoViewIfNeeded();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations.map(v=>v.id),[]);await fs.writeFile(path.join(OUT,'result-axe-'+width+'.json'),JSON.stringify(axe.violations));if(width!==320){await page.locator('.result-section').screenshot({path:path.join(OUT,'result-review-'+width+'.png')});}}
  await page.locator('#result-feedback').fill(feedback+' Reviewed again.');await page.locator('#accept-result').click();let axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations.map(v=>v.id),[]);await fs.writeFile(path.join(OUT,'result-axe-accept-dialog.json'),JSON.stringify(axe.violations));await page.keyboard.press('Escape');
  await importRaw(savedRaw);axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations.map(v=>v.id),[]);await fs.writeFile(path.join(OUT,'result-axe-import-dialog.json'),JSON.stringify(axe.violations));await page.keyboard.press('Escape');
 });
 await check('storage quota and blocked access preserve result and still permit explicit backup import/export',async()=>{
  await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new Error('quota')}});await page.locator('.result-keep [data-save]').click();assert.match(await page.locator('#storage-status').textContent(),/could not be confirmed/);assert.ok((await page.locator('#result-text').inputValue()).includes(actual));
  const isolated=await browser.newContext({acceptDownloads:true});await isolated.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}})});const p=await isolated.newPage();await p.goto(BASE);await p.locator('.transfer-controls').evaluate(e=>e.open=true);await p.locator('#import-backup').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(savedRaw)});await p.getByRole('button',{name:'Import into this tab',exact:true}).click();assert.equal(await p.locator('#result-badge').textContent(),'Accepted by owner');const d=p.waitForEvent('download');await p.locator('#download-backup').click();assert.deepEqual(JSON.parse(await fs.readFile(await (await d).path(),'utf8')).result,JSON.parse(savedRaw).result);await isolated.close();
 });
 await check('reset clears all result inputs, captured target and review metadata; saved copy remains explicit',async()=>{
  await page.locator('#view-review [data-reset]').click();await page.getByRole('button',{name:'Clear draft',exact:true}).click();await page.waitForURL('**/#workspace');for(const id of ['result-text','result-provenance','result-feedback'])assert.equal(await page.locator('#'+id).inputValue(),'');for(const id of ['result-times','result-baseline-content','desk-objective','review-content'])assert.equal(await page.locator('#'+id).textContent(),'');assert.equal(await page.locator('#result-badge').textContent(),'No result recorded');assert.equal(await page.evaluate(k=>localStorage.getItem(k),model.STORAGE_KEY),savedRaw);
  await page.reload();assert.equal(await page.locator('#result-text').inputValue(),'');await page.locator('#remove-saved').click();assert.equal(await page.evaluate(k=>localStorage.getItem(k),model.STORAGE_KEY),null);
 });
 await check('legacy version1 backup restores brief with no fabricated result or decision',async()=>{
  const legacy=JSON.stringify({version:1,savedAt:'2026-10-05T20:00:00.000Z',draft:brief,plan:{nextAction:'Ask for the missing sample.',unresolvedInputs:''}});await importRaw(legacy);await page.getByRole('button',{name:'Import into this tab',exact:true}).click();assert.equal(await page.locator('#desk-objective').textContent(),brief.objective);assert.equal(await page.locator('#result-text').inputValue(),'');assert.equal(await page.locator('#result-badge').textContent(),'No result recorded');assert.equal(await page.evaluate(k=>localStorage.getItem(k),model.STORAGE_KEY),null);
 });
 await check('reset interrupts delayed file reading and prevents a stale import prompt or result',async()=>{
  await page.evaluate(()=>{window.fileText=File.prototype.text;File.prototype.text=function(){const file=this;return new Promise(resolve=>{window.finishImportRead=()=>window.fileText.call(file).then(resolve)})}});
  await importRaw(savedRaw);await page.locator('#view-review [data-reset]').click();await page.getByRole('button',{name:'Clear draft',exact:true}).click();await page.evaluate(()=>window.finishImportRead());await page.waitForTimeout(100);assert.equal(await page.locator('#import-title').isVisible(),false);assert.equal(await page.locator('#result-text').inputValue(),'');assert.equal(await page.locator('#import-status').textContent(),'');await page.evaluate(()=>File.prototype.text=window.fileText);
 });
 assert.deepEqual(pageErrors,[]);await fs.writeFile(path.join(OUT,'result-review-results.json'),JSON.stringify({results,pageErrors,requestCount:requests.length},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
