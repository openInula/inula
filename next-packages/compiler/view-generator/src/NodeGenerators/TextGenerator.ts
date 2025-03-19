import { type TextParticle } from '@openinula/reactivity-parser';
import { importMap, nodeNameInUpdate } from '../utils/config';
import { types as t } from '@openinula/babel-api';
import { ViewContext, ViewGenerator } from '../index';

/**
 * @example
 * ```ts
 * createTextNode(
 *   ${value},
 *   node => {
 *     setText(node, () => ${value}, ${deps}, ${reactBits})
 *   }
 * )
 * ```
 */
export const textGenerator: ViewGenerator = {
  text: ({ content }: TextParticle, ctx: ViewContext) => {
    const node = t.identifier(nodeNameInUpdate);
    function textUpdater(): t.Expression | t.SpreadElement | t.ArgumentPlaceholder {
      return t.arrowFunctionExpression(
        [],
        t.callExpression(t.identifier(importMap.setText), [
          node,
          content.value,
          content.dependenciesNode,
          t.numericLiteral(ctx.getReactBits(content.depIdBitmap)),
        ])
      );
    }

    return t.callExpression(
      t.identifier(importMap.createTextNode),
      [content.value, content.depIdBitmap ? textUpdater() : null].filter(Boolean) as t.Expression[]
    );
  },
};
