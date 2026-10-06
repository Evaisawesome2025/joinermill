const { chromium } = require('/workspace/releases/joinermill/node_modules/playwright');
const AxeBuilder = require('/workspace/releases/joinermill/node_modules/@axe-core/playwright').default;
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = process.argv[2] || 'http://127.0.0.1:8766/';
const output = process.argv[3];
const root = '/workspace/releases/joinermill-live-hotfix';
const expectedOrigin = new URL(base).origin;
const receipt = {started_utc:new Date().toISOString(),base,functional:[],layout:[],axe:[],page_errors:[],unexpected_requests:[],failed_responses:[],asset_hashes:[]};
const crypto = require('node:crypto');
fs.mkdirSync(output,{recursive:true});
function check(name, fn) { return fn().then(()=>receipt.functional.push({name,passed:true})); }
(async()=>{
 const browser = await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try {
  const context = await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true,serviceWorkers:'block'});
  await context.route('**/*', async route=>{
   const request = route.request();
   if (new URL(request.url()).origin !== expectedOrigin || request.method()!=='GET') {
    receipt.unexpected_requests.push({url:request.url(),method:request.method()});
    return route.abort();
   }
   return route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror',e=>receipt.page_errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)receipt.failed_responses.push({url:r.url(),status:r.status()});});
  const response = await page.goto(base,{waitUntil:'networkidle'});
  assert.equal(response.status(),200);
  await check('navigation and unknown-hash fallback',async()=>{
   for (const view of ['brief','team','about','workspace']) {
    await page.locator(`nav [data-view="${view}"]`).click();
    await page.waitForFunction(v=>!document.getElementById('view-'+v).hidden,view);
    assert.equal(await page.locator('.view:visible').count(),1);
    assert.equal(await page.locator(`nav [data-view="${view}"]`).getAttribute('aria-current'),'page');
   }
   await page.evaluate(()=>location.hash='unknown');
   await page.waitForFunction(()=>!document.getElementById('view-workspace').hidden);
  });
  await check('invalid objective exposes error and retains focus',async()=>{
   await page.locator('#objective').fill('short');
   await page.locator('#objective-form button[type=submit]').click();
   assert.equal(await page.locator('#objective-error').isVisible(),true);
   assert.equal(await page.locator('#objective').getAttribute('aria-invalid'),'true');
   assert.equal(await page.evaluate(()=>document.activeElement.id),'objective');
  });
  await check('three starters preserve existing templates and stops',async()=>{
   const expectations={offer:'Clarify one offer',website:'Make the first visit',week:'Choose a first week'};
   for(const [type,title] of Object.entries(expectations)){
    await page.locator(`[data-starter="${type}"]`).click();
    assert.equal(await page.locator('#template').inputValue(),type);
    const objective=await page.locator('#objective').inputValue();
    await page.locator('#objective-form button[type=submit]').click();
    await page.waitForFunction(()=>!document.getElementById('view-brief').hidden);
    assert.equal(await page.locator('#brief-objective').textContent(),objective);
    assert.ok((await page.locator('#brief-title').textContent()).startsWith(title));
    assert.ok((await page.locator('#stop-condition').textContent()).startsWith('Stop'));
    assert.equal(await page.locator('.approval-card button').isDisabled(),true);
    await page.locator('#reset-preview').click();
    await page.waitForFunction(()=>!document.getElementById('view-workspace').hidden);
   }
  });
  const synthetic='Review this synthetic <img src=x onerror=alert(1)> objective as plain text.';
  await check('objective remains literal text and input stays local',async()=>{
   await page.locator('#objective').fill(synthetic);
   await page.locator('#objective-form button[type=submit]').click();
   await page.waitForFunction(()=>!document.getElementById('view-brief').hidden);
   assert.equal(await page.locator('#brief-objective').textContent(),synthetic);
   assert.equal(await page.locator('#brief-objective img').count(),0);
   assert.equal(await page.locator('#brief-tag').textContent(),'Local');
  });
  await check('download contains objective and execution disclosure',async()=>{
   const pending=page.waitForEvent('download');
   await page.locator('#download-brief').click();
   const download=await pending;
   assert.equal(download.suggestedFilename(),'joinermill-preview-brief.txt');
   const text=fs.readFileSync(await download.path(),'utf8');
   assert.ok(text.includes(synthetic));
   assert.ok(text.includes('No AI execution, specialist dispatch or server save.'));
  });
  await check('reset and reload clear objective without persistent storage',async()=>{
   await page.locator('#reset-preview').click();
   await page.waitForFunction(()=>!document.getElementById('view-workspace').hidden);
   assert.equal(await page.locator('#objective').inputValue(),'');
   await page.locator('#objective').fill('A second synthetic objective for reload.');
   await page.reload({waitUntil:'networkidle'});
   assert.equal(await page.locator('#objective').inputValue(),'');
   assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
  });
  for(const width of [320,390,768,1440]) {
   await page.setViewportSize({width,height:width>=768?1000:844});
   for(const enlarged of [false,true]){
    await page.evaluate(size=>document.documentElement.style.fontSize=size,enlarged?'32px':'16px');
    for(const view of ['workspace','brief','team','about']){
     await page.evaluate(v=>location.hash=v,view);
     await page.waitForFunction(v=>!document.getElementById('view-'+v).hidden,view);
     await page.evaluate(()=>document.fonts.ready);
     const layout=await page.evaluate(()=>{
      const width=document.documentElement.clientWidth;
      const overflowing=[...document.querySelectorAll('.view:not([hidden]) *')].filter(el=>{
       if(el.closest('.sr-only')||!el.getClientRects().length)return false;
       const r=el.getBoundingClientRect();return r.width>0&&(r.right>width+1||r.left<-1);
      }).map(el=>({tag:el.tagName,id:el.id,class:el.className}));
      return {client_width:width,scroll_width:document.documentElement.scrollWidth,overflowing};
     });
     receipt.layout.push({width,enlarged,view,...layout});
     assert.ok(layout.scroll_width<=layout.client_width+1,JSON.stringify(receipt.layout.at(-1)));
     assert.deepEqual(layout.overflowing,[],JSON.stringify(receipt.layout.at(-1)));
     if(!enlarged && [390,1440].includes(width)){
      const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      receipt.axe.push({width,view,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length}))});
      assert.equal(axe.violations.length,0,JSON.stringify(receipt.axe.at(-1)));
     }
     if([390,1440].includes(width))await page.screenshot({path:path.join(output,`${view}-${width}${enlarged?'-enlarged':''}.png`),fullPage:view!=='team'});
    }
   }
  }
  await page.evaluate(()=>document.documentElement.style.fontSize='16px');
  await page.goto(base,{waitUntil:'networkidle'});
  const assetPaths=['index.html','preview/index.html','preview/preview.css','preview/preview.js','preview/roster.js','favicon.svg','fonts/fraunces-latin-600-normal.woff2','fonts/source-sans-3-latin-400-normal.woff2','fonts/source-sans-3-latin-600-normal.woff2'];
  for(const asset of assetPaths){
   const url=new URL(asset==='index.html'?'':asset,base).href;
   const res=await context.request.get(url,{maxRedirects:0});
   assert.equal(res.status(),200,asset);
   const actual=crypto.createHash('sha256').update(await res.body()).digest('hex');
   const expected=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,asset))).digest('hex');
   receipt.asset_hashes.push({asset,status:res.status(),actual_sha256:actual,expected_sha256:expected,match:actual===expected});
   assert.equal(actual,expected,asset);
  }
  assert.deepEqual(receipt.page_errors,[]);
  assert.deepEqual(receipt.unexpected_requests,[]);
  assert.deepEqual(receipt.failed_responses,[]);
  receipt.passed=true;
 } catch(error) {
  receipt.passed=false;
  receipt.failure=error.message;
  throw error;
 } finally {
  receipt.finished_utc=new Date().toISOString();
  fs.writeFileSync(path.join(output,'verification.json'),JSON.stringify(receipt,null,2)+'\n');
  await browser.close();
 }
 console.log(JSON.stringify({passed:receipt.passed,functional:receipt.functional.length,layout:receipt.layout.length,axe:receipt.axe.length,assets:receipt.asset_hashes.length,output}));
})().catch(e=>{console.error(e);process.exitCode=1;});
