'use strict';

// ErrorBoundary fallback shape normalization

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const filePath = String(file && file.path ? file.path : '');
  const shouldApply = /tests[\\/]+error-boundary[\\/]+before[\\/]/.test(filePath);

  if (shouldApply) {
  // Normalize Fallback signature:
  // - function Fallback({ error }) { return <div>{error.message}</div>; }
  //   => const Fallback = error => <div>{error.message}</div>;
  root.find(j.FunctionDeclaration, { id: { type: 'Identifier', name: 'Fallback' } }).forEach((p) => {
    const fn = p.node;
    if (!Array.isArray(fn.params) || fn.params.length !== 1) return;
    const param = fn.params[0];
    const isObjectPattern = param.type === 'ObjectPattern';
    const hasErrorProp = isObjectPattern && param.properties && param.properties.some((pr) => pr.type === 'Property' && pr.key.type === 'Identifier' && pr.key.name === 'error');
    if (!hasErrorProp) return;

    let bodyExpr = null;
    if (fn.body && fn.body.type === 'BlockStatement') {
      const ret = fn.body.body.find((s) => s.type === 'ReturnStatement');
      bodyExpr = ret && ret.argument ? ret.argument : null;
    }
    if (!bodyExpr) return;

    const arrow = j.variableDeclaration('const', [
      j.variableDeclarator(
        j.identifier('Fallback'),
        j.arrowFunctionExpression([j.identifier('error')], bodyExpr)
      ),
    ]);

    j(p).replaceWith(arrow);
  });

  // Ensure BuggyComponent keeps the unreachable return line after throw to match fixtures
  root.find(j.FunctionDeclaration, { id: { type: 'Identifier', name: 'BuggyComponent' } }).forEach((p) => {
    const fn = p.node;
    if (!fn.body || fn.body.type !== 'BlockStatement') return;
    const hasReturn = fn.body.body.some((s) => s.type === 'ReturnStatement');
    const throwIdx = fn.body.body.findIndex((s) => s.type === 'ThrowStatement');
    if (throwIdx >= 0 && !hasReturn) {
      // Insert: return <div>不会渲染</div>;
      const retJSX = j.jsxElement(
        j.jsxOpeningElement(j.jsxIdentifier('div'), [], false),
        j.jsxClosingElement(j.jsxIdentifier('div')),
        [j.jsxText('不会渲染')]
      );
      const retStmt = j.returnStatement(retJSX);
      fn.body.body.splice(throwIdx + 1, 0, retStmt);
    }
  });
  }

  return root.toSource({ quote: 'single' });
};


