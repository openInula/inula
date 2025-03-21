import { generate, generateSelfId, Generator } from './index';
import { getBabelApi, types as t } from '@openinula/babel-api';

export function compGenerator(): Generator {
  return {
    /**
     * const self = compBuilder()
     * @param stmt
     * @param ctx
     * @returns
     */
    init(stmt, { selfId, importMap, parentId }) {
      const params = parentId ? [parentId] : [];

      return t.variableDeclaration('const', [
        t.variableDeclarator(selfId, t.callExpression(t.identifier(importMap.compBuilder), params)),
      ]);
    },
    subComp(stmt, ctx) {
      return generate(stmt.component, ctx.bitManager, ctx.hoist, ctx.selfId);
    },
  };
}
