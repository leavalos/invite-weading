// Development smoke check against our own local site, without visiting linked services.
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { content } from '../src/content.js';
const siteUrl = process.env.SITE_URL || 'http://127.0.0.1:5173/';
const siteOrigin = new URL(siteUrl).origin;
fs.mkdirSync('artifacts', { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin: siteOrigin });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    return url.origin === siteOrigin || url.protocol === 'data:' ? route.continue() : route.abort();
  });
  for (const [name, width, height] of [['desktop', 1366, 900], ['mobile', 390, 844], ['small-mobile', 320, 700]]) {
    await page.setViewportSize({ width, height });
    await page.goto(siteUrl, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.closing-caption').scrollIntoViewIfNeeded();
    await page.locator('.closing-photo').evaluate(img => img.decode());
    await page.evaluate(() => window.scrollTo(0, 0));
    assert.equal(await page.locator('main > section').count(), 10);
    assert.equal(await page.locator('h1').textContent(), content.names);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert.equal(overflow, false, `${name}: horizontal overflow`);
    for (const element of await page.locator('.scroll-reveal').all()) {
      await element.scrollIntoViewIfNeeded();
      await page.waitForFunction(node => node.classList.contains('is-visible'), await element.elementHandle());
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    const imageFailures = await page.locator('img').evaluateAll(images => images.filter(img => img.complete && img.naturalWidth === 0).map(img => img.src));
    assert.deepEqual(imageFailures, [], `${name}: broken images`);
    const svgUrls = await page.locator('svg image').evaluateAll(images => [...new Set(images.map(img => img.getAttribute('href')))]);
    for (const url of svgUrls) assert.equal((await page.request.get(new URL(url, siteUrl).href)).status(), 200, url);
    for (const key of ['maps', 'spotify', 'album', 'rsvp']) {
      assert.equal(await page.locator(`a[href="${content.links[key]}"]`).count(), 1, `${key}: link missing`);
    }
    assert.match(await page.locator('[data-time="0"]').textContent(), /^\d+$/);
    await page.getByRole('button', { name: 'Ver datos bancarios', exact: true }).click();
    const bankDialog = page.getByRole('dialog', { name: 'Datos bancarios' });
    assert.equal(await bankDialog.isVisible(), true);
    for (const account of content.bankAccounts) {
      assert.equal(await bankDialog.getByText(account.name, { exact: true }).count(), 1);
      assert.equal(await bankDialog.getByText(account.alias, { exact: true }).count(), 1);
      assert.equal(await bankDialog.getByText(account.cvu, { exact: true }).count(), 1);
    }
    assert.equal(await bankDialog.evaluate(el => el.scrollWidth > el.clientWidth), false, 'Modal overflow');
    for (const copyButton of await bankDialog.locator('[data-copy]').all()) {
      await copyButton.click();
      await page.waitForFunction(() => document.querySelector('.bank-copy-status').textContent === 'Dato copiado al portapapeles.');
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), await copyButton.getAttribute('data-copy'));
    }
    await page.screenshot({ path: `artifacts/bank-${name}.png` });
    await page.keyboard.press('Escape');
    assert.equal(await bankDialog.isVisible(), false);
    assert.equal(await page.locator('#bank-details-open').evaluate(el => el === document.activeElement), true);
    await page.locator('#bank-details-open').click();
    await page.getByRole('button', { name: 'Cerrar datos bancarios' }).click();
    assert.equal(await bankDialog.isVisible(), false);
    await page.locator('#bank-details-open').click();
    await page.mouse.click(2, 2);
    assert.equal(await bankDialog.isVisible(), false);
    await page.screenshot({ path: `artifacts/${name}.png`, fullPage: true });
    if (name === 'desktop') {
      for (const section of ['hero', 'story', 'dress']) await page.locator(`.${section}`).screenshot({ path: `artifacts/${section}.png` });
    }
    if (name === 'mobile') await page.locator('.hero').screenshot({ path: 'artifacts/mobile-hero.png' });
    console.log(`${name}: 10 sections, images, links and overflow checks passed.`);
  }
  await page.waitForFunction(() => !document.querySelector('#background-music').paused);
  assert.equal(await page.locator('#background-music').evaluate(el => el.loop && el.duration > 0), true);
  await page.getByRole('button', { name: 'Pausar música de fondo' }).click();
  assert.equal(await page.locator('#background-music').evaluate(el => el.paused), true);
  await page.locator('h1').click();
  assert.equal(await page.locator('#background-music').evaluate(el => el.paused), true);
  await page.getByRole('button', { name: 'Activar música de fondo' }).click();
  await page.waitForFunction(() => !document.querySelector('#background-music').paused);
  await page.clock.install({ time: new Date('2027-02-21T00:00:00-03:00') });
  await page.reload({ waitUntil: 'networkidle' });
  await page.clock.runFor(1100);
  assert.deepEqual(await page.locator('[data-time]').allTextContents(), ['00', '00', '00']);
  assert.deepEqual(errors, []);
  console.log('Music controls, countdown expiry and JavaScript checks passed.');
} finally {
  await browser.close();
}
