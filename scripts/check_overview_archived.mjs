import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=(process.env.SITE_URL||'https://howardwhsrun.github.io/FPGA_4K/').replace(/\/?$/,'/');
const out=process.env.OVERVIEW_OUTPUT_DIR||'fpga-browser-check/overview';
await mkdir(out,{recursive:true});
const routes={custom:['overview','carriers','routing','fpga','adapter'],direct:['overview','carriers','receiver']};
const report={base,checks:[],pageErrors:[],httpErrors:[]};
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
page.on('pageerror',e=>report.pageErrors.push(e.message));
page.on('response',r=>{if(r.status()>=400)report.httpErrors.push({url:r.url(),status:r.status()});});
function check(ok,label){if(!ok)throw Error(label);report.checks.push(label);console.log('PASS',label);}
async function select(section){
 await page.locator('.system-nav [data-slide="'+section+'"]').click();
 await page.waitForFunction(id=>window.currentOverviewState?.section===id,section);
 await checkUnassignedParts(section);
}
async function choose(mode){
 await page.locator('[data-choose-approach="'+mode+'"]').click();
 await page.waitForFunction(value=>window.currentOverviewState?.approach===value,mode);
 if(await page.evaluate(()=>window.currentOverviewState?.section)!=='overview')await select('overview');
 await settled();
}
async function ready(kind){
 const f=await (await page.locator('#current-board-preview').elementHandle()).contentFrame();
 await f.waitForURL(new URL(await page.locator('#current-board-preview').getAttribute('src'),base).href);
 await f.waitForFunction(type=>type==='reference'?[...document.images].some(img=>img.complete&&img.naturalWidth>0):type==='image'?window.drawingState?.ready:type==='native'?window.nativePcbViewer?.getState().ready:type==='fpga3d'?window.fpga3dViewer?.getState().ready:type==='carrier3d'?window.carrierViewer?.getState().assemblyReady:type==='assembly'?document.documentElement.dataset.sceneReady==='true'&&window.currentAssemblyViewer?.getState().ready:window.fpgaLdoViewer?.getState().ready,kind,{timeout:90000});
 return f;
}
async function settled(){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
async function checkUnassignedParts(section){
 check((await page.locator('#owners').innerText()).trim()===''&&!/\b(?:Gerald|Zitong|Howard|Jiaao)\b/i.test(await page.locator('#overview-team').innerText()),'Current '+section+' parts do not assign people');
}
async function checkAssembly(frame,architecture,focus){
 await frame.waitForFunction(([mode,part])=>{const state=window.currentAssemblyViewer?.getState();return state?.ready&&!state.error&&state.architecture===mode&&state.focus===part&&document.getElementById('status').hidden;},[architecture,focus]);
 const state=await frame.evaluate(()=>currentAssemblyViewer.getState());
 const common=['asic','brk','interposer','xem'],compact=architecture==='separate'?['fpga','ldo']:['combined'];
 check([...common,...compact].every(id=>state.loadedModels.includes(id)&&state.geometry[id]?.triangles>0&&state.geometry[id]?.meshes>0),'Current '+architecture+' composite loads source-derived ASIC, compact electronics and three host-board models');
 check(state.geometry.brk.triangles>=565156&&state.geometry.interposer.triangles>=271492&&state.geometry.xem.triangles>=945424,'Current '+architecture+' composite retains the complete BRK and XEM models and detailed interposer geometry');
 const expected=['asic-1','asic-2','asic-3','asic-4','brk','interposer','xem',...compact];
 const visible=Object.entries(state.visible).filter(([,shown])=>shown).map(([id])=>id).sort();
 check(JSON.stringify(visible)===JSON.stringify(expected.sort())&&state.modelCount===expected.length,'Current '+architecture+' composite shows four ASIC boards and only its selected electronics option');
 check(await frame.locator('html').getAttribute('data-architecture')===architecture&&await frame.locator('html').getAttribute('data-modelcount')===String(expected.length),'Current composite DOM diagnostics match the '+architecture+' scene');
 if(architecture==='combined')check(state.geometry.combined.triangles>1000&&/V7/.test(await frame.locator('[data-board="combined"]').innerText()),'Combined native model and its visible label identify V7');
 check(state.versions.asic==='PCB-5'&&state.versions.interposer==='V4'&&state.versions.xem==='XEM8305'&&(architecture==='separate'?state.versions.fpga==='V41'&&state.versions.ldo==='V5':state.versions.combined==='V7'),'Current '+architecture+' composite identifies the current source revisions');
 check(Number.isFinite(state.layout?.compactHostGapMm)&&Number.isFinite(state.layout?.requiredGapMm)&&state.layout.requiredGapMm>=65&&state.layout.compactHostGapMm>=state.layout.requiredGapMm,'Current '+architecture+' electronics have a measured clear gap from the BRK host stack');
 check(state.cable?.type==='micro-HDMI'&&state.cable.illustrative===true&&state.cable.from===(architecture==='separate'?'fpga':'combined')&&state.cable.to==='interposer','Current '+architecture+' micro-HDMI cable connects the selected FPGA electronics to the interposer');
 check(Number(await frame.locator('html').getAttribute('data-compact-host-gap-mm'))===state.layout.compactHostGapMm&&await frame.locator('html').getAttribute('data-cable-type')==='micro-HDMI','Current '+architecture+' cable and clear-gap DOM diagnostics match the scene');
 check(state.focus===focus,'Current composite focus is '+focus);
}
async function checkInterposerInspection(frame,architecture){
 await frame.locator('[data-focus="interposer"]').click();
 await frame.waitForFunction(()=>{const state=window.currentAssemblyViewer?.getState();return state?.focus==='interposer'&&state.pose==='top'&&state.modelCount===1;});
 const state=await frame.evaluate(()=>currentAssemblyViewer.getState());
 const visible=Object.entries(state.visible).filter(([,shown])=>shown).map(([id])=>id);
 check(visible.length===1&&visible[0]==='interposer'&&state.modelCount===1,'Interposer inspection hides ASICs, compact electronics, BRK and XEM in the '+architecture+' option');
 check(await frame.locator('html').getAttribute('data-modelcount')==='1'&&await frame.locator('[data-focus="interposer"]').getAttribute('aria-pressed')==='true','Interposer inspection DOM diagnostics identify its isolated model');
 check(state.cable?.visible===false,'Interposer inspection hides the illustrative cable in the '+architecture+' option');
 const references=state.geometry.interposer.references;
 check(Array.isArray(references)&&references.length===52&&new Set(references).size===52&&references.includes('J600'),'Detailed interposer retains all 52 source component references, including micro-HDMI J600');
 const surfaces=state.geometry.interposer.surfaces;
 const count=value=>typeof value==='number'?value:value&&typeof value==='object'?Object.values(value).reduce((sum,item)=>sum+count(item),0):0;
 check(surfaces&&['pad','silk','mask'].every(kind=>Object.entries(surfaces).some(([key,value])=>key.toLowerCase().includes(kind)&&count(value)>0)),'Detailed interposer includes native pad, silkscreen and mask surfaces');
 check(await frame.locator('[data-pose="top"]').getAttribute('aria-pressed')==='true','Interposer inspection starts in the Top view');
 check(state.camera[2]>state.target[2],'Interposer Top camera looks down onto the board');
 await frame.locator('[data-pose="bottom"]').click();
 await frame.waitForFunction(()=>currentAssemblyViewer.getState().pose==='bottom');
 check(await frame.locator('[data-pose="bottom"]').getAttribute('aria-pressed')==='true'&&await frame.locator('[data-pose="top"]').getAttribute('aria-pressed')==='false','Detailed interposer Bottom view selects the underside camera');
 check(await frame.evaluate(()=>{const s=currentAssemblyViewer.getState();return s.camera[2]<s.target[2];}),'Interposer Bottom camera looks up at the underside of the board');
 check(await frame.evaluate(()=>currentAssemblyViewer.getState().modelCount)===1,'Changing to Bottom keeps the interposer isolated');
 await frame.locator('[data-pose="top"]').click();
 await frame.waitForFunction(()=>currentAssemblyViewer.getState().pose==='top');
 await frame.locator('[data-focus="all"]').click();
 await checkAssembly(frame,architecture,'all');
 check((await frame.evaluate(()=>currentAssemblyViewer.getState().layout.compactHostGapMm))>=70-1e-6,'Fit all restores the '+architecture+' assembly with at least 70 mm between compact electronics and host');
 check(await frame.evaluate(()=>currentAssemblyViewer.getState().cable.visible)===true,'Fit all restores the illustrative micro-HDMI cable');
}
async function visibleIds(selector){return page.locator(selector+':visible').evaluateAll(items=>items.map(x=>x.dataset.slide));}
async function routeOnly(mode){
 const other=mode==='custom'?'direct':'custom';
 check(JSON.stringify(await visibleIds('.system-nav [data-slide]'))===JSON.stringify(routes[mode]),mode+' navigation contains only its selected route');
 check(await page.locator('.approach-card:visible').count()===1&&await page.locator('.approach-card[data-approach="'+mode+'"]').isVisible()&&!(await page.locator('.approach-card[data-approach="'+other+'"]').isVisible()),mode+' overview shows one flow and hides the other flow');
 const teamIds=await visibleIds('#overview-team [data-slide]');
 check(JSON.stringify(teamIds)===JSON.stringify(routes[mode].slice(1)),mode+' overview board links contain only its route');
 await checkUnassignedParts(mode+' overview');
 check(await page.locator('[data-choose-approach="'+mode+'"]').getAttribute('aria-pressed')==='true'&&await page.locator('[data-choose-approach="'+other+'"]').getAttribute('aria-pressed')==='false',mode+' is the only selected approach button');
 check(new URL(page.url()).searchParams.get('approach')===mode,mode+' selection is retained in the URL');
 check(await page.locator('#total-pages').innerText()===String(routes[mode].length).padStart(2,'0'),mode+' page count excludes the hidden route');
}
async function routeNavigation(mode){
 await choose(mode);await routeOnly(mode);
 const ids=routes[mode];
 check(await page.locator('#previous').isDisabled()&&!(await page.locator('#next').isDisabled()),mode+' overview is the first navigation endpoint');
 await page.locator('#next').click();await page.waitForFunction(()=>window.currentOverviewState?.section==='carriers');
 check(await page.locator('#current-page').innerText()==='02',mode+' Next advances within the selected route');
 await page.locator('#previous').click();await page.waitForFunction(()=>window.currentOverviewState?.section==='overview');
 await page.locator('#slide-title').click();
 for(let i=1;i<ids.length;i++){
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(id=>window.currentOverviewState?.section===id,ids[i]);
  check(await page.locator('#current-page').innerText()===String(i+1).padStart(2,'0'),mode+' keyboard navigation reaches only '+ids[i]);
 }
 check(await page.locator('#next').isDisabled(),mode+' last section disables Next');
 await page.keyboard.press('ArrowRight');await settled();
 check(await page.evaluate(()=>window.currentOverviewState.section)===ids.at(-1),mode+' ArrowRight remains at its final endpoint');
 await page.keyboard.press('Home');await page.waitForFunction(()=>window.currentOverviewState?.section==='overview');
 await page.keyboard.press('ArrowLeft');await settled();
 check(await page.evaluate(()=>window.currentOverviewState.section)==='overview',mode+' ArrowLeft remains at its first endpoint');
 await page.keyboard.press('End');await page.waitForFunction(id=>window.currentOverviewState?.section===id,ids.at(-1));
 check(await page.locator('#next').isDisabled(),mode+' End selects its own final section');
 await page.keyboard.press('Home');await page.waitForFunction(()=>window.currentOverviewState?.section==='overview');
}
async function checkResponsive(width,height,desktop){
 await page.setViewportSize({width,height});
 for(const [mode,ids] of Object.entries(routes)){
  await choose(mode);await routeOnly(mode);
  for(const id of ids){
   await select(id);
   let previewKind;
   if(id==='routing'){
    await page.locator('#power-architecture').selectOption('separate');
    await page.waitForFunction(()=>window.currentOverviewState?.board==='separate');
    previewKind='stack';
   }else if(mode==='custom'&&['overview','carriers','adapter'].includes(id))previewKind='assembly';
   else if(id==='fpga')previewKind='fpga3d';
   else if(id==='receiver'||id==='overview'&&mode==='direct')previewKind='carrier3d';
   else if(id==='carriers'&&mode==='direct')previewKind='reference';
   if(previewKind){
    if(await page.locator('[data-current-view="3d"]').isVisible())await page.locator('[data-current-view="3d"]').click();
    await page.waitForFunction(()=>window.currentOverviewState?.view==='3d');
   }
   await settled();
   const fit=await page.evaluate(()=>{
    const nav=document.querySelector('.system-nav'),footer=document.querySelector('footer');
    const inScreen=element=>{const r=element.getBoundingClientRect();return r.width>0&&r.height>0&&r.left>=-1&&r.right<=innerWidth+1&&r.top>=-1&&r.bottom<=innerHeight+1;};
    const buttons=[...nav.querySelectorAll('[data-slide]')].filter(button=>{const r=button.getBoundingClientRect();return r.width>0&&r.height>0;});
    return {
     noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1,
     noVerticalOverflow:document.documentElement.scrollHeight<=innerHeight+1,
     navInScreen:inScreen(nav),footerInScreen:inScreen(footer),
     navWithoutHorizontalScroll:nav.scrollWidth<=nav.clientWidth+1,
     visibleButtons:buttons.length,
     navButtonsFit:buttons.every(button=>{const r=button.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1;})
    };
   });
   const label=mode+' / '+id+' at '+width+' × '+height;
   check(fit.noHorizontalOverflow,'No horizontal page overflow in '+label);
   check(fit.navWithoutHorizontalScroll&&fit.navButtonsFit&&fit.visibleButtons===ids.length,'Selected route buttons fit without horizontal scrolling in '+label);
   if(desktop){
    check(fit.noVerticalOverflow,'Desktop page fits the available height in '+label);
    check(fit.navInScreen&&fit.footerInScreen,'Desktop navigation and footer remain entirely on screen in '+label);
   }
   if(previewKind){
    const frame=await ready(previewKind);
    await frame.waitForFunction(section=>document.documentElement.dataset.overviewEmbed==='V8'&&document.documentElement.dataset.overviewSection===section&&document.getElementById('overview-embed-style')?.sheet,id);
    if(id==='overview'&&mode==='direct'){
     const overviewFit=await frame.evaluate(()=>{
      const stage=document.querySelector('.carrier-stage')?.getBoundingClientRect(),canvas=document.querySelector('#carrier-3d')?.getBoundingClientRect();
      const controlsHidden=[...document.querySelectorAll('.render-toolbar,.assembly-controls')].every(element=>{const r=element.getBoundingClientRect();return r.width===0&&r.height===0;});
      return controlsHidden&&stage?.height>=120&&canvas?.height>=120&&canvas.width>0&&canvas.left>=-1&&canvas.right<=innerWidth+1&&document.documentElement.scrollWidth<=innerWidth+1;
     });
     check(overviewFit,'Direct-LDO overview reserves a visible carrier canvas without detailed toolbars in '+label);
    }else if(previewKind==='assembly'){
     const assemblyFit=await frame.evaluate(()=>{
      const stage=document.querySelector('#stage')?.getBoundingClientRect(),canvas=document.querySelector('#assembly')?.getBoundingClientRect();
      const controls=[...document.querySelectorAll('.toolbar :is(button,select),.inspection-controls button')].filter(element=>{const r=element.getBoundingClientRect();return r.width>0&&r.height>0;});
      return stage?.height>=120&&canvas?.height>=120&&canvas.width>0&&canvas.left>=-1&&canvas.right<=innerWidth+1&&document.documentElement.scrollWidth<=innerWidth+1&&controls.every(element=>{const r=element.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1;});
     });
     check(assemblyFit,'Current composite canvas and controls fit in '+label);
    }else if(previewKind!=='reference'){
     const embeddedFit=await frame.evaluate(()=>{
      const controls=[...document.querySelectorAll(':is(.toolbar,.render-toolbar,.assembly-controls,.inspection-controls,header) :is(button,select,input)')].filter(element=>{const r=element.getBoundingClientRect();return r.width>0&&r.height>0;});
      return controls.length>0&&document.documentElement.scrollWidth<=innerWidth+1&&controls.every(element=>{const r=element.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1;});
     });
     check(embeddedFit,'Embedded board toolbar fits in '+label);
    }
   }
  }
  await select('overview');await page.screenshot({path:out+'/overview-'+mode+'-'+width+'x'+height+'.png',fullPage:true});
 }
}
try{
 await page.goto(base+'#overview',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.PRESENTATION?.getState().sourceVerified&&window.currentOverviewState?.approach==='custom');
 if(await page.locator('html').getAttribute('data-overview-version')==='V25'){
  const {checkOverviewV25}=await import('./check_overview_v25.mjs');
  await checkOverviewV25({page,base,out,check,report});
 }else if(await page.locator('html').getAttribute('data-overview-version')==='V24'){
  const {checkOverviewV24}=await import('./check_overview_v24.mjs');
  await checkOverviewV24({page,base,out,check,report});
 }else if(await page.locator('html').getAttribute('data-overview-version')==='V23'){
  const {checkOverviewV23}=await import('./check_overview_v23.mjs');
  await checkOverviewV23({page,base,out,check,ready,select,choose,routeOnly,routeNavigation,checkAssembly});
 }else{
 check(await page.locator('html').getAttribute('data-overview-version')==='V8','Current composite keeps the selected-path original structure in Overview V8');
 check(await page.evaluate(()=>window.OVERVIEW_SLIDE_CATALOG.every(slide=>Array.isArray(slide.owners)&&slide.owners.length===0)),'All current catalog sections leave people unassigned');
 check(await page.locator('.workspace > .viewer').count()===1&&await page.locator('.workspace > .story').count()===1,'Original viewer-left/story-right structure retained');
 check(JSON.stringify(await page.locator('.system-nav [data-slide]').evaluateAll(items=>items.map(x=>x.dataset.slide)))===JSON.stringify(['overview','carriers','routing','fpga','adapter','receiver']),'Original six section buttons retained for route filtering');
 check(await page.locator('.board-nav').count()===0,'Replacement sidebar removed');
 check(await page.getByRole('button',{name:'Updates',exact:true}).count()===1&&await page.locator('.current-fpga-notice').count()===0,'One Updates button replaces the yellow current-work notices');
 await page.locator('#open-updates').click();check(await page.locator('#updates-dialog').isVisible(),'Updates button opens the project updates dialog');
 await page.locator('#close-updates').click();check(!(await page.locator('#updates-dialog').isVisible()),'Updates close button dismisses the dialog');
 await page.locator('#open-updates').click();await page.keyboard.press('Escape');check(!(await page.locator('#updates-dialog').isVisible()),'Escape dismisses the Updates dialog');
 check(await page.locator('#adapter-overview .approach-card').count()===2,'Both source path cards are retained for the approach switch');
 const customCard=page.locator('#adapter-overview .custom-approach'),directCard=page.locator('#adapter-overview .direct-approach');
 check(await customCard.getAttribute('href')==='#fpga'&&/new LDO \+ custom FPGA/.test(await customCard.textContent())&&/V41/.test(await customCard.textContent()),'Approach A identifies the custom FPGA and new LDO designs');
 check(await directCard.getAttribute('href')==='#receiver'&&/existing LDO board/.test(await directCard.textContent())&&/carrier V17/.test(await directCard.textContent())&&/connects directly/.test(await directCard.textContent()),'Approach B identifies carrier V17 connecting directly to the existing LDO board');
 check(await page.locator('.system-nav b,.system-nav .pc-path').count()===0&&!/[→↔]/.test(await page.locator('.system-nav').innerText()),'Bottom section navigation does not depict the approaches as one serial chain');
 await choose('custom');await routeOnly('custom');
 check(await page.evaluate(()=>{const s=PRESENTATION.getState();return s.triangles===650&&s.sourceGeometryUnchanged&&s.sourceSHA256==='1aa6547321ffec16be82f6e58fd27fd49825b74ba4f23b1c36394f7b9f2eac46';}),'The preserved legacy 650-triangle source remains unchanged alongside the current composite');
 let assemblyFrame=await ready('assembly');
 check((await page.locator('#current-board-preview').getAttribute('src')).includes('assembly-v8/index.html')&&!(await page.locator('#scene').isVisible()),'Approach A overview opens the detailed current composite and hides the earlier assembly canvas');
 await checkAssembly(assemblyFrame,'separate','all');
 await checkInterposerInspection(assemblyFrame,'separate');
 await page.locator('#power-architecture').selectOption('combined');await page.waitForFunction(()=>window.currentOverviewState?.powerOption==='combined');
 assemblyFrame=await ready('assembly');await checkAssembly(assemblyFrame,'combined','all');
 await checkInterposerInspection(assemblyFrame,'combined');
 await assemblyFrame.locator('#separation').click();
 check(!(await assemblyFrame.evaluate(()=>currentAssemblyViewer.getState().separated)),'Combined current composite can return its host stack to nominal spacing');
 await checkAssembly(assemblyFrame,'combined','all');
 await assemblyFrame.locator('#separation').click();
 check(await assemblyFrame.evaluate(()=>currentAssemblyViewer.getState().separated),'Combined current composite can separate its host stack for inspection');
 await checkAssembly(assemblyFrame,'combined','all');
 await page.locator('#power-architecture').selectOption('separate');await page.waitForFunction(()=>window.currentOverviewState?.powerOption==='separate');
 assemblyFrame=await ready('assembly');await checkAssembly(assemblyFrame,'separate','all');
 await assemblyFrame.locator('[data-pose="top"]').click();check(await assemblyFrame.evaluate(()=>currentAssemblyViewer.getState().pose)==='top','Current composite Top camera works');
 await assemblyFrame.locator('[data-pose="side"]').click();check(await assemblyFrame.evaluate(()=>currentAssemblyViewer.getState().pose)==='side','Current composite Side camera works');
 await assemblyFrame.locator('[data-focus="host"]').click();check(await assemblyFrame.evaluate(()=>currentAssemblyViewer.getState().focus)==='host','Current composite can focus the complete current host stack');
 await assemblyFrame.locator('[data-focus="all"]').click();await assemblyFrame.locator('[data-pose="iso"]').click();
 await assemblyFrame.locator('#separation').click();check(!(await assemblyFrame.evaluate(()=>currentAssemblyViewer.getState().separated)),'Current composite can return its board stacks to nominal spacing');
 await checkAssembly(assemblyFrame,'separate','all');
 await assemblyFrame.locator('#separation').click();
 check(await assemblyFrame.evaluate(()=>currentAssemblyViewer.getState().separated),'Separate current composite can separate its board stacks for inspection');
 await checkAssembly(assemblyFrame,'separate','all');
 await assemblyFrame.locator('[data-board="fpga"]').click();await page.waitForFunction(()=>window.currentOverviewState?.section==='fpga');
 check(await page.locator('#approach-label').innerText()==='A · Custom FPGA approach','Selecting the current 3D FPGA opens its existing details section');
 await select('carriers');assemblyFrame=await ready('assembly');await checkAssembly(assemblyFrame,'separate','asic');
 await select('adapter');assemblyFrame=await ready('assembly');await checkAssembly(assemblyFrame,'separate','host');
 check((await page.locator('#slide-description').innerText()).includes('83 × 53')&&(await page.locator('#slide-title').innerText()).includes('V4'),'Current interposer V4 replaces the earlier adapter in the live section');
 check((await page.locator('#open-adapter-design').getAttribute('href')).includes('overview-2026-10-15-v5.html#adapter'),'The dated September adapter remains linked in the exact V5 archive');
 await select('overview');
 await customCard.click();await page.waitForFunction(()=>window.currentOverviewState?.section==='fpga');
 check(await page.locator('#approach-label').innerText()==='A · Custom FPGA approach','Approach A flow opens its current FPGA section');
 await choose('direct');await routeOnly('direct');await ready('carrier3d');
 check((await page.locator('#current-board-preview').getAttribute('src')).includes('carrier_viewer')&&!(await page.locator('#scene').isVisible()),'Approach B overview shows its carrier assembly and hides the custom overview canvas');
 await select('carriers');await ready('reference');
 check((await page.locator('#current-board-preview').getAttribute('src')).includes('asic-reference-v5.html')&&!(await page.locator('#scene').isVisible()),'Approach B ASIC reference hides the earlier custom FPGA assembly');
 await select('overview');await directCard.click();await page.waitForFunction(()=>window.currentOverviewState?.section==='receiver');
 check(await page.locator('#approach-label').innerText()==='B · Parallel direct-LDO approach'&&/connects[\s\S]*directly to the existing LDO board/.test(await page.locator('#slide-description').innerText()),'Approach B flow opens its direct-LDO carrier section');
 await routeNavigation('custom');await routeNavigation('direct');
 await choose('custom');await select('fpga');await choose('direct');
 await page.goBack();await page.waitForFunction(()=>window.currentOverviewState?.approach==='custom'&&window.currentOverviewState?.section==='fpga');
 check(new URL(page.url()).searchParams.get('approach')==='custom','Back restores the prior approach and selected board');
 await page.goForward();await page.waitForFunction(()=>window.currentOverviewState?.approach==='direct'&&window.currentOverviewState?.section==='overview');
 check(new URL(page.url()).searchParams.get('approach')==='direct','Forward restores the direct-LDO overview');
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.currentOverviewState?.approach==='direct');await routeOnly('direct');
 check(await page.locator('#approach-label').innerText()==='B · Parallel direct-LDO approach','Reload preserves the selected direct-LDO approach');
 for(const [hash,query,mode] of [['receiver','custom','direct'],['fpga','direct','custom']]){
  const url=new URL(base);url.searchParams.set('approach',query);url.hash=hash;
  await page.goto(url.href,{waitUntil:'domcontentloaded'});await page.waitForFunction(([id,value])=>window.currentOverviewState?.section===id&&window.currentOverviewState?.approach===value,[hash,mode]);
  check(new URL(page.url()).searchParams.get('approach')===mode,'Deep #'+hash+' links select and retain their own approach');
 }
 check((await page.locator('#slide-title').innerText()).includes('V41'),'Original FPGA section shows current V41');await ready('fpga3d');
 await page.locator('[data-current-view="layout"]').click();let f=await ready('native');
 check(await f.evaluate(()=>nativePcbViewer.getState().sourceSHA256==='9b115f6dc2146db157458ca5f9ba8ec0439f61da7359b050244cf347dae1c4c0'),'V41 native layout is the current checkpoint');
 check((await page.locator('#open-fpga-design').getAttribute('href')).includes('FPGA_V41_Complete_KiCad'),'V41 complete native download linked');
 await select('routing');check((await page.locator('#slide-title').innerText()).includes('V5'),'Original Routing + LDO section shows separate V5');await ready('stack');
 await page.locator('[data-current-view="layout"]').click();f=await ready('native');
 check(await f.evaluate(()=>nativePcbViewer.getState().sourceSHA256==='f5d07985f5ff749ec338c609dc0ac859e8f74c0e97a381e711346547d55d42e6'),'V5 native layout is the current placement');
 await page.locator('#power-architecture').selectOption('combined');await page.waitForFunction(()=>window.currentOverviewState?.board==='combined');await ready('image');
 check((await page.locator('#slide-title').innerText()).includes('V7')&&(await page.locator('#slide-description').innerText()).includes('30 × 30'),'Combined V7 preview stays inside the original LDO section');
 check(await page.locator('[data-current-view="3d"]').isVisible(),'Combined V7 has its own current native 3D view');
 if(await page.locator('[data-current-view="3d"]').isVisible())await page.locator('[data-current-view="3d"]').click();f=await ready('assembly');await checkAssembly(f,'combined','compact');
 check((await page.locator('#open-ldo-design').getAttribute('href')).includes('Combined_FPGA_Shared_LDO_V7'),'V7 complete native download linked');
 await page.locator('[data-current-view="schematic"]').click();await ready('image');
 await select('adapter');await ready('assembly');check((await page.locator('#slide-title').innerText()).includes('V4'),'The adapter section displays the current physical V4 host stack');
 await page.locator('#detail-button').click();check(await page.locator('#notes-dialog').isVisible(),'Original technical notes dialog works');await page.locator('#close-notes').click();
 await select('overview');assemblyFrame=await ready('assembly');await assemblyFrame.locator('[data-pose="top"]').click();await assemblyFrame.waitForFunction(()=>currentAssemblyViewer.getState().pose==='top');check(await assemblyFrame.locator('[data-pose="top"]').getAttribute('aria-pressed')==='true','Current overview Top camera remains usable after visiting board details');await assemblyFrame.locator('[data-pose="iso"]').click();await assemblyFrame.waitForFunction(()=>currentAssemblyViewer.getState().pose==='iso');
 await choose('direct');await select('receiver');check((await page.locator('#slide-title').innerText()).includes('V17'),'Direct-LDO carrier section shows V17');await ready('carrier3d');
 await page.locator('[data-current-view="schematic"]').click();await ready('image');
 check((await page.locator('#open-receiver-design').getAttribute('href')).includes('Carrier_V17_Complete_KiCad'),'V17 complete native download linked');
 for(const [width,height,desktop] of [[1440,900,true],[1280,720,true],[1024,768,false],[768,1024,false],[390,844,false]])await checkResponsive(width,height,desktop);
 for(const suffix of ['', '?asset=unknown']){
  await page.goto(base+'presentation/overview/image-viewer.html'+suffix,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.drawingState?.ready,null,{timeout:90000});
  check(await page.locator('#drawing-picker').inputValue()==='fpga-schematic','Direct drawing fallback remains available');
 }
 }
 check(report.pageErrors.length===0,'No browser JavaScript errors');check(report.httpErrors.length===0,'No failed HTTP resources');report.passed=true;
}catch(error){report.passed=false;report.error=error.stack;console.error(error.stack);process.exitCode=1;}
finally{await browser.close();await writeFile(out+'/Browser_Check.json',JSON.stringify(report,null,2)+'\n');}
