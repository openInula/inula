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

import {
  AllHTMLAttributes,
  AnchorHTMLAttributes,
  AreaHTMLAttributes,
  AudioHTMLAttributes,
  BaseHTMLAttributes,
  BlockquoteHTMLAttributes,
  ButtonHTMLAttributes,
  CanvasHTMLAttributes,
  ColHTMLAttributes,
  ColgroupHTMLAttributes,
  DOMAttributes,
  DataHTMLAttributes,
  DelHTMLAttributes,
  DetailsHTMLAttributes,
  DialogHTMLAttributes,
  EmbedHTMLAttributes,
  FieldsetHTMLAttributes,
  FormHTMLAttributes,
  HTMLAttributes,
  HtmlHTMLAttributes,
  IframeHTMLAttributes,
  ImgHTMLAttributes,
  InputHTMLAttributes,
  InsHTMLAttributes,
  KeygenHTMLAttributes,
  LabelHTMLAttributes,
  LiHTMLAttributes,
  LinkHTMLAttributes,
  MapHTMLAttributes,
  MenuHTMLAttributes,
  MetaHTMLAttributes,
  MeterHTMLAttributes,
  ObjectHTMLAttributes,
  OlHTMLAttributes,
  OptgroupHTMLAttributes,
  OptionHTMLAttributes,
  OutputHTMLAttributes,
  ParamHTMLAttributes,
  ProgressHTMLAttributes,
  QuoteHTMLAttributes,
  SVGAttributes,
  InulaSVGProps,
  ScriptHTMLAttributes,
  SelectHTMLAttributes,
  SlotHTMLAttributes,
  SourceHTMLAttributes,
  StyleHTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  TextareaHTMLAttributes,
  ThHTMLAttributes,
  TimeHTMLAttributes,
  TrackHTMLAttributes,
  VideoHTMLAttributes,
  WebViewHTMLAttributes,
} from './baseAttr';
import { HTMLWebViewElement } from './baseElement';

export type InulaFragment = Iterable<InulaNode>;
export type InulaNode = string | number | null | boolean | undefined | InulaElement | InulaFragment;

type DOMFactory<P extends DOMAttributes<T>, T extends Element> = (
  props?: (ClassAttributes<T> & P) | null,
  ...children: InulaNode[]
) => DOMElement<P, T>;

type RefCallBack<T> = (instance: T | null) => void;
export type Ref<T> = RefCallBack<T> | T | null;

// TODO: rename to InulaAttributes
interface ClassAttributes<T> {
  ref?: Ref<T>;
}

interface InulaHTMLFactory<P extends HTMLAttributes<T>, T extends HTMLElement> extends DOMFactory<P, T> {
  (props?: (ClassAttributes<T> & P) | null, ...children: InulaNode[]): DetailedInulaHTMLElement<P, T>;
}

export interface InulaHTMLElement<T extends HTMLElement> extends DetailedInulaHTMLElement<AllHTMLAttributes<T>, T> {}

export interface DOMElement<P extends HTMLAttributes<T> | SVGAttributes<T>, T extends Element> {
  ref: Ref<T>;
}

export interface InulaSVGElement extends DOMElement<SVGAttributes<SVGElement>, SVGElement> {
  type: keyof InulaSVG;
}

