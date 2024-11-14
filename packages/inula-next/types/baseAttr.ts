/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
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

import { InulaNode, KVObject } from './jsx';

export interface InulaCSSProperties extends CSSProperties {}

export type InulaBoolean = boolean | 'true' | 'false';

//
// --------------------------------- Event Handler Types----------------------------------
//

export type EventHandler<T, E extends Event> = (
  event: E & {
    target: T;
    currentTarget: T;
  }
) => void;
export type InulaEventHandler<T = Element> = EventHandler<T, Event>;

export type InulaClipboardEventHandler<T = Element> = EventHandler<T, ClipboardEvent>;
export type InulaCompositionEventHandler<T = Element> = EventHandler<T, CompositionEvent>;
export type InulaDragEventHandler<T = Element> = EventHandler<T, DragEvent>;
export type InulaFocusEventHandler<T = Element> = EventHandler<T, FocusEvent>;
// TODO: ChangeEvent,FormEvent
export type InulaKeyboardEventHandler<T = Element> = EventHandler<T, KeyboardEvent>;
export type InulaMouseEventHandler<T = Element> = EventHandler<T, MouseEvent>;
export type InulaTouchEventHandler<T = Element> = EventHandler<T, TouchEvent>;
export type InulaPointerEventHandler<T = Element> = EventHandler<T, PointerEvent>;
export type InulaUIEventHandler<T = Element> = EventHandler<T, UIEvent>;
export type InulaWheelEventHandler<T = Element> = EventHandler<T, WheelEvent>;
export type InulaAnimationEventHandler<T = Element> = EventHandler<T, AnimationEvent>;
export type InulaTransitionEventHandler<T = Element> = EventHandler<T, TransitionEvent>;

//
// --------------------------------- Css Props----------------------------------
//

export type CSSProperties = Record<string | number, any>;

type HTMLAttributeReferrerPolicy =
  | ''
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'origin'
  | 'origin-when-cross-origin'
  | 'same-origin'
  | 'strict-origin'
  | 'strict-origin-when-cross-origin'
  | 'unsafe-url';

type HTMLAttributeAnchorTarget = '_self' | '_blank' | '_parent' | '_top' | (string & KVObject);

type AriaRole =
  // 文档结构角色
  | 'article'
  | 'cell'
  | 'columnheader'
  | 'definition'
  | 'directory'
  | 'document'
  | 'feed'
  | 'figure'
  | 'group'
  | 'heading'
  | 'img'
  | 'list'
  | 'listitem'
  | 'math'
  | 'none'
  | 'note'
  | 'presentation'
  | 'row'
  | 'rowgroup'
  | 'rowheader'
  | 'separator'
  | 'term'

  // 小部件角色
  | 'alert'
  | 'alertdialog'
  | 'button'
  | 'checkbox'
  | 'dialog'
  | 'gridcell'
  | 'link'
  | 'log'
  | 'marquee'
  | 'menuitem'
  | 'menuitemcheckbox'
  | 'menuitemradio'
  | 'option'
  | 'progressbar'
  | 'radio'
  | 'scrollbar'
  | 'searchbox'
  | 'slider'
  | 'spinbutton'
  | 'status'
  | 'switch'
  | 'tab'
  | 'tabpanel'
  | 'textbox'
  | 'timer'
  | 'tooltip'
  | 'treeitem'

  // 复合小部件角色
  | 'combobox'
  | 'grid'
  | 'listbox'
  | 'menu'
  | 'menubar'
  | 'radiogroup'
  | 'tablist'
  | 'tree'
  | 'treegrid'

  // 地标角色
  | 'application'
  | 'banner'
  | 'complementary'
  | 'contentinfo'
  | 'form'
  | 'main'
  | 'navigation'
  | 'region'
  | 'search'

  // 实时区域角色
  | 'status'
  | 'timer'

  // 窗口角色
  | 'alertdialog'
  | 'dialog'

  // 通用角色
  | 'toolbar'
  | 'table'

  // 允许自定义角色
  | (string & KVObject);

export interface InulaSVGProps<T> extends SVGAttributes<T> {}

export interface AudioHTMLAttributes<T> extends MediaHTMLAttributes<T> {}

export interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {
  // 链接目标相关属性
  download?: any;
  href?: string;
  hrefLang?: string;
  target?: HTMLAttributeAnchorTarget;

  // 媒体相关属性
  media?: string;
  ping?: string;

  // 链接关系和类型属性
  rel?: string;
  type?: string;

  // 安全相关属性
  referrerPolicy?: HTMLAttributeReferrerPolicy;
}

interface MediaHTMLAttributes<T> extends HTMLAttributes<T> {
  // 媒体控制属性
  autoPlay?: boolean;
  controls?: boolean;
  controlsList?: string;
  loop?: boolean;
  muted?: boolean;

  // 媒体源属性
  src?: string;
  crossOrigin?: string;

  // 媒体组属性
  mediaGroup?: string;

  // 预加载和播放设置
  preload?: string;
  playsInline?: boolean;
}

export interface MetaHTMLAttributes<T> extends HTMLAttributes<T> {
  charSet?: string;
  content?: string;
  httpEquiv?: string;
  name?: string;
  media?: string;
}

export interface MeterHTMLAttributes<T> extends HTMLAttributes<T> {
  // 值和范围属性
  value?: string | ReadonlyArray<string> | number;
  min?: number | string;
  max?: number | string;
  low?: number;
  high?: number;
  optimum?: number;

  // 表单关联属性
  form?: string;
}

