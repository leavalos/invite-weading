import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Run the actual Apps Script handler against a small in-memory Sheets adapter.
const rows = [];
const sheet = {
  getLastRow: () => rows.length,
  getRange(row, column) {
    return {
      setValues(values) { rows[row - 1] = values[0]; },
      getValues: () => [rows[row - 1]],
      setFontWeight() { return this; }, setBackground() { return this; }, setFontColor() { return this; },
      setValue() {}, setFormula() {},
      createTextFinder(value) { return { matchEntireCell() { return this; }, findNext: () => rows.slice(1).find(item => item[column - 1] === value) }; },
    };
  },
  setFrozenRows() {}, setColumnWidths() {}, setColumnWidth() {},
  appendRow(row) { rows.push(row); },
};
const context = vm.createContext({
  console: { error() {} },
  SpreadsheetApp: { openById: () => ({ getSheetByName: () => sheet }), flush() {} },
  LockService: { getScriptLock: () => ({ waitLock() {}, hasLock: () => true, releaseLock() {} }) },
  ContentService: { MimeType: { JSON: 'json' }, createTextOutput: text => ({ setMimeType: () => JSON.parse(text) }) },
});
vm.runInContext(fs.readFileSync('google-apps-script/Code.gs', 'utf8'), context);
const payload = { name: '=Ana', attending: true, names: ['=Ana', 'Carlos'], diet: '=menu' };
const id = '12345678-1234-1234-1234-123456789abc';
const send = (data, requestId = id) => context.doPost({ parameter: { requestId, payload: JSON.stringify(data) } });
assert.equal(send(payload).ok, true);
assert.equal(rows[1][2], "'=Ana");
assert.equal(rows[1][4], 2);
assert.equal(rows[1][6], "'=menu");
assert.equal(send(payload).ok, true);
assert.equal(rows.length, 2, 'retry must not duplicate');
assert.equal(send({ ...payload, names: ['=Ana', '=Ana'] }).ok, false);
assert.equal(send({ ...payload, attending: 'yes' }).ok, false);
assert.equal(send({ name: 'Luis', attending: false, names: ['Luis', 'María'], diet: '' }, '22345678-1234-1234-1234-123456789abc').ok, true);
assert.equal(rows[2][4], 0);
assert.equal(rows[2][5], 'Luis\nMaría');
console.log('Apps Script: validation, totals, formula escaping and retry deduplication passed (mock Sheets).');

const endpoint = 'https://script.google.com/macros/s/local-test/exec';
process.env.VITE_RSVP_ENDPOINT = endpoint;
const server = await createServer({ server: { host: '127.0.0.1', port: 5175, strictPort: true } });
await server.listen();
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  let failNext = false;
  const requests = [];
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.href === endpoint) {
      const body = Object.fromEntries(new URLSearchParams(route.request().postData()));
      requests.push(body);
      if (failNext) { failNext = false; return route.abort(); }
      return route.fulfill({ contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, requestId: body.requestId }) });
    }
    return url.origin === 'http://127.0.0.1:5175' || url.protocol === 'data:' ? route.continue() : route.abort();
  });
  fs.mkdirSync('artifacts', { recursive: true });
  for (const width of [1366, 390, 320]) {
    await page.setViewportSize({ width, height: 850 });
    await page.goto('http://127.0.0.1:5175');
    await page.getByRole('button', { name: 'Abrir invitación', exact: true }).click();
    await page.locator('#rsvp-open').click();
    const dialog = page.locator('#rsvp-dialog');
    await page.getByLabel('Tu nombre y apellido').fill('Ana Pérez');
    await page.getByLabel('Sí, voy a asistir', { exact: true }).check();
    await page.getByRole('button', { name: '+ Agregar persona', exact: true }).click();
    await page.getByLabel('Nombre y apellido de la otra persona').fill('Carlos Pérez');
    assert.match(await page.locator('#rsvp-summary').textContent(), /2 personas: Ana Pérez, Carlos Pérez/);
    assert.equal(await dialog.evaluate(el => el.scrollWidth > el.clientWidth), false);
    await page.screenshot({ path: `artifacts/rsvp-${width}.png` });
    failNext = true;
    await page.getByRole('button', { name: 'Guardar respuesta', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('#rsvp-status').textContent.startsWith('No pudimos'));
    assert.equal(await page.getByLabel('Tu nombre y apellido').inputValue(), 'Ana Pérez');
    await page.getByRole('button', { name: 'Guardar respuesta', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('#rsvp-status').textContent.startsWith('¡Listo!'));
    assert.equal(requests.at(-1).requestId, requests.at(-2).requestId);
    assert.equal(JSON.parse(requests.at(-1).payload).names.length, 2);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#rsvp-open').evaluate(el => el === document.activeElement), true);
  }
  await page.reload();
  await page.getByRole('button', { name: 'Abrir invitación', exact: true }).click();
  await page.locator('#rsvp-open').click();
  await page.getByLabel('Tu nombre y apellido').fill('Luis');
  await page.getByLabel('Sí, voy a asistir', { exact: true }).check();
  await page.locator('#add-companion').click();
  await page.getByLabel('No podré asistir', { exact: true }).check();
  await page.getByLabel('Nombre y apellido de la otra persona').fill('María');
  assert.match(await page.locator('#rsvp-summary').textContent(), /2 personas no podrán asistir: Luis, María/);
  assert.equal(await page.locator('#rsvp-diet').isVisible(), false);
  await page.getByRole('button', { name: 'Guardar respuesta', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('#rsvp-status').textContent.startsWith('Gracias'));
  assert.deepEqual(JSON.parse(requests.at(-1).payload).names, ['Luis', 'María']);
  assert.equal(JSON.parse(requests.at(-1).payload).attending, false);
  assert.deepEqual(errors, []);
  console.log('RSVP desktop/mobile: family totals, decline, focus, overflow, failure recovery and acknowledged save passed (mock endpoint).');
} finally {
  await browser.close();
  await server.close();
}
