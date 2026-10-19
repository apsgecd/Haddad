const CACHE_NAME = "adhkar-player-cache-v1";

const ASSETS_TO_CACHE = [
  "./",                        
  "./index.html",              
  "./manifest.json",           

  // Icons
  "./icon192.png",
  "./icon512.png",

  // Audio Files
  "./adhkar.mp3",
  "./names.mp3",
  "./yaseen.mp3",
  "./kahf.mp3",
  "./click.mp3",
  "./longclick.mp3",

  // Text Files
  "./yaseen.txt",
  "./kahf.txt",
  "./99names.txt",
  "./adhkar.txt",
  "./salam-rasool.txt",

  // PDF Files
  "./pdf/Asmaul-Badar.pdf",
  "./pdf/Dua.pdf",
  "./pdf/Khatahm-Quran-Dua.pdf",
  "./pdf/Manqoos-Mouleed.pdf",
  "./pdf/Mayyith-Prayer.pdf"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Pre-caching offline assets");
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

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

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      let fetchRequest = event.request;
      if (event.request.headers.has('range')) {
        const cleanHeaders = new Headers(event.request.headers);
        cleanHeaders.delete('range');
        fetchRequest = new Request(event.request, { headers: cleanHeaders });
      }

      return fetch(fetchRequest).then((networkResponse) => {
        if (
          !networkResponse || 
          networkResponse.status !== 200 || 
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    }).catch(() => {
      return caches.match("./index.html");
    })
  );
});
