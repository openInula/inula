import { Component, InulaBaseNode } from '../../types';
import { createExpNode } from './expression';
import { createConditionalNode } from './conditional';
import { Context, ContextNode, createContext, createContextNode, useContext } from '../UtilNodes/context';
import { compBuilder, getCurrentCompNode } from '../CompNode/node';
import { MutableLifecycleNode } from './lifecycle';
import { appendNodesWithSibling, getFlowIndexFromNodes, init, InitDirtyBitsMask, update } from '../utils';
import { runDidMount } from '../../lifecycle';

let suspenseContext: Context | null = null;
function getSuspenseContext() {
  if (!suspenseContext) {
    suspenseContext = createContext();
  }
  return suspenseContext;
}

class SuspenseNode extends MutableLifecycleNode {
  inulaType = 'Suspense';
  didSuspend = false;
  promiseSet = new Set<PromiseType<{ default: Component }>>();
  fallbackNode!: InulaBaseNode;
  children!: InulaBaseNode[];
  contextNode: ContextNode;
  nodes: InulaBaseNode[] = [];
  constructor() {
    super();
    this.contextNode = createContextNode(getSuspenseContext(), $$node => {
      $$node.updateContext('handlePromise', () => this.handlePromise.bind(this), [], 0);
    });
    this.nodes = [this.contextNode];
  }

  with(children: InulaBaseNode[]) {
    this.children = children;
    if (!this.didSuspend) {
      this.contextNode.with(...this.children);
    }

    return this;
  }

  fallback(fallback: () => InulaBaseNode) {
    this.fallbackNode = fallback();
    return this;
  }

  clearPromise(promise: PromiseType<{ default: Component }>) {
    this.promiseSet.delete(promise);
    if (this.promiseSet.size === 0) {
      this.didSuspend = false;
      this.toggle();
    }
  }

  handlePromise(promise: PromiseType<{ default: Component }>) {
    if (this.promiseSet.has(promise)) return;
    if (this.didSuspend === false) {
      this.didSuspend = true;
      this.toggle();
    }
    this.promiseSet.add(promise);
    const clear = this.clearPromise.bind(this, promise);
    promise.then(clear, clear);
  }

  toggle() {
    const compNode = getCurrentCompNode();
    if (compNode && compNode.dirtyBits === InitDirtyBitsMask) {
      this.contextNode.nodes = this.getCurrentContent();
    } else {
      this.render();
    }
  }
  getCurrentContent() {
    if (this.didSuspend) {
      return [this.fallbackNode];
    } else {
      return this.children;
    }
  }

  render() {
    const prevFuncs = [this.willUnmountScopedStore, this.didUnmountScopedStore];
    const newNodes = this.newNodesInContext(() => {
      return this.getCurrentContent();
    });

    const newFuncs = [this.willUnmountScopedStore, this.didUnmountScopedStore];
    [this.willUnmountScopedStore, this.didUnmountScopedStore] = prevFuncs;
    if (this.contextNode.nodes && this.contextNode.nodes.length > 0) {
      this.removeNodes(this.contextNode.nodes);
    }
    [this.willUnmountScopedStore, this.didUnmountScopedStore] = newFuncs;

    this.contextNode.nodes = newNodes;
    if (this.contextNode.nodes.length === 0) return;

    // ---- Faster append with nextSibling rather than flowIndex
    const flowIndex = getFlowIndexFromNodes(this.parentEl!.nodes!, this);
    const nextSibling = this.parentEl!.childNodes[flowIndex];

    appendNodesWithSibling(this.nodes, this.parentEl!, nextSibling);
    init(this.nodes!);

    runDidMount();
  }

  update() {
    for (let i = 0; i < (this.nodes?.length ?? 0); i++) {
      update(this.nodes![i]);
    }
  }
}

export function createSuspenseNode() {
  return new SuspenseNode();
}

export interface PromiseType<R> {
  then<U>(
    onFulfill: (value: R) => void | PromiseType<U> | U,
    onReject: (error: any) => void | PromiseType<U> | U
  ): void | PromiseType<U>;
}

export function lazy<T extends Component>(promiseConstructor: () => PromiseType<{ default: T }>) {
  let value: T | null = null;
  let promise: PromiseType<{ default: T }> | null = null;
  let status = 'init';
  const instance: InulaBaseNode = {
    nodes: [],
  };
  return function (props: Record<string, any>) {
    const { handlePromise } = useContext(getSuspenseContext());
    if (status === 'init') {
      status = 'pending';
      promise = promiseConstructor();
      promise.then(
        function (module) {
          value = module.default;
          status = 'fullfilled';
          instance.nodes = [value(props)];
        },
        function (error) {
          status = 'rejected';
          value = error;
        }
      );
    }
    if (status !== 'fullfilled') {
      handlePromise(promise);
    }
    return instance;
  };
}
