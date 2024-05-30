import { type types as t } from '@babel/core';
import { type ExpParticle } from '@openinula/reactivity-parser';
import ElementGenerator from '../HelperGenerators/ElementGenerator';

export default class ExpGenerator extends ElementGenerator {
  run() {
    let { content } = this.viewParticle as ExpParticle;
    content = this.alterPropView(content)!;

    const dlNodeName = this.generateNodeName();

    this.addInitStatement(this.declareExpNode(dlNodeName, content.value, content.dependenciesNode));

    if (content.depMask) {
      this.addUpdateStatements(
        content.depMask,
        this.updateExpNode(dlNodeName, content.value, content.dependenciesNode)
      );
    }

    return dlNodeName;
  }

  /**
   * @View
   * ${dlNodeName} = new ExpNode(${value}, dependenciesNode)
   */
  private declareExpNode(dlNodeName: string, value: t.Expression, dependenciesNode: t.ArrayExpression): t.Statement {
    return this.t.expressionStatement(
      this.t.assignmentExpression(
        '=',
        this.t.identifier(dlNodeName),
        this.t.newExpression(this.t.identifier(this.importMap.ExpNode), [
          value,
          dependenciesNode ?? this.t.nullLiteral(),
        ])
      )
    );
  }

  /**
   * @View
   * ${dlNodeName}.update(() => value, dependenciesNode)
   */
  private updateExpNode(dlNodeName: string, value: t.Expression, dependenciesNode: t.ArrayExpression): t.Statement {
    return this.optionalExpression(
      dlNodeName,
      this.t.callExpression(this.t.memberExpression(this.t.identifier(dlNodeName), this.t.identifier('update')), [
        this.t.arrowFunctionExpression([], value),
        dependenciesNode ?? this.t.nullLiteral(),
      ])
    );
  }
}
