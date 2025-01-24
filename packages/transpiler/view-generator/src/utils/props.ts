import { types as t } from '@openinula/babel-api';
import { alterAttributeMap, elementAttributeMap, importMap } from './config';
import { DLError } from '../error';

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

const commonHTMLPropKeys = ['ref', 'style', 'dataset', '*spread*'];

export function insertNode(nodeName: string, childNodeName: string, position: number): t.ExpressionStatement {
  return t.expressionStatement(
    t.callExpression(t.identifier('insertNode'), [
      t.identifier(nodeName),
      t.identifier(childNodeName),
      t.numericLiteral(position),
    ])
  );
}

export function wrapStmt(nodeName: string, expression: t.Expression): t.Statement {
  return t.expressionStatement(expression);
}

export function setHTMLStyle(
  nodeName: string,
  value: t.Expression,
  dependenciesNode?: t.ArrayExpression,
  reactBits?: number
): t.Statement {
  const args = reactBits
    ? [t.identifier(nodeName), t.arrowFunctionExpression([], value), dependenciesNode!, t.numericLiteral(reactBits)]
    : [t.identifier(nodeName), value];

  return wrapStmt(nodeName, t.callExpression(t.identifier(importMap.setStyle), args));
}

export function setHTMLDataset(
  nodeName: string,
  value: t.Expression,
  dependenciesNode?: t.ArrayExpression,
  reactBits?: number
): t.Statement {
  const args = reactBits
    ? [t.identifier(nodeName), t.arrowFunctionExpression([], value), dependenciesNode!, t.numericLiteral(reactBits)]
    : [t.identifier(nodeName), value];
  return wrapStmt(nodeName, t.callExpression(t.identifier('setDataset'), args));
}

