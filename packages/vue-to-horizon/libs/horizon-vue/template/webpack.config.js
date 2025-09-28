const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  // mode: "production",
  mode: 'development',
  devtool: 'source-map', // 开发环境建议配
  entry: {
    // main: path.join(__dirname, 'src', 'main.jsx'),
    main: path.join(__dirname, 'convert', 'main.js'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.mjs', '.ts'],
    fullySpecified: false,
    alias: {
      react: '@cloudsop/horizon', // 新增
      'react-dom': '@cloudsop/horizon', // 新增
      horizon: '@cloudsop/horizon', // 新增
      adapters: path.resolve(__dirname, 'adapters/'), // 新增
      '@@': path.resolve(__dirname, 'src'), // 新增
      '^': path.resolve(__dirname, 'convert', 'walle'), // 新增
      '~~': path.resolve(__dirname, 'convert', 'walle'), // 新增
      '~': path.resolve(__dirname, 'convert', 'walle'), // 新增
      '@': path.resolve(__dirname, 'convert'),
      'opendesign-theme': path.resolve(__dirname, './convert/plugins/opendesign-theme'),
      'opendesign-icons': path.resolve(__dirname, './convert/plugins/opendesign-icons'),
      'opendesign-charts': path.resolve(__dirname, './convert/plugins/opendesign-charts')
    },
  },
  devServer: {
    port: 8081,
    open: true,
    proxy: {
      '/devkit': 'http://localhost:3000',
      '/devkit-toolkit': 'http://localhost:3000',
    },
    historyApiFallback: {
      index: '/index.html',
    },
    static: [
      {
        directory: path.join(__dirname, 'dist'),
        publicPath: '/dist',
      },
      {
        directory: path.join(__dirname, 'assets'),
        publicPath: '/assets',
      },
      {
        directory: path.join(__dirname, 'convert'),
        publicPath: '/convert',
      },
      {
        directory: path.join(__dirname, 'public'),
        publicPath: '/',
      },
      {
        directory: path.join(__dirname, 'convert/static'),
        publicPath: '/static',
      },
    ],
    hot: false,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [{loader: 'babel-loader'}],
        include: path.join(__dirname, 'app'),
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', ['./src/preset.js', { runtime: 'classic', throwIfNamespace: false }]],
            },
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['postcss-import', 'postcss-nested'],
              },
            },
          },
          {
            loader: 'less-loader',
          },
          {
            loader: 'scoped-css-loader',
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['postcss-import', 'postcss-nested'],
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              // 每个项目地址不同
              additionalData: '@import “/convert/assets/common/style/common/varible.scss“;'
            }
          },
          {
            loader: 'scoped-css-loader',
          }
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: "scoped-css-loader",
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
            },
          }
        ],
      },
      {
        test: /\.(jpeg|jpg|png|gif|woff|woff2|eot|ttf|svg)$/,
        use: [
          {
            loader: 'url-loader',
          },
        ],
      },
    ],
  },
  optimization: {},
  plugins: [
    new MiniCssExtractPlugin({filename: '[name].css'}),
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify('development') },
      // 'process.env': { NODE_ENV: JSON.stringify('production') },
    }),
  ],
};
