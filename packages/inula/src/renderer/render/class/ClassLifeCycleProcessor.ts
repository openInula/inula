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

import type { VNode } from '../../Types';
import type { Callback } from '../../UpdateHandler';

import { shallowCompare } from '../../utils/compare';
import { pushUpdate, newUpdate, UpdateState, processUpdates } from '../../UpdateHandler';
import { launchUpdateFromVNode } from '../../TreeBuilder';
import { FlagUtils } from '../../vnode/VNodeFlags';
import { getCurrentContext } from '../ClassComponent';
import { PureComponent } from '../../components/BaseClassComponent';

export function callDerivedStateFromProps(
  processing: VNode,
  getDerivedStateFromProps: (props: object, state: object) => object,
  nextProps: object
) {
  if (getDerivedStateFromProps) {
    const oldState = processing.state;

    // 调用class组件的getDerivedStateFromProps函数
    const newState = getDerivedStateFromProps(nextProps, oldState);

    // 组件未返回state,需要返回旧的preState
    processing.state = newState ? { ...oldState, ...newState } : oldState;
  }
}

function changeStateContent(type: UpdateState, content: object, callback: Callback) {
  // @ts-ignore
  const vNode = this._vNode;

  const update = newUpdate();
  update.type = type;
  if (type === UpdateState.Update || type === UpdateState.Override) {
    update.content = content;
  }
  if (callback) {
    update.callback = callback;
  }

  pushUpdate(vNode, update);
  launchUpdateFromVNode(vNode);
}

export function callShouldComponentUpdate(
  processing: VNode,
  oldProps: object,
  newProps: object,
  newState: object,
  newContext: object
) {
  const inst = processing.realNode;

  if (inst.shouldComponentUpdate) {
    return inst.shouldComponentUpdate(newProps, newState, newContext);
  }

  if (inst instanceof PureComponent) {
    return !shallowCompare(oldProps, newProps) || !shallowCompare(inst.state, newState);
  }

  return true;
}

function setStateAndForceUpdateImpl(inst): void {
  inst.setState = changeStateContent.bind(inst, UpdateState.Update);
  inst.forceUpdate = changeStateContent.bind(inst, UpdateState.ForceUpdate, null);
}

export function callConstructor(processing: VNode, ctor: any, props: any): any {
  const context = getCurrentContext(ctor, processing);
  const inst = new ctor(props, context);
  if (inst.state !== null && inst.state !== undefined) {
    processing.state = inst.state;
  }

  setStateAndForceUpdateImpl(inst);
  // 双向绑定processing和inst
  processing.realNode = inst;
  inst._vNode = processing;

  return inst;
}

export function callComponentWillMount(processing, inst, newProps?) {
  const oldState = inst.state;

  if (inst.componentWillMount) {
    inst.componentWillMount();
  }
  if (inst.UNSAFE_componentWillMount) {
    inst.UNSAFE_componentWillMount();
  }

  if (oldState !== inst.state) {
    changeStateContent.call(inst, UpdateState.Override, inst.state, null);
  }

  // 处理componentWillMount中可能存在的state更新行为
  processUpdates(processing, inst, newProps);
  inst.state = processing.state;
}

export function callComponentWillUpdate(inst, newProps, newState, nextContext) {
  if (inst.componentWillUpdate) {
    inst.componentWillUpdate(newProps, newState, nextContext);
  }

  if (inst.UNSAFE_componentWillUpdate) {
    inst.UNSAFE_componentWillUpdate(newProps, newState, nextContext);
  }
}

export function callComponentWillReceiveProps(inst, newProps: object, newContext: object) {
  if (inst.componentWillReceiveProps) {
    const oldState = inst.state;
    inst.componentWillReceiveProps(newProps, newContext);
    if (inst.state !== oldState) {
      changeStateContent.call(inst, UpdateState.Override, inst.state, null);
    }
  }
  if (inst.UNSAFE_componentWillReceiveProps) {
    const oldState = inst.state;
    inst.UNSAFE_componentWillReceiveProps(newProps, newContext);
    if (inst.state !== oldState) {
      changeStateContent.call(inst, UpdateState.Override, inst.state, null);
    }
  }
}

export function markComponentDidMount(processing: VNode) {
  const inst = processing.realNode;
  if (inst.componentDidMount) {
    FlagUtils.markUpdate(processing);
  }
}

export function markGetSnapshotBeforeUpdate(processing: VNode) {
  const inst = processing.realNode;
  if (inst.getSnapshotBeforeUpdate) {
    FlagUtils.markSnapshot(processing);
  }
}

export function markComponentDidUpdate(processing: VNode) {
  const inst = processing.realNode;
  if (inst.componentDidUpdate) {
    FlagUtils.markUpdate(processing);
  }
}
