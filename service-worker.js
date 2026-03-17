const CACHE_NAME = "haddad-player-cache-v1";

const ASSETS_TO_CACHE = [
  "/Haddad/",                // root
  "/Haddad/manifest.json",      // manifest
  "/Haddad/service-worker.js",// service worker itself
  "/Haddad/index.html",       // your main page
  "/Haddad/haddad.mp3",       
  "/Haddad/icon.png"
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




