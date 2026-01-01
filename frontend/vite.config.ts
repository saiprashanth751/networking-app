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
  }
})