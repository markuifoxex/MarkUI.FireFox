const api = typeof browser !== 'undefined' ? browser : chrome;

let lastMediaData = null;

api.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'MEDIA_UPDATE') {
    lastMediaData = msg.data;

    // Шлём в новую вкладку — игнорируем ошибку если она закрыта
    api.runtime.sendMessage({ type: 'MEDIA_STATE', data: lastMediaData })
      .catch(() => {});

    return false;
  }

  if (['MEDIA_PLAY','MEDIA_PAUSE','MEDIA_NEXT','MEDIA_PREV'].includes(msg.type)) {
    // Firefox: tabs.query возвращает Promise
    const queryPromise = api.tabs.query({});
    const promise = queryPromise.then ? queryPromise : Promise.resolve([]);

    promise.then(tabs => {
      tabs.forEach(tab => {
        if (!tab.url) return;
        const musicSite = [
          'youtube.com', 'spotify.com', 'music.apple.com',
          'soundcloud.com', 'deezer.com', 'tidal.com', 'twitch.tv',
          'pandora.com', 'amazon.com', 'music.amazon.com',
          'vk.com', 'zvuk.com', 'yandex.ru', 'music.yandex.ru'
        ].some(s => tab.url.includes(s));

        if (musicSite) {
          api.tabs.sendMessage(tab.id, { type: msg.type }).catch(() => {});
        }
      });
    }).catch(() => {});

    return false;
  }
});