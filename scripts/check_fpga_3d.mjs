import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.FPGA_BASE_URL||'https://howardwhsrun.github.io/FPGA_4K/';
const out='fpga-browser-check/3d';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const report={checks:[],errors:[]};page.on('pageerror',e=>report.errors.push(e.message));
const check=(test,message)=>{if(!test)throw new Error(message);report.checks.push(message);console.log("PASS",message);};
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
 await page.goto(base+'#fpga');const system=await (await page.locator('#fpga-system-3d').elementHandle()).contentFrame();await system.waitForFunction(()=>window.FPGA_3D?.getState().ready,{},{timeout:60000});const featured=await (await page.request.get(base+'presentation/fpga/3d/assets/fpga50t.json')).json();check((await page.locator('#facts').innerText()).includes(featured.dimensions_mm.slice(0,2).join(' × ')+' mm'),'system facts feature 50T');check((await system.evaluate(()=>FPGA_3D.getState().board))==='fpga50t','system features 50T first');await page.screenshot({path:`out/system.png`.replace('out',out)});
 await system.locator('#revision').selectOption('usb-c');await page.waitForFunction(()=>document.querySelector('#facts').textContent.includes('USB-C'));check((await page.locator('#open-fpga-design').getAttribute('href')).includes('usb-c.html'),'system links to separate USB-C revision');
 await system.locator('#revision').selectOption('micro-hdmi');await page.waitForFunction(()=>document.querySelector('#facts').textContent.includes('100T checkpoint'));check((await page.locator('#open-fpga-design').getAttribute('href')).includes('micro-hdmi.html#board'),'system link follows preserved 100T micro-HDMI');
 await system.locator('#revision').selectOption('fpga50t');await page.waitForFunction(()=>document.querySelector('#facts').textContent.includes('50T review'));check((await page.locator('#open-fpga-design').getAttribute('href')).includes('presentation/fpga/#board'),'system link returns to featured 50T');
 await page.goto(base+'#overview');check(!(await page.locator('#fpga-system-3d').isVisible()),'original overview preserved');
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
 check(report.errors.length===0,'no JavaScript page errors');report.status='passed';
}catch(e){report.status='failed';report.failure=e.stack;await page.screenshot({path:`${out}/failure.png`});process.exitCode=1;}
await writeFile(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();
