import { Bits, Lifecycle, Value, Updater, InulaBaseNode } from '../../types';
import { InulaNodeType } from '../../consts';
import { addDidMount, addDidUnmount, addWillUnmount } from '../../lifecycle';
import { schedule } from '../../scheduler';
import { cached, init, InitDirtyBitsMask, update } from '../utils';
import { Context, ContextID } from '../UtilNodes';

// TODO - We'll see if this is necessary - unmounted

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
export class CompNode implements InulaBaseNode {
  inulaType = InulaNodeType.Comp;

  // ---- All children nodes
  nodes?: InulaBaseNode[];

  // ---- Update functions
  updater?: Updater<CompNode>;

  // ---- Lifecycles
  willMount?: Lifecycle;
  didMount?: Lifecycle;
  willUnmount?: Lifecycle;
  didUnmount?: Lifecycle;

  subComponents?: InulaBaseNode[];

  constructor(parentComponents: CompNode[]) {
    for (let i = 0; i < parentComponents.length; i++) {
      if (parentComponents[i].subComponents) {
        parentComponents[i].subComponents!.push(this);
      } else {
        parentComponents[i].subComponents = [this];
      }
    }
  }

  // ---- In component update START----
  wave(_: Value, dirty: Bits) {
    this.updateState(dirty);
    this.updateViewAsync(dirty);
  }

  // ---- This is a temporary variable to store the dirty that need to be updated
  //      in one updateView call, i.e., in one microtask.
  dirtyBitsArrToUpdate?: number[];

  /**
   * @brief Update view asynchronously
   * @param dirty 
   * @returns 
   */
  updateViewAsync(dirty: Bits) {
    if (this.dirtyBitsArrToUpdate) {
      // ---- If there's already a dirtyBitsArrToUpdate, push the dirty to the array
      this.dirtyBitsArrToUpdate.push(dirty);
      return;
    }
    this.dirtyBitsArrToUpdate = [dirty];
    // ---- Schedule the updateView in the next microtask
    schedule(() => {
      // ---- Merge all the dirtyBitsArrToUpdate to one single dirty
      // ---- e.g. [0b0101, 0b0010] -> 0b0111
      const dirty = this.dirtyBitsArrToUpdate!.reduce((acc, cur) => acc | cur, 0);
      // ---- Call the updateView with the merged dirty bits to update 
      //       1. All the returning nodes
      for (let i = 0; i < (this.nodes?.length ?? 0); i++) {
        update(this.nodes![i], dirty);
      }
      //       2. All the sub components
      for (let i = 0; i < (this.subComponents?.length ?? 0); i++) {
        update(this.subComponents![i], dirty);
      }
      // ---- Clear the dirtyBitsArrToUpdate after the updateView is called
      delete this.dirtyBitsArrToUpdate;
    });
  }

  cachedDependenciesMap?: Record<string, Value[]>;

  derivedStateMap?: Array<[() => Value, () => Value[], Bits, string]>;

  derivedCount?: number;
  deriveState(updateDerivedFunc: () => Value, dependenciesFunc: () => Value[], reactBits: Bits) {
    if (!this.derivedStateMap) this.derivedStateMap = [];
    // ---- Run the updateDerivedFunc to get the initial value
    updateDerivedFunc();
    // ---- Add to cachedDependenciesMap
    if (!this.cachedDependenciesMap) this.cachedDependenciesMap = {};
    if (this.derivedCount === undefined) this.derivedCount = 0;
    const cacheKey = `derived$${this.derivedCount}`;
    this.cachedDependenciesMap[cacheKey] = dependenciesFunc();
    this.derivedStateMap.push([updateDerivedFunc, dependenciesFunc, reactBits, cacheKey]);
    this.derivedCount++;
    // TODO Make a flat array to save memory and improve performance
    // e.g. this.derivedStateMap = []
    // this.derivedStateMap.push(updateDerivedFunc, dependenciesFunc, reactBits);
    // for (let i = 0; i < this.derivedStateMap.length; i+=3) {
    //   const updateDerivedFunc = this.derivedStateMap[i]
    //   const dependenciesFunc = this.derivedStateMap[i + 1]
    //   const reactBits = this.derivedStateMap[i + 2]
    // }
    // TODO Extract it as a function for reuse purpose
  }

