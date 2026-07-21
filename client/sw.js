// sw.js
const CACHE_NAME = "sugoroku-cache-v1";

const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./main.js",
  "./mapRenderer.js",
  "./playerRenderer.js",
  "./statusUI.js",
  "./characterSelect.js",
  "./animations.js",
  "./utils.js",
  "./assets/ui/icon-192.png",
  "./assets/ui/icon-512.png"
];

// インストール時：必要ファイルをキャッシュ
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// 有効化時：古いキャッシュを削除
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
});

// 通信時：キャッシュ優先で返す
self.addEventListener("fetch", event => {
  const request = event.request;

  // WebSocket はキャッシュしない
  if (request.url.startsWith("ws://") || request.url.startsWith("wss://")) {
    return;
  }

  event.respondWith(
    caches.match(request).then(response => {
      return (
        response ||
        fetch(request).catch(() => {
          // オフライン時に何か返したければここで
          return response;
        })
      );
    })
  );
});
