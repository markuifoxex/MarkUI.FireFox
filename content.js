const api = typeof browser !== 'undefined' ? browser : chrome;

function saveMedia() {
  const meta = navigator.mediaSession?.metadata;
  if (!meta || !meta.title) return;

  api.storage.local.set({
    monoui_media: {
      title: meta.title,
      artist: meta.artist || '',
      artwork: meta.artwork?.length ? meta.artwork[meta.artwork.length - 1].src : '',
      playing: navigator.mediaSession.playbackState === 'playing',
      ts: Date.now()
    }
  });
}

setInterval(saveMedia, 1000);

api.runtime.onMessage.addListener((msg) => {
  const video = document.querySelector('video, audio');
  if (!video) return;
  if (msg.type === 'MEDIA_PLAY')  video.play().catch(() => {});
  if (msg.type === 'MEDIA_PAUSE') video.pause();
  if (msg.type === 'MEDIA_NEXT') {
    document.querySelector('.ytp-next-button, [aria-label="Next"], [aria-label="Следующий"]')?.click();
  }
  if (msg.type === 'MEDIA_PREV') {
    document.querySelector('[aria-label="Previous"], [aria-label="Предыдущий"]')?.click();
  }
});