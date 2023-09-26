'use strict';

const {join} = require('path');

async function build(horizonPath, asyncCopyTo) {
  // copy the UMD bundles
  await asyncCopyTo(
    join(horizonPath, 'build', 'horizon', 'umd', 'horizon.production.js'),
    join(__dirname, 'horizon.production.js')
  );
}

module.exports = build;
