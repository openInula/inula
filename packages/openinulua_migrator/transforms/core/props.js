'use strict';

// Props transform: only minimal helpers used by props e2e fixtures
// - Convert const [x, setX] = useState(init) -> let x = init
// - setX(prev => prev +/- 1) -> x++/x--, otherwise x = expr
// - Remove import from 'react'

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Brand rename in dynamic samples embedded in props docs
  root.find(j.JSXAttribute, { name: { type: 'JSXIdentifier', name: 'name' } }).forEach((p) => {
    const val = p.node.value;
    if (val && val.type === 'Literal' && val.value === 'React') p.node.value = j.literal('OpenInula');
  });

  const statePairs = [];

  // Declarations
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
    const setterId = elements[1] && elements[1].type === 'Identifier' ? elements[1].name : null;
    if (!stateId) return;

    const args = d0.init.arguments || [];
    let initExpr = null;
    if (args.length === 0) {
      initExpr = j.identifier('undefined');
    } else {
      const a0 = args[0];
      if (a0.type === 'ArrowFunctionExpression' || a0.type === 'FunctionExpression') {
        if (a0.body.type === 'BlockStatement') {
          const ret = a0.body.body.find((s) => s.type === 'ReturnStatement');
          initExpr = (ret && ret.argument) || j.identifier('undefined');
        } else {
          initExpr = a0.body;
        }
      } else {
        initExpr = a0;
      }
    }

    const letDecl = j.variableDeclaration('let', [j.variableDeclarator(j.identifier(stateId), initExpr)]);
    j(path).replaceWith(letDecl);
    if (setterId) statePairs.push({ state: stateId, setter: setterId });
  });

  // Setter calls
  statePairs.forEach(({ state, setter }) => {
    root
      .find(j.CallExpression, { callee: { type: 'Identifier', name: setter } })
      .forEach((p) => {
        const args = p.node.arguments || [];
        if (args.length !== 1) return;
        let rhs = args[0];

        if (rhs.type === 'ArrowFunctionExpression' || rhs.type === 'FunctionExpression') {
          const param = rhs.params && rhs.params[0] && rhs.params[0].type === 'Identifier' ? rhs.params[0].name : null;
          let bodyExpr = null;
          if (rhs.body.type === 'BlockStatement') {
            const ret = rhs.body.body.find((s) => s.type === 'ReturnStatement');
            bodyExpr = (ret && ret.argument) || null;
          } else {
            bodyExpr = rhs.body;
          }
          if (!bodyExpr) return;
          if (param) {
            j(bodyExpr).find(j.Identifier, { name: param }).forEach((q) => { q.node.name = state; });
          }
          rhs = bodyExpr;
        }

        const parent = p.parent && p.parent.node;
        let replaced = false;
        if (rhs && rhs.type === 'BinaryExpression') {
          const { operator, left, right } = rhs;
          const isPlusOne = operator === '+' && (
            (left.type === 'Identifier' && left.name === state && right.type === 'Literal' && right.value === 1) ||
            (right.type === 'Identifier' && right.name === state && left.type === 'Literal' && left.value === 1)
          );
          const isMinusOne = operator === '-' && left.type === 'Identifier' && left.name === state && right.type === 'Literal' && right.value === 1;
          if (isPlusOne || isMinusOne) {
            const upd = j.updateExpression(isPlusOne ? '++' : '--', j.identifier(state), false);
            if (parent && parent.type !== 'ExpressionStatement') j(p).replaceWith(upd); else j(p).replaceWith(j.expressionStatement(upd));
            replaced = true;
          }
        }
        if (!replaced) {
          const assignment = j.assignmentExpression('=', j.identifier(state), rhs);
          if (parent && parent.type !== 'ExpressionStatement') {
            j(p).replaceWith(assignment);
          } else {
            j(p).replaceWith(j.expressionStatement(assignment));
          }
        }
      });
  });

  // Remove react import entirely in props fixtures
  root.find(j.ImportDeclaration, { source: { value: 'react' } }).remove();

  return root.toSource({ quote: 'single' });
};