export interface QuoteHTMLAttributes<T> extends HTMLAttributes<T> {
  cite?: string;
}

export interface ObjectHTMLAttributes<T> extends HTMLAttributes<T> {
  // 数据源属性
  classID?: string;
  data?: string;
  type?: string;

  // 尺寸属性
  width?: number | string;
  height?: number | string;

  // 表单相关属性
  form?: string;
  name?: string;

  // 其他属性
  useMap?: string;
  wmode?: string;
}

export interface OlHTMLAttributes<T> extends HTMLAttributes<T> {
  reversed?: boolean;
  start?: number;
  type?: '1' | 'a' | 'A' | 'i' | 'I';
}

export interface OptgroupHTMLAttributes<T> extends HTMLAttributes<T> {
  disabled?: boolean;
  label?: string;
}

export interface OptionHTMLAttributes<T> extends HTMLAttributes<T> {
  disabled?: boolean;
  label?: string;
  selected?: boolean;
  value?: string | ReadonlyArray<string> | number;
}

export interface OutputHTMLAttributes<T> extends HTMLAttributes<T> {
  form?: string;
  htmlFor?: string;
  name?: string;
}

export interface ParamHTMLAttributes<T> extends HTMLAttributes<T> {
  name?: string;
  value?: string | ReadonlyArray<string> | number;
}

export interface ProgressHTMLAttributes<T> extends HTMLAttributes<T> {
  max?: number | string;
  value?: string | ReadonlyArray<string> | number;
}

export interface SlotHTMLAttributes<T> extends HTMLAttributes<T> {
  name?: string;
}

export interface ScriptHTMLAttributes<T> extends HTMLAttributes<T> {
  // 脚本加载和执行属性
  async?: boolean;
  defer?: boolean;
  src?: string;
  type?: string;

  // 完整性和安全属性
  integrity?: string;
  nonce?: string;
  crossOrigin?: string;

  // 模块相关属性
  noModule?: boolean;

  // 引用策略
  referrerPolicy?: HTMLAttributeReferrerPolicy;

  /** @deprecated */
  charSet?: string;
}

export interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {
  // 基本属性
  autoComplete?: string;
  name?: string;

  // 状态属性
  disabled?: boolean;
  required?: boolean;

  // 多选属性
  multiple?: boolean;

  // 尺寸属性
  size?: number;

  // 表单关联
  form?: string;

  // 值属性
  value?: string | ReadonlyArray<string> | number;

  // 焦点属性
  autoFocus?: boolean;

  // 事件处理
  // onChange?: InulaChangeEventHandler<T>;
}

export interface SourceHTMLAttributes<T> extends HTMLAttributes<T> {
  height?: number | string;
  media?: string;
  sizes?: string;
  src?: string;
  srcSet?: string;
  type?: string;
  width?: number | string;
}

export interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
  media?: string;
  nonce?: string;
  scoped?: boolean;
  type?: string;
}

export interface TableHTMLAttributes<T> extends HTMLAttributes<T> {
  cellPadding?: number | string;
  cellSpacing?: number | string;
  summary?: string;
  width?: number | string;
}

export interface TextareaHTMLAttributes<T> extends HTMLAttributes<T> {
  // 基本属性
  autoComplete?: string;
  name?: string;
  placeholder?: string;

  // 状态属性
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;

  // 尺寸属性
  cols?: number;
  rows?: number;
  wrap?: string;

  // 焦点属性
  autoFocus?: boolean;

  // 内容限制属性
  maxLength?: number;
  minLength?: number;

  // 方向属性
  dirName?: string;

  // 表单关联
  form?: string;

  // 值属性
  value?: string | ReadonlyArray<string> | number;

  // 事件处理
  // onChange?: InulaChangeEventHandler<T>;
}

export interface ThHTMLAttributes<T> extends HTMLAttributes<T> {
  align?: 'left' | 'center' | 'right' | 'justify' | 'char';
  colSpan?: number;
  headers?: string;
  rowSpan?: number;
  scope?: string;
  abbr?: string;
}

export interface TimeHTMLAttributes<T> extends HTMLAttributes<T> {
  dateTime?: string;
}

export interface TrackHTMLAttributes<T> extends HTMLAttributes<T> {
  default?: boolean;
  kind?: string;
  label?: string;
  src?: string;
  srcLang?: string;
}

export interface VideoHTMLAttributes<T> extends MediaHTMLAttributes<T> {
  height?: number | string;
  playsInline?: boolean;
  poster?: string;
  width?: number | string;
  disablePictureInPicture?: boolean;
  disableRemotePlayback?: boolean;
}

export interface TdHTMLAttributes<T> extends HTMLAttributes<T> {
  // 对齐和布局属性
  align?: 'left' | 'center' | 'right' | 'justify' | 'char';
  valign?: 'top' | 'middle' | 'bottom' | 'baseline';

  // 单元格跨度属性
  colSpan?: number;
  rowSpan?: number;

  // 表头关联属性
  headers?: string;
  scope?: string;

  // 尺寸属性
  height?: number | string;
  width?: number | string;

  abbr?: string;
}

export interface SVGAttributes<T> extends AriaAttributes, DOMAttributes<T> {
  // 核心属性
  id?: string;
  lang?: string;
  tabIndex?: number;
  role?: AriaRole;

  // 样式相关属性
  className?: string;
  style?: InulaCSSProperties;

  // 尺寸和位置属性
  height?: number | string;
  width?: number | string;
  x?: number | string;
  y?: number | string;

