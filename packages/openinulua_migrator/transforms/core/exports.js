'use strict';

// Remove ES module export statements to match OpenInula fixtures
// - export default function Foo() {}  -> function Foo() {}
// - export default Identifier;        -> (remove)
// - export const X = ...;             -> const X = ...;
// - export { X, Y as Z };             -> (remove)

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // export default declarations
  root.find(j.ExportDefaultDeclaration).forEach((p) => {
    const decl = p.node.declaration;
    if (decl.type === 'FunctionDeclaration' || decl.type === 'ClassDeclaration' || decl.type === 'VariableDeclaration') {
      j(p).replaceWith(decl);
    } else {
      // export default Identifier or literal -> remove
      j(p).remove();
    }
  });

  // export named declarations
  root.find(j.ExportNamedDeclaration).forEach((p) => {
    const ed = p.node;
    if (ed.declaration) {
      // export const ... -> const ...
      j(p).replaceWith(ed.declaration);
    } else {
      // export { ... } from ...; -> remove
      j(p).remove();
    }
  });

  return root.toSource({ quote: 'single' });
};


