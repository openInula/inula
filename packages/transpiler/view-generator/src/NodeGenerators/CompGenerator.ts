import { types as t } from '@openinula/babel-api';
import { type CompParticle } from '@openinula/reactivity-parser';
import { importMap, nodeNameInUpdate } from '../utils/config';
import { ViewContext, ViewGenerator } from '../index';

function genUpdateProp(
  nodeId: t.Identifier,
  key: string,
  value: t.Expression,
  reactBits: number,
  dependenciesNode: t.ArrayExpression
) {
  return t.expressionStatement(
    t.callExpression(t.memberExpression(nodeId, t.identifier('updateProp')), [
      t.stringLiteral(key),
      t.arrowFunctionExpression([], value),
      dependenciesNode,
      t.numericLiteral(reactBits),
    ])
  );
}

/**
 * CompGenerator
 * create comp node with props and children
 * @example
 *
 *  createCompNode(UserProfile({
 *    name: 'John',
 *    age: count,
 *    contact: {
 *      phone: '1234567890',
 *      email: 'john@example.com'
 *    },
 *    height: count * 100,
 *    weight: double * 10,
 *  }), node => {
 *    node.updateProp('age', () => count, [count], 0b0001);
 *    node.updateProp('height', () => count * 100, [count], 0b0001);
 *    node.updateProp('weight', () => double * 10, [double], 0b0010);
 *    node.updateProp('contact', () => ({
 *      phone: `1234567890+${count}`,
 *      email: `john+${count}@example.com`
 *    }), [count], 0b0001);
 *  })
 */
export const compGenerator: ViewGenerator = {
  comp: ({ tag, props, children }: CompParticle, ctx: ViewContext) => {
    if (t.isIdentifier(tag) && tag.name === 'Portal') {
      return createPortal(props, children, ctx);
    }

    const updateProps: t.Statement[] = [];
    const node = t.identifier(nodeNameInUpdate);

    const properties = Object.entries(props).map(([key, { value, depIdBitmap, dependenciesNode }]) => {
      let initValue = value;
      if (key === 'ref') {
        initValue = wrapRefHandler(value);
      }
      ctx.wrapUpdate(value);

      if (depIdBitmap) {
        updateProps.push(genUpdateProp(node, key, value, ctx.getReactBits(depIdBitmap), dependenciesNode));
      }
      return t.objectProperty(t.stringLiteral(key), initValue);
    });

    if (children.length) {
      const childrenNode = children.map(child => ctx.next(child));
      properties.push(
        t.objectProperty(
          t.stringLiteral('children'),
          t.callExpression(t.identifier(importMap.createChildren), [
            t.arrowFunctionExpression([], t.arrayExpression(childrenNode)),
            t.identifier('$$self'),
          ])
        )
      );
    }
    const propsNode = t.objectExpression(properties);

    const updater = updateProps.length
      ? t.arrowFunctionExpression([node], t.blockStatement(updateProps))
      : t.nullLiteral();

    return t.callExpression(t.identifier(importMap.createCompNode), [tag, propsNode, updater]);
  },
};

/**
 * @example
 * ```js
 * createPortal({
 *  target: document.body,
 *  ...${children}
 * })
 * ```
 */
function createPortal(
  props: Record<string, import('C:/workspace/inula/packages/transpiler/reactivity-parser/dist/index').DependencyProp>,
  children: import('C:/workspace/inula/packages/transpiler/reactivity-parser/dist/index').ViewParticle[],
  ctx: ViewContext
): t.Expression {
  return t.callExpression(t.identifier(importMap.createPortal), [
    t.objectExpression(
      Object.entries(props).map(([key, { value }]) => {
        return t.objectProperty(t.stringLiteral(key), value);
      })
    ),
    ...children.map(child => ctx.next(child)),
  ]);
}

/**
 * @examples
 * ````js
 * function ($el) {
 *  typeof ref === "function" ? ref($el) : ref = $el;
 * }
 *```
 * @param refVal
 */
function wrapRefHandler(refVal: t.Expression) {
  const refInput = t.identifier('$el');
  return t.functionExpression(
    null,
    [refInput],
    t.blockStatement([
      t.expressionStatement(
        t.conditionalExpression(
          t.binaryExpression('===', t.unaryExpression('typeof', refVal, true), t.stringLiteral('function')),
          t.callExpression(refVal, [refInput]),
          t.assignmentExpression('=', refVal as t.LVal, refInput)
        )
      ),
    ])
  );
}
