/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { travelVNodeTree } from '../renderer/vnode/VNodeUtils';
import { Hook, Reducer, Ref, Effect, CallBack, Memo } from '../renderer/hooks/HookType';
import { VNode } from '../renderer/vnode/VNode';
import { launchUpdateFromVNode } from '../renderer/TreeBuilder';
import { DomComponent } from '../renderer/vnode/VNodeTags';
import { getElementTag } from '../renderer/vnode/VNodeCreator';
import { JSXElement } from '../renderer/Types';
import { EffectConstant } from '../renderer/hooks/EffectConstant';

const isEffectHook = (state: any): state is Effect => !!state.effect;
const isRefHook = (state: any): state is Ref<any> => Object.prototype.hasOwnProperty.call(state, 'current');
const isCallbackHook = (state: any): state is CallBack<any> => Object.prototype.hasOwnProperty.call(state, 'func');
const isMemoHook = (state: any): state is Memo<any> => Object.prototype.hasOwnProperty.call(state, 'result');

const HookName = {
  StateHook: 'State',
  EffectHook: 'Effect',
  LayoutEffectHook: 'LayoutEffect',
  MemoHook: 'Memo',
  RefHook: 'Ref',
  ReducerHook: 'Reducer',
  CallbackHook: 'Callback',
};

export const helper = {
  travelVNodeTree: (rootVNode, fun, childFilter: ((node: VNode) => boolean) | null = null) => {
    travelVNodeTree(rootVNode, fun, childFilter, rootVNode, null);
  },
  // 获取 hook 名，hIndex值和存储的值
  getHookInfo: (hook: Hook<any, any>) => {
    const { hIndex, state } = hook;
    if ((state as Reducer<any, any>).trigger) {
      if ((state as Reducer<any, any>).isUseState) {
        return { name: HookName.StateHook, hIndex, value: (state as Reducer<any, any>).stateValue };
      } else if ((state as Reducer<any, any>).reducer) {
        return { name: HookName.ReducerHook, hIndex, value: (state as Reducer<any, any>).stateValue };
      }
    } else if (isRefHook(state)) {
      return { name: HookName.RefHook, hIndex, value: (state as Ref<any>).current };
    } else if (isEffectHook(state)) {
      const name =
        state.effectConstant == EffectConstant.LayoutEffect || EffectConstant.LayoutEffect | EffectConstant.DepsChange
          ? HookName.LayoutEffectHook
          : HookName.EffectHook;
      return { name, hIndex, value: (state as Effect).effect };
    } else if (isCallbackHook(state)) {
      return { name: HookName.CallbackHook, hIndex, value: (state as CallBack<any>).func };
    } else if (isMemoHook(state)) {
      return { name: HookName.MemoHook, hIndex, value: (state as Memo<any>).result };
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
      hooks.forEach(hook => {
        const state = hook.state as Reducer<any, any>;
        if (state.trigger && state.isUseState) {
          logHookInfo.push(state.stateValue);
        }
      });
      info['Hooks'] = logHookInfo;
    }
    travelVNodeTree(
      vNode,
      (node: VNode) => {
        if (node.tag === DomComponent) {
          // 找到组件的第一个dom元素，返回它所在父节点的全部子节点
          const dom = node.realNode;
          info['Nodes'] = dom?.parentNode?.childNodes;
          return true;
        }
        return false;
      },
      null,
      vNode,
      null
    );
    return info;
  },
  getElementTag: (element: JSXElement) => {
    return getElementTag(element);
  },
};

export function injectUpdater() {
  const hook = window.__INULA_DEV_HOOK__;
  if (hook) {
    hook.init(helper);
  }
}

injectUpdater();
