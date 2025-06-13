import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve'; // 解析第三方模块，并将它们包含在最终的打包文件中
import commonjs from 'rollup-plugin-commonjs'; // 将 CommonJS 模块转换为 ES6 模块
import { terser } from 'rollup-plugin-terser';
import { babel } from '@rollup/plugin-babel';

export default {
  input: './index.ts',
  output: {
    file: 'dist/inulaRequest.js',
    format: 'umd',
    exports: 'named',
    name: 'inulaRequest',
    sourcemap: false,
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: 'tsconfig.json',
      include: ['./**/*.ts'],
    }),
    terser(),
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-env']
    })
  ],
  external:[
    '@cloudsop/horizon'
  ]
};
