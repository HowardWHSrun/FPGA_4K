import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=(process.env.SITE_URL||'https://howardwhsrun.github.io/FPGA_4K/').replace(/\/?$/,'/');
const out=process.env.OVERVIEW_OUTPUT_DIR||'fpga-browser-check/overview';await mkdir(out,{recursive:true});
const report={base,checks:[],pageErrors:[],httpErrors:[]};
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
page.on('pageerror',e=>report.pageErrors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.httpErrors.push({url:r.url(),status:r.status()});});
function check(ok,label){if(!ok)throw Error(label);report.checks.push(label);console.log('PASS',label);}
async function select(section){await page.locator('.system-nav [data-slide="'+section+'"]').click();await page.waitForFunction(id=>window.currentOverviewState?.section===id,section);}
async function ready(kind){const f=await (await page.locator('#current-board-preview').elementHandle()).contentFrame();await f.waitForURL(new URL(await page.locator('#current-board-preview').getAttribute('src'),base).href);await f.waitForFunction(type=>type==='image'?window.drawingState?.ready:type==='native'?window.nativePcbViewer?.getState().ready:type==='fpga3d'?window.fpga3dViewer?.getState().ready:type==='carrier3d'?window.carrierViewer?.getState().assemblyReady:window.fpgaLdoViewer?.getState().ready,kind,{timeout:90000});return f;}
async function settled(){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
async function checkResponsive(width,height,desktop){
 await page.setViewportSize({width,height});
 for(const id of ['overview','carriers','routing','fpga','adapter','receiver']){
  await select(id);
  if(id==='fpga'||id==='receiver'){
   await page.locator('[data-current-view="3d"]').click();
   await page.waitForFunction(()=>window.currentOverviewState?.view==='3d');
  }
  await settled();
  const fit=await page.evaluate(()=>{
   const nav=document.querySelector('.system-nav'),footer=document.querySelector('footer');
   const inScreen=element=>{const r=element.getBoundingClientRect();return r.width>0&&r.height>0&&r.left>=-1&&r.right<=innerWidth+1&&r.top>=-1&&r.bottom<=innerHeight+1;};
   return {
    noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1,
    noVerticalOverflow:document.documentElement.scrollHeight<=innerHeight+1,
    navInScreen:inScreen(nav),footerInScreen:inScreen(footer),
    navWithoutHorizontalScroll:nav.scrollWidth<=nav.clientWidth+1,
    navButtonsRendered:[...nav.querySelectorAll('[data-slide]')].every(button=>{const r=button.getBoundingClientRect();return r.width>0&&r.height>0&&r.left>=-1&&r.right<=innerWidth+1;})
   };
  });
  const label=id+' at '+width+' × '+height;
  check(fit.noHorizontalOverflow,'No horizontal page overflow in '+label);
  check(fit.navWithoutHorizontalScroll&&fit.navButtonsRendered,'All six section buttons fit without horizontal navigation scrolling in '+label);
  if(desktop){check(fit.noVerticalOverflow,'Desktop page fits the available height in '+label);check(fit.navInScreen&&fit.footerInScreen,'Desktop navigation and footer remain entirely on screen in '+label);}
  if(['fpga','routing','receiver'].includes(id)){
   const frame=await ready(id==='fpga'?'fpga3d':id==='receiver'?'carrier3d':'image');
   await frame.waitForFunction(()=>document.documentElement.dataset.overviewEmbed==='V4'&&document.getElementById('overview-embed-style')?.sheet);
   const embeddedFit=await frame.evaluate(()=>{
    const visibleControls=[...document.querySelectorAll(':is(.toolbar,.render-toolbar,.assembly-controls,header) :is(button,select,input)')].filter(element=>{const r=element.getBoundingClientRect();return r.width>0&&r.height>0;});
    return visibleControls.length>0&&document.documentElement.scrollWidth<=innerWidth+1&&visibleControls.every(element=>{const r=element.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1;});
   });
   check(embeddedFit,'Embedded board toolbar fits in '+label);
  }
 }
 await select('overview');await page.screenshot({path:out+'/overview-'+width+'x'+height+'.png',fullPage:true});
}
try{
 await page.goto(base+'#overview',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.PRESENTATION?.getState().sourceVerified);
 check(await page.locator('html').getAttribute('data-overview-version')==='V4','Original structure with parallel approaches is Overview V4');
 check(await page.locator('.workspace > .viewer').count()===1&&await page.locator('.workspace > .story').count()===1,'Original viewer-left/story-right structure retained');
 check(JSON.stringify(await page.locator('.system-nav [data-slide]').evaluateAll(items=>items.map(x=>x.dataset.slide)))===JSON.stringify(['overview','carriers','routing','fpga','adapter','receiver']),'Original six section buttons retained');
 check(await page.locator('.board-nav').count()===0,'Replacement sidebar removed');
 check(await page.getByRole('button',{name:'Updates',exact:true}).count()===1&&await page.locator('.current-fpga-notice').count()===0,'One Updates button replaces the yellow current-work notices');
 await page.locator('#open-updates').click();check(await page.locator('#updates-dialog').isVisible(),'Updates button opens the project updates dialog');
 await page.locator('#close-updates').click();check(!(await page.locator('#updates-dialog').isVisible()),'Updates close button dismisses the dialog');
 await page.locator('#open-updates').click();await page.keyboard.press('Escape');check(!(await page.locator('#updates-dialog').isVisible()),'Escape dismisses the Updates dialog');
 check(await page.locator('#adapter-overview .approach-card').count()===2,'Overview presents two parallel approach cards');
 const customCard=page.locator('#adapter-overview .custom-approach'),directCard=page.locator('#adapter-overview .direct-approach');
 check(await customCard.getAttribute('href')==='#fpga'&&/new LDO \+ custom FPGA/.test(await customCard.innerText())&&/V41/.test(await customCard.innerText()),'Approach A identifies the custom FPGA and new LDO designs');
 check(await directCard.getAttribute('href')==='#receiver'&&/existing LDO board/.test(await directCard.innerText())&&/carrier V17/.test(await directCard.innerText())&&/connects directly/.test(await directCard.innerText()),'Approach B identifies carrier V17 connecting directly to the existing LDO board');
 check(await page.locator('.system-nav b,.system-nav .pc-path').count()===0&&!/[→↔]/.test(await page.locator('.system-nav').innerText()),'Bottom section navigation does not depict the two approaches as one serial chain');
 check(await page.evaluate(()=>{const s=PRESENTATION.getState();return s.triangles===650&&s.sourceGeometryUnchanged&&s.sourceSHA256==='1aa6547321ffec16be82f6e58fd27fd49825b74ba4f23b1c36394f7b9f2eac46';}),'Original supplied assembly geometry preserved exactly');
 check(!(await page.locator('#current-board-preview').isVisible()),'Overview opens the original assembly canvas');
 await page.screenshot({path:out+'/overview-parallel-approaches.png',fullPage:true});
 await customCard.click();await page.waitForFunction(()=>window.currentOverviewState?.section==='fpga');check(await page.locator('#approach-label').innerText()==='A · Custom FPGA approach','Approach A card opens the custom FPGA route with matching context');
 await select('overview');await directCard.click();await page.waitForFunction(()=>window.currentOverviewState?.section==='receiver');
 check(await page.locator('#approach-label').innerText()==='B · Parallel direct-LDO approach'&&/connects[\s\S]*directly to the existing LDO board/.test(await page.locator('#slide-description').innerText()),'Approach B card opens the direct-LDO route with the existing-board distinction');
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
 for(const [width,height,desktop] of [[1440,900,true],[1280,720,true],[1024,768,false],[768,1024,false],[390,844,false]])await checkResponsive(width,height,desktop);
 for(const suffix of ['', '?asset=unknown']){await page.goto(base+'presentation/overview/image-viewer.html'+suffix,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.drawingState?.ready,null,{timeout:90000});check(await page.locator('#drawing-picker').inputValue()==='fpga-schematic','Direct drawing fallback remains available');}
 check(report.pageErrors.length===0,'No browser JavaScript errors');check(report.httpErrors.length===0,'No failed HTTP resources');report.passed=true;
}catch(error){report.passed=false;report.error=error.stack;console.error(error.stack);process.exitCode=1;}
finally{await browser.close();await writeFile(out+'/Browser_Check.json',JSON.stringify(report,null,2)+'\n');}
