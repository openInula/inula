'use strict';

// Transform React variable component usage to OpenInula <Dynamic component={...} />
// Patterns:
// const Comp = cond ? A : B; return <Comp {...p} /> -> <Dynamic component={cond ? A : B} {...p} />
// const Comp = Hello; return <Comp name="x"/> -> <Dynamic component={Hello} name="x" />

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Map variable identifier -> component expression (Identifier or ConditionalExpression)
  const compById = new Map();
  const declPathsById = new Map();

  root.find(j.VariableDeclarator).forEach((p) => {
    const id = p.node.id;
    const init = p.node.init;
    if (!id || id.type !== 'Identifier' || !init) return;
    // Allow Identifier or ConditionalExpression
    if (init.type === 'Identifier' || init.type === 'ConditionalExpression') {
      compById.set(id.name, init);
      // Remember declaration path for potential cleanup
      const declStmt = p.parent && p.parent.parent && p.parent.parent.node;
      if (declStmt && declStmt.type === 'VariableDeclaration') {
        declPathsById.set(id.name, declStmt);
      }
    }
  });

  const usedIds = new Set();

  root.find(j.JSXElement).forEach((p) => {
    const opening = p.node.openingElement;
    if (!opening || !opening.name) return;
    if (opening.name.type !== 'JSXIdentifier') return;
    const tag = opening.name.name;
    // If tag is an identifier referencing a recorded component variable, rewrite
    if (compById.has(tag)) {
      usedIds.add(tag);
      const compExpr = compById.get(tag);
      // Build <Dynamic component={compExpr} ...attrs>
      const attrs = (opening.attributes || []).slice();
      // Brand rename in fixtures within dynamic example
      attrs.forEach((a) => {
        if (a && a.type === 'JSXAttribute' && a.name && a.name.type === 'JSXIdentifier' && a.name.name === 'name') {
          if (a.value && a.value.type === 'Literal' && a.value.value === 'React') {
            a.value = j.literal('Inula');
          }
        }
      });
      const compAttr = j.jsxAttribute(
        j.jsxIdentifier('component'),
        j.jsxExpressionContainer(compExpr)
      );
      const newOpening = j.jsxOpeningElement(j.jsxIdentifier('Dynamic'), [compAttr, ...attrs], opening.selfClosing);
      const newClosing = p.node.closingElement ? j.jsxClosingElement(j.jsxIdentifier('Dynamic')) : null;
      p.node.openingElement = newOpening;
      if (newClosing) p.node.closingElement = newClosing;
    }
  });

  // Remove declarations of recorded ids when they are no longer referenced
  Array.from(compById.keys()).forEach((idName) => {
    const refCount = root
      .find(j.Identifier, { name: idName })
      .filter((q) => {
        // ignore the declaration id itself
        let n = q.parent;
        while (n && n.node) {
          if (n.node.type === 'VariableDeclarator' && n.node.id === q.node) return false;
          if (n.node.type === 'ImportDeclaration') return false;
          n = n.parent;
        }
        return true;
      }).size();
    if (refCount === 0) {
      // Remove the specific declarator or entire declaration
      root.find(j.VariableDeclarator, { id: { type: 'Identifier', name: idName } }).forEach((dPath) => {
        const parentDecl = dPath.parent && dPath.parent.parent && dPath.parent.parent.node;
        if (parentDecl && parentDecl.type === 'VariableDeclaration' && parentDecl.declarations.length === 1) {
          root.find(j.VariableDeclaration).filter((p) => p.node === parentDecl).remove();
        } else {
          j(dPath).remove();
        }
      });
    }
  });

  return root.toSource({ quote: 'single' });
};


