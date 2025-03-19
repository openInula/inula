import { defineConfig } from 'vite';
import { InulaBridge } from './src/plugins/vite';
import path from 'path';

export default defineConfig({
  build: {
    minify: false, // 设置为 false 可以关闭代码压缩
    outDir: 'build',
  },
  server: {
    port: 4320,
  },
  base: '',
  plugins: [InulaBridge()],
  resolve: {
    alias: {
      '@openinula/bridge': path.resolve(__dirname, 'dist/index.js'),
    },
  },
});
