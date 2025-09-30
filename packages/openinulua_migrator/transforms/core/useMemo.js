'use strict';

// Transform React useMemo to OpenInula 2.0 style computed constants
// - const x = useMemo(() => expr, [deps]) -> const x = expr
// - const x = React.useMemo(() => expr, [deps]) -> const x = expr
// - Supports alias: import { useMemo as memo } from 'react'; memo(() => expr)
// - Optionally removes named import useMemo from 'react' (if present)

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const filePath = String(file && file.path ? file.path : '');

  // Gather react import info for alias/default names
  let defaultReactLocal = null;
  const useMemoLocalNames = new Set(['useMemo']);

  root.find(j.ImportDeclaration, { source: { value: 'react' } }).forEach((p) => {
    const specs = p.node.specifiers || [];
    specs.forEach((s) => {
      if (s.type === 'ImportDefaultSpecifier') {
        defaultReactLocal = s.local ? s.local.name : defaultReactLocal;
      } else if (s.type === 'ImportSpecifier') {
        const importedName = s.imported && s.imported.name;
        if (importedName === 'useMemo') {
          const localName = s.local ? s.local.name : importedName;
          useMemoLocalNames.add(localName);
        }
      }
    });
  });

  function isUseMemoCallee(node) {
    if (!node) return false;
    if (node.type === 'Identifier') {
      return useMemoLocalNames.has(node.name);
    }
    if (
      node.type === 'MemberExpression' &&
      !node.computed &&
      node.property &&
      node.property.type === 'Identifier' &&
      node.property.name === 'useMemo' &&
      node.object &&
      node.object.type === 'Identifier' &&
      defaultReactLocal &&
      node.object.name === defaultReactLocal
    ) {
      return true;
    }
    return false;
  }

  function extractMemoBodyArg(callExpr) {
    const args = callExpr.arguments || [];
    if (args.length === 0) return null;
    const fn = args[0];
    if (fn.type === 'ArrowFunctionExpression' || fn.type === 'FunctionExpression') {
      if (fn.body.type === 'BlockStatement') {
        const ret = fn.body.body.find((s) => s.type === 'ReturnStatement');
        return (ret && ret.argument) || null;
      }
      return fn.body;
    }
    return null;
  }

  // Replace const x = useMemo(() => expr, [deps]) with const x = expr (no extra blank lines)
  root
    .find(j.VariableDeclarator, {
      init: { type: 'CallExpression' },
    })
    .filter((p) => isUseMemoCallee(p.node.init.callee))
    .forEach((p) => {
      const bodyExpr = extractMemoBodyArg(p.node.init);
      if (!bodyExpr) return;
      p.node.init = bodyExpr;
    });

  // Also handle assignments: x = useMemo(() => expr, [deps]) => x = expr
  root
    .find(j.AssignmentExpression, { right: { type: 'CallExpression' } })
    .filter((p) => isUseMemoCallee(p.node.right.callee))
    .forEach((p) => {
      const bodyExpr = extractMemoBodyArg(p.node.right);
      if (!bodyExpr) return;
      p.node.right = bodyExpr;
    });

  // Clean up react named import useMemo; remove import if now empty
  root.find(j.ImportDeclaration, { source: { value: 'react' } }).forEach((p) => {
    const before = p.node.specifiers || [];
    const after = before.filter(
      (s) => !(s.type === 'ImportSpecifier' && s.imported && s.imported.name === 'useMemo')
    );
    if (after.length === 0) j(p).remove();
    else p.node.specifiers = after;
  });

  // Remove stray empty statements which can create extra blank lines
  root.find(j.EmptyStatement).remove();

  return root.toSource({ quote: 'single' });
};

