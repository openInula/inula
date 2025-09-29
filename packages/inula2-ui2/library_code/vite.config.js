import { defineConfig } from 'vite';
import inula from '@openinula/unplugin/vite';

export default defineConfig({
  plugins: [inula({ files: '**/*.{ts,js,tsx,jsx}' })],
  esbuild: {
    jsxFactory: 'Inula.createElement',
    jsxFragment: 'Inula.Fragment',
    jsxInject: `import * as Inula from '@openinula/next'`,
  },
  build: {
    lib: {
      entry: 'src/notification.js',
      name: 'InulaUI',
      fileName: (format) => `notification.${format}.js`,
      formats: ['es','cjs'],
    },
    rollupOptions: {
      external: ['@openinula/next'],
    },
  },
  server: {
    headers: {
      'X-Frame-Options': 'ALLOWALL',
      'Content-Security-Policy': 'frame-ancestors *'
    }
  }
});