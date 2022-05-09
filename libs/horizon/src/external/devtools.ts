import { travelVNodeTree } from '../renderer/vnode/VNodeUtils';
import { Hook, Reducer, Ref } from '../renderer/hooks/HookType';
import { VNode } from '../renderer/vnode/VNode';
import { launchUpdateFromVNode } from '../renderer/TreeBuilder';

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
};

function injectUpdater() {
  const hook = window.__HORIZON_DEV_HOOK__;
  if (hook) {
    hook.init(helper);
  }
}

injectUpdater();
