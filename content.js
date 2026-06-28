const api = typeof browser !== 'undefined' ? browser : chrome;

function saveMedia() {
  const ms = navigator.mediaSession;
  const meta = ms?.metadata;
  const video = document.querySelector('video');
  if (!meta?.title) return;

  api.storage.local.set({
    monoui_media: {
      title: meta.title,
      artist: meta.artist || '',
      artwork: meta.artwork?.length ? meta.artwork[meta.artwork.length - 1].src : '',
      playing: video ? !video.paused : ms.playbackState === 'playing',
      ts: Date.now()
    }
  });
}

setInterval(saveMedia, 1000);

api.runtime.onMessage.addListener((msg) => {
  const video = document.querySelector('video');

  if (msg.type === 'MEDIA_PLAY') {
    video?.play().catch(() => {});
  }

  if (msg.type === 'MEDIA_PAUSE') {
    video?.pause();
  }

  if (msg.type === 'MEDIA_NEXT') {
    try { navigator.mediaSession.callActionHandler('nexttrack'); } catch(e) {}
    document.querySelector(
      '.ytp-next-button, [aria-label="Next"], [aria-label="Следующий"], [aria-label="Наступний"], [data-testid="control-button-skip-forward"]'
    )?.click();
  }

  if (msg.type === 'MEDIA_PREV') {
    try { navigator.mediaSession.callActionHandler('previoustrack'); } catch(e) {}
    document.querySelector(
      '[aria-label="Previous"], [aria-label="Предыдущий"], [aria-label="Попередній"], [data-testid="control-button-skip-back"]'
    )?.click();
  }
});