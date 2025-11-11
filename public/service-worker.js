// Service Worker for caching images
const CACHE_NAME = 'avto-test-images-v1';
const IMAGE_CACHE_NAME = 'avto-test-images';

// Install event - cache'larni yaratish
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting(); // Yangi SW ni darhol faollashtirish
});

// Activate event - eski cache'larni tozalash
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Eski cache'larni o'chirish
          if (cacheName !== IMAGE_CACHE_NAME && cacheName.startsWith('avto-test-')) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - rasmlarni cache'dan yoki network'dan yuklash
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Faqat rasmlarni cache qilish
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname);

  if (isImage) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            // Cache'da mavjud - darhol qaytarish
            console.log('Service Worker: Serving from cache:', url.pathname);
            return cachedResponse;
          }

          // Cache'da yo'q - network'dan yuklash va cache'ga qo'shish
          console.log('Service Worker: Fetching from network:', url.pathname);
          return fetch(event.request).then((networkResponse) => {
            // Faqat muvaffaqiyatli response'larni cache qilish
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch((error) => {
            console.error('Service Worker: Fetch failed:', error);
            // Fallback image yoki error handling
            return new Response('Image fetch failed', {
              status: 404,
              statusText: 'Image not found'
            });
          });
        });
      })
    );
  } else {
    // Rasmlardan tashqari requestlar uchun normal fetch
    event.respondWith(fetch(event.request));
  }
});

// Message event - cache'ni tozalash uchun
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(IMAGE_CACHE_NAME).then(() => {
        console.log('Service Worker: Image cache cleared');
        event.ports[0].postMessage({ success: true });
      })
    );
  }

  if (event.data && event.data.type === 'CACHE_IMAGES') {
    const urls = event.data.urls;
    event.waitUntil(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.addAll(urls).then(() => {
          console.log(`Service Worker: Cached ${urls.length} images`);
          event.ports[0].postMessage({ success: true, count: urls.length });
        }).catch((error) => {
          console.error('Service Worker: Failed to cache images:', error);
          event.ports[0].postMessage({ success: false, error: error.message });
        });
      })
    );
  }
});
