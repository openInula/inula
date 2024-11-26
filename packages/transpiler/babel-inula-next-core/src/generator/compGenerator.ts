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
    init(stmt, { selfId, importMap }) {
      return t.expressionStatement(
        t.assignmentExpression('const', selfId, t.callExpression(t.identifier(importMap.compBuilder), []))
      );
    },
    subComp(stmt, ctx) {
      return generate(stmt.component, ctx.bitManager);
    },
  };
}
