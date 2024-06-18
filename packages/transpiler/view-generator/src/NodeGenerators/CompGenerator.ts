import { type types as t } from '@babel/core';
import { type DependencyProp, type CompParticle, type ViewParticle, Bitmap } from '@openinula/reactivity-parser';
import ForwardPropGenerator from '../HelperGenerators/ForwardPropGenerator';

export default class CompGenerator extends ForwardPropGenerator {
  run() {
    let { props } = this.viewParticle as CompParticle;
    props = this.alterPropViews(props);
    const { tag, children } = this.viewParticle as CompParticle;

    const dlNodeName = this.generateNodeName();

    this.addInitStatement(...this.declareCompNode(dlNodeName, tag, props, children));
    let allDepMask: Bitmap = 0;

    // ---- Resolve props
    Object.entries(props).forEach(([key, { value, depMask, dependenciesNode }]) => {
      if (key === 'forwardProps') return;
      if (key === 'didUpdate') return;
      if (depMask) {
        allDepMask |= depMask;
      }
      if (CompGenerator.lifecycle.includes(key as (typeof CompGenerator.lifecycle)[number])) {
        this.addInitStatement(this.addLifecycle(dlNodeName, key as (typeof CompGenerator.lifecycle)[number], value));
        return;
      }
      if (key === 'ref') {
        this.addInitStatement(this.initElement(dlNodeName, value));
        return;
      }
      if (key === 'elements') {
        this.addInitStatement(this.initElement(dlNodeName, value, true));
        return;
      }
      if (key === '_$content') {
        this.addUpdateStatements(depMask, this.setCompContent(dlNodeName, value, dependenciesNode));
        return;
      }
      if (key === 'props') {
        this.addUpdateStatements(depMask, this.setCompProps(dlNodeName, value, dependenciesNode));
        return;
      }

      this.addUpdateStatements(depMask, this.setCompProp(dlNodeName, key, value, dependenciesNode));
    });

    // ---- Add addUpdate last
    if (props.didUpdate) {
      this.addUpdateStatements(allDepMask, this.addOnUpdate(dlNodeName, props.didUpdate.value));
    }

    return dlNodeName;
  }

  /**
   * @View
   * return Props object
   */
  private generateCompProps(props: Record<string, t.Expression>): t.Expression {
    if (Object.keys(props).length === 0) return this.t.objectExpression([]);

    return this.t.objectExpression(
      Object.entries(props).map(([key, value]) => {
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
            ![
              'ref',
              'elements',
              'forwardProps',
              '_$content',
              'didUpdate',
              'props',
              ...CompGenerator.lifecycle,
            ].includes(key)
        )
        .map(([key, { value }]) => [key, value])
    );

    if (children.length > 0) {
      newProps.children = this.t.identifier(this.declarePropView(children));
    }

    return [
      this.t.expressionStatement(
        this.t.assignmentExpression(
          '=',
          this.t.identifier(dlNodeName),
          this.t.callExpression(tag, [this.generateCompProps(newProps)])
        )
      ),
    ];
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
}
