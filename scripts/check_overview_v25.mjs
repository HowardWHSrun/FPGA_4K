/* Overview V25 regression checks for the current Carrier V1 alternative.
 * The main runner owns browser setup, error collection, screenshots directory
 * and the final zero-error checks. Historical V23/V8 checks remain unchanged.
 * These checks verify published CAD/model scope and presentation behavior.
 */
export async function checkOverviewV25({page,base,out,check,report}){
async function currentFrame(){
 await page.waitForFunction(()=>window.currentOverviewState?.source?.includes('carrier-assembly-v2/'));
 const iframe=page.locator('#current-board-preview');
 const f=await (await iframe.elementHandle()).contentFrame();
 await f.waitForURL(new URL(await iframe.getAttribute('src'),base).href);
 await f.waitForFunction(()=>document.body?.dataset.ready==='true'&&window.carrierAssemblyViewer?.getState().ready,null,{timeout:90000});return f;
}
async function readyState(f){return f.evaluate(()=>window.carrierAssemblyViewer.getState());}
async function select(section){await page.locator('.system-nav [data-slide="'+section+'"]').click();await page.waitForFunction(id=>window.currentOverviewState?.section===id,section);}
 await page.goto(base+'?approach=direct#overview',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.currentOverviewState?.approach==='direct'&&window.currentOverviewState?.section==='overview');
 check(await page.locator('html').getAttribute('data-overview-version')==='V25','Main page identifies Overview V25');
 let frame=await currentFrame(),state=await readyState(frame);
 report.carrierV25={sourceSHA256:state.sourceSHA256,bodyCount:state.bodyCount,verifiedBodies:state.verifiedBodies,featureCount:state.featureCount,revision:state.revision};
 check(state.ready&&!state.error&&state.revision==='V2','Direct Overview loads the new Carrier_V1 viewer');
 check(state.bodyCount===80&&state.verifiedBodies===80&&state.featureCount===12,'New viewer reports80 verified native component bodies and12 bare board features',state);
 check(state.sourceSHA256==='5caf9b364ec5ce7ba98a2e82c6d69d306f2a07f1fd13243a46281236f8e50fcc','New viewer identifies the verified native PCB source');
 check(/80\s*\/\s*80|all\s*80/i.test(await frame.locator('body').innerText())&&/3D|model/i.test(await frame.locator('body').innerText()),'Visible verification language states the80-body3D scope');
 const boardIds=Object.keys(state.boards).sort();
 check(JSON.stringify(boardIds)===JSON.stringify(['carrier','ldo','xem']),'Whole assembly loads the current carrier, XEM8305 and original LDO');
 check(state.assemblyReady&&state.assemblyBodyCount===156&&state.boards.carrier.bodyCount===80&&state.boards.xem.bodyCount===13&&state.boards.ldo.bodyCount===63,'Assembly geometry has80 carrier bodies,13 XEM major/connector envelopes and63 LDO bodies');
 check(state.connectorPairs===5,'Five mating connector guides are present');
 check(Object.values(state.boards).every(b=>b.loaded&&b.visible),'All three boards are loaded and visible by default');
 check(/Carrier:\s*80\s*\/\s*80/.test(await frame.locator('#verified-count').innerText()),'Native80-body verification is explicitly scoped to the carrier');
 await frame.locator('#seated').click();await frame.waitForFunction(()=>carrierAssemblyViewer.getState().explosion===0);
 const seated=await readyState(frame);
 check(Math.abs(seated.boards.xem.position[2]-6.5469454)<.000001&&Math.abs(seated.boards.ldo.position[2]+3.6)<.000001&&seated.boards.carrier.position.every(v=>v===0),'Seated view uses audited nominal board midplanes');
 await frame.locator('#exploded').click();await frame.waitForFunction(()=>carrierAssemblyViewer.getState().explosion===22);
 const exploded=await readyState(frame);
 check(Math.abs(exploded.boards.xem.position[2]-seated.boards.xem.position[2]-22)<.000001&&Math.abs(exploded.boards.ldo.position[2]-seated.boards.ldo.position[2]+22)<.000001,'Exploded control physically separates XEM and LDO in opposite directions');
 check(JSON.stringify(exploded.boards.carrier.position)===JSON.stringify(seated.boards.carrier.position)&&['xem','ldo'].every(id=>exploded.boards[id].position.slice(0,2).every((v,i)=>v===seated.boards[id].position[i])),'Explosion preserves carrier placement and both mating XY registrations');
 await frame.locator('#explosion').evaluate(input=>{input.value='7';input.dispatchEvent(new Event('input',{bubbles:true}));});
 await frame.waitForFunction(()=>carrierAssemblyViewer.getState().explosion===7);
 check(/7 mm/.test(await frame.locator('#explosion-value').innerText()),'Illustration spacing slider updates the actual model and visible value');
 for(const id of ['xem','carrier','ldo','all']){
  await frame.locator('[data-focus="'+id+'"]').click();await frame.waitForFunction(value=>carrierAssemblyViewer.getState().focus===value,id);
  const focused=await readyState(frame);
  check(Object.entries(focused.boards).every(([board,b])=>b.visible===(id==='all'||board===id)),'Board focus shows only '+id);
 }
 await frame.locator('[data-board-visibility="xem"]').uncheck();
 check((await readyState(frame)).boards.xem.visible===false&&(await readyState(frame)).boards.carrier.visible,'XEM visibility control hides only the module');
 await frame.locator('[data-focus="all"]').click();await frame.locator('#seated').click();await frame.locator('[data-pose="side"]').click();
 await page.screenshot({path:out+'/assembly-seated-side.png',fullPage:true});
 await frame.locator('#exploded').click();await frame.locator('[data-pose="iso"]').click();
 await page.screenshot({path:out+'/assembly-separated-iso.png',fullPage:true});
 for(const view of ['layout','schematic','3d']){
  await frame.locator('button[data-view="'+view+'"]').click();await frame.waitForFunction(v=>document.body?.dataset.view===v,view);
  check(await frame.locator('button[data-view="'+view+'"]').getAttribute('aria-pressed')==='true','Standalone '+view+' tab becomes selected');
  if(view!=='3d'){
   await frame.waitForFunction(()=>{const im=document.getElementById('drawing');return im?.complete&&im.naturalWidth>0;});
   check(await frame.locator('#drawing').isVisible(),view+' native drawing loads visibly');
  }else check(await frame.locator('#carrier-canvas').isVisible(),'3D canvas is visible after returning from the drawing tabs');
 }
 for(const pose of ['top','bottom','side','iso']){
  await frame.locator('[data-pose="'+pose+'"]').click();await frame.waitForFunction(p=>window.carrierAssemblyViewer.getState().pose===p,pose);
  check(await frame.locator('[data-pose="'+pose+'"]').getAttribute('aria-pressed')==='true','3D '+pose+' camera control works');
 }
 await page.goto(base+'presentation/overview/carrier-assembly-v2/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body?.dataset.ready==='true'&&window.carrierAssemblyViewer?.getState().ready);frame=page;
 await frame.locator('#component-picker').selectOption('U3');await frame.waitForFunction(()=>window.carrierAssemblyViewer.getState().selectedReference==='U3');
 check((await readyState(frame)).selectedReference==='U3','Component picker selects the newly modeled FTDI U3');
 await frame.locator('[data-view="layout"]').click();await frame.waitForFunction(()=>document.body?.dataset.view==='layout');
 const sideSources=[];
 for(const side of ['front','back']){
  await frame.locator('[data-layout-side="'+side+'"]').click();await frame.waitForFunction(()=>{const im=document.getElementById('drawing');return im?.complete&&im.naturalWidth>0;});
  sideSources.push(await frame.locator('#drawing').getAttribute('src'));
  check(await frame.locator('[data-layout-side="'+side+'"]').getAttribute('aria-pressed')==='true','Native '+side+' layout selector works');
 }
 check(sideSources[0]!==sideSources[1],'Front and back layout selectors load different matching native assets');
 await page.goto(base+'?approach=direct#receiver',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.currentOverviewState?.section==='receiver');frame=await currentFrame();
 check((await page.locator('#open-receiver-design').getAttribute('href')).includes('2026-10-26')&&(await page.locator('#open-receiver-design').getAttribute('href')).endsWith('.zip'),'Receiver download points to the new dated current-source package');
 for(const view of ['layout','schematic','3d']){
  await page.locator('[data-current-view="'+view+'"]').click();await page.waitForFunction(v=>window.currentOverviewState?.view===v,view);frame=await currentFrame();
  await frame.waitForFunction(v=>document.body?.dataset.view===v,view);
  check((await readyState(frame)).view===view,'Overview shell and embedded carrier '+view+' states agree');
 }
 // ApproachA retains the same saved assembly application. No supplier model files are introduced by B.
 await page.locator('[data-choose-approach="custom"]').click();await page.waitForFunction(()=>window.currentOverviewState?.approach==='custom');await select('overview');
 await page.waitForFunction(()=>window.currentOverviewState?.source?.includes('assembly-v23/'));
 check((await page.locator('#current-board-preview').getAttribute('src')).includes('assembly-v23/'),'Custom Overview retains the existing V23 assembly route');
 check((await page.locator('#open-schematic-design').getAttribute('href')).includes('assembly-v23/'),'Custom full-size assembly link is preserved');
 // Standalone mobile/desktop fit and direct receiver overview readability.
 for(const [width,height] of [[1440,1000],[390,844]]){
  await page.setViewportSize({width,height});await page.goto(base+'presentation/overview/carrier-assembly-v2/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body?.dataset.ready==='true');
  const fit=await page.evaluate(()=>{const r=document.querySelector('#carrier-canvas').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth+1,width:r.width,height:r.height};});
  check(!fit.overflow&&fit.width>100&&fit.height>100,'Standalone carrier has a usable canvas without horizontal overflow at'+width+'x'+height,fit);
  await page.screenshot({path:out+'/carrier-v1-'+width+'x'+height+'.png',fullPage:true});
  await page.goto(base+'?approach=direct#overview',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.currentOverviewState?.approach==='direct');frame=await currentFrame();
  const outer=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,frame:document.querySelector('#current-board-preview').getBoundingClientRect().height}));
  check(!outer.overflow&&outer.frame>120,'Direct Overview preserves readable carrier viewport at'+width+'x'+height,outer);
  await page.screenshot({path:out+'/overview-direct-'+width+'x'+height+'.png',fullPage:true});
 }
}