export interface InulaSVG {
  animate: InulaSVGFactory;
  circle: InulaSVGFactory;
  clipPath: InulaSVGFactory;
  defs: InulaSVGFactory;
  desc: InulaSVGFactory;
  ellipse: InulaSVGFactory;
  feBlend: InulaSVGFactory;
  feColorMatrix: InulaSVGFactory;
  feComponentTransfer: InulaSVGFactory;
  feComposite: InulaSVGFactory;
  feConvolveMatrix: InulaSVGFactory;
  feDiffuseLighting: InulaSVGFactory;
  feDisplacementMap: InulaSVGFactory;
  feDistantLight: InulaSVGFactory;
  feDropShadow: InulaSVGFactory;
  feFlood: InulaSVGFactory;
  feFuncA: InulaSVGFactory;
  feFuncB: InulaSVGFactory;
  feFuncG: InulaSVGFactory;
  feFuncR: InulaSVGFactory;
  feImage: InulaSVGFactory;
  feGaussianBlur: InulaSVGFactory;
  feMerge: InulaSVGFactory;
  feMergeNode: InulaSVGFactory;
  feMorphology: InulaSVGFactory;
  feOffset: InulaSVGFactory;
  fePointLight: InulaSVGFactory;
  feSpecularLighting: InulaSVGFactory;
  feSpotLight: InulaSVGFactory;
  feTile: InulaSVGFactory;
  feTurbulence: InulaSVGFactory;
  filter: InulaSVGFactory;
  foreignObject: InulaSVGFactory;
  g: InulaSVGFactory;
  image: InulaSVGFactory;
  line: InulaSVGFactory;
  linearGradient: InulaSVGFactory;
  marker: InulaSVGFactory;
  mask: InulaSVGFactory;
  view: InulaSVGFactory;
  metadata: InulaSVGFactory;
  path: InulaSVGFactory;
  pattern: InulaSVGFactory;
  polygon: InulaSVGFactory;
  polyline: InulaSVGFactory;
  radialGradient: InulaSVGFactory;
  rect: InulaSVGFactory;
  stop: InulaSVGFactory;
  svg: InulaSVGFactory;
  switch: InulaSVGFactory;
  symbol: InulaSVGFactory;
  text: InulaSVGFactory;
  textPath: InulaSVGFactory;
  tspan: InulaSVGFactory;
  use: InulaSVGFactory;
}

interface InulaSVGFactory extends DOMFactory<SVGAttributes<SVGElement>, SVGElement> {
  (props?: (ClassAttributes<SVGElement> & SVGAttributes<SVGElement>) | null, ...children: InulaNode[]): InulaSVGElement;
}

export interface DetailedInulaHTMLElement<P extends HTMLAttributes<T>, T extends HTMLElement> extends DOMElement<P, T> {
  type: keyof BaseElement;
}

