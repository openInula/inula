import { Bits, InulaBaseNode, Value } from '../../types';
import { ReactiveNode } from '../CompNode';

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

  init(value: () => Value) {
    this.value = value;
    return this;
  }
}

export const hookBuilder = () => {
  return new HookNode();
};
