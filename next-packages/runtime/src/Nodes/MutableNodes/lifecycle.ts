import { InulaBaseNode } from '../../types';
import { InulaStore } from '../../store';
import { MutableContextNode } from './context';
import { enterCompNode } from '../CompNode/node';
import { leaveCompNode } from '../CompNode/node';
import { addDidUnmount, addWillUnmount } from '../../lifecycle';

export class MutableLifecycleNode extends MutableContextNode {
  willUnmountScopedStore?: (() => void)[];
  didUnmountScopedStore?: (() => void)[];

  constructor() {
    super();
  }

  setUnmountFuncs() {
    this.willUnmountScopedStore = InulaStore.global.WillUnmountScopedStore.pop();
    this.didUnmountScopedStore = InulaStore.global.DidUnmountScopedStore.pop();
  }

  runWillUnmount = () => {
    if (!this.willUnmountScopedStore) return;
    for (let i = 0; i < this.willUnmountScopedStore.length; i++) this.willUnmountScopedStore[i]();
  };

  runDidUnmount = () => {
    if (!this.didUnmountScopedStore) return;
    for (let i = this.didUnmountScopedStore.length - 1; i >= 0; i--) this.didUnmountScopedStore[i]();
  };

  removeNodes(nodes: InulaBaseNode[]) {
    this.runWillUnmount();
    super.removeNodes(nodes);
    this.runDidUnmount();
  }

  newNodesInContext(newNodesFunc: () => InulaBaseNode[]) {
    enterCompNode(this.owner);
    this.initUnmountStore();
    const newNodes = super.newNodesInContext(newNodesFunc);
    this.setUnmountFuncs();
    leaveCompNode();
    return newNodes;
  }
}
