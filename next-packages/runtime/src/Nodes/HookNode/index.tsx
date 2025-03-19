import { Bits, InulaBaseNode, Value } from '../../types';
import { ReactiveNode } from '../CompNode';
import { cached } from '../utils';

export class HookNode extends ReactiveNode {
  value?: () => Value;
  triggerUpdate?: () => void;
  propDirtyBits = 0;
  updateProp: (propName: string, valueFunc: () => Value, dependencies: Value[], reactBits: Bits) => void = (
    propName,
    valueFunc,
    dependencies,
    reactBits
  ) => {
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
  };

  constructor() {
    super();
  }

  wave(_: Value, dirty: Bits): void {
    this.updateState(dirty);
    this.triggerUpdate?.();
  }

  init(value: () => Value, dependencies: () => Value[], reactBits: Bits): this {
    this.value = value;
    return this;
  }
}

export const hookBuilder = (): HookNode => {
  return new HookNode();
};
