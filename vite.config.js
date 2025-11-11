import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3011,
    proxy: {
      "/api": {
        target: "https://webview-server.test-avtomaktab.uz",
        changeOrigin: true,
      },
      "/images": {
        target: "https://webview-server.test-avtomaktab.uz",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Service Worker'ni alohida chunk sifatida build qilish
        manualChunks: undefined
      }
    }
  },
  // Service Worker'ni copy qilish
  publicDir: 'public'
});
