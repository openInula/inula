import { HTMLParticle, TextParticle, ViewParticle } from '@openinula/reactivity-parser';
import { GenTemplateContent, TemplateContentGenerator } from './interface';
import { importMap, prefixMap } from '../utils/config';
import { types as t } from '@openInula/babel-api';
import { setHTMLProp } from '../utils/props';

interface Context {
  nodeIdx: number;
  addStmts: (stmts: t.Statement[] | t.Statement) => void;
  next: (particle: ViewParticle) => void;
  parentStack: string[];
}

function generateNodeName(ctx: Context, idx?: number): string {
  return `${prefixMap.node}${idx ?? ctx.nodeIdx++}`;
}

/**
 * @example
 * ```js
 * ${nodeName}.appendChild(${childNodeName})
 * ```
 */
function appendChild(nodeName: string, childNodeName: string): t.Statement {
  return t.expressionStatement(
    t.callExpression(t.memberExpression(t.identifier(nodeName), t.identifier('appendChild')), [
      t.identifier(childNodeName),
    ])
  );
}

/**
 * @example
 * ```js
 * ${nodeName} = createElement(${tag})
 * ```
 */
function declareHTMLNode(dlNodeName: string, tag: t.Expression): t.Statement {
  return t.variableDeclaration('const', [
    t.variableDeclarator(t.identifier(dlNodeName), t.callExpression(t.identifier(importMap.createElement), [tag])),
  ]);
}

export const genTemplateContent: GenTemplateContent = (template: ViewParticle) => {
  const statements: t.Statement[] = [];

  const visit = (particle: ViewParticle) => {
    if (particle.type === 'html' || particle.type === 'text') {
      ImperativeTemplateGenerator[particle.type](particle as any, ctx);
      return;
    }
    throw new Error(`InstructionalTemplateGenerator: Unknown particle type: ${particle.type}`);
  };

  const ctx: Context = {
    nodeIdx: 0,
    parentStack: [],
    addStmts: stmts => (Array.isArray(stmts) ? stmts.forEach(s => statements.push(s)) : statements.push(stmts)),
    next: visit,
  };

  visit(template);
  statements.push(t.returnStatement(t.identifier(generateNodeName(ctx, 0))));

  return t.callExpression(t.functionExpression(null, [], t.blockStatement(statements)), []);
};

/**
 * @example
 * ```js
 * ${nodeName} = createTextNode(${value}, ${deps})
 * ```
 */
function declareTextNode(nodeName: string, value: t.Expression, dependenciesNode: t.Expression): t.Statement {
  return t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier(nodeName),
      t.callExpression(t.identifier(importMap.createTextNode), [value, dependenciesNode])
    ),
  ]);
}

/**
 * @example
 * ```js
 * const ${templateName} = (() => {
 *   let _$node0, _$node1, ...
 *
 *   ${nodeDeclareStatement}
 *
 *  return _$node0
 * })()
 * ```
 */
export const ImperativeTemplateGenerator: TemplateContentGenerator<Context> = {
  html: ({ tag, props, children }: HTMLParticle, ctx: Context) => {
    const nodeName = generateNodeName(ctx);
    const tagName = t.isStringLiteral(tag) ? tag.value : 'ANY';

    // declare node with createElement
    const nodeDeclareStatement = declareHTMLNode(nodeName, tag);

    // assign props
    const propsAssignStatements = Object.entries(props)
      .map(([key, { value }]) => {
        return setHTMLProp(nodeName, tagName, key, value, 0, null);
      })
      .filter(Boolean) as t.Statement[];
    ctx.addStmts([nodeDeclareStatement, ...propsAssignStatements]);

    // append node to parent
    if (ctx.parentStack.length > 0) {
      ctx.addStmts(appendChild(ctx.parentStack[ctx.parentStack.length - 1], nodeName));
    }

    // children
    ctx.parentStack.push(nodeName);
    children.forEach(child => {
      ctx.next(child);
    });
    ctx.parentStack.pop();
  },
  text: ({ content }: TextParticle, ctx: Context) => {
    const nodeName = generateNodeName(ctx);
    const nodeDeclareStatement = declareTextNode(nodeName, content.value, content.dependenciesNode);
    ctx.addStmts(nodeDeclareStatement);

    // append node to parent
    if (ctx.parentStack.length > 0) {
      ctx.addStmts(appendChild(ctx.parentStack[ctx.parentStack.length - 1], nodeName));
    }
  },
};
