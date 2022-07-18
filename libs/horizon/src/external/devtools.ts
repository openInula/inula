import { travelVNodeTree } from '../renderer/vnode/VNodeUtils';
import { 
  Hook, 
  Reducer,
  Ref,
  Effect,
  CallBack,
  Memo
} from '../renderer/hooks/HookType';
import { VNode } from '../renderer/vnode/VNode';
import { launchUpdateFromVNode } from '../renderer/TreeBuilder';
import { DomComponent } from '../renderer/vnode/VNodeTags';
import { getElementTag } from '../renderer/vnode/VNodeCreator';
import { JSXElement } from '../renderer/Types';

const isEffectHook = (state: any): state is Effect => !!state.effect;
const isRefHook = (state: any): state is Ref<any> => Object.prototype.hasOwnProperty.call(state, 'current');
const isCallbackHook = (state: any): state is CallBack<any> => state.func !== undefined;
const isMemoHook = (state: any): state is Memo<any> => Object.prototype.hasOwnProperty.call(state, 'result');

export const helper = {
  travelVNodeTree: (rootVNode, fun, childFilter: ((node: VNode) => boolean) | null = null) => {
    travelVNodeTree(rootVNode, fun, childFilter, rootVNode, null);
  },
  // 获取 hook 名，hIndex值和存储的值
  getHookInfo: (hook: Hook<any, any>) => {
    const { hIndex, state } = hook;
    if ((state as Reducer<any, any>).trigger) {
      if ((state as Reducer<any, any>).isUseState) {
        return { name: 'State', hIndex, value: (state as Reducer<any, any>).stateValue };
      } else if ((state as Reducer<any, any>).reducer) {
        return { name: 'Reducer', hIndex, value: (state as Reducer<any, any>).stateValue };
      }
    } else if (isRefHook(state)) {
      return { name: 'Ref', hIndex, value: (state as Ref<any>).current };
    } else if (isEffectHook(state)) {
      const name = state.effectConstant == 2 ? 'LayoutEffect' : 'Effect';
      return { name, hIndex, value: (state as Effect).effect };
    } else if (isCallbackHook(state)) {
      return { name:'Callback', hIndex, value: (state as CallBack<any>).func };
    } else if (isMemoHook(state)) {
      return { name:'Memo', hIndex, value: (state as Memo<any>).result };
    }
    return null;
  },
  updateProps: (vNode: VNode, props: any) => {
    vNode.devProps = props;
    launchUpdateFromVNode(vNode);
  },
  updateState: (vNode: VNode, nextState) => {
    const instance = vNode.realNode;
    instance.setState(nextState);
  },
  updateHooks: (vNode: VNode, hIndex, nextState) => {
    const hooks = vNode.hooks;
    if (hooks) {
      const editHook = hooks[hIndex];
      const editState = editHook.state as Reducer<any, any>;
      // 暂时只支持更新 useState 的值
      if (editState.trigger && editState.isUseState) {
        editState.trigger(nextState);
      }
    } else {
      console.error('Target vNode is not a hook vNode: ', vNode);
    }
  },
  getComponentInfo: (vNode: VNode) => {
    const { props, state, hooks } = vNode;
    const info: any = {};
    if (props && Object.keys(props).length !== 0) {
      info['Props'] = props;
    }
    if (state && Object.keys(state).length !== 0) {
      info['State'] = state;
    }
    if (hooks && hooks.length !== 0) {
      const logHookInfo: any[] = [];
      hooks.forEach((hook) => {
        const state = hook.state as Reducer<any, any>;
        if (state.trigger && state.isUseState) {
          logHookInfo.push(state.stateValue);
        }
      });
      info['Hooks'] = logHookInfo;
    }
    travelVNodeTree(vNode, (node: VNode) => {
      if (node.tag === DomComponent) {
        // 找到组件的第一个dom元素，返回它所在父节点的全部子节点
        const dom = node.realNode;
        info['Nodes'] = dom?.parentNode?.childNodes;
        return true;
      }
      return false;
    }, null, vNode, null);
    return info;
  },
  getElementTag: (element: JSXElement) => {
    return getElementTag(element);
  }
};

export function injectUpdater() {
  const hook = window.__HORIZON_DEV_HOOK__;
  if (hook) {
    hook.init(helper);
  }
}

injectUpdater();
