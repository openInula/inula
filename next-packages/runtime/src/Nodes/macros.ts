// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function watch(effect: () => void, deps?: any[]) {
  throw new Error('Watch should not be called directly, please check the docs for more information');
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function didMount(effect: () => void) {
  throw new Error('DidMount should not be called directly, please check the docs for more information');
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function willUnmount(effect: () => void) {
  throw new Error('WillUnmount should not be called directly, please check the docs for more information');
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function didUnmount(effect: () => void) {
  throw new Error('DidUnmount should not be called directly, please check the docs for more information');
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function untrack<T>(getter: () => T): T {
  return getter();
}
