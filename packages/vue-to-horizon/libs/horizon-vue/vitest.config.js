// vitest.config.js
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node', // 指定 Node 环境
    include: ['test/**/*.test.js'],

    // 禁用自动包含源码，手动通过 imports 访问
    includeSource: ['src/**/*.js'],
    // 开启全局变量
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js']
    },
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './test')
    }
  }
});
