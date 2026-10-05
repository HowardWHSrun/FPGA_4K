import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const base=(process.env.FPGA_BASE_URL||'https://howardwhsrun.github.io/FPGA_4K/').replace(/\/?$/,'/');
const out=process.env.FPGA_3D_OUTPUT_DIR||'fpga-browser-check/3d';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const report={base,checks:[],errors:[]};page.on('pageerror',e=>report.errors.push(e.message));
const check=(test,message)=>{if(!test)throw new Error(message);report.checks.push(message);console.log("PASS",message);};
async function openReview(target,id,label){
 const load=target.locator('[data-preview-load]');
 if(id==='fpga35t-r39'){
  await load.waitFor({state:'visible'});
  check(await target.evaluate(()=>window.reviewPreview?.ready===false),label+' R39 waits for explicit loading');
  await load.click();
 }else if(await load.count())await load.click();
 await target.waitForFunction(()=>window.reviewPreview?.ready,{},{timeout:120000});
}
try{
 for(const board of ['fpga50t','usb-c','micro-hdmi']){
  const metadata=await (await page.request.get(base+'presentation/fpga/3d/assets/'+board+'.json')).json();
  const count=metadata.parts.filter(p=>p.model==='KiCad library').length;
  const simple=metadata.parts.filter(p=>p.model==='simplified body').length;
  check(metadata.library_model_count===count&&metadata.simplified_body_count===simple&&new Set(metadata.parts.map(p=>p.ref)).size===metadata.parts.length,board+' metadata coverage');
  await page.goto(base+'presentation/fpga/3d/?board='+board);await page.waitForFunction(()=>window.FPGA_3D?.getState().ready,{},{timeout:60000});
  let s=await page.evaluate(()=>FPGA_3D.getState());check(s.board===board&&s.libraryModels===count&&s.simplifiedBodies===simple,board+' source coverage');
  await page.screenshot({path:`${out}/${board}-3d.png`});
  for(const view of ['top','bottom','side','iso']){await page.locator(`[data-view="${view}"]`).click();s=await page.evaluate(()=>FPGA_3D.getState());check(s.view===view,board+' '+view+' preset');}
  const before=s.camera;await page.locator('#in').click();s=await page.evaluate(()=>FPGA_3D.getState());check(Math.hypot(...s.camera)<Math.hypot(...before),board+' zoom');
  await page.locator('#coverage').click();await page.locator('#simplified').uncheck();check(!(await page.evaluate(()=>FPGA_3D.getState().simplified)),board+' simplified bodies can be hidden');await page.locator('#simplified').check();await page.locator('#coverage').click();
  const canvas=await page.locator('#scene').boundingBox();await page.mouse.move(canvas.x+canvas.width*.55,canvas.y+canvas.height*.5);await page.mouse.down();await page.mouse.move(canvas.x+canvas.width*.7,canvas.y+canvas.height*.55,{steps:10});await page.mouse.up();check(JSON.stringify((await page.evaluate(()=>FPGA_3D.getState())).camera)!==JSON.stringify(s.camera),board+' drag rotates');
 }
 await page.locator('#revision').selectOption('usb-c');await page.waitForFunction(()=>window.FPGA_3D?.getState().ready&&FPGA_3D.getState().board==='usb-c');check((await page.locator('#title').innerText()).includes('USB-C'),'revision switch');
 await page.goto(base+'presentation/fpga/');await page.locator('[data-view="3d"]').click();const featuredFrame=await (await page.locator('#three-board').elementHandle()).contentFrame();await featuredFrame.waitForFunction(()=>window.FPGA_3D?.getState().ready,{},{timeout:60000});check(await featuredFrame.evaluate(()=>FPGA_3D.getState().board==='fpga50t'),'featured page 3D tab shows 50T');await page.locator('[data-view="native"]').click();check(await page.locator('#native-board').isVisible(),'featured page restores native view');
 for(const path of ['presentation/fpga/micro-hdmi.html','presentation/fpga/usb-c.html']){
  await page.goto(base+path);await page.locator('#three').click();const frame=await (await page.locator('#three-frame').elementHandle()).contentFrame();await frame.waitForFunction(()=>window.FPGA_3D?.getState().ready,{},{timeout:60000});
  check(await page.locator('#three-panel').isVisible()&&!(await page.locator('#viewport').isVisible())&&!(await page.locator('#native-panel').isVisible()),path+' exclusive 3D tab');check(!(await frame.locator('.revision').isVisible()),path+' revision locked to surrounding review');
  await page.screenshot({path:`${out}/${path.includes('micro')?'micro':'usb'}-review.png`});await page.locator('#back').click();check(await page.locator('#viewport').isVisible()&&!(await page.locator('#three-panel').isVisible()),path+' back layout restored');
 }
 await page.goto(base+'#fpga');const system=await (await page.locator('#fpga-system-3d').elementHandle()).contentFrame();await openReview(system,'fpga35t-r39','system preview');
 check((await system.evaluate(()=>reviewPreview.model))==='fpga35t-r39','system shows current 35T R39 preview');
 check((await page.locator('#facts').innerText()).includes('35T'),'system facts name current 35T');
 check((await page.locator('#open-fpga-design').getAttribute('href')).includes('current-35t.html'),'system links to current 35T review');
 await page.screenshot({path:`${out}/system.png`});
 await page.goto(base+'#overview');check(!(await page.locator('#fpga-system-3d').isVisible()),'overview keeps the current preview hidden');
 for(const [path,id] of [['presentation/fpga/current-35t.html','fpga35t-r39'],['presentation/fpga/review-r37-2026-10-04.html','fpga35t-r37'],['presentation/ldo-backup/current-e5.html','ldo-e5'],['presentation/xem/current-a1r2.html','xem8305-a1r2'],['presentation/library/bonding-fixture.html','bonding-v6']]){
  await page.goto(base+path);await openReview(page,id,'desktop preview');
  check((await page.evaluate(()=>reviewPreview.model))===id,id+' model loads');
  for(const view of ['top','bottom','side','iso']){await page.locator(`[data-preview-view="${view}"]`).click();check((await page.evaluate(()=>reviewPreview.view))===view,id+' '+view+' preset');}
  await page.locator('[data-preview-in]').click();check((await page.evaluate(()=>reviewPreview.zoom))>1,id+' zoom works');await page.locator('[data-preview-reset]').click();
  const before=await page.evaluate(()=>reviewPreview.camera),box=await page.locator('.preview-stage canvas').boundingBox();await page.mouse.move(box.x+box.width*.45,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.65,box.y+box.height*.6,{steps:10});await page.mouse.up();
  check(JSON.stringify(await page.evaluate(()=>reviewPreview.camera))!==JSON.stringify(before),id+' drag rotates');
  await page.screenshot({path:`${out}/${id}.png`});
 }
 await page.setViewportSize({width:390,height:844});
 for(const board of ['fpga50t','usb-c']){
  await page.goto(base+'presentation/fpga/3d/?board='+board);
  await page.waitForFunction(()=>window.FPGA_3D?.getState().ready,{},{timeout:60000});
  check(await page.evaluate(expected=>document.documentElement.scrollWidth<=innerWidth&&FPGA_3D.getState().board===expected,board),board+' 3D mobile fits width and loads the selected board');
  const before=await page.evaluate(()=>Math.hypot(...FPGA_3D.getState().camera));
  await page.locator('#in').click();
  check(await page.evaluate(previous=>Math.hypot(...FPGA_3D.getState().camera)<previous,before),board+' mobile zoom control moves closer');
  await page.locator('#reset').click();
  await page.screenshot({path:`${out}/${board}-mobile.png`});
 }
 for(const [path,id] of [['presentation/fpga/current-35t.html','fpga35t-r39'],['presentation/fpga/review-r37-2026-10-04.html','fpga35t-r37'],['presentation/ldo-backup/current-e5.html','ldo-e5'],['presentation/xem/current-a1r2.html','xem8305-a1r2'],['presentation/library/bonding-fixture.html','bonding-v6']]){
  await page.goto(base+path);await openReview(page,id,'mobile preview');
  check((await page.evaluate(()=>reviewPreview.model))===id,id+' mobile model loads');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),id+' mobile fits width');await page.locator('[data-preview-in]').click();check((await page.evaluate(()=>reviewPreview.zoom))>1,id+' mobile zoom works');
 }
 check(report.errors.length===0,'no JavaScript page errors');report.status='passed';
}catch(e){report.status='failed';report.failure=e.stack;await page.screenshot({path:`${out}/failure.png`});process.exitCode=1;}
await writeFile(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();
