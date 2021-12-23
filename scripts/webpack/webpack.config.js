const dev = require('./webpack.dev');
const pro = require('./webpack.pro');

module.exports = [...dev, ...pro];
