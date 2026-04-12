import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: 'all',
    hmr: {
      clientPort: 3000,
    },
    watch: {
      usePolling: true,
    },
    // Only use proxy in development mode when API_URL is not set
    ...(process.env.NODE_ENV !== 'production' && !process.env.VITE_API_URL && {
      proxy: {
        '/api/v1': {
          target: 'http://backend:8000',
          changeOrigin: true,
          secure: false,
          followRedirects: true,
          // Don't rewrite - backend expects /api/v1 prefix
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // FastAPI handles trailing slashes automatically with redirects
              // Don't modify URLs - let FastAPI handle them
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
        '/uploads': {
          target: 'http://backend:8000',
          changeOrigin: true,
          secure: false,
        },
        '/certificate-files': {
          target: 'http://backend:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    }),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/api': path.resolve(__dirname, './src/api'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/styles': path.resolve(__dirname, './src/styles'),
    },
  },
  define: {
    'process.env': process.env,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react', 'lucide-react'],
          query: ['@tanstack/react-query'],
          form: ['react-hook-form', '@hookform/resolvers', 'zod'],
          motion: ['framer-motion'],
        },
        // Add aggressive cache-busting to filenames
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/index-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand',
      'axios'
    ],
  },
})