import { type types as t } from '@babel/core';
import { type ViewParticle } from '@openinula/reactivity-parser';
import { type ViewGeneratorConfig } from './types';
import BaseGenerator, { prefixMap } from './HelperGenerators/BaseGenerator';
import CompGenerator from './NodeGenerators/CompGenerator';
import HTMLGenerator from './NodeGenerators/HTMLGenerator';
import TemplateGenerator from './NodeGenerators/TemplateGenerator';
import ForGenerator from './NodeGenerators/ForGenerator';
import IfGenerator from './NodeGenerators/IfGenerator';
import ContextGenerator from './NodeGenerators/ContextGenerator';
import TextGenerator from './NodeGenerators/TextGenerator';
import ExpGenerator from './NodeGenerators/ExpGenerator';

export default class ViewGenerator {
  config: ViewGeneratorConfig;
  t: typeof t;

  /**
   * @brief Construct the view generator from config
   * @param config
   */
  constructor(config: ViewGeneratorConfig) {
    this.config = config;
    this.t = config.babelApi.types;
    this.templateIdx = config.templateIdx;
  }

  /**
   * @brief Different generator classes for different view particle types
   */
  static generatorMap: Record<string, typeof BaseGenerator> = {
    comp: CompGenerator,
    html: HTMLGenerator,
    template: TemplateGenerator,
    for: ForGenerator,
    if: IfGenerator,
    context: ContextGenerator,
    text: TextGenerator,
    exp: ExpGenerator,
  };

  /**
   * @brief Generate the view given the view particles, mainly used for child particles parsing
   * @param viewParticles
   * @returns [initStatements, updateStatements, classProperties, topLevelNodes]
   */
  generateChildren(
    viewParticles: ViewParticle[]
  ): [t.Statement[], Record<number, t.Statement[]>, t.VariableDeclaration[], string[]] {
    const allInitStatements: t.Statement[] = [];
    const allVariables: t.VariableDeclaration[] = [];
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

    return [allInitStatements, allUpdateStatements, allVariables, topLevelNodes];
  }

  nodeIdx = -1;
  templateIdx = -1;

  /**
   * @brief Generate the view given the view particle, using generator from the map
   * @param viewParticle
   * @returns
   */
  generateChild(viewParticle: ViewParticle) {
    const { type } = viewParticle;
    const GeneratorClass = ViewGenerator.generatorMap[type];
    if (!GeneratorClass) {
      throw new Error(`Unknown view particle type: ${type}`);
    }
    const generator = new GeneratorClass(viewParticle, this.config);
    generator.nodeIdx = this.nodeIdx;
    generator.templateIdx = this.templateIdx;
    const result = generator.generate();
    this.nodeIdx = generator.nodeIdx;
    this.templateIdx = generator.templateIdx;
    return result;
  }

  /**
   * @View
   * let node1, node2, ...
   */
  declareNodes(): t.Statement[] {
    if (this.nodeIdx === -1) return [];
    return [
      this.t.variableDeclaration(
        'let',
        Array.from({ length: this.nodeIdx + 1 }, (_, i) =>
          this.t.variableDeclarator(this.t.identifier(`${prefixMap.node}${i}`))
        )
      ),
    ];
  }

  get updateParams() {
    return [this.t.identifier('$changed')];
  }
}
