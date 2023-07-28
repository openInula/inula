const path = require('path');
const _ROOTPATH = process.cwd();
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { rules, resolve } = require('./webpack.basic');

const appName = 'admin';
const app_main_path = path.resolve(_ROOTPATH, `./src/entry.tsx`);
const buildOutPath = path.resolve(_ROOTPATH, `./build/${appName}`);

const appConfig = {
  mode: 'development', // "production" | "development" | "none"
  entry: {
    app_main: [app_main_path],
  },
  output: {
    path: buildOutPath,
    publicPath: '/',
    filename: '[name].[hash].js',
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  target: 'web', // bundle 应该运行的环境
  module: {
    rules, // 关于模块配置
  },
  resolve,
  plugins: [new HtmlWebpackPlugin(), new MiniCssExtractPlugin(), new CleanWebpackPlugin()],
  devtool: 'source-map',
  // devtool: 'eval-source-map',
};

module.exports = [appConfig];
