import {writeFile, mkdir} from 'node:fs/promises';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = (process.env.SITE_URL || 'https://howardwhsrun.github.io/FPGA_4K/').replace(/\/?$/, '/');
const out = process.env.FPGA_PRESENTATION_OUTPUT_DIR || 'fpga-browser-check';
const browser = await chromium.launch({executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
await mkdir(out, {recursive: true});
const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
const report = {base, checks: [], pageErrors: [], consoleErrors: [], failedResources: []};
page.on('response', response => {if (response.status() >= 400) report.failedResources.push({url: response.url(), status: response.status()});});
page.on('pageerror', e => report.pageErrors.push(e.message));
page.on('console', e => {if (e.type() === 'error') report.consoleErrors.push({message: e.text(), location: e.location()});});
const assert = (condition, label) => {if (!condition) throw new Error(label); report.checks.push(label);};
try {
  await page.goto(base + 'presentation/fpga/', {waitUntil: 'networkidle'});
  await page.waitForFunction(() => document.documentElement.dataset.usbReady === 'true');
  const usbResponse = await page.request.get(base + 'hardware/fpga-interface-study/dated/2026-09-27/usb-c-revision/reports/USB_C_Native_Audit.json');
  assert(usbResponse.ok(), 'USB-C audit available');
  const usbAudit = await usbResponse.json();
  assert((await page.locator('#board-hash').innerText()).includes(usbAudit.board_sha256), 'USB-C visible identity matches native audit');
  assert((await page.locator('#status-summary').innerText()).includes(String(usbAudit.assigned_net_open_count)), 'USB-C page reports its own open-copper count');
  assert(usbAudit.fabrication_ready === false && (await page.locator('.status').innerText()).includes('not for manufacture'), 'USB-C manufacturing gate remains explicit');
  await page.locator('#board-image').evaluate(image => image.decode());
  await page.locator('#zoom-in').click();
  assert(await page.evaluate(() => FPGA_BOARD.getState().zoom > 1), 'USB-C static zoom works');
  await page.locator('#fit').click();
  for (const side of ['back','front']) {
    await page.locator('#'+side).click();
    await page.locator('#board-image').evaluate(image => image.decode());
    assert((await page.locator('#board-image').getAttribute('src')).includes('Current_'+side[0].toUpperCase()+side.slice(1)), 'USB-C '+side+' native export loads');
  }
  await page.locator('#native').click();
  const usbFrame = await (await page.locator('#native-frame').elementHandle()).contentFrame();
  await usbFrame.waitForFunction(() => window.pcbViewerDiagnostics?.ready, null, {timeout:60000});
  assert(await usbFrame.evaluate(expected => pcbViewerDiagnostics.board === 'usb-c' && pcbViewerDiagnostics.sourceHash === expected, usbAudit.board_sha256), 'USB-C iframe shows exact reviewed board');
  await page.locator('#front').click();
  for (const [width,height] of [[1440,1000],[390,844]]) {
    await page.setViewportSize({width,height});
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'USB-C page has no horizontal overflow at '+width);
    await page.screenshot({path: `${out}/usb-c-${width}.png`, fullPage:true});
  }
  for (const a of await page.locator('[data-file]').all()) {
    const response = await page.request.get(new URL(await a.getAttribute('href'), page.url()).href);
    assert(response.ok(), 'USB-C linked evidence/download is available');
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(base + 'presentation/fpga/micro-hdmi.html', {waitUntil:'networkidle'});
  await page.waitForFunction(() => window.FPGA_REVIEW?.getState().loaded);
  await page.waitForFunction(() => window.FPGA_TEACHING?.getState().components === window.FPGA_REVIEW?.data.components);
  await page.locator('#board-image').evaluate(image => image.decode());
  const data = await page.evaluate(() => FPGA_REVIEW.data);
  const teaching = await page.evaluate(() => FPGA_TEACHING.data);
  assert(teaching.boardSha256 === data.boardSha256 && teaching.cadModified === false, 'Component explanations identify the unchanged current native board');
  const defaultWords = await page.evaluate(() => document.body.innerText.split(/\s+/).filter(Boolean).length);
  report.defaultVisibleWords = defaultWords;
  assert(defaultWords < 1100, 'Default view contains fewer than 1,100 words (previously 2,287)');
  for (const id of ['board-evidence','architecture-reference','interface-reference','validation-reference','engineering-questions','all-downloads','presenter-notes']) {
    assert(await page.locator('#' + id).evaluate(e => !e.open), 'Detailed evidence collapsed initially: ' + id);
  }
  assert(await page.locator('#component-depth').evaluate(e => !e.open), 'Every-pin component details are optional initially');
  await page.locator('[data-component-group="all"]').click();
  assert(await page.locator('#component-count').innerText() === `${data.components} of ${data.components} components`, 'All current components available through the component browser');
  const seenParts = [];
  for (let pageIndex = 0; pageIndex < Math.ceil(data.components / 10); pageIndex++) {
    seenParts.push(...await page.locator('#component-list [data-part]').evaluateAll(items => items.map(item => item.dataset.part)));
    if (pageIndex < Math.ceil(data.components / 10) - 1) await page.locator('#parts-next').click();
  }
  assert(JSON.stringify(seenParts.slice().sort()) === JSON.stringify(teaching.components.map(c => c.reference).sort()) && new Set(seenParts).size === data.components, 'Pagination exposes every current component reference exactly once');
  await page.locator('#component-necessity').selectOption('nonessential');
  assert(await page.locator('#component-count').innerText() === `0 of ${data.components} components` && await page.locator('#component-list [data-part="R12"]').count() === 0, 'Previously nonessential R12 is absent from the current population');
  assert(teaching.removedFromPreviousAudit.includes('R12'), 'R12 removal is recorded in source evidence');
  await page.locator('#component-necessity').selectOption('all');
  await page.locator('#component-search').fill('R122');
  assert(await page.locator('#component-count').innerText() === `1 of ${data.components} components`, 'Exact-reference search returns one component');
  await page.locator('#component-depth summary').click();
  assert(await page.locator('#component-depth tbody tr').count() === 2 && (await page.locator('#component-depth').innerText()).includes('VAUX_REG_1V803'), 'Component detail exposes its real source pin connections');
  await page.locator('[data-component-group="fpga"]').click();
  assert(await page.locator('#component-list [data-part="U1"]').count() === 1 && !(await page.locator('#component-depth').evaluate(e => e.open)), 'Family selection restores concise FPGA explanation');
  assert((await page.locator('#interfaces .correction-callout').innerText()).includes('U1.L9/L10') && (await page.locator('#interfaces .correction-callout').innerText()).includes('FB2'), 'New ground correction and regulator-pin review remain visible');
  await page.locator('#pin-frame').scrollIntoViewIfNeeded();
  const pinFrame = await (await page.locator('#pin-frame').elementHandle()).contentFrame();
  await pinFrame.waitForFunction(count => window.PinMap?.data.pins.length === count, data.canonicalPins);
  const pinCounts = await pinFrame.evaluate(() => PinMap.data.counts);
  assert(pinCounts.unassigned === 102 && pinCounts.cadNoConnect === 83 && pinCounts.groundCorrectionsAssigned === 6 && pinCounts.asicNetsAssigned === 116 && pinCounts.analogReservedContacts === 1 && pinCounts.missingAssignedConnections === data.unconnectedItems, 'Pin explorer keeps NCs, reservations, six GND corrections, ASIC assignments and missing copper counts distinct');
  assert(await pinFrame.locator('[data-pin-id]').count() === 324 && await pinFrame.locator('[data-status="unassigned"]').count() === 8 && await pinFrame.locator('[data-status="nc"]').count() === 81, 'Embedded FPGA map labels every ball and distinguishes 81 unused from eight reserved balls');
  await pinFrame.locator('[data-pin-id="U1.L9"]').click();
  assert((await pinFrame.locator('#detail').innerText()).includes('GND') && (await pinFrame.locator('#detail').innerText()).includes('native pin is now GND'), 'Former NC diode pin shows its native GND assignment');
  await pinFrame.locator('[data-ref="NC"]').click();
  assert(await pinFrame.locator('.nc-list button').count() === 83, 'Every intentionally unused pin is available by reference');
  await pinFrame.locator('.nc-list [data-id="U5.7"]').click();
  assert((await pinFrame.locator('#detail').innerText()).includes('R12') && (await pinFrame.locator('#detail').innerText()).includes('Unused'), 'Unused regulator PG explains the deliberate R12 removal');
  const mapFrameHeight = await page.locator('#pin-frame').evaluate(e => e.getBoundingClientRect().height);
  await pinFrame.locator('#component').selectOption('U5');
  await pinFrame.locator('[data-pin-id="U5.4"]').click();
  assert((await pinFrame.locator('#detail').innerText()).includes('GND') && (await pinFrame.locator('#detail').innerText()).includes('FB2'), 'Converter FB2 still shows its required ground connection');
  await page.waitForFunction(previous => document.querySelector('#pin-frame').getBoundingClientRect().height < previous, mapFrameHeight);
  assert(await page.locator('#pin-frame').evaluate(e => e.getBoundingClientRect().height) < mapFrameHeight, 'Embedded frame adapts from the full unused-pin list to one component');
  await pinFrame.locator('[data-ref="U1"]').click();
  assert(await page.locator('#interfaces a[href="pins/"]').count() === 1 && await page.locator('#interfaces a[href="pins/All_Pin_Labels.csv"]').count() === 1, 'Full pin map and complete labeled CSV remain directly linked');
  assert(data.fabricationReady === false && data.fullBoardComplete === false, 'Full-board manufacture gate remains closed');
  assert(await page.locator('.section-nav a').count() === 6, 'Six review sections present');
  assert(await page.locator('#revision-table tbody tr').count() === 5, 'Five historical design revisions are preserved');
  assert(await page.locator('a[href$="fourth_check/Uncertainty_Register.md"]').count() >= 1, 'Historical fourth-pass findings remain downloadable');
  const uncertaintyResponse = await page.request.get(base + 'presentation/fpga/data/Review_Decisions.json');
  assert(uncertaintyResponse.ok(), 'Current uncertainty register is available');
  const register = await uncertaintyResponse.json();
  assert(register.boardSha256 === data.boardSha256 && register.items.length === 6, 'Concise decision register is bound to the current native board');
  assert(await page.locator('.uncertainty-item').count() === register.items.length, 'All uncertainty records are displayed');
  await page.locator('#engineering-questions > summary').click();
  for (const filter of ['lab', 'engineering', 'bench', 'all']) {
    await page.locator(`[data-uncertainty-filter="${filter}"]`).click();
    const expected = filter === 'all' ? register.items.length : register.items.filter(item => item.first_step === filter).length;
    assert(await page.locator('.uncertainty-item:not([hidden])').count() === expected, 'Uncertainty filter: ' + filter);
    assert(await page.locator('#uncertainty-count').innerText() === `Showing ${expected} of ${register.items.length} uncertainties.`, 'Filter count: ' + filter);
  }
  await page.locator('#C01 summary').click();
  assert(await page.locator('#C01').evaluate(e => e.open) && (await page.locator('#C01').innerText()).includes(register.items[0].remaining), 'Team-information item expands to its exact remaining requirements');
  await page.locator('#C01 summary').click();
  await page.locator('#engineering-questions > summary').click();
  assert(await page.locator('#board-image').evaluate(image => image.naturalWidth > 0), 'Actual PCB SVG loaded');
  assert(await page.locator('#title').innerText() === '33 × 36 mm · micro-HDMI checkpoint', 'Current board uses the requested review layout');
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
  assert((await page.locator('#board-image').getAttribute('src')).endsWith('current-back.svg') && await page.locator('#back').getAttribute('aria-pressed') === 'true', 'Back layout loads a distinct current-board view');
  await page.locator('#native').click();
  const nativeFrame = await (await page.locator('#native-frame').elementHandle()).contentFrame();
  await nativeFrame.waitForFunction(() => window.pcbViewerDiagnostics?.ready === true, null, {timeout: 60000});
  assert(await nativeFrame.evaluate(count => pcbViewerDiagnostics.nativeCounts.footprints === count, data.components), 'Embedded native viewer parses current measured board');
  await page.locator('#front').click();
  await page.locator('#board-image').evaluate(image => image.decode());
  assert(await page.locator('#viewport').isVisible(), 'Front layout returns after interactive inspection');
  await page.locator('a[href="#interface-reference"]').click();
  await page.waitForFunction(() => document.getElementById('interface-reference').open);
  assert(await page.locator('#interface-reference').evaluate(e => e.open), 'Explicit source anchor opens the relevant evidence drawer');
  assert((await page.locator('#gerald-slides').innerText()).includes('48 clocks') && (await page.locator('#gerald-slides').innerText()).includes('60 kHz'), 'Gerald slide evidence distinguishes known framing from timing conflict');
  await page.locator('#interface-reference > summary').click();
  assert((await page.locator('#validation .check-strip [data-field="unconnectedItems"]').innerText()) === String(data.unconnectedItems), 'Displayed connectivity matches snapshot');
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
    await page.screenshot({path: `${out}/review-${width}.png`, fullPage: true});
    if (width !== 1920) for (const section of ['architecture','interfaces']) {
      await page.locator('#' + section).screenshot({path: `${out}/${section}-${width}.png`});
    }
  }
  await page.setViewportSize({width: 1440, height: 1000});
  await page.locator('#board-evidence > summary').click();
  await page.locator('#snapshot-details summary').click();
  assert(await page.locator('#snapshot-details').evaluate(e => e.open), 'Snapshot provenance expands');
  assert((await page.locator('.hash').innerText()) === data.boardSha256, 'Visible board identity matches data');
  assert(await page.locator('#design-history').evaluate(e => !e.open), 'Historical studies are collapsed by default');
  await page.locator('#design-history > summary').click();
  await page.locator('#connector-edge summary').click();
  await page.locator('#edge-review-image').evaluate(image => image.decode());
  assert(await page.locator('#edge-review-image').evaluate(image => image.naturalWidth > 0), 'Connector-edge evidence graphic loads');
  await page.locator('#mezzanine-image').scrollIntoViewIfNeeded();
  await page.locator('#mezzanine-image').evaluate(image => image.decode());
  assert(await page.locator('#mezzanine-image').evaluate(image => image.naturalWidth > 0), 'Separate placement-study image loads');
  await page.locator('#compact-image').scrollIntoViewIfNeeded();
  await page.locator('#compact-image').evaluate(image => image.decode());
  assert(await page.locator('#compact-image').evaluate(image => image.naturalWidth > 0), 'New smaller native placement image loads');
  assert((await page.locator('#size-study').innerText()).includes('33 × 36 mm') && (await page.locator('#size-study').innerText()).includes('current audit records its component count'), 'Current smallest board keeps the current component population without enlarging the outline');
  assert((await page.locator('#size-study').innerText()).includes(String(data.unconnectedItems)) && (await page.locator('#size-study').innerText()).includes('116 mezzanine contacts'), 'Current board reports measured connectivity and provisional application assignment');
  const sizeText = await page.locator('#size-study').innerText();
  assert(['Three contacts remain reserved','1.8 V','2.5 V','0.010 mm','manufacturer edge datum','mating and plug-access checks remain open','unqualified'].every(text=>sizeText.includes(text)), 'Current board shows corrected rail voltages, assignment and mechanical limits');
  assert(await page.locator('#size-study a[href="viewer/?board=compact-routed"]').count() > 0 && await page.locator('#design-history a[href="viewer/?board=compact-v2"]').count() > 0 && await page.locator('#design-history a[href="viewer/?board=compact"]').count() > 0, 'Current routing and historical placements remain correctly linked');
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
    await page.waitForFunction(() => document.documentElement.dataset.usbReady === 'true');
    report.checks.push('Root system view opens current USB-C review');
  }
  assert(report.pageErrors.length === 0, 'No JavaScript page errors');
  assert(report.consoleErrors.length === 0, 'No browser console errors');
  assert(report.failedResources.length === 0, 'No failed page resource requests');
  report.snapshot = data;
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.failure = error.stack;
  await page.screenshot({path: `${out}/failure.png`, fullPage: true});
}
await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify({passed: report.passed, checks: report.checks, pageErrors: report.pageErrors, consoleErrors: report.consoleErrors, failedResources: report.failedResources, failure: report.failure}, null, 2));
await browser.close();
if (!report.passed) process.exitCode = 1;
