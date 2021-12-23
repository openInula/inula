const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const baseConfig = require('./webpack.base');
const path = require('path');

const mode = 'production';
const devtool = 'none';
const filename = 'horizon.production.js';

const plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': '"production"',
    __DEV__: 'false',
  }),
];

const proBaseConfig = {
  ...baseConfig,
  mode,
  devtool,
  plugins,
  optimization: {
    minimize: true
  },
};

const umd = {
  ...proBaseConfig,
  output: {
    path: path.resolve(__dirname, '../../build/horizon/umd'),
    filename,
    libraryTarget: 'umd',
    library: 'Horizon',
  },
};

const cjs = {
  ...proBaseConfig,
  output: {
    path: path.resolve(__dirname, '../../build/horizon/cjs'),
    filename,
    libraryTarget: 'commonjs',
  },
  plugins: [
    ...plugins,
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, '../../libs/index.js'),
        to: path.join(__dirname, '../../build/horizon/index.js'),
      },
      {
        from: path.join(__dirname, '../../libs/package.json'),
        to: path.join(__dirname, '../../build/horizon/package.json'),
      }
    ])
  ]
};

module.exports = [umd, cjs];
