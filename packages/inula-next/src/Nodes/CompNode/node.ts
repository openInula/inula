import { Bits, Lifecycle, Value, Updater, InulaBaseNode } from '../../types';
import { InulaNodeType } from '../../consts';
import { addDidMount, addDidUnmount, addWillUnmount } from '../../lifecycle';
import { schedule } from '../../scheduler';
import { cached, InitDirtyBitsMask, update } from '../utils';
import { Context, ContextID } from '../UtilNodes';
import { HookNode } from '../HookNode';

const BUILTIN_PROPS = ['ref', 'key'];
// TODO - We'll see if this is necessary - unmounted

const compStack: CompNode[] = [];
export function getCurrentCompNode() {
  return compStack[compStack.length - 1];
}

export function enterCompNode(compNode: CompNode) {
  compStack.push(compNode);
}

export function leaveCompNode() {
  compStack.pop();
}

type DerivedStateComputation = [() => Value, () => Value[], Bits, string];
type HookComputation = [(dirty: Bits) => void];

export abstract class ReactiveNode {
  cachedDependenciesMap?: Record<string, Value[]>;

  computations?: Array<DerivedStateComputation | HookComputation>;

  derivedCount?: number;

  owner?: CompNode;

  props: Record<string, Value> = {};

  abstract wave(_: Value, dirty: Bits): void;

  constructor() {
    this.owner = getCurrentCompNode();
  }

  deriveState(updateDerivedFunc: () => Value, dependenciesFunc: () => Value[], reactBits: Bits) {
    if (!this.computations) this.computations = [];
    // ---- Run the updateDerivedFunc to get the initial value
    updateDerivedFunc();
    // ---- Add to cachedDependenciesMap
    if (!this.cachedDependenciesMap) this.cachedDependenciesMap = {};
    if (this.derivedCount === undefined) this.derivedCount = 0;
    const cacheKey = `derived$${this.derivedCount}`;
    this.cachedDependenciesMap[cacheKey] = dependenciesFunc();
    this.computations.push([updateDerivedFunc, dependenciesFunc, reactBits, cacheKey]);
    this.derivedCount++;
  }

  watch(updateDerivedFunc: () => Value, dependenciesFunc: () => Value[], reactBits: Bits) {
    this.deriveState(updateDerivedFunc, dependenciesFunc, reactBits);
  }

  updateState(dirty: Bits) {
    if (!this.computations) return;
    for (let i = 0; i < this.computations.length; i++) {
      const computation = this.computations[i];
      if (computation.length === 1) {
        const [updateFn] = computation;
        updateFn(dirty);
        continue;
      }

      const [updateDerivedFunc, dependenciesFunc, reactBits, cacheKey] = computation;
      // ---- Hooks
      if (!reactBits) {
        updateDerivedFunc();
        continue;
      }
      // ---- If the state is not dirty, skip the update
      if (!(dirty & reactBits)) continue;
      const dependencies = dependenciesFunc();
      const cachedDeps = this.cachedDependenciesMap?.[cacheKey];
      // ---- If the dependencies are the same, skip the update
      if (cached(dependencies, cachedDeps)) continue;
      updateDerivedFunc();
      this.cachedDependenciesMap![cacheKey] = dependencies;
    }
  }

  // ---- Out of component update START ----
  // ---- PROPS START ----
  updatePropMap?: Record<string, [(value: Value) => void, Bits]>;
  addProp(propName: string, updatePropFunc: (value: Value) => void, waveBits: Bits) {
    if (!this.updatePropMap) this.updatePropMap = {};
    this.updatePropMap[propName] = [updatePropFunc, waveBits];
  }

