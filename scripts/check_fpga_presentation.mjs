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
  assert(await page.locator('#revision-table tbody tr').count() === 3, 'Three native design revisions are distinguished');
  assert(await page.locator('a[href$="Triple_Check_Review.md"]').count() >= 2, 'Third-pass findings are visible and downloadable');
  assert(await page.locator('#board-image').evaluate(image => image.naturalWidth > 0), 'Actual PCB SVG loaded');
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
  const links = await page.locator('#files a, #mezzanine-study a, #interfaces a, #validation a').evaluateAll(anchors => anchors.map(a => a.href).filter(url => !url.includes('#') && (/\/hardware\/fpga-(100t-review|interface-study)\//).test(url)));
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
