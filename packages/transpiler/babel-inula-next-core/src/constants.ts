import { IRStmt, RestPropStmt, SinglePropStmt, WholePropStmt } from './analyze/types';

export const COMPONENT = 'Component';
export const HOOK = 'Hook';
export const WILL_MOUNT = 'willMount';
export const DID_MOUNT = 'didMount';
export const WILL_UNMOUNT = 'willUnmount';
export const DID_UNMOUNT = 'didUnmount';

export const WATCH = 'watch';

export const CURRENT_COMPONENT = '$$self';
export enum PropType {
  REST = 'restProp',
  SINGLE = 'singleProp',
  WHOLE = 'wholeProp',
}

export function isPropStmt(stmt: IRStmt): stmt is SinglePropStmt | WholePropStmt | RestPropStmt {
  return (Object.values(PropType) as string[]).includes(stmt.type);
}

export const reactivityFuncNames = [
  // ---- Array
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
  // ---- Set
  'add',
  'delete',
  'clear',
  // ---- Map
  'set',
  'delete',
  'clear',
];

// --- api for users
export const USE_CONTEXT = 'useContext';
// --- api for compiler
const API_NAMES = [
  'createElement',
  'setStyle',
  'setDataset',
  'setEvent',
  'delegateEvent',
  'setHTMLProp',
  'setHTMLAttr',
  'setHTMLProps',
  'setHTMLAttrs',
  'createTextNode',
  'updateText',
  'insertNode',
  'appendNode',
  'render',
  'notCached',
  'useHook',
  'createHook',
  'untrack',
  'runOnce',
  'createNode',
  'updateNode',
  'updateChildren',
  'setProp',
  'setRef',
  'initContextChildren',
  'initCompNode',
  'emitUpdate',
  'compBuilder',
  'hookBuilder',
  'createCompNode',
  'createHTMLNode',
  'createFragmentNode',
  'createForNode',
  'createConditionalNode',
  'templateGetElement',
  'createTemplateNode',
  'createTextNode',
  'createExpNode',
  'createContextNode',
  'setText',
  'withDefault',
  'useContext',
  'createChildren',
  'setHTMLAttrs',
] as const;

export const originalImportMap = Object.fromEntries(API_NAMES.map(name => [name, `$$${name}`])) as ImportMapType;

// 生成 ImportMap 类型
export type ImportMapType = {
  readonly [K in (typeof API_NAMES)[number]]: string;
};

const accessedKeys = new Set<string>();

export const importMap: ImportMapType = new Proxy(originalImportMap, {
  get(target, prop: string, receiver) {
    accessedKeys.add(prop);
    return Reflect.get(target, prop, receiver);
  },
});

// 函数用于获取被访问过的键
export function getAccessedKeys() {
  return Array.from(accessedKeys).reduce<Record<string, string>>((map, key) => {
    map[key] = (originalImportMap as Record<string, string>)[key];
    return map;
  }, {});
}

// 函数用于重置访问记录
export function resetAccessedKeys() {
  accessedKeys.clear();
}

export const alterAttributeMap = {
  class: 'className',
  for: 'htmlFor',
};

/**
 * @brief HTML internal attribute map, can be accessed as js property
 */
