import { type types as t } from '@babel/core';
import { DLError } from '../error';
import ForwardPropGenerator from './ForwardPropGenerator';
import { Bitmap } from '@openinula/reactivity-parser';

export default class HTMLPropGenerator extends ForwardPropGenerator {
  static DelegatedEvents = new Set([
    'beforeinput',
    'click',
    'dblclick',
    'contextmenu',
    'focusin',
    'focusout',
    'input',
    'keydown',
    'keyup',
    'mousedown',
    'mousemove',
    'mouseout',
    'mouseover',
    'mouseup',
    'pointerdown',
    'pointermove',
    'pointerout',
    'pointerover',
    'pointerup',
    'touchend',
    'touchmove',
    'touchstart',
  ]);

  /**
   * @brief Add any HTML props according to the key
   * @param name
   * @param tag
   * @param key
   * @param value
   * @param depMask
   * @returns t.Statement
   */
  addHTMLProp(
    name: string,
    tag: string,
    key: string,
    value: t.Expression,
    depMask: Bitmap | undefined,
    dependenciesNode: t.ArrayExpression
  ): t.Statement | null {
    // ---- Dynamic HTML prop with init and update
    if (depMask && key !== 'ref') {
      this.addUpdateStatements(depMask, this.setDynamicHTMLProp(name, tag, key, value, dependenciesNode, true));
      return this.setDynamicHTMLProp(name, tag, key, value, dependenciesNode, false);
    }
    // ---- Static HTML prop with init only
    return this.setStaticHTMLProp(name, tag, key, value);
  }

  /**
   * @View
   * insertNode(${nodeName}, ${childNodeName}, ${position})
   */
  insertNode(nodeName: string, childNodeName: string, position: number): t.ExpressionStatement {
    return this.t.expressionStatement(
      this.t.callExpression(this.t.identifier(this.importMap.insertNode), [
        this.t.identifier(nodeName),
        this.t.identifier(childNodeName),
        this.t.numericLiteral(position),
      ])
    );
  }

  /**
   * @View
   * ${nodeName} && ${expression}
   */
  private setPropWithCheck(nodeName: string, expression: t.Expression, check: boolean): t.Statement {
    if (check) {
      return this.optionalExpression(nodeName, expression);
    }
    return this.t.expressionStatement(expression);
  }

  /**
   * @View
   * setStyle(${nodeName}, ${value})
   */
  private setHTMLStyle(nodeName: string, value: t.Expression, check: boolean): t.Statement {
    return this.setPropWithCheck(
      nodeName,
      this.t.callExpression(this.t.identifier(this.importMap.setStyle), [this.t.identifier(nodeName), value]),
      check
    );
  }

  /**
   * @View
   * setStyle(${nodeName}, ${value})
   */
  private setHTMLDataset(nodeName: string, value: t.Expression, check: boolean): t.Statement {
    return this.setPropWithCheck(
      nodeName,
      this.t.callExpression(this.t.identifier(this.importMap.setDataset), [this.t.identifier(nodeName), value]),
      check
    );
  }

  /**
   * @View
   * ${nodeName}.${key} = ${value}
   */
  private setHTMLProp(nodeName: string, key: string, value: t.Expression): t.Statement {
    return this.t.expressionStatement(
      this.t.assignmentExpression(
        '=',
        this.t.memberExpression(this.t.identifier(nodeName), this.t.identifier(key)),
        value
      )
    );
  }

  /**
   * @View
   * ${nodeName}.setAttribute(${key}, ${value})
   */
  private setHTMLAttr(nodeName: string, key: string, value: t.Expression): t.Statement {
    return this.t.expressionStatement(
      this.t.callExpression(this.t.memberExpression(this.t.identifier(nodeName), this.t.identifier('setAttribute')), [
        this.t.stringLiteral(key),
        value,
      ])
    );
  }

  /**
   * @View
   * ${nodeName}.addEventListener(${key}, ${value})
   */
  private setHTMLEvent(nodeName: string, key: string, value: t.Expression): t.Statement {
    return this.t.expressionStatement(
      this.t.callExpression(
        this.t.memberExpression(this.t.identifier(nodeName), this.t.identifier('addEventListener')),
        [this.t.stringLiteral(key), value]
      )
    );
  }

  /**
   * @View
   * setEvent(${nodeName}, ${key}, ${value})
   */
  private setEvent(nodeName: string, key: string, value: t.Expression, check: boolean): t.Statement {
    return this.setPropWithCheck(
      nodeName,
      this.t.callExpression(this.t.identifier(this.importMap.setEvent), [
        this.t.identifier(nodeName),
        this.t.stringLiteral(key),
        value,
      ]),
      check
    );
  }

  /**
   * @View
   * delegateEvent(${nodeName}, ${key}, ${value})
   */
  private delegateEvent(nodeName: string, key: string, value: t.Expression, check: boolean): t.Statement {
    this.config.wrapUpdate(value);
    return this.setPropWithCheck(
      nodeName,
      this.t.callExpression(this.t.identifier(this.importMap.delegateEvent), [
        this.t.identifier(nodeName),
        this.t.stringLiteral(key),
        value,
      ]),
      check
    );
  }

  /**
   * @View
   * setHTMLProp(${nodeName}, ${key}, ${valueFunc}, ${dependenciesNode})
   */
  private setCachedProp(
    nodeName: string,
    key: string,
    value: t.Expression,
    dependenciesNode: t.ArrayExpression,
    check: boolean
  ): t.Statement {
    return this.setPropWithCheck(
      nodeName,
      this.t.callExpression(this.t.identifier(this.importMap.setHTMLProp), [
        this.t.identifier(nodeName),
        this.t.stringLiteral(key),
        this.t.arrowFunctionExpression([], value),
        dependenciesNode,
      ]),
      check
    );
  }

