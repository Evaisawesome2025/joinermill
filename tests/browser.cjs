// Start static server on :8765; sibling evaos-v05 checkout supplies real route integration.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const OUTPUT = process.env.BRIEF_TEST_OUTPUT || path.join(ROOT, 'test-results');
const fixture = { objective: 'Compare two fictional offers for a repair shop.', inputs: 'Two synthetic public offer drafts, A and B.', deliverable: 'A one-page comparison with a suggested headline.', constraints: 'Use only supplied drafts. No outreach, spend or publishing.', success: 'Each recommendation cites draft A or B.\nOne important tradeoff is named.', stopRule: 'Stop after the draft. Ask me if a source is missing.' };
(async () => {
 await fs.mkdir(OUTPUT,{recursive:true});
 const { default: worker } = await import('../../evaos-v05/worker/src/release.js');
 const { exportBrief } = await import('../preview/brief-model.js');
 const browser = await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH} : {})});
 const context = await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
 const page = await context.newPage(); const errors=[]; let sends=0, mode='normal';
 page.on('pageerror',e=>errors.push(e.message));
 // Fail both corrupt and inaccessible storage conditions; implementation should never touch it.
 await page.addInitScript(()=>{ for(const name of ['localStorage','sessionStorage'])Object.defineProperty(window,name,{get(){throw new Error('Storage blocked or corrupt');}}); });
 await page.route('https://evaos-v05-ask.joinermill-ask.workers.dev/brief/validate',async route=>{
  sends++; if(mode==='offline')return route.abort('failed');
  if(mode==='slow')await new Promise(r=>setTimeout(r,300));
  if(mode==='mismatch')return route.fulfill({contentType:'application/json',body:'{"ok":true,"exportText":"invented"}'});
  const r=await worker.fetch(new Request(route.request().url(),{method:'POST',headers:{Origin:'http://127.0.0.1:8765','Content-Type':'application/json'},body:route.request().postData()}),new Proxy({},{get(){throw new Error('Unexpected binding use');}}));
  await route.fulfill({status:r.status,headers:Object.fromEntries(r.headers),body:await r.text()});
 });
 const report=[];
 async function check(name,fn){await fn();report.push({name,status:'pass'});console.log('PASS '+name);}
 await page.goto('http://127.0.0.1:8765/');
 await check('keyboard entry, objective validation and six-field validation',async()=>{
  await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').textContent(),'Skip to workspace');
  await page.getByRole('button',{name:'Build my brief'}).click();assert.equal(await page.locator('#objective').getAttribute('aria-invalid'),'true');
  await page.locator('#objective').fill(fixture.objective);await page.getByRole('button',{name:'Build my brief'}).click();
  await page.getByRole('button',{name:'Review my brief'}).click();assert.equal(await page.locator(':focus').getAttribute('id'),'edit-inputs');
  for(const [key,value] of Object.entries(fixture))await page.locator('#edit-'+key).fill(value);
  await page.screenshot({path:path.join(OUTPUT,'desktop-editor.png'),fullPage:true});
  await page.getByRole('button',{name:'Review my brief'}).click();assert.equal(sends,0);
  assert.match(await page.locator('#review-content').textContent(),/repair shop/);
 });
 await check('text download exactly matches all prepared fields',async()=>{
  const d=page.waitForEvent('download');await page.locator('#download-brief').click();const file=await d;
  assert.equal(await fs.readFile(await file.path(),'utf8'),exportBrief(fixture));assert.equal(sends,0);
 });
 await check('optional real handler check, repeated clicks and verified export',async()=>{
  mode='slow';await page.locator('#check-brief').evaluate(b=>{b.click();b.click();});
  await page.waitForFunction(()=>document.querySelector('#check-status').textContent.startsWith('Format checked.'));
  assert.equal(sends,1);mode='normal';await page.screenshot({path:path.join(OUTPUT,'desktop-review.png'),fullPage:true});
 });
 await check('network error and mismatched server output preserve local draft',async()=>{
  for(const m of ['offline','mismatch']){mode=m;await page.locator('#check-brief').click();await page.waitForFunction(()=>document.querySelector('#check-status').textContent.startsWith('Check unavailable'));assert.match(await page.locator('#review-content').textContent(),/repair shop/);}
  mode='normal';
 });
 await check('cancelled check cannot verify a later draft',async()=>{
  mode='slow';await page.locator('#check-brief').click();await page.getByRole('link',{name:'Edit all fields'}).click();
  await page.locator('#edit-deliverable').fill('A different draft for human review.');await page.getByRole('button',{name:'Review my brief'}).click();
  await page.waitForTimeout(400);assert.equal(await page.locator('#check-status').textContent(),'');
  await page.getByRole('link',{name:'Edit all fields'}).click();await page.locator('#edit-deliverable').fill(fixture.deliverable);await page.getByRole('button',{name:'Review my brief'}).click();mode='normal';
 });
 await check('download failure is visible and draft remains available',async()=>{
  await page.waitForFunction(()=>!document.querySelector('#download-brief').disabled);
  await page.evaluate(()=>{window.originalObjectURL=URL.createObjectURL;URL.createObjectURL=()=>{throw new Error('blocked');};});
  await page.locator('#download-brief').click();assert.match(await page.locator('#download-status').textContent(),/could not start/);
  await page.evaluate(()=>URL.createObjectURL=window.originalObjectURL);
 });
 await check('back/edit invalidates old verification; markup renders as text',async()=>{
  await page.getByRole('link',{name:'Edit all fields'}).click();
  await page.locator('#edit-inputs').fill('<img src=x onerror=alert(1)> & a literal link https://example.test');
  await page.getByRole('button',{name:'Review my brief'}).click();assert.equal(await page.locator('#check-status').textContent(),'');
  assert.equal(await page.locator('#review-content img').count(),0);assert.match(await page.locator('#review-content').textContent(),/<img src=x/);
  await page.goBack();assert.equal(await page.locator('#edit-inputs').inputValue(),'<img src=x onerror=alert(1)> & a literal link https://example.test');
  await page.locator('#edit-inputs').fill(fixture.inputs);await page.getByRole('button',{name:'Review my brief'}).click();
 });
 await check('separate examples and exact 13-role directory preserve user draft',async()=>{
  await page.evaluate(()=>location.hash='example');await page.locator('#example-template').selectOption('website');
  assert.match(await page.locator('#brief-subtitle').textContent(),/separate/);
  await page.getByRole('link',{name:'Back to my brief'}).click();assert.equal(await page.locator('#edit-objective').inputValue(),fixture.objective);
  await page.getByRole('link',{name:'The organization',exact:true}).click();assert.equal(await page.locator('#team-grid .person-card').count(),13);
 });
 await check('mobile layout, touch targets and accessible labels',async()=>{
  await page.setViewportSize({width:390,height:844});await page.getByRole('link',{name:/Work brief/}).click();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:path.join(OUTPUT,'mobile-editor.png'),fullPage:true});
  for(const key of Object.keys(fixture))assert.ok(await page.locator('#edit-'+key).evaluate(el=>el.labels.length>0));
  await page.getByRole('button',{name:'Review my brief'}).click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:path.join(OUTPUT,'mobile-review.png'),fullPage:true});
 });
 await check('automated accessibility on editor, review, examples and roster',async()=>{
  const { default: AxeBuilder } = require('@axe-core/playwright');
  for(const width of [1440,390]) for(const view of ['review','brief','example','team','about','workspace']){
   await page.setViewportSize({width,height:900});
   await page.evaluate(v=>location.hash=v,view);await page.waitForSelector('#view-'+view+':visible');
   const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   await fs.writeFile(path.join(OUTPUT,'axe-'+width+'-'+view+'.json'),JSON.stringify(result.violations,null,2));
   assert.deepEqual(result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),[],view);
  }
  await page.evaluate(()=>location.hash='review');
 });
 await check('320px reflow and 200 percent desktop sizing',async()=>{
  for(const width of [320,720]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 });
 await check('reset confirmation cancellation, Escape, clear and reload',async()=>{
  await page.locator('#view-review [data-reset]').click();assert.equal(await page.locator(':focus').textContent(),'Keep editing');
  await page.keyboard.press('Escape');assert.match(await page.locator('#review-content').textContent(),/repair shop/);
  await page.locator('#view-review [data-reset]').click();await page.getByRole('button',{name:'Clear draft',exact:true}).click();
  await page.waitForURL('**/#workspace');assert.equal(await page.locator('#objective').inputValue(),'');
  await page.reload();await page.evaluate(()=>location.hash='brief');assert.equal(await page.locator('#edit-inputs').inputValue(),'');
 });
 await check('no script errors with inaccessible storage',async()=>assert.deepEqual(errors,[]));
 await fs.writeFile(path.join(OUTPUT,'browser-results.json'),JSON.stringify({report,requestsToChecker:sends,pageErrors:errors},null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
