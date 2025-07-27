/**
 * 定义vNode的类型
 */
type VNodeTag = string;

declare const EffectConstant: {
  NoEffect: number;
  DepsChange: number;
  LayoutEffect: number;
  Effect: number;
};

type ValueOf<T> = T[keyof T];
interface Hook<S, A> {
  state: Reducer$2<S, A> | Effect | Memo<S> | CallBack<S> | MutableRef<S>;
  hIndex: number;
}
interface Reducer$2<S, A> {
  stateValue: S | null;
  trigger: Trigger<A> | null;
  reducer: ((S: any, A: any) => S) | null;
  updates: Array<Update<S, A>> | null;
  isUseState: boolean;
}
type Update<S, A> = {
  action: A;
  didCalculated: boolean;
  state: S | null;
};
type Effect = {
  effect: () => (() => void) | void;
  removeEffect: (() => void) | void;
  dependencies: Array<any> | null;
  effectConstant: ValueOf<typeof EffectConstant>;
};
type Memo<V> = {
  result: V | null;
  dependencies: Array<any> | null;
};
type CallBack<F> = {
  func: F | null;
  dependencies: Array<any> | null;
};
type MutableRef<V> = {
  current: V;
};
type RefObject<T> = {
  readonly current: T | null;
};
type RefCallBack<T> = {
  bivarianceHack(inst: T | null): void;
}['bivarianceHack'];
type Trigger<A> = (state: A) => void;

type KeyType = string | symbol;
type ObjectType = Record<KeyType, any>;
type FnType = () => any;
type MapTypes = Map<any, any> | WeakMap<any, any>;
type SetTypes = Set<any> | WeakSet<any>;
type IterableTypes = Map<any, any> | Set<any>;
type CollectionTypes = Map<any, any> | Set<any>;
type CollectionStringTypes = 'Map' | 'WeakMap' | 'Set' | 'WeakSet';
type Listener = (change: any) => void;
type Listeners = Listener[];
type CurrentListener = {
  current: Listener;
};
type WatchHandler = (key?: KeyType, oldValue?: any, newValue?: any, mutation?: any) => void;
type WatchFn = (prop: KeyType, handler?: WatchHandler) => void;
type WatchCallback = (val: any, prevVal: any) => void;
type WatchProp<T> = T & {
  watch?: WatchFn;
};
type AddWatchProp<T> =
  T extends Map<infer K, infer V>
    ? WatchProp<Map<K, AddWatchProp<V>>>
    : T extends WeakMap<infer K, infer V>
      ? WatchProp<WeakMap<K, AddWatchProp<V>>>
      : T extends Set<infer U>
        ? WatchProp<Set<AddWatchProp<U>>>
        : T extends WeakSet<infer U>
          ? WatchProp<WeakSet<AddWatchProp<U>>>
          : T extends ObjectType
            ? WatchProp<{
                [K in keyof T]: AddWatchProp<T[K]>;
              }>
            : T;
interface IObserver {
  watchers: {
    [key: KeyType]: WatchHandler[];
  };
  useProp: (key: KeyType) => void;
  addListener: (listener: Listener) => void;
  removeListener: (listener: () => void) => void;
  setProp: (key: KeyType, mutation: any, oldValue?: any, newValue?: any) => void;
  triggerChangeListeners: (mutation: any) => void;
  triggerUpdate: (vNode: any) => void;
  allChange: () => void;
  arrayLengthChange: (length: number) => void;
  clearByVNode: (vNode: any) => void;
}
type Mutation<T = any> = {
  mutation: boolean;
  from: T;
  to: T;
};

type RContextFn = FnType;
type RContextMap = Map<RContext, number>;
declare enum ContextType$1 {
  COMPUTED = 'COMPUTE',
  WATCH = 'WATCH',
}
declare enum DirtyLevels {
  NotDirty = 0,
  QueryingDirty = 1,
  MaybeDirty_ComputedSideEffect = 2,
  MaybeDirty = 3,
  Dirty = 4,
}
declare class RContext {
  runs: number;
  fn: RContextFn;
  type: ContextType$1;
  trigger: FnType;
  job?: FnType;
  reactiveDependents: Set<Observer> | null;
  _dirtyLevel: DirtyLevels;
  _trackId: number;
  _shouldSchedule: boolean;
  constructor(fn: RContextFn, type: ContextType$1, trigger?: FnType, job?: FnType);
  start(): typeof endRContext;
  run(): any;
  stop(): void;
  isDirty(): boolean;
  setDirty(v: any): void;
  setDirtyLevel(dirtyLevel: any): void;
}
declare function endRContext(): void;

type ComputedGetter<T> = () => T;
type ComputedSetter<T> = (value: T) => void;
type ComputedOptions<T> = {
  get: ComputedGetter<T>;
  set?: ComputedSetter<T>;
  triggerAnyway?: boolean;
};
declare function computed<T>(options: ComputedOptions<T>): ComputedImpl<T>;
declare function computed<T>(
  getter: ComputedGetter<T>,
  options?: {
    triggerAnyway?: boolean;
  }
): ComputedImpl<T>;
declare function useComputed<T>(options: ComputedOptions<T>): ComputedImpl<T>;
declare function useComputed<T>(
  getter: ComputedGetter<T>,
  options?: {
    triggerAnyway?: boolean;
  }
): ComputedImpl<T>;
declare class ComputedImpl<T = any> {
  private _value;
  private readonly getter;
  private readonly setter?;
  private readonly rContext;
  private readonly observer;
  readonly _isRef = true;
  readonly _isReadonly: boolean;
  constructor(options: ComputedOptions<T>);
  get value(): T;
  set value(newValue: T);
  private updateValue;
  private trigger;
  stop(): void;
}

declare enum ObserverType {
  REF = 'REF',
  REACTIVE = 'REACTIVE',
  COMPUTED = 'COMPUTED',
}
/**
 * 一个对象（对象、数组、集合）对应一个Observer
 */
