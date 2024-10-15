import { getFlowIndexFromNodes, appendNodesWithIndex, addParentEl } from '../InulaNode';
import { equal } from '../equal';
import { InulaHTMLNode, TextNode, InulaNode } from '../types';

const delegatedEvents = new Set<string>();

/**
 * @brief Shortcut for document.createElement
 * @param tag
 * @returns HTMLElement
 */
export function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}

/**
 * @brief Shorten document.createTextNode
 * @param value
 * @returns Text
 */
export function createTextNode(value: string, deps?: unknown[]) {
  const node = document.createTextNode(value) as unknown as TextNode;
  if (deps) node.deps = deps;
  return node;
}

/**
 * @brief Update text node and check if the value is changed
 * @param node
 * @param value
 */
export function updateText(node: TextNode, valueFunc: () => string, deps: unknown[]) {
  if (equal(deps, node.deps)) return;
  const value = valueFunc();
  node.textContent = value;
  node.deps = deps;
}

function cache(el: HTMLElement, key: string, deps: any[]): boolean {
  if (deps.length === 0) return false;
  const cacheKey = `$${key}`;
  if (equal(deps, (el as any)[cacheKey])) return true;
  (el as any)[cacheKey] = deps;
  return false;
}

const isCustomProperty = (name: string): boolean => name.startsWith('--');

interface StyleObject {
  [key: string]: string | number | null | undefined;
}

export function setStyle(el: InulaHTMLNode, newStyle: CSSStyleDeclaration): void {
  const style = el.style;
  const prevStyle = el._prevStyle || {};

  // Remove styles that are no longer present
  for (const key in prevStyle) {
    // eslint-disable-next-line no-prototype-builtins
    if (prevStyle.hasOwnProperty(key) && (newStyle == null || !newStyle.hasOwnProperty(key))) {
      if (isCustomProperty(key)) {
        style.removeProperty(key);
      } else if (key === 'float') {
        style.cssFloat = '';
      } else {
        style[key] = '';
      }
    }
  }

  // Set new or changed styles
  for (const key in newStyle) {
    const prevValue = prevStyle[key];
    const newValue = newStyle[key];
    // eslint-disable-next-line no-prototype-builtins
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
      } else if (typeof newValue === 'number') {
        el.style[key] = newValue + 'px';
      } else {
        el.style[key] = newValue;
      }
    }
  }

  // Store the new style for future comparisons
  el._prevStyle = { ...newStyle };
}

/**
 * @brief Plainly set dataset
 * @param el
 * @param value
 */

export function setDataset(el: HTMLElement, value: { [key: string]: string }): void {
  Object.assign(el.dataset, value);
}

/**
 * @brief Set HTML property with checking value equality first
 */

export function setHTMLProp(el: HTMLElement, key: string, valueFunc: () => any, deps: any[]): void {
  // ---- Comparing deps, same value won't trigger
  //      will lead to a bug if the value is set outside of the DLNode
  //      e.g. setHTMLProp(el, "textContent", "value", [])
  //       =>  el.textContent = "other"
  //       =>  setHTMLProp(el, "textContent", "value", [])
  //       The value will be set to "other" instead of "value"
  if (cache(el, key, deps)) return;
  (el as any)[key] = valueFunc();
}

/**
 * @brief Plainly set HTML properties
 */

export function setHTMLProps(el: InulaHTMLNode, value: HTMLAttrsObject): void {
  Object.entries(value).forEach(([key, v]) => {
    if (key === 'style') return setStyle(el, v as CSSStyleDeclaration);
    if (key === 'dataset') return setDataset(el, v as { [key: string]: string });
    setHTMLProp(el, key, () => v, []);
  });
}

/**
 * @brief Set HTML attribute with checking value equality first
 * @param el
 * @param key
 * @param valueFunc
 * @param deps
 */

export function setHTMLAttr(el: InulaHTMLNode, key: string, valueFunc: () => string, deps: any[]): void {
  if (cache(el, key, deps)) return;
  if (key === '*spread*') {
    const spread = valueFunc();
    Object.keys(spread).forEach(key => {
      const realkey = key === 'className' ? 'class' : key;
      el.setAttribute(realkey, spread[key]);
    });
    return;
  }
  el.setAttribute(key, valueFunc());
}

interface HTMLAttrsObject {
  [key: string]: string | number | boolean | object | undefined;
  style?: CSSStyleDeclaration;
  dataset?: { [key: string]: string };
}

/**
 * @brief Plainly set HTML attributes
 * @param el
 * @param value
 */

export function setHTMLAttrs(el: InulaHTMLNode, value: HTMLAttrsObject): void {
  Object.entries(value).forEach(([key, v]) => {
    setHTMLAttr(el, key, () => v, []);
  });
}

/**
 * @brief Set memorized event, store the previous event in el[`$on${key}`], if it exists, remove it first
 * @param el
 * @param key
 * @param value
 */

export function setEvent(el: InulaHTMLNode, key: string, value: EventListener): void {
  const prevEvent = el[`$on${key}`];
  if (prevEvent) el.removeEventListener(key, prevEvent);
  el.addEventListener(key, value);
  el[`$on${key}`] = value;
}

function eventHandler(e: Event): void {
  const key = `$$${e.type}`;
  for (const node of e.composedPath()) {
    if (node[key]) node[key](e);
    if (e.cancelBubble) return;
  }
}

export function delegateEvent(el: InulaHTMLNode, key: string, value: EventListener): void {
  if (el[`$$${key}`] === value) return;
  el[`$$${key}`] = value;
  if (!delegatedEvents.has(key)) {
    delegatedEvents.add(key);
    document.addEventListener(key, eventHandler);
  }
}

export function appendNode(el: InulaHTMLNode, child: InulaHTMLNode) {
  // ---- Set _$nodes
  if (!el._$nodes) el._$nodes = Array.from(el.childNodes) as InulaHTMLNode[];
  el._$nodes.push(child);

  el.appendChild(child);
}

/**
 * @brief Insert any DLNode into an element, set the _$nodes and append the element to the element's children
 * @param el
 * @param node
 * @param position
 */
export function insertNode(el: InulaHTMLNode, node: InulaNode, position: number): void {
  // ---- Set _$nodes
  if (!el._$nodes) el._$nodes = Array.from(el.childNodes) as InulaHTMLNode[];
  el._$nodes.splice(position, 0, node);

  // ---- Insert nodes' elements
  const flowIdx = getFlowIndexFromNodes(el._$nodes, node);
  appendNodesWithIndex([node], el, flowIdx);
  // ---- Set parentEl
  addParentEl([node], el);
}
