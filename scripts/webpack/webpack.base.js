const path = require('path');

const libPath = path.join(__dirname, '../../libs/horizon');
const baseConfig = {
  entry: path.resolve(libPath, 'index.ts'),
  module: {
    rules: [
      {
        test: /\.(js)|ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      'horizon-external': path.join(libPath, './horizon-external'),
      'horizon': path.join(libPath, './horizon'),
    }
  },
};

module.exports = baseConfig;