  // 颜色和填充属性
  color?: string;
  fill?: string;
  fillOpacity?: number | string;
  fillRule?: 'nonzero' | 'evenodd' | 'inherit';
  stroke?: string;
  strokeDasharray?: string | number;
  strokeDashoffset?: string | number;
  strokeLinecap?: 'butt' | 'round' | 'square' | 'inherit';
  strokeLinejoin?: 'miter' | 'round' | 'bevel' | 'inherit';
  strokeMiterlimit?: number | string;
  strokeOpacity?: number | string;
  strokeWidth?: number | string;

  // 变换属性
  transform?: string;

  // 文本相关属性
  fontFamily?: string;
  fontSize?: number | string;
  textAnchor?: string;

  // 渐变相关属性
  gradientTransform?: string;
  gradientUnits?: string;

  // 其他通用属性
  clipPath?: string;
  clipRule?: number | string;
  cursor?: number | string;
  display?: number | string;
  filter?: string;
  mask?: string;
  opacity?: number | string;
  pointerEvents?: number | string;
  visibility?: number | string;

  // SVG特定属性
  accentHeight?: number | string;
  accumulate?: 'none' | 'sum';
  additive?: 'replace' | 'sum';
  alignmentBaseline?:
    | 'auto'
    | 'baseline'
    | 'before-edge'
    | 'text-before-edge'
    | 'middle'
    | 'central'
    | 'after-edge'
    | 'text-after-edge'
    | 'ideographic'
    | 'alphabetic'
    | 'hanging'
    | 'mathematical'
    | 'inherit';
  allowReorder?: 'no' | 'yes';
  alphabetic?: number | string;
  amplitude?: number | string;
  arabicForm?: 'initial' | 'medial' | 'terminal' | 'isolated';
  ascent?: number | string;
  attributeName?: string;
  attributeType?: string;
  autoReverse?: InulaBoolean;
  azimuth?: number | string;
  baseFrequency?: number | string;
  baselineShift?: number | string;
  baseProfile?: number | string;
  bbox?: number | string;
  begin?: number | string;
  bias?: number | string;
  by?: number | string;
  calcMode?: number | string;
  capHeight?: number | string;
  clip?: number | string;
  clipPathUnits?: number | string;
  colorInterpolation?: number | string;
  colorInterpolationFilters?: 'auto' | 'sRGB' | 'linearRGB' | 'inherit';
  colorProfile?: number | string;
  colorRendering?: number | string;
  contentScriptType?: number | string;
  contentStyleType?: number | string;
  diffuseConstant?: number | string;
  direction?: number | string;
  divisor?: number | string;
  dominantBaseline?: number | string;
  dur?: number | string;
  dx?: number | string;
  dy?: number | string;
  edgeMode?: number | string;
  elevation?: number | string;
  enableBackground?: number | string;
  end?: number | string;
  exponent?: number | string;
  externalResourcesRequired?: InulaBoolean;
  filterRes?: number | string;
  filterUnits?: number | string;
  floodColor?: number | string;
  floodOpacity?: number | string;
  focusable?: InulaBoolean | 'auto';
  fontSizeAdjust?: number | string;
  fontStretch?: number | string;
  fontStyle?: number | string;
  fontVariant?: number | string;
  fontWeight?: number | string;
  format?: number | string;
  from?: number | string;
  g1?: number | string;
  g2?: number | string;
  glyphName?: number | string;
  glyphOrientationHorizontal?: number | string;
  glyphOrientationVertical?: number | string;
  fx?: number | string;
  fy?: number | string;
  glyphRef?: number | string;
  hanging?: number | string;
  horizAdvX?: number | string;
  horizOriginX?: number | string;
  href?: string;
  ideographic?: number | string;
  imageRendering?: number | string;
  in2?: number | string;
  in?: string;
  intercept?: number | string;
  k?: number | string;
  k1?: number | string;
  k2?: number | string;
  k3?: number | string;
  k4?: number | string;
  kernelMatrix?: number | string;
  kernelUnitLength?: number | string;
  kerning?: number | string;
  keyPoints?: number | string;
  keySplines?: number | string;
  keyTimes?: number | string;
  lengthAdjust?: number | string;
  letterSpacing?: number | string;
  lightingColor?: number | string;
  limitingConeAngle?: number | string;
  local?: number | string;
  markerEnd?: string;
  markerHeight?: number | string;
  markerMid?: string;
  markerStart?: string;
  markerUnits?: number | string;
  markerWidth?: number | string;
  maskContentUnits?: number | string;
  maskUnits?: number | string;
  mathematical?: number | string;
  mode?: number | string;
  numOctaves?: number | string;
  offset?: number | string;
  operator?: number | string;
  order?: number | string;
  orient?: number | string;
  orientation?: number | string;
  origin?: number | string;
  overflow?: number | string;
  overlinePosition?: number | string;
  overlineThickness?: number | string;
  paintOrder?: number | string;
  panose1?: number | string;
  path?: string;
  pathLength?: number | string;
  patternContentUnits?: string;
  patternTransform?: number | string;
  patternUnits?: string;
  points?: string;
  pointsAtX?: number | string;
  pointsAtY?: number | string;
  pointsAtZ?: number | string;
  preserveAlpha?: InulaBoolean;
  preserveAspectRatio?: string;
  primitiveUnits?: number | string;
  r?: number | string;
  radius?: number | string;
  refX?: number | string;
  refY?: number | string;
  renderingIntent?: number | string;
  repeatCount?: number | string;
  repeatDur?: number | string;
  requiredExtensions?: number | string;
  requiredFeatures?: number | string;
  rx?: number | string;
  ry?: number | string;
  restart?: number | string;
  result?: string;
  rotate?: number | string;
  scale?: number | string;
  seed?: number | string;
  shapeRendering?: number | string;
  specularConstant?: number | string;
  specularExponent?: number | string;
  slope?: number | string;
  spacing?: number | string;
  speed?: number | string;
  spreadMethod?: string;
  startOffset?: number | string;
  stdDeviation?: number | string;
  stopColor?: string;
  stopOpacity?: number | string;
  stemh?: number | string;
  stemv?: number | string;
  stitchTiles?: number | string;
  strikethroughPosition?: number | string;
  strikethroughThickness?: number | string;
  string?: number | string;
  surfaceScale?: number | string;
  systemLanguage?: number | string;
  targetX?: number | string;
  targetY?: number | string;
  tableValues?: number | string;
  textDecoration?: number | string;
  textLength?: number | string;
  textRendering?: number | string;
  to?: number | string;
  underlinePosition?: number | string;
  underlineThickness?: number | string;
  u1?: number | string;
  u2?: number | string;
  unicode?: number | string;
  unicodeBidi?: number | string;
  unicodeRange?: number | string;
  unitsPerEm?: number | string;
  vertOriginX?: number | string;
  vertOriginY?: number | string;
  vAlphabetic?: number | string;
  values?: string;
  vectorEffect?: number | string;
  version?: string;
  vertAdvY?: number | string;
  vHanging?: number | string;
  vIdeographic?: number | string;
  viewBox?: string;
  viewTarget?: number | string;
  vMathematical?: number | string;
  widths?: number | string;
  wordSpacing?: number | string;
  writingMode?: number | string;
  x1?: number | string;
  x2?: number | string;
  xChannelSelector?: string;
  xHeight?: number | string;
  xlinkActuate?: string;
  xlinkArcrole?: string;
  xlinkHref?: string;
  xlinkRole?: string;
  xlinkShow?: string;
  xlinkTitle?: string;
  xlinkType?: string;
  xmlBase?: string;
  xmlLang?: string;
  xmlns?: string;
  xmlnsXlink?: string;
  xmlSpace?: string;
  y1?: number | string;
  y2?: number | string;
  yChannelSelector?: string;
  z?: number | string;
  zoomAndPan?: string;
}