export function setHTMLAttr(
  nodeName: string,
  key: string,
  value: t.Expression,
  dependenciesNode?: t.ArrayExpression,
  reactBits?: number
): t.Statement {
  const args = reactBits
    ? [t.stringLiteral(key), t.arrowFunctionExpression([], value), dependenciesNode!, t.numericLiteral(reactBits)]
    : [t.stringLiteral(key), value];
  return t.expressionStatement(
    t.callExpression(t.memberExpression(t.identifier(nodeName), t.identifier('setAttribute')), args)
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

export function setEvent(nodeName: string, key: string, value: t.Expression): t.Statement {
  return wrapStmt(
    nodeName,
    t.callExpression(t.identifier(importMap.setEvent), [t.identifier(nodeName), t.stringLiteral(key), value])
  );
}

/**
 * @View
 * delegateEvent(${nodeName}, ${key}, ${value}, ${dependenciesNode}, ${reactBits})
 */
export function delegateEvent(
  nodeName: string,
  key: string,
  value: t.Expression,
  dependenciesNode?: t.ArrayExpression,
  reactBits?: number
): t.Statement {
  const args = reactBits
    ? [
        t.identifier(nodeName),
        t.stringLiteral(key),
        t.arrowFunctionExpression([], value),
        dependenciesNode!,
        t.numericLiteral(reactBits),
      ]
    : [t.identifier(nodeName), t.stringLiteral(key), value];
  return wrapStmt(nodeName, t.callExpression(t.identifier(importMap['delegateEvent']), args));
}

export function setCachedProp(
  nodeName: string,
  key: string,
  value: t.Expression,
  dependenciesNode: t.ArrayExpression,
  reactBits: number
): t.Statement {
  return wrapStmt(
    nodeName,
    t.callExpression(t.identifier(importMap.setHTMLProp), [
      t.identifier(nodeName),
      t.stringLiteral(key),
      t.arrowFunctionExpression([], value),
      dependenciesNode,
      t.numericLiteral(reactBits),
    ])
  );
}

/**
 * @View
 * setHTMLAttr(${nodeName}, ${key}, ${valueFunc}, ${dependenciesNode}, ${reactBits})
 */
function setCachedAttr(
  nodeName: string,
  key: string,
  value: t.Expression,
  dependenciesNode: t.ArrayExpression,
  reactBits: number
): t.Statement {
  return wrapStmt(
    nodeName,
    t.callExpression(t.identifier(importMap.setHTMLAttr), [
      t.identifier(nodeName),
      t.stringLiteral(key),
      t.arrowFunctionExpression([], value),
      dependenciesNode,
      t.numericLiteral(reactBits),
    ])
  );
}

export function setDynamicHTMLProp(
  nodeName: string,
  tag: string,
  attrName: string,
  value: t.Expression,
  dependenciesNode: t.ArrayExpression,
  reactBits: number
): t.Statement | null {
  if (commonHTMLPropKeys.includes(attrName))
    return addCommonHTMLProp(nodeName, attrName, value, dependenciesNode, reactBits);
  if (attrName.startsWith('on')) {
    const eventName = attrName.slice(2).toLowerCase();
    if (DelegatedEvents.has(eventName)) {
      return delegateEvent(nodeName, eventName, value, dependenciesNode, reactBits);
    }
    return setEvent(nodeName, eventName, value);
  }

  if (alterAttributeMap[attrName]) {
    attrName = alterAttributeMap[attrName];
  }
  if (isInternalAttribute(tag, attrName)) {
    return setCachedProp(nodeName, attrName, value, dependenciesNode, reactBits);
  }
  return setCachedAttr(nodeName, attrName, value, dependenciesNode, reactBits);
}

/**
 * @View
 * setRef($nodeEl, () => typeof ${value} === "function" ? ${value}($nodeEl) : ${value} = $nodeEl)
 * @param nodeName
 * @param value
 */
function setRef(nodeName: string, value: t.Expression): t.Statement {
  const elNode = t.identifier(nodeName);

  const elementNode = t.conditionalExpression(
    t.binaryExpression('===', t.unaryExpression('typeof', value, true), t.stringLiteral('function')),
    t.callExpression(value, [elNode]),
    t.assignmentExpression('=', value as t.LVal, elNode)
  );

  return t.expressionStatement(
    t.callExpression(t.identifier(importMap.setRef), [elNode, t.arrowFunctionExpression([], elementNode)])
  );
}

/**
 * For style/dataset/ref/attr/prop
 */
function addCommonHTMLProp(
  nodeName: string,
  attrName: string,
  value: t.Expression,
  dependenciesNode?: t.ArrayExpression,
  reactBits?: number
): t.Statement | null {
  if (attrName === 'ref') {
    return setRef(nodeName, value);
  }
  if (attrName === 'style') return setHTMLStyle(nodeName, value, dependenciesNode, reactBits);
  if (attrName === 'dataset') return setHTMLDataset(nodeName, value, dependenciesNode, reactBits);
  if (attrName === 'props') return setHTMLPropObject(nodeName, value);
  if (attrName === '*spread*') return setHTMLSpread(nodeName, value, dependenciesNode, reactBits);
  return DLError.throw2();
}

function setHTMLSpread(
  nodeName: string,
  value: t.Expression,
  dependenciesNode?: t.ArrayExpression,
  reactBits?: number
): t.Statement | null {
  const args = reactBits
    ? [t.identifier(nodeName), t.arrowFunctionExpression([], value), dependenciesNode!, t.numericLiteral(reactBits)]
    : [t.identifier(nodeName), value];
  return t.expressionStatement(t.callExpression(t.identifier(importMap.setHTMLAttrs), args));
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
export function setStaticHTMLProp(
  nodeName: string,
  tag: string,
  attrName: string,
  value: t.Expression
): t.Statement | null {
  if (commonHTMLPropKeys.includes(attrName)) {
    return addCommonHTMLProp(nodeName, attrName, value);
  }
  if (attrName.startsWith('on')) {
    const eventName = attrName.slice(2).toLowerCase();
    if (DelegatedEvents.has(eventName)) {
      return delegateEvent(nodeName, eventName, value);
    }
    return setEvent(nodeName, eventName, value);
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

export function setHTMLPropObject(nodeName: string, value: t.Expression): t.Statement {
  return wrapStmt(nodeName, t.callExpression(t.identifier(importMap['setHTMLProps']), [t.identifier(nodeName), value]));
}

export function setHTMLProp(
  name: string,
  tag: string,
  key: string,
  value: t.Expression,
  reactBits: number | undefined,
  dependenciesNode: t.ArrayExpression | null
): t.Statement | null {
  // ---- Dynamic HTML prop with init and update
  if (reactBits && key !== 'ref') {
    return setDynamicHTMLProp(name, tag, key, value, dependenciesNode ?? t.arrayExpression([]), reactBits);
  }
  // ---- Static HTML prop with init only
  return setStaticHTMLProp(name, tag, key, value);
}
