'use strict';

const baseConfig = require('./config.base');

const pathJson= require('../../path.json');
const moduleNameMapper = {};
moduleNameMapper[
  '^horizon-external$'
// ] = `<rootDir>/${pathJson["horizon-path"]}/libs/horizon/src/external/Horizon.ts`;
] = `<rootDir>/${pathJson["horizon-path"]}/packages/inula/src/index.ts`;
moduleNameMapper[
  '^horizon$'
] = `<rootDir>/${pathJson["horizon-path"]}/packages/inula/src/dom/DOMExternal.ts`;


module.exports = Object.assign({}, baseConfig, {
  // Prefer the stable forks for tests.
  moduleNameMapper,
  modulePathIgnorePatterns: [
    ...baseConfig.modulePathIgnorePatterns,
  ],
  setupFiles: [
    ...baseConfig.setupFiles,
    require.resolve('./setupHostConfigs.js'),
  ],
});
