import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@copilotkit/copilot-client': fileURLToPath(new URL('../../CopilotKit/packages/copilot-client/src', import.meta.url)),
      '@copilotkit/playwright-actuator': fileURLToPath(new URL('../../CopilotKit/packages/playwright-actuator/src', import.meta.url)),
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
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
}) 