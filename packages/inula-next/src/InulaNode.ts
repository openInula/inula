import { InulaHTMLNode, VNode, TextNode, InulaNode } from './types';

export const getEl = (node: VNode): Array<InulaHTMLNode | TextNode> => {
  return toEls(node._$nodes || []);
};

export const toEls = (nodes: InulaNode[]): Array<InulaHTMLNode | TextNode> => {
  const els: Array<InulaHTMLNode | TextNode> = [];
  loopShallowEls(nodes, el => {
    els.push(el);
  });
  return els;
};

export const loopShallowEls = (nodes: InulaNode[], runFunc: (el: InulaHTMLNode | TextNode) => void): void => {
  const stack: Array<InulaNode> = [...nodes].reverse();
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node instanceof HTMLElement || node instanceof Text) {
      runFunc(node);
    } else if (node._$nodes) {
      stack.push(...[...node._$nodes].reverse());
    }
  }
};

export const addParentEl = (nodes: Array<InulaNode>, parentEl: HTMLElement): void => {
  nodes.forEach(node => {
    if ('__type' in node) {
      node._$parentEl = parentEl as InulaHTMLNode;
      node._$nodes && addParentEl(node._$nodes, parentEl);
    }
  });
};

export const getFlowIndexFromNodes = (nodes: InulaNode[], stopNode?: InulaNode): number => {
  let index = 0;
  const stack: InulaNode[] = [...nodes].reverse();
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node === stopNode) break;
    if ('__type' in node) {
      node._$nodes && stack.push(...[...node._$nodes].reverse());
    } else {
      index++;
    }
  }
  return index;
};

export const appendNodesWithSibling = (nodes: Array<InulaNode>, parentEl: HTMLElement, nextSibling?: Node): number => {
  if (nextSibling) return insertNodesBefore(nodes, parentEl, nextSibling);
  return appendNodes(nodes, parentEl);
};

export const appendNodesWithIndex = (
  nodes: InulaNode[],
  parentEl: HTMLElement,
  index: number,
  length?: number
): number => {
  length = length ?? parentEl.childNodes.length;
  if (length !== index) return insertNodesBefore(nodes, parentEl, parentEl.childNodes[index]);
  return appendNodes(nodes, parentEl);
};

export const insertNodesBefore = (nodes: InulaNode[], parentEl: HTMLElement, nextSibling: Node): number => {
  let count = 0;
  loopShallowEls(nodes, el => {
    parentEl.insertBefore(el, nextSibling);
    count++;
  });
  return count;
};

const appendNodes = (nodes: InulaNode[], parentEl: HTMLElement): number => {
  let count = 0;
  loopShallowEls(nodes, el => {
    parentEl.appendChild(el);
    count++;
  });
  return count;
};
