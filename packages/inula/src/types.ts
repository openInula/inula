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

import { Component } from './renderer/components/BaseClassComponent';
import { MutableRef, RefCallBack, RefObject } from './renderer/hooks/HookType';

import * as Event from './EventTypes';

//
// --------------------------------- Inula Base Types ----------------------------------
//

export type Key = string | number;

export interface InulaElement<
  P = any,
  T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>,
> {
  type: T;
  props: P;
  key: Key | null;
}

export interface InulaPortal extends InulaElement {
  key: Key | null;
  children: InulaNode;
}

interface InulaErrorInfo {
  componentStack: string;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type KVObject = {};

export type InulaFragment = Iterable<InulaNode>;

export type ComponentState = any;

export type InulaNode = string | number | null | boolean | undefined | InulaElement | InulaFragment | InulaPortal;

export interface ExoticComponent<P = KVObject> {
  (props: P): InulaElement | null;
}

interface ProviderProps<T> {
  value: T;
  children?: InulaNode | undefined;
}

interface ConsumerProps<T> {
  children: (value: T) => InulaNode;
}

export interface Context<T> {
  Provider: ExoticComponent<ProviderProps<T>>;
  Consumer: ExoticComponent<ConsumerProps<T>>;
  // 兼容React
  displayName?: string | undefined;
}

export interface FunctionComponent<P = KVObject> {
  (props: P, context?: any): InulaElement<any, any> | null;

  displayName?: string;
}

export interface ComponentClass<P = KVObject, S = ComponentState> extends StaticLifecycle<P, S> {
  new (props: P, context?: unknown): Component<P, S>;

  displayName?: string;
}

export type FC<P = KVObject> = FunctionComponent<P>;

export type ComponentType<P = KVObject> = ComponentClass<P> | FunctionComponent<P>;

export interface ChildrenType {
  map<T, C>(
    children: C | Array<C>,
    fn: (child: C, index: number) => T,
    context?: any
  ): C extends null | undefined ? C : Array<Exclude<T, boolean | null | undefined>>;

  forEach<C>(children: C | Array<C>, fn: (child: C, index: number) => void): void;

  count(children: any): number;

  only<C>(children: C): C extends unknown[] ? never : C;

  toArray(children: InulaNode | InulaNode[]): Array<Exclude<InulaNode, boolean | null | undefined>>;
}

export type ForwardRef<T> = ((inst: T | null) => void) | MutableRef<T | null> | null;

export interface ForwardRefRenderFunc<T, P = KVObject> {
  (props: P, ref: ForwardRef<T>): InulaElement | null;
}

export type PropsOmitRef<P> = 'ref' extends keyof P ? Omit<P, 'ref'> : P;

export type PropsWithRef<P> = 'ref' extends keyof P
  ? P extends { ref?: infer R | undefined }
    ? string extends R
      ? PropsOmitRef<P> & { ref?: Exclude<R, string> }
      : P
    : P
  : P;

type Attributes = {
  key?: Key | null | undefined;
};

export type Ref<T> = RefCallBack<T> | RefObject<T> | null;

export type RefAttributes<T> = Attributes & {
  ref?: Ref<T> | null;
};

export type ComponentPropsWithRef<T extends any> = T extends new (props: infer P) => Component<any, any>
  ? PropsOmitRef<P> & RefAttributes<InstanceType<T>>
  : PropsWithRef<any>;

export type LazyComponent<T extends ComponentType<any>> = ExoticComponent<ComponentPropsWithRef<T>> & {
  readonly _result: T;
};

export type MemoComponent<T extends ComponentType<any>> = ExoticComponent<ComponentPropsWithRef<T>> & {
  readonly type: T;
  displayName?: string;
};

export type Suspense = ExoticComponent<{ children?: InulaNode; fallback: InulaNode }>;

export type Fragment = ExoticComponent<{ children?: InulaNode }>;

export type StrictMode = ExoticComponent<{ children?: InulaNode }>;

// 兼容React
export type InulaProfiler = ExoticComponent<{ children?: InulaNode; id: string; onRender: any }>;

//
// --------------------------------- Inula Component Types ----------------------------------
//

interface OutDateLifecycle<P, S> {
  /**
   * @deprecated
   * @see componentDidMount
   */
  componentWillMount?(): void;

