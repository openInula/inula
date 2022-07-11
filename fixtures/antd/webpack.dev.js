const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const horizon = path.resolve(__dirname, '../../build/horizon');
const config = () => {
  return {
    entry: ['./index.jsx'],
    output: {
      path: path.resolve(__dirname, 'temp'),
      filename: '[name].[hash].js',
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.ts(x)?|js|jsx$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
              },
            },
          ],
          exclude: /\.module\.css$/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx', 'json'],
      alias: {
        horizon: horizon,
        react: horizon,
        'react-dom': horizon,
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: require('html-webpack-template'),
        title: 'Horizon Antd',
        inject: false,
        appMountId: 'app',
        filename: 'index.html',
      }),
    ],
  };
};

module.exports = config;
