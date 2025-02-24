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

import {
  TYPE_FRAGMENT as Fragment,
  TYPE_PROFILER as Profiler,
  TYPE_STRICT_MODE as StrictMode,
  TYPE_SUSPENSE as Suspense,
  TYPE_FORWARD_REF as ForwardRef,
  TYPE_MEMO as Memo,
} from './external/JSXElementType';

import { Component, PureComponent } from './renderer/components/BaseClassComponent';
import { createRef } from './renderer/components/CreateRef';
import { Children } from './external/ChildrenUtil';
import { createElement, cloneElement, isValidElement } from './external/JSXElement';
import { createContext } from './renderer/components/context/CreateContext';
import { lazy } from './renderer/components/Lazy';
import { forwardRef } from './renderer/components/ForwardRef';
import { memo } from './renderer/components/Memo';
import './external/devtools';

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
} from './renderer/hooks/HookExternal';
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
} from './external/InulaIs';
import { createStore, useStore, clearStore } from './inulax/store/StoreHandler';
import * as reduxAdapter from './inulax/adapters/redux';
import { watch } from './inulax/proxy/watch';
import { act } from './external/TestUtil';
import { defaultHostConfig } from './dom';
import {
  render,
  createPortal,
  unstable_batchedUpdates,
  findNode as findDOMNode,
  unmountComponentAtNode,
  createRoot,
} from './renderer/External';

import { syncUpdates as flushSync } from './renderer/TreeBuilder';
import { toRaw } from './inulax/proxy/ProxyHandler';
import { InulaReconciler } from './renderer';

const version = __VERSION__;
// 使用默认renderer
InulaReconciler.setHostConfig(defaultHostConfig);

const Inula = {
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
  createElement,
  cloneElement,
  isValidElement,
  render,
  createRoot,
  createPortal,
  unstable_batchedUpdates,
  findDOMNode,
  unmountComponentAtNode,
  act,
  flushSync,
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
  ForwardRef,
  Memo,
  Fragment,
  Profiler,
  StrictMode,
  Suspense,
  version,
};

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
  createElement,
  cloneElement,
  isValidElement,
  createRoot,
  render,
  createPortal,
  unstable_batchedUpdates,
  findDOMNode,
  unmountComponentAtNode,
  act,
  flushSync,
  // 状态管理器InulaX接口
  createStore,
  useStore,
  clearStore,
  reduxAdapter,
  watch,
  toRaw,
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
  ForwardRef,
  Memo,
  Fragment,
  Profiler,
  StrictMode,
  Suspense,
  version,
};

export * from './types';
export default Inula;
export { InulaReconciler };

// test for ci