  watch(updateDerivedFunc: () => Value, dependenciesFunc: () => Value[], reactBits: Bits) {
    this.deriveState(updateDerivedFunc, dependenciesFunc, reactBits);
  }

  updateState(dirty: Bits) {
    if (!this.derivedStateMap) return;
    for (let i = 0; i < this.derivedStateMap.length; i++) {
      const [updateDerivedFunc, dependenciesFunc, reactBits, cacheKey] = this.derivedStateMap[i];
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

  prepare() {
    if (this.willMount) this.willMount(this);
    if (this.didMount) addDidMount(this.didMount);
    if (this.willUnmount) addWillUnmount(this.willUnmount);
    if (this.didUnmount) addDidUnmount(this.didUnmount);

    return this;
  }

  init(node: InulaBaseNode) {
    this.nodes = [node];

    return this;
  }

  // ---- Out of component update START ----
  // ---- PROPS START ----
  updatePropMap?: Record<string, [(value: Value) => void, Bits]>;
  addProp(propName: string, updatePropFunc: (value: Value) => void, waveBits: Bits) {
    if (!this.updatePropMap) this.updatePropMap = {};
    this.updatePropMap[propName] = [updatePropFunc, waveBits];
  }

  updateProp(propName: string, valueFunc: () => Value, dependencies: Value[], reactBits: Bits) {
    // ---- Not event rest props is defined
    if (!this.updatePropMap) return;
    // ---- If not reacting to the change
    if (!(reactBits & this.dirtyBits!)) return;
    const cacheKey = `prop$${propName}`;
    const cachedDeps = this.cachedDependenciesMap?.[cacheKey];
    // ---- If the dependencies are the same, skip the update
    if (cached(dependencies, cachedDeps)) return;

    if (!this.updatePropMap[propName]) {
      // ---- Rest props
      const [updatePropFunc, waveBits] = this.updatePropMap['$rest$'];
      this.wave(updatePropFunc({ [propName]: valueFunc() }), waveBits);
    } else {
      const [updatePropFunc, waveBits] = this.updatePropMap[propName];
      this.wave(updatePropFunc(valueFunc()), waveBits);
    }

    if (!this.cachedDependenciesMap) this.cachedDependenciesMap = {};
    this.cachedDependenciesMap[cacheKey] = dependencies;
  }
  // ---- PROP END ----

  // ---- CONTEXT START ----
  updateContextMap?: Record<string, [ContextID, (value: Value) => void, Bits]>;
  addContext(context: Context, contextName: string, updateContextFunc: (value: Value) => void, waveBits: Bits) {
    if (!this.updateContextMap) this.updateContextMap = {};
    this.updateContextMap[contextName] = [context.id, updateContextFunc, waveBits];
  }

  updateContext(contextId: ContextID, contextName: string, value: Value) {
    if (!this.updateContextMap || !(contextName in this.updateContextMap)) return;
    const [expectedContextId, updateContextFunc, waveBits] = this.updateContextMap[contextName];
    if (contextId !== expectedContextId) return;
    this.wave(updateContextFunc(value), waveBits);
  }

  // ---- CHILDREN START ----
  // ---- Not child nodes in tree, but <CompNode><...nodes...></CompNode>
  childNodes?: InulaBaseNode[];

  // ---- CONTEXT END ----

  firstTimeUpdate? = true;
  dirtyBits?: Bits;
  update() {
    if (this.firstTimeUpdate) {
      delete this.firstTimeUpdate;
      return;
    }

    this.updater?.(this);

    for (let i = 0; i < (this.childNodes?.length ?? 0); i++) {
      update(this.childNodes![i], this.dirtyBits!);
    }
  }
}

/**
 * @brief Create a component node
 * @returns 
 */
export const compBuilder = (...parentComponents: CompNode[]) => {
  return new CompNode(parentComponents);
}


export const createCompNode = (compNode: CompNode, updater: Updater<CompNode> | null, ...nodes: InulaBaseNode[]) => {
  if (updater) compNode.updater = updater;
  compNode.childNodes = nodes;
  return compNode;
}
