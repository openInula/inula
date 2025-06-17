/*
 * Copyright (c) 2025 Huawei Technologies Co.,Ltd.
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
import webpack from 'webpack';
import { fileURLToPath } from 'node:url';
import { webpackAlias, webpackRules } from './webpack.common.rules.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 用于 panel 页面开发
/** @type {import('webpack').Configuration  & {devServer:import('webpack-dev-server').Configuration}}*/
const devConfig = {
  entry: {
    panel: '/src/devtools/mockPanel.tsx',
    mockPage: './src/devtools/mockPage/index.tsx',
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
  },
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: webpackRules,
  },
  resolve: {
    alias: webpackAlias,
    extensions: ['.js', '.ts', '.tsx'],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"',
      isDev: 'true',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'build'),
    },
    open: 'panel.html',
    port: 9000,
  },
};

export default devConfig;
