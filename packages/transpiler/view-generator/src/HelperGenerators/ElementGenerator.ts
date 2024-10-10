import { type types as t } from '@babel/core';
import PropViewGenerator from './PropViewGenerator';

export default class ElementGenerator extends PropViewGenerator {
  /**
   * @View
   * el:
   * View.addDidMount(${nodeName}, () => (
   *   typeof ${value} === "function" ? ${value}($nodeEl) : ${value} = $nodeEl
   * ))
   * not el:
   * typeof ${value} === "function" ? ${value}($nodeEl) : ${value} = $nodeEl
   * @param nodeName
   * @param value
   * @param el true: nodeName._$el, false: nodeName
   */
  initElement(nodeName: string, value: t.Expression, el = false): t.Statement {
    const elNode = el
      ? this.t.memberExpression(this.t.identifier(nodeName), this.t.identifier('_$el'))
      : this.t.identifier(nodeName);

    const elementNode = this.t.conditionalExpression(
      this.t.binaryExpression('===', this.t.unaryExpression('typeof', value, true), this.t.stringLiteral('function')),
      this.t.callExpression(value, [elNode]),
      this.t.assignmentExpression('=', value as t.LVal, elNode)
    );

    return el
      ? this.t.expressionStatement(
          this.t.callExpression(this.t.memberExpression(this.t.identifier('View'), this.t.identifier('addDidMount')), [
            this.t.identifier(nodeName),
            this.t.arrowFunctionExpression([], elementNode),
          ])
        )
      : this.t.expressionStatement(elementNode);
  }

  // --- Utils
  private isOnlyMemberExpression(value: t.Expression): boolean {
    if (!this.t.isMemberExpression(value)) return false;
    while (value.property) {
      if (this.t.isMemberExpression(value.property)) {
        value = value.property;
        continue;
      } else if (this.t.isIdentifier(value.property)) break;
      else return false;
    }
    return true;
  }
}
