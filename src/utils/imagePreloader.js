/**
 * Image Preloader Utility
 * Barcha rasmlarni oldindan yuklab, browser cache'da saqlaydi
 */

import imageCompressor, { COMPRESSION_PRESETS } from './imageCompressor.js';

class ImagePreloader {
  constructor() {
    this.loadedImages = new Map();
    this.loadingPromises = new Map();
    this.cacheAvailable = 'caches' in window;
    this.compressionEnabled = true; // Compression yoqilgan
    this.compressionOptions = COMPRESSION_PRESETS.BALANCED; // Default preset
  }

  /**
   * Compression yoqish/o'chirish
   */
  setCompression(enabled, preset = 'BALANCED') {
    this.compressionEnabled = enabled;
    if (preset && COMPRESSION_PRESETS[preset]) {
      this.compressionOptions = COMPRESSION_PRESETS[preset];
    }
  }

  /**
   * Cache'da rasmni tekshirish
   */
  async checkCache(url) {
    if (!this.cacheAvailable) return null;

    try {
      const cache = await caches.open('avto-test-images');
      const response = await cache.match(url);
      return response;
    } catch (error) {
      return null;
    }
  }

  /**
   * Rasmni cache'ga qo'shish (compression bilan yoki without)
   */
  async addToCache(url, img) {
    if (!this.cacheAvailable) return;

    try {
      const cache = await caches.open('avto-test-images');

      // Agar compression yoqilgan bo'lsa, rasmni compress qilish
      if (this.compressionEnabled) {
        try {
          const compressedBlob = await imageCompressor.compressImage(img, this.compressionOptions);

          // Compressed response yaratish (fetch qilmasdan)
          const compressedResponse = new Response(compressedBlob, {
            headers: {
              'Content-Type': this.compressionOptions.mimeType || 'image/jpeg',
              'Content-Length': compressedBlob.size
            }
          });

          await cache.put(url, compressedResponse);
          console.log(`📦 Compressed & cached: ${url.split('/').pop()}`);
        } catch (compressionError) {
          console.warn('Compression failed, skipping cache:', compressionError);
          // Xato bo'lsa cache qilmaslik (rasm allaqachon yuklangan)
        }
      }
      // Compression o'chirilgan bo'lsa, cache qilmaslik (browser'ning o'z cache'i ishlatiladi)
      // Bu juda tezroq!
    } catch (error) {
      console.warn('Failed to add to cache:', url);
    }
  }

  /**
   * Bitta rasmni yuklash
   * @param {string} url - Rasm URL manzili
   * @returns {Promise<string>} - Yuklangan rasm URL
   */
  async preloadImage(url) {
    if (!url) {
      return Promise.resolve(null);
    }

    // Agar rasm allaqachon yuklangan bo'lsa
    if (this.loadedImages.has(url)) {
      return Promise.resolve(url);
    }

    // Cache'da bor-yo'qligini tekshirish
    const cachedResponse = await this.checkCache(url);
    if (cachedResponse) {
      this.loadedImages.set(url, true);
      return Promise.resolve(url);
    }

    // Agar rasm hozir yuklanayotgan bo'lsa, shu promise'ni qaytarish
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url);
    }

    // Yangi yuklanish boshlash
    const promise = new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = async () => {
        this.loadedImages.set(url, img);
        this.loadingPromises.delete(url);

        // Cache'ga qo'shish (img objectini ham yuborish compression uchun)
        await this.addToCache(url, img);

        console.log(`✅ Rasm yuklandi va cache'ga qo'shildi: ${url}`);
        resolve(url);
      };

      img.onerror = () => {
        this.loadingPromises.delete(url);
        console.warn(`⚠️ Rasm yuklanmadi: ${url}`);
        // Xato bo'lsa ham reject qilmaslik, faqat null qaytarish
        resolve(null);
      };

      // Rasmni yuklash
      img.src = url;
    });

    this.loadingPromises.set(url, promise);
    return promise;
  }

  /**
   * Bir nechta rasmlarni parallel yuklash
   * @param {string[]} urls - Rasm URL'lar ro'yxati
   * @param {function} onProgress - Progress callback (optional)
   * @returns {Promise<Object>} - {total, loaded, failed}
   */
  async preloadImages(urls, onProgress) {
    const validUrls = urls.filter(url => url);
    const total = validUrls.length;
    let loaded = 0;
    let failed = 0;

    console.log(`🚀 ${total} ta rasmni yuklash boshlandi...`);

    // Batch yuklash - bir vaqtning o'zida 30 ta rasm (parallel)
    const batchSize = 30;
    const results = [];

    for (let i = 0; i < validUrls.length; i += batchSize) {
      const batch = validUrls.slice(i, i + batchSize);

      const batchResults = await Promise.allSettled(
        batch.map(url => this.preloadImage(url))
      );

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          loaded++;
        } else {
          failed++;
        }

        // Progress callback'ni chaqirish
        if (onProgress) {
          onProgress({
            total,
            loaded: loaded + failed,
            loadedSuccessfully: loaded,
            failed,
            percentage: Math.round(((loaded + failed) / total) * 100)
          });
        }
      });

      results.push(...batchResults);
    }

    console.log(`✅ Yuklash tugadi: ${loaded} ta muvaffaqiyatli, ${failed} ta xato`);

    return {
      total,
      loaded,
      failed,
      urls: validUrls,
      results
    };
  }

  /**
   * Rasmning yuklangan yoki yuklanmagan ekanligini tekshirish
   * @param {string} url - Rasm URL
   * @returns {boolean}
   */
  isLoaded(url) {
    return this.loadedImages.has(url);
  }

  /**
   * Cache'ni tozalash
   */
  async clear() {
    this.loadedImages.clear();
    this.loadingPromises.clear();

    // Browser cache'ni ham tozalash
    if (this.cacheAvailable) {
      try {
        await caches.delete('avto-test-images');
        console.log('🗑️ Image cache tozalandi (memory + browser cache)');
      } catch (error) {
        console.log('🗑️ Image cache tozalandi (faqat memory)');
      }
    } else {
      console.log('🗑️ Image cache tozalandi');
    }
  }

  /**
   * Cache statistikasini olish
   */
  getStats() {
    return {
      cached: this.loadedImages.size,
      loading: this.loadingPromises.size
    };
  }
}

// Singleton instance
const imagePreloader = new ImagePreloader();

export default imagePreloader;
