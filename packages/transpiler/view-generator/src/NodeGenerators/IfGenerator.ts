import { type types as t } from '@babel/core';
import { type IfParticle, type IfBranch, Bitmap } from '@openinula/reactivity-parser';
import CondGenerator from '../HelperGenerators/CondGenerator';

export default class IfGenerator extends CondGenerator {
  run() {
    const { branches } = this.viewParticle as IfParticle;
    const deps = branches.reduce((acc, { condition }) => {
      return condition.depMask ? acc | condition.depMask : acc;
    }, 0);

    // ---- declareIfNode
    const nodeName = this.generateNodeName();
    this.addInitStatement(this.declareIfNode(nodeName, branches, deps));

    this.addUpdateStatements(deps, this.updateCondNodeCond(nodeName));
    this.addUpdateStatementsWithoutDep(this.updateCondNode(nodeName));

    return nodeName;
  }

  /**
   * @View
   * if (${test}) { ${body} } else { ${alternate} }
   */
  geneIfStatement(test: t.Expression, body: t.Statement[], alternate: t.Statement): t.IfStatement {
    return this.t.ifStatement(test, this.t.blockStatement(body), alternate);
  }

  /**
   * @View
   * const ${nodeName} = new IfNode(($thisCond) => {
   *   if (cond1) {
   *    if ($thisCond.cond === 0) return
   *    ${children}
   *    $thisCond.cond = 0
   *    return [nodes]
   *   } else if (cond2) {
   *    if ($thisCond.cond === 1) return
   *    ${children}
   *    $thisCond.cond = 1
   *    return [nodes]
   *   }
   * })
   */
  private declareIfNode(nodeName: string, branches: IfBranch[], depMask: Bitmap): t.Statement {
    // ---- If no else statement, add one
    if (
      !this.t.isBooleanLiteral(branches[branches.length - 1].condition.value, {
        value: true,
      })
    ) {
      branches.push({
        condition: {
          value: this.t.booleanLiteral(true),
          depMask: 0,
          allDepBits: [],
          dependenciesNode: this.t.arrayExpression([]),
        },
        children: [],
      });
    }
    const ifStatement = branches.reverse().reduce<any>((acc, { condition, children }, i) => {
      const idx = branches.length - i - 1;
      // ---- Generate children
      const [childStatements, topLevelNodes, updateStatements, nodeIdx] = this.generateChildren(children, false, true);

      // ---- Even if no updateStatements, we still need reassign an empty updateFunc
      //      to overwrite the previous one
      /**
       * $thisCond.updateFunc = (changed) => { ${updateStatements} }
       */
      const updateNode = this.t.expressionStatement(
        this.t.assignmentExpression(
          '=',
          this.t.memberExpression(this.t.identifier('$thisCond'), this.t.identifier('updateFunc')),
          this.t.arrowFunctionExpression(this.updateParams, this.geneUpdateBody(updateStatements))
        )
      );

      // ---- Update func
      childStatements.unshift(...this.declareNodes(nodeIdx), updateNode);

      // ---- Check cond and update cond
      childStatements.unshift(this.geneCondCheck(idx), this.geneCondIdx(idx));

      // ---- Return statement
      childStatements.push(this.geneCondReturnStatement(topLevelNodes, idx));

      // ---- else statement
      if (i === 0) return this.t.blockStatement(childStatements);

      return this.geneIfStatement(condition.value, childStatements, acc);
    }, undefined);

    return this.declareCondNode(nodeName, this.t.blockStatement([ifStatement]), depMask);
  }
}
