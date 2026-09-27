// Deploy as a Web app: execute as yourself, access Anyone.
// This script only creates/uses the dedicated Confirmaciones web tab.
const SPREADSHEET_ID = '1u74S2zWM0RtUhka6OpLRPO5iWavaBC3osBPGKwhUgtA';
const TAB_NAME = 'Confirmaciones web';
const HEADERS = ['ID de respuesta', 'Fecha', 'Responsable', 'Asiste', 'Cantidad confirmada', 'Nombres', 'Menú especial'];

function setup() {
  const book = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = book.getSheetByName(TAB_NAME);
  if (!sheet) sheet = book.insertSheet(TAB_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange('A1:G1').setFontWeight('bold').setBackground('#68745e').setFontColor('#ffffff');
    sheet.getRange('I1').setValue('Total de personas confirmadas');
    sheet.getRange('I2').setFormula('=SUM(E2:E)');
    sheet.setColumnWidths(3, 1, 220);
    sheet.setColumnWidths(6, 2, 320);
    sheet.setColumnWidth(9, 240);
  }
  const headers = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  if (headers.join('|') !== HEADERS.join('|')) throw new Error('Unexpected sheet structure');
  return sheet;
}

function doPost(e) {
  let requestId = '';
  const lock = LockService.getScriptLock();
  try {
    requestId = String(e.parameter.requestId || '');
    if (!/^[a-f0-9-]{36}$/i.test(requestId)) throw new Error('Invalid ID');
    const raw = e.parameter.payload || '';
    if (raw.length > 6000) throw new Error('Payload too large');
    const data = JSON.parse(raw);
    function validText(value, limit) { return typeof value === 'string' && value.trim().length > 0 && value.length <= limit; }
    if (!validText(data.name, 100) || typeof data.attending !== 'boolean' || !Array.isArray(data.names) || data.names.length < 1 || data.names.length > 20 || !data.names.every(name => validText(name, 100)) || typeof data.diet !== 'string' || data.diet.length > 1000) throw new Error('Invalid fields');
    const names = data.names.map(name => name.trim());
    if (names[0] !== data.name.trim() || new Set(names.map(name => name.toLowerCase())).size !== names.length) throw new Error('Invalid names');
    lock.waitLock(20000);
    const sheet = setup();
    // Idempotent retries: a timeout never produces a second copy of the same request.
    const existing = sheet.getLastRow() > 1
      ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).createTextFinder(requestId).matchEntireCell(true).findNext()
      : null;
    if (!existing) {
      // Prefix formula-like input so it is always stored as text, never executed.
      const safe = value => /^[=+\-@\t\r\n]/.test(value) ? "'" + value : value;
      sheet.appendRow([requestId, new Date(), safe(data.name.trim()), data.attending ? 'Sí' : 'No', data.attending ? names.length : 0, safe(names.join('\n')), safe(data.attending ? data.diet.trim() : '')]);
      SpreadsheetApp.flush();
    }
    return json_({ ok: true, requestId });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, requestId });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
