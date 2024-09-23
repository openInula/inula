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
//import Element = JSX.Element;

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

export interface ProviderProps<T> {
  value: T;
  children?: InulaNode | undefined;
}

export interface ConsumerProps<T> {
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

export type ComponentPropsWithRef<T> = T extends new (props: infer P) => Component<any, any>
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

interface ClassAttributes<T> extends Attributes {
  ref: Ref<T>;
  key: Key | undefined;
  jsx: boolean | undefined;
}
//让其他代码在值发生变化时得到通知
interface SignalLike<T> {
  value: T;
  peek(): T;
  subscribe(fn: (value: T) => void): () => void;
}
export type Signalish<T> = T | SignalLike<T>;
export interface DOMAttributes<Target extends EventTarget> {
  // Image Events
  onLoad?: GenericEventHandler<Target> | undefined;
  onLoadCapture?: GenericEventHandler<Target> | undefined;
  onError?: GenericEventHandler<Target> | undefined;
  onErrorCapture?: GenericEventHandler<Target> | undefined;

  // Clipboard Events
  onCopy?: ClipboardEventHandler<Target> | undefined;
  onCopyCapture?: ClipboardEventHandler<Target> | undefined;
  onCut?: ClipboardEventHandler<Target> | undefined;
  onCutCapture?: ClipboardEventHandler<Target> | undefined;
  onPaste?: ClipboardEventHandler<Target> | undefined;
  onPasteCapture?: ClipboardEventHandler<Target> | undefined;
  // Composition Events
  onCompositionEnd?: CompositionEventHandler<Target> | undefined;
  onCompositionEndCapture?: CompositionEventHandler<Target> | undefined;
  onCompositionStart?: CompositionEventHandler<Target> | undefined;
  onCompositionStartCapture?: CompositionEventHandler<Target> | undefined;
  onCompositionUpdate?: CompositionEventHandler<Target> | undefined;
  onCompositionUpdateCapture?: CompositionEventHandler<Target> | undefined;

  // Details Events
  onToggle?: GenericEventHandler<Target> | undefined;

  // Dialog Events
  onClose?: GenericEventHandler<Target> | undefined;
  onCancel?: GenericEventHandler<Target> | undefined;

  // Focus Events
  onFocus?: FocusEventHandler<Target> | undefined;
  onFocusCapture?: FocusEventHandler<Target> | undefined;
  onFocusIn?: FocusEventHandler<Target> | undefined;
  onFocusInCapture?: FocusEventHandler<Target> | undefined;
  onFocusOut?: FocusEventHandler<Target> | undefined;
  onFocusOutCapture?: FocusEventHandler<Target> | undefined;
  onBlur?: FocusEventHandler<Target> | undefined;
  onBlurCapture?: FocusEventHandler<Target> | undefined;

  // Form Events
  onChange?: GenericEventHandler<Target> | undefined;
  onChangeCapture?: GenericEventHandler<Target> | undefined;
  onInput?: FormEventHandler<Target> | undefined;
  onInputCapture?: FormEventHandler<Target> | undefined;
  onBeforeInput?: FormEventHandler<Target> | undefined;
  onBeforeInputCapture?: FormEventHandler<Target> | undefined;
  onSearch?: GenericEventHandler<Target> | undefined;
  onSearchCapture?: GenericEventHandler<Target> | undefined;
  onSubmit?: FormEventHandler<Target> | undefined;
  onSubmitCapture?: FormEventHandler<Target> | undefined;
  onInvalid?: GenericEventHandler<Target> | undefined;
  onInvalidCapture?: GenericEventHandler<Target> | undefined;
  onReset?: GenericEventHandler<Target> | undefined;
  onResetCapture?: GenericEventHandler<Target> | undefined;
  onFormData?: GenericEventHandler<Target> | undefined;
  onFormDataCapture?: GenericEventHandler<Target> | undefined;

  // Keyboard Events
  onKeyDown?: KeyboardEventHandler<Target> | undefined;
  onKeyDownCapture?: KeyboardEventHandler<Target> | undefined;
  onKeyPress?: KeyboardEventHandler<Target> | undefined;
  onKeyPressCapture?: KeyboardEventHandler<Target> | undefined;
  onKeyUp?: KeyboardEventHandler<Target> | undefined;
  onKeyUpCapture?: KeyboardEventHandler<Target> | undefined;

  // Media Events
  onAbort?: GenericEventHandler<Target> | undefined;
  onAbortCapture?: GenericEventHandler<Target> | undefined;
  onCanPlay?: GenericEventHandler<Target> | undefined;
  onCanPlayCapture?: GenericEventHandler<Target> | undefined;
  onCanPlayThrough?: GenericEventHandler<Target> | undefined;
  onCanPlayThroughCapture?: GenericEventHandler<Target> | undefined;
  onDurationChange?: GenericEventHandler<Target> | undefined;
  onDurationChangeCapture?: GenericEventHandler<Target> | undefined;
  onEmptied?: GenericEventHandler<Target> | undefined;
  onEmptiedCapture?: GenericEventHandler<Target> | undefined;
  onEncrypted?: GenericEventHandler<Target> | undefined;
  onEncryptedCapture?: GenericEventHandler<Target> | undefined;
  onEnded?: GenericEventHandler<Target> | undefined;
  onEndedCapture?: GenericEventHandler<Target> | undefined;
  onLoadedData?: GenericEventHandler<Target> | undefined;
  onLoadedDataCapture?: GenericEventHandler<Target> | undefined;
  onLoadedMetadata?: GenericEventHandler<Target> | undefined;
  onLoadedMetadataCapture?: GenericEventHandler<Target> | undefined;
  onLoadStart?: GenericEventHandler<Target> | undefined;
  onLoadStartCapture?: GenericEventHandler<Target> | undefined;
  onPause?: GenericEventHandler<Target> | undefined;
  onPauseCapture?: GenericEventHandler<Target> | undefined;
  onPlay?: GenericEventHandler<Target> | undefined;
  onPlayCapture?: GenericEventHandler<Target> | undefined;
  onPlaying?: GenericEventHandler<Target> | undefined;
  onPlayingCapture?: GenericEventHandler<Target> | undefined;
  onProgress?: GenericEventHandler<Target> | undefined;
  onProgressCapture?: GenericEventHandler<Target> | undefined;
  onRateChange?: GenericEventHandler<Target> | undefined;
  onRateChangeCapture?: GenericEventHandler<Target> | undefined;
  onSeeked?: GenericEventHandler<Target> | undefined;
  onSeekedCapture?: GenericEventHandler<Target> | undefined;
  onSeeking?: GenericEventHandler<Target> | undefined;
  onSeekingCapture?: GenericEventHandler<Target> | undefined;
  onStalled?: GenericEventHandler<Target> | undefined;
  onStalledCapture?: GenericEventHandler<Target> | undefined;
  onSuspend?: GenericEventHandler<Target> | undefined;
  onSuspendCapture?: GenericEventHandler<Target> | undefined;
  onTimeUpdate?: GenericEventHandler<Target> | undefined;
  onTimeUpdateCapture?: GenericEventHandler<Target> | undefined;
  onVolumeChange?: GenericEventHandler<Target> | undefined;
  onVolumeChangeCapture?: GenericEventHandler<Target> | undefined;
  onWaiting?: GenericEventHandler<Target> | undefined;
  onWaitingCapture?: GenericEventHandler<Target> | undefined;

