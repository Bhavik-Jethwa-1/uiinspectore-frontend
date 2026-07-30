import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5176,
    host: '0.0.0.0',
    hmr: {
      host: 'uiinspectore.167.233.101.27.nip.io',
      protocol: 'ws',
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8008',
        changeOrigin: true,
        secure: false,
      },
      '/gateway': {
        target: 'http://127.0.0.1:18789',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching
        manualChunks: (id) => {
          if (id.includes('node_modules/react')) return 'vendor-react';
          if (id.includes('node_modules/lucide')) return 'vendor-lucide';
          if (id.includes('node_modules/framer-motion')) return 'vendor-framer';
          if (id.includes('node_modules/highlight')) return 'vendor-highlight';
          if (id.includes('node_modules/proxy')) return 'vendor-proxy';
        },
      },
    },
  },
})
