import { type types as t } from '@babel/core';
import { type ViewParticle, type DependencyProp, type ContextParticle } from '@openinula/reactivity-parser';
import PropViewGenerator from '../HelperGenerators/PropViewGenerator';
import { InulaNodeType } from '@openinula/next-shared';
import { typeNode } from '../shard';

export default class ContextGenerator extends PropViewGenerator {
  run() {
    // eslint-disable-next-line prefer-const
    let { props, contextName } = this.viewParticle as ContextParticle;
    props = this.alterPropViews(props)!;
    const { children } = this.viewParticle as ContextParticle;

    const nodeName = this.generateNodeName();

    this.addInitStatement(this.declareEnvNode(nodeName, props, contextName));

    // ---- Children
    this.addInitStatement(this.geneEnvChildren(nodeName, children));

    // ---- Update props
    Object.entries(props).forEach(([key, { depMask, value, dependenciesNode }]) => {
      if (!depMask) return;
      this.addUpdateStatements(depMask, this.updateContext(nodeName, key, value, dependenciesNode));
    });

    return nodeName;
  }

  /**
   * @View
   * { ${key}: ${value}, ... } // contextValues
   * { ${key}: ${deps}, ... } // contextDeps
   */
  private generateContext(props: Record<string, DependencyProp>): t.Expression[] {
    return [
      this.t.objectExpression(
        Object.entries(props).map(([key, { value }]) => this.t.objectProperty(this.t.identifier(key), value))
      ),
      this.t.objectExpression(
        Object.entries(props)
          .map(
            ([key, { dependenciesNode }]) =>
              dependenciesNode && this.t.objectProperty(this.t.identifier(key), dependenciesNode)
          )
          .filter(Boolean) as t.ObjectProperty[]
      ),
    ];
  }

  /**
   * @View
   * ${nodeName} = createNode(InulaNodeType.Context, context, contextValues, contextDeps)
   */
  private declareEnvNode(nodeName: string, props: Record<string, DependencyProp>, contextName: string): t.Statement {
    return this.t.expressionStatement(
      this.t.assignmentExpression(
        '=',
        this.t.identifier(nodeName),
        this.t.callExpression(this.t.identifier(this.importMap.createNode), [
          typeNode(InulaNodeType.Context),
          this.t.identifier(contextName),
          ...this.generateContext(props),
        ])
      )
    );
  }

  /**
   * @View
   * initContextChildren(${nodeName}, [${childrenNames}])
   */
  private geneEnvChildren(nodeName: string, children: ViewParticle[]): t.Statement {
    const [statements, childrenNames] = this.generateChildren(children);
    this.addInitStatement(...statements);
    return this.t.expressionStatement(
      this.t.callExpression(this.t.identifier(this.importMap.initContextChildren), [
        this.t.identifier(nodeName),
        this.t.arrayExpression(childrenNames.map(name => this.t.identifier(name))),
      ])
    );
  }

  /**
   * @View
   * updateNode(${nodeName}, ${key}, () => ${value}, ${dependenciesNode})
   */
  private updateContext(
    nodeName: string,
    key: string,
    value: t.Expression,
    dependenciesNode: t.ArrayExpression
  ): t.Statement {
    return this.optionalExpression(
      nodeName,
      this.t.callExpression(this.t.identifier(this.importMap.updateNode), [
        this.t.identifier(nodeName),
        this.t.stringLiteral(key),
        this.t.arrowFunctionExpression([], value),
        dependenciesNode,
      ])
    );
  }
}
