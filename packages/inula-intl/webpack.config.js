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

const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const isDevelopment = process.env.NODE_ENV === 'development';
const entryPath = './example/index.tsx';

module.exports = {
  entry: resolve(__dirname, entryPath),
  output: {
    path: resolve(__dirname, './build'),
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        test: /\.([t|j]s)x?$/i,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env',
              [
              '@babel/preset-react',
              {
                'runtime': 'automatic', // 新增
                'importSource': 'inulajs' // 新增
              }
            ],
            '@babel/preset-typescript'],
          },
        },
      },
    ],
  },
  mode: isDevelopment ? 'development' : 'production',
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve(__dirname, './example/index.html'),
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.jsx', '.ts', '.js', '.json'],
  },
  devServer: {
    https: false,
    host: 'localhost',
    port: '8080',
    open: true,
    hot: true,
    headers: {
      connection: 'keep-alive',
    },
  },
};
