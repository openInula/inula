'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/horizon.production.js');
} else {
  module.exports = require('./cjs/horizon.development.js');
}
