const api = typeof browser !== 'undefined' ? browser : chrome;

console.log('[MonoUI] content.js РАБОТАЕТ на', window.location.hostname);

function saveMedia() {
  const ms = navigator.mediaSession;
  const meta = ms?.metadata;
  
  console.log('[MonoUI] playbackState:', ms?.playbackState, '| title:', meta?.title);

  if (!meta?.title) return;

  api.storage.local.set({
    monoui_media: {
      title: meta.title,
      artist: meta.artist || '',
      artwork: meta.artwork?.length ? meta.artwork[meta.artwork.length - 1].src : '',
      playing: ms.playbackState !== 'paused',
      ts: Date.now()
    }
  });
}

setInterval(saveMedia, 1500);

api.runtime.onMessage.addListener((msg) => {
  const video = document.querySelector('video');
  if (!video) return;
  if (msg.type === 'MEDIA_PLAY')  video.play().catch(() => {});
  if (msg.type === 'MEDIA_PAUSE') video.pause();
});