export interface InulaHTML {
  a: InulaHTMLFactory<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
  abbr: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  address: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  area: InulaHTMLFactory<AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>;
  article: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  aside: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  audio: InulaHTMLFactory<AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>;
  b: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  base: InulaHTMLFactory<BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>;
  bdi: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  bdo: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  big: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  blockquote: InulaHTMLFactory<BlockquoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
  body: InulaHTMLFactory<HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>;
  br: InulaHTMLFactory<HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
  button: InulaHTMLFactory<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
  canvas: InulaHTMLFactory<CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
  caption: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  cite: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  code: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  col: InulaHTMLFactory<ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
  colgroup: InulaHTMLFactory<ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
  data: InulaHTMLFactory<DataHTMLAttributes<HTMLDataElement>, HTMLDataElement>;
  datalist: InulaHTMLFactory<HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>;
  dd: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  del: InulaHTMLFactory<DelHTMLAttributes<HTMLModElement>, HTMLModElement>;
  details: InulaHTMLFactory<DetailsHTMLAttributes<HTMLDetailsElement>, HTMLDetailsElement>;
  dfn: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  dialog: InulaHTMLFactory<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>;
  div: InulaHTMLFactory<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
  dl: InulaHTMLFactory<HTMLAttributes<HTMLDListElement>, HTMLDListElement>;
  dt: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  em: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  embed: InulaHTMLFactory<EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>;
  fieldset: InulaHTMLFactory<FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>;
  figcaption: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  figure: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  footer: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  form: InulaHTMLFactory<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
  h1: InulaHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h2: InulaHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h3: InulaHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h4: InulaHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h5: InulaHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h6: InulaHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  head: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLHeadElement>;
  header: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  hgroup: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  hr: InulaHTMLFactory<HTMLAttributes<HTMLHRElement>, HTMLHRElement>;
  html: InulaHTMLFactory<HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>;
  i: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  iframe: InulaHTMLFactory<IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;
  img: InulaHTMLFactory<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
  input: InulaHTMLFactory<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
  ins: InulaHTMLFactory<InsHTMLAttributes<HTMLModElement>, HTMLModElement>;
  kbd: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  keygen: InulaHTMLFactory<KeygenHTMLAttributes<HTMLElement>, HTMLElement>;
  label: InulaHTMLFactory<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
  legend: InulaHTMLFactory<HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>;
  li: InulaHTMLFactory<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
  link: InulaHTMLFactory<LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>;
  main: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  map: InulaHTMLFactory<MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>;
  mark: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  menu: InulaHTMLFactory<MenuHTMLAttributes<HTMLElement>, HTMLElement>;
  menuitem: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  meta: InulaHTMLFactory<MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>;
  meter: InulaHTMLFactory<MeterHTMLAttributes<HTMLMeterElement>, HTMLMeterElement>;
  nav: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  noscript: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  object: InulaHTMLFactory<ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>;
  ol: InulaHTMLFactory<OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
  optgroup: InulaHTMLFactory<OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>;
  option: InulaHTMLFactory<OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
  output: InulaHTMLFactory<OutputHTMLAttributes<HTMLOutputElement>, HTMLOutputElement>;
  p: InulaHTMLFactory<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
  param: InulaHTMLFactory<ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>;
  picture: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  pre: InulaHTMLFactory<HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
  progress: InulaHTMLFactory<ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>;
  q: InulaHTMLFactory<QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
  rp: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  rt: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  ruby: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  s: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  samp: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  slot: InulaHTMLFactory<SlotHTMLAttributes<HTMLSlotElement>, HTMLSlotElement>;
  script: InulaHTMLFactory<ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>;
  section: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  select: InulaHTMLFactory<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
  small: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  source: InulaHTMLFactory<SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>;
  span: InulaHTMLFactory<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
  strong: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  style: InulaHTMLFactory<StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>;
  sub: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  summary: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  sup: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  table: InulaHTMLFactory<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
  template: InulaHTMLFactory<HTMLAttributes<HTMLTemplateElement>, HTMLTemplateElement>;
  tbody: InulaHTMLFactory<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  td: InulaHTMLFactory<TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
  textarea: InulaHTMLFactory<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
  tfoot: InulaHTMLFactory<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  th: InulaHTMLFactory<ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
  thead: InulaHTMLFactory<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  time: InulaHTMLFactory<TimeHTMLAttributes<HTMLTimeElement>, HTMLTimeElement>;
  title: InulaHTMLFactory<HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>;
  tr: InulaHTMLFactory<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
  track: InulaHTMLFactory<TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>;
  u: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  ul: InulaHTMLFactory<HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
  var: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  video: InulaHTMLFactory<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
  wbr: InulaHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  webview: InulaHTMLFactory<WebViewHTMLAttributes<HTMLElement>, HTMLElement>;
}

export type InulaHTMLProps<E extends HTMLAttributes<T>, T> = ClassAttributes<T> & E;

export type ForRenderFunction<T> = (item: T, index: number) => InulaNode;

export interface IfElement {
  cond: boolean;
  children?: InulaNode;
}

export interface ElseIfElement {
  cond: boolean;
  children?: InulaNode;
}

export interface ElseElement {
  children?: InulaNode;
}

export interface ForElement<T> {
  each: Array<T>;
  children: ForRenderFunction<T>;
}

interface InulaTemplateElement {
  if: IfElement;
  'else-if': ElseIfElement;
  else: ElseElement;
  for: ForElement<any>;
}

