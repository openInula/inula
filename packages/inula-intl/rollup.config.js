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

import path from 'path';
import { fileURLToPath } from 'url';
import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const entry = path.join(__dirname, '/index.ts');

const output = path.join(__dirname, '/build');

const extensions = ['.js', '.ts', '.tsx'];

const BuildConfig = mode => {
  const prod = mode.startsWith('prod');
  const outputList = [
    {
      file: path.join(output, `cjs/intl.${prod ? 'min.' : ''}js`),
      sourcemap: 'true',
      format: 'cjs',
      globals: {
        openinula: 'Inula',
      },
    },
    {
      file: path.join(output, `umd/intl.${prod ? 'min.' : ''}js`),
      name: 'InulaI18n',
      sourcemap: 'true',
      format: 'umd',
      globals: {
        openinula: 'Inula',
      },
    },
  ];
  if (!prod) {
    outputList.push({
      file: path.join(output, 'esm/intl.js'),
      sourcemap: 'true',
      format: 'esm',
    });
  }
  return {
    input: entry,
    output: outputList,
    plugins: [
      nodeResolve({
        extensions,
        modulesOnly: true,
      }),
      babel({
        exclude: 'node_modules/**',
        configFile: path.join(__dirname, '/.babelrc'),
        extensions,
        babelHelpers: 'runtime',
      }),
      typescript({
        tsconfig: 'tsconfig.json',
        include: ['./**/*.ts', './**/*.tsx'],
      }),
      terser(),
    ],
    external: ['openinula', 'react', 'react-dom'],
  };
};
export default [BuildConfig('dev'), BuildConfig('prod')];
