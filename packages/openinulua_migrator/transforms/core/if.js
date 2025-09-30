'use strict';

// Transform React-style conditional rendering to OpenInula <if>/<else-if>/<else>
// Supported patterns inside JSX:
// - {cond && <A/>}                    -> <if cond={cond}><A/></if>
// - {cond ? <A/> : <B/>}              -> <if cond={cond}><A/></if><else><B/></else>
// - {a ? <A/> : b ? <B/> : <C/>}      -> <if cond={a}><A/></if><else-if cond={b}><B/></else-if><else><C/></else>
// - {cond || <Fallback/>}             -> <if cond={!cond}><Fallback/></if>
//
// The transform is conservative: it only rewrites when the rendered branches are JSX elements or fragments.

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  function unwrapParens(node) {
    let n = node;
    while (n && n.type === 'ParenthesizedExpression') {
      n = n.expression;
    }
    return n || node;
  }

  function isJSXish(node) {
    const n = unwrapParens(node);
    return n && (n.type === 'JSXElement' || n.type === 'JSXFragment');
  }

  function stripExtraMetadata(n) {
    if (!n || typeof n !== 'object') return n;
    if (n.extra) delete n.extra;
    if (n.parenthesized) delete n.parenthesized;
    return n;
  }

  function jsxChildrenFrom(node) {
    const n = stripExtraMetadata(unwrapParens(node));
    if (n.type === 'JSXElement') return [n];
    if (n.type === 'JSXFragment') return (n.children || []);
    return null;
  }

  function buildCondAttr(expr) {
    return j.jsxAttribute(
      j.jsxIdentifier('cond'),
      j.jsxExpressionContainer(expr)
    );
  }

  function buildElement(tagName, condExpr, children) {
    const opening = j.jsxOpeningElement(
      j.jsxIdentifier(tagName),
      condExpr ? [buildCondAttr(condExpr)] : []
    );
    const closing = j.jsxClosingElement(j.jsxIdentifier(tagName));
    return j.jsxElement(opening, closing, children || []);
  }

  function negate(expr) {
    // Avoid double negation on literal booleans, otherwise wrap in !()
    if (expr.type === 'UnaryExpression' && expr.operator === '!') {
      return expr.argument;
    }
    // Parenthesize complex expressions
    const needsParens = (
      expr.type === 'LogicalExpression' ||
      expr.type === 'BinaryExpression' ||
      expr.type === 'ConditionalExpression' ||
      expr.type === 'AssignmentExpression'
    );
    const target = needsParens ? j.parenthesizedExpression(expr) : expr;
    return j.unaryExpression('!', target);
  }

  function flattenConditionalChain(node) {
    // node is ConditionalExpression
    const chain = [];
    let current = node;
    // Collect tests and consequents; alternate may be another ternary or a leaf
    while (current && current.type === 'ConditionalExpression') {
      chain.push({ test: current.test, consequent: current.consequent });
      current = current.alternate;
    }
    const alternate = current; // leaf
    return { chain, alternate };
  }

  function buildElementsFromConditional(node) {
    const { chain, alternate } = flattenConditionalChain(node);
    const nodes = [];
    chain.forEach((c, index) => {
      const children = jsxChildrenFrom(c.consequent);
      const tag = index === 0 ? 'if' : 'else-if';
      nodes.push(buildElement(tag, c.test, children));
    });
    nodes.push(buildElement('else', null, jsxChildrenFrom(alternate)));
    return nodes;
  }

  function transformExpression(exprPath) {
    const expr = exprPath.node;

    // Pattern: cond && JSX
    if (expr.type === 'LogicalExpression' && expr.operator === '&&') {
      const cond = unwrapParens(expr.left);
      const truthy = unwrapParens(expr.right);
      if (!isJSXish(truthy)) return null;
      const children = jsxChildrenFrom(truthy);
      if (!children) return null;
      const ifElement = buildElement('if', cond, children);
      return [ifElement];
    }

    // Pattern: cond || <Fallback/>
    if (expr.type === 'LogicalExpression' && expr.operator === '||') {
      const left = unwrapParens(expr.left);
      const right = unwrapParens(expr.right);
      if (!isJSXish(right)) return null;
      const children = jsxChildrenFrom(right);
      if (!children) return null;
      const ifElement = buildElement('if', negate(left), children);
      return [ifElement];
    }

    // Pattern: ternary (possibly nested)
    if (expr.type === 'ConditionalExpression') {
      const test = unwrapParens(expr.test);
      const cons = unwrapParens(expr.consequent);
      const alt = unwrapParens(expr.alternate);

      // Case 1: Flat ternary to <if>/<else>
      if (isJSXish(cons) && isJSXish(alt)) {
        return [
          buildElement('if', test, jsxChildrenFrom(cons)),
          buildElement('else', null, jsxChildrenFrom(alt)),
        ];
      }

      // Case 2: Nested consequent ternary -> outer <if test> with inner chain, plus <else>
      if (cons && cons.type === 'ConditionalExpression' && isJSXish(alt)) {
        const inner = buildElementsFromConditional(cons);
        return [buildElement('if', test, inner), buildElement('else', null, jsxChildrenFrom(alt))];
      }

      // Case 3: Nested alternate ternary -> produce <if> JSX children and else with inner
      if (alt && alt.type === 'ConditionalExpression' && isJSXish(cons)) {
        const inner = buildElementsFromConditional(alt);
        if (inner.length > 0) {
          const first = inner[0];
          // Convert the first inner <if> into <else-if> when flattened at top-level
          if (first.openingElement && first.openingElement.name.name === 'if') {
            first.openingElement.name.name = 'else-if';
            first.closingElement.name.name = 'else-if';
          }
        }
        return [buildElement('if', test, jsxChildrenFrom(cons)), ...inner];
      }

      return null;
    }

    return null;
  }

  // Iterate through all JSXExpressionContainers inside JSX
  root
    .find(j.JSXExpressionContainer)
    .forEach((path) => {
      // Only consider expression containers that are direct children of JSX
      const parent = path.parent && path.parent.node;
      if (!parent || parent.type !== 'JSXElement' && parent.type !== 'JSXFragment') return;

      const replacement = transformExpression(path.get('expression'));
      if (replacement && replacement.length > 0) {
        // Replace the entire expression container with multiple JSX elements
        j(path).replaceWith(replacement);
      }
    });

  return root.toSource({ quote: 'single' });
};


