import {
  TYPE_FRAGMENT,
  TYPE_PROFILER,
  TYPE_STRICT_MODE,
  TYPE_SUSPENSE,
} from './JSXElementType';

import {Component, PureComponent} from '../renderer/components/BaseClassComponent';
import {createRef} from '../renderer/components/CreateRef';
import {Children} from './ChildrenUtil';
import {
  createElement,
  cloneElement,
  isValidElement,
} from './JSXElement';
import {createContext} from '../renderer/components/context/CreateContext';
import {lazy} from '../renderer/components/Lazy';
import {forwardRef} from '../renderer/components/ForwardRef';
import {memo} from '../renderer/components/Memo';

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
} from '../renderer/hooks/HookExternal';
import {launchUpdateFromVNode, asyncUpdates} from '../renderer/TreeBuilder';
import {callRenderQueueImmediate} from '../renderer/taskExecutor/RenderQueue';
import {runAsyncEffects} from '../renderer/submit/HookEffectHandler';
import { getProcessingVNode } from '../renderer/hooks/BaseHook';

const act = (fun) => {
  asyncUpdates(fun);
  callRenderQueueImmediate();
  runAsyncEffects();
}

export {
  Children,
  createRef,
  Component,
  PureComponent,
  createContext,
  forwardRef,
  lazy,
  memo,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  TYPE_FRAGMENT as Fragment,
  TYPE_PROFILER as Profiler,
  TYPE_STRICT_MODE as StrictMode,
  TYPE_SUSPENSE as Suspense,
  createElement,
  cloneElement,
  isValidElement,
  act,
  launchUpdateFromVNode,
  getProcessingVNode,
};
