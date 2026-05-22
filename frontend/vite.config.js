import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        timeout: 300000,
        proxyTimeout: 300000,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            if (res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'API temporarily unavailable', degraded: true }));
            }
            console.warn('[vite] api proxy:', err.message);
          });
        },
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    watch: {
      usePolling: true,
    },
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf';
            if (id.includes('docx')) return 'vendor-docx';
            if (
              id.includes('react-dom') ||
              id.includes('react-router') ||
              (id.includes('/react/') && !id.includes('react-dom'))
            ) {
              return 'vendor-react';
            }
          }
          if (id.includes('/src/pages/admin/')) return 'admin';
        },
      },
    },
  },
})
