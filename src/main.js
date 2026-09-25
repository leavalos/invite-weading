import './style.css';
import { content as c } from './content';
import { asset, collage, installFonts } from './artwork';

installFonts();
const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const image = (id, alt = '', cls = '') => `<img class="illustration ${cls}" src="${asset(id)}" alt="${escape(alt)}" loading="lazy" decoding="async">`;
const link = (url, label, cls = 'button') => `<a class="${cls}" href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`;
document.querySelector('#app').innerHTML = `
  <section class="hero paper" aria-labelledby="names">
    <div class="section-inner">
      <button class="music-toggle" type="button" aria-label="Reproducir nuestra canción" aria-expanded="false" aria-controls="music-player"><span aria-hidden="true">▶</span></button>
      <div id="music-player" hidden></div>
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
        ${['Días', 'Horas', 'Minutos', 'Segundos'].map((unit, i) => `<div class="countdown-unit"><span class="countdown-value" data-time="${i}">00</span><span class="countdown-label">${unit}</span></div>`).join('')}
      </div>
      ${image('MAHNZ7BTwgk', '', 'rings')}
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
      <a class="spotify-link" href="${escape(c.links.spotify)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir la playlist de nuestra boda en Spotify">${image('MAFeaY4Dk3U', 'Spotify')}</a>
      <p class="song-caption">Mandale play</p>
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
      ${link(c.links.gifts, 'Ver datos bancarios')}
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

document.querySelector('#proposal-collage').append(collage(0, 'El momento exacto del sí: tres fotografías de nuestra propuesta en Roma'));
document.querySelector('#story-collage').append(collage(2, 'Cuatro recuerdos de nuestra historia juntos'));
document.querySelector('#dress-collage').append(collage(4, 'Ilustración de opciones de vestimenta semiformal'));
document.querySelector('#calendar-collage').append(collage(8, 'Calendario de febrero'));

const targetDate = new Date(c.weddingDate).getTime();
function updateCountdown() {
  const seconds = Math.max(0, Math.floor((targetDate - Date.now()) / 1000));
  const values = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
  document.querySelectorAll('[data-time]').forEach((node, i) => { node.textContent = String(values[i]).padStart(2, '0'); });
}
updateCountdown();
setInterval(updateCountdown, 1000);

const musicButton = document.querySelector('.music-toggle');
const player = document.querySelector('#music-player');
musicButton.addEventListener('click', () => {
  const opening = player.hidden;
  player.hidden = !opening;
  musicButton.setAttribute('aria-expanded', String(opening));
  musicButton.setAttribute('aria-label', opening ? 'Cerrar y detener nuestra canción' : 'Reproducir nuestra canción');
  musicButton.firstElementChild.textContent = opening ? '×' : '▶';
  if (opening) {
    const iframe = document.createElement('iframe');
    iframe.src = c.links.music;
    iframe.title = 'Nuestra canción en YouTube';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    player.append(iframe);
  } else player.replaceChildren();
});

// Preserve the recoloring used in the original Canva illustrations.
for (const [selector, replacements] of [
  ['.spotify-link img', { '#19223d': '#010101', '#698dc9': '#f0eede' }],
  ['.story-arrow', { '#000000': '#e2dfcf' }],
]) {
  const img = document.querySelector(selector);
  fetch(img.src).then(r => { if (!r.ok) throw new Error('Asset unavailable'); return r.text(); }).then(source => {
    for (const [from, to] of Object.entries(replacements)) source = source.replaceAll(new RegExp(from, 'gi'), to);
    if (selector === '.story-arrow') source = source.replace('<svg ', '<svg fill="#e2dfcf" ');
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
  }).catch(() => { /* Keep the original local asset if recoloring fails. */ });
}