export interface WebViewHTMLAttributes<T> extends HTMLAttributes<T> {
  // 源和内容属性
  src?: string;
  httpreferrer?: string;
  useragent?: string;

  // 功能和安全属性
  allowFullScreen?: boolean;
  allowpopups?: boolean;
  autoFocus?: boolean;
  autosize?: boolean;
  blinkfeatures?: string;
  disableblinkfeatures?: string;
  disableguestresize?: boolean;
  disablewebsecurity?: boolean;
  guestinstance?: string;
  nodeintegration?: boolean;
  partition?: string;
  plugins?: boolean;
  preload?: string;
  webpreferences?: string;
}

export interface AreaHTMLAttributes<T> extends HTMLAttributes<T> {
  // 链接属性
  alt?: string;
  coords?: string;
  download?: any;
  href?: string;
  hrefLang?: string;
  media?: string;
  rel?: string;
  shape?: string;
  target?: string;

  // 安全属性
  referrerPolicy?: HTMLAttributeReferrerPolicy;
}

export interface BaseHTMLAttributes<T> extends HTMLAttributes<T> {
  href?: string;
  target?: string;
}

export interface BlockquoteHTMLAttributes<T> extends HTMLAttributes<T> {
  cite?: string;
}

export interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
  // 基本属性
  autoFocus?: boolean;
  disabled?: boolean;
  name?: string;
  type?: 'submit' | 'reset' | 'button';
  value?: string | ReadonlyArray<string> | number;

  // 表单关联属性
  form?: string;
  formAction?: string;
  formEncType?: string;
  formMethod?: string;
  formNoValidate?: boolean;
  formTarget?: string;
}

export interface CanvasHTMLAttributes<T> extends HTMLAttributes<T> {
  height?: number | string;
  width?: number | string;
}

export interface ColHTMLAttributes<T> extends HTMLAttributes<T> {
  span?: number;
  width?: number | string;
}

export interface ColgroupHTMLAttributes<T> extends HTMLAttributes<T> {
  span?: number;
}

export interface DataHTMLAttributes<T> extends HTMLAttributes<T> {
  value?: string | ReadonlyArray<string> | number;
}

export interface DetailsHTMLAttributes<T> extends HTMLAttributes<T> {
  open?: boolean;
  onToggle?: InulaEventHandler<T>;
}

export interface DelHTMLAttributes<T> extends HTMLAttributes<T> {
  cite?: string;
  dateTime?: string;
}

export interface DialogHTMLAttributes<T> extends HTMLAttributes<T> {
  open?: boolean;
}

export interface EmbedHTMLAttributes<T> extends HTMLAttributes<T> {
  height?: number | string;
  src?: string;
  type?: string;
  width?: number | string;
}

export interface FieldsetHTMLAttributes<T> extends HTMLAttributes<T> {
  disabled?: boolean;
  form?: string;
  name?: string;
}

export interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
  // 表单提交属性
  action?: string;
  method?: string;
  target?: string;

  // 表单编码属性
  acceptCharset?: string;
  encType?: string;

  // 表单行为属性
  autoComplete?: string;
  name?: string;
  noValidate?: boolean;
}

export interface HtmlHTMLAttributes<T> extends HTMLAttributes<T> {
  manifest?: string;
}

export interface IframeHTMLAttributes<T> extends HTMLAttributes<T> {
  // 内容源属性
  src?: string;
  srcDoc?: string;

