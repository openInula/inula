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

import type { VNode } from '../Types';

import { mergeDefaultProps } from './LazyComponent';
import { getNewContext, resetDepContexts } from '../components/context/Context';
import {
  callComponentWillMount,
  callComponentWillReceiveProps,
  callComponentWillUpdate,
  callConstructor,
  callDerivedStateFromProps,
  callShouldComponentUpdate,
  markComponentDidMount,
  markComponentDidUpdate,
  markGetSnapshotBeforeUpdate,
} from './class/ClassLifeCycleProcessor';
import { FlagUtils, DidCapture } from '../vnode/VNodeFlags';
import { markRef } from './BaseComponent';
import { processUpdates } from '../UpdateHandler';
import { setProcessingClassVNode } from '../GlobalVar';
import { onlyUpdateChildVNodes } from '../vnode/VNodeCreator';
import { createChildrenByDiff } from '../diff/nodeDiffComparator';

const emptyContextObj = {};
// 获取当前节点的context
export function getCurrentContext(clazz, processing: VNode) {
  const context = clazz.contextType;
  return typeof context === 'object' && context !== null ? getNewContext(processing, context) : emptyContextObj;
}

// 挂载实例
function mountInstance(ctor, processing: VNode, nextProps: object) {
  if (!processing.isCreated) {
    processing.isCreated = true;
    FlagUtils.markAddition(processing);
  }

  // 构造实例
  const inst = callConstructor(processing, ctor, nextProps);

  inst.props = nextProps;
  inst.state = processing.state;
  inst.context = getCurrentContext(ctor, processing);
  inst.refs = {};

  processUpdates(processing, inst, nextProps);
  inst.state = processing.state;

  // 在调用类组建的渲染方法之前调用 并且在初始挂载及后续更新时都会被调用
  callDerivedStateFromProps(processing, ctor.getDerivedStateFromProps, nextProps);
  callComponentWillMount(processing, inst, nextProps);

  markComponentDidMount(processing);
}

// 构建子节点
function createChildren(clazz: any, processing: VNode) {
  processing.isStoreChange = false;

  markRef(processing);

  setProcessingClassVNode(processing);
  processing.state = processing.realNode.state;

  const inst = processing.realNode;
  const isCatchError = (processing.flags & DidCapture) === DidCapture;

  // 按照已有规格，如果捕获了错误却没有定义getDerivedStateFromError函数，返回的child为null
  const newElements = isCatchError && typeof clazz.getDerivedStateFromError !== 'function' ? null : inst.render();

  processing.child = createChildrenByDiff(processing, processing.child, newElements, !processing.isCreated);
  return processing.child;
}

// 根据isUpdateComponent，执行不同的生命周期
function callUpdateLifeCycle(processing: VNode, nextProps: object, clazz) {
  const inst = processing.realNode;
  const newContext = getCurrentContext(clazz, processing);
  if (processing.isCreated) {
    callComponentWillMount(processing, inst);
  } else {
    callComponentWillUpdate(inst, nextProps, processing.state, newContext);
  }
}

function markLifeCycle(processing: VNode, nextProps: object, shouldUpdate: boolean) {
  if (processing.isCreated) {
    markComponentDidMount(processing);
  } else if (processing.state !== processing.oldState || shouldUpdate) {
    markComponentDidUpdate(processing);
    markGetSnapshotBeforeUpdate(processing);
  }
}

// 用于类组件
export function captureRender(processing: VNode): VNode | null {
  const ctor = processing.type;
  let nextProps = processing.props;
  if (processing.isLazyComponent) {
    nextProps = mergeDefaultProps(ctor, nextProps);
  }

  resetDepContexts(processing);

  // suspense打断后，再次render只需初次渲染
  if (processing.isSuspended) {
    mountInstance(ctor, processing, nextProps);
    processing.isSuspended = false;
    return createChildren(ctor, processing);
  }

  // 通过 shouldUpdate 判断是否要复用 children，该值和props,state,context的变化，shouldComponentUpdate,forceUpdate api的调用结果有关
  let shouldUpdate;
  const inst = processing.realNode;
  if (inst === null) {
    // 挂载新组件，一定会更新
    mountInstance(ctor, processing, nextProps);
    shouldUpdate = true;
  } else {
    // 更新
    const newContext = getCurrentContext(ctor, processing);

    // 子节点抛出异常时，如果本class是个捕获异常的处理节点，这时候oldProps是null，所以需要使用props
    const oldProps = (processing.flags & DidCapture) === DidCapture ? processing.props : processing.oldProps;

    if (oldProps !== processing.props || inst.context !== newContext) {
      // 在已挂载的组件接收新的 props 之前被调用
      callComponentWillReceiveProps(inst, nextProps, newContext);
    }

    processUpdates(processing, inst, nextProps);

    // 如果 props, state, context 都没有变化且 isForceUpdate 为 false则不需要更新
    shouldUpdate = oldProps !== processing.props || inst.state !== processing.state || processing.isForceUpdate;

    if (shouldUpdate) {
      // derivedStateFromProps会修改nextState，因此需要调用
      callDerivedStateFromProps(processing, ctor.getDerivedStateFromProps, nextProps);
      if (!processing.isForceUpdate) {
        // 业务可以通过 shouldComponentUpdate 函数进行优化阻止更新
        shouldUpdate = callShouldComponentUpdate(processing, oldProps, nextProps, processing.state, newContext);
      }
      if (shouldUpdate) {
        callUpdateLifeCycle(processing, nextProps, ctor);
      }
      inst.state = processing.state;
      inst.context = newContext;
    }

    markLifeCycle(processing, nextProps, shouldUpdate);
    // 不管有没有更新，props都必须更新
    inst.props = nextProps;
  }
  // 如果捕获了 error，必须更新
  const isCatchError = (processing.flags & DidCapture) === DidCapture;
  shouldUpdate = isCatchError || shouldUpdate || processing.isStoreChange;

  // 更新ref
  markRef(processing);

  // 不复用
  if (shouldUpdate) {
    return createChildren(ctor, processing);
  } else {
    return onlyUpdateChildVNodes(processing);
  }
}

export function bubbleRender() {}