export interface BaseElement extends InulaTemplateElement {
  // HTML
  a: InulaHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
  abbr: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  address: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  area: InulaHTMLProps<AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>;
  article: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  aside: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  audio: InulaHTMLProps<AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>;
  b: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  base: InulaHTMLProps<BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>;
  bdi: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  bdo: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  big: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  blockquote: InulaHTMLProps<BlockquoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
  body: InulaHTMLProps<HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>;
  br: InulaHTMLProps<HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
  button: InulaHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
  canvas: InulaHTMLProps<CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
  caption: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  cite: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  code: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  col: InulaHTMLProps<ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
  colgroup: InulaHTMLProps<ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
  data: InulaHTMLProps<DataHTMLAttributes<HTMLDataElement>, HTMLDataElement>;
  datalist: InulaHTMLProps<HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>;
  dd: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  del: InulaHTMLProps<DelHTMLAttributes<HTMLModElement>, HTMLModElement>;
  details: InulaHTMLProps<DetailsHTMLAttributes<HTMLDetailsElement>, HTMLDetailsElement>;
  dfn: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  dialog: InulaHTMLProps<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>;
  div: InulaHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
  dl: InulaHTMLProps<HTMLAttributes<HTMLDListElement>, HTMLDListElement>;
  dt: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  em: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  embed: InulaHTMLProps<EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>;
  fieldset: InulaHTMLProps<FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>;
  figcaption: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  figure: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  footer: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  form: InulaHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
  h1: InulaHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h2: InulaHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h3: InulaHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h4: InulaHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h5: InulaHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h6: InulaHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  head: InulaHTMLProps<HTMLAttributes<HTMLHeadElement>, HTMLHeadElement>;
  header: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  hgroup: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  hr: InulaHTMLProps<HTMLAttributes<HTMLHRElement>, HTMLHRElement>;
  html: InulaHTMLProps<HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>;
  i: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  iframe: InulaHTMLProps<IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;
  img: InulaHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
  input: InulaHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
  ins: InulaHTMLProps<InsHTMLAttributes<HTMLModElement>, HTMLModElement>;
  kbd: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  keygen: InulaHTMLProps<KeygenHTMLAttributes<HTMLElement>, HTMLElement>;
  label: InulaHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
  legend: InulaHTMLProps<HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>;
  li: InulaHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
  link: InulaHTMLProps<LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>;
  main: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  map: InulaHTMLProps<MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>;
  mark: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  menu: InulaHTMLProps<MenuHTMLAttributes<HTMLElement>, HTMLElement>;
  menuitem: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  meta: InulaHTMLProps<MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>;
  meter: InulaHTMLProps<MeterHTMLAttributes<HTMLMeterElement>, HTMLMeterElement>;
  nav: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  noindex: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  noscript: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  object: InulaHTMLProps<ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>;
  ol: InulaHTMLProps<OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
  optgroup: InulaHTMLProps<OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>;
  option: InulaHTMLProps<OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
  output: InulaHTMLProps<OutputHTMLAttributes<HTMLOutputElement>, HTMLOutputElement>;
  p: InulaHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
  param: InulaHTMLProps<ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>;
  picture: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  pre: InulaHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
  progress: InulaHTMLProps<ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>;
  q: InulaHTMLProps<QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
  rp: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  rt: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  ruby: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  s: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  samp: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  slot: InulaHTMLProps<SlotHTMLAttributes<HTMLSlotElement>, HTMLSlotElement>;
  script: InulaHTMLProps<ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>;
  section: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  select: InulaHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
  small: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  source: InulaHTMLProps<SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>;
  span: InulaHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
  strong: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  style: InulaHTMLProps<StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>;
  sub: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  summary: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  sup: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  table: InulaHTMLProps<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
  template: InulaHTMLProps<HTMLAttributes<HTMLTemplateElement>, HTMLTemplateElement>;
  tbody: InulaHTMLProps<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  td: InulaHTMLProps<TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
  textarea: InulaHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
  tfoot: InulaHTMLProps<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  th: InulaHTMLProps<ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
  thead: InulaHTMLProps<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  time: InulaHTMLProps<TimeHTMLAttributes<HTMLTimeElement>, HTMLTimeElement>;
  title: InulaHTMLProps<HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>;
  tr: InulaHTMLProps<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
  track: InulaHTMLProps<TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>;
  u: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  ul: InulaHTMLProps<HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
  var: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  video: InulaHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
  wbr: InulaHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  webview: InulaHTMLProps<WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement>;

  // SVG
  svg: InulaSVGProps<SVGSVGElement>;