  // 安全属性
  sandbox?: string;
  allow?: string;
  allowFullScreen?: boolean;
  allowTransparency?: boolean;
  referrerPolicy?: HTMLAttributeReferrerPolicy;

  // 尺寸属性
  width?: number | string;
  height?: number | string;

  // 加载行为属性
  loading?: 'eager' | 'lazy';
  name?: string;
  /** @deprecated */
  frameBorder?: number | string;
  /** @deprecated */
  marginHeight?: number;
  /** @deprecated */
  marginWidth?: number;
  /** @deprecated */
  scrolling?: string;

  seamless?: boolean;
}

export interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
  // 基本源属性
  alt?: string;
  src?: string;

  // 响应式图像属性
  srcSet?: string;
  sizes?: string;

  // 跨域和引用策略
  crossOrigin?: 'anonymous' | 'use-credentials' | '';
  referrerPolicy?: HTMLAttributeReferrerPolicy;

  // 尺寸属性
  height?: number | string;
  width?: number | string;

  // 加载行为
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'auto' | 'sync';

  useMap?: string;
}

export interface InsHTMLAttributes<T> extends HTMLAttributes<T> {
  cite?: string;
  dateTime?: string;
}

type HTMLInputTypeAttribute =
  | 'button'
  | 'checkbox'
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'file'
  | 'hidden'
  | 'image'
  | 'month'
  | 'number'
  | 'password'
  | 'radio'
  | 'range'
  | 'reset'
  | 'search'
  | 'submit'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week'
  | (string & KVObject);

export interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
  accept?: string;
  alt?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  capture?: boolean | 'user' | 'environment'; // https://www.w3.org/TR/html-media-capture/#the-capture-attribute
  checked?: boolean;
  crossOrigin?: string;
  disabled?: boolean;
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
  form?: string;
  formAction?: string;
  formEncType?: string;
  formMethod?: string;
  formNoValidate?: boolean;
  formTarget?: string;
  height?: number | string;
  list?: string;
  max?: number | string;
  maxLength?: number;
  min?: number | string;
  minLength?: number;
  multiple?: boolean;
  name?: string;
  pattern?: string;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  size?: number;
  src?: string;
  step?: number | string;
  type?: HTMLInputTypeAttribute;
  value?: string | ReadonlyArray<string> | number;
  width?: number | string;

  // onChange?: InulaChangeEventHandler<T>;
}

export interface KeygenHTMLAttributes<T> extends HTMLAttributes<T> {
  // 基本属性
  autoFocus?: boolean;
  challenge?: string;
  disabled?: boolean;
  form?: string;
  keyType?: string;
  keyParams?: string;
  name?: string;
}

export interface LabelHTMLAttributes<T> extends HTMLAttributes<T> {
  form?: string;
  htmlFor?: string;
}

export interface LiHTMLAttributes<T> extends HTMLAttributes<T> {
  value?: string | ReadonlyArray<string> | number;
}

export interface LinkHTMLAttributes<T> extends HTMLAttributes<T> {
  // 核心属性
  href?: string;
  rel?: string;
  type?: string;

  // 资源加载属性
  as?: string;
  crossOrigin?: string;
  integrity?: string;
  referrerPolicy?: HTMLAttributeReferrerPolicy;

  // 语言和字符集属性
  hrefLang?: string;
  charSet?: string;

  // 媒体和样式属性
  media?: string;
  sizes?: string;

  // 预加载和性能属性
  imageSrcSet?: string;
}

export interface MapHTMLAttributes<T> extends HTMLAttributes<T> {
  name?: string;
}

export interface MenuHTMLAttributes<T> extends HTMLAttributes<T> {
  type?: string;
}

type InulaRole =
  | 'application'
  | 'alert'
  | 'alertdialog'
  | 'article'
  | 'banner'
  | 'button'
  | 'cell'
  | 'checkbox'
  | 'columnheader'
  | 'combobox'
  | 'complementary'
  | 'contentinfo'
  | 'definition'
  | 'dialog'
  | 'directory'
  | 'document'
  | 'feed'
  | 'figure'
  | 'form'
  | 'grid'
  | 'gridcell'
  | 'group'
  | 'heading'
  | 'img'
  | 'link'
  | 'list'
  | 'listbox'
  | 'listitem'
  | 'log'
  | 'main'
  | 'marquee'
  | 'math'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'menuitemcheckbox'
  | 'menuitemradio'
  | 'navigation'
  | 'none'
  | 'note'
  | 'option'
  | 'presentation'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'region'
  | 'row'
  | 'rowgroup'
  | 'rowheader'
  | 'scrollbar'
  | 'search'
  | 'searchbox'
  | 'separator'
  | 'slider'
  | 'spinbutton'
  | 'status'
  | 'switch'
  | 'tab'
  | 'table'
  | 'tablist'
  | 'tabpanel'
  | 'term'
  | 'textbox'
  | 'timer'
  | 'toolbar'
  | 'tooltip'
  | 'tree'
  | 'treegrid'
  | 'treeitem'
  | (string & KVObject);

interface AriaAttributes {
  // 角色和标识属性
  'aria-activedescendant'?: string;
  'aria-atomic'?: InulaBoolean;
  'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both';
  'aria-current'?: boolean | 'false' | 'true' | 'page' | 'step' | 'location' | 'date' | 'time';
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-level'?: number;
  'aria-modal'?: InulaBoolean;
  'aria-multiline'?: InulaBoolean;
  'aria-multiselectable'?: InulaBoolean;
  'aria-orientation'?: 'horizontal' | 'vertical';
  'aria-placeholder'?: string;
  'aria-roledescription'?: string;

