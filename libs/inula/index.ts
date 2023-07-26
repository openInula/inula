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
  TYPE_FORWARD_REF as ForwardRef,
  TYPE_MEMO as Memo,
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
} from './src/external/InulaIs';
import { createStore, useStore, clearStore } from './src/inulax/store/StoreHandler';
import * as reduxAdapter from './src/inulax/adapters/redux';
import { watch } from './src/inulax/proxy/watch';
import { act } from './src/external/TestUtil';

import {
  render,
  createPortal,
  unstable_batchedUpdates,
  findDOMNode,
  unmountComponentAtNode,
} from './src/dom/DOMExternal';

import { syncUpdates as flushSync } from './src/renderer/TreeBuilder';
import { toRaw } from './src/inulax/proxy/ProxyHandler';

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
  createElement,
  cloneElement,
  isValidElement,
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
};

export default Inula;
