import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=(process.env.SITE_URL||'https://howardwhsrun.github.io/FPGA_4K/').replace(/\/?$/,'/');
const out=process.env.OVERVIEW_OUTPUT_DIR||'fpga-browser-check/overview';await mkdir(out,{recursive:true});
const report={base,checks:[],pageErrors:[],httpErrors:[]};
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
page.on('pageerror',e=>report.pageErrors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.httpErrors.push({url:r.url(),status:r.status()});});
function check(ok,label){if(!ok)throw Error(label);report.checks.push(label);console.log('PASS',label);}
async function select(section){await page.locator('.system-nav [data-slide="'+section+'"]').click();await page.waitForFunction(id=>window.currentOverviewState?.section===id,section);}
async function ready(kind){const f=await (await page.locator('#current-board-preview').elementHandle()).contentFrame();await f.waitForURL(new URL(await page.locator('#current-board-preview').getAttribute('src'),base).href);await f.waitForFunction(type=>type==='image'?window.drawingState?.ready:type==='native'?window.nativePcbViewer?.getState().ready:type==='fpga3d'?window.fpga3dViewer?.getState().ready:type==='carrier3d'?window.carrierViewer?.getState().assemblyReady:window.fpgaLdoViewer?.getState().ready,kind,{timeout:90000});return f;}
try{
 await page.goto(base+'#overview',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.PRESENTATION?.getState().sourceVerified);
 check(await page.locator('html').getAttribute('data-overview-version')==='V3','Restored original structure is Overview V3');
 check(await page.locator('.workspace > .viewer').count()===1&&await page.locator('.workspace > .story').count()===1,'Original viewer-left/story-right structure retained');
 check(JSON.stringify(await page.locator('.system-nav [data-slide]').evaluateAll(items=>items.map(x=>x.dataset.slide)))===JSON.stringify(['overview','carriers','routing','fpga','adapter','receiver']),'Original six section buttons retained');
 check(await page.locator('.board-nav').count()===0,'Replacement sidebar removed');
 check(await page.evaluate(()=>{const s=PRESENTATION.getState();return s.triangles===650&&s.sourceGeometryUnchanged&&s.sourceSHA256==='1aa6547321ffec16be82f6e58fd27fd49825b74ba4f23b1c36394f7b9f2eac46';}),'Original supplied assembly geometry preserved exactly');
 check(!(await page.locator('#current-board-preview').isVisible()),'Overview opens the original assembly canvas');
 await page.screenshot({path:out+'/overview-original-structure.png',fullPage:true});
 await select('fpga');check((await page.locator('#slide-title').innerText()).includes('V41'),'Original FPGA section shows current V41');await ready('fpga3d');
 await page.locator('[data-current-view="layout"]').click();let f=await ready('native');check(await f.evaluate(()=>nativePcbViewer.getState().sourceSHA256==='9b115f6dc2146db157458ca5f9ba8ec0439f61da7359b050244cf347dae1c4c0'),'V41 native layout is the current checkpoint');
 check((await page.locator('#open-fpga-design').getAttribute('href')).includes('FPGA_V41_Complete_KiCad'),'V41 complete native download linked');await page.screenshot({path:out+'/fpga-current-original-structure.png',fullPage:true});
 await select('routing');check((await page.locator('#slide-title').innerText()).includes('V5'),'Original Routing + LDO section shows separate V5');await ready('stack');
 await page.locator('[data-current-view="layout"]').click();f=await ready('native');check(await f.evaluate(()=>nativePcbViewer.getState().sourceSHA256==='f5d07985f5ff749ec338c609dc0ac859e8f74c0e97a381e711346547d55d42e6'),'V5 native layout is the current placement');
 await page.locator('#power-architecture').selectOption('combined');await page.waitForFunction(()=>window.currentOverviewState?.board==='combined');await ready('image');
 check((await page.locator('#slide-title').innerText()).includes('V7')&&(await page.locator('#slide-description').innerText()).includes('30 × 30'),'Combined V7 preview stays inside the original LDO section');
 check(!(await page.locator('[data-current-view="3d"]').isVisible()),'V6 combined 3D is not relabeled V7');
 check((await page.locator('#open-ldo-design').getAttribute('href')).includes('Combined_FPGA_Shared_LDO_V7'),'V7 complete native download linked');
 await page.locator('[data-current-view="schematic"]').click();await ready('image');await page.screenshot({path:out+'/combined-current-original-structure.png',fullPage:true});
 await select('receiver');check((await page.locator('#slide-title').innerText()).includes('V17'),'Original XEM carrier section shows V17');await ready('carrier3d');
 await page.locator('[data-current-view="schematic"]').click();await ready('image');check((await page.locator('#open-receiver-design').getAttribute('href')).includes('Carrier_V17_Complete_KiCad'),'V17 complete native download linked');
 await select('adapter');check((await page.locator('#slide-description').innerText()).includes('29 September'),'Dated adapter study remains separate');
 await page.locator('#detail-button').click();check(await page.locator('#notes-dialog').isVisible(),'Original technical notes dialog works');await page.locator('#close-notes').click();
 await select('overview');await page.locator('[data-camera="top"]').click();check(await page.locator('#camera-name').innerText()==='TOP VIEW','Original overview camera controls work');await page.locator('[data-camera="iso"]').click();
 for(const width of [1280,390]){await page.setViewportSize({width,height:width===390?844:720});for(const id of ['overview','fpga','routing','receiver']){await select(id);check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Original structure has no horizontal overflow in '+id+' at '+width);}await page.screenshot({path:out+'/restored-'+width+'.png',fullPage:true});}
 for(const suffix of ['', '?asset=unknown']){await page.goto(base+'presentation/overview/image-viewer.html'+suffix,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.drawingState?.ready,null,{timeout:90000});check(await page.locator('#drawing-picker').inputValue()==='fpga-schematic','Direct drawing fallback remains available');}
 check(report.pageErrors.length===0,'No browser JavaScript errors');check(report.httpErrors.length===0,'No failed HTTP resources');report.passed=true;
}catch(error){report.passed=false;report.error=error.stack;console.error(error.stack);process.exitCode=1;}
finally{await browser.close();await writeFile(out+'/Browser_Check.json',JSON.stringify(report,null,2)+'\n');}