  // 状态和属性
  'aria-busy'?: InulaBoolean;
  'aria-checked'?: boolean | 'false' | 'mixed' | 'true';
  'aria-disabled'?: InulaBoolean;
  'aria-expanded'?: InulaBoolean;
  'aria-hidden'?: InulaBoolean;
  'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
  'aria-pressed'?: boolean | 'false' | 'mixed' | 'true';
  'aria-readonly'?: InulaBoolean;
  'aria-required'?: InulaBoolean;
  'aria-selected'?: InulaBoolean;

  // 关系属性
  'aria-controls'?: string;
  'aria-describedby'?: string;
  'aria-details'?: string;
  'aria-errormessage'?: string;
  'aria-flowto'?: string;
  'aria-labelledby'?: string;
  'aria-owns'?: string;

  // 实时区域属性
  'aria-live'?: 'off' | 'assertive' | 'polite';
  'aria-relevant'?:
    | 'additions'
    | 'additions removals'
    | 'additions text'
    | 'all'
    | 'removals'
    | 'removals additions'
    | 'removals text'
    | 'text'
    | 'text additions'
    | 'text removals';

  // 拖放属性
  /** @deprecated in ARIA 1.1 */
  'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup';
  /** @deprecated in ARIA 1.1 */
  'aria-grabbed'?: InulaBoolean;

  // 值属性
  'aria-valuemax'?: number;
  'aria-valuemin'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;

  'aria-colcount'?: number;
  'aria-colindex'?: number;
  'aria-colspan'?: number;
  'aria-keyshortcuts'?: string;
  'aria-label'?: string;
  'aria-posinset'?: number;
  'aria-rowcount'?: number;
  'aria-rowindex'?: number;
  'aria-rowspan'?: number;
  'aria-setsize'?: number;
  'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other';
}

export interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
  // 核心属性
  id?: string;
  className?: string;
  style?: InulaCSSProperties;

  // 全局属性
  accessKey?: string;
  contentEditable?: InulaBoolean | 'inherit';
  contextMenu?: string;
  dir?: string;
  draggable?: InulaBoolean;
  hidden?: boolean;
  lang?: string;
  spellCheck?: InulaBoolean;
  tabIndex?: number;
  title?: string;
  translate?: 'yes' | 'no';

  // 交互属性
  radioGroup?: string; // <command>, <menuitem>

  // ARIA和可访问性
  role?: InulaRole;

  // 数据属性
  about?: string;
  datatype?: string;
  inlist?: any;
  prefix?: string;
  property?: string;
  resource?: string;
  typeof?: string;
  vocab?: string;

  // 移动设备相关
  autoCapitalize?: string;
  autoCorrect?: string;
  autoSave?: string;

  // 其他属性
  color?: string;
  itemProp?: string;
  itemScope?: boolean;
  itemType?: string;
  itemID?: string;
  itemRef?: string;
  results?: number;
  security?: string;
  unselectable?: 'on' | 'off';

  // 输入模式
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';

  // Web Components
  is?: string;

  // 内部使用属性
  defaultChecked?: boolean;
  defaultValue?: string | number | ReadonlyArray<string>;
  suppressContentEditableWarning?: boolean;
  suppressHydrationWarning?: boolean;

  // 占位符属性
  placeholder?: string;
}

export interface DOMAttributes<T> {
  children?: InulaNode;
  dangerouslySetInnerHTML?: {
    __html: string;
  };

  // 剪贴板事件
  onCopy?: InulaClipboardEventHandler<T>;
  onCopyCapture?: InulaClipboardEventHandler<T>;
  onCut?: InulaClipboardEventHandler<T>;
  onCutCapture?: InulaClipboardEventHandler<T>;
  onPaste?: InulaClipboardEventHandler<T>;
  onPasteCapture?: InulaClipboardEventHandler<T>;

  // 剪贴板事件
  onCompositionEnd?: InulaCompositionEventHandler<T>;
  onCompositionEndCapture?: InulaCompositionEventHandler<T>;
  onCompositionStart?: InulaCompositionEventHandler<T>;
  onCompositionStartCapture?: InulaCompositionEventHandler<T>;
  onCompositionUpdate?: InulaCompositionEventHandler<T>;
  onCompositionUpdateCapture?: InulaCompositionEventHandler<T>;

  // 焦点事件
  onFocus?: InulaFocusEventHandler<T>;
  onFocusCapture?: InulaFocusEventHandler<T>;
  onBlur?: InulaFocusEventHandler<T>;
  onBlurCapture?: InulaFocusEventHandler<T>;

  // 表单事件
  // onChange?: InulaFormEventHandler<T>;
  // onChangeCapture?: InulaFormEventHandler<T>;
  // onBeforeInput?: InulaFormEventHandler<T>;
  // onBeforeInputCapture?: InulaFormEventHandler<T>;
  // onInput?: InulaFormEventHandler<T>;
  // onInputCapture?: InulaFormEventHandler<T>;
  // onReset?: InulaFormEventHandler<T>;
  // onResetCapture?: InulaFormEventHandler<T>;
  // onSubmit?: InulaFormEventHandler<T>;
  // onSubmitCapture?: InulaFormEventHandler<T>;
  // onInvalid?: InulaFormEventHandler<T>;
  // onInvalidCapture?: InulaFormEventHandler<T>;

