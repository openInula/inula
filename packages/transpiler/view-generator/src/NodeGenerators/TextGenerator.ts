import { type types as t } from '@babel/core';
import { type TextParticle } from '@openinula/reactivity-parser';
import BaseGenerator from '../HelperGenerators/BaseGenerator';

export default class TextGenerator extends BaseGenerator {
  run() {
    const { content } = this.viewParticle as TextParticle;

    const nodeName = this.generateNodeName();

    this.addInitStatement(this.declareTextNode(nodeName, content.value, content.dependenciesNode));

    if (content.depMask) {
      this.addUpdateStatements(content.depMask, this.updateTextNode(nodeName, content.value, content.dependenciesNode));
    }

    return nodeName;
  }

  /**
   * @View
   * ${nodeName} = createTextNode(${value}, ${deps})
   */
  private declareTextNode(nodeName: string, value: t.Expression, dependenciesNode: t.Expression): t.Statement {
    return this.t.expressionStatement(
      this.t.assignmentExpression(
        '=',
        this.t.identifier(nodeName),
        this.t.callExpression(this.t.identifier(this.importMap.createTextNode), [value, dependenciesNode])
      )
    );
  }

  /**
   * @View
   * ${nodeName} && updateText(${nodeName}, () => ${value}, ${deps})
   */
  private updateTextNode(nodeName: string, value: t.Expression, dependenciesNode: t.Expression): t.Statement {
    return this.t.expressionStatement(
      this.t.logicalExpression(
        '&&',
        this.t.identifier(nodeName),
        this.t.callExpression(this.t.identifier(this.importMap.updateText), [
          this.t.identifier(nodeName),
          this.t.arrowFunctionExpression([], value),
          dependenciesNode,
        ])
      )
    );
  }
}
