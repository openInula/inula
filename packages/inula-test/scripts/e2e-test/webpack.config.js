const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

let config = {
  mode: 'production',
  entry: path.resolve(__dirname, 'src/components/index.jsx'),
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          { loader: 'babel-loader' }
        ]
      },
      {
        test: /\.less$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'less-loader' }
        ]
      },
      {
        test: /\.(svg|gif)$/,
        use: ['url-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, `src/horizon.html`),
      filename: 'index.html'
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, `src/react.html`),
      filename: 'react.html'
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../../build/node_modules/horizon-external/umd/react.development.js'),
        to: path.resolve(__dirname, 'build/horizon/react.development.js'),
      },
      {
        from: path.resolve(__dirname, '../../build/node_modules/react-dom/umd/react-dom.development.js'),
        to: path.resolve(__dirname, 'build/horizon/react-dom.development.js'),
      },
      {
        from: path.resolve(__dirname, 'src/horizon-external/react.development.js'),
        to: path.resolve(__dirname, 'build/horizon-external/react.development.js'),
      },
      {
        from: path.resolve(__dirname, 'src/horizon-external/react-dom.development.js'),
        to: path.resolve(__dirname, 'build/horizon-external/react-dom.development.js'),
      }
    ]),
  ],
  devtool: 'source-map',
  externals: {
    'horizon-external': 'React',
    'horizon': 'ReactDOM'
  }
};
module.exports = config;
