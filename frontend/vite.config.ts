import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Polyfill ALL necessary Node.js modules for SimplePeer
      include: [
        'events',
        'util',
        'buffer',
        'stream',
        'crypto',
        'process'
      ],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  optimizeDeps: {
    // Force include simple-peer and its dependencies
    include: [
      'simple-peer',
      'eventemitter3',
      '@xstate/react',
      'xstate',
      'rxjs',
      'randombytes',
      'readable-stream'
    ],
    exclude: []
  },
  define: {
    // Define global for browser environment
    global: 'globalThis',
    'process.env': {}
  },
  server: {
    host: true,
    port: 5173
  },
  // 🔥 BUILD OPTIMIZATIONS
  build: {
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // React Query
          'query-vendor': ['@tanstack/react-query'],
          // Socket.io
          'socket-vendor': ['socket.io-client'],
          // UI libraries
          'ui-vendor': ['lucide-react', 'date-fns', 'react-toastify'],
          // Virtualization
          'virtuoso-vendor': ['react-virtuoso'],
          // WebRTC (lazy loaded, but separate chunk when needed)
          'webrtc-vendor': ['simple-peer', 'xstate', '@xstate/react'],
        },
      },
    },
    // Minification and tree-shaking
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 500, // Warn for chunks > 500KB
    // Source maps for debugging (disable in production for smaller size)
    sourcemap: false,
  },
})