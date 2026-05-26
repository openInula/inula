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
import fs from 'fs';
import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const rootDir = path.join(__dirname, '..');
const outDir = path.join(rootDir, 'build');

const extensions = ['.js', '.ts', '.tsx'];

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const getConfig = (mode, name) => {
  const prod = mode.startsWith('prod');
  const outputList = [
    {
      file: path.join(outDir, `${name}/cjs/${name}-adapter.${prod ? 'min.' : ''}js`),
      sourcemap: 'true',
      format: 'cjs',
    },
    {
      file: path.join(outDir, `${name}/umd/${name}-adapter.${prod ? 'min.' : ''}js`),
      name: 'VueAdapter',
      sourcemap: 'true',
      format: 'umd',
    },
  ];
  if (!prod) {
    outputList.push({
      file: path.join(outDir, `${name}/esm/${name}-adapter.js`),
      sourcemap: 'true',
      format: 'esm',
    });
  }
  return {
    input: path.join(rootDir, `/src/${name}/index.ts`),
    output: outputList,
    plugins: [
      nodeResolve({
        extensions,
        modulesOnly: true,
      }),
      babel({
        exclude: 'node_modules/**',
        configFile: path.join(rootDir, '/babel.config.js'),
        babelHelpers: 'runtime',
        extensions,
      }),
      prod && terser(),
      name === 'vue'
        ? copyFiles([
            {
              from: path.join(rootDir, 'package.json'),
              to: path.join(outDir, 'package.json'),
            },
            {
              from: path.join(rootDir, 'README.md'),
              to: path.join(outDir, 'README.md'),
            },
          ])
        : copyFiles([
            {
              from: path.join(rootDir, `npm/${name}/package.json`),
              to: path.join(outDir, `${name}/package.json`),
            },
          ]),
    ],
  };
};

function copyFiles(copyPairs) {
  return {
    name: 'copy-files',
    generateBundle() {
      copyPairs.forEach(({ from, to }) => {
        const destDir = path.dirname(to);
        // 判断目标文件夹是否存在
        if (!fs.existsSync(destDir)) {
          // 目标文件夹不存在,创建它
          fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(from, to);
      });
    },
  };
}

export default [
  getConfig('dev', 'vue'),
  getConfig('prod', 'vue'),
  getConfig('dev', 'pinia'),
  getConfig('prod', 'pinia'),
  getConfig('dev', 'vuex'),
  getConfig('prod', 'vuex'),
];