  // MouseEvents
  onClick?: MouseEventHandler<Target> | undefined;
  onClickCapture?: MouseEventHandler<Target> | undefined;
  onContextMenu?: MouseEventHandler<Target> | undefined;
  onContextMenuCapture?: MouseEventHandler<Target> | undefined;
  onDblClick?: MouseEventHandler<Target> | undefined;
  onDblClickCapture?: MouseEventHandler<Target> | undefined;
  onDrag?: DragEventHandler<Target> | undefined;
  onDragCapture?: DragEventHandler<Target> | undefined;
  onDragEnd?: DragEventHandler<Target> | undefined;
  onDragEndCapture?: DragEventHandler<Target> | undefined;
  onDragEnter?: DragEventHandler<Target> | undefined;
  onDragEnterCapture?: DragEventHandler<Target> | undefined;
  onDragExit?: DragEventHandler<Target> | undefined;
  onDragExitCapture?: DragEventHandler<Target> | undefined;
  onDragLeave?: DragEventHandler<Target> | undefined;
  onDragLeaveCapture?: DragEventHandler<Target> | undefined;
  onDragOver?: DragEventHandler<Target> | undefined;
  onDragOverCapture?: DragEventHandler<Target> | undefined;
  onDragStart?: DragEventHandler<Target> | undefined;
  onDragStartCapture?: DragEventHandler<Target> | undefined;
  onDrop?: DragEventHandler<Target> | undefined;
  onDropCapture?: DragEventHandler<Target> | undefined;
  onMouseDown?: MouseEventHandler<Target> | undefined;
  onMouseDownCapture?: MouseEventHandler<Target> | undefined;
  onMouseEnter?: MouseEventHandler<Target> | undefined;
  onMouseEnterCapture?: MouseEventHandler<Target> | undefined;
  onMouseLeave?: MouseEventHandler<Target> | undefined;
  onMouseLeaveCapture?: MouseEventHandler<Target> | undefined;
  onMouseMove?: MouseEventHandler<Target> | undefined;
  onMouseMoveCapture?: MouseEventHandler<Target> | undefined;
  onMouseOut?: MouseEventHandler<Target> | undefined;
  onMouseOutCapture?: MouseEventHandler<Target> | undefined;
  onMouseOver?: MouseEventHandler<Target> | undefined;
  onMouseOverCapture?: MouseEventHandler<Target> | undefined;
  onMouseUp?: MouseEventHandler<Target> | undefined;
  onMouseUpCapture?: MouseEventHandler<Target> | undefined;

  // Selection Events
  onSelect?: GenericEventHandler<Target> | undefined;
  onSelectCapture?: GenericEventHandler<Target> | undefined;

  // Touch Events
  onTouchCancel?: TouchEventHandler<Target> | undefined;
  onTouchCancelCapture?: TouchEventHandler<Target> | undefined;
  onTouchEnd?: TouchEventHandler<Target> | undefined;
  onTouchEndCapture?: TouchEventHandler<Target> | undefined;
  onTouchMove?: TouchEventHandler<Target> | undefined;
  onTouchMoveCapture?: TouchEventHandler<Target> | undefined;
  onTouchStart?: TouchEventHandler<Target> | undefined;
  onTouchStartCapture?: TouchEventHandler<Target> | undefined;

  // Pointer Events
  onPointerOver?: PointerEventHandler<Target> | undefined;
  onPointerOverCapture?: PointerEventHandler<Target> | undefined;
  onPointerEnter?: PointerEventHandler<Target> | undefined;
  onPointerEnterCapture?: PointerEventHandler<Target> | undefined;
  onPointerDown?: PointerEventHandler<Target> | undefined;
  onPointerDownCapture?: PointerEventHandler<Target> | undefined;
  onPointerMove?: PointerEventHandler<Target> | undefined;
  onPointerMoveCapture?: PointerEventHandler<Target> | undefined;
  onPointerUp?: PointerEventHandler<Target> | undefined;
  onPointerUpCapture?: PointerEventHandler<Target> | undefined;
  onPointerCancel?: PointerEventHandler<Target> | undefined;
  onPointerCancelCapture?: PointerEventHandler<Target> | undefined;
  onPointerOut?: PointerEventHandler<Target> | undefined;
  onPointerOutCapture?: PointerEventHandler<Target> | undefined;
  onPointerLeave?: PointerEventHandler<Target> | undefined;
  onPointerLeaveCapture?: PointerEventHandler<Target> | undefined;
  onGotPointerCapture?: PointerEventHandler<Target> | undefined;
  onGotPointerCaptureCapture?: PointerEventHandler<Target> | undefined;
  onLostPointerCapture?: PointerEventHandler<Target> | undefined;
  onLostPointerCaptureCapture?: PointerEventHandler<Target> | undefined;

  // UI Events
  onScroll?: UIEventHandler<Target> | undefined;
  onScrollEnd?: UIEventHandler<Target> | undefined;
  onScrollCapture?: UIEventHandler<Target> | undefined;

