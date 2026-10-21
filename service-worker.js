const CACHE_NAME = 'adhkar-v1';

// List all files you want to pre-cache
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // Audio files
  './haddad.mp3',
  './names.mp3',
  './yaseen.mp3',
  './kahf.mp3',
  './click.mp3',
  './longclick.mp3',
  // Text files
  './yaseen.txt',
  './kahf.txt',
  './99names.txt',
  './haddad.txt',
  './salam-rasool.txt',
  // PDF files
  './pdf/Asmaul-Badar.pdf',
  './pdf/Dua.pdf',
  './pdf/Khatham-Quran-Dua.pdf',
  './pdf/Manqoos-Mouleed.pdf',
  './pdf/Mayyith-Prayer.pdf'
];

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Starting pre-caching process...');

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Process each asset individually to catch and log errors separately
      const cachePromises = ASSETS_TO_CACHE.map(async (url) => {
        try {
          // Attempt to fetch first to log response status details
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error(`HTTP status ${response.status} (${response.statusText})`);
          }

          // Store response in cache
          await cache.put(url, response);
          console.log(`[ServiceWorker] ✅ Successfully cached: ${url}`);
        } catch (error) {
          // Detailed error logging for missing or failed files
          console.error(`[ServiceWorker] ❌ Failed to cache resource "${url}":`, error.message);
        }
      });

      // Wait for all caching attempts to finish
      await Promise.allSettled(cachePromises);
      console.log('[ServiceWorker] Pre-caching attempt complete.');
    })
  );
});
