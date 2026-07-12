const api = typeof browser !== 'undefined' ? browser : chrome;

// Выбираем видео/аудио элемент который реально играет
function getActiveMedia() {
  const media = [...document.querySelectorAll('video, audio')];
  if (!media.length) return null;

  const playing = media.find(el => !el.paused && !el.ended && el.readyState > 2);
  if (playing) return playing;

  return media.find(el => el.duration > 0) || media[0];
}

// Берём самую крупную обложку, blob: отсекаем — они не переживают переход в popup
function getBestArtwork(artwork) {
  if (!artwork || !artwork.length) return '';

  const valid = artwork.filter(a => a.src && !a.src.startsWith('blob:'));
  if (!valid.length) return '';

  const sorted = [...valid].sort((a, b) => {
    const sizeA = parseInt((a.sizes || '0x0').split('x')[0]) || 0;
    const sizeB = parseInt((b.sizes || '0x0').split('x')[0]) || 0;
    return sizeB - sizeA;
  });

  return sorted[0].src;
}

function saveMedia() {
  const ms = navigator.mediaSession;
  const meta = ms?.metadata;
  const el = getActiveMedia();
  if (!meta?.title) return;

  api.storage.local.set({
    monoui_media: {
      title: meta.title,
      artist: meta.artist || '',
      artwork: getBestArtwork(meta.artwork),
      playing: el ? !el.paused : ms.playbackState === 'playing',
      ts: Date.now()
    }
  });
}

setInterval(saveMedia, 500);

function clickSelector(selectors) {
  for (const sel of selectors) {
    const btn = document.querySelector(sel);
    if (btn) { btn.click(); return true; }
  }
  return false;
}

api.runtime.onMessage.addListener((msg) => {
  const el = getActiveMedia();

  if (msg.type === 'MEDIA_PLAY') {
    el?.play().catch(() => {});
  }

  if (msg.type === 'MEDIA_PAUSE') {
    el?.pause();
  }

  if (msg.type === 'MEDIA_NEXT') {
    const clicked = clickSelector([
      '.ytp-next-button',
      'ytmusic-player-bar .next-button',
      'tp-yt-paper-icon-button.next-button',
      '[data-testid="control-button-skip-forward"]',
      '.skipControl__next',
      '.player-controls .btn-next',
      '.next-button',
      '[aria-label="Next"]',
      '[aria-label="Next track"]',
      '[aria-label="Следующий"]',
      '[aria-label="Наступний"]',
    ]);

    if (!clicked && el && isFinite(el.duration)) {
      el.currentTime = Math.min(el.duration, el.currentTime + 10);
    }
  }

  if (msg.type === 'MEDIA_PREV') {
    const clicked = clickSelector([
      'ytmusic-player-bar .previous-button',
      'tp-yt-paper-icon-button.previous-button',
      '[data-testid="control-button-skip-back"]',
      '.skipControl__previous',
      '.player-controls .btn-prev',
      '.previous-button',
      '[aria-label="Previous"]',
      '[aria-label="Previous track"]',
      '[aria-label="Предыдущий"]',
      '[aria-label="Попередній"]',
    ]);

    if (!clicked && el && isFinite(el.duration)) {
      el.currentTime = Math.max(0, el.currentTime - 10);
    }
  }
});