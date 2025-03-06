import { defineConfig } from 'vite';
import inula from '@openinula/unplugin/vite';

export default defineConfig({
  build: {
    minify: false, // 设置为 false 可以关闭代码压缩
  },
  server: {
    port: 4320,
  },
  base: '',
  optimizeDeps: {
    disabled: true,
  },
  plugins: [inula({ files: '**/*.{ts,js,tsx,jsx}' })],
});
