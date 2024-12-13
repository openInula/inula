import { InulaStore } from '../../store';
import { Bits, InulaBaseNode, Updater, Value } from '../../types';
import { addParentElement, appendNodes, update } from '../utils';
import { HTMLAttrsObject, InulaHTMLNode } from './types';
import { shouldUpdate } from './utils';

/**
 * @brief Shortcut for document.createHTMLNode
 * @param tag
 * @returns InulaHTMLNode
 */
export const createHTMLNode = (tag: string, update: Updater<InulaHTMLNode>, ...childrenNodes: InulaBaseNode[]) => {
  const node = InulaStore.document.createElement(tag) as InulaHTMLNode;
  node.update = _update.bind(null, node, update);

  node.nodes = childrenNodes;

  // ---- Append nodes' elements
  appendNodes(childrenNodes, node);

  // ---- Set parentEl
  addParentElement(childrenNodes, node);

  return node;
};

/**
 * @brief Update the HTML node and its children
 * @param node
 * @param htmlUpdate
 */
const _update = (node: InulaHTMLNode, htmlUpdate: Updater<InulaHTMLNode> | null) => {
  htmlUpdate?.(node);
  for (let i = 0; i < (node.nodes?.length ?? 0); i++) {
    update(node.nodes![i], node.dirtyBits!);
  }
};

// ---- Without dependencies ----
/**
 * @brief Set HTML property directly
 * @param node
 * @param key
 * @param value
 */
const _setHTMLProp = (node: InulaHTMLNode, key: string, value: Value) => {
  (node as Record<string, Value>)[key] = value;
};

/**
 * @brief Check if it's a custom property, i.e. starts with '--'
 * @param name
 * @returns
 */
const isCustomProperty = (name: string): boolean => name.startsWith('--');

/**
 * @brief Set style
 * @param node
 * @param newStyle
 * @returns
 */
const _setStyle = (node: InulaHTMLNode, newStyle: CSSStyleDeclaration) => {
  const style = node.style;
  const prevStyle = node.prevStyle ?? ({} as CSSStyleDeclaration);

  // ---- Instead of resigning the whole style object,
  //      we will compare the previous style with the new style
  //      to reduce the number of operations

  // ---- Remove styles that are no longer present
  for (const key in prevStyle) {
    if (prevStyle.hasOwnProperty(key) && (!newStyle || !newStyle.hasOwnProperty(key))) {
      if (isCustomProperty(key)) {
        style.removeProperty(key);
      } else if (key === 'float') {
        style.cssFloat = '';
      } else {
        style[key] = '';
      }
    }
  }

  // ---- Set new or dirty styles
  for (const key in newStyle) {
    const prevValue = prevStyle[key];
    const newValue = newStyle[key];
    if (newStyle.hasOwnProperty(key) && newValue !== prevValue) {
      if (newValue == null || newValue === '' || typeof newValue === 'boolean') {
        if (isCustomProperty(key)) {
          style.removeProperty(key);
        } else if (key === 'float') {
          style.cssFloat = '';
        } else {
          style[key] = '';
        }
      } else if (isCustomProperty(key)) {
        style.setProperty(key, newValue);
      } else if (key === 'float') {
        style.cssFloat = newValue;
      } else {
        node.style[key] = newValue;
      }
    }
  }

  // ---- Store the new style for future comparisons
  node.prevStyle = { ...newStyle };
};

/**
 * @brief Set dataset
 * @param node
 * @param value
 */
const _setDataset = (node: InulaHTMLNode, value: Record<string, string>) => {
  Object.assign(node.dataset, value);
};

/**
 * @brief Set HTML properties
 * @param node
 * @param value
 */
const _setHTMLProps = (node: InulaHTMLNode, value: HTMLAttrsObject) => {
  Object.entries(value).forEach(([key, v]) => {
    if (key === 'style') return _setStyle(node, v);
    if (key === 'dataset') return _setDataset(node, v);
    _setHTMLProp(node, key, v);
  });
};

/**
 * @brief Set HTML attribute
 * @param node
 * @param key
 * @param value
 */
const _setHTMLAttr = (node: InulaHTMLNode, key: string, value: string) => {
  node.setAttribute(key, value);
};

/**
 * @brief Set HTML attributes
 * @param node
 * @param value
 */
const _setHTMLAttrs = (node: InulaHTMLNode, value: HTMLAttrsObject) => {
  Object.entries(value).forEach(([key, v]) => {
    _setHTMLAttr(node, key, v);
  });
};

/**
 * @brief Set memorized event, store the previous event in node[`$on${key}`], if it exists, remove it first
 * @param node
 * @param key
 * @param value
 */
