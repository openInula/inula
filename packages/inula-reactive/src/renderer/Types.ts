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

import { BELONG_CLASS_VNODE_KEY } from './vnode/VNode';
import { VNodeTag } from './vnode/VNodeTags';

export { VNode } from './vnode/VNode';

type Trigger<A> = (A) => void;

export type UseStateHookType = {
  useState<S>(initialState: (() => S) | S): [S, Trigger<((S) => S) | S>];
};
export type UseReducerHookType = {
  useReducer<S, P, A>(reducer: (S, A) => S, initArg: P, init?: (P) => S): [S, Trigger<A>];
};
export type UseContextHookType = { useContext<T>(context: ContextType<T>): T };

export type JSXElement = {
  vtype: any;
  src: any;
  type: any;
  key: any;
  ref: any;
  props: any;
  // @ts-ignore
  [BELONG_CLASS_VNODE_KEY]: any;
};

export type ProviderType<T> = {
  vtype: number;
  _context: ContextType<T>;
};

export type ContextType<T> = {
  vtype: number;
  Consumer: ContextType<T> | null;
  Provider: ProviderType<T> | null;
  value: T;
};

export type PortalType = {
  vtype: number;
  key: null | string;
  realNode: any;
  children: any;
};

export type RefType = {
  current: any;
};

export interface PromiseType<R> {
  then<U>(
    onFulfill: (value: R) => void | PromiseType<U> | U,
    onReject: (error: any) => void | PromiseType<U> | U
  ): void | PromiseType<U>;
}

export interface SuspenseState {
  promiseSet: Set<PromiseType<any>> | null; // suspense组件的promise列表
  childStatus: string;
  oldChildStatus: string; // 上一次Suspense的Children是否显示
  didCapture: boolean; // suspense是否捕获了异常
  promiseResolved: boolean; // suspense的promise是否resolve
}

export type Source = {
  fileName: string;
  lineNumber: number;
};

export type Callback = () => void;

export type VNode = {
  tag: VNodeTag,
  key: string | null, // 唯一标识符
  props: any, // 传给组件的props的值，类组件包含defaultProps，Lazy组件不包含
  type: any,
  realNode: any, // 如果是类，则存放实例；如果是div这种，则存放真实DOM；

  // 关系结构
  parent: VNode | null, // 父节点
  child: VNode | null, // 子节点
  next: VNode | null, // 兄弟节点
  cIndex, // 节点在children数组中的位置
  eIndex, // HorizonElement在jsx中的位置，例如：jsx中的null不会生成vNode，所以eIndex和cIndex不一致

  ref: RefType | ((handle: any) => void) | null, // 包裹一个函数，submit阶段使用，比如将外部useRef生成的对象赋值到ref上
  oldProps: any,

  // 是否已经被从树上移除
  isCleared,
  changeList: any, // DOM的变更列表
  effectList: any[] | null, // useEffect 的更新数组
  updates: any[] | null, // TreeRoot和ClassComponent使用的更新数组
  stateCallbacks: any[] | null, // 存放存在setState的第二个参数和HorizonDOM.render的第三个参数所在的node数组
  isForceUpdate: boolean, // 是否使用强制更新
  isSuspended, // 是否被suspense打断更新
  state: any, // ClassComponent和TreeRoot的状态
  hooks: Array<Hook<any, any>> | null, // 保存hook
  depContexts: Array<ContextType<any>> | null, // FunctionComponent和ClassComponent对context的依赖列表
  isDepContextChange: boolean, // context是否变更
  dirtyNodes: Array<VNode> | null, // 需要改动的节点数组
  shouldUpdate,
  childShouldUpdate,
  task: any,

  // 使用这个变量来记录修改前的值，用于恢复。
  context: any,
  // 因为LazyComponent会修改tag和type属性，为了能识别，增加一个属性
  isLazyComponent: boolean,

  // 因为LazyComponent会修改type属性，为了在diff中判断是否可以复用，需要增加一个lazyType
  lazyType: any,
  flags,
  clearChild: VNode | null,
  // one tree相关属性
  isCreated,
  oldHooks: Array<Hook<any, any>> | null, // 保存上一次执行的hook
  oldState: any,
  oldRef: RefType | ((handle: any) => void) | null,
  oldChild: VNode | null,
  promiseResolve: boolean, // suspense的promise是否resolve
  devProps: any, // 用于dev插件临时保存更新props值
  suspenseState: SuspenseState | null,

  path: string, // 保存从根到本节点的路径

  // 根节点数据
  toUpdateNodes: Set<VNode> | null, // 保存要更新的节点
  delegatedEvents: Set<string>,

  belongClassVNode: VNode | null, // 记录JSXElement所属class vNode，处理ref的时候使用

  // 状态管理器InulaX使用
  isStoreChange: boolean,
  observers: Set<any> | null, // 记录这个函数组件/类组件依赖哪些Observer
  classComponentWillUnmount: Function | null, // InulaX会在classComponentWillUnmount中清除对VNode的引入用
  src: Source | null, // 节点所在代码位置

  // reactive
  attrRContexts: Set<any> | null,
  compRContext: any | null,
}
