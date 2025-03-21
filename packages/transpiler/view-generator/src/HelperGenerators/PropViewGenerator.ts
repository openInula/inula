import { type DependencyProp, type ViewParticle } from '@openinula/reactivity-parser';
import LifecycleGenerator from './LifecycleGenerator';

export default class PropViewGenerator extends LifecycleGenerator {
  /**
   * @brief Alter prop view in batch
   * @param props
   * @returns altered props
   */
  alterPropViews<T extends Record<string, DependencyProp> | undefined>(props: T): T {
    if (!props) return props;
    return Object.fromEntries(
      Object.entries(props).map(([key, prop]) => {
        return [key, this.alterPropView(prop)!];
      })
    ) as T;
  }

  /**
   * @View
   * ${dlNodeName} = new PropView(($addUpdate) => {
   *  addUpdate((changed) => { ${updateStatements} })
   *  ${initStatements}
   *  return ${topLevelNodes}
   * })
   */
  declarePropView(viewParticles: ViewParticle[]) {
    // ---- Generate PropView
    const [initStatements, topLevelNodes, updateStatements, nodeIdx] = this.generateChildren(
      viewParticles,
      false,
      true
    );
    // ---- Add update function to the first node
    /**
     * $addUpdate((changed) => { ${updateStatements} })
     */
    if (Object.keys(updateStatements).length > 0) {
      initStatements.unshift(
        this.t.expressionStatement(
          this.t.callExpression(this.t.identifier('$addUpdate'), [
            this.t.arrowFunctionExpression(this.updateParams, this.geneUpdateBody(updateStatements)),
          ])
        )
      );
    }
    initStatements.unshift(...this.declareNodes(nodeIdx));
    initStatements.push(this.generateReturnStatement(topLevelNodes));

    // ---- Assign as a dlNode
    const dlNodeName = this.generateNodeName();
    const propViewNode = this.t.expressionStatement(
      this.t.assignmentExpression(
        '=',
        this.t.identifier(dlNodeName),
        this.t.newExpression(this.t.identifier(this.importMap.PropView), [
          this.t.arrowFunctionExpression([this.t.identifier('$addUpdate')], this.t.blockStatement(initStatements)),
        ])
      )
    );
    this.addInitStatement(propViewNode);
    const propViewIdentifier = this.t.identifier(dlNodeName);

    // ---- Add to update statements
    /**
     * ${dlNodeName}?.update(changed)
     */
    this.addUpdateStatementsWithoutDep(
      this.optionalExpression(
        dlNodeName,
        this.t.callExpression(
          this.t.memberExpression(propViewIdentifier, this.t.identifier('update')),
          this.updateParams
        )
      )
    );

    return dlNodeName;
  }

  /**
   * @brief Alter prop view by replacing prop view with a recursively generated prop view
   * @param prop
   * @returns altered prop
   */
  alterPropView<T extends DependencyProp | undefined>(prop: T): T {
    if (!prop) return prop;
    const { value, viewPropMap } = prop;
    if (!viewPropMap) return { ...prop, value };
    let newValue = value;
    this.traverse(this.valueWrapper(value), {
      StringLiteral: innerPath => {
        const id = innerPath.node.value;
        const viewParticles = viewPropMap[id];
        if (!viewParticles) return;
        const propViewIdentifier = this.t.identifier(this.declarePropView(viewParticles));

        if (value === innerPath.node) newValue = propViewIdentifier;
        innerPath.replaceWith(propViewIdentifier);
        innerPath.skip();
      },
    });
    return { ...prop, value: newValue };
  }
}
