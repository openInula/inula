const webpack = require('webpack');
const ESLintPlugin = require('eslint-webpack-plugin');
const baseConfig = require('./webpack.base');
const path = require('path');

const mode = 'development';
const devtool = 'inline-source-map';
const filename = 'horizon.development.js';

const plugins = [
  new ESLintPlugin({fix: true}),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': '"development"',
    isDev: 'true',
  }),
];

const umd = {
  ...baseConfig,
  mode,
  devtool,
  output: {
    path: path.resolve(__dirname, '../../build/horizon/umd'),
    filename,
    libraryTarget: 'umd',
    library: 'Horizon',
  },
  plugins,
};

const cjs = {
  ...baseConfig,
  mode,
  devtool,
  output: {
    path: path.resolve(__dirname, '../../build/horizon/cjs'),
    filename,
    libraryTarget: 'commonjs',
  },
  plugins,
};

module.exports = [umd, cjs];
