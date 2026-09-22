import { chromium } from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';
const base=process.env.SITE_URL||'https://howardwhsrun.github.io/FPGA_4K/';
const chrome=process.env.CHROME_PATH||'/usr/bin/google-chrome';
const browser=await chromium.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
await mkdir('fpga-browser-check',{recursive:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const report={base,checks:[],pageErrors:[],consoleErrors:[]};
page.on('pageerror',e=>report.pageErrors.push(e.message));
page.on('console',e=>{if(e.type()==='error')report.consoleErrors.push(e.text());});
const assert=(x,message)=>{if(!x)throw new Error(message);report.checks.push(message);};
try{
  await page.goto(base+'?fpga-check='+Date.now(),{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.PRESENTATION?.getState().loaded);
  await page.locator('.system-nav [data-slide="fpga"]').click();
  await page.locator('#open-fpga-design').waitFor({state:'visible'});
  assert(page.url().includes('#fpga'),'First FPGA selection stays in the system overview');
  await page.locator('#open-fpga-design').click();
  await page.waitForURL('**/presentation/fpga/');
  await page.waitForFunction(()=>window.FPGA_REVIEW&&document.querySelector('#board-image').naturalWidth>0);
  assert(await page.locator('#chapters button').count()===5,'FPGA deck has five independent slides');
  assert(await page.evaluate(()=>document.querySelector('#board-image').dataset.loaded==='true'),'Actual KiCad front SVG loaded');
  await page.screenshot({path:'fpga-browser-check/layout.png',fullPage:true});
  for(const id of ['interfaces','power','startup','bringup']){
    await page.locator(`[data-chapter="${id}"]`).click();
    assert(await page.evaluate(id=>FPGA_REVIEW.getState().slideId===id,id),'Slide navigation: '+id);
  }
  await page.locator('[data-chapter="layout"]').click();
  await page.locator('#back').click();
  await page.waitForFunction(()=>document.querySelector('#board-image').complete&&document.querySelector('#board-image').naturalWidth>0);
  assert((await page.locator('#board-image').getAttribute('src')).includes('back.svg'),'Actual mirrored back SVG loaded');
  await page.locator('#zoom-in').click();assert(await page.evaluate(()=>FPGA_REVIEW.getState().zoom>1),'Layout zoom operates');
  await page.locator('#fit').click();
  await page.locator('#evidence').click();assert(await page.locator('#details').evaluate(e=>e.open),'Slide evidence dialog opens');await page.locator('#close-dialog').click();
  await page.locator('#files-button').click();assert(await page.locator('#dialog-content a').count()===5,'Native project and complete ZIP links are available');await page.locator('#close-dialog').click();
  for(const [w,h] of [[1280,720],[1920,1080],[390,844]]){
    await page.setViewportSize({width:w,height:h});await page.waitForTimeout(250);
    const metrics=await page.evaluate(()=>({width:innerWidth,doc:document.documentElement.scrollWidth,height:innerHeight,docHeight:document.documentElement.scrollHeight}));
    report.checks.push({viewport:[w,h],metrics});assert(metrics.doc<=metrics.width,'No horizontal page overflow at '+w);
    await page.screenshot({path:`fpga-browser-check/layout-${w}.png`,fullPage:true});
  }
  await page.setViewportSize({width:1440,height:900});
  await page.locator('#native').click();
  await page.waitForFunction(()=>window.FPGA_REVIEW.getState().nativeReady,{},{timeout:60000});
  await page.waitForTimeout(6000);
  report.nativeState=await page.evaluate(()=>FPGA_REVIEW.getState());
  report.nativeText=await page.locator('kicanvas-embed').innerText();
  assert(await page.locator('kicanvas-embed').locator('canvas').count()>0,'Native PCB viewer has a rendered canvas');
  await page.screenshot({path:'fpga-browser-check/native-pcb.png',fullPage:true});
  await page.locator('[data-chapter="startup"]').click();await page.locator('#inspect').click();
  await page.waitForFunction(()=>window.FPGA_REVIEW.getState().nativeReady,{},{timeout:60000});await page.waitForTimeout(3500);
  assert(await page.locator('#document').inputValue()==='device_U2.kicad_sch','Related boot-flash schematic opens');
  await page.screenshot({path:'fpga-browser-check/native-schematic.png',fullPage:true});
  assert(await page.evaluate(()=>FPGA_REVIEW.getState().sheets===41),'Schematic selector discovers all 41 actual sheets');
  await page.locator('header a[href="../../#fpga"]').click();await page.waitForFunction(()=>window.PRESENTATION?.getState().slideId==='fpga');
  assert(await page.locator('#open-fpga-design').isVisible(),'Return link restores the parent FPGA selection');
  await page.locator('.system-nav [data-slide="fpga"]').click();await page.waitForURL('**/presentation/fpga/');
  report.checks.push('Second click on selected FPGA opens board-level slides');
  assert(report.pageErrors.length===0,'No JavaScript page errors');
  report.passed=true;
}catch(error){report.passed=false;report.failure=error.stack;await page.screenshot({path:'fpga-browser-check/failure.png',fullPage:true});console.error(error);}
await writeFile('fpga-browser-check/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();if(!report.passed)process.exitCode=1;
