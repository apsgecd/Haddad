const CACHE_NAME = "haddad-player-cache-v2";

const ASSETS_TO_CACHE = [
  "./",                        // Root context
  "./manifest.json",           // Manifest
  "./index.html",              // Main page
  
  // App Icons
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

// Install event: pre-cache all critical resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Pre-caching offline assets");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event: clean up legacy caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log("[ServiceWorker] Removing old cache:", key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// Fetch event: Cache-First strategy with range-request fallback for audio & PDFs
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Fallback to network fetch if not in cache
      return fetch(event.request).then((response) => {
        // Only cache valid basic responses
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      });
    }).catch(() => {
      // Offline fallback handling
      return caches.match("./index.html");
    })
  );
});
