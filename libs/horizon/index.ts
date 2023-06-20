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

import {
  TYPE_FRAGMENT as Fragment,
  TYPE_PROFILER as Profiler,
  TYPE_STRICT_MODE as StrictMode,
  TYPE_SUSPENSE as Suspense,
} from './src/external/JSXElementType';

import { Component, PureComponent } from './src/renderer/components/BaseClassComponent';
import { createRef } from './src/renderer/components/CreateRef';
import { Children } from './src/external/ChildrenUtil';
import { createElement, cloneElement, isValidElement } from './src/external/JSXElement';
import { createContext } from './src/renderer/components/context/CreateContext';
import { lazy } from './src/renderer/components/Lazy';
import { forwardRef } from './src/renderer/components/ForwardRef';
import { memo } from './src/renderer/components/Memo';
import './src/external/devtools';

import {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useDebugValue,
} from './src/renderer/hooks/HookExternal';
import { asyncUpdates } from './src/renderer/TreeBuilder';
import { callRenderQueueImmediate } from './src/renderer/taskExecutor/RenderQueue';
import { runAsyncEffects } from './src/renderer/submit/HookEffectHandler';
import {
  isContextProvider,
  isContextConsumer,
  isElement,
  isValidElementType,
  isForwardRef,
  isFragment,
  isLazy,
  isMemo,
  isPortal,
} from './src/external/HorizonIs';
import { createStore, useStore, clearStore } from './src/horizonx/store/StoreHandler';
import * as reduxAdapter from './src/horizonx/adapters/redux';
import { watch } from './src/horizonx/proxy/watch';

// act用于测试，作用是：如果fun触发了刷新（包含了异步刷新），可以保证在act后面的代码是在刷新完成后才执行。
const act = fun => {
  asyncUpdates(fun);
  callRenderQueueImmediate();
  runAsyncEffects();
};

import {
  render,
  createPortal,
  unstable_batchedUpdates,
  findDOMNode,
  unmountComponentAtNode,
} from './src/dom/DOMExternal';

const Horizon = {
  Children,
  createRef,
  Component,
  PureComponent,
  createContext,
  forwardRef,
  lazy,
  memo,
  useDebugValue,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  Fragment,
  Profiler,
  StrictMode,
  Suspense,
  createElement,
  cloneElement,
  isValidElement,
  render,
  createPortal,
  unstable_batchedUpdates,
  findDOMNode,
  unmountComponentAtNode,
  act,
  createStore,
  useStore,
  clearStore,
  reduxAdapter,
  watch,
  isFragment,
  isElement,
  isValidElementType,
  isForwardRef,
  isLazy,
  isMemo,
  isPortal,
  isContextProvider,
  isContextConsumer,
};

export const version = __VERSION__;
export {
  Children,
  createRef,
  Component,
  PureComponent,
  createContext,
  forwardRef,
  lazy,
  memo,
  useDebugValue,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  Fragment,
  Profiler,
  StrictMode,
  Suspense,
  createElement,
  cloneElement,
  isValidElement,
  render,
  createPortal,
  unstable_batchedUpdates,
  findDOMNode,
  unmountComponentAtNode,
  act,
  // 状态管理器HorizonX接口
  createStore,
  useStore,
  clearStore,
  reduxAdapter,
  watch,
  // 兼容ReactIs
  isFragment,
  isElement,
  isValidElementType,
  isForwardRef,
  isLazy,
  isMemo,
  isPortal,
  isContextProvider,
  isContextConsumer,
};

export default Horizon;
