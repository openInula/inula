import { type types as t } from '@babel/core';
import BaseGenerator from './BaseGenerator';

export default class LifecycleGenerator extends BaseGenerator {
  static lifecycle = ['willMount', 'didMount', 'willUnmount', 'didUnmount'] as const;

  /**
   * @View
   * ${nodeName} && ${value}(${nodeName}, changed)
   */
  addOnUpdate(nodeName: string, value: t.Expression): t.Statement {
    return this.t.expressionStatement(
      this.t.logicalExpression(
        '&&',
        this.t.identifier(nodeName),
        this.t.callExpression(value, [this.t.identifier(nodeName), ...this.updateParams.slice(1)])
      )
    );
  }

  /**
   * @View
   * willMount:
   *  - ${value}(${nodeName})
   * didMount/willUnmount/didUnmount:
   *  - View.addDidMount(${nodeName}, ${value})
   */
  addLifecycle(nodeName: string, key: (typeof LifecycleGenerator.lifecycle)[number], value: t.Expression): t.Statement {
    if (key === 'willMount') {
      return this.addWillMount(nodeName, value);
    }
    return this.addOtherLifecycle(nodeName, value, key);
  }

  /**
   * @View
   * ${value}(${nodeName})
   */
  addWillMount(nodeName: string, value: t.Expression): t.ExpressionStatement {
    return this.t.expressionStatement(this.t.callExpression(value, [this.t.identifier(nodeName)]));
  }

  /**
   * @View
   * View.addDidMount(${nodeName}, ${value})
   */
  addOtherLifecycle(
    nodeName: string,
    value: t.Expression,
    type: 'didMount' | 'willUnmount' | 'didUnmount'
  ): t.ExpressionStatement {
    return this.t.expressionStatement(
      this.t.callExpression(
        this.t.memberExpression(
          this.t.identifier('View'),
          this.t.identifier(`add${type[0].toUpperCase()}${type.slice(1)}`)
        ),
        [this.t.identifier(nodeName), value]
      )
    );
  }
}
