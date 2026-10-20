// Current Overview checks; the V8 regression branch remains in check_overview.mjs.
export async function checkOverviewV23({page,base,out,check,ready,select,choose,routeOnly,routeNavigation,checkAssembly}){
 async function sequence(){
  const f=await(await page.locator('#current-board-preview').elementHandle()).contentFrame();
  await f.waitForURL(/\/assembly-v23\/index\.html\?/);
  await f.waitForFunction(()=>document.body.dataset.ready==='true'&&!document.querySelector('#progress').disabled&&document.querySelector('#loading').hidden,null,{timeout:90000});
  return f;
 }
 async function scrub(f,value){
  await f.locator('#progress').evaluate((input,value)=>{input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));},String(value));
  await f.waitForFunction(value=>Number(document.querySelector('#progress').value)===value,value);
 }
 const saved=f=>f.evaluate(()=>JSON.parse(localStorage.getItem('assembly-v23-state')));
 const distance=s=>Math.hypot(...s.camera.map((v,i)=>v-s.target[i]));
 check(await page.evaluate(()=>currentOverviewState.version==='V23'),'Current root and shell identify Overview V23');
 check(await page.locator('.workspace > .viewer').count()===1&&await page.locator('.workspace > .story').count()===1,'V23 preserves viewer and story columns');
 check(await page.evaluate(()=>OVERVIEW_SLIDE_CATALOG.every(s=>Array.isArray(s.owners)&&s.owners.length===0)),'V23 leaves current parts unassigned');
 await page.locator('#open-updates').click();check(await page.locator('#updates-dialog').isVisible(),'V23 Updates dialog opens');
 await page.keyboard.press('Escape');check(!await page.locator('#updates-dialog').isVisible(),'V23 Updates dialog closes with Escape');
 await choose('custom');await routeOnly('custom');
 check(!await page.locator('#power-architecture').isVisible(),'V23 Overview hides the saved V5/V7 selector');
 check(/FPGA V54/.test(await page.locator('.custom-approach').innerText())&&/LDO V13/.test(await page.locator('.custom-approach').innerText()),'Custom flow identifies V54 and V13');
 const full=new URL(await page.locator('#open-schematic-design').getAttribute('href'),base);
 check(full.pathname.endsWith('/assembly-v23/index.html')&&!full.searchParams.has('embed'),'Full-size link opens the same V23 app without embed mode');
 let f=await sequence();
 check(await f.locator('html').getAttribute('data-embed')==='true'&&await f.locator('html').getAttribute('data-overview-embed')==='V23','V23 uses its own embed mode');
 check(await f.locator('input[type="range"]').count()===1,'V23 has exactly one assembly progress slider');
 check(!await f.locator('#sheep').isChecked()&&await f.locator('#cutaway').isDisabled()&&!await f.locator('#head-milestone').isVisible(),'Sheep is optional and off in a fresh session');
 for(const [value,phase,gaps] of [[0,'Separate electronics','43.0 mm'],[48,'Seat interposer onto BRK8305','43.0 mm'],[64,'Seat XEM8305 onto interposer','45.0 mm'],[80,'Connect FPGA cable to interposer','5.0 mm'],[100,'Electronics assembled','5.0 mm']]){
  await scrub(f,value);
  check(await f.locator('#phase').innerText()===phase&&Number((await saved(f)).progress)===value,'Timeline reaches '+phase);
  const gap=await f.locator('#gap-status').innerText();
  check(gap.includes(gaps)&&(value!==64||/BRK ↔ interposer 5\.0 mm/.test(gap))&&(value!==80||/interposer ↔ XEM 5\.0 mm/.test(gap)),'Host gaps reflect the independent interposer/XEM step at '+value+'%');
 }
 await scrub(f,61);
 for(const [key,title] of [['1','ASIC 1 concept'],['LDO','LDO V13'],['FPGA','FPGA V54'],['brk','BRK8305'],['interposer','Interposer V12 snapshot'],['xem','XEM8305']]){
  await f.locator('#focus').selectOption(key);const before=await saved(f);
  check(await f.locator('#selected-title').innerText()===title&&before.focus===key&&before.progress===61&&await f.locator('#isolate').isChecked(),'Focus isolates '+title+' while retaining timeline position');
  check(before.camera.every(Number.isFinite)&&before.target.every(Number.isFinite)&&distance(before)>0,'Focused '+title+' camera is finite');
  await f.locator('#zoom-in').click();check(distance(await saved(f))<distance(before),'Zoom works while inspecting '+title);
 }
 await f.locator('#host-view').click();check(await f.locator('#focus').inputValue()==='host'&&await f.locator('#isolate').isChecked(),'Host stack focuses the separate BRK/interposer/XEM group');
 await f.locator('#sheep').check();check(await f.locator('#focus').inputValue()==='scene'&&await f.locator('#head-milestone').isVisible()&&!await f.locator('#cutaway').isDisabled(),'Show sheep enables its separate head-approach stage');
 await f.locator('#head-milestone').click();check(await f.locator('#phase').innerText()==='On-head assembly concept','Optional head milestone completes the single timeline');
 await f.locator('#cutaway').check();check((await saved(f)).cutaway===true,'Optional cutaway state is saved');
 await f.locator('#sheep').uncheck();check(await f.locator('#phase').innerText()==='Electronics assembled'&&!await f.locator('#head-milestone').isVisible(),'Hiding sheep restores the electronics-only endpoint');
 await f.locator('#play').click();await f.waitForFunction(()=>Number(document.querySelector('#progress').value)>0&&document.querySelector('#play').textContent==='Pause');
 await page.evaluate(()=>{const frame=document.querySelector('#current-board-preview');frame.contentWindow.postMessage({type:'presentation-slide-active',active:false},location.origin);});
 await f.waitForFunction(()=>document.querySelector('#play').textContent==='Play sequence');check(true,'Inactive Overview message pauses playback');
 for(const section of ['carriers','adapter']){
  await select(section);f=await ready('assembly');await checkAssembly(f,'separate',section==='carriers'?'asic':'host');
  check((await page.locator('#current-board-preview').getAttribute('src')).includes('assembly-v8/'),'Saved '+section+' retains the legacy assembly route');
 }
 await select('fpga');await ready('fpga3d');await page.locator('[data-current-view="layout"]').click();f=await ready('native');
 check(await f.evaluate(()=>nativePcbViewer.getState().sourceSHA256==='9b115f6dc2146db157458ca5f9ba8ec0439f61da7359b050244cf347dae1c4c0'),'Saved FPGA V41 layout retains its native source');
 await select('routing');check(await page.locator('#power-architecture').isVisible(),'Saved routing retains its V5/V7 selector');
 await page.locator('#power-architecture').selectOption('separate');await page.waitForFunction(()=>currentOverviewState.board==='separate');await ready('stack');
 await page.locator('[data-current-view="layout"]').click();f=await ready('native');check(await f.evaluate(()=>nativePcbViewer.getState().sourceSHA256==='f5d07985f5ff749ec338c609dc0ac859e8f74c0e97a381e711346547d55d42e6'),'Saved LDO V5 layout retains its native source');
 await page.locator('#power-architecture').selectOption('combined');await page.waitForFunction(()=>currentOverviewState.board==='combined');await ready('image');
 await page.locator('[data-current-view="3d"]').click();f=await ready('assembly');await checkAssembly(f,'combined','compact');
 await page.locator('#power-architecture').selectOption('separate');await page.waitForFunction(()=>currentOverviewState.board==='separate');
 await choose('direct');await routeOnly('direct');f=await ready('carrier3d');
 check((await page.locator('#current-board-preview').getAttribute('src')).includes('carrier-viewer-v42/')&&await f.evaluate(()=>carrierViewer.getState().revision==='V42'),'Direct Overview retains carrier V42');
 await select('carriers');await ready('reference');check((await page.locator('#current-board-preview').getAttribute('src')).includes('asic-reference-v5.html'),'Direct route retains the source ASIC reference');
 await select('receiver');await ready('carrier3d');check((await page.locator('#open-receiver-design').getAttribute('href')).includes('Carrier_V42_Public_KiCad_Review.zip'),'Direct receiver retains the V42 native package');
 await page.locator('[data-current-view="schematic"]').click();await ready('image');
 await routeNavigation('custom');await routeNavigation('direct');
 await choose('custom');await select('overview');
 for(const [width,height] of [[1440,900],[1280,720],[390,844]]){
  await page.setViewportSize({width,height});f=await sequence();
  await f.waitForFunction(()=>document.querySelector('#stage').clientWidth>0&&document.querySelector('#canvas').width>0);
  const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,height:document.querySelector('#scene-container').getBoundingClientRect().height,assembly:document.body.classList.contains('assembly-inspection')}));
  check(!layout.overflow&&layout.height>=600&&layout.assembly,'V23 reserves a usable scene viewport at '+width+'×'+height);
  const fit=await f.evaluate(()=>{const rect=el=>el.getBoundingClientRect(),canvas=rect(document.querySelector('#canvas')),controls=[...document.querySelectorAll('button,select,input')].filter(e=>{const r=rect(e);return r.width&&r.height;});return {stage:canvas.height>=230&&canvas.width>0,overflow:document.documentElement.scrollWidth>innerWidth+1,controls:controls.every(e=>{const r=rect(e);return r.left>=-1&&r.right<=innerWidth+1&&r.top>=-1&&r.bottom<=innerHeight+1;}),timeline:rect(document.querySelector('.timeline')).bottom<=innerHeight+1};});
  check(fit.stage&&!fit.overflow&&fit.controls&&fit.timeline,'V23 canvas, controls and timeline fit the iframe at '+width+'×'+height);
  await page.screenshot({path:out+'/overview-v23-'+width+'x'+height+'.png',fullPage:true});
 }
 // Full-size navigation exercises the same application outside the shell.
 await page.goto(full.href,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.ready==='true',null,{timeout:90000});
 check(!await page.locator('html').getAttribute('data-embed')&&await page.locator('header').isVisible()&&await page.locator('#progress').isEnabled(),'Standalone V23 keeps its own title and usable timeline');
}
