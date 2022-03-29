const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

// 用于 panel 页面开发

module.exports = {
  mode: 'development',
  entry: {
    panel: path.join(__dirname, './src/panel/index.tsx'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env',
                '@babel/preset-typescript',
                ['@babel/preset-react', {
                  runtime: 'classic',
                  "pragma": "Horizon.createElement",
                  "pragmaFrag": "Horizon.Fragment",
                }]],
              plugins: ['@babel/plugin-proposal-class-properties'],
            }
          }
        ]
      },
      {
        test: /\.less/i,
        use: [
          "style-loader", 
          { 
            loader: "css-loader", 
            options: { 
              modules: true,
              
            } 
          }, 
          'less-loader'],
      }]
  },
  externals: {
    'horizon': 'Horizon',
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    open: 'panel.html',
    port: 9000,
    magicHtml: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'panel.html',
      template: './src/panel/panel.html'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"',
      isDev: 'true',
    }),
  ],
};
