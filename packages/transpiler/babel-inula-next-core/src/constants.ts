export const COMPONENT = 'Component';
export const WILL_MOUNT = 'willMount';
export const ON_MOUNT = 'onMount';
export const WILL_UNMOUNT = 'willUnmount';
export const ON_UNMOUNT = 'onUnmount';
export const WATCH = 'watch';
export enum PropType {
  REST = 'rest',
  SINGLE = 'single',
}

export const reactivityFuncNames = [
  // ---- Array
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
  // ---- Set
  'add',
  'delete',
  'clear',
  // ---- Map
  'set',
  'delete',
  'clear',
];
