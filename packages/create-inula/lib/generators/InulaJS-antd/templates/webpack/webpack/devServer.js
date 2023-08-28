const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const configs = require(`./webpack.dev`);
const compiler = webpack(configs);

const devServerOptions = {
  setupMiddlewares: (middlewares, devServer) => {
    // 支持mock能力
    require('./mockServer.js')(devServer.app);
    return middlewares;
  },
  host: 'localhost',
  port: '8890',
  open: true,
  historyApiFallback: true, // 使用HTML5 History API时，/dashboard 会返回404，需要这个配置项解决
  client: {
    overlay: {
      errors: true,
      warnings: false,
      runtimeErrors: error => {
        if (error.message.indexOf('ResizeObserver') !== -1) {
          return false;
        }
        return true;
      },
    },
  },
};

const server = new WebpackDevServer(compiler, devServerOptions);

server.startCallback(() => {
  console.log(`工程已启动, http://localhost:8888`);
});
