import { type types as t } from '@babel/core';
import BaseGenerator from '../HelperGenerators/BaseGenerator';
import { type ForParticle, type ViewParticle } from '@openinula/reactivity-parser';

export default class ForGenerator extends BaseGenerator {
  run() {
    const { item, array, key, children, index } = this.viewParticle as ForParticle;

    const dlNodeName = this.generateNodeName();

    // ---- Declare for node
    this.addInitStatement(this.declareForNode(dlNodeName, array.value, item, index, children, array.depMask ?? 0, key));

    // ---- Update statements
    this.addUpdateStatements(array.depMask, this.updateForNode(dlNodeName, array.value, item, key));
    this.addUpdateStatementsWithoutDep(this.updateForNodeItem(dlNodeName));

    return dlNodeName;
  }

  /**
   * @View
   * ${dlNodeName} = new ForNode(${array}, ${depNum}, ${array}.map(${item} => ${key}),
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
    dlNodeName: string,
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
        this.t.identifier(dlNodeName),
        this.t.newExpression(this.t.identifier(this.importMap.ForNode), [
          array,
          this.t.numericLiteral(depNum),
          this.getForKeyStatement(array, item, key),
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
   * ${array}.map(${item} => ${key})
   */
  private getForKeyStatement(array: t.Expression, item: t.LVal, key: t.Expression): t.Expression {
    return this.t.isNullLiteral(key)
      ? key
      : this.t.callExpression(this.t.memberExpression(array, this.t.identifier('map')), [
          this.t.arrowFunctionExpression([item as any], key),
        ]);
  }

  /**
   * @View
   * ${dlNodeName}.updateArray(${array}, ${array}.map(${item} => ${key}))
   */
  private updateForNode(dlNodeName: string, array: t.Expression, item: t.LVal, key: t.Expression): t.Statement {
    return this.optionalExpression(
      dlNodeName,
      this.t.callExpression(this.t.memberExpression(this.t.identifier(dlNodeName), this.t.identifier('updateArray')), [
        array,
        ...this.updateParams.slice(1),
        this.getForKeyStatement(array, item, key),
      ])
    );
  }

  /**
   * @View
   * ${dlNodeName}?.update(changed)
   */
  private updateForNodeItem(dlNodeName: string): t.Statement {
    return this.optionalExpression(
      dlNodeName,
      this.t.callExpression(
        this.t.memberExpression(this.t.identifier(dlNodeName), this.t.identifier('update')),
        this.updateParams
      )
    );
  }
}
