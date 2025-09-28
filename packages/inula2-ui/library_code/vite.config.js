import { defineConfig } from 'vite';
import inula from '@openinula/unplugin/vite';

export default defineConfig({
  optimizeDeps: {
    disabled: true,
  },
  plugins: [inula({ files: '**/*.{ts,js,tsx,jsx}' })],
  esbuild: {
    jsxFactory: 'Inula.createElement',
    jsxFragment: 'Inula.Fragment',
    jsxInject: `import * as Inula from '@openinula/next'`
  }
});
