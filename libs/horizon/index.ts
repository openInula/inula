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
  useDebugValue
} from './src/renderer/hooks/HookExternal';
import { launchUpdateFromVNode as _launchUpdateFromVNode, asyncUpdates } from './src/renderer/TreeBuilder';
import { callRenderQueueImmediate } from './src/renderer/taskExecutor/RenderQueue';
import { runAsyncEffects } from './src/renderer/submit/HookEffectHandler';
import { getProcessingVNode as _getProcessingVNode } from './src/renderer/GlobalVar';

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
  _launchUpdateFromVNode,
  _getProcessingVNode,
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
  // 暂时给HorizonX使用
  _launchUpdateFromVNode,
  _getProcessingVNode,
};

export default Horizon;
