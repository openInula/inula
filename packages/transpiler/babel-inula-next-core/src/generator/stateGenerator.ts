import { Generator } from './index';
import { types as t } from '@babel/core';
import { importMap } from '../constants';

export function stateGenerator(): Generator {
  return {
    state(stmt) {
      return t.variableDeclaration('let', [stmt.node]);
    },
    /*
     * Derived includes two part:
     * - variable declarement
     * - upate call expression
     * e.g.
     * let double: any;
     * self.deriveState(() => double = count * 2, () => [count], 0b0010);
     */
    derived(stmt, { selfId, getReactBits }) {
      const derivedDeclaration = t.variableDeclaration(
        'let',
        stmt.ids.map(id => t.variableDeclarator(t.identifier(id)))
      );

      const updateCall = t.expressionStatement(
        t.callExpression(t.memberExpression(selfId, t.identifier('deriveState')), [
          // update function
          t.arrowFunctionExpression([], t.parenthesizedExpression(t.assignmentExpression('=', stmt.lVal, stmt.value))),
          // dependencies node
          t.arrowFunctionExpression([], stmt.dependency.dependenciesNode),
          // wave bits
          t.numericLiteral(getReactBits(stmt.dependency.depIdBitmap)),
        ])
      );
      return [derivedDeclaration, updateCall];
    },
  };
}
