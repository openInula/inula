import { InulaNodeType } from '@openinula/next-shared';
import { appendNodesWithSibling, getFlowIndexFromNodes } from '../InulaNode';
import { addDidUnmount, addWillUnmount, runDidMount } from '../lifecycle';
import { equal } from '../equal';
import { ChildrenNode, ExpNode, VNode, TextNode, InulaNode } from '../types';
import { removeNodesWithUnmount, runLifeCycle, setUnmountFuncs } from './mutableHandler';
import { geneNewNodesInCtx, getSavedCtxNodes, removeNodes } from './mutableHandler';
import { startUnmountScope } from '../lifecycle';
import { buildChildren } from '../ChildrenNode';
import { createTextNode } from '../renderer/dom';

function isChildrenNode(node: any): node is ChildrenNode {
  return node.__type === InulaNodeType.Children;
}
function getExpressionResult(fn: () => Array<InulaNode>) {
  let nodes = fn();
  if (!Array.isArray(nodes)) nodes = [nodes];
  return (
    nodes
      // ---- Flatten the nodes
      .flat(1)
      // ---- Filter out empty nodes
      .filter(node => node !== undefined && node !== null && typeof node !== 'boolean')
      .map(node => {
        // ---- If the node is a string, number or bigint, convert it to a text node
        if (typeof node === 'string' || typeof node === 'number' || typeof node === 'bigint') {
          return createTextNode(`${node}`);
        }
        // TODO ---- If the node has PropView, call it to get the view,
        if (isChildrenNode(node)) return buildChildren(node);
        return node;
      })
      // ---- Flatten the nodes again
      .flat(1)
  );
}
export function createExpNode(value: () => VNode[], deps: unknown[]) {
  startUnmountScope();

  const expNode: ExpNode = {
    __type: InulaNodeType.Exp,
    _$nodes: getExpressionResult(value),
    deps,
    savedContextNodes: getSavedCtxNodes(),
    willUnmountFuncs: [],
    didUnmountFuncs: [],
  };

  setUnmountFuncs(expNode);

  if (expNode.willUnmountFuncs) {
    // ---- Add expNode willUnmount func to the global UnmountStore
    addWillUnmount(expNode, runLifeCycle.bind(expNode, expNode.willUnmountFuncs));
  }
  if (expNode.didUnmountFuncs) {
    // ---- Add expNode didUnmount func to the global UnmountStore
    addDidUnmount(expNode, runLifeCycle.bind(expNode, expNode.didUnmountFuncs));
  }
  return expNode;
}

export function updateExpNode(expNode: ExpNode, valueFunc: () => VNode[], deps: unknown[]) {
  if (cache(expNode, deps)) return;
  removeNodesWithUnmount(expNode, expNode._$nodes);
  const newNodes = geneNewNodesInCtx(expNode, () => getExpressionResult(valueFunc));
  if (newNodes.length === 0) {
    expNode._$nodes = [];
    return;
  }
  const parentEl = expNode._$parentEl!;
  const flowIndex = getFlowIndexFromNodes(parentEl._$nodes, expNode);
  const nextSibling = parentEl.childNodes[flowIndex];
  appendNodesWithSibling(newNodes, parentEl, nextSibling);
  runDidMount();

  expNode._$nodes = newNodes;
}

function cache(expNode: ExpNode, deps: unknown[]) {
  if (!deps || !deps.length) return false;
  if (equal(deps, expNode.deps)) return true;
  expNode.deps = deps;
  return false;
}
