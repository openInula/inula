global.isDev = process.env.NODE_ENV === 'development';
global.MessageChannel = function MessageChannel() {
    this.port1 = {};
    this.port2 = {
        postMessage() { }
    };
};

expect.extend({
    ...require('./customMatcher'),
});
