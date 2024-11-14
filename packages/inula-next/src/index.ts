import { runDidMount } from './lifecycle';
import { insertNode } from './renderer/dom';
import { equal } from './equal';
import { constructComp, createCompNode, updateCompNode } from './CompNode';
import { constructHook, createHookNode } from './HookNode';
import { CompNode, VNode, InulaHTMLNode, HookNode, ChildrenNode, InulaNode } from './types';
import { createContextNode, updateContextNode } from './ContextNode';
import { InulaNodeType } from '@openinula/next-shared';
import { createChildrenNode, updateChildrenNode } from './ChildrenNode';
import { createForNode, updateForChildren, updateForNode } from './MutableNode/ForNode';
import { createExpNode, updateExpNode } from './MutableNode/ExpNode';
import { createCondNode, updateCondChildren, updateCondNode } from './MutableNode/CondNode';
import { JSX } from '../types/jsx';
type JSXElement = JSX.Element;
export type { JSX, JSXElement };

export * from './renderer/dom';
export * from './CompNode';
export * from './ContextNode';
export * from './MutableNode/ForNode';
export * from './MutableNode/ExpNode';
export * from './MutableNode/CondNode';

export type FunctionComponent = (props: Record<PropertyKey, unknown>) => InulaNode;

export function render(compFn: FunctionComponent, container: HTMLElement): void {
  if (container == null) {
    throw new Error('Render target is empty. Please provide a valid DOM element.');
  }
  container.innerHTML = '';
  const node = Comp(compFn);
  insertNode(container as InulaHTMLNode, node, 0);
  runDidMount();
}

// export function unmount(container: InulaHTMLNode): void {
//   const node = container.firstChild;
//   if (node) {
//     removeNode(node);
//   }
// }

export function untrack<V>(callback: () => V): V {
  return callback();
}

export let currentComp: CompNode | HookNode | null = null;

export function inMount(): boolean {
  return !!currentComp;
}

interface CompUpdater {
  updateState: (bit: number) => void;
  updateProp: (propName: string, newValue: unknown) => void;
  getUpdateViews: () => [HTMLElement[], (bit: number) => HTMLElement[]];
  updateDerived: (newValue: unknown, bit: number) => void;
}

export function Comp(compFn: FunctionComponent, props: Record<string, unknown> = {}): CompNode {
  if (props['*spread*']) {
    props = { ...props, ...props['*spread*'] };
  }
  return mountNode(() => createCompNode(), compFn, props);
}

function mountNode<T extends CompNode | HookNode>(
  ctor: () => T,
  compFn: FunctionComponent,
  props: Record<string, unknown>
): T {
  const compNode = ctor();
  const prevNode = currentComp;
  try {
    currentComp = compNode;
    compFn(props);
    // eslint-disable-next-line no-useless-catch
  } catch (err) {
    throw err;
  } finally {
    currentComp = prevNode;
  }
  return compNode;
}

export function createComponent(compUpdater: CompUpdater): CompNode {
  if (!currentComp || currentComp.__type !== InulaNodeType.Comp) {
    throw new Error('Should not call createComponent outside the component function');
  }
  constructComp(currentComp, compUpdater);
  return currentComp;
}

export function notCached(node: VNode, cacheId: string, cacheValues: unknown[]): boolean {
  if (!cacheValues || !cacheValues.length) return false;
  if (!node.$nonkeyedCache) {
    node.$nonkeyedCache = {};
  }
  if (!equal(cacheValues, node.$nonkeyedCache[cacheId])) {
    node.$nonkeyedCache[cacheId] = cacheValues;
    return true;
  }
  return false;
}

export function didMount(fn: () => void) {
  throw new Error('lifecycle should be compiled, check the babel plugin');
}

export function willUnmount(fn: () => void) {
  throw new Error('lifecycle should be compiled, check the babel plugin');
}

export function didUnmount(fn: () => void) {
  throw new Error('lifecycle should be compiled, check the babel plugin');
}

export function watch(fn: () => void) {
  throw new Error('watch should be compiled, check the babel plugin');
}

export function useHook(hookFn: (props: Record<string, unknown>) => HookNode, params: unknown[], bitMap: number) {
  if (currentComp) {
    const props = params.reduce<Record<string, unknown>>((obj, val, idx) => ({ ...obj, [`p${idx}`]: val }), {});
    // if there is the currentComp means we are mounting the component tree
    return mountNode(() => createHookNode(currentComp!, bitMap), hookFn, props);
  }
  throw new Error('useHook must be called within a component');
}

export function createHook(compUpdater: CompUpdater): HookNode {
  if (!currentComp || currentComp.__type !== InulaNodeType.Hook) {
    throw new Error('Should not call createComponent outside the component function');
  }
  constructHook(currentComp, compUpdater);
  return currentComp;
}

export function runOnce(fn: () => void): void {
  if (currentComp) {
    fn();
  }
}

export function createNode(type: InulaNodeType, ...args: unknown[]): VNode | ChildrenNode {
  switch (type) {
    case InulaNodeType.Context:
      return createContextNode(...(args as Parameters<typeof createContextNode>));
    case InulaNodeType.Children:
      return createChildrenNode(...(args as Parameters<typeof createChildrenNode>));
    case InulaNodeType.Comp:
      return createCompNode(...(args as Parameters<typeof createCompNode>));
    case InulaNodeType.Hook:
      return createHookNode(...(args as Parameters<typeof createHookNode>));
    case InulaNodeType.For:
      return createForNode(...(args as Parameters<typeof createForNode>));
    case InulaNodeType.Cond:
      return createCondNode(...(args as Parameters<typeof createCondNode>));
    case InulaNodeType.Exp:
      return createExpNode(...(args as Parameters<typeof createExpNode>));
    default:
      throw new Error(`Unsupported node type: ${type}`);
  }
}

export function updateNode(...args: unknown[]) {
  const node = args[0] as VNode;
  switch (node.__type) {
    case InulaNodeType.Context:
      updateContextNode(...(args as Parameters<typeof updateContextNode>));
      break;
    case InulaNodeType.Children:
      updateChildrenNode(...(args as Parameters<typeof updateChildrenNode>));
      break;
    case InulaNodeType.For:
      updateForNode(...(args as Parameters<typeof updateForNode>));
      break;
    case InulaNodeType.Cond:
      updateCondNode(...(args as Parameters<typeof updateCondNode>));
      break;
    case InulaNodeType.Exp:
      updateExpNode(...(args as Parameters<typeof updateExpNode>));
      break;
    case InulaNodeType.Comp:
    case InulaNodeType.Hook:
      updateCompNode(...(args as Parameters<typeof updateCompNode>));
      break;
    default:
      throw new Error(`Unsupported node type: ${node.__type}`);
  }
}

export function updateChildren(...args: unknown[]) {
  const node = args[0] as VNode;
  switch (node.__type) {
    case InulaNodeType.For:
      updateForChildren(...(args as Parameters<typeof updateForChildren>));
      break;
    case InulaNodeType.Cond:
      updateCondChildren(...(args as Parameters<typeof updateCondChildren>));
      break;
    default:
      throw new Error(`Unsupported node type: ${node.__type}`);
  }
}

export { initContextChildren, createContext, useContext } from './ContextNode';
export { initCompNode } from './CompNode';
export { emitUpdate } from './HookNode';
