import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@copilotkit/copilot-client': fileURLToPath(new URL('../../copilot-client/src', import.meta.url)),
      '@copilotkit/shared': fileURLToPath(new URL('../../shared/src', import.meta.url)),
      '@copilotkit/playwright-actuator': fileURLToPath(new URL('../../playwright-actuator/src', import.meta.url)),
      // 具体路径映射需要在通用映射之前
      'react/jsx-runtime': fileURLToPath(new URL('./node_modules/openinula/jsx-runtime.js', import.meta.url)),
      'react/jsx-dev-runtime': fileURLToPath(new URL('./node_modules/openinula/jsx-dev-runtime.js', import.meta.url)),
      'openinula/jsx-runtime': fileURLToPath(new URL('./node_modules/openinula/jsx-runtime.js', import.meta.url)),
      'openinula/jsx-dev-runtime': fileURLToPath(new URL('./node_modules/openinula/jsx-dev-runtime.js', import.meta.url)),
      // 通用映射
      'react': fileURLToPath(new URL('./node_modules/openinula/index.js', import.meta.url)),
      'react-dom': fileURLToPath(new URL('./node_modules/openinula/index.js', import.meta.url)), 
      'react-is': fileURLToPath(new URL('./node_modules/openinula/index.js', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8005',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        manualChunks: undefined
      }
    }
  },
  optimizeDeps: {
    include: ['openinula'],
  },
}) 