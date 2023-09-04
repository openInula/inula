import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve'; // 解析第三方模块，并将它们包含在最终的打包文件中
import commonjs from 'rollup-plugin-commonjs'; // 将 CommonJS 模块转换为 ES6 模块

export default {
  input: './src/inulaRequest.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'umd',
    name: 'inulaRequest',
  },
  plugins: [
    typescript({
      tsconfig: 'tsconfig.json',
      include: ['src/**/*.ts'],
    }),
    resolve(),
    commonjs(),
  ],
};
