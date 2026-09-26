import './style.css';
import { content as c } from './content';
import { asset, collage, installFonts } from './artwork';
import { installBackgroundMusic } from './music';
import { installScrollReveals } from './scroll-reveal';

installFonts();
const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const image = (id, alt = '', cls = '') => `<img class="illustration ${cls}" src="${asset(id)}" alt="${escape(alt)}" loading="lazy" decoding="async">`;
const link = (url, label, cls = 'button') => `<a class="${cls}" href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`;
const spotifyEmbedUrl = `https://open.spotify.com/embed${new URL(c.links.spotify).pathname}?theme=0`;
document.querySelector('#app').innerHTML = `
  <section class="hero paper" aria-labelledby="names">
    <div class="section-inner">
      <p class="hero-eyebrow">${escape(c.invitation)}</p>
      <h1 id="names">${escape(c.names)}</h1>
      <div id="proposal-collage"></div>
      <p class="proposal-caption">${escape(c.proposal)}</p>
    </div>
  </section>
  <section class="countdown-section cream" aria-labelledby="countdown-title">
    <div class="section-inner">
      <h2 id="countdown-title">${escape(c.countdownTitle)}</h2>
      <div class="countdown" role="timer" aria-label="Tiempo restante para la boda">
        ${['Días', 'Horas', 'Minutos'].map((unit, i) => `${i ? '<span class="countdown-separator" aria-hidden="true">:</span>' : ''}<div class="countdown-unit"><span class="countdown-value" data-time="${i}">00</span><span class="countdown-label">${unit}</span></div>`).join('')}
      </div>
      <svg class="rings" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="43" />
        <path d="M50 10v10M50 80v10M10 50h10M80 50h10M21.7 21.7l7.1 7.1M71.2 71.2l7.1 7.1M78.3 21.7l-7.1 7.1M28.8 71.2l-7.1 7.1M50 28v22h18" />
      </svg>
      <p class="countdown-caption">${escape(c.countdownCaption)}</p>
    </div>
  </section>
  <section class="story sage" aria-labelledby="story-title">
    <div class="section-inner">
      ${image('MAFQGoZVWJU', '', 'story-arrow')}
      <h2 id="story-title">${escape(c.storyTitle)}</h2>
      <p class="story-copy">${escape(c.story)}</p>
      <div id="story-collage"></div>
    </div>
  </section>
  <section id="hora-y-lugar" class="venue paper" aria-labelledby="venue-title">
    <div class="section-inner">
      <h2 id="venue-title">Hora & lugar</h2>
      <ol class="schedule">${c.schedule.map(([time, label]) => `<li><span class="time">${escape(time)}</span><span>${escape(label)}</span></li>`).join('')}</ol>
      <p class="punctuality">${escape(c.punctuality)}</p>
      ${image('MAGXDeIWNHQ', '', 'venue-drawing')}
      <p class="venue-address">${escape(c.venue)}</p>
      ${link(c.links.maps, 'Cómo llegar')}
    </div>
  </section>
  <section class="dress cream" aria-labelledby="dress-title">
    <div class="section-inner">
      <p class="eyebrow">Dress code</p>
      <h2 id="dress-title">Semiformal</h2>
      <div class="dress-grid">
        <div id="dress-collage"></div>
        <div class="dress-copy"><h3>Mujer</h3>${c.women.map(t => `<p>${escape(t)}</p>`).join('')}<h3>Hombre</h3><p>${c.men.map(escape).join('<br>')}</p></div>
      </div>
      <p class="dress-note"><strong>¡Importante!</strong> ${escape(c.dressNote)}</p>
    </div>
  </section>
  <section class="song sage" aria-labelledby="song-title">
    <div class="section-inner">
      <h2 id="song-title">${escape(c.songTitle)}</h2>
      <p class="section-copy">${escape(c.songDescription)}</p>
      <div class="spotify-player">
        <iframe src="${escape(spotifyEmbedUrl)}" title="Playlist de nuestra boda en Spotify" width="100%" height="352" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>
      </div>
      <p class="song-caption">${link(c.links.spotify, 'Mandale play', 'spotify-link')}</p>
    </div>
  </section>
  <section class="album paper" aria-labelledby="album-title">
    <div class="section-inner">
      <h2 id="album-title">${escape(c.albumTitle)}</h2>
      <p class="section-copy">${escape(c.albumDescription)}</p>
      ${image('MAGVI_82pY4', '', 'camera')}
      ${link(c.links.album, 'Ir al álbum')}
    </div>
  </section>
  <section class="gifts cream" aria-labelledby="gifts-title">
    <div class="section-inner">
      <h2 id="gifts-title">${escape(c.giftsTitle)}</h2>
      <p class="section-copy">${escape(c.giftsDescription)}</p>
      ${image('MAGgCMbpXEk', '', 'gift')}
      <button class="button" id="bank-details-open" type="button" aria-haspopup="dialog" aria-controls="bank-details">Ver datos bancarios</button>
    </div>
  </section>
  <section class="rsvp sage" aria-labelledby="rsvp-title">
    <div class="section-inner">
      <div id="calendar-collage"></div>
      <h2 id="rsvp-title">${escape(c.rsvpTitle)}</h2>
      <p class="section-copy">${escape(c.rsvpDescription)}</p>
      ${link(c.links.rsvp, 'Confirma aquí', 'button button-light')}
      <p class="rsvp-deadline">${escape(c.rsvpDeadline)}</p>
    </div>
  </section>
  <section class="closing paper" aria-labelledby="closing-title">
    <div class="section-inner">
      <p class="closing-eyebrow">${escape(c.closingEyebrow)}</p>
      <h2 id="closing-title">${escape(c.closingTitle)}</h2>
      ${image('MAHT5WeVRfc', 'Daniela y Lucas: toda una vida por recorrer', 'closing-photo')}
      <p class="closing-caption">${escape(c.closingCaption)}</p>
    </div>
  </section>`;

