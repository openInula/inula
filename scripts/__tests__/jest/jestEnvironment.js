global.MessageChannel = function MessageChannel() {
  this.port1 = {};
  this.port2 = {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    postMessage() { }
  };
};
global.__VERSION__ = require('../../../libs/horizon/package.json').version;
