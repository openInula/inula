import { Generator } from './index';
import { getBabelApi, types as t } from '@openinula/babel-api';
import { wrapUpdate } from './utils';

export function functionalMacroGenerator(): Generator {
  return {
    /**
     * self.watch(() => {
     *  console.log(count);
     * }, () => [count], 0b1);
     * @param stmt
     * @returns
     */
    watch(stmt, { selfId, getWaveBits, getReactBits }) {
      const watchFnBody = stmt.callback.node;
      wrapUpdate(selfId, watchFnBody, getWaveBits);
      return t.expressionStatement(
        t.callExpression(t.memberExpression(selfId, t.identifier('watch')), [
          watchFnBody,
          stmt.dependency ? t.arrowFunctionExpression([], stmt.dependency.dependenciesNode) : t.nullLiteral(),
          t.numericLiteral(getReactBits(stmt.dependency?.depIdBitmap ?? 0)),
        ])
      );
    },
    lifecycle(stmt, { selfId, getWaveBits }) {
      const fnBody = stmt.callback.node;
      wrapUpdate(selfId, fnBody, getWaveBits);
      return t.expressionStatement(
        t.callExpression(t.memberExpression(selfId, t.identifier(stmt.lifeCycle)), [fnBody])
      );
    },
  };
}
