import { HTMLParticle, TemplateParticle, TextParticle, ViewParticle } from '@openinula/reactivity-parser';
import { TemplateContentGenerator } from './interface';
import { importMap, prefixMap } from '../HelperGenerators/BaseGenerator';
import { types as t } from '@openInula/babel-api';
import { addHTMLProp } from '../HelperGenerators/HTMLPropGenerator';

interface Context {
  nodeIdx: number;
  addStmts: (stmts: t.Statement[] | t.Statement) => void;
  next: (particle: ViewParticle) => void;
}
function generateNodeName(ctx: Context, idx?: number): string {
  return `${prefixMap.node}${idx ?? ++ctx.nodeIdx}`;
}
/**
 * @View
 * ${dlNodeName} = createElement(${tag})
 */
function declareHTMLNode(dlNodeName: string, tag: t.Expression): t.Statement {
  return t.expressionStatement(
    t.assignmentExpression(
      '=',
      t.identifier(dlNodeName),
      t.callExpression(t.identifier(importMap.createElement), [tag])
    )
  );
}

export function genTemplateContent(template: TemplateParticle['template']) {
  const statements: t.Statement[] = [];

  const visit = (particle: ViewParticle) => {
    if (particle.type === 'html' || particle.type === 'text') {
      ImperativeTemplateGenerator[particle.type](particle, ctx);
      return;
    }
    throw new Error(`InstructionalTemplateGenerator: Unknown particle type: ${particle.type}`);
  };

  const ctx: Context = {
    nodeIdx: 0,
    addStmts: stmts => (Array.isArray(stmts) ? stmts.forEach(s => statements.push(s)) : statements.push(stmts)),
    next: visit,
  };

  visit(template);

  return statements;
}

export const ImperativeTemplateGenerator: TemplateContentGenerator<Context> = {
  html: ({ tag, props, children }: HTMLParticle, ctx: Context) => {
    const nodeName = generateNodeName(ctx);
    const tagName = t.isStringLiteral(tag) ? tag.value : 'ANY';

    const nodeDeclareStatement = declareHTMLNode(nodeName, tag);
    const propsAssignStatements = Object.entries(props).map(([key, { value }]) => {
      return addHTMLProp(nodeName, tagName, key, value, 0, null);
    });
    ctx.addStmts([nodeDeclareStatement, ...propsAssignStatements]);

    children.forEach(child => ctx.next(child));
  },
  text: ({ content }: TextParticle, ctx: Context) => {},
};