  executePropUpdate(
    updatePropMap: Record<string, [(value: Value) => void, Bits]>,
    propName: string,
    valueFunc: () => Value
  ) {
    const propValue = valueFunc();
    if (updatePropMap['$whole$']) {
      const [updatePropFunc, waveBits] = updatePropMap['$whole$'];
      if (propName === '*spread*') {
        this.wave(updatePropFunc(propValue), waveBits);
      } else {
        this.wave(updatePropFunc({ [propName]: propValue }), waveBits);
      }
    } else if (updatePropMap[propName]) {
      const [updatePropFunc, waveBits] = updatePropMap[propName];
      this.wave(updatePropFunc(propValue), waveBits);
      this.props[propName] = propValue;
    } else {
      // ---- Rest props
      const [updatePropFunc, waveBits] = updatePropMap['$rest$'];
      this.wave(updatePropFunc({ [propName]: propValue }), waveBits);
    }
  }
  // ---- PROP END ----

  // ---- CONTEXT START ----
  updateContextMap?: Record<string, [ContextID, (value: Value) => void, Bits]>;

  addContext(context: Context, contextName: string, updateContextFunc: (value: Value) => void, waveBits: Bits) {
    if (!this.updateContextMap) this.updateContextMap = {};
    this.updateContextMap[contextName] = [context.id, updateContextFunc, waveBits];
  }

  updateContext(contextId: ContextID, contextName: string, value: Value) {
    if (this.updateContextMap) {
      if (Object.keys(this.updateContextMap).length === 1 && '$whole$' in this.updateContextMap) {
        value = { [contextName]: value };
        contextName = '$whole$';
      }

      const [expectedContextId, updateContextFunc, waveBits] = this.updateContextMap[contextName];
      if (contextId !== expectedContextId) return;
      this.wave(updateContextFunc(value), waveBits);
    }
  }
  // ---- CONTEXT END ----

  // ---- HOOKS START ----
  useHook(hookNode: HookNode, emit: (value: Value) => void, hookUpdater: (hookNode: HookNode) => void) {
    emit(hookNode.value!());
    hookNode.triggerUpdate = () => {
      emit(hookNode.value!());
    };

    if (!this.computations) this.computations = [];
    if (this.derivedCount === undefined) this.derivedCount = 0;
    this.computations.push([
      dirty => {
        hookNode.propDirtyBits = dirty;
        hookUpdater(hookNode);
      },
    ]);
  }
  // ---- HOOKS END ----

  // ---- Lifecycles
  didMount(fn: Lifecycle) {
    addDidMount(fn);
  }

  willUnmount(fn: Lifecycle) {
    addWillUnmount(fn);
  }

  didUnmount(fn: Lifecycle) {
    addDidUnmount(fn);
  }
}

/**
 * @brief Component Node
 * @description
 * ---- Extract CompNode as a class especially for function 'updateDerived',
 *      because if we assign a default function to an object,
 *      it'll be counted in memory usage for each object.
 *      But if we assign a function to a class, it'll be counted only once.
 * ---- Also, for some must-use functions, we can assign them to the class prototype.
 *      Other helper functions will be coded as separate functions with
 *      a CompNode instance as the first parameter.
 * ---- Updating:
 *     - updateState: parameter is an dirty
 *        because we need to maintain the order of the state updates
 *     - updateView: parameter is a merged dirty
 *        because we need to update the view only once in the next microtask
 */
export class CompNode extends ReactiveNode implements InulaBaseNode {
  inulaType = InulaNodeType.Comp;

  // ---- All children nodes
  nodes?: InulaBaseNode[];

  // ---- Update functions
  updater?: Updater<CompNode>;

  subComponents?: CompNode[];

  slices?: InulaBaseNode[];

  unmounted = false;

  type?: (props: Record<string, Value>) => CompNode;

  setUnmounted = () => {
    this.unmounted = true;
  };

  constructor(parentComponents: CompNode[]) {
    super();
    for (let i = 0; i < parentComponents.length; i++) {
      if (parentComponents[i].subComponents) {
        parentComponents[i].subComponents!.push(this);
      } else {
        parentComponents[i].subComponents = [this];
      }
    }

    this.didMount(() => {
      this.unmounted = false;
    });
    this.dirtyBits = InitDirtyBitsMask;
  }

