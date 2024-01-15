/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
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

/**
 * 虚拟DOM结构体
 */
import {
  ClassComponent,
  ContextConsumer,
  ContextProvider,
  DomComponent,
  DomPortal,
  DomText,
  ForwardRef,
  Fragment,
  FunctionComponent,
  LazyComponent,
  MemoComponent,
  Profiler,
  SuspenseComponent,
  TreeRoot,
} from './VNodeTags';
import type { VNodeTag } from './VNodeTags';
import { InitFlag } from './VNodeFlags';
import { VNode } from '../Types';

export const BELONG_CLASS_VNODE_KEY = typeof Symbol === 'function' ? Symbol('belongClassVNode') : 'belongClassVNode';

export function VirtualNode(tag: VNodeTag, props: any, key: null | string, realNode) {
  this.tag = tag; // 对应组件的类型，比如ClassComponent等
  // 唯一标识符
  // if (isReactiveObj(this.key)) {
  //   this.key = getReactiveValue(this.key);
  //   subscribeKeyEffect(this, this.key);
  // } else {
    this.key = key;
  // }

  this.props = props; // 传给组件的props的值，类组件包含defaultProps，Lazy组件不包含
  this.type = null;
  this.realNode = null; // 如果是类，则存放实例；如果是div这种，则存放真实DOM；

  // 关系结构
  this.parent = null; // 父节点
  this.child = null; // 子节点
  this.next = null; // 兄弟节点
  this.cIndex = 0; // 节点在children数组中的位置
  this.eIndex = 0; // HorizonElement在jsx中的位置，例如：jsx中的null不会生成vNode，所以eIndex和cIndex不一致

  this.ref = null; // 包裹一个函数，submit阶段使用，比如将外部useRef生成的对象赋值到ref上
  this.oldProps = null;

  this.dirtyNodes = null; // 需要改动的节点数组
  this.shouldUpdate = false;
  this.childShouldUpdate = false;

  this.flags = InitFlag;
  this.clearChild = null;
  this.isCreated = true;
  this.oldRef = null;
  this.oldChild = null;

  switch (tag) {
    case TreeRoot:
      this.realNode = realNode;
      this.task = null;
      this.toUpdateNodes = new Set<VNode>();
      this.delegatedEvents = new Set<string>();
      this.updates = null;
      this.stateCallbacks = null;
      this.state = null;
      this.oldState = null;
      this.context = null;
      break;
    case FunctionComponent:
      this.realNode = null;
      this.effectList = null;
      this.hooks = null;
      this.depContexts = null;
      this.isDepContextChange = false;
      this.oldHooks = null;
      this.isStoreChange = false;
      this.observers = null;
      this.classComponentWillUnmount = null;
      this.src = null;
      this.compRContext = null;
      break;
    case ClassComponent:
      this.realNode = null;
      this.updates = null;
      this.stateCallbacks = null;
      this.isForceUpdate = false;
      this.state = null;
      this.depContexts = null;
      this.isDepContextChange = false;
      this.oldState = null;
      this.context = null;
      this.isStoreChange = false;
      this.observers = null;
      this.classComponentWillUnmount = null;
      this.src = null;
      this.compRContext = null;
      break;
    case DomPortal:
      this.realNode = null;
      this.context = null;
      this.delegatedEvents = new Set<string>();
      this.src = null;
      break;
    case DomComponent:
      this.realNode = null;
      this.changeList = null;
      this.context = null;
      this.src = null;
      this.attrRContexts = null;
      break;
    case DomText:
      this.realNode = null;
      break;
    case SuspenseComponent:
      this.realNode = null;
      this.suspenseState = {
        promiseSet: null,
        didCapture: false,
        promiseResolved: false,
        oldChildStatus: '',
        childStatus: '',
      };
      this.src = null;
      break;
    case ContextProvider:
      this.src = null;
      this.context = null;
      break;
    case MemoComponent:
      this.effectList = null;
      this.src = null;
      break;
    case LazyComponent:
      this.realNode = null;
      this.stateCallbacks = null;
      this.isLazyComponent = true;
      this.lazyType = null;
      this.updates = null;
      this.src = null;
      break;
    case Fragment:
      break;
    case ContextConsumer:
      break;
    case ForwardRef:
      break;
    case Profiler:
      break;
  }
}
