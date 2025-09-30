'use strict';

// Suspense & lazy codemod: remove React import wrappers; largely identical usage
// Ensure imports from 'react' for Suspense/lazy are dropped if unused after other transforms

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // If there is an import from 'react' bringing Suspense or lazy but only used as identifiers
  // keep as-is; core/imports will remove the react import entirely in this project anyway.

  return root.toSource({ quote: 'single' });
};


