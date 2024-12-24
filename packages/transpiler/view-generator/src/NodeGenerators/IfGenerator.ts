import { type IfParticle, ViewParticle, DependencyValue } from '@openinula/reactivity-parser';
import { ViewContext, ViewGenerator } from '../index';
import { types as t } from '@openinula/babel-api';
import { importMap, nodeNameInUpdate } from '../utils/config';

/**
 * @View
 * if (node.branch(${idx})) return []
 */
function geneCondCheck(node: t.Identifier, idx: number): t.IfStatement {
  return t.ifStatement(
    t.callExpression(t.memberExpression(node, t.identifier('branch')), [t.numericLiteral(idx)]),
    t.returnStatement(t.arrayExpression([]))
  );
}
/**
 * @View
 * return ${children}
 */
function geneIfStatement(test: t.Expression, body: t.Statement[], alternate: t.Statement): t.IfStatement {
  return t.ifStatement(test, t.blockStatement(body), alternate);
}

function geneCondReturnStatement(children: ViewParticle[], ctx: ViewContext): t.Statement {
  return t.returnStatement(t.arrayExpression(children.map(p => ctx.next(p))));
}

/**
 * @example
 * node.cachedCondition(0, () => show, [show])
 */
function geneCondition(node: t.Identifier, idx: number, condition: DependencyValue<t.Expression>) {
  return t.callExpression(t.memberExpression(node, t.identifier('cachedCondition')), [
    t.numericLiteral(idx),
    t.arrowFunctionExpression([], condition.value),
    condition.dependenciesNode,
  ]);
}

/**
 * @example
 * ```ts
 * createConditionalNode(
 *   node => {
 *      if (node.cachedCondition(0, () => show, [show])) {
 *        if (node.branch(0)) return [];
 *        return ${children}
 *      } else {
 *        if (node.branch(1)) return [];
 *        return ${children}
 *      }
 *   },
 *   0b0001
 * )
 * ```
 */
export const ifGenerator: ViewGenerator = {
  if: ({ branches }: IfParticle, ctx: ViewContext) => {
    const node = t.identifier(nodeNameInUpdate);

    // ---- If no else statement, add one
    if (
      !t.isBooleanLiteral(branches[branches.length - 1].condition.value, {
        value: true,
      })
    ) {
      branches.push({
        condition: {
          value: t.booleanLiteral(true),
          depIdBitmap: 0,
          dependenciesNode: t.arrayExpression([]),
        },
        children: [],
      });
    }
    let reactBits = 0;
    const ifStatement = branches.reverse().reduce<any>((acc, { condition, children }, i) => {
      const idx = branches.length - i - 1;
      // ---- Generate children
      const childStatements = [geneCondCheck(node, idx), geneCondReturnStatement(children, ctx)];

      // ---- else statement
      if (i === 0) return t.blockStatement(childStatements);

      reactBits |= ctx.getReactBits(condition.depIdBitmap);
      return geneIfStatement(geneCondition(node, idx, condition), childStatements, acc);
    }, undefined);

    return t.callExpression(t.identifier(importMap.createConditionalNode), [
      t.arrowFunctionExpression([node], t.blockStatement([ifStatement])),
      t.numericLiteral(reactBits),
    ]);
  },
};
