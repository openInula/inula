import { InulaNodeType } from '../../consts';
import { runDidMount } from '../../lifecycle';
import { Bits, InulaBaseNode, Value } from '../../types';
import { appendNodesWithSibling, cached, getFlowIndexFromNodes, init, InitDirtyBitsMask, update } from '../utils';
import { MutableLifecycleNode } from './lifecycle';

class ConditionalNode extends MutableLifecycleNode implements InulaBaseNode {
  inulaType = InulaNodeType.Cond;

  nodes?: InulaBaseNode[];

  dirtyBits?: Bits;

  currentBranch = -1;

  updater;

  reactBits: Bits;

  constructor(updater: (node: ConditionalNode) => InulaBaseNode[], reactBits: Bits) {
    super();
    this.updater = updater;
    this.reactBits = reactBits;
    this.init();
  }

  conditionCacheMap?: Record<string, [boolean, Value[]]>;

  branch(branchNum: number) {
    if (this.currentBranch === branchNum) return true;
    this.currentBranch = branchNum;
    return false;
  }

  cachedCondition(branchNum: number, valueFunc: () => Value, dependencies: Value[]) {
    if (!this.conditionCacheMap) this.conditionCacheMap = {};
    const [cachedValue, cachedDeps] = this.conditionCacheMap[branchNum] ?? [null, null];
    if (cached(dependencies, cachedDeps)) return cachedValue;
    const value = valueFunc();
    this.conditionCacheMap[branchNum] = [value, dependencies];
    return value;
  }

  init() {
    this.dirtyBits = InitDirtyBitsMask;
    this.update();
    delete this.dirtyBits;
  }

  update() {
    if (this.currentBranch === -1) {
      this.nodes = this.updater?.(this);
      init(this.nodes!);
      return;
    }
    const prevBranch = this.currentBranch;
    const prevFuncs = [this.willUnmountScopedStore, this.didUnmountScopedStore];
    const newNodes = this.newNodesInContext(() => this.updater(this));

    if (prevBranch === this.currentBranch) {
      // ---- Same condition return
      [this.willUnmountScopedStore, this.didUnmountScopedStore] = prevFuncs;
      for (let i = 0; i < this.nodes!.length; i++) {
        update(this.nodes![i], this.dirtyBits!);
      }
      return;
    }
    const newFuncs = [this.willUnmountScopedStore, this.didUnmountScopedStore];
    [this.willUnmountScopedStore, this.didUnmountScopedStore] = newFuncs;
    if (this.nodes && this.nodes.length > 0) {
      this.removeNodes(this.nodes);
    }
    [this.willUnmountScopedStore, this.didUnmountScopedStore] = prevFuncs;

    this.nodes = newNodes;
    if (this.nodes.length === 0) return;

    // ---- Faster append with nextSibling rather than flowIndex
    const flowIndex = getFlowIndexFromNodes(this.parentEl!.nodes!, this);
    const nextSibling = this.parentEl!.childNodes[flowIndex];

    appendNodesWithSibling(this.nodes, this.parentEl!, nextSibling);
    init(this.nodes!);

    runDidMount();
  }
}

export const createConditionalNode = (updater: (node: ConditionalNode) => InulaBaseNode[], reactBits: Bits) => {
  return new ConditionalNode(updater, reactBits);
};
