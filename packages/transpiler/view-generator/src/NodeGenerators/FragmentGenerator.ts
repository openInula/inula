import { type FragmentParticle } from '@openinula/reactivity-parser';
import { types as t } from '@openinula/babel-api';
import { ViewContext, ViewGenerator } from '../index';
import { importMap } from '../utils/config';

/**
 * @example
 * const a = createFragmentNode(${children})
 */
export const fragmentGenerator: ViewGenerator = {
  fragment: ({ children }: FragmentParticle, ctx: ViewContext) => {
    return t.callExpression(
      t.identifier(importMap.createFragmentNode),
      children.map(child => ctx.next(child))
    );
  },
};
