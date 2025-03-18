
import { Bits, Value, InulaBaseNode, Updater } from '../../types';
import { InulaNodeType } from '../../consts';
import { CompNode } from '../CompNode';
import { addWillUnmount } from '../../lifecycle';
import { InulaStore } from '../../store';
import { InitDirtyBitsMask, update, willReact } from '../utils';
import { cached } from '../utils';

export type ContextID = Symbol;

export type Context = {
  id: ContextID;
  defaultValue?: Record<string, Value>;
}

export class ContextNode implements InulaBaseNode {
  inulaType = InulaNodeType.Context;

  nodes?: InulaBaseNode[];

  dirtyBits?: Bits;

  updater;

  contextId: ContextID;

  contexts: Record<string, Value> = {};

  consumers: CompNode[] = [];

  constructor(contextId: ContextID, updater: Updater<ContextNode>) {
    if (!InulaStore.global.CurrentContextStore) InulaStore.global.CurrentContextStore = [];
    // TODO Check if same context is already in the store (can't allow nested same contexts)
    this.contextId = contextId;
    this.updater = updater;
    this.init()
    InulaStore.global.CurrentContextStore.push(this);
  }

  init() {
    this.dirtyBits = InitDirtyBitsMask;
    this.updater?.(this);
    delete this.dirtyBits;
  }

  with(...children: InulaBaseNode[]) {
    this.nodes = children;
    InulaStore.global.CurrentContextStore.pop();
    return this;
  }

  update() {
    for (let i = 0; i < (this.nodes?.length ?? 0); i++) {
      update(this.nodes![i], this.dirtyBits!);
    }
    this.updater(this);
  }

  cachedDependenciesMap?: Record<string, Value[]>;
  updateContext(contextName: string, valueFunc: () => Value, deps: Value[], reactBits: Bits) {
    if (!willReact(this.dirtyBits!, reactBits)) return;
    if (!this.cachedDependenciesMap) this.cachedDependenciesMap = {};
    const cachedDeps = this.cachedDependenciesMap![contextName];
    if (cached(deps, cachedDeps)) return;
    const value = valueFunc();
    if (contextName === '*spread*') {
      this.contexts = {
        ...this.contexts,
        ...value,
      };
    } else {
      this.contexts[contextName] = value;
    }
    this.consumers.forEach(consumer => consumer.updateContext(this.contextId, contextName, value));
    this.cachedDependenciesMap![contextName] = deps;
  }
}

export const createContextNode = (context: Context, updater: (node: ContextNode) => void) => {
  return new ContextNode(context.id, updater);
}

export const createContext = (defaultValue?: Record<string, Value>) => {
  return {
    id: Symbol('inula-context'),
    defaultValue
  }
}

const removeConsumer = (contextNode: ContextNode, compNode: CompNode) => {
  const index = contextNode.consumers.indexOf(compNode);
  if (index > -1) contextNode.consumers.splice(index, 1);
}

export const useContext = (context: Context, compNode?: CompNode) => {
  if (!InulaStore.global.CurrentContextStore) {
    return context.defaultValue ?? {};
  }

  for (let i = InulaStore.global.CurrentContextStore.length - 1; i >= 0; i--) {
    const currentContext = InulaStore.global.CurrentContextStore[i];
    if (currentContext.contextId === context.id) {
      if (compNode) {
        currentContext.consumers.push(compNode);
        // ---- Remove the consumer from the context when the component unmounts
        addWillUnmount(removeConsumer.bind(null, currentContext, compNode));
      }
      return currentContext.contexts;
    }
  }
  return context.defaultValue ?? {};
}