import { type ExpParticle } from '@openinula/reactivity-parser';
import { types as t } from '@openinula/babel-api';
import { ViewContext, ViewGenerator } from '../index';
import { importMap } from '../HelperGenerators/BaseGenerator';

/**
 * @example
 * const a = createExpNode(() => 1, [], 0b001)
 */
export const expGenerator: ViewGenerator = {
  exp: ({ content }: ExpParticle, ctx: ViewContext) => {
    return t.callExpression(t.identifier(importMap.createExpNode), [
      t.arrowFunctionExpression([], content.value),
      t.arrowFunctionExpression([], content.dependenciesNode),
      t.numericLiteral(ctx.getReactBits(content.depIdBitmap)),
    ]);
  },
};
