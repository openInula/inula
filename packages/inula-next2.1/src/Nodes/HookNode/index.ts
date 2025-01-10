import { Bits, InulaBaseNode, Value } from '../../types';
import { ReactiveNode } from '../CompNode';
import { cached } from '../utils';

export class HookNode extends ReactiveNode {
  value?: () => Value;

  triggerUpdate?: () => void;

  constructor() {
    super();
  }

  wave(_: Value, dirty: Bits) {
    this.updateState(dirty);
    this.triggerUpdate?.();
  }

  propDirtyBits = 0;

  updateProp(propName: string, valueFunc: () => Value, dependencies: Value[], reactBits: Bits) {
    // ---- Not event rest props is defined
    if (!this.updatePropMap) return;
    // ---- If not reacting to the change
    if (!(reactBits & this.propDirtyBits)) return;
    const cacheKey = `prop$${propName}`;
    const cachedDeps = this.cachedDependenciesMap?.[cacheKey];
    // ---- If the dependencies are the same, skip the update
    if (cached(dependencies, cachedDeps)) return;

    this.executePropUpdate(this.updatePropMap, propName, valueFunc);

    if (!this.cachedDependenciesMap) this.cachedDependenciesMap = {};
    this.cachedDependenciesMap[cacheKey] = dependencies;
  }

  init(value: () => Value, dependencies: () => Value[], reactBits: Bits) {
    this.value = value;
    return this;
  }

  // update() {
  //   if (!this.cachedDependenciesMap) this.cachedDependenciesMap = {};
  //
  //   const cacheKey = 'hookValue';
  //   const cachedDeps = this.cachedDependenciesMap!.[cacheKey];
  //   // ---- If the dependencies are the same, skip the update
  //   if (cached(dependencies, cachedDeps)) return;
  //
  // }
}

export const hookBuilder = () => {
  return new HookNode();
};