const bankDialog = document.createElement('dialog');
bankDialog.id = 'bank-details';
bankDialog.className = 'bank-dialog';
bankDialog.setAttribute('aria-labelledby', 'bank-details-title');
bankDialog.innerHTML = `
  <div class="bank-dialog-content">
    <button class="bank-close" type="button" aria-label="Cerrar datos bancarios" autofocus>×</button>
    <h2 id="bank-details-title">Datos bancarios</h2>
    ${c.bankAccounts.map(account => `
      <section class="bank-account" aria-label="Cuenta de ${escape(account.name)}">
        <h3>${escape(account.name)}</h3>
        <dl>${[['Alias', account.alias], ['CVU', account.cvu]].map(([label, value]) => `
          <div class="bank-field">
            <dt>${label}</dt>
            <dd><span class="bank-value">${escape(value)}</span><button class="bank-copy" type="button" data-copy="${escape(value)}" aria-label="Copiar ${label} de ${escape(account.name)}">Copiar</button></dd>
          </div>`).join('')}
        </dl>
      </section>`).join('')}
    <p class="bank-copy-status" role="status" aria-live="polite"></p>
  </div>`;
document.body.append(bankDialog);
const bankOpen = document.querySelector('#bank-details-open');
bankOpen.addEventListener('click', () => {
  bankDialog.querySelector('.bank-copy-status').textContent = '';
  bankDialog.showModal();
  document.body.classList.add('modal-open');
});
bankDialog.querySelector('.bank-close').addEventListener('click', () => bankDialog.close());
bankDialog.addEventListener('click', event => {
  if (event.target !== bankDialog) return;
  const rect = bankDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) bankDialog.close();
});
bankDialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  bankOpen.focus({ preventScroll: true });
});
bankDialog.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const status = bankDialog.querySelector('.bank-copy-status');
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      status.textContent = 'Dato copiado al portapapeles.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(button.previousElementSibling);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'No se pudo copiar automáticamente. El dato quedó seleccionado para copiarlo manualmente.';
    }
  });
});

document.querySelector('#proposal-collage').append(collage(0, 'El momento exacto del sí: tres fotografías de nuestra propuesta en Roma'));
document.querySelector('#story-collage').append(collage(2, 'Cuatro recuerdos de nuestra historia juntos'));
document.querySelector('#dress-collage').append(collage(4, 'Ilustración de opciones de vestimenta semiformal'));
document.querySelector('#calendar-collage').append(collage(8, 'Calendario de febrero'));
installScrollReveals();

const targetDate = new Date(c.weddingDate).getTime();
function updateCountdown() {
  const seconds = Math.max(0, Math.floor((targetDate - Date.now()) / 1000));
  const values = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60];
  document.querySelectorAll('[data-time]').forEach((node, i) => { node.textContent = String(values[i]).padStart(2, '0'); });
}
updateCountdown();
setInterval(updateCountdown, 1000);

installBackgroundMusic();

// Preserve the recoloring used in the original Canva illustrations.
for (const [selector, replacements] of [
  ['.story-arrow', { '#000000': '#e2dfcf' }],
]) {
  const img = document.querySelector(selector);
  fetch(img.src).then(r => { if (!r.ok) throw new Error('Asset unavailable'); return r.text(); }).then(source => {
    for (const [from, to] of Object.entries(replacements)) source = source.replaceAll(new RegExp(from, 'gi'), to);
    if (selector === '.story-arrow') source = source.replace('<svg ', '<svg fill="#e2dfcf" ');
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
  }).catch(() => { /* Keep the original local asset if recoloring fails. */ });
}
