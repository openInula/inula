import { types as t } from '@openInula/babel-api';
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
    const updateProps: t.Statement[] = [];
    const node = t.identifier(nodeNameInUpdate);

    const properties = Object.entries(props).map(([key, value]) => {
      ctx.wrapUpdate(value.value);

      if (value.depIdBitmap) {
        updateProps.push(
          genUpdateProp(node, key, value.value, ctx.getReactBits(value.depIdBitmap), value.dependenciesNode)
        );
      }
      return t.objectProperty(t.stringLiteral(key), value.value);
    });

    if (children.length) {
      const childrenNode = children.map(child => ctx.next(child));
      properties.push(
        t.objectProperty(
          t.stringLiteral('children'),
          t.callExpression(t.identifier(importMap.slice), [
            t.arrowFunctionExpression([], t.arrayExpression(childrenNode)),
            t.identifier('self'),
          ])
        )
      );
    }
    const compNode = t.callExpression(tag, [t.objectExpression(properties)]);

    const updater = updateProps.length
      ? t.arrowFunctionExpression([node], t.blockStatement(updateProps))
      : t.nullLiteral();

    return t.callExpression(t.identifier(importMap.createCompNode), [compNode, updater]);
  },
};
