import { type types as t } from '@babel/core';
import BaseGenerator from './BaseGenerator';
import { Bitmap } from '@openinula/reactivity-parser';
import { typeNode } from '../shard';
import { InulaNodeType } from '@openinula/next-shared';

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
   * updateNode(${nodeName}, key)
   */
  updateCondNodeCond(nodeName: string): t.Statement {
    return this.optionalExpression(
      nodeName,
      this.t.callExpression(this.t.identifier(this.importMap.updateNode), [
        this.t.identifier(nodeName),
        ...this.updateParams.slice(1),
      ])
    );
  }

  /**
   * @View
   * updateChildren(${nodeName}, changed)
   */
  updateCondNode(nodeName: string): t.Statement {
    return this.optionalExpression(
      nodeName,
      this.t.callExpression(this.t.identifier(this.importMap.updateChildren), [
        this.t.identifier(nodeName),
        ...this.updateParams,
      ])
    );
  }

  /**
   * @View
   * ${nodeName} = createNode(InulaNodeType.Cond, ${depNum}, ($thisCond) => {})
   */
  declareCondNode(nodeName: string, condFunc: t.BlockStatement, depMask: Bitmap): t.Statement {
    return this.t.expressionStatement(
      this.t.assignmentExpression(
        '=',
        this.t.identifier(nodeName),
        this.t.callExpression(this.t.identifier(this.importMap.createNode), [
          typeNode(InulaNodeType.Cond),
          this.t.numericLiteral(depMask),
          this.t.arrowFunctionExpression([this.t.identifier('$thisCond')], condFunc),
        ])
      )
    );
  }

  /**
   * return $thisCond.cond === ${branchIdx} ? [${nodeNames}] : updateNode($thisCond)
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
        this.t.callExpression(this.t.identifier(this.importMap.updateNode), [
          this.t.identifier('$thisCond'),
          ...this.updateParams.slice(1),
        ])
      )
    );
  }
}
