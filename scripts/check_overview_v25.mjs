/* Overview V25 regression checks for current Carrier V3 and the preserved
 * 26 October Carrier V1 assembly reference.
 * The main runner owns browser setup, error collection, screenshots directory
 * and the final zero-error checks. Historical V23/V8 checks remain unchanged.
 * These checks verify published CAD/model scope and presentation behavior.
 */
export async function checkOverviewV25({page,base,out,check,report}){
const pcbHash='e6525809d89d9661421273a0604793b412734b5d2d8585cf06480fa11ede7fbf';
const schHash='b35c700964fcace594003090f4bcb6474756a6d22c49ff308f670a8a5473236c';
const pcbCounts={footprints:92,pads:625,segments:628,vias:219,zones:23,copperLayers:4,nets:306};
const schCounts={symbols:165,wires:523,junctions:151,labels:27,globalLabels:62,sheets:0};
const routingLayers=['B.Cu','F.Cu'];
const sameLayers=value=>JSON.stringify([...value].sort())===JSON.stringify(routingLayers);
async function activeFrame(){
 const iframe=page.locator('#current-board-preview');
 const f=await (await iframe.elementHandle()).contentFrame();
 await f.waitForURL(new URL(await iframe.getAttribute('src'),base).href);
 return f;
}
async function currentFrame(view='3d'){
 await page.waitForFunction(v=>window.currentOverviewState?.view===v&&window.currentOverviewState?.source?.includes(v==='3d'?'carrier-assembly-v2/':'carrier-v3/'+v+'.html'),view);
 const f=await activeFrame();
 await f.waitForFunction(v=>v==='3d'?document.body?.dataset.ready==='true'&&window.carrierAssemblyViewer?.getState().ready:v==='layout'?window.nativePcbViewer?.getState().ready:window.nativeSchematicViewer?.getState().ready,view,{timeout:90000});
 return f;
}
async function readyState(f){return f.evaluate(()=>window.carrierAssemblyViewer.getState());}
async function pcbState(f){return f.evaluate(()=>window.nativePcbViewer.getState());}
async function schState(f){return f.evaluate(()=>window.nativeSchematicViewer.getState());}
async function visiblePanel(f,tag){
 await f.waitForFunction(name=>{
  function inside(root){const match=root?.querySelector(name);if(match)return match;for(const el of root?.querySelectorAll('*')||[])if(el.shadowRoot){const found=inside(el.shadowRoot);if(found)return found;}return null;}
  const rect=inside(document)?.getBoundingClientRect();return Boolean(rect&&rect.width>40&&rect.height>40);
 },tag);
}
function exactCounts(actual,expected,label){check(Object.entries(expected).every(([key,value])=>actual?.[key]===value),label,{actual,expected});}
async function currentDownloads(context){
 const link=page.locator('#open-receiver-design'),href=await link.getAttribute('href');
 check(await link.isVisible()&&href.includes('2026-10-30/carrier-v3/')&&href.endsWith('Carrier_V3_KiCad.zip'),context+' offers the dated V3 KiCad project');
 check(await page.locator('#carrier-manufacturing-links').isVisible(),context+' shows current manufacturing files');
 for(const filename of ['Carrier_V3_PCB_Gerbers.zip','Carrier_V3_Assembly_BOM.csv','Carrier_V3_CPL.csv','Carrier_V3_JLCPCB_Order_Guide.md']){
  const item=page.locator('#carrier-manufacturing-links a[href$="'+filename+'"]');
  check(await item.isVisible()&&(await item.getAttribute('href')).includes('2026-10-30/carrier-v3/'),context+' links the matching '+filename);
 }
 check(await page.locator('#open-ldo-design').isHidden(),context+' keeps historical separate-LDO downloads out of the carrier section');
}
async function select(section){await page.locator('.system-nav [data-slide="'+section+'"]').click();await page.waitForFunction(id=>window.currentOverviewState?.section===id,section);}
 await page.goto(base+'?approach=direct#overview',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.currentOverviewState?.approach==='direct'&&window.currentOverviewState?.section==='overview');
 check(await page.locator('html').getAttribute('data-overview-version')==='V25','Main page identifies Overview V25');
 let frame=await currentFrame('layout'),native=await pcbState(frame);
 report.nativeCarrierV3={sourceSHA256:native.sourceSHA256,revision:native.revision,counts:native.counts};
 check(native.ready&&!native.error&&native.revision==='V3'&&native.sourceSHA256===pcbHash,'Direct Overview defaults to the exact current V3 native PCB');
 exactCounts(native.counts,pcbCounts,'V3 native PCB preserves all routing, pads, footprints, copper layers and nets');
 check(sameLayers(native.layers)&&!native.planes&&native.references,'V3 opens with both routed outer copper layers, planes off and references on',native);
 check(/Carrier\s*·?\s*V3|carrier\s*·?\s*V3/i.test(await page.locator('#slide-title').innerText())&&/80[\s\S]*fitted parts/i.test(await page.locator('#facts').innerText()),'Current title and facts identify V3 and80 fitted parts');
 check(!/80\s*\/\s*80|verified.*bodies/i.test(await page.locator('#facts').innerText()),'Current facts do not reuse the historical80-model verification claim');
 await currentDownloads('Direct Overview');
 for(const [preset,expected]of [['front',['F.Cu']],['back',['B.Cu']],['all',['B.Cu','F.Cu','In1.Cu','In2.Cu']]]){
  await frame.locator('[data-preset="'+preset+'"]').click();
  native=await pcbState(frame);
  check(JSON.stringify([...native.layers].sort())===JSON.stringify(expected),'Native '+preset+' layer preset exposes the expected copper',native.layers);
 }
 await frame.locator('#planes').check();check((await pcbState(frame)).planes,'Filled copper plane control works');
 await frame.locator('#references').uncheck();check(!(await pcbState(frame)).references,'Silkscreen/reference visibility control works');
 await frame.locator('#parts').click();await visiblePanel(frame,'kc-board-footprints-panel');check(true,'Native Parts opens the footprint inspector');
 await frame.locator('#nets').click();await visiblePanel(frame,'kc-board-nets-panel');check(true,'Native Nets opens the net inspector');
 for(const net of ['GND','+12V']){
  await frame.evaluate(value=>nativePcbViewer.highlight(value),net);await frame.waitForFunction(value=>nativePcbViewer.getState().selectedNet===value,net);
  check(await frame.locator('#clear-net').isVisible(),'Native net selection highlights '+net+' and offers clear');
 }
 await frame.locator('#clear-net').click();check((await pcbState(frame)).selectedNet==='','Clear net removes the selected highlight');
 const beforeZoom=(await pcbState(frame)).zoom;await frame.locator('#zoom-in').click();check((await pcbState(frame)).zoom>beforeZoom,'Native layout zoom changes the camera');
 await frame.locator('#flip').click();check((await pcbState(frame)).flipped,'Native layout flip changes the viewed side');
 await frame.evaluate(()=>nativePcbViewer.reset());native=await pcbState(frame);
 check(sameLayers(native.layers)&&!native.planes&&native.references&&!native.flipped&&native.selectedNet==='','Native reset restores V3 route layers, planes, references, view and selection',native);
 await frame.locator('#fit').click();check(Number.isFinite((await pcbState(frame)).zoom),'Native Fit leaves a valid camera scale');
 await page.locator('[data-current-view="schematic"]').click();frame=await currentFrame('schematic');
 let circuit=await schState(frame);report.nativeCarrierV3.schematic={sourceSHA256:circuit.sourceSHA256,counts:circuit.counts};
 check(circuit.ready&&!circuit.error&&circuit.sourceSHA256===schHash,'Current Schematic loads the exact V3 native source');
 exactCounts(circuit.counts,schCounts,'Native schematic preserves symbols, visible wires, junctions and labels');
 const beforeSchZoom=circuit.zoom;await frame.locator('#zoom-in').click();check((await schState(frame)).zoom>beforeSchZoom,'Native schematic zoom changes the camera');
 await frame.locator('#fit').click();check(Number.isFinite((await schState(frame)).zoom),'Native schematic Fit restores a valid page view');
 await frame.locator('#parts').click();await visiblePanel(frame,'kc-schematic-symbols-panel');check(true,'Native schematic Parts opens the symbol inspector');
 check(await frame.locator('#download-native').isVisible()&&(await frame.locator('#download-native').getAttribute('href')).includes('2026-10-30/carrier-v3/native/Carrier_V1.kicad_sch'),'Native schematic download belongs to the current V3 package');
 // Select the historical 3D tab explicitly before running its retained assembly checks.
 await page.locator('[data-current-view="3d"]').click();frame=await currentFrame('3d');
 check(/Assembly reference.*26 October 2026/i.test(await page.locator('#view-label').innerText()),'The earlier3D assembly is visibly labelled as the26 October reference');
 let state=await readyState(frame);
 report.carrierV25={sourceSHA256:state.sourceSHA256,bodyCount:state.bodyCount,verifiedBodies:state.verifiedBodies,featureCount:state.featureCount,revision:state.revision};
 check(state.ready&&!state.error&&state.revision==='V2','Historical3D tab retains the earlier Carrier_V1 assembly viewer');
 check(state.bodyCount===80&&state.verifiedBodies===80&&state.featureCount===12,'Historical viewer retains80 verified native component bodies and12 bare board features',state);
 check(state.sourceSHA256==='5caf9b364ec5ce7ba98a2e82c6d69d306f2a07f1fd13243a46281236f8e50fcc','Historical viewer retains its own verified native PCB source');
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
 await page.goto(base+'?approach=direct#receiver',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.currentOverviewState?.section==='receiver');frame=await currentFrame('layout');
 check((await pcbState(frame)).sourceSHA256===pcbHash,'Receiver deep link defaults to the current native V3 layout');
 await currentDownloads('Receiver section');
 for(const view of ['layout','schematic','3d']){
  await page.locator('[data-current-view="'+view+'"]').click();frame=await currentFrame(view);
  const current=view==='3d'?await readyState(frame):view==='layout'?await pcbState(frame):await schState(frame);
  check(current.ready&&(view==='3d'?current.view==='3d':current.sourceSHA256===(view==='layout'?pcbHash:schHash)),'Overview shell and embedded carrier '+view+' source agree');
  check(await page.locator('[data-current-view="'+view+'"]').getAttribute('aria-pressed')==='true','Overview '+view+' tab is selected');
 }
 // ApproachA retains the same saved assembly application. No supplier model files are introduced by B.
 await page.locator('[data-choose-approach="custom"]').click();await page.waitForFunction(()=>window.currentOverviewState?.approach==='custom');await select('overview');
 await page.waitForFunction(()=>window.currentOverviewState?.source?.includes('assembly-v23/'));
 check((await page.locator('#current-board-preview').getAttribute('src')).includes('assembly-v23/'),'Custom Overview retains the existing V23 assembly route');
 check((await page.locator('#open-schematic-design').getAttribute('href')).includes('assembly-v23/'),'Custom full-size assembly link is preserved');
 check(await page.locator('#carrier-manufacturing-links').isHidden()&&await page.locator('#open-receiver-design').isHidden(),'Custom Overview hides carrier-specific file links');
 await select('routing');await page.waitForFunction(()=>window.currentOverviewState?.board==='separate');
 check(await page.locator('#power-architecture').inputValue()==='separate','Custom routing retains the separate LDO V5 option');
 check(await page.locator('#open-ldo-design').isVisible()&&(await page.locator('#open-ldo-design').getAttribute('href')).includes('Separate_LDO_V5_Complete_KiCad_2026-10-14.zip'),'Separate LDO V5 retains its historical project download');
 await page.locator('[data-current-view="layout"]').click();await page.waitForFunction(()=>window.currentOverviewState?.source?.includes('ldo_viewer/'));
 frame=await activeFrame();await frame.waitForFunction(()=>window.nativePcbViewer?.getState().ready,null,{timeout:90000});
 check((await pcbState(frame)).sourceSHA256==='f5d07985f5ff749ec338c609dc0ac859e8f74c0e97a381e711346547d55d42e6','Separate LDO V5 native layout remains distinct from Carrier V3');
 check(await page.locator('#carrier-manufacturing-links').isHidden()&&await page.locator('#open-receiver-design').isHidden(),'Historical LDO section does not offer Carrier V3 manufacturing links');
 // Standalone mobile/desktop fit and direct receiver overview readability.
 for(const [width,height] of [[1440,1000],[390,844]]){
  await page.setViewportSize({width,height});await page.goto(base+'presentation/overview/carrier-assembly-v2/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body?.dataset.ready==='true');
  const fit=await page.evaluate(()=>{const r=document.querySelector('#carrier-canvas').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth+1,width:r.width,height:r.height};});
  check(!fit.overflow&&fit.width>100&&fit.height>100,'Standalone carrier has a usable canvas without horizontal overflow at'+width+'x'+height,fit);
  await page.screenshot({path:out+'/carrier-v1-'+width+'x'+height+'.png',fullPage:true});
  await page.goto(base+'presentation/overview/carrier-v3/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.carrierV3Viewer?.getState().ready,null,{timeout:90000});
  check(await page.evaluate(()=>carrierV3Viewer.getState().view==='layout'&&carrierV3Viewer.getState().sourceSHA256==='e6525809d89d9661421273a0604793b412734b5d2d8585cf06480fa11ede7fbf'),'Standalone V3 opens its matching native routing at'+width+'x'+height);
  const standalone=await page.evaluate(()=>{const r=document.getElementById('native-view').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth+1,width:r.width,height:r.height};});
  check(!standalone.overflow&&standalone.width>100&&standalone.height>120,'Standalone V3 native viewport fits at'+width+'x'+height,standalone);
  for(const id of ['download-kicad','download-gerbers','download-bom','download-cpl','download-guide'])check(await page.locator('#'+id).isVisible()&&(await page.locator('#'+id).getAttribute('href')).includes('2026-10-30/carrier-v3/'),'Standalone V3 '+id+' is visible and current at'+width+'x'+height);
  await page.screenshot({path:out+'/carrier-v3-layout-'+width+'x'+height+'.png',fullPage:true});
  await page.locator('[data-view="schematic"]').click();await page.waitForFunction(()=>window.carrierV3Viewer?.getState().ready&&carrierV3Viewer.getState().view==='schematic',null,{timeout:90000});
  const standaloneSch=await page.evaluate(()=>carrierV3Viewer.getState());
  check(standaloneSch.sourceSHA256===schHash,'Standalone Schematic tab loads the exact V3 source at'+width+'x'+height);
  exactCounts(standaloneSch.counts,schCounts,'Standalone Schematic retains native circuit counts at'+width+'x'+height);
  check(await page.locator('[data-view="schematic"]').getAttribute('aria-pressed')==='true','Standalone Schematic tab is visibly selected at'+width+'x'+height);
  await page.screenshot({path:out+'/carrier-v3-schematic-'+width+'x'+height+'.png',fullPage:true});
  await page.goto(base+'?approach=direct#overview',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.currentOverviewState?.approach==='direct');frame=await currentFrame('layout');
  const outer=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,frame:document.querySelector('#current-board-preview').getBoundingClientRect().height}));
  check(!outer.overflow&&outer.frame>120,'Direct Overview preserves readable carrier viewport at'+width+'x'+height,outer);
  check((await pcbState(frame)).sourceSHA256===pcbHash,'Direct Overview remains on native V3 routing at'+width+'x'+height);
  await currentDownloads('Direct Overview at'+width+'x'+height);
  await page.screenshot({path:out+'/overview-direct-'+width+'x'+height+'.png',fullPage:true});
 }
}
