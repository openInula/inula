import { DLNode, DLNodeType } from './DLNode';
import { DLStore, cached } from './store';

export class ContextProvider extends DLNode {
  constructor(ctx, envs, depsArr) {
    super(DLNodeType.Env);
    // Declare a global variable to store the environment variables
    if (!('DLEnvStore' in DLStore.global)) DLStore.global.envNodeMap = new Map();

    this.context = ctx;
    this.envs = envs;
    this.depsArr = depsArr;
    this.updateNodes = new Set();

    this.replaceContextValue();
  }

  cached(deps, name) {
    if (!deps || !deps.length) return false;
    if (cached(deps, this.depsArr[name])) return true;
    this.depsArr[name] = deps;
    return false;
  }

  /**
   * @brief Update a specific env, and update all the comp nodes that depend on this env
   * @param name - The name of the environment variable to update
   * @param value - The new value of the environment variable
   */
  updateContext(name, valueFunc, deps) {
    if (this.cached(deps, name)) return;
    const value = valueFunc();
    this.envs[name] = value;
    this.updateNodes.forEach(node => {
      node._$updateContext(name, value, this.context);
    });
  }

  replaceContextValue() {
    this.prevValue = this.context.value;
    this.prevEnvNode = DLStore.global.envNodeMap.get(this.context.id);
    this.context.value = this.envs;

    DLStore.global.envNodeMap.set(this.context.id, this);
  }

  /**
   * @brief Add a node to this.updateNodes, delete the node from this.updateNodes when it unmounts
   * @param node - The node to add
   */
  addNode(node) {
    this.updateNodes.add(node);
    DLNode.addWillUnmount(node, this.updateNodes.delete.bind(this.updateNodes, node));
  }

  /**
   * @brief Set this._$nodes, and exit the current env
   * @param nodes - The nodes to set
   */
  initNodes(nodes) {
    this._$nodes = nodes;
    this.context.value = this.prevValue;
    if (this.prevEnvNode) {
      DLStore.global.envNodeMap.set(this.context.id, this.prevEnvNode);
    } else {
      DLStore.global.envNodeMap.delete(this.context.id);
    }
    this.prevValue = null;
    this.prevEnvNode = null;
  }
}

export function replaceEnvNodes(envNodeMap) {
  for (const [ctxId, envNode] of envNodeMap.entries()) {
    envNode.replaceContextValue();
  }
}
