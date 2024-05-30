import { type types as t } from '@babel/core';
import { type ViewParticle } from '@openinula/reactivity-parser';
import ViewGenerator from './ViewGenerator';

export default class MainViewGenerator extends ViewGenerator {
  /**
   * @brief Generate the main view, i.e., View() { ... }
   * @param viewParticles
   * @returns [viewBody, classProperties, templateIdx]
   */
  generate(viewParticles: ViewParticle[]): [t.ArrowFunctionExpression | null, t.Statement[], number] {
    const allVariables: t.VariableDeclaration[] = [];
    const allInitStatements: t.Statement[] = [];
    const allUpdateStatements: Record<number, t.Statement[]> = {};
    const topLevelNodes: string[] = [];

    viewParticles.forEach(viewParticle => {
      const [initStatements, updateStatements, variables, nodeName] = this.generateChild(viewParticle);
      allInitStatements.push(...initStatements);
      Object.entries(updateStatements).forEach(([depNum, statements]) => {
        if (!allUpdateStatements[Number(depNum)]) {
          allUpdateStatements[Number(depNum)] = [];
        }
        allUpdateStatements[Number(depNum)].push(...statements);
      });
      allVariables.push(...variables);
      topLevelNodes.push(nodeName);
    });

    const allDeclarations = [...this.declareNodes(), ...allInitStatements, ...allVariables];
    return [this.geneUpdate(allUpdateStatements, topLevelNodes), allDeclarations, this.templateIdx];
  }

  /**
   * @View
   * this._$update = ($changed) => {
   *  if ($changed & 1) {
   *    ...
   *  }
   *  ...
   * }
   */
  private geneUpdate(updateStatements: Record<number, t.Statement[]>, topLevelNodes: string[]) {
    if (Object.keys(updateStatements).length === 0) return null;
    return this.t.arrowFunctionExpression(
      this.updateParams,
      this.t.blockStatement([
        ...Object.entries(updateStatements)
          .filter(([depNum]) => depNum !== '0')
          .map(([depNum, statements]) => {
            return this.t.ifStatement(
              this.t.binaryExpression('&', this.t.identifier('$changed'), this.t.numericLiteral(Number(depNum))),
              this.t.blockStatement(statements)
            );
          }),
        ...(updateStatements[0] ?? []),
        this.geneReturn(topLevelNodes),
      ])
    );
  }

  /**
   * @View
   * return [${nodeNames}]
   */
  private geneReturn(topLevelNodes: string[]) {
    return this.t.returnStatement(this.t.arrayExpression(topLevelNodes.map(nodeName => this.t.identifier(nodeName))));
  }
}
