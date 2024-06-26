import { DLNode } from './DLNode';
import { insertNode } from './HTMLNode';
import { DLStore } from './store';
import { CompNode } from './CompNode.js';

export * from './HTMLNode';
export * from './CompNode';
export * from './EnvNode';
export * from './TextNode';
export * from './PropView';
export * from './SnippetNode';
export * from './MutableNode/ForNode';
export * from './MutableNode/ExpNode';
export * from './MutableNode/CondNode';
export * from './MutableNode/TryNode';

export { setGlobal, setDocument } from './store';

function initStore() {
  // Declare a global variable to store willUnmount functions
  DLStore.global.WillUnmountStore = [];
  // Declare a global variable to store didUnmount functions
  DLStore.global.DidUnmountStore = [];
}

/**
 * @brief Render the DL class to the element
 * @param {typeof import('./CompNode').CompNode} Comp
 * @param {HTMLElement | string} idOrEl
 */
export function render(Comp, idOrEl) {
  let el = idOrEl;
  if (typeof idOrEl === 'string') {
    const elFound = DLStore.document.getElementById(idOrEl);
    if (elFound) el = elFound;
    else {
      throw new Error(`Inula-Next: Element with id ${idOrEl} not found`);
    }
  }
  initStore();
  el.innerHTML = '';
  const dlNode = Comp();
  insertNode(el, dlNode, 0);
  DLNode.runDidMount();
}

export function manual(callback, _deps) {
  return callback();
}

export function escape(arg) {
  return arg;
}

export const $ = escape;
export const required = null;

export function use() {
  console.error(
    'Inula-Next: use() is not supported be called directly. You can only assign `use(model)` to a Inula-Next class property. Any other expressions are not allowed.'
  );
}

/**
 * @typedef compUpdator
 * @property {(bit: number) => void} updateState
 * @property {(propName: string, newValue: any) => void} updateProp
 * @property {() => ([HTMLElement[], (bit: number) => HTMLElement[]])} getUpdateViews
 * @property {(newValue: any, bit: number) => {} updateDerived
 */
export function Comp(compFn, props) {
  // create an env
  const envs = {};
  const subscribedEnvNode = new Set();
  if (DLStore.global.DLEnvStore) {
    Object.keys(DLStore.global.DLEnvStore.envs).forEach(key => {
      Object.defineProperty(envs, key, {
        get() {
          const [value, envNode] = DLStore.global.DLEnvStore.envs[key];
          subscribedEnvNode.add(envNode);
          return value;
        },
      });
    });
  }
  const comp = compFn(props, envs || {});
  if (subscribedEnvNode.size) {
    subscribedEnvNode.forEach(envNode => {
      envNode.addNode(comp);
    });
    subscribedEnvNode.clear();
  }
  return comp;
}

function createEnv() {}
/**
 * @brief Create a component
 * @param {compUpdator} compUpdater
 * @return {*}
 */
export function createComponent(compUpdater) {
  return new CompNode(compUpdater);
}

export function notCached() {
  // TODO
  return true;
}

export function didMount() {
  throw new Error('lifecycle should be compiled, check the babel plugin');
}

export function willUnmount() {
  throw new Error('lifecycle should be compiled, check the babel plugin');
}

export function didUnMount() {
  throw new Error('lifecycle should be compiled, check the babel plugin');
}
