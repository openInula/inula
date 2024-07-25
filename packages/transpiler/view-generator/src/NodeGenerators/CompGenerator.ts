import { type types as t } from '@babel/core';
import { type DependencyProp, type CompParticle, type ViewParticle, Bitmap } from '@openinula/reactivity-parser';
import ForwardPropGenerator from '../HelperGenerators/ForwardPropGenerator';

export default class CompGenerator extends ForwardPropGenerator {
  run() {
    let { props } = this.viewParticle as CompParticle;
    props = this.alterPropViews(props);
    const { tag, children } = this.viewParticle as CompParticle;

    const nodeName = this.generateNodeName();

    this.addInitStatement(...this.declareCompNode(nodeName, tag, props, children));

    // ---- Resolve props
    Object.entries(props).forEach(([key, { value, depMask, dependenciesNode }]) => {
      if (key === 'forwardProps') return;
      if (key === 'didUpdate') return;
      if (key === 'ref') return;

      if (CompGenerator.lifecycle.includes(key as (typeof CompGenerator.lifecycle)[number])) {
        this.addInitStatement(this.addLifecycle(nodeName, key as (typeof CompGenerator.lifecycle)[number], value));
        return;
      }

      if (key === 'props') {
        this.addUpdateStatements(depMask, this.setCompProps(nodeName, value, dependenciesNode));
        return;
      }

      this.addUpdateStatements(depMask, this.setCompProp(nodeName, key, value, dependenciesNode));
    });

    // ---- sub component update
    if (this.t.isIdentifier(tag)) {
      const depMask = this.config.subComps.find(([name]) => name === tag.name)?.[1];
      if (depMask) {
        this.addUpdateStatements(depMask, this.geneSubCompOnUpdate(nodeName, depMask));
      }
    }
    return nodeName;
  }

  /**
   * @View
   * return Props object
   */
  private generateCompProps(props: Record<string, t.Expression>): t.Expression {
    if (Object.keys(props).length === 0) return this.t.objectExpression([]);

    return this.t.objectExpression(
      Object.entries(props).map(([key, value]) => {
        this.config.wrapUpdate(value);
        return this.t.objectProperty(this.t.stringLiteral(key), value);
      })
    );
  }

  /**
   * @View
   * ${dlNodeName} = ${tag}()
   */
  private declareCompNode(
    dlNodeName: string,
    tag: t.Expression,
    props: Record<string, DependencyProp>,
    children: ViewParticle[]
  ): t.Statement[] {
    const newProps = Object.fromEntries(
      Object.entries(props)
        .filter(
          ([key]) =>
            !['elements', 'forwardProps', '_$content', 'didUpdate', 'props', ...CompGenerator.lifecycle].includes(key)
        )
        .map(([key, { value }]) => [key, key === 'ref' ? this.wrapRefHandler(value) : value])
    );

    if (children.length > 0) {
      newProps.children = this.t.identifier(this.declarePropView(children));
    }

    return [
      this.t.expressionStatement(
        this.t.assignmentExpression(
          '=',
          this.t.identifier(dlNodeName),
          this.t.callExpression(this.t.identifier('$$Comp'), [tag, this.generateCompProps(newProps)])
        )
      ),
    ];
  }

  private wrapRefHandler(refVal: t.Expression) {
    const refInput = this.t.identifier('$el');
    return this.t.functionExpression(
      null,
      [refInput],
      this.t.blockStatement([
        this.t.expressionStatement(
          this.t.conditionalExpression(
            this.t.binaryExpression(
              '===',
              this.t.unaryExpression('typeof', refVal, true),
              this.t.stringLiteral('function')
            ),
            this.t.callExpression(refVal, [refInput]),
            this.t.assignmentExpression('=', refVal as t.LVal, refInput)
          )
        ),
      ])
    );
  }

  /**
   * @View
   * ${dlNodeName}._$setContent(() => ${value}, ${dependenciesNode})
   */
  private setCompContent(dlNodeName: string, value: t.Expression, dependenciesNode: t.ArrayExpression): t.Statement {
    return this.optionalExpression(
      dlNodeName,
      this.t.callExpression(this.t.memberExpression(this.t.identifier(dlNodeName), this.t.identifier('_$setContent')), [
        this.t.arrowFunctionExpression([], value),
        dependenciesNode,
      ])
    );
  }

  /**
   * @View
   * ${dlNodeName}._$setProp(${key}, () => ${value}, ${dependenciesNode})
   */
  private setCompProp(
    dlNodeName: string,
    key: string,
    value: t.Expression,
    dependenciesNode: t.ArrayExpression
  ): t.Statement {
    return this.optionalExpression(
      dlNodeName,
      this.t.callExpression(this.t.memberExpression(this.t.identifier(dlNodeName), this.t.identifier('_$setProp')), [
        this.t.stringLiteral(key),
        this.t.arrowFunctionExpression([], value),
        dependenciesNode,
      ])
    );
  }

  /**
   * @View
   * ${dlNodeName}._$setProps(() => ${value}, ${dependenciesNode})
   */
  private setCompProps(dlNodeName: string, value: t.Expression, dependenciesNode: t.ArrayExpression): t.Statement {
    return this.optionalExpression(
      dlNodeName,
      this.t.callExpression(this.t.memberExpression(this.t.identifier(dlNodeName), this.t.identifier('_$setProps')), [
        this.t.arrowFunctionExpression([], value),
        dependenciesNode,
      ])
    );
  }

  /**
   * @View
   *   ${nodeName}.updateState(${depMask})
   * @param nodeName
   * @param depMask
   * @private
   */
  private geneSubCompOnUpdate(nodeName: string, depMask: number) {
    return this.t.expressionStatement(
      this.t.callExpression(this.t.memberExpression(this.t.identifier(nodeName), this.t.identifier('updateDerived')), [
        this.t.nullLiteral(), // the first parameter should be given.
        this.t.numericLiteral(depMask),
      ])
    );
  }
}
