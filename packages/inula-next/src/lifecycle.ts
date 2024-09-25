import { VNode, ScopedLifecycle } from './types';

let DidMountStore: ScopedLifecycle;
const WillUnmountStore: ScopedLifecycle[] = [];
const DidUnmountStore: ScopedLifecycle[] = [];

export const addWillUnmount = (node: VNode, func: (node: VNode) => void): void => {
  const willUnmountStore = WillUnmountStore;
  const currentStore = willUnmountStore[willUnmountStore.length - 1];
  if (!currentStore) return;
  currentStore.push(() => func(node));
};

export const addDidUnmount = (node: VNode, func: (node: VNode) => void): void => {
  const didUnmountStore = DidUnmountStore;
  const currentStore = didUnmountStore[didUnmountStore.length - 1];
  if (!currentStore) return;
  currentStore.push(() => func(node));
};
export const addDidMount = (node: VNode, func: (node: VNode) => void): void => {
  if (!DidMountStore) DidMountStore = [];
  DidMountStore.push(() => func(node));
};

export const runDidMount = (): void => {
  const didMountStore = DidMountStore;
  if (!didMountStore || didMountStore.length === 0) return;
  for (let i = didMountStore.length - 1; i >= 0; i--) {
    didMountStore[i]();
  }
  DidMountStore = [];
};

export function startUnmountScope() {
  WillUnmountStore.push([]);
  DidUnmountStore.push([]);
}

export function endUnmountScope() {
  return [WillUnmountStore.pop(), DidUnmountStore.pop()];
}