  // 图像事件
  onLoad?: InulaEventHandler<T>;
  onLoadCapture?: InulaEventHandler<T>;
  onError?: InulaEventHandler<T>;
  onErrorCapture?: InulaEventHandler<T>;

  // 键盘事件
  onKeyDown?: InulaKeyboardEventHandler<T>;
  onKeyDownCapture?: InulaKeyboardEventHandler<T>;
  /** @deprecated */
  onKeyPress?: InulaKeyboardEventHandler<T>;
  /** @deprecated */
  onKeyPressCapture?: InulaKeyboardEventHandler<T>;
  onKeyUp?: InulaKeyboardEventHandler<T>;
  onKeyUpCapture?: InulaKeyboardEventHandler<T>;

  // 媒体事件
  onAbort?: InulaEventHandler<T>;
  onAbortCapture?: InulaEventHandler<T>;
  onCanPlay?: InulaEventHandler<T>;
  onCanPlayCapture?: InulaEventHandler<T>;
  onCanPlayThrough?: InulaEventHandler<T>;
  onCanPlayThroughCapture?: InulaEventHandler<T>;
  onDurationChange?: InulaEventHandler<T>;
  onDurationChangeCapture?: InulaEventHandler<T>;
  onEmptied?: InulaEventHandler<T>;
  onEmptiedCapture?: InulaEventHandler<T>;
  onEncrypted?: InulaEventHandler<T>;
  onEncryptedCapture?: InulaEventHandler<T>;
  onEnded?: InulaEventHandler<T>;
  onEndedCapture?: InulaEventHandler<T>;
  onLoadedData?: InulaEventHandler<T>;
  onLoadedDataCapture?: InulaEventHandler<T>;
  onLoadedMetadata?: InulaEventHandler<T>;
  onLoadedMetadataCapture?: InulaEventHandler<T>;
  onLoadStart?: InulaEventHandler<T>;
  onLoadStartCapture?: InulaEventHandler<T>;
  onPause?: InulaEventHandler<T>;
  onPauseCapture?: InulaEventHandler<T>;
  onPlay?: InulaEventHandler<T>;
  onPlayCapture?: InulaEventHandler<T>;
  onPlaying?: InulaEventHandler<T>;
  onPlayingCapture?: InulaEventHandler<T>;
  onProgress?: InulaEventHandler<T>;
  onProgressCapture?: InulaEventHandler<T>;
  onRateChange?: InulaEventHandler<T>;
  onRateChangeCapture?: InulaEventHandler<T>;
  onSeeked?: InulaEventHandler<T>;
  onSeekedCapture?: InulaEventHandler<T>;
  onSeeking?: InulaEventHandler<T>;
  onSeekingCapture?: InulaEventHandler<T>;
  onStalled?: InulaEventHandler<T>;
  onStalledCapture?: InulaEventHandler<T>;
  onSuspend?: InulaEventHandler<T>;
  onSuspendCapture?: InulaEventHandler<T>;
  onTimeUpdate?: InulaEventHandler<T>;
  onTimeUpdateCapture?: InulaEventHandler<T>;
  onVolumeChange?: InulaEventHandler<T>;
  onVolumeChangeCapture?: InulaEventHandler<T>;
  onWaiting?: InulaEventHandler<T>;
  onWaitingCapture?: InulaEventHandler<T>;

  //鼠标事件
  onAuxClick?: InulaMouseEventHandler<T>;
  onAuxClickCapture?: InulaMouseEventHandler<T>;
  onClick?: InulaMouseEventHandler<T>;
  onClickCapture?: InulaMouseEventHandler<T>;
  onContextMenu?: InulaMouseEventHandler<T>;
  onContextMenuCapture?: InulaMouseEventHandler<T>;
  onDoubleClick?: InulaMouseEventHandler<T>;
  onDoubleClickCapture?: InulaMouseEventHandler<T>;
  onDrag?: InulaDragEventHandler<T>;
  onDragCapture?: InulaDragEventHandler<T>;
  onDragEnd?: InulaDragEventHandler<T>;
  onDragEndCapture?: InulaDragEventHandler<T>;
  onDragEnter?: InulaDragEventHandler<T>;
  onDragEnterCapture?: InulaDragEventHandler<T>;
  onDragExit?: InulaDragEventHandler<T>;
  onDragExitCapture?: InulaDragEventHandler<T>;
  onDragLeave?: InulaDragEventHandler<T>;
  onDragLeaveCapture?: InulaDragEventHandler<T>;
  onDragOver?: InulaDragEventHandler<T>;
  onDragOverCapture?: InulaDragEventHandler<T>;
  onDragStart?: InulaDragEventHandler<T>;
  onDragStartCapture?: InulaDragEventHandler<T>;
  onDrop?: InulaDragEventHandler<T>;
  onDropCapture?: InulaDragEventHandler<T>;
  onMouseDown?: InulaMouseEventHandler<T>;
  onMouseDownCapture?: InulaMouseEventHandler<T>;
  onMouseEnter?: InulaMouseEventHandler<T>;
  onMouseLeave?: InulaMouseEventHandler<T>;
  onMouseMove?: InulaMouseEventHandler<T>;
  onMouseMoveCapture?: InulaMouseEventHandler<T>;
  onMouseOut?: InulaMouseEventHandler<T>;
  onMouseOutCapture?: InulaMouseEventHandler<T>;
  onMouseOver?: InulaMouseEventHandler<T>;
  onMouseOverCapture?: InulaMouseEventHandler<T>;
  onMouseUp?: InulaMouseEventHandler<T>;
  onMouseUpCapture?: InulaMouseEventHandler<T>;

