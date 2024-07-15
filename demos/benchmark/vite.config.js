import { defineConfig } from 'vite';
import inula from '@openinula/vite-plugin-inula-next';

export default defineConfig({
  server: {
    port: 4320,
  },
  base: '',
  optimizeDeps: {
    disabled: true,
  },
  plugins: [inula({ files: '**/*.{tsx,jsx}' })],
});
