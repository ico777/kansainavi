const CACHE_NAME = 'kansainavi-v3';
const STATIC_ASSETS = ['/manifest.json', '/icon-192.png', '/icon-512.png'];

// インストール時：静的アセットのみキャッシュ
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// メインスレッドからのメッセージ処理
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// フェッチ戦略：
// HTMLファイル → ネットワーク優先（常に最新版を取得）
// その他      → キャッシュ優先（オフライン対応）
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // HTMLはネットワーク優先
  if (e.request.mode === 'navigate' ||
      url.pathname === '/' ||
      url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // 静的アセットはキャッシュ優先
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
