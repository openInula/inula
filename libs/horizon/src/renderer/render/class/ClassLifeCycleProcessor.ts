import type { VNode } from '../../Types';
import type { Callback } from '../../UpdateHandler';

import { shallowCompare } from '../../utils/compare';
import {
  pushUpdate,
  newUpdate,
  UpdateState,
  processUpdates,
} from '../../UpdateHandler';
import { launchUpdateFromVNode } from '../../TreeBuilder';
import { FlagUtils } from '../../vnode/VNodeFlags';
import { getCurrentContext } from '../ClassComponent';
import { PureComponent } from '../../components/BaseClassComponent';

export function callDerivedStateFromProps(
  processing: VNode,
  getDerivedStateFromProps: (props: object, state: object) => object,
  nextProps: object,
) {
  if (typeof getDerivedStateFromProps === 'function') {
    const oldState = processing.state;

    // 调用class组件的getDerivedStateFromProps函数
    const newState = getDerivedStateFromProps(nextProps, oldState);

    // 组件未返回state,需要返回旧的preState
    if (newState) {
      processing.state = { ...oldState, ...newState };
      return;
    }
    processing.state = oldState;
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
  newContext: object,
) {
  const inst = processing.realNode;

  if (typeof inst.shouldComponentUpdate === 'function') {
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

  if (typeof inst.componentWillMount === 'function') {
    inst.componentWillMount();
  }
  if (typeof inst.UNSAFE_componentWillMount === 'function') {
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
  if (typeof inst.componentWillUpdate === 'function') {
    inst.componentWillUpdate(newProps, newState, nextContext);
  }

  if (typeof inst.UNSAFE_componentWillUpdate === 'function') {
    inst.UNSAFE_componentWillUpdate(newProps, newState, nextContext);
  }
}

export function callComponentWillReceiveProps(inst, newProps: object, newContext: object) {
  const oldState = inst.state;
  if (typeof inst.componentWillReceiveProps === 'function') {
    inst.componentWillReceiveProps(newProps, newContext);
  }
  if (typeof inst.UNSAFE_componentWillReceiveProps === 'function') {
    inst.UNSAFE_componentWillReceiveProps(newProps, newContext);
  }
  if (inst.state !== oldState) {
    changeStateContent.call(inst, UpdateState.Override, inst.state, null);
  }
}

export function markComponentDidMount(processing: VNode) {
  const inst = processing.realNode;
  if (typeof inst.componentDidMount === 'function') {
    FlagUtils.markUpdate(processing);
  }
}

export function markGetSnapshotBeforeUpdate(processing: VNode) {
  const inst = processing.realNode;
  if (typeof inst.getSnapshotBeforeUpdate === 'function') {
    FlagUtils.markSnapshot(processing);
  }
}

export function markComponentDidUpdate(processing: VNode) {
  const inst = processing.realNode;
  if (typeof inst.componentDidUpdate === 'function') {
    FlagUtils.markUpdate(processing);
  }
}

