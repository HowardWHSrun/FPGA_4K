import {mkdir,writeFile,readFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=(process.env.SITE_URL||'https://howardwhsrun.github.io/FPGA_4K/').replace(/\/?$/,'/');
const out=process.env.OVERVIEW_OUTPUT_DIR||'fpga-browser-check/overview';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
const page=await context.newPage(),report={base,checks:[],pageErrors:[],httpErrors:[],boards:[]};
page.on('pageerror',e=>report.pageErrors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.httpErrors.push({url:r.url(),status:r.status()})});
function check(ok,label){if(!ok)throw Error(label);report.checks.push(label);console.log('PASS',label)}
const ids={frontend:'fpga',hdmi:'adapter',carrier:'receiver'};
try{
 const response=await context.request.get(base+'current-boards.json');check(response.ok(),'Current board manifest loads');const manifest=await response.json();check(manifest.boards.length===3,'Exactly three current PCBs');
 for(const b of manifest.boards){
  await page.goto(base+b.slug+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.carrierPage?.getState().model?.ready,null,{timeout:90000});
  let state=await page.evaluate(()=>window.carrierPage.getState());check(state.components===b.components&&state.model.refs===b.footprints,b.name+' current 3D and component coverage');check(state.model.sourcePCB===b.source_pcb_sha256,b.name+' model is bound to current PCB');
  if(process.env.MODEL_SCREENSHOTS){
   for(const [pose,file] of [['iso','pcb-angled.png'],['top','pcb-top.png'],['bottom','pcb-bottom.png']]){await page.locator(`[data-pose="${pose}"]`).click();await page.waitForTimeout(300);await page.locator('#board-canvas').screenshot({path:process.env.MODEL_SCREENSHOTS+'/'+b.slug+'/assets/'+file});}
  }
  await page.locator('[data-view="layout"]').click();const nf=await (await page.locator('#native-layout').elementHandle()).contentFrame();await nf.waitForFunction(()=>window.nativePcbViewer?.getState().ready,null,{timeout:90000});const native=await nf.evaluate(()=>window.nativePcbViewer.getState());check(native.counts?.footprints===b.footprints||native.nativeCounts?.footprints===b.footprints||await nf.evaluate(()=>window.pcbViewerDiagnostics.nativeCounts.footprints)===b.footprints,b.name+' native PCB loads');
  for(const control of ['layers','parts','nets'])await nf.locator('#'+control).click();await nf.locator('#flip').click();await nf.locator('#fit').click();check(await nf.locator('#load-error').isHidden(),b.name+' native layer/part/net controls');
  await page.locator('#layout-mode').selectOption('back-copper');await page.waitForFunction(()=>document.querySelector('#board-image').complete&&document.querySelector('#board-image').naturalWidth>0);check(true,b.name+' back layout export');
  await page.locator('[data-view="schematic"]').click();await page.waitForFunction(()=>window.carrierPage?.getState().schematicReady,null,{timeout:60000});const before=await page.evaluate(()=>window.carrierPage.getState().schematicView[2]);await page.locator('#schematic-in').click();check(await page.evaluate(()=>window.carrierPage.getState().schematicView[2])<before,b.name+' schematic zoom');
  await page.locator('#component-search').fill(b.key==='hdmi'?'TP710':'U1');check(await page.locator('#component-rows tr').count()>0,b.name+' component search');await page.locator('#find-schematic').click();check(await page.locator('#schematic-stage svg').count()===1,b.name+' component-to-schematic navigation');
  const link=page.locator('#files a[download]').first();check((await link.getAttribute('href')).endsWith('_Full_KiCad.zip'),b.name+' prominent full KiCad button');
  const [download]=await Promise.all([page.waitForEvent('download'),link.click()]);const target=out+'/'+download.suggestedFilename();await download.saveAs(target);check(!await download.failure(),b.name+' browser ZIP download');const bytes=await readFile(target);check(bytes.length===b.zip_bytes&&bytes.subarray(0,2).toString()==='PK',b.name+' ZIP size and signature');
  await page.screenshot({path:out+'/'+b.key+'-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.goto(base+b.slug+'/?view=schematic',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.carrierPage?.getState().schematicReady,null,{timeout:60000});check(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=2,b.name+' mobile width');await page.screenshot({path:out+'/'+b.key+'-mobile.png'});await page.setViewportSize({width:1440,height:1000});report.boards.push({key:b.key,state,native,download:download.suggestedFilename(),bytes:bytes.length});
 }
 await page.goto(base+'?approach=custom#overview',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.currentOverviewState?.board==='assembly');
 const nav=await page.locator('.system-nav [data-slide]:visible').evaluateAll(es=>es.map(e=>e.dataset.slide));check(JSON.stringify(nav)===JSON.stringify(['overview','fpga','adapter','receiver']),'Main navigation contains overview and only the three requested PCBs');
 for(const b of manifest.boards){await page.locator('.system-nav [data-slide="'+ids[b.key]+'"]').click();await page.waitForFunction(slug=>window.currentOverviewState?.source?.startsWith(slug+'/'),b.slug);check((await page.locator('#slide-title').innerText()).includes(b.name),b.name+' current main title');await page.locator('[data-current-view="schematic"]').click();const f=await (await page.locator('#current-board-preview').elementHandle()).contentFrame();await f.waitForFunction(()=>window.carrierPage?.getState().schematicReady,null,{timeout:60000});const download=page.locator('#'+({frontend:'open-fpga-design',hdmi:'open-adapter-design',carrier:'open-receiver-design'}[b.key]));check(await download.isVisible()&&(await download.getAttribute('href'))===b.full_kicad,b.name+' current main download');}
 await page.screenshot({path:out+'/main-desktop.png'});
 await page.goto(base+'?approach=direct#receiver',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.currentOverviewState?.source?.startsWith('direct-ldo/'));check(true,'Existing direct-carrier URL resolves to the latest carrier');
 await page.setViewportSize({width:390,height:844});await page.goto(base+'?approach=custom#overview',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.currentOverviewState?.board==='assembly');check(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=2,'Main overview mobile width');await page.screenshot({path:out+'/main-mobile.png'});
 check(report.pageErrors.length===0,'No JavaScript errors');check(report.httpErrors.length===0,'No failed HTTP assets');
}finally{await writeFile(out+'/current-pcbs-browser.json',JSON.stringify(report,null,2));await browser.close();}
