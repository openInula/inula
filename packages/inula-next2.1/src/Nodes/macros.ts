export function watch(effect: () => void) {
  throw new Error('Watch should not be called directly, please check the docs for more information');
}

export function didMount(effect: () => void) {
  throw new Error('DidMount should not be called directly, please check the docs for more information');
}

export function willUnmount(effect: () => void) {
  throw new Error('WillUnmount should not be called directly, please check the docs for more information');
}

export function didUnmount(effect: () => void) {
  throw new Error('DidUnmount should not be called directly, please check the docs for more information');
}