  /**
   * @View
   * setHTMLAttr(${nodeName}, ${key}, ${valueFunc}, ${dependenciesNode}, ${check})
   */
  private setCachedAttr(
    nodeName: string,
    key: string,
    value: t.Expression,
    dependenciesNode: t.ArrayExpression,
    check: boolean
  ): t.Statement {
    return this.setPropWithCheck(
      nodeName,
      this.t.callExpression(this.t.identifier(this.importMap.setHTMLAttr), [
        this.t.identifier(nodeName),
        this.t.stringLiteral(key),
        this.t.arrowFunctionExpression([], value),
        dependenciesNode,
      ]),
      check
    );
  }

  /**
   * @View
   * setHTMLProps(${nodeName}, ${value})
   */
  private setHTMLPropObject(nodeName: string, value: t.Expression, check: boolean): t.Statement {
    return this.setPropWithCheck(
      nodeName,
      this.t.callExpression(this.t.identifier(this.importMap.setHTMLProps), [this.t.identifier(nodeName), value]),
      check
    );
  }

  /**
   * @View
   * setHTMLAttrs(${nodeName}, ${value})
   */
  private setHTMLAttrObject(nodeName: string, value: t.Expression, check: boolean): t.Statement {
    return this.setPropWithCheck(
      nodeName,
      this.t.callExpression(this.t.identifier(this.importMap.setHTMLAttrs), [this.t.identifier(nodeName), value]),
      check
    );
  }

  private static commonHTMLPropKeys = [
    'style',
    'dataset',
    'props',
    'ref',
    'attrs',
    'forwardProps',
    ...HTMLPropGenerator.lifecycle,
  ];

  /**
   * For style/dataset/ref/attr/prop
   */
  private addCommonHTMLProp(
    nodeName: string,
    attrName: string,
    value: t.Expression,
    check: boolean
  ): t.Statement | null {
    if (HTMLPropGenerator.lifecycle.includes(attrName as (typeof HTMLPropGenerator.lifecycle)[number])) {
      if (!check) return this.addLifecycle(nodeName, attrName as (typeof HTMLPropGenerator.lifecycle)[number], value);
      return null;
    }
    if (attrName === 'ref') {
      if (!check) return this.initElement(nodeName, value);
      return null;
    }
    if (attrName === 'style') return this.setHTMLStyle(nodeName, value, check);
    if (attrName === 'dataset') return this.setHTMLDataset(nodeName, value, check);
    if (attrName === 'props') return this.setHTMLPropObject(nodeName, value, check);
    if (attrName === 'attrs') return this.setHTMLAttrObject(nodeName, value, check);
    return DLError.throw2();
  }

  /**
   * @View
   * 1. Event listener
   *  - ${nodeName}.addEventListener(${key}, ${value})
   * 2. HTML internal attribute -> DOM property
   *  - ${nodeName}.${key} = ${value}
   * 3. HTML custom attribute
   *  - ${nodeName}.setAttribute(${key}, ${value})
   */
  private setStaticHTMLProp(nodeName: string, tag: string, attrName: string, value: t.Expression): t.Statement | null {
    if (HTMLPropGenerator.commonHTMLPropKeys.includes(attrName))
      return this.addCommonHTMLProp(nodeName, attrName, value, false);
    if (attrName.startsWith('on')) {
      const eventName = attrName.slice(2).toLowerCase();
      if (HTMLPropGenerator.DelegatedEvents.has(eventName)) {
        return this.delegateEvent(nodeName, eventName, value, false);
      }
      return this.setHTMLEvent(nodeName, eventName, value);
    }
    if (this.isInternalAttribute(tag, attrName)) {
      if (attrName === 'class') attrName = 'className';
      else if (attrName === 'for') attrName = 'htmlFor';
      return this.setHTMLProp(nodeName, attrName, value);
    }
    return this.setHTMLAttr(nodeName, attrName, value);
  }

  /**
   * @View
   * 1. Event listener
   *  - ${setEvent}(${nodeName}, ${key}, ${value})
   * 2. HTML internal attribute -> DOM property
   *  - ${setHTMLProp}(${nodeName}, ${key}, ${value})
   * 3. HTML custom attribute
   *  - ${setHTMLAttr}(${nodeName}, ${key}, ${value})
   */
  private setDynamicHTMLProp(
    nodeName: string,
    tag: string,
    attrName: string,
    value: t.Expression,
    dependenciesNode: t.ArrayExpression,
    check: boolean
  ): t.Statement | null {
    if (HTMLPropGenerator.commonHTMLPropKeys.includes(attrName))
      return this.addCommonHTMLProp(nodeName, attrName, value, check);
    if (attrName.startsWith('on')) {
      const eventName = attrName.slice(2).toLowerCase();
      if (HTMLPropGenerator.DelegatedEvents.has(eventName)) {
        return this.delegateEvent(nodeName, eventName, value, check);
      }
      return this.setEvent(nodeName, eventName, value, check);
    }
    if (this.alterAttributeMap[attrName]) {
      attrName = this.alterAttributeMap[attrName];
    }
    if (this.isInternalAttribute(tag, attrName)) {
      return this.setCachedProp(nodeName, attrName, value, dependenciesNode, check);
    }
    return this.setCachedAttr(nodeName, attrName, value, dependenciesNode, check);
  }

  /**
   * @brief Check if the attribute is internal, i.e., can be accessed as js property
   * @param tag
   * @param attribute
   * @returns true if the attribute is internal
   */
  isInternalAttribute(tag: string, attribute: string): boolean {
    return this.elementAttributeMap['*']?.includes(attribute) || this.elementAttributeMap[tag]?.includes(attribute);
  }
}
