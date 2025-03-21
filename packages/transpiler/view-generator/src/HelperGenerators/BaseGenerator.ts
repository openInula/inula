import { type types as t, type traverse } from '@babel/core';
import { Bitmap, type ViewParticle } from '@openinula/reactivity-parser';
import { type SnippetPropMap, type ViewGeneratorConfig } from '../types';
import ViewGenerator from '../ViewGenerator';

export const prefixMap = { template: '$t', node: '$node' };

export default class BaseGenerator {
  readonly viewParticle: ViewParticle;
  readonly config: ViewGeneratorConfig;

  readonly t: typeof t;
  readonly traverse: typeof traverse;
  readonly importMap: Record<string, string>;
  readonly elementAttributeMap;
  readonly alterAttributeMap;

  readonly viewGenerator;

  /**
   * @brief Constructor
   * @param viewUnit
   * @param config
   */
  constructor(viewParticle: ViewParticle, config: ViewGeneratorConfig) {
    this.viewParticle = viewParticle;
    this.config = config;
    this.t = config.babelApi.types;
    this.traverse = config.babelApi.traverse;
    this.importMap = config.importMap;
    this.viewGenerator = new ViewGenerator(config);
    this.elementAttributeMap = config.attributeMap
      ? Object.entries(config.attributeMap).reduce<Record<string, string[]>>((acc, [key, elements]) => {
          elements.forEach(element => {
            if (!acc[element]) acc[element] = [];
            acc[element].push(key);
          });
          return acc;
        }, {})
      : {};
    this.alterAttributeMap = config.alterAttributeMap;
  }

  // ---- Init Statements
  private readonly initStatements: t.Statement[] = [];

  addInitStatement(...statements: (t.Statement | null)[]) {
    this.initStatements.push(...(statements.filter(Boolean) as t.Statement[]));
  }

  // ---- Added Class Properties, typically used in for Template
  private readonly variables: t.VariableDeclaration[] = [];

  addVariables(key: string, value: t.Expression) {
    this.variables.push(
      this.t.variableDeclaration('const', [this.t.variableDeclarator(this.t.identifier(key), value)])
    );
  }

  // ---- Update Statements
  private readonly updateStatements: Record<number, t.Statement[]> = {};

  addUpdateStatements(depMask: Bitmap | undefined, statement: t.Statement | undefined | null) {
    if (!depMask) return;
    if (!this.updateStatements[depMask]) this.updateStatements[depMask] = [];
    if (statement) this.updateStatements[depMask].push(statement);
  }

  addUpdateStatementsWithoutDep(statement: t.Statement) {
    if (!this.updateStatements[0]) this.updateStatements[0] = [];
    this.updateStatements[0].push(statement);
  }

  /**
   * @returns [initStatements, updateStatements, classProperties, nodeName]
   */
  generate(): [t.Statement[], Record<number, t.Statement[]>, t.VariableDeclaration[], string] {
    const nodeName = this.run();
    return [this.initStatements, this.updateStatements, this.variables, nodeName];
  }

  /**
   * @brief Generate the view given the view particles, mainly used for child particles parsing
   * @param viewParticles
   * @param mergeStatements
   * @returns [initStatements, topLevelNodes, updateStatements]
   */
  generateChildren(
    viewParticles: ViewParticle[],
    mergeStatements = true,
    newIdx = false
  ): [t.Statement[], string[], Record<number, t.Statement[]>, number] {
    this.viewGenerator.nodeIdx = newIdx ? -1 : this.nodeIdx;
    this.viewGenerator.templateIdx = this.templateIdx;
    const [initStatements, updateStatements, variables, topLevelNodes] =
      this.viewGenerator.generateChildren(viewParticles);
    if (!newIdx) this.nodeIdx = this.viewGenerator.nodeIdx;
    this.templateIdx = this.viewGenerator.templateIdx;
    this.variables.push(...variables);
    if (mergeStatements) this.mergeStatements(updateStatements);

    return [initStatements, topLevelNodes, updateStatements, this.viewGenerator.nodeIdx];
  }

  /**
   * @brief Merge the update statements
   * @param statements
   */
  private mergeStatements(statements: Record<number, t.Statement[]>): void {
    Object.entries(statements).forEach(([depNum, statements]) => {
      if (!this.updateStatements[Number(depNum)]) {
        this.updateStatements[Number(depNum)] = [];
      }
      this.updateStatements[Number(depNum)].push(...statements);
    });
  }

