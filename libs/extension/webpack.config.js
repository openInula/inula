const path = require('path');
const webpack = require('webpack');

const config = {
  entry: {
    background: './src/background/index.ts',
    main: './src/main/index.ts',
    injector: './src/injector/index.ts',
    contentScript: './src/contentScript/index.ts',
    panel: './src/panel/index.tsx',
  },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name].js',
  },
  mode: 'development',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          }
        ]
      },
      {
        test: /\.less/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,

            }
          },
          'less-loader'],
      }]
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  externals: {
    'horizon': 'Horizon',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"',
      isDev: 'false',
    }),
  ],
};

module.exports = config;