  // Wheel Events
  onWheel?: WheelEventHandler<Target> | undefined;
  onWheelCapture?: WheelEventHandler<Target> | undefined;

  // Animation Events
  onAnimationStart?: AnimationEventHandler<Target> | undefined;
  onAnimationStartCapture?: AnimationEventHandler<Target> | undefined;
  onAnimationEnd?: AnimationEventHandler<Target> | undefined;
  onAnimationEndCapture?: AnimationEventHandler<Target> | undefined;
  onAnimationIteration?: AnimationEventHandler<Target> | undefined;
  onAnimationIterationCapture?: AnimationEventHandler<Target> | undefined;

  // Transition Events
  onTransitionCancel?: TransitionEventHandler<Target>;
  onTransitionCancelCapture?: TransitionEventHandler<Target>;
  onTransitionEnd?: TransitionEventHandler<Target>;
  onTransitionEndCapture?: TransitionEventHandler<Target>;
  onTransitionRun?: TransitionEventHandler<Target>;
  onTransitionRunCapture?: TransitionEventHandler<Target>;
  onTransitionStart?: TransitionEventHandler<Target>;
  onTransitionStartCapture?: TransitionEventHandler<Target>;

  // PictureInPicture Events
  onEnterPictureInPicture?: ChangeEventHandler<Target>;
  onEnterPictureInPictureCapture?: ChangeEventHandler<Target>;
  onLeavePictureInPicture?: ChangeEventHandler<Target>;
  onLeavePictureInPictureCapture?: ChangeEventHandler<Target>;
  onResize?: ChangeEventHandler<Target>;
  onResizeCapture?: ChangeEventHandler<Target>;
}

export interface AriaAttributes {
  /** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
  'aria-activedescendant'?: Signalish<string | undefined>;
  /** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
  'aria-atomic'?: Signalish<Booleanish | undefined>;
  /**
   * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
   * presented if they are made.
   */
  'aria-autocomplete'?: Signalish<'none' | 'inline' | 'list' | 'both' | undefined>;
  /**
   * Defines a string value that labels the current element, which is intended to be converted into Braille.
   * @see aria-label.
   */
  'aria-braillelabel'?: Signalish<string | undefined>;
  /**
   * Defines a human-readable, author-localized abbreviated description for the role of an element, which is intended to be converted into Braille.
   * @see aria-roledescription.
   */
  'aria-brailleroledescription'?: Signalish<string | undefined>;
  /** Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. */
  'aria-busy'?: Signalish<Booleanish | undefined>;
  /**
   * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
   * @see aria-pressed
   * @see aria-selected.
   */
  'aria-checked'?: Signalish<Booleanish | 'mixed' | undefined>;
  /**
   * Defines the total number of columns in a table, grid, or treegrid.
   * @see aria-colindex.
   */
  'aria-colcount'?: Signalish<number | undefined>;
  /**
   * Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.
   * @see aria-colcount
   * @see aria-colspan.
   */
  'aria-colindex'?: Signalish<number | undefined>;
  /**
   * Defines a human readable text alternative of aria-colindex.
   * @see aria-rowindextext.
   */
  'aria-colindextext'?: Signalish<string | undefined>;
  /**
   * Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.
   * @see aria-colindex
   * @see aria-rowspan.
   */
  'aria-colspan'?: Signalish<number | undefined>;
  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current element.
   * @see aria-owns.
   */
  'aria-controls'?: Signalish<string | undefined>;
  /** Indicates the element that represents the current item within a container or set of related elements. */
  'aria-current'?: Signalish<Booleanish | 'page' | 'step' | 'location' | 'date' | 'time' | undefined>;
  /**
   * Identifies the element (or elements) that describes the object.
   * @see aria-labelledby
   */
  'aria-describedby'?: Signalish<string | undefined>;
  /**
   * Defines a string value that describes or annotates the current element.
   * @see related aria-describedby.
   */
  'aria-description'?: Signalish<string | undefined>;
  /**
   * Identifies the element that provides a detailed, extended description for the object.
   * @see aria-describedby.
   */
  'aria-details'?: Signalish<string | undefined>;
  /**
   * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
   * @see aria-hidden
   * @see aria-readonly.
   */
  'aria-disabled'?: Signalish<Booleanish | undefined>;
  /**
   * Indicates what functions can be performed when a dragged object is released on the drop target.
   * @deprecated in ARIA 1.1
   */
  'aria-dropeffect'?: Signalish<'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup' | undefined>;
  /**
   * Identifies the element that provides an error message for the object.
   * @see aria-invalid
   * @see aria-describedby.
   */
  'aria-errormessage'?: Signalish<string | undefined>;
  /** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
  'aria-expanded'?: Signalish<Booleanish | undefined>;
  /**
   * Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
   * allows assistive technology to override the general default of reading in document source order.
   */
  'aria-flowto'?: Signalish<string | undefined>;
  /**
   * Indicates an element's "grabbed" state in a drag-and-drop operation.
   * @deprecated in ARIA 1.1
   */
  'aria-grabbed'?: Signalish<Booleanish | undefined>;
  /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
  'aria-haspopup'?: Signalish<Booleanish | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | undefined>;
  /**
   * Indicates whether the element is exposed to an accessibility API.
   * @see aria-disabled.
   */
  'aria-hidden'?: Signalish<Booleanish | undefined>;
  /**
   * Indicates the entered value does not conform to the format expected by the application.
   * @see aria-errormessage.
   */
  'aria-invalid'?: Signalish<Booleanish | 'grammar' | 'spelling' | undefined>;
  /** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
  'aria-keyshortcuts'?: Signalish<string | undefined>;
  /**
   * Defines a string value that labels the current element.
   * @see aria-labelledby.
   */
  'aria-label'?: Signalish<string | undefined>;
  /**
   * Identifies the element (or elements) that labels the current element.
   * @see aria-describedby.
   */
  'aria-labelledby'?: Signalish<string | undefined>;
  /** Defines the hierarchical level of an element within a structure. */
  'aria-level'?: Signalish<number | undefined>;
  /** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
  'aria-live'?: Signalish<'off' | 'assertive' | 'polite' | undefined>;
  /** Indicates whether an element is modal when displayed. */
  'aria-modal'?: Signalish<Booleanish | undefined>;
  /** Indicates whether a text box accepts multiple lines of input or only a single line. */
  'aria-multiline'?: Signalish<Booleanish | undefined>;
  /** Indicates that the user may select more than one item from the current selectable descendants. */
  'aria-multiselectable'?: Signalish<Booleanish | undefined>;
  /** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
  'aria-orientation'?: Signalish<'horizontal' | 'vertical' | undefined>;
  /**
   * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
   * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
   * @see aria-controls.
   */
  'aria-owns'?: Signalish<string | undefined>;
  /**
   * Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
   * A hint could be a sample value or a brief description of the expected format.
   */
  'aria-placeholder'?: Signalish<string | undefined>;
  /**
   * Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
   * @see aria-setsize.
   */
  'aria-posinset'?: Signalish<number | undefined>;
  /**
   * Indicates the current "pressed" state of toggle buttons.
   * @see aria-checked
   * @see aria-selected.
   */
  'aria-pressed'?: Signalish<Booleanish | 'mixed' | undefined>;
  /**
   * Indicates that the element is not editable, but is otherwise operable.
   * @see aria-disabled.
   */
  'aria-readonly'?: Signalish<Booleanish | undefined>;
  /**
   * Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.
   * @see aria-atomic.
   */
  'aria-relevant'?: Signalish<
    | 'additions'
    | 'additions removals'
    | 'additions text'
    | 'all'
    | 'removals'
    | 'removals additions'
    | 'removals text'
    | 'text'
    | 'text additions'
    | 'text removals'
    | undefined
  >;
  /** Indicates that user input is required on the element before a form may be submitted. */
  'aria-required'?: Signalish<Booleanish | undefined>;
  /** Defines a human-readable, author-localized description for the role of an element. */
  'aria-roledescription'?: Signalish<string | undefined>;
  /**
   * Defines the total number of rows in a table, grid, or treegrid.
   * @see aria-rowindex.
   */
  'aria-rowcount'?: Signalish<number | undefined>;
  /**
   * Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.
   * @see aria-rowcount
   * @see aria-rowspan.
   */
  'aria-rowindex'?: Signalish<number | undefined>;
  /**
   * Defines a human readable text alternative of aria-rowindex.
   * @see aria-colindextext.
   */
  'aria-rowindextext'?: Signalish<string | undefined>;
  /**
   * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
   * @see aria-rowindex
   * @see aria-colspan.
   */
  'aria-rowspan'?: Signalish<number | undefined>;
  /**
   * Indicates the current "selected" state of various widgets.
   * @see aria-checked
   * @see aria-pressed.
   */
  'aria-selected'?: Signalish<Booleanish | undefined>;
  /**
   * Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
   * @see aria-posinset.
   */
  'aria-setsize'?: Signalish<number | undefined>;
  /** Indicates if items in a table or grid are sorted in ascending or descending order. */
  'aria-sort'?: Signalish<'none' | 'ascending' | 'descending' | 'other' | undefined>;
  /** Defines the maximum allowed value for a range widget. */
  'aria-valuemax'?: Signalish<number | undefined>;
  /** Defines the minimum allowed value for a range widget. */
  'aria-valuemin'?: Signalish<number | undefined>;
  /**
   * Defines the current value for a range widget.
   * @see aria-valuetext.
   */
  'aria-valuenow'?: Signalish<number | undefined>;
  /** Defines the human readable text alternative of aria-valuenow for a range widget. */
  'aria-valuetext'?: Signalish<string | undefined>;
}
// All the WAI-ARIA 1.2 role attribute values from https://www.w3.org/TR/wai-aria-1.2/#role_definitions
type WAIAriaRole =
  | 'alert'
  | 'alertdialog'
  | 'application'
  | 'article'
  | 'banner'
  | 'blockquote'
  | 'button'
  | 'caption'
  | 'cell'
  | 'checkbox'
  | 'code'
  | 'columnheader'
  | 'combobox'
  | 'command'
  | 'complementary'
  | 'composite'
  | 'contentinfo'
  | 'definition'
  | 'deletion'
  | 'dialog'
  | 'directory'
  | 'document'
  | 'emphasis'
  | 'feed'
  | 'figure'
  | 'form'
  | 'generic'
  | 'grid'
  | 'gridcell'
  | 'group'
  | 'heading'
  | 'img'
  | 'input'
  | 'insertion'
  | 'landmark'
  | 'link'
  | 'list'
  | 'listbox'
  | 'listitem'
  | 'log'
  | 'main'
  | 'marquee'
  | 'math'
  | 'meter'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'menuitemcheckbox'
  | 'menuitemradio'
  | 'navigation'
  | 'none'
  | 'note'
  | 'option'
  | 'paragraph'
  | 'presentation'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'range'
  | 'region'
  | 'roletype'
  | 'row'
  | 'rowgroup'
  | 'rowheader'
  | 'scrollbar'
  | 'search'
  | 'searchbox'
  | 'section'
  | 'sectionhead'
  | 'select'
  | 'separator'
  | 'slider'
  | 'spinbutton'
  | 'status'
  | 'strong'
  | 'structure'
  | 'subscript'
  | 'superscript'
  | 'switch'
  | 'tab'
  | 'table'
  | 'tablist'
  | 'tabpanel'
  | 'term'
  | 'textbox'
  | 'time'
  | 'timer'
  | 'toolbar'
  | 'tooltip'
  | 'tree'
  | 'treegrid'
  | 'treeitem'
  | 'widget'
  | 'window'
  | 'none presentation';

// All the Digital Publishing WAI-ARIA 1.0 role attribute values from https://www.w3.org/TR/dpub-aria-1.0/#role_definitions
type DPubAriaRole =
  | 'doc-abstract'
  | 'doc-acknowledgments'
  | 'doc-afterword'
  | 'doc-appendix'
  | 'doc-backlink'
  | 'doc-biblioentry'
  | 'doc-bibliography'
  | 'doc-biblioref'
  | 'doc-chapter'
  | 'doc-colophon'
  | 'doc-conclusion'
  | 'doc-cover'
  | 'doc-credit'
  | 'doc-credits'
  | 'doc-dedication'
  | 'doc-endnote'
  | 'doc-endnotes'
  | 'doc-epigraph'
  | 'doc-epilogue'
  | 'doc-errata'
  | 'doc-example'
  | 'doc-footnote'
  | 'doc-foreword'
  | 'doc-glossary'
  | 'doc-glossref'
  | 'doc-index'
  | 'doc-introduction'
  | 'doc-noteref'
  | 'doc-notice'
  | 'doc-pagebreak'
  | 'doc-pagelist'
  | 'doc-part'
  | 'doc-preface'
  | 'doc-prologue'
  | 'doc-pullquote'
  | 'doc-qna'
  | 'doc-subtitle'
  | 'doc-tip'
  | 'doc-toc';
//用于处理HTML 属性或其他需要接受布尔值或布尔字符串的地方特别有用
type Booleanish = boolean | 'true' | 'false';
type AriaRole = WAIAriaRole | DPubAriaRole;
export interface HTMLAttributes<RefType extends EventTarget = EventTarget>
  extends ClassAttributes<RefType>,
    DOMAttributes<RefType>,
    AriaAttributes {
  // Standard HTML Attributes
  accept?: string | undefined | SignalLike<string | undefined>;
  acceptCharset?: string | undefined | SignalLike<string | undefined>;
  'accept-charset'?: HTMLAttributes['acceptCharset'];
  accessKey?: string | undefined | SignalLike<string | undefined>;
  accesskey?: HTMLAttributes['accessKey'];
  action?: string | undefined | SignalLike<string | undefined>;
  allow?: string | undefined | SignalLike<string | undefined>;
  allowFullScreen?: boolean | undefined | SignalLike<boolean | undefined>;
  allowTransparency?: boolean | undefined | SignalLike<boolean | undefined>;
  alt?: string | undefined | SignalLike<string | undefined>;
  as?: string | undefined | SignalLike<string | undefined>;
  async?: boolean | undefined | SignalLike<boolean | undefined>;
  autocomplete?: string | undefined | SignalLike<string | undefined>;
  autoComplete?: string | undefined | SignalLike<string | undefined>;
  autocorrect?: string | undefined | SignalLike<string | undefined>;
  autoCorrect?: string | undefined | SignalLike<string | undefined>;
  autofocus?: boolean | undefined | SignalLike<boolean | undefined>;
  autoFocus?: boolean | undefined | SignalLike<boolean | undefined>;
  autoPlay?: boolean | undefined | SignalLike<boolean | undefined>;
  autoplay?: boolean | undefined | SignalLike<boolean | undefined>;
  capture?: boolean | string | undefined | SignalLike<string | undefined>;
  cellPadding?: number | string | undefined | SignalLike<string | undefined>;
  cellSpacing?: number | string | undefined | SignalLike<string | undefined>;
  charSet?: string | undefined | SignalLike<string | undefined>;
  charset?: string | undefined | SignalLike<string | undefined>;
  challenge?: string | undefined | SignalLike<string | undefined>;
  checked?: boolean | undefined | SignalLike<boolean | undefined>;
  cite?: string | undefined | SignalLike<string | undefined>;
  class?: string | undefined | SignalLike<string | undefined>;
  className?: string | undefined | SignalLike<string | undefined>;
  cols?: number | undefined | SignalLike<number | undefined>;
  colSpan?: number | undefined | SignalLike<number | undefined>;
  colspan?: number | undefined | SignalLike<number | undefined>;
  content?: string | undefined | SignalLike<string | undefined>;
  contentEditable?:
    | Booleanish
    | ''
    | 'plaintext-only'
    | 'inherit'
    | undefined
    | SignalLike<Booleanish | '' | 'inherit' | 'plaintext-only' | undefined>;
  contenteditable?: HTMLAttributes['contentEditable'];
  /** @deprecated See https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contextmenu */
  contextMenu?: string | undefined | SignalLike<string | undefined>;
  /** @deprecated See https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contextmenu */
  contextmenu?: string | undefined | SignalLike<string | undefined>;
  controls?: boolean | undefined | SignalLike<boolean | undefined>;
  controlsList?: string | undefined | SignalLike<string | undefined>;
  coords?: string | undefined | SignalLike<string | undefined>;
  crossOrigin?: string | undefined | SignalLike<string | undefined>;
  crossorigin?: string | undefined | SignalLike<string | undefined>;
  data?: string | undefined | SignalLike<string | undefined>;
  dateTime?: string | undefined | SignalLike<string | undefined>;
  datetime?: string | undefined | SignalLike<string | undefined>;
  default?: boolean | undefined | SignalLike<boolean | undefined>;
  defaultChecked?: boolean | undefined | SignalLike<boolean | undefined>;
  defaultValue?: string | undefined | SignalLike<string | undefined>;
  defer?: boolean | undefined | SignalLike<boolean | undefined>;
  dir?: 'auto' | 'rtl' | 'ltr' | undefined | SignalLike<'auto' | 'rtl' | 'ltr' | undefined>;
  disabled?: boolean | undefined | SignalLike<boolean | undefined>;
  disableRemotePlayback?: boolean | undefined | SignalLike<boolean | undefined>;
  download?: any | undefined;
  decoding?: 'sync' | 'async' | 'auto' | undefined | SignalLike<'sync' | 'async' | 'auto' | undefined>;
  draggable?: boolean | undefined | SignalLike<boolean | undefined>;
  encType?: string | undefined | SignalLike<string | undefined>;
  enctype?: string | undefined | SignalLike<string | undefined>;
  enterkeyhint?:
    | 'enter'
    | 'done'
    | 'go'
    | 'next'
    | 'previous'
    | 'search'
    | 'send'
    | undefined
    | SignalLike<'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send' | undefined>;
  elementTiming?: string | undefined | SignalLike<string | undefined>;
  elementtiming?: HTMLAttributes['elementTiming'];
  exportparts?: string | undefined | SignalLike<string | undefined>;
  for?: string | undefined | SignalLike<string | undefined>;
  form?: string | undefined | SignalLike<string | undefined>;
  formAction?: string | undefined | SignalLike<string | undefined>;
  formaction?: string | undefined | SignalLike<string | undefined>;
  formEncType?: string | undefined | SignalLike<string | undefined>;
  formenctype?: string | undefined | SignalLike<string | undefined>;
  formMethod?: string | undefined | SignalLike<string | undefined>;
  formmethod?: string | undefined | SignalLike<string | undefined>;
  formNoValidate?: boolean | undefined | SignalLike<boolean | undefined>;
  formnovalidate?: boolean | undefined | SignalLike<boolean | undefined>;
  formTarget?: string | undefined | SignalLike<string | undefined>;
  formtarget?: string | undefined | SignalLike<string | undefined>;
  frameBorder?: number | string | undefined | SignalLike<number | string | undefined>;
  frameborder?: number | string | undefined | SignalLike<number | string | undefined>;
  headers?: string | undefined | SignalLike<string | undefined>;
  height?: number | string | undefined | SignalLike<number | string | undefined>;
  hidden?: boolean | 'hidden' | 'until-found' | undefined | SignalLike<boolean | 'hidden' | 'until-found' | undefined>;
  high?: number | undefined | SignalLike<number | undefined>;
  href?: string | undefined | SignalLike<string | undefined>;
  hrefLang?: string | undefined | SignalLike<string | undefined>;
  hreflang?: string | undefined | SignalLike<string | undefined>;
  htmlFor?: string | undefined | SignalLike<string | undefined>;
  httpEquiv?: string | undefined | SignalLike<string | undefined>;
  'http-equiv'?: string | undefined | SignalLike<string | undefined>;
  icon?: string | undefined | SignalLike<string | undefined>;
  id?: string | undefined | SignalLike<string | undefined>;
  indeterminate?: boolean | undefined | SignalLike<boolean | undefined>;
  inert?: boolean | undefined | SignalLike<boolean | undefined>;
  inputMode?: string | undefined | SignalLike<string | undefined>;
  inputmode?: string | undefined | SignalLike<string | undefined>;
  integrity?: string | undefined | SignalLike<string | undefined>;
  is?: string | undefined | SignalLike<string | undefined>;
  keyParams?: string | undefined | SignalLike<string | undefined>;
  keyType?: string | undefined | SignalLike<string | undefined>;
  kind?: string | undefined | SignalLike<string | undefined>;
  label?: string | undefined | SignalLike<string | undefined>;
  lang?: string | undefined | SignalLike<string | undefined>;
  list?: string | undefined | SignalLike<string | undefined>;
  loading?: 'eager' | 'lazy' | undefined | SignalLike<'eager' | 'lazy' | undefined>;
  loop?: boolean | undefined | SignalLike<boolean | undefined>;
  low?: number | undefined | SignalLike<number | undefined>;
  manifest?: string | undefined | SignalLike<string | undefined>;
  marginHeight?: number | undefined | SignalLike<number | undefined>;
  marginWidth?: number | undefined | SignalLike<number | undefined>;
  max?: number | string | undefined | SignalLike<string | undefined>;
  maxLength?: number | undefined | SignalLike<number | undefined>;
  maxlength?: number | undefined | SignalLike<number | undefined>;
  media?: string | undefined | SignalLike<string | undefined>;
  mediaGroup?: string | undefined | SignalLike<string | undefined>;
  method?: string | undefined | SignalLike<string | undefined>;
  min?: number | string | undefined | SignalLike<string | undefined>;
  minLength?: number | undefined | SignalLike<number | undefined>;
  minlength?: number | undefined | SignalLike<number | undefined>;
  multiple?: boolean | undefined | SignalLike<boolean | undefined>;
  muted?: boolean | undefined | SignalLike<boolean | undefined>;
  name?: string | undefined | SignalLike<string | undefined>;
  nomodule?: boolean | undefined | SignalLike<boolean | undefined>;
  nonce?: string | undefined | SignalLike<string | undefined>;
  noValidate?: boolean | undefined | SignalLike<boolean | undefined>;
  novalidate?: boolean | undefined | SignalLike<boolean | undefined>;
  open?: boolean | undefined | SignalLike<boolean | undefined>;
  optimum?: number | undefined | SignalLike<number | undefined>;
  part?: string | undefined | SignalLike<string | undefined>;
  pattern?: string | undefined | SignalLike<string | undefined>;
  ping?: string | undefined | SignalLike<string | undefined>;
  placeholder?: string | undefined | SignalLike<string | undefined>;
  playsInline?: boolean | undefined | SignalLike<boolean | undefined>;
  playsinline?: boolean | undefined | SignalLike<boolean | undefined>;
  popover?:
    | 'auto'
    | 'hint'
    | 'manual'
    | boolean
    | undefined
    | SignalLike<'auto' | 'hint' | 'manual' | boolean | undefined>;
  popovertarget?: string | undefined | SignalLike<string | undefined>;
  popoverTarget?: string | undefined | SignalLike<string | undefined>;
  popovertargetaction?: 'hide' | 'show' | 'toggle' | undefined | SignalLike<'hide' | 'show' | 'toggle' | undefined>;
  popoverTargetAction?: 'hide' | 'show' | 'toggle' | undefined | SignalLike<'hide' | 'show' | 'toggle' | undefined>;
  poster?: string | undefined | SignalLike<string | undefined>;
  preload?: string | undefined | SignalLike<string | undefined>;
  radioGroup?: string | undefined | SignalLike<string | undefined>;
  readonly?: boolean | undefined | SignalLike<boolean | undefined>;
  readOnly?: boolean | undefined | SignalLike<boolean | undefined>;
  referrerpolicy?:
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url'
    | undefined
    | SignalLike<
        | 'no-referrer'
        | 'no-referrer-when-downgrade'
        | 'origin'
        | 'origin-when-cross-origin'
        | 'same-origin'
        | 'strict-origin'
        | 'strict-origin-when-cross-origin'
        | 'unsafe-url'
        | undefined
      >;
  rel?: string | undefined | SignalLike<string | undefined>;
  required?: boolean | undefined | SignalLike<boolean | undefined>;
  reversed?: boolean | undefined | SignalLike<boolean | undefined>;
  role?: AriaRole | undefined | SignalLike<AriaRole | undefined>;
  rows?: number | undefined | SignalLike<number | undefined>;
  rowSpan?: number | undefined | SignalLike<number | undefined>;
  rowspan?: number | undefined | SignalLike<number | undefined>;
  sandbox?: string | undefined | SignalLike<string | undefined>;
  scope?: string | undefined | SignalLike<string | undefined>;
  scoped?: boolean | undefined | SignalLike<boolean | undefined>;
  scrolling?: string | undefined | SignalLike<string | undefined>;
  seamless?: boolean | undefined | SignalLike<boolean | undefined>;
  selected?: boolean | undefined | SignalLike<boolean | undefined>;
  shape?: string | undefined | SignalLike<string | undefined>;
  size?: number | undefined | SignalLike<number | undefined>;
  sizes?: string | undefined | SignalLike<string | undefined>;
  slot?: string | undefined | SignalLike<string | undefined>;
  span?: number | undefined | SignalLike<number | undefined>;
  spellcheck?: boolean | undefined | SignalLike<boolean | undefined>;
  spellCheck?: boolean | undefined | SignalLike<boolean | undefined>;
  src?: string | undefined | SignalLike<string | undefined>;
  srcSet?: string | undefined | SignalLike<string | undefined>;
  srcset?: string | undefined | SignalLike<string | undefined>;
  srcDoc?: string | undefined | SignalLike<string | undefined>;
  srcdoc?: string | undefined | SignalLike<string | undefined>;
  srcLang?: string | undefined | SignalLike<string | undefined>;
  srclang?: string | undefined | SignalLike<string | undefined>;
  start?: number | undefined | SignalLike<number | undefined>;
  step?: number | string | undefined | SignalLike<number | string | undefined>;
  style?: string | CSSProperties | undefined | SignalLike<string | CSSProperties | undefined>;
  summary?: string | undefined | SignalLike<string | undefined>;
  tabIndex?: number | undefined | SignalLike<number | undefined>;
  tabindex?: number | undefined | SignalLike<number | undefined>;
  target?: string | undefined | SignalLike<string | undefined>;
  title?: string | undefined | SignalLike<string | undefined>;
  type?: string | undefined | SignalLike<string | undefined>;
  useMap?: string | undefined | SignalLike<string | undefined>;
  usemap?: string | undefined | SignalLike<string | undefined>;
  value?: string | string[] | number | undefined | SignalLike<string | string[] | number | undefined>;
  volume?: string | number | undefined | SignalLike<string | number | undefined>;
  width?: number | string | undefined | SignalLike<number | string | undefined>;
  wmode?: string | undefined | SignalLike<string | undefined>;
  wrap?: string | undefined | SignalLike<string | undefined>;

  // Non-standard Attributes
  autocapitalize?:
    | 'off'
    | 'none'
    | 'on'
    | 'sentences'
    | 'words'
    | 'characters'
    | undefined
    | SignalLike<'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters' | undefined>;
  autoCapitalize?:
    | 'off'
    | 'none'
    | 'on'
    | 'sentences'
    | 'words'
    | 'characters'
    | undefined
    | SignalLike<'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters' | undefined>;
  disablePictureInPicture?: boolean | undefined | SignalLike<boolean | undefined>;
  results?: number | undefined | SignalLike<number | undefined>;
  translate?: boolean | undefined | SignalLike<boolean | undefined>;

  // RDFa Attributes
  about?: string | undefined | SignalLike<string | undefined>;
  datatype?: string | undefined | SignalLike<string | undefined>;
  inlist?: any;
  prefix?: string | undefined | SignalLike<string | undefined>;
  property?: string | undefined | SignalLike<string | undefined>;
  resource?: string | undefined | SignalLike<string | undefined>;
  typeof?: string | undefined | SignalLike<string | undefined>;
  vocab?: string | undefined | SignalLike<string | undefined>;

  // Microdata Attributes
  itemProp?: string | undefined | SignalLike<string | undefined>;
  itemprop?: string | undefined | SignalLike<string | undefined>;
  itemScope?: boolean | undefined | SignalLike<boolean | undefined>;
  itemscope?: boolean | undefined | SignalLike<boolean | undefined>;
  itemType?: string | undefined | SignalLike<string | undefined>;
  itemtype?: string | undefined | SignalLike<string | undefined>;
  itemID?: string | undefined | SignalLike<string | undefined>;
  itemid?: string | undefined | SignalLike<string | undefined>;
  itemRef?: string | undefined | SignalLike<string | undefined>;
  itemref?: string | undefined | SignalLike<string | undefined>;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace JSX {
  // JSX内在元素的接口，该接口下声明了JSX中的内置标签及其具有的属性，如<input>标签和<input>标签的value属性
  export interface IntrinsicElements {
    // HTML
    a: HTMLAttributes<HTMLAnchorElement>;
    abbr: HTMLAttributes<HTMLElement>;
    address: HTMLAttributes<HTMLElement>;
    area: HTMLAttributes<HTMLAreaElement>;
    article: HTMLAttributes<HTMLElement>;
    aside: HTMLAttributes<HTMLElement>;
    audio: HTMLAttributes<HTMLAudioElement>;
    b: HTMLAttributes<HTMLElement>;
    base: HTMLAttributes<HTMLBaseElement>;
    bdi: HTMLAttributes<HTMLElement>;
    bdo: HTMLAttributes<HTMLElement>;
    big: HTMLAttributes<HTMLElement>;
    blockquote: HTMLAttributes<HTMLQuoteElement>;
    body: HTMLAttributes<HTMLBodyElement>;
    br: HTMLAttributes<HTMLBRElement>;
    button: HTMLAttributes<HTMLButtonElement>;
    canvas: HTMLAttributes<HTMLCanvasElement>;
    caption: HTMLAttributes<HTMLTableCaptionElement>;
    cite: HTMLAttributes<HTMLElement>;
    code: HTMLAttributes<HTMLElement>;
    col: HTMLAttributes<HTMLTableColElement>;
    colgroup: HTMLAttributes<HTMLTableColElement>;
    data: HTMLAttributes<HTMLDataElement>;
    datalist: HTMLAttributes<HTMLDataListElement>;
    dd: HTMLAttributes<HTMLElement>;
    del: HTMLAttributes<HTMLModElement>;
    details: HTMLAttributes<HTMLDetailsElement>;
    dfn: HTMLAttributes<HTMLElement>;
    dialog: HTMLAttributes<HTMLDialogElement>;
    div: HTMLAttributes<HTMLDivElement>;
    dl: HTMLAttributes<HTMLDListElement>;
    dt: HTMLAttributes<HTMLElement>;
    em: HTMLAttributes<HTMLElement>;
    embed: HTMLAttributes<HTMLEmbedElement>;
    fieldset: HTMLAttributes<HTMLFieldSetElement>;
    figcaption: HTMLAttributes<HTMLElement>;
    figure: HTMLAttributes<HTMLElement>;
    footer: HTMLAttributes<HTMLElement>;
    form: HTMLAttributes<HTMLFormElement>;
    h1: HTMLAttributes<HTMLHeadingElement>;
    h2: HTMLAttributes<HTMLHeadingElement>;
    h3: HTMLAttributes<HTMLHeadingElement>;
    h4: HTMLAttributes<HTMLHeadingElement>;
    h5: HTMLAttributes<HTMLHeadingElement>;
    h6: HTMLAttributes<HTMLHeadingElement>;
    head: HTMLAttributes<HTMLHeadElement>;
    header: HTMLAttributes<HTMLElement>;
    hgroup: HTMLAttributes<HTMLElement>;
    hr: HTMLAttributes<HTMLHRElement>;
    html: HTMLAttributes<HTMLHtmlElement>;
    i: HTMLAttributes<HTMLElement>;
    iframe: HTMLAttributes<HTMLIFrameElement>;
    img: HTMLAttributes<HTMLImageElement>;
    input: HTMLAttributes<HTMLInputElement>;
    ins: HTMLAttributes<HTMLModElement>;
    kbd: HTMLAttributes<HTMLElement>;
    keygen: HTMLAttributes<HTMLUnknownElement>;
    label: HTMLAttributes<HTMLLabelElement>;
    legend: HTMLAttributes<HTMLLegendElement>;
    li: HTMLAttributes<HTMLLIElement>;
    link: HTMLAttributes<HTMLLinkElement>;
    main: HTMLAttributes<HTMLElement>;
    map: HTMLAttributes<HTMLMapElement>;
    mark: HTMLAttributes<HTMLElement>;
    menu: HTMLAttributes<HTMLMenuElement>;
    menuitem: HTMLAttributes<HTMLUnknownElement>;
    meta: HTMLAttributes<HTMLMetaElement>;
    meter: HTMLAttributes<HTMLMeterElement>;
    nav: HTMLAttributes<HTMLElement>;
    noscript: HTMLAttributes<HTMLElement>;
    object: HTMLAttributes<HTMLObjectElement>;
    ol: HTMLAttributes<HTMLOListElement>;
    optgroup: HTMLAttributes<HTMLOptGroupElement>;
    option: HTMLAttributes<HTMLOptionElement>;
    output: HTMLAttributes<HTMLOutputElement>;
    p: HTMLAttributes<HTMLParagraphElement>;
    picture: HTMLAttributes<HTMLPictureElement>;
    pre: HTMLAttributes<HTMLPreElement>;
    progress: HTMLAttributes<HTMLProgressElement>;
    q: HTMLAttributes<HTMLQuoteElement>;
    rp: HTMLAttributes<HTMLElement>;
    rt: HTMLAttributes<HTMLElement>;
    ruby: HTMLAttributes<HTMLElement>;
    s: HTMLAttributes<HTMLElement>;
    samp: HTMLAttributes<HTMLElement>;
    script: HTMLAttributes<HTMLScriptElement>;
    search: HTMLAttributes<HTMLElement>;
    section: HTMLAttributes<HTMLElement>;
    select: HTMLAttributes<HTMLSelectElement>;
    slot: HTMLAttributes<HTMLSlotElement>;
    small: HTMLAttributes<HTMLElement>;
    source: HTMLAttributes<HTMLSourceElement>;
    span: HTMLAttributes<HTMLSpanElement>;
    strong: HTMLAttributes<HTMLElement>;
    style: HTMLAttributes<HTMLStyleElement>;
    sub: HTMLAttributes<HTMLElement>;
    summary: HTMLAttributes<HTMLElement>;
    sup: HTMLAttributes<HTMLElement>;
    table: HTMLAttributes<HTMLTableElement>;
    tbody: HTMLAttributes<HTMLTableSectionElement>;
    td: HTMLAttributes<HTMLTableCellElement>;
    template: HTMLAttributes<HTMLTemplateElement>;
    textarea: HTMLAttributes<HTMLTextAreaElement>;
    tfoot: HTMLAttributes<HTMLTableSectionElement>;
    th: HTMLAttributes<HTMLTableCellElement>;
    thead: HTMLAttributes<HTMLTableSectionElement>;
    time: HTMLAttributes<HTMLTimeElement>;
    title: HTMLAttributes<HTMLTitleElement>;
    tr: HTMLAttributes<HTMLTableRowElement>;
    track: HTMLAttributes<HTMLTrackElement>;
    u: HTMLAttributes<HTMLElement>;
    ul: HTMLAttributes<HTMLUListElement>;
    var: HTMLAttributes<HTMLElement>;
    video: HTMLAttributes<HTMLVideoElement>;
    wbr: HTMLAttributes<HTMLElement>;
  }
  // 该接口声明了类组件中具有的属性
  interface IntrinsicClassAttributes<T> {
    ref: Ref<T>;
    key: any;
  }
  // 该接口声明了函数式组建中具有的属性
  interface IntrinsicAttributes {
    key: any;
    ref: Ref<any>;
  }
  // 该接口声明了JSX中组件的元素、属性和子元素的类型
  export interface Element {
    type?: any;
    props?: any;
    key?: any;
  }
  // 该接口定义了类组件所具有的属性、方法
  interface ElementClass {
    setState(state: any, callback: () => void): void;
    forceUpdate(callback: () => void): void;
    render(): any;
  }
  // 该接口用于确定组件props中子元素的名称
  interface ElementChildrenAttribute {
    children?: any;
  }
}

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
export type TargetedEvent<Target extends EventTarget = EventTarget, TypedEvent extends Event = Event> = Omit<
  TypedEvent,
  'currentTarget'
> & {
  readonly currentTarget: Target;
};
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
type GenericEventHandler<Target extends EventTarget> = (event: TargetedEvent<Target>) => void;
//
// --------------------------------- Css Props----------------------------------
//

export type CSSProperties = Record<string | number, any>;
