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
import fs from 'fs';
import { fileURLToPath } from 'node:url';
import { webpackAlias, webpackRules } from './webpack.common.rules.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function copyFolderSync(source, target) {
  // 创建目标文件夹（如果不存在）
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  // 获取源文件夹中的所有文件和目录
  const items = fs.readdirSync(source);
  items.forEach(item => {
    const sourcePath = path.join(source, item);
    const targetPath = path.join(target, item);
    // 检查当前项是文件还是目录
    if (fs.lstatSync(sourcePath).isDirectory()) {
      // 递归复制目录
      copyFolderSync(sourcePath, targetPath);
    } else {
      // 复制文件
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

function handleBuildDir() {
  const staticDir = path.join(__dirname, 'build');
  const isBuildExist = fs.existsSync(staticDir);

  if (!isBuildExist) {
    fs.mkdirSync(staticDir);
  }
  fs.copyFileSync(path.join(__dirname, 'src', 'panel', 'panel.html'), path.join(staticDir, 'panel.html'));
  fs.copyFileSync(path.join(__dirname, 'src', 'panelX', 'panelX.html'), path.join(staticDir, 'panelX.html'));
  fs.copyFileSync(path.join(__dirname, 'src', 'main', 'main.html'), path.join(staticDir, 'main.html'));
  fs.copyFileSync(path.join(__dirname, 'src', 'manifest.json'), path.join(staticDir, 'manifest.json'));
  copyFolderSync(path.join(__dirname, 'src', 'popups'), path.join(staticDir, 'popups'));
  copyFolderSync(path.join(__dirname, 'assets'), path.join(staticDir, 'assets'));
}

handleBuildDir();

/** @type import('webpack').Configuration */
const config = {
  entry: {
    background: path.join(__dirname, './src/background/index.ts'),
    main: path.join(__dirname, './src/main/index.ts'),
    injector: path.join(__dirname, './src/injector/index.ts'),
    messageHub: path.join(__dirname, './src/contentScript/messageHub.ts'),
    devHook: path.join(__dirname, './src/contentScript/devHook.ts'),
    panel: path.join(__dirname, './src/panel/index.tsx'),
    panelX: path.join(__dirname, './src/panelX/index.tsx'),
  },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name].js',
  },
  mode: 'development',
  devtool: 'inline-source-map',
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
      isDev: 'false',
    }),
  ],
};

export default config;
