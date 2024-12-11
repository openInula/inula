import { Generator } from './index';
import { types as t } from '@openinula/babel-api';
import { PropType, importMap } from '../constants';
import { CTX_PROPS, PARAM_PROPS, PropsSource } from '../analyze/types';

export function propGenerator(): Generator {
  return {
    /**
     * self.addProp('name', value => name = value, 0b0001)
     * @param stmt
     * @param selfId
     * @param getWaveBitsById
     * @returns prop statement
     */
    [PropType.SINGLE](stmt, { selfId, getWaveBitsById }) {
      const valueId = t.identifier('value');
      const right = stmt.defaultValue
        ? t.callExpression(t.identifier(importMap.withDefault), [valueId, stmt.defaultValue])
        : valueId;

      let valueAssign: t.Expression = t.assignmentExpression('=', stmt.value, right);
      if (stmt.isDesctructured) {
        // destructure assignment should be wrapped with parentheses
        valueAssign = t.parenthesizedExpression(valueAssign);
      }

      return genAddPropStmt(selfId, stmt.name, valueId, valueAssign, getWaveBitsById(stmt.reactiveId), stmt.source);
    },
    /**
     * self.addProp('$rest$', value => rest = value, 0b0010)
     * @param stmt
     * @returns prop statement
     */
    [PropType.REST](stmt, { selfId, getWaveBitsById }) {
      const valueId = t.identifier('value');
      return genAddPropStmt(
        selfId,
        '$rest$',
        valueId,
        t.assignmentExpression('=', t.identifier('$rest$'), valueId),
        getWaveBitsById(stmt.reactiveId),
        stmt.source
      );
    },
    /**
     * self.addProp('$whole$', value => whole = value, 0b0010)
     * @param stmt
     * @returns prop statement
     */
    [PropType.WHOLE](stmt, { selfId, getWaveBitsById }) {
      const valueId = t.identifier('value');
      return genAddPropStmt(
        selfId,
        '$whole$',
        valueId,
        t.assignmentExpression('=', t.identifier('$whole$'), valueId),
        getWaveBitsById(stmt.reactiveId),
        stmt.source
      );
    },
    /**
     * @example
     *   let {
     *    name, // 0b0001
     *    age,  // 0b0010
     *    contact: {phone, email}, // 0b0100
     *    // ...rest  // 0b1000
     *  } = useContext(UserContext, self);
     */
    useContext(stmt, { selfId }) {
      return t.variableDeclaration('let', [
        t.variableDeclarator(stmt.lVal, t.callExpression(t.identifier(importMap.useContext), [stmt.context, selfId])),
      ]);
    },
  };
}

function genAddPropStmt(
  selfId: t.Identifier,
  key: string,
  valueId: t.Identifier,
  valueAssign: t.Expression,
  waveBits: number,
  source: PropsSource
): t.Statement | t.Statement[] {
  const apiName = source === CTX_PROPS ? 'addContext' : 'addProp';
  return t.expressionStatement(
    t.callExpression(t.memberExpression(selfId, t.identifier(apiName)), [
      t.stringLiteral(key),
      t.arrowFunctionExpression([valueId], valueAssign),
      t.numericLiteral(waveBits),
    ])
  );
}
