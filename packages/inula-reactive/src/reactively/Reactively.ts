import { createComputed, createReactive, createWatch } from './RNodeCreator';
import { RNode } from './RNode';

/**
 *
 * interface for a reactive framework
 */
export interface Reactively {
  reactive<T>(initialValue: T): RNode<T>;

  watch(fn: () => void): void;

  computed<T>(fn: () => T): RNode<T>;
}

export interface Computed<T> {
  read(): T;
}

export const reactively: Reactively = {
  reactive: createReactive,
  watch: createWatch,
  computed: createComputed,
};
