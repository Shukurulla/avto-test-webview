/**
 * Image Compression Utility
 * Rasmlarni kichraytirish va optimize qilish
 */

class ImageCompressor {
  constructor() {
    this.defaultOptions = {
      maxWidth: 800,          // Maksimal kenglik
      maxHeight: 600,         // Maksimal balandlik
      quality: 0.8,           // JPEG sifati (0.1 - 1.0)
      mimeType: 'image/jpeg', // Output format
    };
  }

  /**
   * Rasmni kichraytirish
   * @param {string} url - Rasm URL
   * @param {Object} options - Compression options
   * @returns {Promise<Blob>} - Compressed image blob
   */
  async compressFromUrl(url, options = {}) {
    const opts = { ...this.defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // CORS uchun

      img.onload = () => {
        try {
          const compressed = this.compressImage(img, opts);
          resolve(compressed);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  /**
   * Image elementni compress qilish
   * @param {HTMLImageElement} img - Image element
   * @param {Object} options - Compression options
   * @returns {Blob} - Compressed image blob
   */
  compressImage(img, options) {
    const { maxWidth, maxHeight, quality, mimeType } = options;

    // Yangi o'lchamlarni hisoblash (aspect ratio saqlab)
    let { width, height } = img;

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    // Canvas yaratish
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    // Anti-aliasing va smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Rasmni canvas'ga chizish
    ctx.drawImage(img, 0, 0, width, height);

    // Canvas'ni Blob'ga aylantirish
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        mimeType,
        quality
      );
    });
  }

  /**
   * Blob'ni data URL'ga aylantirish
   * @param {Blob} blob - Image blob
   * @returns {Promise<string>} - Data URL
   */
  async blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Rasmni to'liq compress qilib data URL qaytarish
   * @param {string} url - Rasm URL
   * @param {Object} options - Compression options
   * @returns {Promise<string>} - Compressed data URL
   */
  async compressToDataUrl(url, options = {}) {
    const blob = await this.compressFromUrl(url, options);
    return this.blobToDataUrl(blob);
  }

  /**
   * Rasmni optimize qilish va Object URL yaratish
   * @param {string} url - Original URL
   * @param {Object} options - Compression options
   * @returns {Promise<string>} - Object URL
   */
  async compressToObjectUrl(url, options = {}) {
    const blob = await this.compressFromUrl(url, options);
    return URL.createObjectURL(blob);
  }

  /**
   * Rasm hajmini hisoblash
   * @param {Blob} blob - Image blob
   * @returns {Object} - Size info (bytes, KB, MB)
   */
  getSize(blob) {
    const bytes = blob.size;
    const kb = (bytes / 1024).toFixed(2);
    const mb = (bytes / 1024 / 1024).toFixed(2);

    return {
      bytes,
      kb: `${kb} KB`,
      mb: `${mb} MB`,
      readable: bytes < 1024 * 1024 ? `${kb} KB` : `${mb} MB`
    };
  }

  /**
   * Ikkita rasm hajmini solishtirish
   * @param {number} originalSize - Original size (bytes)
   * @param {number} compressedSize - Compressed size (bytes)
   * @returns {Object} - Comparison info
   */
  compareSize(originalSize, compressedSize) {
    const reduction = originalSize - compressedSize;
    const reductionPercent = ((reduction / originalSize) * 100).toFixed(1);
    const ratio = (compressedSize / originalSize).toFixed(2);

    return {
      originalSize: this.getSize({ size: originalSize }),
      compressedSize: this.getSize({ size: compressedSize }),
      reduction: this.getSize({ size: reduction }),
      reductionPercent: `${reductionPercent}%`,
      compressionRatio: ratio
    };
  }
}

// Singleton instance
const imageCompressor = new ImageCompressor();

export default imageCompressor;

// Preset configurations
export const COMPRESSION_PRESETS = {
  // Eng yuqori sifat, kichik hajm kamaytirish
  HIGH_QUALITY: {
    maxWidth: 1200,
    maxHeight: 900,
    quality: 0.9,
  },

  // Balansli - yaxshi sifat va o'rtacha hajm
  BALANCED: {
    maxWidth: 800,
    maxHeight: 600,
    quality: 0.8,
  },

  // Kichik hajm, past sifat
  LOW_SIZE: {
    maxWidth: 600,
    maxHeight: 450,
    quality: 0.6,
  },

  // Juda kichik hajm (thumbnail)
  THUMBNAIL: {
    maxWidth: 300,
    maxHeight: 225,
    quality: 0.5,
  }
};
