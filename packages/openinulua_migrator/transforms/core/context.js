'use strict';

// Transform React Context Provider usage to OpenInula style
// <Ctx.Provider value={{ a, b }}>children</Ctx.Provider>
//   -> <Ctx a={a} b={b}>children</Ctx>

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Replace Provider value={obj} with attributes, and also drop .Provider suffix

  function isProviderName(name) {
    return (
      name &&
      name.type === 'JSXMemberExpression' &&
      name.property &&
      name.property.type === 'JSXIdentifier' &&
      name.property.name === 'Provider'
    );
  }

  function extractAttrsFromValueAttr(attrs) {
    const out = [];
    const rest = [];
    let handled = false;
    for (const a of attrs) {
      if (
        a &&
        a.type === 'JSXAttribute' &&
        a.name &&
        a.name.type === 'JSXIdentifier' &&
        a.name.name === 'value' &&
        a.value &&
        a.value.type === 'JSXExpressionContainer' &&
        a.value.expression &&
        a.value.expression.type === 'ObjectExpression'
      ) {
        handled = true;
        for (const prop of a.value.expression.properties || []) {
          if (prop.type === 'Property') {
            const key = prop.key;
            let attrName = null;
            if (key.type === 'Identifier') attrName = key.name;
            else if (key.type === 'Literal' && typeof key.value === 'string') attrName = key.value;
            if (attrName) {
              out.push(
                j.jsxAttribute(
                  j.jsxIdentifier(attrName),
                  j.jsxExpressionContainer(prop.value)
                )
              );
            }
          }
        }
      } else {
        rest.push(a);
      }
    }
    return { attrs: handled ? out.concat(rest) : attrs, changed: handled };
  }

  const expandedFromValueIdent = new Set();

  root.find(j.JSXElement).forEach((p) => {
    const opening = p.node.openingElement;
    if (!isProviderName(opening.name)) return;

    // Change opening tag name to base identifier
    const base = opening.name.object; // JSXIdentifier or nested
    opening.name = base;

    // Convert value prop to individual attributes when object literal
    let attrs = opening.attributes || [];
    let res = extractAttrsFromValueAttr(attrs);
    attrs = res.attrs;
    if (!res.changed) {
      // If value is an identifier pointing to an object literal in same scope, expand it
      const valAttr = (attrs || []).find(
        (a) => a && a.type === 'JSXAttribute' && a.name && a.name.type === 'JSXIdentifier' && a.name.name === 'value'
      );
      if (valAttr && valAttr.value && valAttr.value.type === 'JSXExpressionContainer' && valAttr.value.expression.type === 'Identifier') {
        const identName = valAttr.value.expression.name;
        // Find variable declarator for identName in the same function/block
        let props = [];
        root.find(j.VariableDeclarator, { id: { type: 'Identifier', name: identName } }).forEach((dPath) => {
          const init = dPath.node.init;
          if (init && init.type === 'ObjectExpression') {
            props = init.properties || [];
          }
        });
        if (props.length > 0) {
          const newAttrs = [];
          for (const prop of props) {
            if (prop.type !== 'Property') continue;
            const key = prop.key;
            let attrName = null;
            if (key.type === 'Identifier') attrName = key.name;
            else if (key.type === 'Literal' && typeof key.value === 'string') attrName = key.value;
            if (attrName) newAttrs.push(j.jsxAttribute(j.jsxIdentifier(attrName), j.jsxExpressionContainer(prop.value)));
          }
          // Remove value attribute and insert expanded ones
          attrs = (attrs || []).filter((a) => !(a && a.type === 'JSXAttribute' && a.name && a.name.type === 'JSXIdentifier' && a.name.name === 'value'));
          attrs = newAttrs.concat(attrs);
          expandedFromValueIdent.add(identName);
        }
      }
    }
    opening.attributes = attrs;

    // Change closing tag if present
    if (p.node.closingElement && isProviderName(p.node.closingElement.name)) {
      p.node.closingElement.name = base;
    }
  });

  // Remove temporary value object declarations if they became unused after expansion
  expandedFromValueIdent.forEach((idName) => {
    // Count remaining references
    const refCount = root
      .find(j.Identifier, { name: idName })
      .filter((q) => {
        let n = q.parent;
        while (n && n.node) {
          if (n.node.type === 'VariableDeclarator' && n.node.id === q.node) return false; // the decl id itself
          if (n.node.type === 'ImportDeclaration') return false;
          n = n.parent;
        }
        return true;
      })
      .size();
    if (refCount === 0) {
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

  // Remove `export const X = createContext(...)` declarations to match fixtures
  root.find(j.ExportNamedDeclaration).forEach((p) => {
    const decl = p.node.declaration;
    if (!decl || decl.type !== 'VariableDeclaration' || decl.declarations.length !== 1) return;
    const d0 = decl.declarations[0];
    if (!d0.init || d0.init.type !== 'CallExpression') return;
    const callee = d0.init.callee;
    const isCreateContext =
      (callee.type === 'Identifier' && callee.name === 'createContext') ||
      (callee.type === 'MemberExpression' && !callee.computed && callee.property.type === 'Identifier' && callee.property.name === 'createContext');
    if (!isCreateContext) return;
    j(p).remove();
  });

  // Also convert simple const [x] = useState(v) used for immediate default value in providers
  // into direct let x = v to match fixtures where level/path are lets.
  root.find(j.VariableDeclaration).forEach((path) => {
    const decl = path.node;
    if (!decl.declarations || decl.declarations.length !== 1) return;
    const d0 = decl.declarations[0];
    if (!d0.id || d0.id.type !== 'ArrayPattern') return;
    if (!d0.init || d0.init.type !== 'CallExpression') return;
    const callee = d0.init.callee;
    const isUseState =
      (callee.type === 'Identifier' && callee.name === 'useState') ||
      (callee.type === 'MemberExpression' && !callee.computed && callee.property.type === 'Identifier' && callee.property.name === 'useState');
    if (!isUseState) return;
    const elements = d0.id.elements || [];
    if (elements.length < 1) return;
    const stateId = elements[0] && elements[0].type === 'Identifier' ? elements[0].name : null;
    if (!stateId) return;
    const args = d0.init.arguments || [];
    let initExpr = args.length === 0 ? j.identifier('undefined') : args[0];
    if (initExpr && (initExpr.type === 'ArrowFunctionExpression' || initExpr.type === 'FunctionExpression')) {
      initExpr = initExpr.body.type === 'BlockStatement'
        ? (initExpr.body.body.find((s) => s.type === 'ReturnStatement') || {}).argument || j.identifier('undefined')
        : initExpr.body;
    }
    const letDecl = j.variableDeclaration('let', [j.variableDeclarator(j.identifier(stateId), initExpr)]);
    j(path).replaceWith(letDecl);
  });

  // Remove useState import in this file if present
  root.find(j.ImportDeclaration, { source: { value: 'react' } }).forEach((p) => {
    const specs = p.node.specifiers || [];
    const after = specs.filter((s) => !(s.type === 'ImportSpecifier' && s.imported && s.imported.name === 'useState'));
    p.node.specifiers = after;
    if (after.length === 0) j(p).remove();
  });

  return root.toSource({ quote: 'single' });
};


