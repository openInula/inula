import { Generator } from './index';
import { getBabelApi, types as t } from '@openinula/babel-api';

export function functionalMacroAnalyze(): Generator {
  return {
    state(stmt) {
      return t.variableDeclaration('let', [stmt.node]);
    },
  };
}
