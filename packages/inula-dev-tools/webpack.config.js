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
import webpack from 'webpack';
import fs from 'fs';

function handleBuildDir() {
  const staticDir = path.join(__dirname, 'build');
  console.log('staticDir: ', staticDir);
  const isBuildExist = fs.existsSync(staticDir);
  console.log('isBuildExist: ', isBuildExist);

  if (!isBuildExist) {
    fs.mkdirSync(staticDir);
  }
  fs.copyFileSync(
    path.join(__dirname, 'src', 'panel', 'panel.html'),
    path.join(staticDir, 'panel.html')
  );
  fs.copyFileSync(
    path.join(__dirname, 'src', 'panelX', 'panel.html'),
    path.join(staticDir, 'panelX.html')
  );
  fs.copyFileSync(
    path.join(__dirname, 'src', 'main', 'main.html'),
    path.join(staticDir, 'main.html')
  );
  fs.copyFileSync(
    path.join(__dirname, 'src', 'manifest.json'),
    path.join(staticDir, 'manifest.json')
  );
  fs.copyFileSync(
    path.join(
      __dirname,
      '../inula/build/umd',
      'inula.development.js'
    ),
    path.join(staticDir, 'inula.development.js')
  );
}

handleBuildDir();

const config = {
  entry: {
    background: './src/background/index.ts',
    main: './src/main/index.ts',
    injector: './src/injector/index.ts',
    contentScript: './sec/contentScript/index.ts',
    panel: './src/panel/index.ts',
    panelX: './src/panelX/index.ts',
  },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name].js'
  },
  mode: 'development',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /(\.ts)|(\.tsx)$/,
        exclude: function (path) {
          return /node_modules/.test(path) && !/inula/.test(path);
        },
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.less/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
          'less-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', 'tsx'],
  },
  externals: {
    openinula: 'Inula',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"',
      isDev: 'false',
    }),
  ],
};

module.exports = config;
