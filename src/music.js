export function installBackgroundMusic() {
  const audio = document.createElement('audio');
  audio.id = 'background-music';
  audio.src = `${import.meta.env.BASE_URL}audio/lets-get-married.mp3`;
  audio.loop = true;
  audio.preload = 'metadata';
  audio.volume = 0.45;

  const toggle = document.createElement('button');
  toggle.className = 'background-music-toggle';
  toggle.type = 'button';
  toggle.hidden = true;
  toggle.setAttribute('aria-controls', audio.id);
  function updateControl() {
    toggle.dataset.symbol = audio.paused ? '♪' : 'Ⅱ';
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
  cover.setAttribute('aria-label', 'Invitación de Daniela y Lucas');
  cover.innerHTML = `
    <div class="invitation-cover-content">
      <div class="invitation-cover-logo">
        <img src="${import.meta.env.BASE_URL}wedding-logo.png" alt="Logo de Lucas y Daniela" width="2000" height="2000">
      </div>
      <button class="button invitation-cover-open" type="button" autofocus>Abrir invitación</button>
    </div>`;
  cover.querySelector('.invitation-cover-open').addEventListener('click', () => {
    // Call play directly within the click, before any asynchronous work.
    void play();
    cover.close();
  });
  cover.addEventListener('cancel', event => event.preventDefault());
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