const _setEvent = (node: InulaHTMLNode, key: string, value: EventListener) => {
  // ---- Not using elCached because it's not a value, but a function
  const prevEvent = node[`me$${key}`];
  if (prevEvent) node.removeEventListener(key, prevEvent);
  node.addEventListener(key, value);
  node[`me$${key}`] = value;
};

/**
 * @brief Event handler by checking if $$${key} exists in the path
 * @param e
 */
const eventHandler = (e: Event) => {
  const key = `de$${e.type}`;
  for (const node of e.composedPath()) {
    if ((node as any)[key]) (node as any)[key](e);
    // ---- Even though it's deprecated,
    //      we still need it to manually stop the propagation in our event handler
    if (e.cancelBubble) return;
  }
};

/**
 * @brief Delegate event to the document instead of the element
 * @param node
 * @param key
 * @param value
 * @returns
 */
const _delegateEvent = (node: InulaHTMLNode, key: string, value: EventListener) => {
  if (node[`de$${key}`]) return;
  node[`de$${key}`] = value;
  if (!InulaStore.delegatedEvents.has(key)) {
    InulaStore.delegatedEvents.add(key);
    InulaStore.document.addEventListener(key, eventHandler);
  }
};

// ---- With dependencies ----

/**
 * @brief Set HTML property
 * @param node
 * @param key
 * @param valueFunc
 * @param dependencies
 * @param reactBits
 */
export const setHTMLProp = (
  node: InulaHTMLNode,
  key: string,
  valueFunc: () => Value,
  dependencies: Value[],
  reactBits: Bits
) => {
  if (reactBits) {
    if (!shouldUpdate(node, key, dependencies, reactBits)) return;
    _setHTMLProp(node, key, valueFunc());
  } else {
    _setHTMLProp(node, key, valueFunc);
  }
};

/**
 * @brief Set style
 * @param node
 * @param newStyleFunc
 * @param dependencies
 * @param reactBits
 */
export const setStyle = (
  node: InulaHTMLNode,
  newStyleFunc: (() => CSSStyleDeclaration) | CSSStyleDeclaration,
  dependencies: Value[],
  reactBits: Bits
) => {
  if (reactBits) {
    if (!shouldUpdate(node, 'style', dependencies, reactBits)) return;
    _setStyle(node, newStyleFunc());
  } else {
    _setStyle(node, newStyleFunc as CSSStyleDeclaration);
  }
};

/**
 * @brief Set dataset properties
 * @param node The HTML node to update
 * @param valueFunc Function that returns dataset key-value pairs
 * @param dependencies Values this dataset depends on
 * @param reactBits Bits indicating which properties should react to changes
 */
export const setDataset = (
  node: InulaHTMLNode,
  valueFunc: () => Record<string, string>,
  dependencies: Value[],
  reactBits: Bits
) => {
  if (!shouldUpdate(node, 'dataset', dependencies, reactBits)) return;
  _setDataset(node, valueFunc());
};

/**
 * @brief Set multiple HTML properties at once
 * @param node The HTML node to update
 * @param valueFunc Function that returns HTML properties object
 * @param dependencies Values these properties depend on
 * @param reactBits Bits indicating which properties should react to changes
 */
export const setHTMLProps = (
  node: InulaHTMLNode,
  valueFunc: () => HTMLAttrsObject,
  dependencies: Value[],
  reactBits: Bits
) => {
  if (!shouldUpdate(node, 'htmlProps', dependencies, reactBits)) return;
  _setHTMLProps(node, valueFunc());
};

/**
 * @brief Set multiple HTML attributes at once
 * @param node The HTML node to update
 * @param valueFunc Function that returns HTML attributes object
 * @param dependencies Values these attributes depend on
 * @param reactBits Bits indicating which attributes should react to changes
 */
export const setHTMLAttrs = (
  node: InulaHTMLNode,
  valueFunc: () => HTMLAttrsObject,
  dependencies: Value[],
  reactBits: Bits
) => {
  if (reactBits) {
    if (!shouldUpdate(node, 'htmlAttrs', dependencies, reactBits)) return;
    _setHTMLAttrs(node, valueFunc());
  } else {
    _setHTMLAttrs(node, valueFunc);
  }
};

export function setHTMLAttr(node: InulaHTMLNode, valueFunc: () => Value, dependencies: Value[], reactBits: Bits) {
  if (!shouldUpdate(node, 'htmlAttrs', dependencies, reactBits)) return;
  _setHTMLAttrs(node, valueFunc());
}

/**
 * @brief Set an event handler on a node
 */
export const setEvent = _setEvent;

/**
 * @brief Delegate an event handler through event bubbling
 */
export const delegateEvent = _delegateEvent;