  animate: InulaSVGProps<SVGElement>;
  animateMotion: InulaSVGProps<SVGElement>;
  animateTransform: InulaSVGProps<SVGElement>;
  circle: InulaSVGProps<SVGCircleElement>;
  clipPath: InulaSVGProps<SVGClipPathElement>;
  defs: InulaSVGProps<SVGDefsElement>;
  desc: InulaSVGProps<SVGDescElement>;
  ellipse: InulaSVGProps<SVGEllipseElement>;
  feBlend: InulaSVGProps<SVGFEBlendElement>;
  feColorMatrix: InulaSVGProps<SVGFEColorMatrixElement>;
  feComponentTransfer: InulaSVGProps<SVGFEComponentTransferElement>;
  feComposite: InulaSVGProps<SVGFECompositeElement>;
  feConvolveMatrix: InulaSVGProps<SVGFEConvolveMatrixElement>;
  feDiffuseLighting: InulaSVGProps<SVGFEDiffuseLightingElement>;
  feDisplacementMap: InulaSVGProps<SVGFEDisplacementMapElement>;
  feDistantLight: InulaSVGProps<SVGFEDistantLightElement>;
  feDropShadow: InulaSVGProps<SVGFEDropShadowElement>;
  feFlood: InulaSVGProps<SVGFEFloodElement>;
  feFuncA: InulaSVGProps<SVGFEFuncAElement>;
  feFuncB: InulaSVGProps<SVGFEFuncBElement>;
  feFuncG: InulaSVGProps<SVGFEFuncGElement>;
  feFuncR: InulaSVGProps<SVGFEFuncRElement>;
  feGaussianBlur: InulaSVGProps<SVGFEGaussianBlurElement>;
  feImage: InulaSVGProps<SVGFEImageElement>;
  feMerge: InulaSVGProps<SVGFEMergeElement>;
  feMergeNode: InulaSVGProps<SVGFEMergeNodeElement>;
  feMorphology: InulaSVGProps<SVGFEMorphologyElement>;
  feOffset: InulaSVGProps<SVGFEOffsetElement>;
  fePointLight: InulaSVGProps<SVGFEPointLightElement>;
  feSpecularLighting: InulaSVGProps<SVGFESpecularLightingElement>;
  feSpotLight: InulaSVGProps<SVGFESpotLightElement>;
  feTile: InulaSVGProps<SVGFETileElement>;
  feTurbulence: InulaSVGProps<SVGFETurbulenceElement>;
  filter: InulaSVGProps<SVGFilterElement>;
  foreignObject: InulaSVGProps<SVGForeignObjectElement>;
  g: InulaSVGProps<SVGGElement>;
  image: InulaSVGProps<SVGImageElement>;
  line: InulaSVGProps<SVGLineElement>;
  linearGradient: InulaSVGProps<SVGLinearGradientElement>;
  marker: InulaSVGProps<SVGMarkerElement>;
  mask: InulaSVGProps<SVGMaskElement>;
  metadata: InulaSVGProps<SVGMetadataElement>;
  mpath: InulaSVGProps<SVGElement>;
  path: InulaSVGProps<SVGPathElement>;
  pattern: InulaSVGProps<SVGPatternElement>;
  polygon: InulaSVGProps<SVGPolygonElement>;
  polyline: InulaSVGProps<SVGPolylineElement>;
  radialGradient: InulaSVGProps<SVGRadialGradientElement>;
  rect: InulaSVGProps<SVGRectElement>;
  stop: InulaSVGProps<SVGStopElement>;
  switch: InulaSVGProps<SVGSwitchElement>;
  symbol: InulaSVGProps<SVGSymbolElement>;
  text: InulaSVGProps<SVGTextElement>;
  textPath: InulaSVGProps<SVGTextPathElement>;
  tspan: InulaSVGProps<SVGTSpanElement>;
  use: InulaSVGProps<SVGUseElement>;
  view: InulaSVGProps<SVGViewElement>;
}

export type Key = string | number;

export type Attributes = {
  key?: Key | null | undefined;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type KVObject = {};

export interface InulaElement<
  P = any,
  T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>,
> {
  type: T;
  props: P;
  key: Key | null;
}
export type JSXElementConstructor<P> = (props: P) => InulaElement<any, any> | null;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicAttributes extends Attributes {}
    interface Element extends InulaElement<any, any> {}

    interface ElementClass {
      (props: any): InulaNode;
    }

    interface ElementAttributesProperty {
      props: KVObject;
    }
    interface ElementChildrenAttribute {
      children: KVObject;
    }
    interface IntrinsicClassAttributes<T> extends ClassAttributes<T> {}

    type IntrinsicElements = BaseElement;
  }
}
function For() {}

export type { JSX };
