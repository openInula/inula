import { defineConfig } from 'vite';
import inula from '@openinula/vite-plugin-inula-next';

export default defineConfig({
  optimizeDeps: {
    disabled: true,
  },
  plugins: [inula({ files: '**/*.{ts,js,tsx,jsx}' })],
});
