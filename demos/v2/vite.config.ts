import { defineConfig } from 'vite';
import inula from 'vite-plugin-inula-next';

export default defineConfig({
  server: {
    port: 4320,
  },
  base: '',
  optimizeDeps: {
    disabled: true,
  },
  plugins: [inula({ files: '**/*.{view,model}.{ts,js,tsx,jsx}', enableDevTools: true })],
});
