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
              "@babel/preset-react",
              {
                "runtime": "automatic", // 新增
                "importSource": "@cloudsop/horizon" // 新增
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
