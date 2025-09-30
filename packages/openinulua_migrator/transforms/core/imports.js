'use strict';

// Imports transform: remove any import from 'react' entirely

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root.find(j.ImportDeclaration, { source: { value: 'react' } }).remove();

  return root.toSource({ quote: 'single' });
};

