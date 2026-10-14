import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=(process.env.SITE_URL||'https://howardwhsrun.github.io/FPGA_4K/').replace(/\/?$/,'/');
const out=process.env.OVERVIEW_OUTPUT_DIR||'fpga-browser-check/overview';
await mkdir(out,{recursive:true});
const report={base,checks:[],pageErrors:[],httpErrors:[]};
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
page.on('pageerror',e=>report.pageErrors.push(e.message));
page.on('response',r=>{if(r.status()>=400)report.httpErrors.push({url:r.url(),status:r.status()});});
function check(ok,label){if(!ok)throw Error(label);report.checks.push(label);console.log('PASS',label);}
async function currentFrame(){return (await page.locator('#design-view').elementHandle()).contentFrame();}
async function ready(kind){
 const frame=await currentFrame();
 await frame.waitForURL(new URL(await page.locator('#design-view').getAttribute('src'),base).href,{timeout:30000});
 await frame.waitForFunction(type=>{
  if(type==='image')return window.drawingState?.ready;
  if(type==='native')return window.nativePcbViewer?.getState().ready;
  if(type==='fpga3d')return window.fpga3dViewer?.getState().ready;
  if(type==='carrier3d')return window.carrierViewer?.getState().assemblyReady;
  return window.fpgaLdoViewer?.getState().ready;
 },kind,{timeout:90000});
 return frame;
}
try{
 await page.goto(base+'#fpga',{waitUntil:'domcontentloaded'});
 check(await page.locator('html').getAttribute('data-overview-version')==='V1','Current overview V1 is active');
 check(await page.locator('#design-title').innerText()==='Standalone FPGA · V41','Existing #fpga deep link selects V41');
 let frame=await ready('fpga3d');
 check(await frame.evaluate(()=>window.fpga3dViewer.getState().GLBSHA256==='89eddaffada21914daf27b40091fa8aa673fe674bf367d6cafe4315dd4281623'),'FPGA V41 source-derived model loads');
 await frame.locator('[data-pose="bottom"]').click();
 check(await frame.evaluate(()=>window.fpga3dViewer.getState().pose==='bottom'),'FPGA orientation control works');
 await frame.locator('[data-pose="iso"]').click();
 for(const [board,title,first] of [['overview','Current hardware overview','stack'],['carrier','XEM8305 carrier · V17','carrier3d'],['fpga','Standalone FPGA · V41','fpga3d'],['ldo','Separate ASIC LDO · V5','stack'],['combined','Combined FPGA + shared LDO · V7','image']]){
  await page.locator('[data-board="'+board+'"]').click();
  await page.waitForFunction(expected=>window.overviewState?.board===expected,board);
  check(await page.locator('#design-title').innerText()===title,board+' heading and revision');
  await ready(first);
  await page.screenshot({path:out+'/'+board+'-desktop.png',fullPage:true});
  if(board==='overview')continue;
  const download=await page.request.get(new URL(await page.locator('#download-project').getAttribute('href'),base).href);
  check(download.ok()&&(await download.body()).subarray(0,2).toString()==='PK',board+' complete KiCad ZIP is available');
  await page.locator('[data-view="layout"]').click();
  frame=await ready(board==='combined'?'image':'native');
  if(board==='fpga')check(await frame.evaluate(()=>window.nativePcbViewer.getState().sourceSHA256==='9b115f6dc2146db157458ca5f9ba8ec0439f61da7359b050244cf347dae1c4c0'),'V41 layout native hash');
  if(board==='ldo')check(await frame.evaluate(()=>window.nativePcbViewer.getState().sourceSHA256==='f5d07985f5ff749ec338c609dc0ac859e8f74c0e97a381e711346547d55d42e6'),'V5 layout native hash');
  if(board==='combined'){
   await frame.locator('[data-side="back"]').click();await frame.locator('#drawing').evaluate(img=>img.decode());
   check((await frame.locator('#drawing').getAttribute('src')).endsWith('_Back.svg'),'V7 underside uses its own native SVG');
   await frame.locator('#in').click();check(await frame.evaluate(()=>window.drawingState.scale>1),'Native SVG zoom control');
   await frame.locator('#fit').click();
  }
  await page.screenshot({path:out+'/'+board+'-layout.png',fullPage:true});
  await page.locator('[data-view="schematic"]').click();frame=await ready('image');
  check(await frame.locator('#drawing').evaluate(img=>img.naturalWidth>0),board+' complete schematic loads');
  await page.screenshot({path:out+'/'+board+'-schematic.png',fullPage:true});
 }
 check((await page.locator('#design-next').innerText()).includes('all eight ASICs'),'V7 shared rail load qualification stays explicit');
 check(!(await page.locator('[data-view="3d"]').isVisible()),'V6 combined 3D is not mislabeled as V7');
 for(const width of [1280,390]){
  await page.setViewportSize({width,height:width===390?844:720});
  for(const board of ['overview','carrier','fpga','ldo','combined']){
   await page.locator('[data-board="'+board+'"]').click();await page.waitForFunction(expected=>window.overviewState?.board===expected,board);
   await ready(board==='combined'?'image':board==='fpga'?'fpga3d':board==='carrier'?'carrier3d':'stack');
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),board+' has no horizontal overflow at '+width);
   if(board==='combined'){
    frame=await currentFrame();check(await frame.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'V7 drawing toolbar fits at '+width);
   }
   await page.screenshot({path:out+'/'+board+'-'+width+'.png',fullPage:true});
  }
 }
 await page.goto(base+'#receiver',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.overviewState?.board==='carrier');
 check(await page.locator('#design-title').innerText()==='XEM8305 carrier · V17','Legacy #receiver selects current carrier');
 check((await page.request.get(base+'overview-2026-09-23.html')).ok(),'Earlier overview remains accessible');
 check(report.pageErrors.length===0,'No browser JavaScript errors');
 check(report.httpErrors.length===0,'No failed HTTP resources');
 report.passed=true;
}catch(error){report.passed=false;report.error=error.stack;console.error(error.stack);process.exitCode=1;}
finally{await browser.close();await writeFile(out+'/Browser_Check.json',JSON.stringify(report,null,2)+'\n');}
