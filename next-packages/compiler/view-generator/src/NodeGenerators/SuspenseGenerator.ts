import { types as t } from '@openinula/babel-api';
import { SuspenseParticle, type ContextParticle } from '@openinula/reactivity-parser';
import { importMap, nodeNameInUpdate } from '../utils/config';
import { ViewContext, ViewGenerator } from '../index';

/**
 * create comp node with props and children
 * @example
 *
 *  createSuspenseNode().fallback(() => ${fallback}).with(
 *    ${children},
 *  )
 */
export const suspenseGenerator: ViewGenerator = {
  suspense: ({ children, fallback }: SuspenseParticle, ctx: ViewContext) => {
    let childrenNode: t.Expression[] = [];
    if (children.length > 0) {
      childrenNode = children.map(child => ctx.next(child));
    }

    let fallbackNode: t.Expression = t.nullLiteral();
    if (fallback) {
      fallbackNode = fallback.value;
    }
    const suspenseNode = t.callExpression(t.identifier(importMap.createSuspenseNode), []);
    const fallbacked = t.callExpression(
      t.memberExpression(suspenseNode, t.identifier('fallback')), [
      fallbackNode,
    ]);
    return t.callExpression(t.memberExpression(fallbacked, t.identifier('with')), [t.arrayExpression(childrenNode)]);
  },
};
