const CACHE_NAME = "haddad-player-cache-v1";

const ASSETS_TO_CACHE = [
  "./",                        // root context
  "./manifest.json",           // manifest
  "./index.html",              // main page
  "./haddad.mp3",              
  "./names.mp3",               // Added new tracks
  "./yaseen.mp3",              
  "./kahf.mp3",                
  "./click.mp3",  
  "./longclick.mp3",           // Added long haptic audio fallback
  "./icon192.png",
  "./icon512.png",
  "./file1.txt",               // Added documentation files
  "./file2.txt",
  "./file3.txt"
];

// Install event: cache everything
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event: remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch event: network first, fallback to cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Guard against caching invalid network responses or third-party scopes
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        // Save fresh copy to cache
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
