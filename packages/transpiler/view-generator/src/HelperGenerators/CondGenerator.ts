import { type types as t } from '@babel/core';
import BaseGenerator from './BaseGenerator';
import { Bitmap } from '@openinula/reactivity-parser';

export default class CondGenerator extends BaseGenerator {
  /**
   * @View
   * $thisCond.cond = ${idx}
   */
  geneCondIdx(idx: number): t.ExpressionStatement {
    return this.t.expressionStatement(
      this.t.assignmentExpression(
        '=',
        this.t.memberExpression(this.t.identifier('$thisCond'), this.t.identifier('cond')),
        this.t.numericLiteral(idx)
      )
    );
  }

  /**
   * @View
   * if ($thisCond.cond === ${idx}) {
   *  $thisCond.didntChange = true
   *  return []
   * }
   */
  geneCondCheck(idx: number): t.IfStatement {
    return this.t.ifStatement(
      this.t.binaryExpression(
        '===',
        this.t.memberExpression(this.t.identifier('$thisCond'), this.t.identifier('cond')),
        this.t.numericLiteral(idx)
      ),
      this.t.blockStatement([
        this.t.expressionStatement(
          this.t.assignmentExpression(
            '=',
            this.t.memberExpression(this.t.identifier('$thisCond'), this.t.identifier('didntChange')),
            this.t.booleanLiteral(true)
          )
        ),
        this.t.returnStatement(this.t.arrayExpression([])),
      ])
    );
  }

  /**
   * @View
   * ${dlNodeName}?.updateCond(key)
   */
  updateCondNodeCond(dlNodeName: string): t.Statement {
    return this.optionalExpression(
      dlNodeName,
      this.t.callExpression(this.t.memberExpression(this.t.identifier(dlNodeName), this.t.identifier('updateCond')), [
        ...this.updateParams.slice(1),
      ])
    );
  }

  /**
   * @View
   * ${dlNodeName}?.update(changed)
   */
  updateCondNode(dlNodeName: string): t.Statement {
    return this.optionalExpression(
      dlNodeName,
      this.t.callExpression(
        this.t.memberExpression(this.t.identifier(dlNodeName), this.t.identifier('update')),
        this.updateParams
      )
    );
  }

  /**
   * @View
   * ${dlNodeName} = new CondNode(${depNum}, ($thisCond) => {})
   */
  declareCondNode(dlNodeName: string, condFunc: t.BlockStatement, depMask: Bitmap): t.Statement {
    return this.t.expressionStatement(
      this.t.assignmentExpression(
        '=',
        this.t.identifier(dlNodeName),
        this.t.newExpression(this.t.identifier(this.importMap.CondNode), [
          this.t.numericLiteral(depMask),
          this.t.arrowFunctionExpression([this.t.identifier('$thisCond')], condFunc),
        ])
      )
    );
  }

  /**
   * return $thisCond.cond === ${branchIdx} ? [${nodeNames}] : $thisCond.updateCond()
   */
  geneCondReturnStatement(nodeNames: string[], branchIdx: number): t.Statement {
    // ---- If the returned cond is not the last one,
    //      it means it's been altered in the childrenNodes,
    //      so we update the cond again to get the right one
    return this.t.returnStatement(
      this.t.conditionalExpression(
        this.t.binaryExpression(
          '===',
          this.t.memberExpression(this.t.identifier('$thisCond'), this.t.identifier('cond')),
          this.t.numericLiteral(branchIdx)
        ),
        this.t.arrayExpression(nodeNames.map(name => this.t.identifier(name))),
        this.t.callExpression(
          this.t.memberExpression(this.t.identifier('$thisCond'), this.t.identifier('updateCond')),
          this.updateParams.slice(1)
        )
      )
    );
  }
}