  /**
   * @brief Generate the view given the view particle
   * @param viewParticle
   * @param mergeStatements
   * @returns [initStatements, nodeName, updateStatements]
   */
  generateChild(
    viewParticle: ViewParticle,
    mergeStatements = true,
    newIdx = false
  ): [t.Statement[], string, Record<number, t.Statement[]>, number] {
    this.viewGenerator.nodeIdx = newIdx ? -1 : this.nodeIdx;
    this.viewGenerator.templateIdx = this.templateIdx;
    const [initStatements, updateStatements, variables, nodeName] = this.viewGenerator.generateChild(viewParticle);
    if (!newIdx) this.nodeIdx = this.viewGenerator.nodeIdx;
    this.templateIdx = this.viewGenerator.templateIdx;
    this.variables.push(...variables);
    if (mergeStatements) this.mergeStatements(updateStatements);

    return [initStatements, nodeName, updateStatements, this.viewGenerator.nodeIdx];
  }

  /**
   * @View
   * const $update = (changed) => { ${updateStatements} }
   */
  geneUpdateFunc(updateStatements: Record<number, t.Statement[]>): t.Statement {
    return this.t.variableDeclaration('const', [
      this.t.variableDeclarator(
        this.t.identifier('$update'),
        this.t.arrowFunctionExpression([this.t.identifier('$changed')], this.geneUpdateBody(updateStatements))
      ),
    ]);
  }

  get updateParams() {
    return [this.t.identifier('$changed')];
  }

  /**
   * @View
   * (changed) => {
   *   if (changed & 1) {
   *     ...
   *   }
   *   ...
   * }
   */
  geneUpdateBody(updateStatements: Record<number, t.Statement[]>): t.BlockStatement {
    return this.t.blockStatement([
      ...Object.entries(updateStatements)
        .filter(([depNum]) => depNum !== '0')
        .map(([depNum, statements]) => {
          return this.t.ifStatement(
            this.t.binaryExpression('&', this.t.identifier('$changed'), this.t.numericLiteral(Number(depNum))),
            this.t.blockStatement(statements)
          );
        }),
      ...(updateStatements[0] ?? []),
    ]);
  }

  /**
   * @View
   * let node1, node2, ...
   */
  declareNodes(nodeIdx: number): t.VariableDeclaration[] {
    if (nodeIdx === -1) return [];
    return [
      this.t.variableDeclaration(
        'let',
        Array.from({ length: nodeIdx + 1 }, (_, i) =>
          this.t.variableDeclarator(this.t.identifier(`${prefixMap.node}${i}`))
        )
      ),
    ];
  }

  /**
   * @View
   * return [${topLevelNodes}]
   */
  generateReturnStatement(topLevelNodes: string[]): t.ReturnStatement {
    return this.t.returnStatement(this.t.arrayExpression(topLevelNodes.map(name => this.t.identifier(name))));
  }

  /**
   * @brief To be implemented by the subclass as the main node generation function
   * @returns dlNodeName
   */
  run(): string {
    return '';
  }

  // ---- Name ----
  // ---- Used as dlNodeName for any node declaration
  nodeIdx = -1;

  generateNodeName(idx?: number): string {
    return `${prefixMap.node}${idx ?? ++this.nodeIdx}`;
  }

  // ---- Used as template generation as class property
  templateIdx = -1;

  generateTemplateName(): string {
    return `${prefixMap.template}${++this.templateIdx}`;
  }

  // ---- @Utils -----
  /**
   *
   * @param updateStatements
   * @returns
   */

  /**
   * @brief Calculate the dependency number from an array of dependency index
   *  e.g.
   *    [0, 1, 2] => 0b111 => 7
   *    [1, 3] => 0b1010 => 10
   * @param dependencies
   * @returns dependency number
   */
  static calcDependencyNum(dependencies: number[] | undefined): number {
    if (!dependencies || dependencies.length === 0) return 0;
    dependencies = [...new Set(dependencies)];
    return dependencies.reduce((acc, dep) => acc + (1 << dep), 0);
  }

  /**
   * @brief Wrap the value in a file
   * @param node
   * @returns wrapped value
   */
  valueWrapper(node: t.Expression | t.Statement): t.File {
    return this.t.file(this.t.program([this.t.isStatement(node) ? node : this.t.expressionStatement(node)]));
  }

  /**
   * @View
   * ${dlNodeName} && ${expression}
   */
  optionalExpression(dlNodeName: string, expression: t.Expression): t.Statement {
    return this.t.expressionStatement(this.t.logicalExpression('&&', this.t.identifier(dlNodeName), expression));
  }

  /**
   * @brief Shorthand function for collecting statements in batch
   * @returns [statements, collect]
   */
  static statementsCollector(): [t.Statement[], (...statements: t.Statement[] | t.Statement[][]) => void] {
    const statements: t.Statement[] = [];
    const collect = (...newStatements: t.Statement[] | t.Statement[][]) => {
      newStatements.forEach(s => {
        if (Array.isArray(s)) {
          statements.push(...s);
        } else {
          statements.push(s);
        }
      });
    };

    return [statements, collect];
  }
}
