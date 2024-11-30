import { type HTMLParticle } from '@openinula/reactivity-parser';
import { addHTMLProp } from '../HelperGenerators/HTMLPropGenerator';
import { ViewGenerator, ViewContext } from '../../index';
import { types as t } from '@openInula/babel-api';
import { nodeNameInUpdate } from '../HelperGenerators/BaseGenerator';

/**
 * HTMLGenerator
 * create html node (static / reactive)
 * template:
 *
 *    createReactiveHTMLNode('h4', node => {
 *      setReactiveHTMLProp(node, 'textContent', () => result, [result], 0b1000);
 *    }, [children])
 *    createHTMLNode('button', node => {
 *      setHTMLProp(node, 'textContent', 'Increment');
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
      propStmts.push(addHTMLProp(nodeNameInUpdate, tagName, key, value, reactBits, dependenciesNode));
    });

    // ---- Resolve children
    const childrenNodes: t.Expression[] = children.map(child => ctx.next(child));

    const apiName = isDynamic ? 'createReactiveHTMLNode' : 'createHTMLNode';
    const nodeCreationExpr = t.callExpression(t.identifier(apiName), [
      t.stringLiteral(tagName),
      t.arrowFunctionExpression([], t.blockStatement(propStmts)),
      ...childrenNodes,
    ]);

    return nodeCreationExpr;
  },
};

function wrapExprStatement(expr: t.Expression): t.Statement {
  return t.expressionStatement(expr);
}
