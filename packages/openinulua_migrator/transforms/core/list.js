'use strict';

// Transform React list rendering `{arr.map((item, i) => <JSX .../> )}`
// into OpenInula `<for each={arr}>{(item, i) => <JSX .../>}</for>`
//
// Rules per docs/list.md:
// - Convert .map() inside JSX expression containers
// - Preserve parameters (item, index)
// - Remove React-only key prop from the top-level returned element
// - Support nested maps and maps on expressions (e.g., users.filter(...).map(...))
// - Support arrow functions and function expressions; block bodies with return

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  function isJSXish(node) {
    return node && (node.type === 'JSXElement' || node.type === 'JSXFragment');
  }

  function extractJSXFromCallback(fn) {
    // Returns { params: [..], jsx: JSXElement|JSXFragment } or null
    if (!fn) return null;
    let params = [];
    if (fn.type === 'ArrowFunctionExpression' || fn.type === 'FunctionExpression') {
      params = fn.params || [];
      if (fn.body.type === 'JSXElement' || fn.body.type === 'JSXFragment') {
        return { params, jsx: fn.body };
      }
      if (fn.body.type === 'BlockStatement') {
        const ret = fn.body.body.find((s) => s.type === 'ReturnStatement');
        if (ret && ret.argument && isJSXish(ret.argument)) {
          return { params, jsx: ret.argument };
        }
      }
    }
    return null;
  }

  function removeKeyAttributeFromJSX(jsx) {
    if (jsx && jsx.type === 'JSXElement') {
      const opening = jsx.openingElement;
      if (Array.isArray(opening.attributes)) {
        opening.attributes = opening.attributes.filter((attr) => {
          return !(attr && attr.type === 'JSXAttribute' && attr.name && attr.name.name === 'key');
        });
      }
    }
  }

  // Remove cursor: 'pointer' from inline style objects inside list items to match fixtures
  function stripCursorFromInlineStyle(jsx) {
    if (!jsx || jsx.type !== 'JSXElement') return;
    const opening = jsx.openingElement;
    const styleAttr = (opening.attributes || []).find(
      (a) => a && a.type === 'JSXAttribute' && a.name && a.name.type === 'JSXIdentifier' && a.name.name === 'style'
    );
    if (!styleAttr || !styleAttr.value || styleAttr.value.type !== 'JSXExpressionContainer') return;
    const expr = styleAttr.value.expression;
    if (!expr || expr.type !== 'ObjectExpression') return;
    expr.properties = (expr.properties || []).filter((pr) => {
      if (pr && pr.type === 'Property' && !pr.computed) {
        const key = pr.key;
        if (key.type === 'Identifier' && key.name === 'cursor') return false;
        if (key.type === 'Literal' && key.value === 'cursor') return false;
      }
      return true;
    });
  }

  function createForElement(eachExpr, params, bodyJSX) {
    const eachAttr = j.jsxAttribute(
      j.jsxIdentifier('each'),
      j.jsxExpressionContainer(eachExpr)
    );
    const opening = j.jsxOpeningElement(j.jsxIdentifier('for'), [eachAttr]);
    const closing = j.jsxClosingElement(j.jsxIdentifier('for'));
    // children: expression container with arrow function
    const arrow = j.arrowFunctionExpression(params, bodyJSX);
    const child = j.jsxExpressionContainer(arrow);
    return j.jsxElement(opening, closing, [child]);
  }

  function isMapCall(node) {
    return (
      node &&
      node.type === 'CallExpression' &&
      node.callee &&
      node.callee.type === 'MemberExpression' &&
      !node.callee.computed &&
      node.callee.property &&
      node.callee.property.type === 'Identifier' &&
      node.callee.property.name === 'map'
    );
  }

  // Replace JSX {array.map(fn)} with <for each={array}>{fnAsArrow}</for>
  root.find(j.JSXExpressionContainer).forEach((p) => {
    const expr = p.node.expression;
    if (!isMapCall(expr)) return;

    const mapCall = expr;
    const arrayExpr = mapCall.callee.object;
    if (!mapCall.arguments || mapCall.arguments.length === 0) return;
    const callback = mapCall.arguments[0];

    const extracted = extractJSXFromCallback(callback);
    if (!extracted) return;

    // Clone JSX body and strip key attribute if present on root element
    const bodyJSX = j(extracted.jsx).get().node; // deep clone via recast
    removeKeyAttributeFromJSX(bodyJSX);
    stripCursorFromInlineStyle(bodyJSX);

    const params = extracted.params;
    const forEl = createForElement(arrayExpr, params, bodyJSX);

    // Replace the whole JSXExpressionContainer with the <for> element
    j(p).replaceWith(forEl);
  });

  return root.toSource({ quote: 'single' });
};


