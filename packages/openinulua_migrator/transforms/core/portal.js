'use strict';

// Transform React createPortal(children, target) -> <Portal target={target}>{children}</Portal>

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  function isCreatePortal(callee) {
    // createPortal(...) or ReactDOM.createPortal(...)
    if (!callee) return false;
    if (callee.type === 'Identifier' && callee.name === 'createPortal') return true;
    if (
      callee.type === 'MemberExpression' &&
      !callee.computed &&
      callee.property.type === 'Identifier' &&
      callee.property.name === 'createPortal'
    )
      return true;
    return false;
  }

  root.find(j.CallExpression).forEach((p) => {
    const call = p.node;
    if (!isCreatePortal(call.callee)) return;
    const args = call.arguments || [];
    if (args.length < 2) return;
    const children = args[0];
    const target = args[1];
    // Build <Portal target={target}>{children}</Portal>
    const opening = j.jsxOpeningElement(
      j.jsxIdentifier('Portal'),
      [j.jsxAttribute(j.jsxIdentifier('target'), j.jsxExpressionContainer(target))]
    );
    const closing = j.jsxClosingElement(j.jsxIdentifier('Portal'));
    let childNodes = [];
    if (children.type === 'JSXElement' || children.type === 'JSXFragment') {
      childNodes = [children];
    } else {
      childNodes = [j.jsxExpressionContainer(children)];
    }
    const jsxEl = j.jsxElement(opening, closing, childNodes);
    j(p).replaceWith(jsxEl);
  });

  // Remove named import createPortal from 'react-dom' if unused
  root.find(j.ImportDeclaration, { source: { value: 'react-dom' } }).forEach((path) => {
    const decl = path.node;
    const specs = decl.specifiers || [];
    const hasCreatePortal = specs.some(
      (s) => s.type === 'ImportSpecifier' && s.imported && s.imported.name === 'createPortal'
    );
    if (!hasCreatePortal) return;
    // Check usage of identifier(s) named createPortal
    const localNames = specs
      .filter((s) => s.type === 'ImportSpecifier' && s.imported && s.imported.name === 'createPortal')
      .map((s) => (s.local ? s.local.name : 'createPortal'));
    // Consider usage only outside of import declarations
    const used = localNames.some((name) => {
      let count = 0;
      root.find(j.Identifier, { name }).forEach((p) => {
        // Ignore occurrences within import declarations
        let node = p.parent;
        let insideImport = false;
        while (node && node.node) {
          if (node.node.type === 'ImportDeclaration') {
            insideImport = true;
            break;
          }
          node = node.parent;
        }
        if (!insideImport) count += 1;
      });
      return count > 0;
    });
    if (!used) {
      decl.specifiers = specs.filter(
        (s) => !(s.type === 'ImportSpecifier' && s.imported && s.imported.name === 'createPortal')
      );
      if (decl.specifiers.length === 0) {
        j(path).remove();
      }
    }
  });

  return root.toSource({ quote: 'single' });
};


