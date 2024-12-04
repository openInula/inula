import {
  Bitmap,
  MutableParticle,
  TemplateProp,
  type HTMLParticle,
  type TemplateParticle,
} from '@openinula/reactivity-parser';
import HTMLPropGenerator, { setHTMLProp } from '../HelperGenerators/HTMLPropGenerator';
import { ViewGenerator, ViewContext } from '../../index';
import { types as t } from '@openInula/babel-api';
import { importMap, prefixMap } from '../HelperGenerators/BaseGenerator';
import { genTemplateContent } from '../TemplateContentGenerator/ImperativeTemplateGenerator';
import { generateNodeName } from '../shard';

function generateTemplateName(templateIdx: number): string {
  return `${prefixMap.template}${templateIdx}`;
}

/**
 * @example
 *  node => {
 *     const node0 = templateGetElement(node, 0)
 *     return () => {
 *       setHTMLProp(node0, 'className', 'active')
 *     }
 *   }
 * @param props
 * @param ctx
 * @returns
 */
function genPropsUpdater(props: TemplateProp[], ctx: ViewContext): t.Expression {
  const nodeMap: Record<string, string> = {};
  const nodeDeclareStatements: t.Statement[] = [];
  let nodeIdx = 0;
  const propsAssignments = props.map(({ tag, path, key, value, depIdBitmap, dependenciesNode }) => {
    const nodeName = generateNodeName(nodeIdx++);
    const pathString = path.join('.');
    if (!nodeMap[pathString]) {
      // locate the node
      const nodeName = generateNodeName(nodeIdx++);
      nodeDeclareStatements.push(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier(nodeName),
            t.callExpression(t.identifier(importMap.templateGetElement), [
              t.identifier('node'),
              ...path.map(p => t.numericLiteral(p)),
            ])
          ),
        ])
      );
      nodeMap[pathString] = nodeName;
    }

    // declare the prop
    return setHTMLProp(nodeName, tag, key, value, ctx.getReactBits(depIdBitmap), dependenciesNode);
  });
  return t.arrowFunctionExpression(
    [],
    t.blockStatement([
      ...nodeDeclareStatements,
      t.returnStatement(t.arrowFunctionExpression([], t.blockStatement(propsAssignments))),
    ])
  );
}

/**
 * @example
 * [0, createCompNode(Button({ id: 'run', text: 'Create 1,000 rows', fn: run }), null), 0, 0],      // Third+ params: Dynamic nodes info [index, node, path...]
 */
function genMutableParticlesUpdater(mutableParticles: MutableParticle[], ctx: ViewContext): t.Expression[] {
  return mutableParticles.map(particle => {
    const { path } = particle;
    const lastIdx = path[path.length - 1];
    return t.arrayExpression([
      t.numericLiteral(lastIdx),
      ctx.next(particle),
      ...path.slice(0, -1).map(p => t.numericLiteral(p)),
    ]);
  });
}

/**
 * TemplateGenerator
 * create template node with mutable particles and props
 * @example
 *
 * const TEMPLATE = createTemplate(`<div s><span></span></div>`)
 * createTemplateNode(
 *   TEMPLATE,                    // First param: template definition
 *   node => {                   // Second param: update function for node
 *     const node0 = templateGetElement(node)
 *     return () => {
 *       setHTMLProp(node0, 'className', 'active')
 *     }
 *   },
 *   [0, createCompNode(Button({ id: 'run', text: 'Create 1,000 rows', fn: run }), null), 0, 0],      // Third+ params: Dynamic nodes info [index, node, path...]
 *   [1, createCompNode(Button({ id: 'runlots', text: 'Create 1,000 rows', fn: run }), null), 0, 0]     // Format: [index, node, ...path]
 * )
 */
export const templateGenerator: ViewGenerator = {
  template: ({ template, props, mutableParticles }: TemplateParticle, ctx: ViewContext) => {
    const templateName = generateTemplateName(ctx.getNextTemplateIdx());
    const templateContent = genTemplateContent(template);
    ctx.addTemplate(templateName, templateContent);

    const propsUpdater = genPropsUpdater(props, ctx);
    const mutableParticlesUpdater = genMutableParticlesUpdater(mutableParticles, ctx);

    return t.callExpression(t.identifier(importMap.createTemplateNode), [t.identifier(templateName), propsUpdater]);
  },
};
