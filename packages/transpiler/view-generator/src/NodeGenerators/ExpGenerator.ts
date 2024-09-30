import { type types as t } from '@babel/core';
import { type ExpParticle } from '@openinula/reactivity-parser';
import ElementGenerator from '../HelperGenerators/ElementGenerator';
import { typeNode } from '../shard';
import { InulaNodeType } from '@openinula/next-shared';

export default class ExpGenerator extends ElementGenerator {
  run() {
    let { content } = this.viewParticle as ExpParticle;
    content = this.alterPropView(content)!;

    const nodeName = this.generateNodeName();

    this.addInitStatement(this.declareExpNode(nodeName, content.value, content.dependenciesNode));

    if (content.depMask) {
      this.addUpdateStatements(content.depMask, this.updateExpNode(nodeName, content.value, content.dependenciesNode));
    }

    return nodeName;
  }

  /**
   * @View
   * ${nodeName} = createNode(InulaNodeType.Exp, () => ${value}, dependenciesNode)
   */
  private declareExpNode(nodeName: string, value: t.Expression, dependenciesNode: t.ArrayExpression): t.Statement {
    return this.t.expressionStatement(
      this.t.assignmentExpression(
        '=',
        this.t.identifier(nodeName),
        this.t.callExpression(this.t.identifier(this.importMap.createNode), [
          typeNode(InulaNodeType.Exp),
          this.t.arrowFunctionExpression([], value),
          dependenciesNode ?? this.t.nullLiteral(),
        ])
      )
    );
  }

  /**
   * @View
   * updateNode(${nodeName}, value, dependenciesNode)
   */
  private updateExpNode(nodeName: string, value: t.Expression, dependenciesNode: t.ArrayExpression): t.Statement {
    return this.optionalExpression(
      nodeName,
      this.t.callExpression(this.t.identifier(this.importMap.updateNode), [
        this.t.identifier(nodeName),
        this.t.arrowFunctionExpression([], value),
        dependenciesNode ?? this.t.nullLiteral(),
      ])
    );
  }
}
