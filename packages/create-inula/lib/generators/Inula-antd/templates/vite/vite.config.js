import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { viteMockServe } from 'vite-plugin-mock';
// import requireTransform from 'vite-plugin-require-transform';

let alias = {
  '@': path.resolve('src/admin'),
  api: path.resolve('src/admin/services/'),
  components: path.resolve('src/admin/components'),
  config: path.resolve('src/admin/utils/config'),
  themes: path.resolve('src/admin/themes'),
  utils: path.resolve('src/admin/utils'),
  react: '@cloudsop/horizon', // 新增
  'react-dom': '@cloudsop/horizon', // 新增
  'react/jsx-dev-runtime': '@cloudsop/horizon/jsx-dev-runtime',
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            "@babel/plugin-transform-react-jsx", 
            { 
              "runtime": "automatic", // 新增 
              "importSource": "@cloudsop/horizon" // 新增
            } 
          ],
          '@babel/plugin-proposal-class-properties',
          '@babel/plugin-syntax-dynamic-import',
          '@babel/plugin-proposal-export-default-from',
        ],
      },
    }),
    viteMockServe({
      mockPath: './mock',
    }),
  ],
  define: {
    global: 'window',
  },
  resolve: {
    alias,
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.ts': 'tsx',
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
});
