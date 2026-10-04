/* Optional behavioral QA. Set NODE_PATH to a runtime containing Playwright.
   Serve the repository first; LIBRARY_URL defaults to localhost:8781.
   CHROME_PATH can select an existing Chromium executable without installing one. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, 'catalog.json'), 'utf8'));
const base = process.env.LIBRARY_URL || 'http://127.0.0.1:8781/presentation/library/';
const options = {headless: true};
if (process.env.CHROME_PATH) options.executablePath = process.env.CHROME_PATH;

(async () => {
  const browser = await chromium.launch(options);
  const page = await browser.newPage({viewport: {width: 1280, height: 900}});
  const errors = [];
  const requested = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => requested.push({url: request.url(), type: request.resourceType()}));
  await page.goto(base);
  await page.waitForSelector('.card');
  assert.equal(await page.locator('.card').count(), 24, 'Initial DOM should contain only 24 cards');
  assert.equal(await page.locator('#result-count').innerText(), catalog.entries.length + ' items in the library');
  assert.equal(requested.filter(request => request.type === 'image' && !request.url.includes('/library/thumbs/')).length, 0, 'No original figure should be requested on the gallery landing');

  await page.selectOption('#type', 'Illustration');
  assert.equal(await page.locator('#result-count').innerText(), catalog.entries.filter(entry => entry.type === 'Illustration').length + ' items found');
  await page.locator('#load-more').click();
  assert.equal(await page.locator('.card').count(), 48, 'Show more should append one page');
  await page.locator('#q').fill('R12');
  await page.selectOption('#topic', 'Schematics');
  await page.selectOption('#date', '2026-09-29');
  assert.equal(await page.locator('.card').count(), 10, 'Title, topic, type and date filters combine');
  assert.match(page.url(), /q=R12/);
  await page.reload();
  await page.waitForSelector('.card');
  assert.equal(await page.locator('.card').count(), 10, 'Deep links should restore every filter');
  assert.equal(await page.inputValue('#q'), 'R12');
  await page.locator('#q').fill('R12 JTAG');
  await page.locator('#library-search').evaluate(form => form.requestSubmit());
  assert.equal(await page.locator('.card').count(), 2, 'Multiple search words find grounded native sheet names');

  await page.locator('#q').fill('no-such-illustration-xyz');
  await page.locator('#library-search').evaluate(form => form.requestSubmit());
  assert.equal(await page.locator('.card').count(), 0);
  assert.equal(await page.locator('#empty-state').isVisible(), true);
  await page.locator('#empty-reset').click();
  assert.equal(await page.locator('.card').count(), 24);

  const originalEntry = catalog.entries.find(entry => entry.provenance && entry.full_source !== entry.source);
  await page.goto(base + '?q=' + encodeURIComponent(originalEntry.filename) + '&type=Illustration');
  await page.waitForSelector('.card');
  const target = page.locator('[data-id="' + originalEntry.id + '"]');
  await target.locator('button.card-preview').click();
  await page.waitForSelector('#preview-media img');
  assert.equal(await page.locator('#preview-dialog').evaluate(dialog => dialog.open), true);
  assert.equal(await page.locator('#preview-media img').getAttribute('src'), originalEntry.image, 'Modal preserves the rebased original full-image/SVG choice');
  assert.equal(await page.locator('#preview-original').getAttribute('href'), originalEntry.image);
  assert.ok(requested.some(request => request.type === 'image' && request.url.endsWith(originalEntry.full_source)), 'Original is requested on demand');
  await page.keyboard.press('Escape');
  await page.locator('#preview-media img').waitFor({state: 'detached'});
  assert.equal(await page.locator('#preview-dialog').evaluate(dialog => dialog.open), false);
  assert.equal(await page.locator('#preview-media img').count(), 0, 'Closing a modal releases its original image DOM');

  await page.setViewportSize({width: 390, height: 844});
  await page.goto(base + '?type=Illustration');
  await page.waitForSelector('.card');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Mobile page should not scroll horizontally');
  await page.locator('button.card-preview').first().click();
  await page.waitForSelector('#preview-media img');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Mobile dialog should not overflow horizontally');
  await page.locator('#close-preview').click();

  const noJsContext = await browser.newContext({javaScriptEnabled: false});
  const noJs = await noJsContext.newPage();
  await noJs.goto(base);
  assert.equal(await noJs.locator('#fallback').isVisible(), true);
  assert.equal(await noJs.locator('#fallback li').count(), catalog.entries.length, 'All sources remain reachable without JavaScript');
  await noJsContext.close();
  assert.deepEqual(errors, [], 'No client script errors');
  await browser.close();
  console.log(JSON.stringify({passed: true, entries: catalog.entries.length, initial_cards: 24,
    illustrations: catalog.entries.filter(entry => entry.type === 'Illustration').length,
    original_image_requests_before_click: 0, checks: ['combined search and filters', 'shareable deep link reload', 'load more', 'empty state', 'full SVG source on click', 'Escape and image release', 'mobile width', 'no-JavaScript fallback', 'no script errors']}, null, 2));
})().catch(error => { console.error(error); process.exit(1); });
