import './rsvp.css';

const endpoint = import.meta.env.VITE_RSVP_ENDPOINT || '';

export function installRsvp() {
  const dialog = document.createElement('dialog');
  dialog.id = 'rsvp-dialog';
  dialog.className = 'bank-dialog rsvp-dialog';
  dialog.setAttribute('aria-labelledby', 'rsvp-dialog-title');
  dialog.innerHTML = `
    <div class="bank-dialog-content">
      <header class="bank-dialog-header">
        <button class="bank-close" type="button" aria-label="Cerrar confirmación">×</button>
        <h2 id="rsvp-dialog-title">Confirmar asistencia</h2>
      </header>
      <p class="rsvp-intro">Contanos quiénes van a acompañarnos. Completá una sola respuesta por pareja o familia.</p>
      <form id="rsvp-form">
        <fieldset class="rsvp-fields">
          <label for="guest-name">Tu nombre y apellido</label>
          <input id="guest-name" name="guestName" autocomplete="name" maxlength="100" required>
          <fieldset class="rsvp-attendance">
            <legend>¿Vas a asistir?</legend>
            <label><input type="radio" name="attending" value="yes" required> Sí, voy a asistir</label>
            <label><input type="radio" name="attending" value="no" required> No podré asistir</label>
          </fieldset>
          <div id="rsvp-companions" hidden>
            <p id="companions-heading">¿Quién más viene con vos?</p>
            <p class="rsvp-help">Agregá solo a las personas incluidas en tu invitación que tienen la misma respuesta que vos. Si respondés solo por vos, no hace falta agregar a nadie.</p>
            <div id="companion-list"></div>
            <button class="rsvp-secondary" id="add-companion" type="button">+ Agregar persona</button>
            <div id="rsvp-diet">
              <label for="guest-diet">¿Alguien necesita un menú especial? (opcional)</label>
              <textarea id="guest-diet" name="diet" rows="3" maxlength="1000" placeholder="Por ejemplo: Ana es celíaca"></textarea>
            </div>
          </div>
          <p id="rsvp-summary" aria-live="polite"></p>
          <button class="rsvp-submit" type="submit">Guardar respuesta</button>
        </fieldset>
      </form>
      <p id="rsvp-status" role="status" aria-live="polite" tabindex="-1"></p>
    </div>`;
  document.body.append(dialog);
  const open = document.querySelector('#rsvp-open');
  const form = dialog.querySelector('form');
  const fields = dialog.querySelector('.rsvp-fields');
  const name = dialog.querySelector('#guest-name');
  const companions = dialog.querySelector('#rsvp-companions');
  const list = dialog.querySelector('#companion-list');
  const summary = dialog.querySelector('#rsvp-summary');
  const status = dialog.querySelector('#rsvp-status');
  const submit = dialog.querySelector('[type="submit"]');
  const add = dialog.querySelector('#add-companion');
  let sequence = 0;
  let pending = false;
  let lastPayload = '';
  let requestId = '';

  const attending = () => form.elements.attending.value === 'yes';
  const names = () => [name.value.trim(), ...[...list.querySelectorAll('input')].map(input => input.value.trim())].filter(Boolean);
  function update() {
    const answered = Boolean(form.elements.attending.value);
    companions.hidden = !answered;
    companions.querySelectorAll('input, button').forEach(el => { el.disabled = !answered; });
    dialog.querySelector('#companions-heading').textContent = attending() ? '¿Quién más viene con vos?' : '¿Quién más no podrá asistir?';
    dialog.querySelector('#rsvp-diet').hidden = !attending();
    form.elements.diet.disabled = !attending();
    add.disabled = !answered || list.children.length >= 19;
    summary.textContent = attending()
      ? `Estás confirmando a ${names().length} ${names().length === 1 ? 'persona' : 'personas'}: ${names().join(', ')}.`
      : answered ? `Guardaremos que ${names().length} ${names().length === 1 ? 'persona no podrá' : 'personas no podrán'} asistir: ${names().join(', ')}.` : '';
  }
  open.addEventListener('click', () => {
    dialog.showModal();
    document.body.classList.add('modal-open');
  });
  dialog.querySelector('.bank-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    open.focus({ preventScroll: true });
  });
  add.addEventListener('click', () => {
    if (list.children.length >= 19) return;
    const row = document.createElement('div');
    row.className = 'companion-row';
    const id = `companion-${++sequence}`;
    row.innerHTML = `<label for="${id}">Nombre y apellido de la otra persona</label><div><input id="${id}" maxlength="100" required><button class="rsvp-secondary" type="button" aria-label="Quitar persona">Quitar</button></div>`;
    row.querySelector('button').addEventListener('click', () => { row.remove(); update(); add.focus(); });
    list.append(row);
    update();
    row.querySelector('input').focus();
  });
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending) return;
    status.textContent = '';
    if (!name.value.trim() || [...list.querySelectorAll('input')].some(input => !input.value.trim())) {
      status.textContent = 'Completá el nombre de cada persona o quitá los campos vacíos.';
      return;
    }
    const guestNames = names();
    if (new Set(guestNames.map(value => value.toLocaleLowerCase())).size !== guestNames.length) {
      status.textContent = 'Hay un nombre repetido. Revisá la lista antes de confirmar.';
      return;
    }
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(endpoint)) {
      status.textContent = 'La confirmación online todavía no está habilitada. Por favor, confirmá directamente con Daniela o Lucas.';
      return;
    }
    const payload = JSON.stringify({ name: name.value.trim(), attending: attending(), names: guestNames, diet: attending() ? form.elements.diet.value.trim() : '' });
    if (payload !== lastPayload) { requestId = crypto.randomUUID(); lastPayload = payload; }
    pending = true;
    fields.disabled = true;
    submit.textContent = 'Guardando…';
    status.textContent = 'Esperá un momento mientras guardamos tu respuesta.';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: new URLSearchParams({ payload, requestId }),
        signal: AbortSignal.timeout(25000),
      });
      const result = await response.json();
      if (!response.ok || !result.ok || result.requestId !== requestId) throw new Error('Unconfirmed response');
      form.hidden = true;
      status.textContent = attending()
        ? `¡Listo! Confirmaste a ${guestNames.length} ${guestNames.length === 1 ? 'persona' : 'personas'}: ${guestNames.join(', ')}. ¡Los esperamos!`
        : `Gracias por avisarnos. Guardamos que ${guestNames.length} ${guestNames.length === 1 ? 'persona no podrá' : 'personas no podrán'} asistir: ${guestNames.join(', ')}.`;
      status.focus();
    } catch {
      status.textContent = 'No pudimos verificar el guardado. Tus datos siguen acá: podés volver a intentar o comunicarte con Daniela o Lucas. Reintentar esta misma respuesta no la duplica.';
    } finally {
      pending = false;
      fields.disabled = false;
      submit.textContent = 'Guardar respuesta';
    }
  });
}
