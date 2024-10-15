import { type types as t } from '@babel/core';
import BaseGenerator from '../HelperGenerators/BaseGenerator';
import { type ForParticle, type ViewParticle } from '@openinula/reactivity-parser';
import { typeNode } from '../shard';
import { InulaNodeType } from '@openinula/next-shared';

export default class ForGenerator extends BaseGenerator {
  run() {
    const { item, array, key, children, index } = this.viewParticle as ForParticle;

    const nodeName = this.generateNodeName();

    // ---- Declare for node
    this.addInitStatement(this.declareForNode(nodeName, array.value, item, index, children, array.depMask ?? 0, key));

    // ---- Update statements
    this.addUpdateStatements(array.depMask, this.updateForNode(nodeName, array.value, item, key));
    this.addUpdateStatementsWithoutDep(this.updateForNodeItem(nodeName));

    return nodeName;
  }

  /**
   * @View
   * ${nodeName} = createNode(InulaNodeType.For, ${array}, ${depNum}, ${array}.map(${item} => ${key}),
   * ((${item}, $updateArr, $idx) => {
   *   $updateArr[$idx] = (changed, $item) => {
   *      ${item} = $item
   *      {$updateStatements}
   *   }
   *   ${children}
   *   return [...${topLevelNodes}]
   * })
   */
  private declareForNode(
    nodeName: string,
    array: t.Expression,
    item: t.LVal,
    index: t.Identifier | null,
    children: ViewParticle[],
    depNum: number,
    key: t.Expression
  ): t.Statement {
    // ---- NodeFunc
    const [childStatements, topLevelNodes, updateStatements, nodeIdx] = this.generateChildren(children, false, true);
    const idxId = index ?? this.t.identifier('$idx');
    // ---- Update func
    childStatements.unshift(
      ...this.declareNodes(nodeIdx),
      this.t.expressionStatement(
        this.t.assignmentExpression(
          '=',
          this.t.memberExpression(this.t.identifier('$updateArr'), idxId, true),
          this.t.arrowFunctionExpression(
            [...this.updateParams, this.t.identifier('$item')],
            this.t.blockStatement([
              this.t.expressionStatement(this.t.assignmentExpression('=', item, this.t.identifier('$item'))),
              ...this.geneUpdateBody(updateStatements).body,
            ])
          )
        )
      )
    );

    // ---- Return statement
    childStatements.push(this.generateReturnStatement(topLevelNodes));

    return this.t.expressionStatement(
      this.t.assignmentExpression(
        '=',
        this.t.identifier(nodeName),
        this.t.callExpression(this.t.identifier(this.importMap.createNode), [
          typeNode(InulaNodeType.For),
          array,
          this.t.numericLiteral(depNum),
          this.getForKeyStatement(array, item, key, index),
          this.t.arrowFunctionExpression(
            [item as any, idxId, this.t.identifier('$updateArr')],
            this.t.blockStatement(childStatements)
          ),
        ])
      )
    );
  }

  /**
   * @View
   * ${array}.map(${item, index} => ${key})
   */
  private getForKeyStatement(
    array: t.Expression,
    item: t.LVal,
    key: t.Expression,
    index: t.Identifier | null
  ): t.Expression {
    const params = [item as any];
    if (index) {
      params.push(index);
    }
    return this.t.isNullLiteral(key)
      ? key
      : this.t.callExpression(this.t.memberExpression(array, this.t.identifier('map')), [
          this.t.arrowFunctionExpression(params, key),
        ]);
  }

  /**
   * @View
   * updateNode(${nodeName}, ${array}, ${array}.map(${item} => ${key}))
   */
  private updateForNode(nodeName: string, array: t.Expression, item: t.LVal, key: t.Expression): t.Statement {
    return this.optionalExpression(
      nodeName,
      this.t.callExpression(this.t.identifier(this.importMap.updateNode), [
        this.t.identifier(nodeName),
        array,
        ...this.updateParams.slice(1),
        this.getForKeyStatement(array, item, key),
      ])
    );
  }

  /**
   * @View
   * updateChildren(${nodeName}, changed)
   */
  private updateForNodeItem(nodeName: string): t.Statement {
    return this.optionalExpression(
      nodeName,
      this.t.callExpression(this.t.identifier(this.importMap.updateChildren), [
        this.t.identifier(nodeName),
        ...this.updateParams,
      ])
    );
  }
}