declare class Observer implements IObserver {
  type: ObserverType;
  source?: ComputedImpl;
  vNodeKeys: WeakMap<VNode, Set<any>>;
  keyVNodes: Map<any, Set<VNode>>;
  listeners: Listener[];
  watchers: {};
  rContexts: {
    [key: string | symbol]: RContextMap;
  };
  constructor(type: ObserverType, source?: ComputedImpl);
  useProp(key: string | symbol): void;
  setProp(key: string | symbol, mutation: Mutation, oldValue?: any, newValue?: any, dirtyLevel?: DirtyLevels): void;
  triggerChangeListeners({ mutation, vNodes }: { mutation: any; vNodes: any }): void;
  triggerUpdate(vNode: VNode): void;
  addListener(listener: Listener): void;
  removeListener(listener: Listener): void;
  allChange(): void;
  arrayLengthChange(length: number): void;
  clearByVNode(vNode: VNode): void;
}

declare class RContextScope {
  /**
   * 存储作用域内的所有RContext
   */
  rContexts: RContext[];
  constructor();
  /**
   * 激活当前作用域
   */
  on(): void;
  /**
   * 停用当前作用域
   */
  off(): void;
  /**
   * 停止当前作用域及其所有RContext
   */
  stop(): void;
}

declare class VNode {
  tag: VNodeTag;
  key: string | null;
  props: any;
  type: any;
  realNode: any;
  parent: VNode | null;
  child: VNode | null;
  next: VNode | null;
  cIndex: number;
  eIndex: number;
  ref: RefType$1 | ((handle: any) => void) | null;
  oldProps: any;
  isCleared: boolean;
  changeList: any;
  effectList: any[] | null;
  updates: any[] | null;
  stateCallbacks: any[] | null;
  isForceUpdate: boolean;
  isSuspended: boolean;
  state: any;
  hooks: Array<Hook<any, any>> | null;
  depContexts: Array<ContextType<any>> | null;
  isDepContextChange: boolean;
  dirtyNodes: Array<VNode> | null;
  shouldUpdate: boolean;
  childShouldUpdate: boolean;
  task: any;
  context: any;
  isLazyComponent: boolean;
  lazyType: any;
  flags: number;
  clearChild: VNode | null;
  isCreated: boolean;
  oldHooks: Array<Hook<any, any>> | null;
  oldState: any;
  oldRef: RefType$1 | ((handle: any) => void) | null;
  oldChild: VNode | null;
  promiseResolve: boolean;
  devProps: any;
  suspenseState: SuspenseState | null;
  path: string;
  toUpdateNodes: Set<VNode> | null;
  delegatedEvents: Set<string>;
  isStoreChange: boolean;
  observers: Set<Observer> | null;
  src: Source | null;
  instanceVariables: {
    [key: string | symbol]: any;
  } | null;
  compRContext: RContext | null;
  compRContextScope: RContextScope | null;
  constructor(tag: VNodeTag, props: any, key: null | string, realNode: any);
}

type ProviderType<T> = {
  vtype: number;
  _context: ContextType<T>;
};
type ContextType<T> = {
  vtype: number;
  Consumer: ContextType<T> | null;
  Provider: ProviderType<T> | null;
  value: T;
};
type RefType$1 = {
  current: any;
};
interface PromiseType<R> {
  then<U>(
    onFulfill: (value: R) => void | PromiseType<U> | U,
    onReject: (error: any) => void | PromiseType<U> | U
  ): void | PromiseType<U>;
}
interface SuspenseState {
  promiseSet: Set<PromiseType<any>> | null;
  childStatus: string;
  oldChildStatus: string;
  didCapture: boolean;
  promiseResolved: boolean;
}
type Source = {
  fileName: string;
  lineNumber: number;
};
type Callback$1 = () => void;

/**
 * Component的api setState和forceUpdate在实例生成阶段实现
 */
interface Component<P = KVObject, S = KVObject, SS = any, C = any> extends ComponentLifecycle<P, S, SS> {
  forceUpdate(callback?: () => void): void;
  render(): InulaNode;
}
declare class Component<P = KVObject, S = KVObject, SS = any, C = any> {
  static contextType?: Context$1<any> | undefined;
  context: C | undefined;
  readonly props: Readonly<P>;
  state: Readonly<S>;
  refs: {
    [key: string]: Component<any>;
  };
  isReactComponent: boolean;
  constructor(props: P, context?: C);
  setState<K extends keyof S>(
    state: ((prevState: Readonly<S>, props: Readonly<P>) => Pick<S, K> | S | null) | Pick<S, K> | S | null,
    callback?: Callback$1
  ): void;
}
/**
 * 支持PureComponent
 */
declare class PureComponent<P, S, SS, C = any> extends Component<P, S, SS> {
  constructor(props: P, context: C);
}

type DomAnimationEvent = AnimationEvent;
type DomClipboardEvent = ClipboardEvent;
type DomCompositionEvent = CompositionEvent;
type DomDragEvent = DragEvent;
type DomFocusEvent = FocusEvent;
type DomKeyboardEvent = KeyboardEvent;
type DomMouseEvent = MouseEvent;
type DomTouchEvent = TouchEvent;
type DomPointerEvent = PointerEvent;
type DomTransitionEvent = TransitionEvent;
type DomUIEvent = UIEvent;
type DomWheelEvent = WheelEvent;

type Event_DomAnimationEvent = DomAnimationEvent;
type Event_DomClipboardEvent = DomClipboardEvent;
type Event_DomCompositionEvent = DomCompositionEvent;
type Event_DomDragEvent = DomDragEvent;
type Event_DomFocusEvent = DomFocusEvent;
type Event_DomKeyboardEvent = DomKeyboardEvent;
type Event_DomMouseEvent = DomMouseEvent;
type Event_DomTouchEvent = DomTouchEvent;
type Event_DomPointerEvent = DomPointerEvent;
type Event_DomTransitionEvent = DomTransitionEvent;
type Event_DomUIEvent = DomUIEvent;
type Event_DomWheelEvent = DomWheelEvent;
declare namespace Event {
  export type {
    Event_DomAnimationEvent as DomAnimationEvent,
    Event_DomClipboardEvent as DomClipboardEvent,
    Event_DomCompositionEvent as DomCompositionEvent,
    Event_DomDragEvent as DomDragEvent,
    Event_DomFocusEvent as DomFocusEvent,
    Event_DomKeyboardEvent as DomKeyboardEvent,
    Event_DomMouseEvent as DomMouseEvent,
    Event_DomTouchEvent as DomTouchEvent,
    Event_DomPointerEvent as DomPointerEvent,
    Event_DomTransitionEvent as DomTransitionEvent,
    Event_DomUIEvent as DomUIEvent,
    Event_DomWheelEvent as DomWheelEvent,
  };
}

