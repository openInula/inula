import { InulaStore } from './store';
import { Lifecycle } from './types';

// ---- Define lifecycle stores. We initialize them as undefined to save memory.
// ---- InulaStore.global.DidMountStore is a store for functions that will be executed when
//      1. The component is mounted to the DOM
//      2. New mutable components are mounted to the DOM
//      So there's no need to store it in a scoped store.
// ---- InulaStore.global.DidMountStore: Lifecycle[] | undefined;

// ---- WillUnmountStore and DidUnmountStore are scoped stores for functions that will be executed when
//      1. The component is unmounted from the DOM
//      2. Old mutable components are unmounted from the DOM
//      Since we don't know when the component will be unmounted, we need to store it in a scoped store.
// ---- InulaStore.global.WillUnmountScopedStore: Lifecycle[][];
// ---- InulaStore.global.DidUnmountScopedStore: Lifecycle[][];

// ---- Add lifecycle functions to the stores
/**
 * @brief Add a function to the DidMount store
 * @param func
 */
export const addDidMount = (func: Lifecycle) => {
  if (!InulaStore.global.DidMountStore) InulaStore.global.DidMountStore = [];
  InulaStore.global.DidMountStore.push(func);
};

/**
 * @brief Add a function to the latest WillUnmount store
 * @param func
 */
export const addWillUnmount = (func: Lifecycle) => {
  if (!InulaStore.global.WillUnmountScopedStore) InulaStore.global.WillUnmountScopedStore = [];
  const currentStore = InulaStore.global.WillUnmountScopedStore[InulaStore.global.WillUnmountScopedStore.length - 1];
  if (!currentStore) return;
  currentStore.push(func);
};

/**
 * @brief Add a function to the latest DidUnmount store
 * @param func
 */
export const addDidUnmount = (func: Lifecycle) => {
  if (!InulaStore.global.DidUnmountScopedStore) InulaStore.global.DidUnmountScopedStore = [];
  const currentStore = InulaStore.global.DidUnmountScopedStore[InulaStore.global.DidUnmountScopedStore.length - 1];
  if (!currentStore) return;
  currentStore.push(func);
};

// ---- Run lifecycle functions
/**
 * @brief Run didMount functions in the reverse order
 */
export const runDidMount = () => {
  const didMountStore = InulaStore.global.DidMountStore;
  if (!didMountStore || didMountStore.length === 0) return;
  // ---- Run from the last index to the first index
  // ---- Init order: parent -> child
  //      DidMount order: child -> parent
  for (let i = didMountStore.length - 1; i >= 0; i--) {
    didMountStore[i]();
  }
  // ---- One cycle is done. Clear the store.
  InulaStore.global.DidMountStore = undefined;
};

/**
 * @brief Create a new unmount scope by pushing an empty array to the scoped stores
 */
export const startUnmountScope = () => {
  InulaStore.global.WillUnmountScopedStore.push([]);
  InulaStore.global.DidUnmountScopedStore.push([]);
};

/**
 * @brief End the unmount scope by popping the last array from the scoped stores
 * @returns
 */
export const endUnmountScope = () => {
  return [InulaStore.global.WillUnmountScopedStore.pop(), InulaStore.global.DidUnmountScopedStore.pop()];
};