  // 选择事件
  onSelect?: InulaEventHandler<T>;
  onSelectCapture?: InulaEventHandler<T>;

  // 触摸事件
  onTouchCancel?: InulaTouchEventHandler<T>;
  onTouchCancelCapture?: InulaTouchEventHandler<T>;
  onTouchEnd?: InulaTouchEventHandler<T>;
  onTouchEndCapture?: InulaTouchEventHandler<T>;
  onTouchMove?: InulaTouchEventHandler<T>;
  onTouchMoveCapture?: InulaTouchEventHandler<T>;
  onTouchStart?: InulaTouchEventHandler<T>;
  onTouchStartCapture?: InulaTouchEventHandler<T>;

  // 指针事件
  onPointerDown?: InulaPointerEventHandler<T>;
  onPointerDownCapture?: InulaPointerEventHandler<T>;
  onPointerMove?: InulaPointerEventHandler<T>;
  onPointerMoveCapture?: InulaPointerEventHandler<T>;
  onPointerUp?: InulaPointerEventHandler<T>;
  onPointerUpCapture?: InulaPointerEventHandler<T>;
  onPointerCancel?: InulaPointerEventHandler<T>;
  onPointerCancelCapture?: InulaPointerEventHandler<T>;
  onPointerEnter?: InulaPointerEventHandler<T>;
  onPointerEnterCapture?: InulaPointerEventHandler<T>;
  onPointerLeave?: InulaPointerEventHandler<T>;
  onPointerLeaveCapture?: InulaPointerEventHandler<T>;
  onPointerOver?: InulaPointerEventHandler<T>;
  onPointerOverCapture?: InulaPointerEventHandler<T>;
  onPointerOut?: InulaPointerEventHandler<T>;
  onPointerOutCapture?: InulaPointerEventHandler<T>;
  onGotPointerCapture?: InulaPointerEventHandler<T>;
  onGotPointerCaptureCapture?: InulaPointerEventHandler<T>;
  onLostPointerCapture?: InulaPointerEventHandler<T>;
  onLostPointerCaptureCapture?: InulaPointerEventHandler<T>;

  // UI 事件
  onScroll?: InulaUIEventHandler<T>;
  onScrollCapture?: InulaUIEventHandler<T>;

  // 滚轮事件
  onWheel?: InulaWheelEventHandler<T>;
  onWheelCapture?: InulaWheelEventHandler<T>;

  // 动画事件
  onAnimationStart?: InulaAnimationEventHandler<T>;
  onAnimationStartCapture?: InulaAnimationEventHandler<T>;
  onAnimationEnd?: InulaAnimationEventHandler<T>;
  onAnimationEndCapture?: InulaAnimationEventHandler<T>;
  onAnimationIteration?: InulaAnimationEventHandler<T>;
  onAnimationIterationCapture?: InulaAnimationEventHandler<T>;

  // 过渡事件
  onTransitionEnd?: InulaTransitionEventHandler<T>;
  onTransitionEndCapture?: InulaTransitionEventHandler<T>;
}

export interface AllHTMLAttributes<T> extends HTMLAttributes<T> {
  // 表单属性
  accept?: string;
  acceptCharset?: string;
  action?: string;
  allowFullScreen?: boolean;
  allowTransparency?: boolean;
  alt?: string;
  as?: string;
  async?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  autoPlay?: boolean;
  capture?: boolean | 'user' | 'environment';
  cellPadding?: number | string;
  cellSpacing?: number | string;
  charSet?: string;
  challenge?: string;
  checked?: boolean;
  cite?: string;
  classID?: string;
  colSpan?: number;
  cols?: number;
  content?: string;
  controls?: boolean;
  coords?: string;
  crossOrigin?: string;
  data?: string;
  dateTime?: string;
  default?: boolean;
  defer?: boolean;
  disabled?: boolean;
  download?: any;
  encType?: string;
  form?: string;
  formAction?: string;
  formEncType?: string;
  formMethod?: string;
  formNoValidate?: boolean;
  formTarget?: string;
  frameBorder?: number | string;
  headers?: string;
  height?: number | string;
  high?: number;
  href?: string;
  hrefLang?: string;
  htmlFor?: string;
  httpEquiv?: string;
  integrity?: string;
  keyParams?: string;
  keyType?: string;
  kind?: string;
  label?: string;
  list?: string;
  loop?: boolean;
  low?: number;
  manifest?: string;
  marginHeight?: number;
  marginWidth?: number;
  max?: number | string;
  maxLength?: number;
  media?: string;
  mediaGroup?: string;
  method?: string;
  min?: number | string;
  minLength?: number;
  multiple?: boolean;
  muted?: boolean;
  name?: string;
  nonce?: string;
  noValidate?: boolean;
  open?: boolean;
  optimum?: number;
  pattern?: string;
  placeholder?: string;
  playsInline?: boolean;
  poster?: string;
  preload?: string;
  readOnly?: boolean;
  rel?: string;
  required?: boolean;
  reversed?: boolean;
  rows?: number;
  rowSpan?: number;
  sandbox?: string;
  scope?: string;
  scoped?: boolean;
  scrolling?: string;
  seamless?: boolean;
  selected?: boolean;
  shape?: string;
  size?: number;
  sizes?: string;
  span?: number;
  src?: string;
  srcDoc?: string;
  srcLang?: string;
  srcSet?: string;
  start?: number;
  step?: number | string;
  summary?: string;
  target?: string;
  type?: string;
  useMap?: string;
  value?: string | ReadonlyArray<string> | number;
  width?: number | string;
  wmode?: string;
  wrap?: string;
}
