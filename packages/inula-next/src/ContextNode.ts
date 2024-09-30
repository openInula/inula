import { InulaNodeType } from '@openinula/next-shared';
import { addWillUnmount } from './lifecycle';
import { equal } from './equal';
import { VNode, ContextNode, Context, CompNode, HookNode } from './types';
import { currentComp } from '.';

let contextNodeMap: Map<symbol, ContextNode<any>>;

export function getContextNodeMap() {
  return contextNodeMap;
}

export function createContextNode<V extends Record<PropertyKey, any>>(
  ctx: Context<V>,
  value: V,
  depMap: Record<keyof V, Array<unknown>>
) {
  if (!contextNodeMap) contextNodeMap = new Map();

  const ContextNode: ContextNode<V> = {
    value: value,
    depMap: depMap,
    context: ctx,
    __type: InulaNodeType.Context,
    consumers: new Set(),
    _$nodes: [],
  };

  replaceContextValue(ContextNode);

  return ContextNode;
}

/**
 * @brief Update a specific key of context, and update all the comp nodes that depend on this context
 * @param contextNode
 * @param name - The name of the environment variable to update
 * @param valueFunc
 * @param deps
 */
export function updateContextNode<V extends Record<string, any>>(
  contextNode: ContextNode<V>,
  name: keyof V,
  valueFunc: () => V[keyof V],
  deps: Array<V[keyof V]>
) {
  if (cached(contextNode, deps, name)) return;
  const value = valueFunc();
  contextNode.value[name] = value;
  contextNode.consumers.forEach(node => {
    // should have updateContext, otherwise the bug of compiler
    node.updateContext!(contextNode.context, name as string, value);
  });
}

function cached<V extends Record<PropertyKey, any>>(contextNode: ContextNode<V>, deps: Array<unknown>, name: keyof V) {
  if (!deps || !deps.length) return false;
  if (equal(deps, contextNode.depMap[name])) return true;
  contextNode.depMap[name] = deps;
  return false;
}

function replaceContextValue<V extends Record<PropertyKey, any>>(contextNode: ContextNode<V>) {
  contextNode.prevValue = contextNode.context.value;
  contextNode.prevContextNode = contextNodeMap!.get(contextNode.context.id);
  contextNode.context.value = contextNode.value;

  contextNodeMap!.set(contextNode.context.id, contextNode);
}

/**
 * @brief Set this._$nodes, and exit the current context
 * @param contextNode
 * @param nodes - The nodes to set
 */
export function initContextChildren<V extends Record<PropertyKey, any>>(contextNode: ContextNode<V>, nodes: VNode[]) {
  contextNode._$nodes = nodes;
  contextNode.context.value = contextNode.prevValue || null;
  if (contextNode.prevContextNode) {
    contextNodeMap!.set(contextNode.context.id, contextNode.prevContextNode);
  } else {
    contextNodeMap!.delete(contextNode.context.id);
  }
  contextNode.prevValue = null;
  contextNode.prevContextNode = null;
}

export function replaceContext(contextNodeMap: Map<symbol, ContextNode<any>>) {
  for (const [ctxId, contextNode] of contextNodeMap.entries()) {
    replaceContextValue(contextNode);
  }
}

/**
 * @brief Add a node to this.updateNodes, delete the node from this.updateNodes when it unmounts
 */
export function addConsumer(contextNode: ContextNode<any>, node: CompNode | HookNode) {
  contextNode.consumers.add(node);
  addWillUnmount(node, contextNode.consumers.delete.bind(contextNode.consumers, node));
}

export function createContext<T extends Record<PropertyKey, any> | null>(defaultVal: T): Context<T> {
  return {
    id: Symbol('inula-ctx'),
    value: defaultVal,
  };
}

export function useContext<T extends Record<PropertyKey, any> | null>(ctx: Context<T>, key?: keyof T): T | T[keyof T] {
  if (contextNodeMap) {
    const contextNode = contextNodeMap.get(ctx.id);
    if (contextNode) {
      addConsumer(contextNode, currentComp!);
    }
  }

  if (key && ctx.value) {
    return ctx.value[key];
  }

  return ctx.value as T;
}
