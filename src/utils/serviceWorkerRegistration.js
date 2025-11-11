/**
 * Service Worker Registration
 * Rasmlarni browser cache'da saqlash uchun
 */

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        '/service-worker.js',
        { scope: '/' }
      );

      console.log('✅ Service Worker registered:', registration.scope);

      // Update topilsa, yangilash
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('🔄 Service Worker updating...');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('✅ New Service Worker installed, page refresh recommended');
          }
        });
      });

      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return null;
    }
  } else {
    console.warn('⚠️ Service Workers are not supported in this browser');
    return null;
  }
}

export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      console.log('✅ Service Worker unregistered');
    } catch (error) {
      console.error('❌ Service Worker unregistration failed:', error);
    }
  }
}

export async function clearImageCache() {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      const imageCaches = cacheNames.filter(name => name.includes('images'));

      for (const cacheName of imageCaches) {
        await caches.delete(cacheName);
      }

      console.log('✅ Image cache cleared');
    } catch (error) {
      console.error('❌ Failed to clear image cache:', error);
    }
  }
}

export async function cacheImages(imageUrls) {
  if ('caches' in window && imageUrls.length > 0) {
    try {
      const cache = await caches.open('avto-test-images');

      // Barcha rasmlarni cache'ga qo'shish
      await Promise.all(
        imageUrls.map(async (url) => {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
            }
          } catch (error) {
            console.warn(`⚠️ Failed to cache image: ${url}`, error);
          }
        })
      );

      console.log(`✅ Cached ${imageUrls.length} images`);
      return true;
    } catch (error) {
      console.error('❌ Failed to cache images:', error);
      return false;
    }
  }
  return false;
}

export async function isImageCached(url) {
  if ('caches' in window) {
    try {
      const cache = await caches.open('avto-test-images');
      const response = await cache.match(url);
      return !!response;
    } catch (error) {
      return false;
    }
  }
  return false;
}
