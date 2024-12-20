
import { Bits, Value, InulaBaseNode, Updater } from '../../types';
import { InulaNodeType } from '../../consts';
import { CompNode } from '../CompNode';
import { addWillUnmount } from '../../lifecycle';
import { InulaStore } from '../../store';
import { InitDirtyBitsMask, willReact } from '../utils';
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

  firstUpdate? = true;
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
    if (this.firstUpdate) {
      delete this.firstUpdate;
      return;
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
    this.contexts[contextName] = value;
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

export const useContext = (context: Context, compNode: CompNode) => {
  for (let i = InulaStore.global.CurrentContextStore.length - 1; i >= 0; i--) {
    const currentContext = InulaStore.global.CurrentContextStore[i];
    if (currentContext.contextId === context.id) {
      currentContext.consumers.push(compNode);
      // ---- Remove the consumer from the context when the component unmounts
      addWillUnmount(removeConsumer.bind(null, currentContext, compNode));
      return currentContext.contexts;
    }
  }
  return context.defaultValue ?? {};
}