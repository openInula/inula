import { type HTMLParticle } from '@openinula/reactivity-parser';
import { setHTMLProp } from '../HelperGenerators/HTMLPropGenerator';
import { ViewGenerator, ViewContext } from '../index';
import { types as t } from '@openInula/babel-api';
import { nodeNameInUpdate } from '../HelperGenerators/BaseGenerator';

/**
 * HTMLGenerator
 * create html node (static / reactive)
 * template:
 *    createHTMLNode('button', node => {
 *      setHTMLProp(node, 'textContent', 'Increment');
 *      setHTMLProp(node, 'textContent', () => result, [result], 0b1000);
 *      delegateEvent(node, 'click', increment);
 *    }, [children])
 */
export const htmlGenerator: ViewGenerator = {
  html: (viewParticle: HTMLParticle, ctx: ViewContext) => {
    const { getReactBits, importMap } = ctx;
    const { tag, props, children } = viewParticle;

    const propStmts: t.Statement[] = [];
    let isDynamic = false;
    // ---- Resolve props
    const tagName = t.isStringLiteral(tag) ? tag.value : 'ANY';
    Object.entries(props).forEach(([key, { value, depIdBitmap, dependenciesNode }]) => {
      const reactBits = getReactBits(depIdBitmap);
      if (reactBits) isDynamic = true;
      propStmts.push(setHTMLProp(nodeNameInUpdate, tagName, key, value, reactBits, dependenciesNode));
    });
    const propsUpdater =
      propStmts.length > 0 ? t.arrowFunctionExpression([], t.blockStatement(propStmts)) : t.nullLiteral();

    // ---- Resolve children
    const childrenNodes: t.Expression[] = children.map(child => ctx.next(child));

    const nodeCreationExpr = t.callExpression(t.identifier(importMap.createHTMLNode), [
      t.stringLiteral(tagName),
      propsUpdater,
      ...childrenNodes,
    ]);

    return nodeCreationExpr;
  },
};

function wrapExprStatement(expr: t.Expression): t.Statement {
  return t.expressionStatement(expr);
}
