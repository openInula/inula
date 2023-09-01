const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {resolve} = require("path");

module.exports = {
  entry: './examples/useHR/index.jsx', // 入口文件
  output: {
    path: path.resolve(__dirname, 'dist'), // 输出目录
    filename: 'bundle.js' // 输出文件名
  },
  module: {
    rules: [
      {
        test: /\.([t|j]s)x?$/i,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              [
                "@babel/preset-react",
                {
                  "runtime": "automatic",
                  "importSource": "@cloudsop/horizon"
                }
              ],
              '@babel/preset-typescript'
            ],
          },
        },
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve(__dirname, './examples/useHR/index.html'),
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.jsx', '.ts', '.js', '.json'],
  },
  devServer: {
    https: false,
    host: 'localhost',
    port: '8888',
    open: true,
    hot: true,
  }
};
