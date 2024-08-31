import { type types as t } from '@babel/core';
import { Bitmap, type HTMLParticle } from '@openinula/reactivity-parser';
import HTMLPropGenerator from '../HelperGenerators/HTMLPropGenerator';

export default class HTMLGenerator extends HTMLPropGenerator {
  run() {
    const { tag, props, children } = this.viewParticle as HTMLParticle;

    const dlNodeName = this.generateNodeName();

    this.addInitStatement(this.declareHTMLNode(dlNodeName, tag));

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
      this.addInitStatement(this.addHTMLProp(dlNodeName, tagName, key, value, depMask, dependenciesNode));
    });
    if (props.didUpdate) {
      this.addUpdateStatements(allDepMask, this.addOnUpdate(dlNodeName, props.didUpdate.value));
    }

    // ---- Resolve children
    const childNames: string[] = [];
    let mutable = false;
    children.forEach((child, idx) => {
      const [initStatements, childName] = this.generateChild(child);
      childNames.push(childName);
      this.addInitStatement(...initStatements);
      if (child.type === 'html' || child.type === 'text') {
        this.addInitStatement(this.appendChild(dlNodeName, childName));
      } else {
        mutable = true;
        this.addInitStatement(this.insertNode(dlNodeName, childName, idx));
      }
    });
    if (mutable) this.addInitStatement(this.setHTMLNodes(dlNodeName, childNames));

    return dlNodeName;
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
   * ${dlNodeName}._$nodes = [...${childNames}]
   */
  private setHTMLNodes(dlNodeName: string, childNames: string[]): t.Statement {
    return this.t.expressionStatement(
      this.t.assignmentExpression(
        '=',
        this.t.memberExpression(this.t.identifier(dlNodeName), this.t.identifier('_$nodes')),
        this.t.arrayExpression(childNames.map(name => this.t.identifier(name)))
      )
    );
  }

  /**
   * @View
   * appendNode(${dlNodeName}, ${childNodeName})
   */
  private appendChild(dlNodeName: string, childNodeName: string): t.Statement {
    return this.t.expressionStatement(
      this.t.callExpression(this.t.identifier(this.importMap.appendNode), [
        this.t.identifier(dlNodeName),
        this.t.identifier(childNodeName),
      ])
    );
  }
}
