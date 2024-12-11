import { types as t } from '@openInula/babel-api';
import { elementAttributeMap, importMap } from './BaseGenerator';

export const DelegatedEvents = new Set([
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

const commonHTMLPropKeys = ['ref', 'style', 'dataset'];
export function insertNode(nodeName: string, childNodeName: string, position: number): t.ExpressionStatement {
  return t.expressionStatement(
    t.callExpression(t.identifier('insertNode'), [
      t.identifier(nodeName),
      t.identifier(childNodeName),
      t.numericLiteral(position),
    ])
  );
}

export function setPropWithCheck(nodeName: string, expression: t.Expression, check: boolean): t.Statement {
  if (check) {
    return optionalExpression(nodeName, expression);
  }
  return t.expressionStatement(expression);
}

export function setHTMLStyle(nodeName: string, value: t.Expression, check: boolean): t.Statement {
  return setPropWithCheck(nodeName, t.callExpression(t.identifier('setStyle'), [t.identifier(nodeName), value]), check);
}

export function setHTMLDataset(nodeName: string, value: t.Expression, check: boolean): t.Statement {
  return setPropWithCheck(
    nodeName,
    t.callExpression(t.identifier('setDataset'), [t.identifier(nodeName), value]),
    check
  );
}

export function setHTMLAttr(nodeName: string, key: string, value: t.Expression): t.Statement {
  return t.expressionStatement(
    t.callExpression(t.memberExpression(t.identifier(nodeName), t.identifier('setAttribute')), [
      t.stringLiteral(key),
      value,
    ])
  );
}

/**
 * @example
 * ${nodeName}.${key} = ${value}
 */
export function setHTMLProperty(nodeName: string, key: string, value: t.Expression): t.Statement {
  return t.expressionStatement(
    t.assignmentExpression('=', t.memberExpression(t.identifier(nodeName), t.identifier(key)), value)
  );
}

export function setEvent(nodeName: string, key: string, value: t.Expression, check: boolean): t.Statement {
  return setPropWithCheck(
    nodeName,
    t.callExpression(t.identifier('setEvent'), [t.identifier(nodeName), t.stringLiteral(key), value]),
    check
  );
}

export function delegateEvent(nodeName: string, key: string, value: t.Expression, check: boolean): t.Statement {
  return setPropWithCheck(
    nodeName,
    t.callExpression(t.identifier(importMap['delegateEvent']), [t.identifier(nodeName), t.stringLiteral(key), value]),
    check
  );
}

export function setCachedProp(
  nodeName: string,
  key: string,
  value: t.Expression,
  dependenciesNode: t.ArrayExpression,
  reactBits: number,
  check: boolean
): t.Statement {
  return setPropWithCheck(
    nodeName,
    t.callExpression(t.identifier(importMap.setHTMLProp), [
      t.identifier(nodeName),
      t.stringLiteral(key),
      t.arrowFunctionExpression([], value),
      dependenciesNode,
      t.numericLiteral(reactBits),
    ]),
    check
  );
}

export function setDynamicHTMLProp(
  nodeName: string,
  tag: string,
  attrName: string,
  value: t.Expression,
  dependenciesNode: t.ArrayExpression,
  reactBits: number,
  check: boolean
): t.Statement {
  if (attrName.startsWith('on')) {
    const eventName = attrName.slice(2).toLowerCase();
    if (DelegatedEvents.has(eventName)) {
      return delegateEvent(nodeName, eventName, value, check);
    }
    return setEvent(nodeName, eventName, value, check);
  }

  return setCachedProp(nodeName, attrName, value, dependenciesNode, reactBits, check);
}

/**
 * @brief Check if the attribute is internal, i.e., can be accessed as js property
 * @param tag
 * @param attribute
 * @returns true if the attribute is internal
 */
function isInternalAttribute(tag: string, attribute: string): boolean {
  return elementAttributeMap['*']?.includes(attribute) || elementAttributeMap[tag]?.includes(attribute);
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
export function setStaticHTMLProp(nodeName: string, tag: string, attrName: string, value: t.Expression): t.Statement {
  if (commonHTMLPropKeys.includes(attrName)) return setHTMLPropObject(nodeName, value, false);
  if (attrName.startsWith('on')) {
    const eventName = attrName.slice(2).toLowerCase();
    if (DelegatedEvents.has(eventName)) {
      return delegateEvent(nodeName, eventName, value, false);
    }
    return setEvent(nodeName, eventName, value, false);
  }
  if (isInternalAttribute(tag, attrName)) {
    if (attrName === 'class') attrName = 'className';
    else if (attrName === 'for') attrName = 'htmlFor';
    return setHTMLProperty(nodeName, attrName, value);
  }
  return setHTMLAttr(nodeName, attrName, value);
}

function optionalExpression(nodeName: string, expression: t.Expression): t.Statement {
  return t.expressionStatement(t.logicalExpression('&&', t.identifier(nodeName), expression));
}

export function setHTMLPropObject(nodeName: string, value: t.Expression, check: boolean): t.Statement {
  return setPropWithCheck(
    nodeName,
    t.callExpression(t.identifier(importMap['setHTMLProps']), [t.identifier(nodeName), value]),
    check
  );
}

export function setHTMLProp(
  name: string,
  tag: string,
  key: string,
  value: t.Expression,
  reactBits: number | undefined,
  dependenciesNode: t.ArrayExpression | null
): t.Statement {
  // ---- Dynamic HTML prop with init and update
  if (reactBits && key !== 'ref') {
    return setDynamicHTMLProp(name, tag, key, value, dependenciesNode ?? t.arrayExpression([]), reactBits, false);
  }
  // ---- Static HTML prop with init only
  return setStaticHTMLProp(name, tag, key, value);
}
