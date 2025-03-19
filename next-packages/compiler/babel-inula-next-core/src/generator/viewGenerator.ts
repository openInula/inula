import { generateView } from '@openinula/view-generator';
import { Generator, GeneratorContext } from './index';
import { types as t } from '@openinula/babel-api';
import { defaultAttributeMap, alterAttributeMap } from '../constants';
/**
 * @example
 * return self.prepare().init(
 *   ${view}
 * )
 */
export function viewGenerator(): Generator {
  return {
    viewReturn(stmt, ctx) {
      const templates: [string, t.Expression][] = [];
      if (stmt.value === null) {
        return genReturnStmt(t.nullLiteral(), ctx);
      }

      const view = generateView(stmt.value, {
        attributeMap: defaultAttributeMap,
        alterAttributeMap,
        getReactBits: ctx.getReactBits,
        importMap: ctx.importMap,
        templates: templates,
        wrapUpdate: ctx.wrapUpdate,
        genTemplateKey: (name: string) => {
          const programScope = ctx.current.fnNode.scope.getProgramParent();
          return programScope.generateUid(name);
        },
      });

      ctx.hoist(
        templates.map(([name, expr]) =>
          t.variableDeclaration('const', [t.variableDeclarator(t.identifier(name), expr)])
        )
      );

      return genReturnStmt(view, ctx);
    },
  };
}

function genReturnStmt(view: t.Expression, ctx: GeneratorContext): t.Statement {
  const prepareCall = t.callExpression(t.memberExpression(ctx.selfId, t.identifier('prepare')), []);

  return t.returnStatement(t.callExpression(t.memberExpression(prepareCall, t.identifier('init')), [view]));
}