type Key = string | number;
interface InulaElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
  type: T;
  props: P;
  key: Key | null;
}
interface InulaPortal extends InulaElement {
  key: Key | null;
  children: InulaNode;
}
interface InulaErrorInfo {
  componentStack: string;
}
type KVObject = {};
type InulaFragment = Iterable<InulaNode>;
type ComponentState = any;
type InulaNode = string | number | null | boolean | undefined | InulaElement | InulaFragment | InulaPortal;
interface ExoticComponent<P = KVObject> {
  (props: P): InulaElement | null;
}
interface ProviderProps<T> {
  value: T;
  children?: InulaNode | undefined;
}
interface ConsumerProps<T> {
  children: (value: T) => InulaNode;
}
interface Context$1<T> {
  Provider: ExoticComponent<ProviderProps<T>>;
  Consumer: ExoticComponent<ConsumerProps<T>>;
  displayName?: string | undefined;
}
interface FunctionComponent<P = KVObject> {
  (props: P, context?: any): InulaElement<any, any> | null;
  displayName?: string;
}
interface ComponentClass<P = KVObject, S = ComponentState> extends StaticLifecycle<P, S> {
  new (props: P, context?: unknown): Component<P, S>;
  displayName?: string;
}
type FC<P = KVObject> = FunctionComponent<P>;
type ComponentType<P = KVObject> = ComponentClass<P> | FunctionComponent<P>;
interface ChildrenType {
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
type ForwardRef<T> = ((inst: T | null) => void) | MutableRef<T | null> | null;
interface ForwardRefRenderFunc<T, P = KVObject> {
  (props: P, ref: ForwardRef<T>): InulaElement | null;
}
type PropsOmitRef<P> = 'ref' extends keyof P ? Omit<P, 'ref'> : P;
type PropsWithRef<P> = 'ref' extends keyof P
  ? P extends {
      ref?: infer R | undefined;
    }
    ? string extends R
      ? PropsOmitRef<P> & {
          ref?: Exclude<R, string>;
        }
      : P
    : P
  : P;
type Attributes = {
  key?: Key | null | undefined;
};
type Ref<T> = RefCallBack<T> | RefObject<T> | null;
type RefAttributes<T> = Attributes & {
  ref?: Ref<T> | null;
};
type ComponentPropsWithRef<T extends any> = T extends new (props: infer P) => Component<any, any>
  ? PropsOmitRef<P> & RefAttributes<InstanceType<T>>
  : PropsWithRef<any>;
type LazyComponent<T extends ComponentType<any>> = ExoticComponent<ComponentPropsWithRef<T>> & {
  readonly _result: T;
};
type MemoComponent<T extends ComponentType<any>> = ExoticComponent<ComponentPropsWithRef<T>> & {
  readonly type: T;
  displayName?: string;
};
type Suspense = ExoticComponent<{
  children?: InulaNode;
  fallback: InulaNode;
}>;
type Fragment = ExoticComponent<{
  children?: InulaNode;
}>;
type StrictMode = ExoticComponent<{
  children?: InulaNode;
}>;
type InulaProfiler = ExoticComponent<{
  children?: InulaNode;
  id: string;
  onRender: any;
}>;
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
interface ComponentLifecycle<P, S, SS> extends OutDateLifecycle<P, S>, StaticLifecycle<P, S> {
  componentDidMount?(): void;
  getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): SS | null;
  componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void;
  shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean;
  componentWillUnmount?(): void;
  componentDidCatch?(error: Error, errorInfo: InulaErrorInfo): void;
}
type BasicStateAction<S> = S | ((prevState: S) => S);
type Dispatch$1<A> = (value: A) => void;
type DispatchVoid = () => void;
type Reducer$1<S, A> = (prevState: S, action: A) => S;
type ReducerVoid<S> = (prevState: S) => S;
type ReducerStateVoid<R extends ReducerVoid<any>> = R extends ReducerVoid<infer S> ? S : never;
type ReducerState<R extends Reducer$1<any, any>> = R extends Reducer$1<infer S, any> ? S : never;
type ReducerAction<R extends Reducer$1<any, any>> = R extends Reducer$1<any, infer A> ? A : never;
type DependencyList = Array<unknown>;
type EffectCallBack = () => void | (() => void);
interface BaseProps {
  className?: string;
  style?: string | Record<string, string | number>;
  [key: string]: any;
}
interface Instance {
  $parent?: Instance;
  $vnode: VNode;
  $el: HTMLElement | null;
  $props: BaseProps;
  $children: Instance[];
  $root: Instance;
  $refs: Record<string, HTMLElement | Instance | undefined>;
  [key: string]: any;
}
type JSXElementConstructor<P> = ((props: P) => InulaElement<any, any> | null) | (new (props: P) => Component<any, any>);
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
interface SyntheticEvent<T = Element, E = Event> extends InulaBaseEvent<E, EventTarget & T, EventTarget> {}
interface ClipboardEvent$1<T = Element> extends SyntheticEvent<T, DomClipboardEvent> {
  clipboardData: DataTransfer;
}
interface CompositionEvent$1<T = Element> extends SyntheticEvent<T, DomCompositionEvent> {
  data: string;
}
interface DragEvent$1<T = Element> extends MouseEvent$1<T, DomDragEvent> {
  dataTransfer: DataTransfer;
}
interface PointerEvent$1<T = Element> extends MouseEvent$1<T, DomPointerEvent> {
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
interface FocusEvent$1<Target = Element, RelatedTarget = Element> extends SyntheticEvent<Target, DomFocusEvent> {
  relatedTarget: (EventTarget & RelatedTarget) | null;
  target: EventTarget & Target;
}
type FormEvent<T = Element> = SyntheticEvent<T>;
interface InvalidEvent<T = Element> extends SyntheticEvent<T> {
  target: EventTarget & T;
}
interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
  target: EventTarget & T;
}
interface WheelEvent$1<T = Element> extends MouseEvent$1<T, DomWheelEvent> {
  deltaMode: number;
  deltaX: number;
  deltaY: number;
  deltaZ: number;
}
interface AnimationEvent$1<T = Element> extends SyntheticEvent<T, DomAnimationEvent> {
  animationName: string;
  elapsedTime: number;
  pseudoElement: string;
}
interface TransitionEvent$1<T = Element> extends SyntheticEvent<T, DomTransitionEvent> {
  elapsedTime: number;
  propertyName: string;
  pseudoElement: string;
}
interface UIEvent$1<T = Element, E = DomUIEvent> extends SyntheticEvent<T, E> {
  detail: number;
}
type ModifierKey =
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
interface KeyboardEvent$1<T = Element> extends UIEvent$1<T, DomKeyboardEvent> {
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
interface TouchEvent$1<T = Element> extends UIEvent$1<T, DomTouchEvent> {
  altKey: boolean;
  changedTouches: TouchList;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  targetTouches: TouchList;
  touches: TouchList;
  getModifierState(key: ModifierKey): boolean;
}
interface MouseEvent$1<T = Element, E = DomMouseEvent> extends UIEvent$1<T, E> {
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
type EventHandler<E extends SyntheticEvent<unknown>> = {
  bivarianceHack(event: E): void;
}['bivarianceHack'];
type ClipboardEventHandler<T = Element> = EventHandler<ClipboardEvent$1<T>>;
type CompositionEventHandler<T = Element> = EventHandler<CompositionEvent$1<T>>;
type DragEventHandler<T = Element> = EventHandler<DragEvent$1<T>>;
type FocusEventHandler<T = Element> = EventHandler<FocusEvent$1<T>>;
type FormEventHandler<T = Element> = EventHandler<FormEvent<T>>;
type ChangeEventHandler<T = Element> = EventHandler<ChangeEvent<T>>;
type KeyboardEventHandler<T = Element> = EventHandler<KeyboardEvent$1<T>>;
type MouseEventHandler<T = Element> = EventHandler<MouseEvent$1<T>>;
type TouchEventHandler<T = Element> = EventHandler<TouchEvent$1<T>>;
type PointerEventHandler<T = Element> = EventHandler<PointerEvent$1<T>>;
type UIEventHandler<T = Element> = EventHandler<UIEvent$1<T>>;
type WheelEventHandler<T = Element> = EventHandler<WheelEvent$1<T>>;
type AnimationEventHandler<T = Element> = EventHandler<AnimationEvent$1<T>>;
type TransitionEventHandler<T = Element> = EventHandler<TransitionEvent$1<T>>;
type CSSProperties = Record<string | number, any>;

declare const TYPE_FRAGMENT: Fragment;
declare const TYPE_STRICT_MODE: StrictMode;
declare const TYPE_FORWARD_REF = 7;
declare const TYPE_SUSPENSE: Suspense;
declare const TYPE_PROFILER: InulaProfiler;
declare const TYPE_MEMO = 10;

declare function createRef<T>(): RefObject<T>;

declare const Children: ChildrenType;

declare function createElement(
  type: any,
  setting: any,
  ...children: any[]
): {
  [x: string]: any;
  vtype: number;
  src: any;
  type: any;
  key: any;
  ref: any;
  props: any;
};
declare function cloneElement(
  element: any,
  setting: any,
  ...children: any[]
): {
  [x: string]: any;
  vtype: number;
  src: any;
  type: any;
  key: any;
  ref: any;
  props: any;
};
declare function isValidElement<P>(element: KVObject | null | undefined): element is InulaElement<P>;

declare function createContext<T>(val: T): Context$1<T>;

declare function lazy<T extends ComponentType<any>>(
  promiseCtor: () => Promise<{
    default: T;
  }>
): LazyComponent<T>;

declare function forwardRef<T, P = any>(
  render: ForwardRefRenderFunc<T, P>
): ExoticComponent<PropsOmitRef<P>> & RefAttributes<T>;

declare function memo<Props extends Record<string, any>>(
  type: FunctionComponent<Props>,
  compare?: (oldProps: Readonly<Props>, newProps: Readonly<Props>) => boolean
): ExoticComponent<Props>;
declare function memo<T extends ComponentType<any>>(
  type: T,
  compare?: (oldProps: any, newProps: any) => boolean
): MemoComponent<T>;

declare function useContext<T>(Context: Context$1<T>): T;
declare function useState<S>(initialState: (() => S) | S): [S, Dispatch$1<BasicStateAction<S>>];
declare function useState<S = undefined>(): [S | undefined, Dispatch$1<BasicStateAction<S | undefined>>];
declare function useReducer<R extends ReducerVoid<any>, I>(
  reducer: R,
  initialArg: I,
  init: (arg: I) => ReducerVoid<R>
): [ReducerStateVoid<R>, DispatchVoid];
declare function useReducer<R extends ReducerVoid<any>>(
  reducer: R,
  initialArg: ReducerStateVoid<R>,
  init?: undefined
): [ReducerStateVoid<R>, DispatchVoid];
declare function useReducer<R extends Reducer$1<any, any>, I>(
  reducer: R,
  initialArg: I & ReducerState<R>,
  init?: (arg: I & ReducerState<R>) => ReducerState<R>
): [ReducerState<R>, Dispatch$1<ReducerAction<R>>];
declare function useReducer<R extends Reducer$1<any, any>, I>(
  reducer: R,
  initialArg: I,
  init?: (arg: I) => ReducerState<R>
): [ReducerState<R>, Dispatch$1<ReducerAction<R>>];
declare function useReducer<R extends Reducer$1<any, any>>(
  reducer: R,
  initialArg: ReducerState<R>,
  init?: undefined
): [ReducerState<R>, Dispatch$1<ReducerAction<R>>];
declare function useRef<T>(initialValue: T): MutableRef<T>;
declare function useRef<T>(initialValue: T | null): RefObject<T>;
declare function useRef<T = undefined>(): MutableRef<T | undefined>;
declare function useEffect(create: EffectCallBack, deps?: DependencyList): void;
declare function useLayoutEffect(create: EffectCallBack, deps?: DependencyList): void;
declare function useCallback<T>(callback: T, deps: DependencyList): T;
declare function useMemo<T>(create: () => T, deps: DependencyList | undefined): T;
declare function useImperativeHandle<T, R extends T>(
  ref: RefObject<T> | RefCallBack<T> | null | undefined,
  create: () => R,
  deps?: DependencyList
): void;
declare function useInstance(vNode?: VNode): Instance;
declare const useDebugValue: () => void;

declare function isElement(ele: any): ele is InulaElement;
declare function isFragment(ele: any): ele is InulaElement;
declare function isForwardRef(ele: any): ele is InulaElement;
declare function isLazy(ele: any): ele is LazyComponent<any>;
declare function isMemo(ele: any): ele is MemoComponent<any>;
declare function isPortal(ele: any): ele is InulaElement;
declare function isContextProvider(ele: any): ele is InulaElement;
declare function isContextConsumer(ele: any): ele is InulaElement;
declare function isValidElementType(type: any): boolean;

type StoreConfig<S extends Record<string, unknown>, A extends UserActions<S>, C extends UserComputedValues<S>> = {
  id?: string;
  state?: S;
  actions?: A;
  computed?: C;
  options?: {
    isReduxAdapter?: boolean;
  };
};
type UserActions<S extends Record<string, unknown>> = {
  [K: string]: ActionFunction<S>;
};
type ActionFunction<S extends Record<string, unknown>> = (this: StoreObj<S, any, any>, state: S, ...args: any[]) => any;
type StoreActions<S extends Record<string, unknown>, A extends UserActions<S>> = {
  [K in keyof A]: Action<A[K], S>;
};
type Action<T extends ActionFunction<any>, S extends Record<string, unknown>> = (
  this: StoreObj<S, any, any>,
  ...args: RemoveFirstFromTuple<Parameters<T>>
) => ReturnType<T>;
type StoreComputed<S extends Record<string, unknown>, C extends UserComputedValues<S>> = {
  [K in keyof C]: ReturnType<C[K]>;
};
type StoreObj<
  S extends Record<string, unknown> = Record<string, unknown>,
  A extends UserActions<S> = UserActions<S>,
  C extends UserComputedValues<S> = UserComputedValues<S>,
> = {
  $s: AddWatchProp<S>;
  $state: AddWatchProp<S>;
  $a: StoreActions<S, A>;
  $c: StoreComputed<S, C>;
  $queue: QueuedStoreActions<S, A>;
  $subscriptions: Array<Listener>;
  $subscribe: (listener: Listener) => void;
  $unsubscribe: (listener: Listener) => void;
} & {
  [K in keyof AddWatchProp<S>]: AddWatchProp<S>[K];
} & {
  [K in keyof A]: Action<A[K], S>;
} & {
  [K in keyof C]: ReturnType<C[K]>;
};
type PlannedAction<S extends Record<string, unknown>, F extends ActionFunction<S>> = {
  action: string;
  payload: any[];
  resolve: ReturnType<F>;
};
type RemoveFirstFromTuple<T extends any[]> = T['length'] extends 0
  ? []
  : ((...b: T) => void) extends (a: any, ...b: infer I) => void
    ? I
    : [];
type UserComputedValues<S extends Record<string, unknown>> = {
  [K: string]: (state: S) => any;
};
type AsyncAction<T extends ActionFunction<any>, S extends Record<string, unknown>> = (
  this: StoreObj<S, any, any>,
  ...args: RemoveFirstFromTuple<Parameters<T>>
) => Promise<ReturnType<T>>;
type QueuedStoreActions<S extends Record<string, unknown>, A extends UserActions<S>> = {
  [K in keyof A]: AsyncAction<A[K], S>;
};
type ComputedValues<S extends Record<string, unknown>, C extends UserComputedValues<S>> = {
  [K in keyof C]: ReturnType<C[K]>;
};

declare function createStore$1<
  S extends Record<string, any>,
  A extends UserActions<S>,
  C extends UserComputedValues<S>,
>(config: StoreConfig<S, A, C>): () => StoreObj<S, A, C>;
declare function useStore$1<
  S extends Record<string, unknown>,
  A extends UserActions<S>,
  C extends UserComputedValues<S>,
>(id: string): StoreObj<S, A, C>;
declare function clearStore(id: string): void;

declare function ref<T = any>(): RefType<T | undefined>;
declare function ref<T>(value: T): RefType<UnwrapRef<T>>;
declare function useReference<T = any>(): RefType<T | undefined>;
declare function useReference<T>(value: T): RefType<UnwrapRef<T>>;
declare function isRef<T>(ref: MaybeRef<T>): ref is RefType<T>;
declare function unref<T>(ref: MaybeRef<T>): T;
declare const ShallowRefMarker: unique symbol;
type ShallowRef<T = any> = RefType<T> & {
  [ShallowRefMarker]?: true;
};
declare function shallowRef<T>(
  value: T
): RefType extends T ? (T extends RefType ? IfAny<T, ShallowRef<T>, T> : ShallowRef<T>) : ShallowRef<T>;
declare function shallowRef<T = any>(): ShallowRef<T | undefined>;
declare function toRef<T>(
  value: T
): T extends () => infer R ? Readonly<RefType<R>> : T extends RefType ? T : RefType<UnwrapRef<T>>;
declare function toRef<T extends Record<string, any>, K extends keyof T>(object: T, key: K): ToRef<T[K]>;
declare function toRef<T extends Record<string, any>, K extends keyof T>(
  object: T,
  key: K,
  defaultValue: T[K]
): ToRef<Exclude<T[K], undefined>>;
declare function toRefs<T extends Record<string, any>>(object: T): ToRefs<T>;

interface RefType<T = any> {
  value: T;
}
type MaybeRef<T = any> = T | RefType<T>;
type UnwrapRef<T> = T extends ShallowRef<infer V> ? V : T extends RefType<infer V> ? ReactiveRet<V> : ReactiveRet<T>;
type BaseTypes = string | number | boolean;
type ReactiveRet<T> = T extends FnType | BaseTypes | RefType
  ? T
  : T extends Map<infer K, infer V>
    ? Map<K, ReactiveRet<V>> & UnwrapRef<Omit<T, keyof Map<any, any>>>
    : T extends WeakMap<infer K, infer V>
      ? WeakMap<K, ReactiveRet<V>> & UnwrapRef<Omit<T, keyof WeakMap<any, any>>>
      : T extends Set<infer V>
        ? Set<ReactiveRet<V>> & UnwrapRef<Omit<T, keyof Set<any>>>
        : T extends WeakSet<infer V>
          ? WeakSet<ReactiveRet<V>> & UnwrapRef<Omit<T, keyof WeakSet<any>>>
          : T extends ReadonlyArray<any>
            ? {
                [K in keyof T]: ReactiveRet<T[K]>;
              }
            : T extends ObjectType
              ? {
                  [P in keyof T]: P extends symbol ? T[P] : UnwrapRef<T[P]>;
                }
              : T;
type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
type ToRef<T> = IfAny<T, RefType<T>, [T] extends [RefType] ? T : RefType<T>>;
type ToRefs<T = any> = {
  [K in keyof T]: ToRef<T[K]>;
};
declare const RawSymbol: unique symbol;
type Raw<T> = T & {
  [RawSymbol]?: true;
};

declare function reactive<T extends ObjectType>(rawObj: T): ReactiveRet<T>;
declare function useReactive<T extends ObjectType>(rawObj: T): ReactiveRet<T>;
declare function shallowReactive<T extends ObjectType>(rawObj: T): ReactiveRet<T>;
declare function useShallowReactive<T extends ObjectType>(rawObj: T): ReactiveRet<T>;
declare function toRaw<T>(observed: T): T;
declare function markRaw<T extends object>(value: T): Raw<T>;

declare const thunk: ReduxMiddleware;

type Callback = () => void;
interface Subscription {
  stateChange?: () => any;
  addNestedSub(listener: Callback): Callback;
  triggerNestedSubs(): void;
  trySubscribe(): void;
  tryUnsubscribe(): void;
}

declare const DefaultContext: Context$1<{
  store: ReduxStoreHandler;
  subscription: Subscription;
}>;
type Context = typeof DefaultContext;
type Selector = (state: unknown) => unknown;
type WrapperInnerProps = {
  reduxAdapterRef?: ForwardRef<any>;
};
declare function Provider({
  store,
  context,
  children,
}: {
  store: ReduxStoreHandler;
  context?: Context;
  children?: any[];
}): {
  [x: string]: any;
  vtype: number;
  src: any;
  type: any;
  key: any;
  ref: any;
  props: any;
};
declare function createSelectorHook(context: Context): (selector?: Selector) => any;
declare function createDispatchHook(context: Context): () => BoundActionCreator;
declare const useSelector: (selector?: Selector) => any;
declare const useDispatch: () => BoundActionCreator;
declare const useStore: () => ReduxStoreHandler;
type MapStateToPropsP<StateProps, OwnProps> = (state: any, ownProps: OwnProps) => StateProps;
type MapDispatchToPropsP<DispatchProps, OwnProps> =
  | {
      [key: string]: (...args: any[]) => ReduxAction;
    }
  | ((dispatch: (action: ReduxAction) => any, ownProps: OwnProps) => DispatchProps);
type MergePropsP<StateProps, DispatchProps, OwnProps, MergedProps> = (
  stateProps: StateProps,
  dispatchProps: DispatchProps,
  ownProps: OwnProps
) => MergedProps;
type WrappedComponent<OwnProps> = (props: OwnProps & WrapperInnerProps) => ReturnType<typeof createElement>;
type OriginalComponent<MergedProps> = (props: MergedProps) => ReturnType<typeof createElement>;
type Connector<OwnProps, MergedProps> = (Component: OriginalComponent<MergedProps>) => WrappedComponent<OwnProps>;
type ConnectOption<State, StateProps, OwnProps> = {
  /** @deprecated */
  prue?: boolean;
  forwardRef?: boolean;
  context?: Context;
  areOwnPropsEqual?: (newOwnProps: OwnProps, oldOwnProps: OwnProps) => any;
  areStatePropsEqual?: (newStateProps: StateProps, oldStateProps: StateProps) => any;
  areStatesEqual?: (newState: State, oldState: State) => boolean;
};
declare function connect<StateProps, DispatchProps, OwnProps, MergedProps>(
  mapStateToProps?: MapStateToPropsP<StateProps, OwnProps>,
  mapDispatchToProps?: MapDispatchToPropsP<DispatchProps, OwnProps>,
  mergeProps?: MergePropsP<StateProps, DispatchProps, OwnProps, MergedProps>,
  options?: ConnectOption<any, StateProps, OwnProps>
): Connector<OwnProps, MergedProps>;

type ReduxStoreHandler = {
  reducer(
    state: any,
    action: {
      type: string;
    }
  ): any;
  dispatch(action: { type: string }): void;
  getState(): any;
  subscribe(listener: () => void): () => void;
  replaceReducer(
    reducer: (
      state: any,
      action: {
        type: string;
      }
    ) => any
  ): void;
};
type ReduxAction = {
  type: string;
  [key: string]: any;
};
type ReduxMiddleware = (
  store: ReduxStoreHandler,
  extraArgument?: any
) => (
  next: (action: ReduxAction) => any
) => (
  action:
    | ReduxAction
    | ((dispatch: (action: ReduxAction) => void, store: ReduxStoreHandler, extraArgument?: any) => any)
) => ReduxStoreHandler;
type Reducer = (state: any, action: ReduxAction) => any;
type StoreCreator = (reducer: Reducer, preloadedState?: any) => ReduxStoreHandler;
type StoreEnhancer = (next: StoreCreator) => StoreCreator;
declare function createStore(reducer: Reducer, preloadedState?: any, enhancers?: StoreEnhancer): ReduxStoreHandler;
declare function combineReducers(reducers: { [key: string]: Reducer }): Reducer;
declare function applyMiddleware(...middlewares: ReduxMiddleware[]): (createStore: StoreCreator) => StoreCreator;
type ActionCreator = (...params: any[]) => ReduxAction;
type ActionCreators = {
  [key: string]: ActionCreator;
};
type BoundActionCreator = (...params: any[]) => void;
type BoundActionCreators = {
  [key: string]: BoundActionCreator;
};
type Dispatch = (action: ReduxAction) => any;
declare function bindActionCreators(actionCreators: ActionCreators, dispatch: Dispatch): BoundActionCreators;
declare function compose<T = StoreCreator>(...middlewares: ((...args: any[]) => any)[]): (...args: any[]) => T;
declare function batch(fn: () => void): void;

type reduxAdapter_ReduxStoreHandler = ReduxStoreHandler;
type reduxAdapter_ReduxAction = ReduxAction;
type reduxAdapter_ReduxMiddleware = ReduxMiddleware;
declare const reduxAdapter_createStore: typeof createStore;
declare const reduxAdapter_combineReducers: typeof combineReducers;
declare const reduxAdapter_applyMiddleware: typeof applyMiddleware;
type reduxAdapter_BoundActionCreator = BoundActionCreator;
type reduxAdapter_Dispatch = Dispatch;
declare const reduxAdapter_bindActionCreators: typeof bindActionCreators;
declare const reduxAdapter_compose: typeof compose;
declare const reduxAdapter_batch: typeof batch;
declare const reduxAdapter_thunk: typeof thunk;
declare const reduxAdapter_Provider: typeof Provider;
declare const reduxAdapter_useSelector: typeof useSelector;
declare const reduxAdapter_useStore: typeof useStore;
declare const reduxAdapter_useDispatch: typeof useDispatch;
declare const reduxAdapter_connect: typeof connect;
declare const reduxAdapter_createSelectorHook: typeof createSelectorHook;
declare const reduxAdapter_createDispatchHook: typeof createDispatchHook;
declare namespace reduxAdapter {
  export {
    type reduxAdapter_ReduxStoreHandler as ReduxStoreHandler,
    type reduxAdapter_ReduxAction as ReduxAction,
    type reduxAdapter_ReduxMiddleware as ReduxMiddleware,
    reduxAdapter_createStore as createStore,
    reduxAdapter_combineReducers as combineReducers,
    reduxAdapter_applyMiddleware as applyMiddleware,
    type reduxAdapter_BoundActionCreator as BoundActionCreator,
    type reduxAdapter_Dispatch as Dispatch,
    reduxAdapter_bindActionCreators as bindActionCreators,
    reduxAdapter_compose as compose,
    reduxAdapter_batch as batch,
    reduxAdapter_thunk as thunk,
    reduxAdapter_Provider as Provider,
    reduxAdapter_useSelector as useSelector,
    reduxAdapter_useStore as useStore,
    reduxAdapter_useDispatch as useDispatch,
    reduxAdapter_connect as connect,
    reduxAdapter_createSelectorHook as createSelectorHook,
    reduxAdapter_createDispatchHook as createDispatchHook,
  };
}

type WatchSource<T = any> = RefType<T> | ProxyHandler<T> | ComputedImpl<T> | (() => T);
interface WatchOptions {
  deep?: boolean;
  immediate?: boolean;
}
declare function watch(source: WatchSource | WatchSource[], fn: WatchCallback, { deep, immediate }?: WatchOptions): any;
declare function watchEffect(fn: () => void): any;
declare function useWatch(source: WatchSource | WatchSource[], fn: WatchCallback, options?: WatchOptions): any;

interface Thenable {
  then(resolve: (val?: any) => void, reject: (err: any) => void): void;
}
declare function act(fun: () => void | Thenable): Thenable;

/**
 * 即依赖flushPromise，也要依赖Horizon渲染机制中的异步机制runAsync，才能做到等待DOM渲染
 * @param this - 执行上下文
 * @param fn - 可选的回调函数
 * @returns Promise - 返回一个 Promise，当回调函行完成时 resolve
 */
declare function nextTick<T = void, R = void>(this: T, fn?: (this: T) => R): Promise<R>;

declare function asyncUpdates<P, R>(fn: (a: P) => R, a: P): R;
declare function asyncUpdates<R>(fn: () => R): R;
declare function syncUpdates<P, R>(fn: (a: P) => R, a: P): R;
declare function syncUpdates<R>(fn: () => R): R;

declare function createPortal(
  children: InulaNode,
  realNode: Element | DocumentFragment,
  key?: null | string
): InulaPortal;

type Container =
  | (Element & {
      _treeRoot?: VNode | null;
    })
  | (Document & {
      _treeRoot?: VNode | null;
    });

declare function executeRender(children: any, container: Container, callback?: Callback$1): Element | Text;
declare function findDOMNode(domOrEle?: Element): null | Element | Text;
declare function destroy(container: Element | DocumentFragment | Document): boolean;
interface RootElement {
  render(component: InulaNode): void;
  unmount(): void;
}
declare function createRootElement(container: Container, option?: Record<string, any>): RootElement;

declare function isShallow(value: unknown): boolean;
declare function isReactive(value: unknown): boolean;
declare function isReadonly(value: unknown): boolean;

declare function toInstance(vNode: VNode): any;

declare const vueReactive: {
  ref: typeof ref;
  useReference: typeof useReference;
  isRef: typeof isRef;
  unref: typeof unref;
  shallowRef: typeof shallowRef;
  toRef: typeof toRef;
  toRefs: typeof toRefs;
  reactive: typeof reactive;
  useReactive: typeof useReactive;
  shallowReactive: typeof shallowReactive;
  useShallowReactive: typeof useShallowReactive;
  markRaw: typeof markRaw;
  isReactive: typeof isReactive;
  isShallow: typeof isShallow;
  isReadonly: typeof isReadonly;
  computed: typeof computed;
  useComputed: typeof useComputed;
  watchEffect: typeof watchEffect;
  watch: typeof watch;
  useWatch: typeof useWatch;
  toRaw: typeof toRaw;
  nextTick: typeof nextTick;
  useInstance: typeof useInstance;
  toInstance: typeof toInstance;
};
declare const Horizon: {
  Children: ChildrenType;
  createRef: typeof createRef;
  Component: typeof Component;
  PureComponent: typeof PureComponent;
  createContext: typeof createContext;
  forwardRef: typeof forwardRef;
  lazy: typeof lazy;
  memo: typeof memo;
  useDebugValue: () => void;
  useCallback: typeof useCallback;
  useContext: typeof useContext;
  useEffect: typeof useEffect;
  useImperativeHandle: typeof useImperativeHandle;
  useLayoutEffect: typeof useLayoutEffect;
  useMemo: typeof useMemo;
  useReducer: typeof useReducer;
  useRef: typeof useRef;
  useState: typeof useState;
  createElement: typeof createElement;
  cloneElement: typeof cloneElement;
  isValidElement: typeof isValidElement;
  render: typeof executeRender;
  createRoot: typeof createRootElement;
  createPortal: typeof createPortal;
  unstable_batchedUpdates: typeof asyncUpdates;
  findDOMNode: typeof findDOMNode;
  unmountComponentAtNode: typeof destroy;
  act: typeof act;
  flushSync: typeof syncUpdates;
  createStore: typeof createStore$1;
  useStore: typeof useStore$1;
  clearStore: typeof clearStore;
  reduxAdapter: typeof reduxAdapter;
  watch: typeof watch;
  isFragment: typeof isFragment;
  isElement: typeof isElement;
  isValidElementType: typeof isValidElementType;
  isForwardRef: typeof isForwardRef;
  isLazy: typeof isLazy;
  isMemo: typeof isMemo;
  isPortal: typeof isPortal;
  isContextProvider: typeof isContextProvider;
  isContextConsumer: typeof isContextConsumer;
  ForwardRef: number;
  Memo: number;
  Fragment: Fragment;
  Profiler: InulaProfiler;
  StrictMode: StrictMode;
  Suspense: Suspense;
  vueReactive: {
    ref: typeof ref;
    useReference: typeof useReference;
    isRef: typeof isRef;
    unref: typeof unref;
    shallowRef: typeof shallowRef;
    toRef: typeof toRef;
    toRefs: typeof toRefs;
    reactive: typeof reactive;
    useReactive: typeof useReactive;
    shallowReactive: typeof shallowReactive;
    useShallowReactive: typeof useShallowReactive;
    markRaw: typeof markRaw;
    isReactive: typeof isReactive;
    isShallow: typeof isShallow;
    isReadonly: typeof isReadonly;
    computed: typeof computed;
    useComputed: typeof useComputed;
    watchEffect: typeof watchEffect;
    watch: typeof watch;
    useWatch: typeof useWatch;
    toRaw: typeof toRaw;
    nextTick: typeof nextTick;
    useInstance: typeof useInstance;
    toInstance: typeof toInstance;
  };
};

export {
  type ActionFunction,
  type AddWatchProp,
  type AnimationEvent$1 as AnimationEvent,
  type AnimationEventHandler,
  type AsyncAction,
  type BasicStateAction,
  type CSSProperties,
  type ChangeEvent,
  type ChangeEventHandler,
  Children,
  type ChildrenType,
  type ClipboardEvent$1 as ClipboardEvent,
  type ClipboardEventHandler,
  type CollectionStringTypes,
  type CollectionTypes,
  Component,
  type ComponentClass,
  type ComponentLifecycle,
  type ComponentPropsWithRef,
  type ComponentState,
  type ComponentType,
  type CompositionEvent$1 as CompositionEvent,
  type CompositionEventHandler,
  ComputedImpl,
  type ComputedValues,
  type Context$1 as Context,
  type CurrentListener,
  type DependencyList,
  type Dispatch$1 as Dispatch,
  type DispatchVoid,
  type DragEvent$1 as DragEvent,
  type DragEventHandler,
  type EffectCallBack,
  type EventHandler,
  type ExoticComponent,
  type FC,
  type FnType,
  type FocusEvent$1 as FocusEvent,
  type FocusEventHandler,
  type FormEvent,
  type FormEventHandler,
  TYPE_FORWARD_REF as ForwardRef,
  type ForwardRefRenderFunc,
  TYPE_FRAGMENT as Fragment,
  type FunctionComponent,
  type IObserver,
  type IfAny,
  type Instance,
  type InulaElement,
  type InulaFragment,
  type InulaNode,
  type InulaPortal,
  type InulaProfiler,
  type InvalidEvent,
  type IterableTypes,
  type JSXElementConstructor,
  type KVObject,
  type Key,
  type KeyType,
  type KeyboardEvent$1 as KeyboardEvent,
  type KeyboardEventHandler,
  type LazyComponent,
  type Listener,
  type Listeners,
  type MapTypes,
  type MaybeRef,
  TYPE_MEMO as Memo,
  type MemoComponent,
  type ModifierKey,
  type MouseEvent$1 as MouseEvent,
  type MouseEventHandler,
  type Mutation,
  type ObjectType,
  type PlannedAction,
  type PointerEvent$1 as PointerEvent,
  type PointerEventHandler,
  TYPE_PROFILER as Profiler,
  type PropsOmitRef,
  type PropsWithRef,
  PureComponent,
  type QueuedStoreActions,
  type Raw,
  RawSymbol,
  type ReactiveRet,
  type Reducer$1 as Reducer,
  type ReducerAction,
  type ReducerState,
  type ReducerStateVoid,
  type ReducerVoid,
  type Ref,
  type RefAttributes,
  type RefType,
  type SetTypes,
  type StoreActions,
  type StoreComputed,
  type StoreConfig,
  type StoreObj,
  TYPE_STRICT_MODE as StrictMode,
  TYPE_SUSPENSE as Suspense,
  type ToRef,
  type ToRefs,
  type TouchEvent$1 as TouchEvent,
  type TouchEventHandler,
  type TransitionEvent$1 as TransitionEvent,
  type TransitionEventHandler,
  type UIEvent$1 as UIEvent,
  type UIEventHandler,
  type UnwrapRef,
  type UserActions,
  type UserComputedValues,
  VNode,
  type WatchCallback,
  type WatchFn,
  type WatchHandler,
  type WheelEvent$1 as WheelEvent,
  type WheelEventHandler,
  act,
  clearStore,
  cloneElement,
  createContext,
  createElement,
  createPortal,
  createRef,
  createRootElement as createRoot,
  createStore$1 as createStore,
  Horizon as default,
  findDOMNode,
  syncUpdates as flushSync,
  forwardRef,
  isContextConsumer,
  isContextProvider,
  isElement,
  isForwardRef,
  isFragment,
  isLazy,
  isMemo,
  isPortal,
  isValidElement,
  isValidElementType,
  lazy,
  memo,
  reduxAdapter,
  executeRender as render,
  destroy as unmountComponentAtNode,
  asyncUpdates as unstable_batchedUpdates,
  useCallback,
  useContext,
  useDebugValue,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useStore$1 as useStore,
  vueReactive,
  watch,
};
