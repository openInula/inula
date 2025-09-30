'use strict';

// Event handling codemod per docs/event.md
// - For JSX intrinsic elements 'input' and 'textarea', rename onChange -> onInput
// - Leave other events as-is (click, submit, key events already match)

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  function isIntrinsicInput(nameNode) {
    // <input> or <textarea>
    if (!nameNode) return false;
    if (nameNode.type === 'JSXIdentifier') {
      const n = nameNode.name;
      return n === 'input' || n === 'textarea';
    }
    return false;
  }

  root.find(j.JSXOpeningElement).forEach((path) => {
    const opening = path.node;
    if (!isIntrinsicInput(opening.name)) return;

    const attrs = opening.attributes || [];
    let hasOnInput = attrs.some(
      (a) => a && a.type === 'JSXAttribute' && a.name && a.name.type === 'JSXIdentifier' && a.name.name === 'onInput'
    );
    attrs.forEach((attr) => {
      if (
        attr &&
        attr.type === 'JSXAttribute' &&
        attr.name &&
        attr.name.type === 'JSXIdentifier' &&
        attr.name.name === 'onChange'
      ) {
        if (!hasOnInput) {
          // Rename onChange -> onInput
          attr.name.name = 'onInput';
          hasOnInput = true;
        } else {
          // Already has onInput; remove the onChange to avoid duplicates
          attr.name.name = 'onInput';
        }
      }
    });
  });

  // Normalize simple self-assign increments/decrements to ++/-- wherever they appear
  root
    .find(j.AssignmentExpression, { operator: '=' })
    .forEach((p) => {
      const left = p.node.left;
      const right = p.node.right;
      if (!left || !right || right.type !== 'BinaryExpression') return;
      if (left.type !== 'Identifier') return;
      const ident = left.name;
      const { operator, left: rLeft, right: rRight } = right;
      const isPlusOne =
        operator === '+' &&
        ((rLeft.type === 'Identifier' && rLeft.name === ident && rRight.type === 'Literal' && rRight.value === 1) ||
          (rRight.type === 'Identifier' && rRight.name === ident && rLeft.type === 'Literal' && rLeft.value === 1));
      const isMinusOne =
        operator === '-' &&
        rLeft.type === 'Identifier' &&
        rLeft.name === ident &&
        rRight.type === 'Literal' &&
        rRight.value === 1;
      if (isPlusOne) {
        j(p).replaceWith(j.updateExpression('++', j.identifier(ident), false));
      } else if (isMinusOne) {
        j(p).replaceWith(j.updateExpression('--', j.identifier(ident), false));
      }
    });

  return root.toSource({ quote: 'single' });
};


