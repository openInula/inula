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

// 引入路径包
const path = require('path');

// webpack配置信息
module.exports = {
  // 指定入口文件
  entry: './src/inulaRequest.ts',

  // 指定打包文件信息
  output: {
    // 指定打包文件目录
    path: path.resolve(__dirname, 'dist'),
    library: 'myLibrary',
    libraryTarget: 'umd',
    filename: 'inulaRequest.js',
  },

  // 指定打包时使用的模块
  module: {
    // 指定加载规则
    rules: [
      {
        // 指定规则生效的文件
        test: /\.ts$/,
        use: ['babel-loader', 'ts-loader'],

        // 排除不需要生效的文件
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        use: ['babel-loader'],

        exclude: /node_modules/,
      },
    ],
  },

  mode: 'development',

  resolve: {
    extensions: ['.js', '.ts'],
  },
};
