import { InulaNodeType } from '../../consts';
import { runDidMount } from '../../lifecycle';
import { Bits, InulaBaseNode, Value } from '../../types';
import { appendNodesWithSibling, cached, getFlowIndexFromNodes, init } from '../utils';
import { MutableLifecycleNode } from './lifecycle';
import { createTextNode } from '../HTMLNode';

class ExpNode extends MutableLifecycleNode implements InulaBaseNode {
  inulaType = InulaNodeType.Cond;

  nodes?: InulaBaseNode[];

  updater;

  reactBits: Bits;

  dependenciesFunc: () => Value[];
  cachedDeps?: Value[];

  constructor(updater: () => Value, dependenciesFunc: () => Value[], reactBits: Bits) {
    super();
    this.updater = updater;
    this.reactBits = reactBits;
    this.dependenciesFunc = dependenciesFunc;
    this.initUnmountStore();
    this.nodes = this.getExpressionResult();
    this.setUnmountFuncs();
  }

  update() {
    if (!(this.reactBits & this.owner.dirtyBits!)) return;
    if (cached(this.dependenciesFunc(), this.cachedDeps)) return;
    const prevFuncs = [this.willUnmountScopedStore, this.didUnmountScopedStore];
    const newNodes = this.newNodesInContext(() => this.getExpressionResult());

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

  getExpressionResult() {
    let nodes = this.updater();
    if (!Array.isArray(nodes)) nodes = [nodes];
    return nodes
      .flat(1)
      .map((node: Value) => {
        if (typeof node === 'string' || typeof node === 'number' || typeof node === 'bigint') {
          // TODO DO
          return createTextNode(`${node}`, () => {});
        }
        if (typeof node === 'function' && node.$$isChildren) {
          return node();
        }
        return node;
      })
      .flat(1)
      .filter((node: Value) => node !== undefined && node !== null && typeof node !== 'boolean');
  }
}

export const createExpNode = (updater: () => Value, dependenciesFunc: () => Value[], reactBits: Bits) => {
  return new ExpNode(updater, dependenciesFunc, reactBits);
};
