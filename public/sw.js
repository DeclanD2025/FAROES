// Faroe Islands Trip Planner — Service Worker
// Cache-first strategy for offline access in the Faroes

const CACHE_NAME = "faroe-trip-v1";

// All routes plus key assets to precache
const PRECACHE_URLS = [
  "/",
  "/itinerary",
  "/places",
  "/match-day",
  "/packing",
  "/info",
  "/faroe-icon.svg",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Some pages may be dynamic — that's OK
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Skip API routes and non-GET requests
  if (
    event.request.method !== "GET" ||
    event.request.url.includes("/api/")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Return cached response immediately if available
      if (cached) {
        // Stale-while-revalidate: update cache in background
        fetch(event.request)
          .then((response) => {
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, response);
              });
            }
          })
          .catch(() => {});
        return cached;
      }

      // Not cached — fetch from network and cache
      return fetch(event.request)
        .then((response) => {
          if (!response.ok) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => {
          // Offline fallback for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
          return new Response("Offline", { status: 503 });
        });
    })
  );
});
