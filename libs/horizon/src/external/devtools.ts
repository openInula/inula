import { travelVNodeTree } from '../renderer/vnode/VNodeUtils';
import { Hook, Reducer, Ref } from '../renderer/hooks/HookType';
import { VNode } from '../renderer/vnode/VNode';
import { launchUpdateFromVNode } from '../renderer/TreeBuilder';
import { DomComponent } from '../renderer/vnode/VNodeTags';

export const helper = {
  travelVNodeTree: (rootVNode, fun) => {
    travelVNodeTree(rootVNode, fun, null, rootVNode, null);
  },
  // 获取 hook 名，hIndex值和存储的值
  // 目前只处理 useState和useRef
  getHookInfo:(hook: Hook<any, any>) => {
    const { hIndex, state } = hook;
    if ((state as Reducer<any, any>).trigger) {
      if ((state as Reducer<any, any>).isUseState) {
        return {name: 'state', hIndex, value: (state as Reducer<any, any>).stateValue};
      }
    } else if ((state as  Ref<any>).current) {
      return {name: 'ref', hIndex, value: (state as Ref<any>).current};
    }
    return null;
  },
  updateProps: (vNode: VNode, props: any) =>{
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
    const info:any = {};
    if (props && Object.keys(props).length !== 0) {
      info['Props'] = props;
    }
    if (state && Object.keys(state).length !== 0) {
      info['State'] = state;
    }
    if (hooks && hooks.length !== 0) {
      const logHookInfo: any[] = [];
      hooks.forEach((hook) =>{
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
};

export function injectUpdater() {
  const hook = window.__HORIZON_DEV_HOOK__;
  if (hook) {
    hook.init(helper);
  }
}

injectUpdater();
