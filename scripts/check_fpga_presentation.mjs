import {writeFile, mkdir} from 'node:fs/promises';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = (process.env.SITE_URL || 'https://howardwhsrun.github.io/FPGA_4K/').replace(/\/?$/, '/');
const browser = await chromium.launch({executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
await mkdir('fpga-browser-check', {recursive: true});
const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
const report = {base, checks: [], pageErrors: [], consoleErrors: [], failedResources: []};
page.on('response', response => {if (response.status() >= 400) report.failedResources.push({url: response.url(), status: response.status()});});
page.on('pageerror', e => report.pageErrors.push(e.message));
page.on('console', e => {if (e.type() === 'error') report.consoleErrors.push({message: e.text(), location: e.location()});});
const assert = (condition, label) => {if (!condition) throw new Error(label); report.checks.push(label);};
try {
  await page.goto(base + 'presentation/fpga/', {waitUntil: 'networkidle'});
  await page.waitForFunction(() => window.FPGA_REVIEW?.getState().loaded);
  await page.locator('#board-image').evaluate(image => image.decode());
  const data = await page.evaluate(() => FPGA_REVIEW.data);
  assert(data.fabricationReady === false && data.fullBoardComplete === false, 'Full-board manufacture gate remains closed');
  assert(await page.locator('.section-nav a').count() === 6, 'Six review sections present');
  assert(await page.locator('#revision-table tbody tr').count() === 4, 'Four native design revisions are distinguished');
  assert(await page.locator('a[href$="Fourth_Check_Review.md"]').count() >= 2, 'Fourth-pass findings are visible and downloadable');
  const uncertaintyResponse = await page.request.get(base + 'hardware/fpga-interface-study/fourth_check/Uncertainty_Register.json');
  assert(uncertaintyResponse.ok(), 'Current uncertainty register is available');
  const register = await uncertaintyResponse.json();
  assert(register.review_pass === 4 && register.fabrication_ready === false, 'Register identifies fourth review and unreleased status');
  assert(await page.locator('.uncertainty-item').count() === register.items.length, 'All uncertainty records are displayed');
  assert(await page.locator('.known-gaps li').count() === register.known_gaps.length, 'Known unfinished tasks are separate');
  for (const filter of ['lab', 'engineering', 'bench', 'all']) {
    await page.locator(`[data-uncertainty-filter="${filter}"]`).click();
    const expected = filter === 'all' ? register.items.length : register.items.filter(item => item.first_step === filter).length;
    assert(await page.locator('.uncertainty-item:not([hidden])').count() === expected, 'Uncertainty filter: ' + filter);
    assert(await page.locator('#uncertainty-count').innerText() === `Showing ${expected} of ${register.items.length} uncertainties.`, 'Filter count: ' + filter);
  }
  await page.locator('#U01 summary').click();
  assert(await page.locator('#U01').evaluate(e => e.open) && (await page.locator('#U01').innerText()).includes(register.items[0].closure), 'Uncertainty expands to its exact closure criterion');
  await page.locator('#U01 summary').click();
  assert(await page.locator('#board-image').evaluate(image => image.naturalWidth > 0), 'Actual PCB SVG loaded');
  assert(await page.locator('#title').innerText() === 'Current FPGA PCB', 'Current board uses the requested review layout');
  await page.locator('#zoom-in').click();
  assert(await page.evaluate(() => FPGA_BOARD.getState().zoom > 1), 'PCB zoom-in control changes scale');
  const viewport = await page.locator('#viewport').boundingBox();
  await page.mouse.move(viewport.x + viewport.width / 2, viewport.y + viewport.height / 2);
  await page.mouse.down();
  await page.mouse.move(viewport.x + viewport.width / 2 + 70, viewport.y + viewport.height / 2 + 30, {steps: 5});
  await page.mouse.up();
  assert(await page.evaluate(() => FPGA_BOARD.getState().x > 50), 'PCB drag pans the actual view');
  await page.locator('#fit').click();
  assert(await page.evaluate(() => {const s = FPGA_BOARD.getState(); return s.zoom === 1 && s.x === 0 && s.y === 0;}), 'Fit board restores scale and position');
  await page.locator('#back').click();
  await page.locator('#board-image').evaluate(image => image.decode());
  assert((await page.locator('#board-image').getAttribute('src')).endsWith('core-back.svg') && await page.locator('#back').getAttribute('aria-pressed') === 'true', 'Back layout loads a distinct current-board view');
  await page.locator('#native').click();
  const nativeFrame = await (await page.locator('#native-frame').elementHandle()).contentFrame();
  await nativeFrame.waitForFunction(() => window.pcbViewerDiagnostics?.ready === true, null, {timeout: 60000});
  assert(await nativeFrame.evaluate(() => pcbViewerDiagnostics.nativeCounts.footprints === 126), 'Embedded native viewer parses current 126-part board');
  await page.locator('#front').click();
  await page.locator('#board-image').evaluate(image => image.decode());
  assert(await page.locator('#viewport').isVisible(), 'Front layout returns after interactive inspection');
  assert((await page.locator('#gerald-slides').innerText()).includes('48 clocks') && (await page.locator('#gerald-slides').innerText()).includes('60 kHz'), 'Gerald slide evidence distinguishes known framing from timing conflict');
  assert((await page.locator('[data-field="unconnectedItems"]').first().innerText()) === String(data.unconnectedItems), 'Displayed connectivity matches snapshot');
  assert(!(await page.locator('#load-error').isVisible()), 'No stale-data load warning');
  for (const anchor of ['architecture', 'interfaces', 'validation', 'release', 'files']) {
    await page.locator(`.section-nav a[href="#${anchor}"]`).click();
    assert(new URL(page.url()).hash === '#' + anchor, 'Section navigation: ' + anchor);
  }
  for (const [width, height] of [[1440, 1000], [1920, 1080], [390, 844]]) {
    await page.setViewportSize({width, height});
    await page.evaluate(() => scrollTo({top: 0, behavior: 'instant'}));
    await page.waitForTimeout(150);
    const size = await page.evaluate(() => ({width: innerWidth, document: document.documentElement.scrollWidth}));
    assert(size.document <= size.width, 'No page overflow at ' + width);
    await page.screenshot({path: `fpga-browser-check/review-${width}.png`, fullPage: true});
  }
  await page.setViewportSize({width: 1440, height: 1000});
  await page.locator('#snapshot-details summary').click();
  assert(await page.locator('#snapshot-details').evaluate(e => e.open), 'Snapshot provenance expands');
  assert((await page.locator('.hash').innerText()) === data.boardSha256, 'Visible board identity matches data');
  await page.locator('#connector-edge summary').click();
  await page.locator('#edge-review-image').evaluate(image => image.decode());
  assert(await page.locator('#edge-review-image').evaluate(image => image.naturalWidth > 0), 'Connector-edge evidence graphic loads');
  await page.locator('#mezzanine-image').scrollIntoViewIfNeeded();
  await page.locator('#mezzanine-image').evaluate(image => image.decode());
  assert(await page.locator('#mezzanine-image').evaluate(image => image.naturalWidth > 0), 'Separate placement-study image loads');
  await page.locator('#compact-image').scrollIntoViewIfNeeded();
  await page.locator('#compact-image').evaluate(image => image.decode());
  assert(await page.locator('#compact-image').evaluate(image => image.naturalWidth > 0), 'New smaller native placement image loads');
  assert((await page.locator('#size-study').innerText()).includes('37.5 × 36 mm') && (await page.locator('#size-study').innerText()).includes('6.25%'), 'Smaller placement dimensions and area reduction shown separately');
  assert((await page.locator('#size-study').innerText()).includes('383') && (await page.locator('#size-study').innerText()).includes('117 ASIC signals'), 'Smaller placement retains open connectivity and assignment disclosure');
  await page.locator('#circled-explanation summary').click();
  await page.locator('#circled-image').evaluate(image => image.decode());
  assert(await page.locator('#circled-image').evaluate(image => image.naturalWidth > 0), 'Circled-space explanation opens and loads');
  await page.locator('#circled-explanation summary').click();
  const links = await page.locator('#files a, #mezzanine-study a, #interfaces a, #validation a, #size-study a').evaluateAll(anchors => anchors.map(a => a.href).filter(url => !url.includes('#') && (/\/hardware\/fpga-(100t-review|interface-study)\//).test(url)));
  for (const url of [...new Set(links)]) {
    const response = await page.request.get(url);
    assert(response.ok(), 'Download available: ' + new URL(url).pathname.split('/').pop());
    const body = await response.body();
    if (url.endsWith('.zip')) assert(body.subarray(0, 2).toString() === 'PK', 'Project download is a real ZIP');
    if (url.endsWith('.pdf')) assert(body.subarray(0, 4).toString() === '%PDF', 'Schematic download is a real PDF');
  }
  await page.goto(base + 'presentation/fpga/history-2026-09-24.html', {waitUntil: 'domcontentloaded'});
  assert((await page.title()).includes('FPGA'), 'Earlier review remains accessible');
  assert(await page.locator('#chapters button').count() === 8, 'Earlier eight-slide deck preserved');
  if (!process.env.SKIP_SYSTEM_CHECK) {
    await page.goto(base + '#fpga', {waitUntil: 'networkidle'});
    await page.waitForFunction(() => window.PRESENTATION?.getState().loaded);
    await page.locator('#open-fpga-design').waitFor({state: 'visible'});
    await page.locator('#open-fpga-design').click();
    await page.waitForURL('**/presentation/fpga/');
    await page.waitForFunction(() => window.FPGA_REVIEW?.getState().loaded);
    report.checks.push('Root system view opens current review');
  }
  assert(report.pageErrors.length === 0, 'No JavaScript page errors');
  assert(report.consoleErrors.length === 0, 'No browser console errors');
  assert(report.failedResources.length === 0, 'No failed page resource requests');
  report.snapshot = data;
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.failure = error.stack;
  await page.screenshot({path: 'fpga-browser-check/failure.png', fullPage: true});
}
await writeFile('fpga-browser-check/report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({passed: report.passed, checks: report.checks, pageErrors: report.pageErrors, consoleErrors: report.consoleErrors, failedResources: report.failedResources, failure: report.failure}, null, 2));
await browser.close();
if (!report.passed) process.exitCode = 1;
