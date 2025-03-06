import { defineConfig } from 'vite';
import inula from '@openinula/unplugin/vite';

export default defineConfig({
  optimizeDeps: {
    disabled: true,
  },
  plugins: [inula({ files: '**/*.{ts,js,tsx,jsx}' })],
});
