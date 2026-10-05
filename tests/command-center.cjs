const { chromium }=require('playwright');
const { default:AxeBuilder }=require('@axe-core/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const BASE=process.env.BRIEF_TEST_URL||'http://127.0.0.1:8765/';
const OUT=process.env.BRIEF_TEST_OUTPUT||path.join(ROOT,'test-results');
const draft={objective:'Compare two fictional repair-shop offers.',inputs:'Public sample drafts A and B.',deliverable:'A one-page comparison with one recommended headline.',constraints:'Use the supplied drafts only. No spend, outreach or publishing.',success:'Each claim cites draft A or B.\nThe recommendation names a tradeoff.',stopRule:'Stop after the draft and ask me to review.'};
const plan={nextAction:'Ask the owner for draft B before comparing the offers.',unresolvedInputs:'The second draft\nA source for the delivery-time claim'};
(async()=>{
 await fs.mkdir(OUT,{recursive:true});
 const model=await import('../preview/work-plan.js');
 const {default:worker}=await import('../../evaos-v05/worker/src/release.js');
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
 await ctx.addInitScript(()=>{const original=Storage.prototype.setItem;window.saveWrites=0;Storage.prototype.setItem=function(k,v){window.saveWrites++;return original.call(this,k,v)};});
 const page=await ctx.newPage();const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));let requests=[],slow=false;
 await page.route('https://evaos-v05-ask.joinermill-ask.workers.dev/brief/validate',async route=>{
  const body=JSON.parse(route.request().postData());requests.push(body);assert.deepEqual(Object.keys(body).sort(),Object.keys(draft).sort());
  if(slow)await new Promise(r=>setTimeout(r,350));
  const r=await worker.fetch(new Request(route.request().url(),{method:'POST',headers:{Origin:'http://127.0.0.1:8765','Content-Type':'application/json'},body:JSON.stringify(body)}),new Proxy({},{get(){throw new Error('Unexpected binding access')}}));
  await route.fulfill({status:r.status,headers:Object.fromEntries(r.headers),body:await r.text()});
 });
 const results=[];async function check(name,fn){await fn();results.push({name,status:'pass'});console.log('PASS '+name)}
 const show=async view=>{await page.evaluate(v=>location.hash=v,view);await page.waitForSelector('#view-'+view+':visible')};
 const save=async()=>{await page.locator('#view-review [data-save]').click();await page.waitForFunction(()=>document.querySelector('#storage-status').textContent.startsWith('Saved in this browser.'))};
 await page.goto(BASE);
 await check('partial draft saves explicitly, reload needs restore, removal keeps open draft',async()=>{
  await show('brief');await page.locator('#edit-objective').fill('An unfinished but useful direction.');assert.equal(await page.evaluate(()=>saveWrites),0);
  await page.locator('#view-brief [data-save]').click();await page.reload();await show('brief');assert.equal(await page.locator('#edit-objective').inputValue(),'');
  await page.locator('#restore-draft').click();assert.equal(await page.locator('#edit-objective').inputValue(),'An unfinished but useful direction.');
  await page.locator('#remove-saved').click();assert.equal(await page.locator('#edit-objective').inputValue(),'An unfinished but useful direction.');assert.equal(await page.evaluate(k=>localStorage.getItem(k),model.STORAGE_KEY),null);assert.equal(requests.length,0);
 });
 await check('desk displays actual objective/output/stop and editable local next-action notes',async()=>{
  for(const [k,v] of Object.entries(draft))await page.locator('#edit-'+k).fill(v);await page.getByRole('button',{name:'Review my brief'}).click();
  assert.equal(await page.locator('#desk-objective').textContent(),draft.objective);assert.equal(await page.locator('#desk-deliverable').textContent(),draft.deliverable);assert.equal(await page.locator('#desk-stop').textContent(),draft.stopRule);
  assert.match(await page.locator('#missing-note').textContent(),/does not establish readiness/);
  await page.locator('#nextAction').fill(plan.nextAction);await page.locator('#unresolvedInputs').fill(plan.unresolvedInputs);assert.match(await page.locator('#missing-note').textContent(),/2 input notes/);assert.equal(requests.length,0);
 });
 await check('full-plan download contains exact planning notes and brief; save repeated click writes once',async()=>{
  const d=page.waitForEvent('download');await page.locator('#view-review [data-download-plan]').click();const downloaded=await d;assert.equal(await fs.readFile(await downloaded.path(),'utf8'),model.exportPlan(draft,plan));
  const before=await page.evaluate(()=>saveWrites);await page.locator('#view-review [data-save]').evaluate(b=>{b.click();b.click()});assert.equal(await page.evaluate(()=>saveWrites),before+1);
  await page.waitForFunction(()=>!document.querySelector('#view-review [data-save]').disabled);
 });
 await check('optional backend check sends exactly six fields, never local notes or saved metadata',async()=>{
  await page.locator('#check-brief').click();await page.waitForFunction(()=>document.querySelector('#check-status').textContent.startsWith('Format checked.'));assert.deepEqual(requests.at(-1),draft);
  assert.ok(!JSON.stringify(requests.at(-1)).includes(plan.nextAction));
 });
 await check('unsaved edits do not overwrite snapshot; restore cancel and confirm are explicit',async()=>{
  await page.locator('#nextAction').fill('Unsaved action that should not silently replace the copy.');
  const raw=await page.evaluate(k=>localStorage.getItem(k),model.STORAGE_KEY);assert.equal(JSON.parse(raw).plan.nextAction,plan.nextAction);
  await page.locator('#restore-draft').click();assert.equal(await page.locator(':focus').textContent(),'Keep current draft');await page.keyboard.press('Escape');assert.match(await page.locator('#nextAction').inputValue(),/Unsaved action/);
  await page.locator('#restore-draft').click();await page.getByRole('button',{name:'Restore copy',exact:true}).click();assert.equal(await page.locator('#nextAction').inputValue(),plan.nextAction);assert.equal(await page.locator('#check-status').textContent(),'');
 });
 await check('restore interrupts pending validation; stale response cannot validate restored work',async()=>{
  slow=true;await page.locator('#check-brief').click();await page.locator('#restore-draft').click();await page.getByRole('button',{name:'Restore copy',exact:true}).click();await page.waitForTimeout(450);assert.equal(await page.locator('#check-status').textContent(),'');assert.equal(await page.locator('#check-brief').isDisabled(),false);slow=false;
 });
 await check('reload keeps content undisclosed until restore and never restores server verification',async()=>{
  const count=requests.length;await page.reload();await page.waitForSelector('#view-brief:visible');assert.equal(await page.locator('#edit-objective').inputValue(),'');assert.equal(await page.locator('#nextAction').inputValue(),'');assert.equal(requests.length,count);
  await page.locator('#restore-draft').click();await page.waitForSelector('#view-review:visible');assert.equal(await page.locator('#nextAction').inputValue(),plan.nextAction);assert.equal(await page.locator('#check-status').textContent(),'');
 });
 await check('storage change in another tab does not replace this open draft',async()=>{
  const other=await ctx.newPage();await other.goto(BASE);const alt={...plan,nextAction:'Different saved copy from another tab.'};const raw=model.encodeSnapshot(draft,alt);
  await other.evaluate(({k,raw})=>localStorage.setItem(k,raw),{k:model.STORAGE_KEY,raw});await page.waitForFunction(()=>document.querySelector('#storage-status').textContent.includes('another tab'));assert.equal(await page.locator('#nextAction').inputValue(),plan.nextAction);await other.close();await save();
 });
 await check('desktop/mobile desk, saved banner and restore/reset dialogs pass accessibility',async()=>{
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:1000});await page.evaluate(()=>window.scrollTo(0,0));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations.map(v=>v.id),[]);
   await fs.writeFile(path.join(OUT,'command-axe-'+width+'.json'),JSON.stringify(axe.violations));
   if(width!==320){await page.screenshot({path:path.join(OUT,'command-desk-'+width+'.png'),fullPage:true});await page.screenshot({path:path.join(OUT,'command-desk-top-'+width+'.png')});}
  }
  for(const [name,selector] of [['restore','#restore-draft'],['reset','#view-review [data-reset]']]){
   await page.locator(selector).click();const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations.map(v=>v.id),[]);await fs.writeFile(path.join(OUT,'command-axe-'+name+'-dialog.json'),JSON.stringify(axe.violations));await page.keyboard.press('Escape');
  }
 });
 await check('reset clears current plan; saved copy survives until explicit removal',async()=>{
  await page.locator('#view-review [data-reset]').click();await page.getByRole('button',{name:'Clear draft',exact:true}).click();await page.waitForURL('**/#workspace');assert.equal(await page.locator('#nextAction').inputValue(),'');assert.ok(await page.locator('#saved-banner').isVisible());
  for(const id of ['desk-objective','desk-deliverable','desk-stop','review-content'])assert.equal(await page.locator('#'+id).textContent(),'');
  await page.reload();assert.equal(await page.locator('#objective').inputValue(),'');await page.locator('#remove-saved').click();await page.reload();assert.equal(await page.locator('#saved-banner').isVisible(),false);
 });
 await check('corrupt, oversized, unsupported-version and injected snapshots cannot restore or execute',async()=>{
  for(const raw of ['{invalid', 'x'.repeat(model.MAX_SNAPSHOT_BYTES+1),JSON.stringify({version:9})]){
   await page.evaluate(({k,raw})=>{localStorage.setItem(k,raw);localStorage.setItem('unrelated','keep')},{k:model.STORAGE_KEY,raw});await page.reload();assert.ok(await page.locator('#restore-draft').isDisabled());assert.match(await page.locator('#saved-label').textContent(),/could not be read/);await page.locator('#remove-saved').click();assert.equal(await page.evaluate(()=>localStorage.getItem('unrelated')),'keep');
  }
  const injected={...draft,objective:'<img src=x onerror=alert(1)> is literal user intent.'};const raw=model.encodeSnapshot(injected,{nextAction:'<script>literal</script>',unresolvedInputs:'<a href="javascript:alert(1)">text</a>'});
  await page.evaluate(({k,raw})=>localStorage.setItem(k,raw),{k:model.STORAGE_KEY,raw});await page.reload();await page.locator('#restore-draft').click();await page.waitForSelector('#view-review:visible');assert.equal(await page.locator('#desk-objective img').count(),0);assert.equal(await page.locator('#desk-objective').textContent(),injected.objective);assert.equal(await page.locator('#nextAction').inputValue(),'<script>literal</script>');
 });
 await check('quota and removal failures are visible without dropping the current draft',async()=>{
  await page.evaluate(()=>{window.originalSet=Storage.prototype.setItem;window.originalRemove=Storage.prototype.removeItem;Storage.prototype.setItem=()=>{throw new Error('quota')};Storage.prototype.removeItem=()=>{throw new Error('blocked')};});
  await page.locator('#view-review [data-save]').click();assert.match(await page.locator('#storage-status').textContent(),/could not be confirmed/);await page.locator('#remove-saved').click();assert.match(await page.locator('#storage-status').textContent(),/could not be removed/);assert.ok((await page.locator('#nextAction').inputValue()).length>0);
  await page.evaluate(()=>{Storage.prototype.setItem=window.originalSet;Storage.prototype.removeItem=window.originalRemove;});
 });
 assert.deepEqual(pageErrors,[]);await fs.writeFile(path.join(OUT,'command-center-results.json'),JSON.stringify({results,pageErrors,requestCount:requests.length},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
