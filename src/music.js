import { content } from './content';

export function installBackgroundMusic() {
  const audio = document.createElement('audio');
  audio.id = 'background-music';
  audio.src = `${import.meta.env.BASE_URL}audio/evergreen.mp3`;
  audio.loop = true;
  audio.preload = 'metadata';
  audio.volume = 0.45;

  const toggle = document.createElement('button');
  toggle.className = 'background-music-toggle';
  toggle.type = 'button';
  toggle.hidden = true;
  toggle.setAttribute('aria-controls', audio.id);
  function updateControl() {
    toggle.textContent = audio.paused ? '♪ Activar música' : 'Ⅱ Pausar música';
    toggle.setAttribute('aria-label', audio.paused ? 'Activar música de fondo' : 'Pausar música de fondo');
  }
  async function play() {
    try { await audio.play(); } catch { updateControl(); }
  }
  toggle.addEventListener('click', () => {
    if (audio.paused) void play();
    else audio.pause();
  });
  audio.addEventListener('play', () => {
    updateControl();
  });
  audio.addEventListener('pause', updateControl);
  audio.addEventListener('error', () => {
    toggle.textContent = 'Música no disponible';
    toggle.setAttribute('aria-label', 'Música de fondo no disponible');
    toggle.disabled = true;
  });
  updateControl();
  document.body.append(audio, toggle);

  const cover = document.createElement('dialog');
  cover.className = 'invitation-cover';
  cover.setAttribute('aria-labelledby', 'invitation-cover-title');
  cover.innerHTML = `
    <div class="invitation-cover-content">
      <span class="invitation-cover-monogram" aria-hidden="true">D & L</span>
      <p class="invitation-cover-eyebrow">Nos casamos</p>
      <h2 id="invitation-cover-title"></h2>
      <p class="invitation-cover-date">20 · 02 · 2027</p>
      <span class="invitation-cover-divider" aria-hidden="true"></span>
      <p class="invitation-cover-message">Una nueva historia comienza.<br>Queremos compartirla con vos.</p>
      <button class="button invitation-cover-open" type="button" autofocus>Abrir invitación con música</button>
      <button class="invitation-cover-silent" type="button">Entrar sin música</button>
    </div>`;
  cover.querySelector('h2').textContent = content.names;
  cover.querySelector('.invitation-cover-open').addEventListener('click', () => {
    // Call play directly within the click, before any asynchronous work.
    void play();
    cover.close();
  });
  cover.querySelector('.invitation-cover-silent').addEventListener('click', () => cover.close());
  cover.addEventListener('close', () => {
    document.body.classList.remove('invitation-closed');
    toggle.hidden = false;
    const heading = document.querySelector('#names');
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
    cover.remove();
  });
  document.body.append(cover);
  document.body.classList.add('invitation-closed');
  cover.showModal();
}
