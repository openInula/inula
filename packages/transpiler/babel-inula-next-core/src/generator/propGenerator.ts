import { Generator } from './index';
import { getBabelApi, types as t } from '@openinula/babel-api';
import { PropType } from '../constants';

export function propGenerator(): Generator {
  return {
    /**
     * self.addProp('name', value => name = value, 0b0001)
     * @param stmt
     * @returns prop statement
     */
    [PropType.SINGLE](stmt, { selfId, getWaveBitsById }) {
      const valueId = t.identifier('value');
      let valueAssign: t.Expression = t.assignmentExpression('=', stmt.value, valueId);
      if (stmt.destructuredNames?.length) {
        // destructure assignment should be wrapped with parentheses
        valueAssign = t.parenthesizedExpression(valueAssign);
      }

      return genAddPropStmt(selfId, stmt.name, valueId, valueAssign, getWaveBitsById(stmt.reactiveId));
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
        getWaveBitsById(stmt.reactiveId)
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
        getWaveBitsById(stmt.reactiveId)
      );
    },
  };
}

function genAddPropStmt(
  selfId: t.Identifier,
  key: string,
  valueId: t.Identifier,
  valueAssign: t.Expression,
  waveBits: number
): t.Statement | t.Statement[] {
  return t.expressionStatement(
    t.callExpression(t.memberExpression(selfId, t.identifier('addProp')), [
      t.stringLiteral(key),
      t.arrowFunctionExpression([valueId], valueAssign),
      t.numericLiteral(waveBits),
    ])
  );
}
