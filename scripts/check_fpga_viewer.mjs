/* Functional browser verification of unchanged native KiCad files and the pinned viewer.
 * SITE_URL=https://howardwhsrun.github.io/FPGA_4K/ (or local server root)
 * Optional CHROME_PATH, PLAYWRIGHT_MODULE, VIEWER_OUTPUT_DIR.
 */
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = (process.env.SITE_URL || 'https://howardwhsrun.github.io/FPGA_4K/').replace(/\/?$/, '/');
const url = new URL('presentation/fpga/viewer/', base).href;
const out = process.env.VIEWER_OUTPUT_DIR || 'fpga-viewer-check';
await mkdir(out, { recursive: true });
const report = {url, checkedAt: new Date().toISOString(), checks: [], boards: {}, errors: [], failedResources: [], externalRequests: [], parserWarnings: {}, scope:'Browser/native-file fidelity and controls; not electrical, DRC, manufacturing or hardware validation.'};
function check(name, okay, details) {
  report.checks.push({name, passed: Boolean(okay), ...(details === undefined ? {} : {details})});
  if (!okay) throw new Error(`Check failed: ${name}`);
}
// Independent syntax reader, deliberately separate from the KiCanvas parser.
function expressions(source) {
  const tokens = source.match(/"(?:\\.|[^"\\])*"|[()]|[^\s()]+/g);
  const root = [], stack = [root];
  for (const token of tokens) {
    if (token === '(') { const child = []; stack.at(-1).push(child); stack.push(child); }
    else if (token === ')') { if (stack.length === 1) throw new Error('Unbalanced native PCB'); stack.pop(); }
    else stack.at(-1).push(token.startsWith('"') ? JSON.parse(token) : token);
  }
  if (stack.length !== 1 || root.length !== 1) throw new Error('Invalid native PCB expression');
  return root[0];
}
const child = (node, name) => node.find(item => Array.isArray(item) && item[0] === name);
function sourceNets(source) {
  const board = expressions(source), result = [];
  function item(node, kind, reference='') {
    result.push({uuid: child(node, 'uuid')?.[1], kind, reference,
      pad: kind === 'pad' ? String(node[1]) : '', net: child(node, 'net')?.[1] || ''});
  }
  for (const node of board) {
    if (!Array.isArray(node)) continue;
    if (node[0] === 'footprint') {
      const reference = node.find(n => Array.isArray(n) && n[0] === 'property' && n[1] === 'Reference')?.[2];
      for (const pad of node.filter(n => Array.isArray(n) && n[0] === 'pad')) item(pad, 'pad', reference);
    } else if (['segment','arc','via','zone'].includes(node[0])) item(node, node[0]);
  }
  return result.sort((a,b) => a.uuid.localeCompare(b.uuid));
}
const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {}), args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context = await browser.newContext({viewport:{width:1440,height:1100}});
const page = await context.newPage();
let expectedFailure = false;
page.on('pageerror', e => report.errors.push(e.message));
page.on('console', msg => {
  if (msg.type() === 'warning' && msg.text().includes('kicanvas:parser')) {
    const warning = msg.text().match(/No definition found for element ([^, ]+)/)?.[1] || 'other';
    report.parserWarnings[warning] = (report.parserWarnings[warning] || 0) + 1;
  }
});
page.on('request', req => {if (new URL(req.url()).origin !== new URL(base).origin && !req.url().startsWith('data:')) report.externalRequests.push(req.url());});
page.on('response', res => {if (res.status() >= 400 && !expectedFailure) report.failedResources.push({url:res.url(),status:res.status()});});
page.on('requestfailed', req => {if (!expectedFailure) report.failedResources.push({url:req.url(),failure:req.failure()});});
async function ready(board) {
  await page.waitForFunction(id => window.pcbViewerDiagnostics?.board === id && (window.pcbViewerDiagnostics.ready || window.pcbViewerDiagnostics.error), board, {timeout:60000});
  const diag = await page.evaluate(() => window.pcbViewerDiagnostics);
  check(`${board}: native renderer ready`, diag.ready, diag);
  return diag;
}
const state = () => page.locator('kc-board-viewer').evaluate(e => ({zoom:e.viewer.viewport.camera.zoom,center:{x:e.viewer.viewport.camera.center.x,y:e.viewer.viewport.camera.center.y},flipped:e.viewer.viewport.camera.flipped}));
try {
  const indexResponse = await page.request.get(new URL('boards.json', url).href);
  check('Board index available', indexResponse.ok());
  const {boards} = await indexResponse.json();
  check('Three separate review variants', boards.map(b=>b.id).join(',') === 'core,rail,mezzanine');
  for (const board of boards) {
    await page.goto(`${url}?board=${board.id}`, {waitUntil:'networkidle'});
    const diag = await ready(board.id);
    const sourceResponse = await page.request.get(new URL(board.native, url).href);
    check(`${board.id}: original PCB available`, sourceResponse.ok());
    for (const key of ['zip', 'svg']) if (board[key]) {
      const linkResponse=await page.request.get(new URL(board[key],url).href);
      check(`${board.id}: ${key} fallback available`,linkResponse.ok());
    }
    const bytes = await sourceResponse.body();
    check(`${board.id}: native SHA-256 unchanged`, createHash('sha256').update(bytes).digest('hex') === board.sha256);
    for (const [key, value] of Object.entries(board.expected)) check(`${board.id}: native ${key}`, diag.nativeCounts[key] === value);
    const expected = sourceNets(bytes.toString('utf8'));
    const actual = await page.locator('kc-board-viewer').evaluate(e => {
      const b=e.viewer.document;
      const result=[];
      for(const f of b.footprints) for(const p of f.pads) result.push({uuid:p.unique_id,kind:'pad',reference:f.reference,pad:String(p.number),net:p.net?.name || ''});
      for(const [kind, items] of [['segment',b.segments],['via',b.vias],['zone',b.zones]]) for(const i of items) result.push({uuid:i.unique_id,kind:i.constructor.name==='ArcSegment'?'arc':kind,reference:'',pad:'',net:b.nets[i.net]?.name || ''});
      return result.sort((a,b)=>a.uuid.localeCompare(b.uuid));
    });
    check(`${board.id}: every native pad and copper-item net preserved`, JSON.stringify(actual) === JSON.stringify(expected), {compared:expected.length});
    check(`${board.id}: native board is visible`, await page.locator('canvas').isVisible());
    check(`${board.id}: standalone canvas height is bounded`, await page.locator('#viewer-shell').evaluate(e=>e.getBoundingClientRect().height<innerHeight+100));
    const edges=await page.locator('kc-board-viewer').evaluate(e=>({w:e.viewer.document.edge_cuts_bbox.w,h:e.viewer.document.edge_cuts_bbox.h}));
    check(`${board.id}: native 40 × 36 mm outline`, edges.w===40 && edges.h===36);
    check(`${board.id}: review-only description`, await page.locator('#board-description').innerText()===board.description);
    const before=await state();
    await page.locator('#zoom-in').click();const zoomed=await state();check(`${board.id}: zoom-in button moves camera`,zoomed.zoom>before.zoom);
    await page.locator('#zoom-out').click();check(`${board.id}: zoom-out button reverses zoom`,Math.abs((await state()).zoom-before.zoom)<1e-6);
    await page.locator('#flip').click();check(`${board.id}: flip changes orientation`,(await state()).flipped!==before.flipped);
    await page.locator('#flip').click();await page.locator('#fit').click();
    await page.locator('#layers').click();
    const copper=page.locator('kc-board-layer-control[layer-name="F.Cu"]');
    await copper.locator('button').click();check(`${board.id}: UI hides front copper`,await page.locator('kc-board-viewer').evaluate(e=>!e.viewer.layers.by_name('F.Cu').visible));
    await copper.locator('button').click();check(`${board.id}: UI restores front copper`,await page.locator('kc-board-viewer').evaluate(e=>e.viewer.layers.by_name('F.Cu').visible));
    await page.locator('#parts').click();
    const part=page.locator('kc-board-footprints-panel kc-ui-menu-item[data-match-text*=" U1 "]');
    await part.click();
    check(`${board.id}: UI selects U1 FPGA`,await page.locator('kc-board-viewer').evaluate(e=>e.viewer.selected?.context?.reference==='U1'));
    await page.locator('kc-board-viewer').evaluate(e=>{const original=e.viewer.painter.paint_net;e.viewer.painter.paint_net=function(board,number){window.pcbViewerTestHighlightedNet=board.nets[number]?.name;return original.call(this,board,number);};});
    await page.locator('#nets').click();
    const clockNet=page.locator('kc-board-nets-panel kc-ui-menu-item[data-match-text$=" CLK_32MHZ"]');
    await clockNet.click();
    check(`${board.id}: UI highlights the 32 MHz clock net`,await page.evaluate(()=>window.pcbViewerTestHighlightedNet==='CLK_32MHZ'));
    await page.locator('#fit').click();
    await page.locator('kc-ui-activity-side-bar').evaluate(e=>e.collapsed=true); // Pinned alpha adapter: close the sidebar for overview captures.
    await page.locator('#fit').click();
    await page.screenshot({path:path.join(out,`${board.id}-desktop.png`),fullPage:true});
    report.boards[board.id]={sha256:board.sha256,nativeCounts:diag.nativeCounts,netItemsCompared:expected.length,outline:edges};
  }
  await page.goto(`${url}?board=core&embed=1`,{waitUntil:'networkidle'});await ready('core');
  check('Embedded view fills viewport',await page.locator('#viewer-shell').evaluate(e=>Math.abs(e.getBoundingClientRect().height-innerHeight)<2));
  check('Embedded mode hides standalone text',!(await page.locator('.intro').isVisible()));
  const canvas=page.locator('canvas');let box=await canvas.boundingBox();const x=box.x+box.width*.4,y=box.y+box.height*.4;
  const wheelBefore=await state();await page.mouse.move(x,y);await page.keyboard.down('Control');await page.mouse.wheel(0,-250);await page.keyboard.up('Control');await page.waitForTimeout(250);check('Mouse wheel zooms native camera',(await state()).zoom!==wheelBefore.zoom);
  const panBefore=await state();await page.mouse.move(x,y);await page.mouse.down({button:'middle'});await page.mouse.move(x+90,y+45,{steps:8});await page.mouse.up({button:'middle'});const panAfter=await state();check('Mouse drag pans native camera',panBefore.center.x!==panAfter.center.x||panBefore.center.y!==panAfter.center.y);
  await page.locator('#fit').click();
  if(await page.locator('#fullscreen').isVisible()){await page.locator('#fullscreen').click();await page.waitForTimeout(200);check('Full-screen control enters fullscreen',await page.evaluate(()=>!!document.fullscreenElement));await page.locator('#fullscreen').click();check('Full-screen control exits',await page.evaluate(()=>!document.fullscreenElement));}
  await page.screenshot({path:path.join(out,'core-embedded.png')});
  await page.setViewportSize({width:390,height:844});await page.goto(`${url}?board=core`,{waitUntil:'networkidle'});await ready('core');
  check('Mobile page has no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('#zoom-in').click();check('Mobile zoom control works',(await state()).zoom>0);
  await page.screenshot({path:path.join(out,'core-mobile.png'),fullPage:true});
  await page.goto(`${url}?board=core&embed=1`,{waitUntil:'networkidle'});await ready('core');
  check('Mobile embedded view has no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  check('Mobile embedded native canvas visible',await page.locator('canvas').isVisible());
  await page.screenshot({path:path.join(out,'core-mobile-embedded.png')});
  check('No external runtime requests',report.externalRequests.length===0,report.externalRequests);
  check('No normal-load resource failures',report.failedResources.length===0,report.failedResources);
  check('No browser JavaScript exceptions',report.errors.length===0,report.errors);
  expectedFailure=true;
  await page.route('**/FPGA100T_Minimal.kicad_pcb',route=>route.fulfill({status:404,body:'Not found'}));
  await page.goto(`${url}?board=core`,{waitUntil:'networkidle'});await page.waitForFunction(()=>!!window.pcbViewerDiagnostics?.error);
  check('Missing-native-file fallback is visible',await page.locator('#load-error').isVisible());
  check('Missing-file fallback links to real SVG', (await page.locator('#load-error a').getAttribute('href')).endsWith('FPGA100T_Minimal_PCB.svg'));
  check('Controls disabled after load failure',await page.locator('#fit').isDisabled());
  report.passed=true;
} catch(error){report.passed=false;report.failure=error.stack;process.exitCode=1;}
finally{await browser.close();await writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,boards:report.boards,parserWarnings:report.parserWarnings,failure:report.failure,report:path.join(out,'report.json')},null,2));}
