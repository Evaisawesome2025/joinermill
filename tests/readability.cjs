// Rendering regression: real computed type and layout, with synthetic content only.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const BASE=process.env.BRIEF_TEST_URL||'http://127.0.0.1:8765/';
const OUT=process.env.BRIEF_TEST_OUTPUT||path.resolve(__dirname,'../test-results');
function layout(){
 const visible=[...document.querySelectorAll('body *')].filter(e=>e.getClientRects().length&&!e.closest('[aria-hidden="true"],.sr-only')&&!e.matches('.skip,textarea,input'));
 return {width:innerWidth,scroll:document.documentElement.scrollWidth,overflow:visible.filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+1||r.left< -1}).map(e=>e.id||e.className||e.tagName)};
}
async function fits(page,label){const x=await page.evaluate(layout);assert.ok(x.scroll<=x.width+1,`${label}: page overflow ${JSON.stringify(x)}`);assert.deepEqual(x.overflow,[],label);}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const results=[],errors=[],unexpected=[];await fs.mkdir(OUT,{recursive:true});
 const check=async(name,fn)=>{await fn();results.push({name,status:'pass'});console.log('PASS '+name)};
 try{
 for(const width of [320,360,390,880,1440]){
  await check(`readable workspace and usable narrow controls at ${width}px`,async()=>{
   const page=await browser.newPage({viewport:{width,height:900}});page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',r=>{if(r.request().url().startsWith(BASE))return r.continue();unexpected.push(r.request().url());return r.abort()});
   await page.goto(BASE);await page.evaluate(()=>document.fonts.ready);await fits(page,'workspace');
   const metrics=await page.evaluate(()=>{
    const size=q=>parseFloat(getComputedStyle(document.querySelector(q)).fontSize);
    const rect=q=>document.querySelector(q).getBoundingClientRect();
    return {helper:size('.input-meta'),save:size('.form-bottom p'),privacy:size('#objective-form .demo-note'),input:size('#objective'),nav:size('nav a'),quote:size('.eva-message'),body:size('body'),stepBottom:rect('.step-label').bottom,labelTop:rect('.card-heading label').top,columns:getComputedStyle(document.querySelector('nav')).gridTemplateColumns.split(' ').length,button:rect('#objective-form .primary').width,form:rect('.form-bottom').width,underline:getComputedStyle(document.querySelector('nav a[aria-current]')).textDecorationLine};
   });
   assert.ok(metrics.helper>=15&&metrics.save>=16&&metrics.privacy>=16&&metrics.input>=17&&metrics.nav>=16&&metrics.body>=17,JSON.stringify(metrics));
   assert.ok(metrics.quote<=18&&metrics.stepBottom<=metrics.labelTop);assert.equal(metrics.underline,'none');
   if(width<=390){assert.equal(metrics.columns,2);assert.ok(Math.abs(metrics.button-metrics.form)<1)}
   assert.match(await page.locator('.eva-message').innerText(),/forward\. We’ll/);
   assert.match(await page.locator('#objective-form .form-bottom p').innerText(),/No automatic save.*Save in this browser or download/s);
   assert.match(await page.locator('#objective-form .demo-note').innerText(),/Nothing is sent while drafting\. No AI judgment or work execution\./);
   // Longer translated-style labels must wrap without widening the page.
   await page.evaluate(()=>{document.querySelector('a[data-view="instructions"]').lastChild.textContent='Reusable work instructions and operating guidance';document.querySelector('.card-heading label').textContent='What important outcome would you like to move forward with your organization?';document.querySelector('#objective-form .primary').firstChild.textContent='Build my complete brief for a detailed owner review';});
   await fits(page,'long labels');
   await page.screenshot({path:path.join(OUT,`readability-long-labels-${width}.png`),fullPage:true});
   await page.close();
  });
 }
 await check('all workflow views reflow with actual doubled text at fixed phone and desktop widths',async()=>{
  for(const width of [320,1440]){
   const page=await browser.newPage({viewport:{width,height:900}});await page.goto(BASE);
   await page.locator('#objective').fill('Compare two fictional public offer drafts.');await page.getByRole('button',{name:'Build my brief'}).click();
   const brief={inputs:'Synthetic drafts A and B.',deliverable:'A one-page comparison.',constraints:'No spending or outreach.',success:'Name one supported tradeoff.',stopRule:'Stop after the draft for owner review.'};
   for(const[k,v]of Object.entries(brief))await page.locator('#edit-'+k).fill(v);
   await page.getByRole('button',{name:'Review my brief'}).click();
   for(const view of ['workspace','brief','instructions','review','example','team','about']){
    await page.evaluate(v=>location.hash=v,view);await page.waitForSelector('#view-'+view+':visible');
    await fits(page,`${view} normal ${width}`);
    // Snapshot all original computed sizes first to avoid compounding inherited sizes.
    // This is text enlargement, not device scale, screenshots at 2x, or viewport shrink.
    await page.evaluate(()=>{window.textZoom=[...document.querySelectorAll('body,body *')].map(e=>[e,parseFloat(getComputedStyle(e).fontSize),e.style.cssText]);for(const[e,size]of window.textZoom)e.style.setProperty('font-size',size*2+'px','important')});
    await fits(page,`${view} doubled text ${width}`);
    await page.screenshot({path:path.join(OUT,`readability-text200-${view}-${width}.png`),fullPage:true});
    await page.evaluate(()=>{for(const[e,size,old]of window.textZoom)e.style.cssText=old;delete window.textZoom});
   }
   await page.close();
  }
 });
 assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
 await fs.writeFile(path.join(OUT,'readability-results.json'),JSON.stringify({results,pageErrors:errors,unexpectedRequests:unexpected},null,2));
 console.log(`${results.length} readability groups passed`);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
