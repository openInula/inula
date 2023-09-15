const path = require('path');
const _ROOTPATH = process.cwd();
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { rules, resolve } = require('./webpack.basic');

const app_main_path = path.resolve(_ROOTPATH, `./src/entry.tsx`);
const buildOutPath = path.resolve(_ROOTPATH, `./dist`);

const appConfig = {
  mode: 'production',
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
    rules,
  },
  resolve,
  plugins: [new HtmlWebpackPlugin(), new MiniCssExtractPlugin(), new CleanWebpackPlugin()],
};

module.exports = [appConfig];
