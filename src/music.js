export function installBackgroundMusic() {
  const audio = document.createElement('audio');
  audio.id = 'background-music';
  audio.src = `${import.meta.env.BASE_URL}audio/evergreen.mp3`;
  audio.autoplay = true;
  audio.loop = true;
  audio.preload = 'metadata';
  audio.volume = 0.45;

  const toggle = document.createElement('button');
  toggle.className = 'background-music-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-controls', audio.id);
  function updateControl() {
    toggle.textContent = audio.paused ? '♪ Activar música' : 'Ⅱ Pausar música';
    toggle.setAttribute('aria-label', audio.paused ? 'Activar música de fondo' : 'Pausar música de fondo');
  }
  async function play() {
    try { await audio.play(); } catch { updateControl(); }
  }
  function stopWaitingForInteraction() {
    document.removeEventListener('click', firstInteraction);
    document.removeEventListener('keydown', firstInteraction);
  }
  function firstInteraction(event) {
    if (event.target === toggle || event.ctrlKey || event.metaKey || event.altKey) return;
    void play();
  }
  toggle.addEventListener('click', event => {
    event.stopPropagation();
    stopWaitingForInteraction();
    if (audio.paused) void play();
    else audio.pause();
  });
  audio.addEventListener('play', () => {
    stopWaitingForInteraction();
    updateControl();
  });
  audio.addEventListener('pause', updateControl);
  audio.addEventListener('error', () => {
    stopWaitingForInteraction();
    toggle.textContent = 'Música no disponible';
    toggle.setAttribute('aria-label', 'Música de fondo no disponible');
    toggle.disabled = true;
  });
  document.addEventListener('click', firstInteraction);
  document.addEventListener('keydown', firstInteraction);
  updateControl();
  document.body.append(audio, toggle);
  void play();
}
