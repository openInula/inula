import { addDidMount, addDidUnmount, addWillUnmount } from './lifecycle';
import { equal } from './equal';
import { schedule } from './scheduler';
import { inMount } from './index';
import { CompNode, ComposableNode } from './types';
import { InulaNodeType } from '@openinula/next-shared';

export function createCompNode(): CompNode {
  return {
    updateProp: builtinUpdateFunc,
    updateState: builtinUpdateFunc,
    __type: InulaNodeType.Comp,
    props: {},
    _$nodes: [],
  };
}

export function builtinUpdateFunc() {
  throw new Error('Component node not initiated.');
}

export function constructComp(
  comp: CompNode,
  {
    updateState,
    updateProp,
    updateContext,
    getUpdateViews,
    didUnmount,
    willUnmount,
    didMount,
  }: Pick<
    CompNode,
    'updateState' | 'updateProp' | 'updateContext' | 'getUpdateViews' | 'didUnmount' | 'willUnmount' | 'didMount'
  >
): CompNode {
  comp.updateState = updateState;
  comp.updateProp = updateProp;
  comp.updateContext = updateContext;
  comp.getUpdateViews = getUpdateViews;
  comp.didUnmount = didUnmount;
  comp.willUnmount = willUnmount;
  comp.didMount = didMount;

  return comp;
}

export function initCompNode(node: CompNode): CompNode {
  node.mounting = true;
  const willCall = () => {
    callUpdatesBeforeInit(node);
    if (node.didMount) addDidMount(node, node.didMount);
    if (node.willUnmount) addWillUnmount(node, node.willUnmount);
    addDidUnmount(node, setUnmounted.bind(null, node));
    if (node.didUnmount) addDidUnmount(node, node.didUnmount);
    if (node.getUpdateViews) {
      const result = node.getUpdateViews();
      if (Array.isArray(result)) {
        const [baseNode, updateView] = result;
        node.updateView = updateView;
        node._$nodes = baseNode;
      } else {
        node.updateView = result;
      }
    }
  };

  willCall();

  return node;
}

function setUnmounted(node: CompNode) {
  node._$unmounted = true;
}

function callUpdatesBeforeInit(node: CompNode) {
  node.updateState(-1);
  delete node.mounting;
}

function cacheCheck(node: CompNode, key: string, deps: any[]): boolean {
  if (!deps || !deps.length) return false;
  if (!node.cache) {
    node.cache = {};
  }
  if (equal(deps, node.cache[key])) return true;
  node.props[key] = deps;
  return false;
}

export function setProp(node: CompNode, key: string, valueFunc: () => any, deps: any[]) {
  if (cacheCheck(node, key, deps)) return;
  if (key === '*spread*') {
    const spread = valueFunc();
    Object.keys(spread).forEach(key => {
      node.updateProp(key, node.props[key]);
    });
    return;
  }
  node.props[key] = valueFunc();
  node.updateProp(key, node.props[key]);
}

export function setProps(node: CompNode, valueFunc: () => Record<string, any>, deps: any[]) {
  if (cacheCheck(node, 'props', deps)) return;
  const props = valueFunc();
  if (!props) return;
  Object.entries(props).forEach(([key, value]) => {
    setProp(node, key, () => value, []);
  });
}

export function updateContext(node: CompNode, key: string, value: any, context: any) {
  if (!node.updateContext) return;
  node.updateContext(context, key, value);
}

export function updateCompNode(node: ComposableNode, newValue: any, bit?: number) {
  if ('mounting' in node) return;

  node.updateState(bit || 0);

  if (!inMount()) {
    updateView(node, bit || 0);
  }
}

function updateView(node: ComposableNode, bit: number) {
  if (!bit) return;
  if ('_$depNumsToUpdate' in node) {
    node._$depNumsToUpdate?.push(bit);
  } else {
    node._$depNumsToUpdate = [bit];
    schedule(() => {
      if (node._$unmounted) return;
      const depNums = node._$depNumsToUpdate || [];
      if (depNums.length > 0) {
        const depNum = depNums.reduce((acc, cur) => acc | cur, 0);
        node.updateView?.(depNum);
      }
      delete node._$depNumsToUpdate;
    });
  }
}
