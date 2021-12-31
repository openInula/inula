import type { VNode } from '../Types';

import { mergeDefaultProps } from './LazyComponent';
import { getNewContext, resetDepContexts } from '../components/context/Context';
import {
  cacheOldCtx,
  getOldContext,
  isOldProvider,
  resetOldCtx,
  updateOldContext,
} from '../components/context/CompatibleContext';
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
import {FlagUtils} from '../vnode/VNodeFlags';
import { createVNodeChildren, markRef } from './BaseComponent';
import {
  createUpdateArray,
  processUpdates,
} from '../UpdateHandler';
import { getContextChangeCtx, setContextChangeCtx } from '../ContextSaver';
import ProcessingVNode from '../vnode/ProcessingVNode';
import {onlyUpdateChildVNodes} from '../vnode/VNodeCreator';

export function captureRender(processing: VNode): VNode | null {
  const clazz = processing.type;
  const props = processing.props;
  const nextProps = processing.isLazyComponent ? mergeDefaultProps(clazz, props) : props;
  return captureClassComponent(processing, clazz, nextProps);
}

export function bubbleRender(processing: VNode) {
  if (isOldProvider(processing.type)) {
    resetOldCtx(processing);
  }
}

// 用于未完成的类组件
export function getIncompleteClassComponent(clazz, processing: VNode, nextProps: object):VNode | null {
  mountInstance(clazz, processing, nextProps);
  return createChildren(clazz, processing);
}

// 用于类组件
export function captureClassComponent(processing: VNode, clazz: any, nextProps: object): VNode | null {
  const isOldCxtExist = isOldProvider(clazz);
  cacheOldCtx(processing, isOldCxtExist);

  resetDepContexts(processing);

  // 通过 shouldUpdate 判断是否要复用 children，该值和props,state,context的变化，shouldComponentUpdate,forceUpdate api的调用结果有关
  let shouldUpdate;
  const inst = processing.realNode;
  if (inst === null) {
    // 挂载新组件，一定会更新
    mountInstance(clazz, processing, nextProps);
    shouldUpdate = true;
  } else { // 更新
    const newContext = getCurrentContext(clazz, processing);

    // 子节点抛出异常时，如果本class是个捕获异常的处理节点，这时候oldProps是null，所以需要使用props
    let oldProps = processing.flags.DidCapture ? processing.props : processing.oldProps;
    if (processing.isLazyComponent) {
      oldProps = mergeDefaultProps(processing.type, oldProps);
    }
    inst.props = oldProps;

    if (oldProps !== processing.props || inst.context !== newContext) {
      // 在已挂载的组件接收新的 props 之前被调用
      callComponentWillReceiveProps(inst, nextProps, newContext);
    }

    inst.state = processing.state;
    processUpdates(processing, inst, nextProps);

    // 如果 props, state, context 都没有变化且 isForceUpdate 为 false则不需要更新
    shouldUpdate = oldProps !== processing.props ||
      inst.state !== processing.state ||
      getContextChangeCtx() ||
      processing.isForceUpdate;

    if (shouldUpdate) {
      // derivedStateFromProps会修改nextState，因此需要调用
      callDerivedStateFromProps(processing, clazz.getDerivedStateFromProps, nextProps);
      if (!processing.isForceUpdate) {
        // 业务可以通过 shouldComponentUpdate 函数进行优化阻止更新
        shouldUpdate = callShouldComponentUpdate(processing, oldProps, nextProps, processing.state, newContext);
      }
      if (shouldUpdate) {
        callUpdateLifeCycle(processing, nextProps, clazz);
      }
      inst.state = processing.state;
      inst.context = newContext;
    }

    markLifeCycle(processing, nextProps, shouldUpdate);
    // 不管有没有更新，props都必须更新
    inst.props = nextProps;
  }
  // 如果捕获了 error，必须更新
  const isCatchError = processing.flags.DidCapture;
  shouldUpdate = isCatchError || shouldUpdate;

  // 更新ref
  markRef(processing);

  // 不复用
  if (shouldUpdate) {
    // 更新context
    if (isOldCxtExist) {
      updateOldContext(processing);
    }
    return createChildren(clazz, processing);
  } else {
    if (isOldCxtExist) {
      setContextChangeCtx(processing, false);
    }
    return onlyUpdateChildVNodes(processing);
  }
}

// 挂载实例
function mountInstance(clazz, processing: VNode, nextProps: object) {
  if (!processing.isCreated) {
    processing.isCreated = true;
    FlagUtils.markAddition(processing);
  }

  // 构造实例
  callConstructor(processing, clazz, nextProps);

  const inst = processing.realNode;
  inst.props = nextProps;
  inst.state = processing.state;
  inst.context = getCurrentContext(clazz, processing);
  inst.refs = {};

  createUpdateArray(processing);
  processUpdates(processing, inst, nextProps);
  inst.state = processing.state;

  // 在调用类组建的渲染方法之前调用 并且在初始挂载及后续更新时都会被调用
  callDerivedStateFromProps(processing, clazz.getDerivedStateFromProps, nextProps);
  callComponentWillMount(processing, inst, nextProps);

  markComponentDidMount(processing);
}

// 构建子节点
function createChildren(clazz: any, processing: VNode) {
  markRef(processing);

  ProcessingVNode.val = processing;
  processing.state = processing.realNode.state;

  const inst = processing.realNode;
  const isCatchError = processing.flags.DidCapture;

  // 按照已有规格，如果捕获了错误却没有定义getDerivedStateFromError函数，返回的child为null
  const newElements = (isCatchError && typeof clazz.getDerivedStateFromError !== 'function')
    ? null
    : inst.render();

  processing.child = createVNodeChildren(processing, newElements);
  return processing.child;
}

// 获取当前节点的context
export function getCurrentContext(clazz, processing: VNode) {
  const context = clazz.contextType;
  return typeof context === 'object' && context !== null
    ? getNewContext(processing, context)
    : getOldContext(processing, clazz, true);
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

function markLifeCycle(processing: VNode, nextProps: object, shouldUpdate: Boolean) {
  if (processing.isCreated) {
    markComponentDidMount(processing);
  } else if (processing.state !== processing.oldState || shouldUpdate) {
    markComponentDidUpdate(processing);
    markGetSnapshotBeforeUpdate(processing);
  }
}
