import { DLNode } from './DLNode';
import { insertNode } from './HTMLNode';
import { DLStore } from './store';
import { CompNode } from './CompNode.js';

export * from './HTMLNode';
export * from './CompNode';
export * from './ContextProvider.js';
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
 * @param {typeof import('./CompNode').CompNode} compFn
 * @param {HTMLElement | string} idOrEl
 */
export function render(compFn, idOrEl) {
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
  const dlNode = Comp(compFn);
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

let currentComp;

/**
 * @typedef compUpdator
 * @property {(bit: number) => void} updateState
 * @property {(propName: string, newValue: any) => void} updateProp
 * @property {() => ([HTMLElement[], (bit: number) => HTMLElement[]])} getUpdateViews
 * @property {(newValue: any, bit: number) => {} updateDerived
 */
export function Comp(compFn, props = {}) {
  const compNode = new CompNode();
  currentComp = compNode;
  compFn(props);
  return compNode;
}

/**
 * @brief Create a component
 * @param {compUpdator} compUpdater
 * @return {*}
 */
export function createComponent(compUpdater) {
  if (!currentComp) {
    throw new Error('Should not call createComponent outside the component function');
  }
  currentComp.setUpdateFunc(compUpdater);
  return currentComp;
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

export function createContext(defaultVal) {
  return {
    id: Symbol('inula-ctx'),
    value: defaultVal,
  };
}

export function useContext(ctx, key) {
  const envNodeMap = DLStore.global.envNodeMap;
  if (envNodeMap) {
    const envNode = envNodeMap.get(ctx.id);
    if (envNode) {
      envNode.addNode(currentComp);
    }
  }

  if (key) {
    return ctx.value[key];
  }

  return ctx.value;
}
