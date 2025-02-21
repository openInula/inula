import { InulaNodeType } from '../../consts';
import { runDidMount } from '../../lifecycle';
import { Bits, InulaBaseNode, Value } from '../../types';
import { getCurrentCompNode } from '../CompNode/node';
import { appendNodesWithSibling, cached, getFlowIndexFromNodes, init, update } from '../utils';
import { MutableLifecycleNode } from './lifecycle';

class ConditionalNode extends MutableLifecycleNode implements InulaBaseNode {
  inulaType = InulaNodeType.Cond;

  nodes?: InulaBaseNode[];

  currentBranch = -1;

  updater;

  reactBits: Bits;

  constructor(updater: (node: ConditionalNode) => InulaBaseNode[], reactBits: Bits) {
    super();
    this.updater = updater;
    this.reactBits = reactBits;
    this.initUnmountStore();
    this.nodes = updater(this);
    this.setUnmountFuncs();
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

  update() {
    const prevBranch = this.currentBranch;
    const prevFuncs = [this.willUnmountScopedStore, this.didUnmountScopedStore];
    const newNodes = this.newNodesInContext(() => this.updater(this));

    if (prevBranch === this.currentBranch) {
      // ---- Same condition return
      [this.willUnmountScopedStore, this.didUnmountScopedStore] = prevFuncs;
      for (let i = 0; i < this.nodes!.length; i++) {
        update(this.nodes![i]);
      }
      return;
    }
    const newFuncs = [this.willUnmountScopedStore, this.didUnmountScopedStore];
    [this.willUnmountScopedStore, this.didUnmountScopedStore] = prevFuncs;
    if (this.nodes && this.nodes.length > 0) {
      this.removeNodes(this.nodes);
    }
    [this.willUnmountScopedStore, this.didUnmountScopedStore] = newFuncs;

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
