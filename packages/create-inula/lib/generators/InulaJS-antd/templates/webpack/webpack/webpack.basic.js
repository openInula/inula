const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const _ROOTPATH = process.cwd();

module.exports = {
  resolve: {
    // 解析模块请求的选项
    extensions: ['.ts', '.tsx', '.js', '.json', '.jsx', '.css', '.html', '.less'],
    alias: {
      '@': path.resolve('src'),
      api: path.resolve('src/services/'),
      components: path.resolve('src/components'),
      config: path.resolve('src/utils/config'),
      themes: path.resolve('src/themes'),
      utils: path.resolve('src/utils'),

      react: 'inula', // 新增
      'react-dom': 'inula', // 新增
      inula: 'inula', // 新增
    },
  },
  rules: [
    // 模块规则（配置 loader、解析器等选项）
    {
      test: /\.(js|jsx|ts|tsx)$/,
      use: {
        loader: 'babel-loader',
      },
    },
    {
      test: /\.less$/,
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: {
            modules: {
              localIdentName: '[local]--[hash:base64:5]',
            },
          },
        },
        {
          loader: 'less-loader',
          options: {
            lessOptions: {
              javascriptEnabled: true,
            },
          },
        },
      ],
    },
    {
      test: /\.css$/,
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: {
            modules: {
              localIdentName: '[local]',
            },
          },
        },
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
};
