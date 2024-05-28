export const COMPONENT = 'Component';
export const Hook = 'Hook';
export const WILL_MOUNT = 'willMount';
export const DID_MOUNT = 'didMount';
export const WILL_UNMOUNT = 'willUnmount';
export const DID_UNMOUNT = 'didUnmount';

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
