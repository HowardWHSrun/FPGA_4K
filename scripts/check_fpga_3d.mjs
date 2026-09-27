import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.FPGA_BASE_URL||'https://howardwhsrun.github.io/FPGA_4K/';
const out='fpga-browser-check/3d';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const report={checks:[],errors:[]};page.on('pageerror',e=>report.errors.push(e.message));
const check=(test,message)=>{if(!test)throw new Error(message);report.checks.push(message);console.log("PASS",message);};
try{
 for(const [board,count,simple] of [['usb-c',151,27],['micro-hdmi',112,13]]){
  await page.goto(base+'presentation/fpga/3d/?board='+board);await page.waitForFunction(()=>window.FPGA_3D?.getState().ready,{},{timeout:60000});
  let s=await page.evaluate(()=>FPGA_3D.getState());check(s.board===board&&s.libraryModels===count&&s.simplifiedBodies===simple,board+' source coverage');
  await page.screenshot({path:`${out}/${board}-3d.png`});
  for(const view of ['top','bottom','side','iso']){await page.locator(`[data-view="${view}"]`).click();s=await page.evaluate(()=>FPGA_3D.getState());check(s.view===view,board+' '+view+' preset');}
  const before=s.camera;await page.locator('#in').click();s=await page.evaluate(()=>FPGA_3D.getState());check(Math.hypot(...s.camera)<Math.hypot(...before),board+' zoom');
  await page.locator('#coverage').click();await page.locator('#simplified').uncheck();check(!(await page.evaluate(()=>FPGA_3D.getState().simplified)),board+' simplified bodies can be hidden');await page.locator('#simplified').check();await page.locator('#coverage').click();
  const canvas=await page.locator('#scene').boundingBox();await page.mouse.move(canvas.x+canvas.width*.55,canvas.y+canvas.height*.5);await page.mouse.down();await page.mouse.move(canvas.x+canvas.width*.7,canvas.y+canvas.height*.55,{steps:10});await page.mouse.up();check(JSON.stringify((await page.evaluate(()=>FPGA_3D.getState())).camera)!==JSON.stringify(s.camera),board+' drag rotates');
 }
 await page.locator('#revision').selectOption('usb-c');await page.waitForFunction(()=>window.FPGA_3D?.getState().ready&&FPGA_3D.getState().board==='usb-c');check((await page.locator('#title').innerText()).includes('USB-C'),'revision switch');
 for(const path of ['presentation/fpga/','presentation/fpga/micro-hdmi.html']){
  await page.goto(base+path);await page.locator('#three').click();const frame=await (await page.locator('#three-frame').elementHandle()).contentFrame();await frame.waitForFunction(()=>window.FPGA_3D?.getState().ready,{},{timeout:60000});
  check(await page.locator('#three-panel').isVisible()&&!(await page.locator('#viewport').isVisible())&&!(await page.locator('#native-panel').isVisible()),path+' exclusive 3D tab');check(!(await frame.locator('.revision').isVisible()),path+' revision locked to surrounding review');
  await page.screenshot({path:`${out}/${path.includes('micro')?'micro':'usb'}-review.png`});await page.locator('#back').click();check(await page.locator('#viewport').isVisible()&&!(await page.locator('#three-panel').isVisible()),path+' back layout restored');
 }
 await page.goto(base+'#fpga');const system=await (await page.locator('#fpga-system-3d').elementHandle()).contentFrame();await system.waitForFunction(()=>window.FPGA_3D?.getState().ready,{},{timeout:60000});check((await page.locator('#facts').innerText()).includes('33 × 36 mm'),'system facts current');await page.screenshot({path:`out/system.png`.replace('out',out)});
 await system.locator('#revision').selectOption('micro-hdmi');await page.waitForFunction(()=>document.querySelector('#facts').textContent.includes('Micro-HDMI'));check((await page.locator('#open-fpga-design').getAttribute('href')).includes('micro-hdmi'),'system link follows selected revision');
 await page.goto(base+'#overview');check(!(await page.locator('#fpga-system-3d').isVisible()),'original overview preserved');
 await page.setViewportSize({width:390,height:844});await page.goto(base+'presentation/fpga/3d/?board=usb-c');await page.waitForFunction(()=>window.FPGA_3D?.getState().ready,{},{timeout:60000});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'3D mobile fits width');await page.screenshot({path:`${out}/mobile.png`});
 check(report.errors.length===0,'no JavaScript page errors');report.status='passed';
}catch(e){report.status='failed';report.failure=e.stack;await page.screenshot({path:`${out}/failure.png`});process.exitCode=1;}
await writeFile(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();
