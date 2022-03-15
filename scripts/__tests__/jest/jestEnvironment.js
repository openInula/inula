global.MessageChannel = function MessageChannel() {
  this.port1 = {};
  this.port2 = {
    postMessage() { }
  };
};
