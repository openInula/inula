import { Generator } from './index';

export function rawStmtGenerator(): Generator {
  return {
    raw(stmt, ctx) {
      ctx.wrapUpdate(stmt.value);
      return stmt.value;
    },
  };
}
