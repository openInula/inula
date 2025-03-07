/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve'; // 解析第三方模块，并将它们包含在最终的打包文件中
import commonjs from 'rollup-plugin-commonjs'; // 将 CommonJS 模块转换为 ES6 模块
import { terser } from 'rollup-plugin-terser';
import { babel } from '@rollup/plugin-babel';

const outputConfigs = {
  esm: {
    file: 'dist/inulaRequest.esm-browser.js',
    format: 'esm',
  },
  umd: {
    file: 'dist/inulaRequest.js',
    format: 'umd',
    exports: 'named',
    name: 'inulaRequest',
    sourcemap: false,
  },
};

/**
 * @param {'esm'|'umd'} type
 * @return import('rollup').RollupOptions
 **/
const genConfig = type => {
  const babelConfig = ['@babel/preset-env'];
  if (type === 'umd') {
    babelConfig.push({
      useBuiltIns: 'usage',
      targets: {
        edge: '17',
        firefox: '60',
        chrome: '60',
        safari: '11.1',
      },
      corejs: 3,
    });
  }

  return {
    input: './index.ts',
    output: outputConfigs[type],
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
        presets: [babelConfig],
      }),
    ],
    external: ['openinula'],
  };
};

export default [genConfig('esm'), genConfig('umd')];