  updateProp(propName: string, valueFunc: () => Value, dependencies: Value[], reactBits: Bits) {
    if (BUILTIN_PROPS.includes(propName)) {
      return;
    }
    // ---- Not event rest props is defined
    if (!this.updatePropMap) return;
    // ---- If not reacting to the change
    if (!(reactBits & this.owner!.dirtyBits!)) return;
    const cacheKey = `prop$${propName}`;
    const cachedDeps = this.cachedDependenciesMap?.[cacheKey];
    // ---- If the dependencies are the same, skip the update
    if (cached(dependencies, cachedDeps)) return;

    this.executePropUpdate(this.updatePropMap, propName, valueFunc);

    if (!this.cachedDependenciesMap) this.cachedDependenciesMap = {};
    this.cachedDependenciesMap[cacheKey] = dependencies;
  }

  // ---- In component update START----
  wave(_: Value, dirty: Bits) {
    this.updateState(dirty);
    this.updateViewAsync(dirty);
  }

  dirtyBits?: Bits;
  /**
   * @brief Update view asynchronously
   * @param dirty
   * @returns
   */
  updateViewAsync(dirty: Bits) {
    if (this.dirtyBits && this.dirtyBits !== InitDirtyBitsMask) {
      this.dirtyBits |= dirty;
      return;
    }
    this.dirtyBits = dirty;
    // ---- Schedule the updateView in the next microtask
    schedule(() => {
      if (this.unmounted) {
        return;
      }
      // ---- Merge all the dirtyBitsArrToUpdate to one single dirty
      // ---- e.g. [0b0101, 0b0010] -> 0b0111
      // ---- Call the updateView with the merged dirty bits to update
      //       1. All the returning nodes
      for (let i = 0; i < (this.nodes?.length ?? 0); i++) {
        update(this.nodes![i]);
      }
      //       2. All the sub components
      for (let i = 0; i < (this.subComponents?.length ?? 0); i++) {
        this.subComponents![i].wave(null, dirty);
      }
      for (let i = 0; i < (this.slices?.length ?? 0); i++) {
        update(this.slices![i]);
      }
      // ---- Clear the dirtyBits after the updateView is called
      delete this.dirtyBits;
    });
  }

  prepare() {
    return this;
  }

  init(node: InulaBaseNode | null) {
    if (node) {
      this.nodes = [node];
    }
    compStack.pop();
    delete this.dirtyBits;

    return this;
  }

  update() {
    this.updater?.(this);
  }
}

/**
 * @brief Create a component node
 * @returns
 */
export const compBuilder = (...parentComponents: CompNode[]) => {
  const comp = new CompNode(parentComponents);
  enterCompNode(comp);
  return comp;
};

export const createCompNode = (
  compFn: (props: Record<string, Value>) => CompNode,
  props: Record<string, Value>,
  updater: Updater<CompNode> | null
) => {
  if (props && props['*spread*']) {
    const spreadProps = props['*spread*'];
    delete props['*spread*'];
    Object.assign(props, spreadProps);
  }
  const compNode = compFn(props);
  if (compNode) {
    compNode.props = props;
    compNode.type = compFn;
    if (updater) compNode.updater = updater;
  }
  return compNode;
};

/**
 * Handle children nodes, like:
 * <Button><Child /></Button>
 * will be transformed to
 * <Button>{createChildren(() => <Child />)}</Button>
 *
 * We need bind the children nodes to the current compNode,
 * so that the children nodes can be updated when the compNode is updated.
 * @param nodesFn
 * @param compNode
 * @returns
 */
export function createChildren(nodesFn: () => InulaBaseNode[], compNode: CompNode) {
  const getter = () => {
    enterCompNode(compNode);
    let children = nodesFn();
    leaveCompNode();

    if (!Array.isArray(children)) {
      children = [children];
    }
    if (compNode.slices) {
      compNode.slices.push(...children);
    } else {
      compNode.slices = [...children];
    }
    return children;
  };
  getter.$$isChildren = true;

  return getter;
}