  /**
   * @deprecated
   * @alias componentWillMount
   */
  UNSAFE_componentWillMount?(): void;

  /**
   * @deprecated
   * @see getDerivedStateFromProps
   */
  componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void;

  /**
   * @deprecated
   * @alias componentWillReceiveProps
   */
  UNSAFE_componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void;

  /**
   * @deprecated
   * @alias getSnapshotBeforeUpdate
   */
  componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void;

  /**
   * @deprecated
   * @alias componentWillUpdate
   */
  UNSAFE_componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void;
}

interface StaticLifecycle<P, S> {
  getDerivedStateFromProps?(nextProps: Readonly<P>, prevState: S): Partial<S> | null;

  getDerivedStateFromError?(error: any): Partial<S> | null;
}

export interface ComponentLifecycle<P, S, SS> extends OutDateLifecycle<P, S>, StaticLifecycle<P, S> {
  componentDidMount?(): void;

  getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): SS | null;

  componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void;

  shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean;

  componentWillUnmount?(): void;

  componentDidCatch?(error: Error, errorInfo: InulaErrorInfo): void;
}

//
// --------------------------------- Inula Hook Types----------------------------------
//

export type BasicStateAction<S> = S | ((prevState: S) => S);

export type Dispatch<A> = (value: A) => void;

export type DispatchVoid = () => void;

export type Reducer<S, A> = (prevState: S, action: A) => S;

export type ReducerVoid<S> = (prevState: S) => S;

export type ReducerStateVoid<R extends ReducerVoid<any>> = R extends ReducerVoid<infer S> ? S : never;

export type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;
export type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never;

export type DependencyList = Array<unknown>;

export type EffectCallBack = () => void | (() => void);

//
// --------------------------------- Inula JSX Types----------------------------------
//

export type JSXElementConstructor<P> =
  | ((props: P) => InulaElement<any, any> | null)
  | (new (props: P) => Component<any, any>);

//
// --------------------------------- Inula Event Types----------------------------------
//
interface InulaBaseEvent<E = unknown, Tr = unknown, Ta = unknown> {
  nativeEvent: E;
  trigger: Tr;
  target: Ta;
  bubbles: boolean;
  cancelable: boolean;
  defaultPrevented: boolean;
  eventPhase: number;
  isTrusted: boolean;

  preventDefault(): void;

  isDefaultPrevented(): boolean;

  stopPropagation(): void;

  isPropagationStopped(): boolean;

  persist(): void;

  timeStamp: number;
  type: string;
}

// eslint-disable-next-line
interface SyntheticEvent<T = Element, E = Event> extends InulaBaseEvent<E, EventTarget & T, EventTarget> {}

export interface ClipboardEvent<T = Element> extends SyntheticEvent<T, Event.DomClipboardEvent> {
  clipboardData: DataTransfer;
}

export interface CompositionEvent<T = Element> extends SyntheticEvent<T, Event.DomCompositionEvent> {
  data: string;
}

export interface DragEvent<T = Element> extends MouseEvent<T, Event.DomDragEvent> {
  dataTransfer: DataTransfer;
}

export interface PointerEvent<T = Element> extends MouseEvent<T, Event.DomPointerEvent> {
  pointerId: number;
  pressure: number;
  tangentialPressure: number;
  tiltX: number;
  tiltY: number;
  twist: number;
  width: number;
  height: number;
  pointerType: 'mouse' | 'pen' | 'touch';
  isPrimary: boolean;
}

export interface FocusEvent<Target = Element, RelatedTarget = Element>
  extends SyntheticEvent<Target, Event.DomFocusEvent> {
  relatedTarget: (EventTarget & RelatedTarget) | null;
  target: EventTarget & Target;
}

export type FormEvent<T = Element> = SyntheticEvent<T>;

