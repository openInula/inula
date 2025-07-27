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

import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import path from 'path';
import fs from 'fs';
import replace from '@rollup/plugin-replace';
import copy from './copy-plugin';
import { terser } from 'rollup-plugin-terser';
import { version as inulaVersion } from '../../package.json';

const extensions = ['.js', '.ts'];

const libDir = path.join(__dirname, '../..');
const rootDir = path.join(__dirname, '../..');
const outDir = path.join(rootDir, 'build', 'inula');

if (!fs.existsSync(path.join(rootDir, 'build'))) {
  fs.mkdirSync(path.join(rootDir, 'build'));
}
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

const outputResolve = (...p) => path.resolve(outDir, ...p);

const isDev = mode => {
  return mode === 'development';
};

const getBasicPlugins = mode => {
  return [
    nodeResolve({
      extensions,
      modulesOnly: true,
    }),
    babel({
      exclude: 'node_modules/**',
      configFile: path.join(__dirname, '../../babel.config.js'),
      babelHelpers: 'runtime',
      extensions,
    }),
    replace({
      values: {
        'process.env.NODE_ENV': `"${mode}"`,
        isDev: isDev(mode).toString(),
        isTest: false,
        __VERSION__: `"${inulaVersion}"`,
      },
      preventAssignment: true,
    }),
  ];
};

function getOutputName(mode) {
  return mode === 'production' ? `inula.${mode}.min.js` : `inula.${mode}.js`;
}

function genConfig(mode) {
  const sourcemap = isDev(mode) ? 'inline' : false;
  return {
    input: path.resolve(libDir, 'src', 'index.ts'),
    output: [
      {
        file: outputResolve('cjs', getOutputName(mode)),
        sourcemap,
        format: 'cjs',
      },
      {
        file: outputResolve('umd', getOutputName(mode)),
        sourcemap,
        name: 'Inula',
        format: 'umd',
      },
      {
        file: outputResolve('esm', getOutputName(mode)),
        sourcemap,
        format: 'esm',
      },
    ],
    plugins: [
      ...getBasicPlugins(mode),
      mode === 'production' && terser(),
      copy([
        {
          from: path.join(libDir, '/npm/index.js'),
          to: path.join(outDir, 'index.js'),
        },
        {
          from: path.join(__dirname, '..', 'package.json'),
          to: path.join(outDir, 'package.json'),
        },
        {
          from: path.join(libDir, 'README.md'),
          to: path.join(outDir, 'README.md'),
        },
      ]),
    ],
  };
}

function genJSXRuntimeConfig(mode) {
  return {
    input: path.resolve(libDir, 'src', 'jsx-runtime.ts'),
    output: [
      {
        file: outputResolve('jsx-runtime.js'),
        format: 'cjs',
      },
      {
        file: outputResolve('jsx-runtime.esm-browser.js'),
        format: 'esm',
      },
    ],
    plugins: [...getBasicPlugins(mode)],
  };
}

function genJSXDEVRuntimeConfig(mode) {
  return {
    input: path.resolve(libDir, 'src', 'jsx-dev-runtime.ts'),
    output: {
      file: outputResolve('jsx-dev-runtime.js'),
      format: 'cjs',
    },
    plugins: [...getBasicPlugins(mode)],
  };
}

export default [genConfig('development'), genConfig('production'), genJSXRuntimeConfig(''), genJSXDEVRuntimeConfig('')];
