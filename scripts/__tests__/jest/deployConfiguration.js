global.isDev = process.env.NODE_ENV === 'development';
global.MessageChannel = function MessageChannel() {
  this.port1 = {};
  this.port2 = {
    postMessage() { }
  };
};

// 使Jest感知自定义匹配器
expect.extend({
  ...require('./customMatcher'),
});
