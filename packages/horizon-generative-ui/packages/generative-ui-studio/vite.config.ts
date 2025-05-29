import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  css: {
    postcss: './postcss.config.js', // 显式指定 PostCSS 配置文件路径（通常不需要，Vite 会自动查找）
  },
  resolve: {
    alias: [
      {
        // 第一个别名对象的正确格式
        find: 'react',
        replacement: path.resolve(__dirname, './node_modules/react')
      },
      {
        find: 'react-dom',
        replacement: path.resolve(__dirname, './node_modules/react-dom')
      },
      {
        find: '@',
        replacement: path.resolve(__dirname, './src')
      },{
        find:'~@hui',
        replacement: path.resolve(__dirname, 'node_modules/@hui')
      }
      
    ]
  },
  // 清除 Vite 的优化依赖缓存，强制重新处理
  optimizeDeps: {
    include: ['@cloudsop/eview-ui'],
    esbuildOptions: {
      plugins: [
        {
          name: 'replace-react-with-horizon',
          setup(build) {
            build.onResolve({ filter: /^react$/ }, (args) => {
              // 只对来自 eview-ui 的 react 请求进行重定向
              if (args.importer && args.importer.includes('@cloudsop\\eview-ui')) {
                return {
                  path: path.resolve(__dirname, './node_modules/@cloudsop/horizon/index.js'),
                };
              }
              return null;
            });
            build.onResolve({ filter: /^react-dom$/ }, (args) => {
              // 只对来自 eview-ui 的 react 请求进行重定向
              if (args.importer && args.importer.includes('@cloudsop\\eview-ui')) {
                return {
                  path: path.resolve(__dirname, './node_modules/@cloudsop/horizon/index.js'),
                };
              }
              return null;
            });
          }
        }
      ]
    }
  },
})
