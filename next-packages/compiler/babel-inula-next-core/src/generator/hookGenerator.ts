import { generateView } from '@openinula/view-generator';
import { Generator } from './index';
import { types as t } from '@openinula/babel-api';
/**
 * @example
 * return self.init(() => ${value}, () =>[${deps}], ${reactBits})
 */
export function hookGenerator(): Generator {
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
        t.variableDeclarator(selfId, t.callExpression(t.identifier(importMap.hookBuilder), params)),
      ]);
    },
    hookReturn(stmt, ctx) {
      const params: t.Expression[] = [t.arrowFunctionExpression([], stmt.value)];
      if (stmt.dependenciesNode) {
        params.push(t.arrowFunctionExpression([], stmt.dependenciesNode));
        params.push(t.numericLiteral(ctx.getReactBits(stmt.depIdBitmap!)));
      }

      return t.returnStatement(t.callExpression(t.memberExpression(ctx.selfId, t.identifier('init')), params));
    },
  };
}
