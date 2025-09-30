'use strict';

// Components transform: delegate to list transform for JSX list rendering
// so that components e2e fixtures (container pattern) are handled via this rule.

module.exports = function transformer(file, api) {
  const listTransform = require('./list');
  // Run list transform and return its output
  return listTransform(file, api);
};


