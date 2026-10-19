const CACHE_NAME = "haddad-player-cache-v3";

const ASSETS_TO_CACHE = [
  "./",                        // Root path
  "./index.html",              // HTML Page
  "./manifest.json",           // App Manifest

  // Icons
  "./icon192.png",
  "./icon512.png",

  // Audio Files
  "./haddad.mp3",
  "./names.mp3",
  "./yaseen.mp3",
  "./kahf.mp3",
  "./click.mp3",
  "./longclick.mp3",

  // Text Files
  "./yaseen.txt",
  "./kahf.txt",
  "./99names.txt",
  "./haddad.txt",
  "./salam-rasool.txt",

  // PDF Files
  "./pdf/Asmaul-Badar.pdf",
  "./pdf/Dua.pdf",
  "./pdf/Khatahm-Quran-Dua.pdf",
  "./pdf/Manqoos-Mouleed.pdf",
  "./pdf/Mayyith-Prayer.pdf"
];

// Install Event: Pre-cache all core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Pre-caching offline assets");
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clear outdated cache stores
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log("[ServiceWorker] Removing stale cache:", key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch Event: Cache-First + Safe Handling of 206 Partial Content (Range Requests)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      // 1. Return cached match immediately if available offline
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2. Safely handle Range Requests (for audio/PDF streaming)
      let fetchRequest = event.request;
      if (event.request.headers.has('range')) {
        const cleanHeaders = new Headers(event.request.headers);
        cleanHeaders.delete('range');
        fetchRequest = new Request(event.request, { headers: cleanHeaders });
      }

      // 3. Network Fetch with Clean Response Caching
      return fetch(fetchRequest).then((networkResponse) => {
        // Prevent caching invalid or partial responses
        if (
          !networkResponse || 
          networkResponse.status !== 200 || 
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }

        // Cache full HTTP 200 response
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    }).catch(() => {
      // Offline fallback
      return caches.match("./index.html");
    })
  );
});
