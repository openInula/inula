import { InulaNodeType } from '../../consts';
import { runDidMount } from '../../lifecycle';
import { Bits, InulaBaseNode, Value } from '../../types';
import { appendNodesWithSibling, cached, getFlowIndexFromNodes, init } from '../utils';
import { MutableLifecycleNode } from './lifecycle';
import { createTextNode } from '../HTMLNode';

class ExpNode extends MutableLifecycleNode implements InulaBaseNode {
  inulaType = InulaNodeType.Cond;

  nodes?: InulaBaseNode[];

  dirtyBits?: Bits;

  updater;

  reactBits: Bits;

  dependenciesFunc: () => Value[];
  cachedDeps?: Value[];

  constructor(updater: () => InulaBaseNode[], dependenciesFunc: () => Value[], reactBits: Bits) {
    super();
    this.updater = updater;
    this.reactBits = reactBits;
    this.dependenciesFunc = dependenciesFunc;
    this.nodes = this.getExpressionResult();
  }

  update() {
    if (cached(this.dependenciesFunc(), this.cachedDeps)) return;
    const prevFuncs = [this.willUnmountScopedStore, this.didUnmountScopedStore];
    const newNodes = this.newNodesInContext(() => this.getExpressionResult());

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

  getExpressionResult() {
    let nodes = this.updater();
    if (!Array.isArray(nodes)) nodes = [nodes];
    return nodes
      .flat(1)
      .filter(node => node !== undefined && node !== null && typeof node !== 'boolean')
      .map(node => {
        if (typeof node === 'string' || typeof node === 'number' || typeof node === 'bigint') {
          // TODO DO
          return createTextNode(`${node}`, () => {});
        }
        if (typeof node === 'function' && node.$$isSlice) {
          return node();
        }
        return node;
      })
      .flat(1);
  }
}

export const createExpNode = (updater: () => InulaBaseNode[], dependenciesFunc: () => Value[], reactBits: Bits) => {
  return new ExpNode(updater, dependenciesFunc, reactBits);
};
