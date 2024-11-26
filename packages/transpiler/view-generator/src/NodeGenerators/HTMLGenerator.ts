import { Bitmap, Dependency, type HTMLParticle } from '@openinula/reactivity-parser';
import HTMLPropGenerator from '../HelperGenerators/HTMLPropGenerator';
import { ViewGenerator, ViewContext } from '../..';
import { types as t } from '@openInula/babel-api';

export default class HTMLGenerator extends HTMLPropGenerator {
  run() {
    const { tag, props, children } = this.viewParticle as HTMLParticle;

    const nodeName = this.generateNodeName();

    this.addInitStatement(this.declareHTMLNode(nodeName, tag));

    // ---- Resolve props
    // ---- Use the tag name to check if the prop is internal for the tag,
    //      for dynamic tag, we can't check it, so we just assume it's not internal
    //      represent by the "ANY" tag name
    const tagName = this.t.isStringLiteral(tag) ? tag.value : 'ANY';
    let allDepMask: Bitmap = 0;
    Object.entries(props).forEach(([key, { value, depMask, dependenciesNode }]) => {
      if (key === 'didUpdate') return;
      if (depMask) {
        allDepMask |= depMask;
      }
      this.addInitStatement(this.addHTMLProp(nodeName, tagName, key, value, depMask, dependenciesNode));
    });
    if (props.didUpdate) {
      this.addUpdateStatements(allDepMask, this.addOnUpdate(nodeName, props.didUpdate.value));
    }

    // ---- Resolve children
    const childNames: string[] = [];
    let mutable = false;
    children.forEach((child, idx) => {
      const [initStatements, childName] = this.generateChild(child);
      childNames.push(childName);
      this.addInitStatement(...initStatements);
      if (child.type === 'html' || child.type === 'text') {
        this.addInitStatement(this.appendChild(nodeName, childName));
      } else {
        mutable = true;
        this.addInitStatement(this.insertNode(nodeName, childName, idx));
      }
    });
    if (mutable) this.addInitStatement(this.setHTMLNodes(nodeName, childNames));

    return nodeName;
  }

  /**
   * @View
   * ${dlNodeName} = createElement(${tag})
   */
  private declareHTMLNode(dlNodeName: string, tag: t.Expression): t.Statement {
    return this.t.expressionStatement(
      this.t.assignmentExpression(
        '=',
        this.t.identifier(dlNodeName),
        this.t.callExpression(this.t.identifier(this.importMap.createElement), [tag])
      )
    );
  }

  /**
   * @View
   * ${nodeName}._$nodes = [...${childNames}]
   */
  private setHTMLNodes(nodeName: string, childNames: string[]): t.Statement {
    return this.t.expressionStatement(
      this.t.assignmentExpression(
        '=',
        this.t.memberExpression(this.t.identifier(nodeName), this.t.identifier('_$nodes')),
        this.t.arrayExpression(childNames.map(name => this.t.identifier(name)))
      )
    );
  }

  /**
   * @View
   * appendNode(${nodeName}, ${childNodeName})
   */
  private appendChild(nodeName: string, childNodeName: string): t.Statement {
    return this.t.expressionStatement(
      this.t.callExpression(this.t.identifier(this.importMap.appendNode), [
        this.t.identifier(nodeName),
        this.t.identifier(childNodeName),
      ])
    );
  }
}

const addHTMLProp = (
  ctx: ViewContext,
  nodeName: string,
  tagName: string,
  key: string,
  value: t.Expression,
  dependency: Dependency | undefined
): t.Statement => {
  // ---- Dynamic HTML prop with init and update
  if (dependency) {
    const { dependenciesNode, depIdBitmap } = dependency;
  }
};
/**
 *    createReactiveHTMLNode('h4', node => {
        setReactiveHTMLProp(node, 'textContent', () => result, [result], 0b1000);
      }),
      createHTMLNode('button', node => {
        setHTMLProp(node, 'textContent', 'Increment');
        delegateEvent(node, 'click', increment);
      }),
 */
export const htmlGenerator: ViewGenerator = {
  html: (viewParticle: HTMLParticle, ctx: ViewContext) => {
    const { tag, props, children } = viewParticle;

    const initStatements: t.Statement[] = [];
    initStatements.push(
      t.expressionStatement(
        t.assignmentExpression(
          '=',
          t.identifier(nodeName),
          t.callExpression(t.identifier(ctx.importMap.createElement), [tag])
        )
      )
    );

    // ---- Resolve props
    const tagName = t.isStringLiteral(tag) ? tag.value : 'ANY';
    let allDepMask: Bitmap = 0;
    Object.entries(props).forEach(([key, { value, depMask, dependenciesNode }]) => {
      if (key === 'didUpdate') return;
      if (depMask) {
        allDepMask |= depMask;
      }
      initStatements.push(addHTMLProp(ctx, nodeName, tagName, key, value, depMask, dependenciesNode));
    });

    if (props.didUpdate) {
      const updateStatements = addOnUpdate(ctx, nodeName, props.didUpdate.value);
      ctx.addUpdateStatements(allDepMask, updateStatements);
    }

    // ---- Resolve children
    const childNames: string[] = [];
    let mutable = false;
    children.forEach((child, idx) => {
      const [childInitStatements, childName] = generateChild(child, ctx);
      childNames.push(childName);
      initStatements.push(...childInitStatements);

      if (child.type === 'html' || child.type === 'text') {
        initStatements.push(
          t.expressionStatement(
            t.callExpression(t.identifier(ctx.importMap.appendNode), [t.identifier(nodeName), t.identifier(childName)])
          )
        );
      } else {
        mutable = true;
        initStatements.push(
          t.expressionStatement(
            t.callExpression(t.identifier(ctx.importMap.insertNode), [
              t.identifier(nodeName),
              t.identifier(childName),
              t.numericLiteral(idx),
            ])
          )
        );
      }
    });

    if (mutable) {
      initStatements.push(
        t.expressionStatement(
          t.assignmentExpression(
            '=',
            t.memberExpression(t.identifier(nodeName), t.identifier('_$nodes')),
            t.arrayExpression(childNames.map(name => t.identifier(name)))
          )
        )
      );
    }

    return initStatements;
    return [];
  },
};