export const defaultAttributeMap = {
  // ---- Other property as attribute
  textContent: ['*'],
  innerHTML: ['*'],
  // ---- Source: https://developer.mozilla.org/zh-CN/docs/Web/HTML/Attributes
  accept: ['form', 'input'],
  // ---- Original: accept-charset
  acceptCharset: ['form'],
  accesskey: ['*'],
  action: ['form'],
  align: ['caption', 'col', 'colgroup', 'hr', 'iframe', 'img', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr'],
  allow: ['iframe'],
  alt: ['area', 'img', 'input'],
  async: ['script'],
  autocapitalize: ['*'],
  autocomplete: ['form', 'input', 'select', 'textarea'],
  autofocus: ['button', 'input', 'select', 'textarea'],
  autoplay: ['audio', 'video'],
  background: ['body', 'table', 'td', 'th'],
  // ---- Original: base
  bgColor: ['body', 'col', 'colgroup', 'marquee', 'table', 'tbody', 'tfoot', 'td', 'th', 'tr'],
  border: ['img', 'object', 'table'],
  buffered: ['audio', 'video'],
  capture: ['input'],
  charset: ['meta'],
  checked: ['input'],
  cite: ['blockquote', 'del', 'ins', 'q'],
  className: ['*'],
  color: ['font', 'hr'],
  cols: ['textarea'],
  // ---- Original: colspan
  colSpan: ['td', 'th'],
  content: ['meta'],
  // ---- Original: contenteditable
  contentEditable: ['*'],
  contextmenu: ['*'],
  controls: ['audio', 'video'],
  coords: ['area'],
  crossOrigin: ['audio', 'img', 'link', 'script', 'video'],
  csp: ['iframe'],
  data: ['object'],
  // ---- Original: datetime
  dateTime: ['del', 'ins', 'time'],
  decoding: ['img'],
  default: ['track'],
  defer: ['script'],
  dir: ['*'],
  dirname: ['input', 'textarea'],
  disabled: ['button', 'fieldset', 'input', 'optgroup', 'option', 'select', 'textarea'],
  download: ['a', 'area'],
  draggable: ['*'],
  enctype: ['form'],
  // ---- Original: enterkeyhint
  enterKeyHint: ['textarea', 'contenteditable'],
  htmlFor: ['label', 'output'],
  form: ['button', 'fieldset', 'input', 'label', 'meter', 'object', 'output', 'progress', 'select', 'textarea'],
  // ---- Original: formaction
  formAction: ['input', 'button'],
  // ---- Original: formenctype
  formEnctype: ['button', 'input'],
  // ---- Original: formmethod
  formMethod: ['button', 'input'],
  // ---- Original: formnovalidate
  formNoValidate: ['button', 'input'],
  // ---- Original: formtarget
  formTarget: ['button', 'input'],
  headers: ['td', 'th'],
  height: ['canvas', 'embed', 'iframe', 'img', 'input', 'object', 'video'],
  hidden: ['*'],
  high: ['meter'],
  href: ['a', 'area', 'base', 'link'],
  hreflang: ['a', 'link'],
  // ---- Original: http-equiv
  httpEquiv: ['meta'],
  id: ['*'],
  integrity: ['link', 'script'],
  // ---- Original: intrinsicsize
  intrinsicSize: ['img'],
  // ---- Original: inputmode
  inputMode: ['textarea', 'contenteditable'],
  ismap: ['img'],
  // ---- Original: itemprop
  itemProp: ['*'],
  kind: ['track'],
  label: ['optgroup', 'option', 'track'],
  lang: ['*'],
  language: ['script'],
  loading: ['img', 'iframe'],
  list: ['input'],
  loop: ['audio', 'marquee', 'video'],
  low: ['meter'],
  manifest: ['html'],
  max: ['input', 'meter', 'progress'],
  // ---- Original: maxlength
  maxLength: ['input', 'textarea'],
  // ---- Original: minlength
  minLength: ['input', 'textarea'],
  media: ['a', 'area', 'link', 'source', 'style'],
  method: ['form'],
  min: ['input', 'meter'],
  multiple: ['input', 'select'],
  muted: ['audio', 'video'],
  name: [
    'button',
    'form',
    'fieldset',
    'iframe',
    'input',
    'object',
    'output',
    'select',
    'textarea',
    'map',
    'meta',
    'param',
  ],
  // ---- Original: novalidate
  noValidate: ['form'],
  open: ['details', 'dialog'],
  optimum: ['meter'],
  pattern: ['input'],
  ping: ['a', 'area'],
  placeholder: ['input', 'textarea'],
  // ---- Original: playsinline
  playsInline: ['video'],
  poster: ['video'],
  preload: ['audio', 'video'],
  readonly: ['input', 'textarea'],
  // ---- Original: referrerpolicy
  referrerPolicy: ['a', 'area', 'iframe', 'img', 'link', 'script'],
  rel: ['a', 'area', 'link'],
  required: ['input', 'select', 'textarea'],
  reversed: ['ol'],
  role: ['*'],
  rows: ['textarea'],
  // ---- Original: rowspan
  rowSpan: ['td', 'th'],
  sandbox: ['iframe'],
  scope: ['th'],
  scoped: ['style'],
  selected: ['option'],
  shape: ['a', 'area'],
  size: ['input', 'select'],
  sizes: ['link', 'img', 'source'],
  slot: ['*'],
  span: ['col', 'colgroup'],
  spellcheck: ['*'],
  src: ['audio', 'embed', 'iframe', 'img', 'input', 'script', 'source', 'track', 'video'],
  srcdoc: ['iframe'],
  srclang: ['track'],
  srcset: ['img', 'source'],
  start: ['ol'],
  step: ['input'],
  style: ['*'],
  summary: ['table'],
  // ---- Original: tabindex
  tabIndex: ['*'],
  target: ['a', 'area', 'base', 'form'],
  title: ['*'],
  translate: ['*'],
  type: ['button', 'input', 'embed', 'object', 'ol', 'script', 'source', 'style', 'menu', 'link'],
  usemap: ['img', 'input', 'object'],
  value: ['button', 'data', 'input', 'li', 'meter', 'option', 'progress', 'param', 'text' /** extra for TextNode */],
  width: ['canvas', 'embed', 'iframe', 'img', 'input', 'object', 'video'],
  wrap: ['textarea'],
  // --- ARIA attributes
  //     Source: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes
  ariaAutocomplete: ['*'],
  ariaChecked: ['*'],
  ariaDisabled: ['*'],
  ariaErrorMessage: ['*'],
  ariaExpanded: ['*'],
  ariaHasPopup: ['*'],
  ariaHidden: ['*'],
  ariaInvalid: ['*'],
  ariaLabel: ['*'],
  ariaLevel: ['*'],
  ariaModal: ['*'],
  ariaMultiline: ['*'],
  ariaMultiSelectable: ['*'],
  ariaOrientation: ['*'],
  ariaPlaceholder: ['*'],
  ariaPressed: ['*'],
  ariaReadonly: ['*'],
  ariaRequired: ['*'],
  ariaSelected: ['*'],
  ariaSort: ['*'],
  ariaValuemax: ['*'],
  ariaValuemin: ['*'],
  ariaValueNow: ['*'],
  ariaValueText: ['*'],
  ariaBusy: ['*'],
  ariaLive: ['*'],
  ariaRelevant: ['*'],
  ariaAtomic: ['*'],
  ariaDropEffect: ['*'],
  ariaGrabbed: ['*'],
  ariaActiveDescendant: ['*'],
  ariaColCount: ['*'],
  ariaColIndex: ['*'],
  ariaColSpan: ['*'],
  ariaControls: ['*'],
  ariaDescribedBy: ['*'],
  ariaDescription: ['*'],
  ariaDetails: ['*'],
  ariaFlowTo: ['*'],
  ariaLabelledBy: ['*'],
  ariaOwns: ['*'],
  ariaPosInset: ['*'],
  ariaRowCount: ['*'],
  ariaRowIndex: ['*'],
  ariaRowSpan: ['*'],
  ariaSetSize: ['*'],
};

export const defaultHTMLTags = [
  'a',
  'abbr',
  'address',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'base',
  'bdi',
  'bdo',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'col',
  'colgroup',
  'data',
  'datalist',
  'dd',
  'del',
  'details',
  'dfn',
  'dialog',
  'div',
  'dl',
  'dt',
  'em',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hgroup',
  'hr',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'link',
  'main',
  'map',
  'mark',
  'menu',
  'meta',
  'meter',
  'nav',
  'noscript',
  'object',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'picture',
  'pre',
  'progress',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'script',
  'section',
  'select',
  'slot',
  'small',
  'source',
  'span',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'template',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'title',
  'tr',
  'track',
  'u',
  'ul',
  'var',
  'video',
  'wbr',
  'acronym',
  'applet',
  'basefont',
  'bgsound',
  'big',
  'blink',
  'center',
  'dir',
  'font',
  'frame',
  'frameset',
  'isindex',
  'keygen',
  'listing',
  'marquee',
  'menuitem',
  'multicol',
  'nextid',
  'nobr',
  'noembed',
  'noframes',
  'param',
  'plaintext',
  'rb',
  'rtc',
  'spacer',
  'strike',
  'tt',
  'xmp',
  'animate',
  'animateMotion',
  'animateTransform',
  'circle',
  'clipPath',
  'defs',
  'desc',
  'ellipse',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feDistantLight',
  'feDropShadow',
  'feFlood',
  'feFuncA',
  'feFuncB',
  'feFuncG',
  'feFuncR',
  'feGaussianBlur',
  'feImage',
  'feMerge',
  'feMergeNode',
  'feMorphology',
  'feOffset',
  'fePointLight',
  'feSpecularLighting',
  'feSpotLight',
  'feTile',
  'feTurbulence',
  'filter',
  'foreignObject',
  'g',
  'image',
  'line',
  'linearGradient',
  'marker',
  'mask',
  'metadata',
  'mpath',
  'path',
  'pattern',
  'polygon',
  'polyline',
  'radialGradient',
  'rect',
  'set',
  'stop',
  'svg',
  'switch',
  'symbol',
  'text',
  'textPath',
  'tspan',
  'use',
  'view',
];
export const PROP_SUFFIX = '_$p$_';
export const HOOK_SUFFIX = '_$h$_';
// The suffix means to bind to context specific key
export const SPECIFIC_CTX_SUFFIX = '_$c$_';
// The suffix means to bind to whole context
export const WHOLE_CTX_SUFFIX = '_$ctx$_';
export const builtinHooks = ['useContext'];
export const HOOK_USING_PREFIX = 'use';
