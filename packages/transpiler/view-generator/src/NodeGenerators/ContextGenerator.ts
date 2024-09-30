import { type types as t } from '@babel/core';
import { type ViewParticle, type DependencyProp, type ContextParticle } from '@openinula/reactivity-parser';
import PropViewGenerator from '../HelperGenerators/PropViewGenerator';

export default class ContextGenerator extends PropViewGenerator {
  run() {
    // eslint-disable-next-line prefer-const
    let { props, contextName } = this.viewParticle as ContextParticle;
    props = this.alterPropViews(props)!;
    const { children } = this.viewParticle as ContextParticle;

    const dlNodeName = this.generateNodeName();

    this.addInitStatement(this.declareEnvNode(dlNodeName, props, contextName));

    // ---- Children
    this.addInitStatement(this.geneEnvChildren(dlNodeName, children));

    // ---- Update props
    Object.entries(props).forEach(([key, { depMask, value, dependenciesNode }]) => {
      if (!depMask) return;
      this.addUpdateStatements(depMask, this.updateContext(dlNodeName, key, value, dependenciesNode));
    });

    return dlNodeName;
  }

  /**
   * @View
   * { ${key}: ${value}, ... }
   * { ${key}: ${deps}, ... }
   */
  private generateEnvs(props: Record<string, DependencyProp>): t.Expression[] {
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
   * ${dlNodeName} = new ContextProvider(context, envs)
   */
  private declareEnvNode(dlNodeName: string, props: Record<string, DependencyProp>, contextName: string): t.Statement {
    return this.t.expressionStatement(
      this.t.assignmentExpression(
        '=',
        this.t.identifier(dlNodeName),
        this.t.newExpression(this.t.identifier(this.importMap.ContextProvider), [
          this.t.identifier(contextName),
          ...this.generateEnvs(props),
        ])
      )
    );
  }

  /**
   * @View
   * ${dlNodeName}.initNodes([${childrenNames}])
   */
  private geneEnvChildren(dlNodeName: string, children: ViewParticle[]): t.Statement {
    const [statements, childrenNames] = this.generateChildren(children);
    this.addInitStatement(...statements);
    return this.t.expressionStatement(
      this.t.callExpression(this.t.memberExpression(this.t.identifier(dlNodeName), this.t.identifier('initNodes')), [
        this.t.arrayExpression(childrenNames.map(name => this.t.identifier(name))),
      ])
    );
  }

  /**
   * @View
   * ${dlNodeName}.updateContext(${key}, () => ${value}, ${dependenciesNode})
   */
  private updateContext(
    dlNodeName: string,
    key: string,
    value: t.Expression,
    dependenciesNode: t.ArrayExpression
  ): t.Statement {
    return this.optionalExpression(
      dlNodeName,
      this.t.callExpression(
        this.t.memberExpression(this.t.identifier(dlNodeName), this.t.identifier('updateContext')),
        [this.t.stringLiteral(key), this.t.arrowFunctionExpression([], value), dependenciesNode]
      )
    );
  }
}