export interface InvalidEvent<T = Element> extends SyntheticEvent<T> {
  target: EventTarget & T;
}

export interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
  target: EventTarget & T;
}

export interface WheelEvent<T = Element> extends MouseEvent<T, Event.DomWheelEvent> {
  deltaMode: number;
  deltaX: number;
  deltaY: number;
  deltaZ: number;
}

export interface AnimationEvent<T = Element> extends SyntheticEvent<T, Event.DomAnimationEvent> {
  animationName: string;
  elapsedTime: number;
  pseudoElement: string;
}

export interface TransitionEvent<T = Element> extends SyntheticEvent<T, Event.DomTransitionEvent> {
  elapsedTime: number;
  propertyName: string;
  pseudoElement: string;
}

export interface UIEvent<T = Element, E = Event.DomUIEvent> extends SyntheticEvent<T, E> {
  detail: number;
}

export type ModifierKey =
  | 'Alt'
  | 'AltGraph'
  | 'CapsLock'
  | 'Control'
  | 'Fn'
  | 'FnLock'
  | 'Meta'
  | 'NumLock'
  | 'ScrollLock'
  | 'Shift'
  | 'Symbol'
  | 'SymbolLock';

export interface KeyboardEvent<T = Element> extends UIEvent<T, Event.DomKeyboardEvent> {
  altKey: boolean;
  /** @deprecated */
  charCode: number;
  ctrlKey: boolean;
  code: string;
  key: string;
  /** @deprecated */
  keyCode: number;
  locale: string;
  location: number;
  metaKey: boolean;
  repeat: boolean;
  shiftKey: boolean;
  /** @deprecated */
  which: number;

  getModifierState(key: ModifierKey): boolean;
}

export interface TouchEvent<T = Element> extends UIEvent<T, Event.DomTouchEvent> {
  altKey: boolean;
  changedTouches: TouchList;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  targetTouches: TouchList;
  touches: TouchList;

  getModifierState(key: ModifierKey): boolean;
}

export interface MouseEvent<T = Element, E = Event.DomMouseEvent> extends UIEvent<T, E> {
  altKey: boolean;
  button: number;
  buttons: number;
  clientX: number;
  clientY: number;
  ctrlKey: boolean;
  metaKey: boolean;
  movementX: number;
  movementY: number;
  pageX: number;
  pageY: number;
  relatedTarget: EventTarget | null;
  screenX: number;
  screenY: number;
  shiftKey: boolean;

  getModifierState(key: ModifierKey): boolean;
}

//
// --------------------------------- Event Handler Types----------------------------------
//

export type EventHandler<E extends SyntheticEvent<unknown>> = { bivarianceHack(event: E): void }['bivarianceHack'];

export type ClipboardEventHandler<T = Element> = EventHandler<ClipboardEvent<T>>;
export type CompositionEventHandler<T = Element> = EventHandler<CompositionEvent<T>>;
export type DragEventHandler<T = Element> = EventHandler<DragEvent<T>>;
export type FocusEventHandler<T = Element> = EventHandler<FocusEvent<T>>;
export type FormEventHandler<T = Element> = EventHandler<FormEvent<T>>;
export type ChangeEventHandler<T = Element> = EventHandler<ChangeEvent<T>>;
export type KeyboardEventHandler<T = Element> = EventHandler<KeyboardEvent<T>>;
export type MouseEventHandler<T = Element> = EventHandler<MouseEvent<T>>;
export type TouchEventHandler<T = Element> = EventHandler<TouchEvent<T>>;
export type PointerEventHandler<T = Element> = EventHandler<PointerEvent<T>>;
export type UIEventHandler<T = Element> = EventHandler<UIEvent<T>>;
export type WheelEventHandler<T = Element> = EventHandler<WheelEvent<T>>;
export type AnimationEventHandler<T = Element> = EventHandler<AnimationEvent<T>>;
export type TransitionEventHandler<T = Element> = EventHandler<TransitionEvent<T>>;

//
// --------------------------------- Css Props----------------------------------
//

export type CSSProperties = Record<string | number, any>;
