import { createComputed, createReactive, createWatch } from './RNodeCreator';
import { RNode } from './RNode';

export interface Reactive {
  reactive<T>(initialValue: T): RNode<T>;

  watch(fn: () => void): void;

  computed<T>(fn: () => T): RNode<T>;
}

export const reactive: Reactive = {
  reactive: createReactive,
  watch: createWatch,
  computed: createComputed,
};
