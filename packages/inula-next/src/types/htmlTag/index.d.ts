import type { InulaNextGlobalEventHandlers } from './event';
import type { OmitIndexSignature, HTMLAttributes } from './htmlElement';

// ---- If there is an event(start with on), remove it
export type PropertyWithEvent<G> = Omit<
  G,
  {
    [K in keyof G]: K extends `on${string}` ? K : never;
  }[keyof G]
> &
  InulaNextGlobalEventHandlers;

interface InulaNextHtmlProps<El> {
  ref: El | ((holder: El) => void) | undefined;
  prop: Record<string, string | number | boolean>;
  attr: Record<string, string>;
  dataset: Record<string, string>;
  forwardProps: true | undefined;
  willMount: (el: El) => void;
  didMount: (el: El) => void;
  willUnmount: (el: El) => void;
  didUnmount: (el: El) => void;
  didUpdate: <T>(el: El, key: string, prevValue: T, currValue: T) => void;
}

export type InulaNextHTMLAttributes<T, G, El> = InulaNextHtmlProps<El> & HTMLAttributes<T> & G;

export type InulaNextHTMLAttributesFunc<T, G, El> = {
  [K in keyof InulaNextHTMLAttributes<T, G, El>]: (
    value?: InulaNextHTMLAttributes<T, G, El>[K]
  ) => Omit<InulaNextHTMLAttributesFunc<T, G, El>, K>;
};

export type InulaNextHtmlTagFunc<T = HTMLElement, G = object> = (
  innerText?: string | number | ((View: never) => void)
) => InulaNextHTMLAttributesFunc<PropertyWithEvent<OmitIndexSignature<T>>, G, T>;

export const a: InulaNextHtmlTagFunc<HTMLAnchorElement>;
export const abbr: InulaNextHtmlTagFunc;
export const address: InulaNextHtmlTagFunc;
export const area: InulaNextHtmlTagFunc<HTMLAreaElement>;
export const article: InulaNextHtmlTagFunc;
export const aside: InulaNextHtmlTagFunc;
export const audio: InulaNextHtmlTagFunc<HTMLAudioElement>;
export const b: InulaNextHtmlTagFunc;
export const base: InulaNextHtmlTagFunc<HTMLBaseElement>;
export const bdi: InulaNextHtmlTagFunc;
export const bdo: InulaNextHtmlTagFunc;
export const blockquote: InulaNextHtmlTagFunc<HTMLQuoteElement>;
export const body: InulaNextHtmlTagFunc<HTMLBodyElement>;
export const br: InulaNextHtmlTagFunc<HTMLBRElement>;
export const button: InulaNextHtmlTagFunc<HTMLButtonElement>;
export const canvas: InulaNextHtmlTagFunc<HTMLCanvasElement>;
export const caption: InulaNextHtmlTagFunc<HTMLTableCaptionElement>;
export const cite: InulaNextHtmlTagFunc;
export const code: InulaNextHtmlTagFunc;
export const col: InulaNextHtmlTagFunc<HTMLTableColElement>;
export const colgroup: InulaNextHtmlTagFunc<HTMLTableColElement>;
export const data: InulaNextHtmlTagFunc<HTMLDataElement>;
export const datalist: InulaNextHtmlTagFunc<HTMLDataListElement>;
export const dd: InulaNextHtmlTagFunc;
export const del: InulaNextHtmlTagFunc<HTMLModElement>;
export const details: InulaNextHtmlTagFunc<HTMLDetailsElement>;
export const dfn: InulaNextHtmlTagFunc;
export const dialog: InulaNextHtmlTagFunc<HTMLDialogElement>;
export const div: InulaNextHtmlTagFunc<HTMLDivElement>;
export const dl: InulaNextHtmlTagFunc<HTMLDListElement>;
export const dt: InulaNextHtmlTagFunc;
export const em: InulaNextHtmlTagFunc;
export const embed: InulaNextHtmlTagFunc<HTMLEmbedElement>;
export const fieldset: InulaNextHtmlTagFunc<HTMLFieldSetElement>;
export const figcaption: InulaNextHtmlTagFunc;
export const figure: InulaNextHtmlTagFunc;
export const footer: InulaNextHtmlTagFunc;
export const form: InulaNextHtmlTagFunc<HTMLFormElement>;
export const h1: InulaNextHtmlTagFunc<HTMLHeadingElement>;
export const h2: InulaNextHtmlTagFunc<HTMLHeadingElement>;
export const h3: InulaNextHtmlTagFunc<HTMLHeadingElement>;
export const h4: InulaNextHtmlTagFunc<HTMLHeadingElement>;
export const h5: InulaNextHtmlTagFunc<HTMLHeadingElement>;
export const h6: InulaNextHtmlTagFunc<HTMLHeadingElement>;
export const head: InulaNextHtmlTagFunc<HTMLHeadElement>;
export const header: InulaNextHtmlTagFunc;
export const hgroup: InulaNextHtmlTagFunc;
export const hr: InulaNextHtmlTagFunc<HTMLHRElement>;
export const html: InulaNextHtmlTagFunc<HTMLHtmlElement>;
export const i: InulaNextHtmlTagFunc;
export const iframe: InulaNextHtmlTagFunc<HTMLIFrameElement>;
export const img: InulaNextHtmlTagFunc<HTMLImageElement>;
export const input: InulaNextHtmlTagFunc<HTMLInputElement>;
export const ins: InulaNextHtmlTagFunc<HTMLModElement>;
export const kbd: InulaNextHtmlTagFunc;
export const label: InulaNextHtmlTagFunc<HTMLLabelElement>;
export const legend: InulaNextHtmlTagFunc<HTMLLegendElement>;
export const li: InulaNextHtmlTagFunc<HTMLLIElement>;
export const link: InulaNextHtmlTagFunc<HTMLLinkElement>;
export const main: InulaNextHtmlTagFunc;
export const map: InulaNextHtmlTagFunc<HTMLMapElement>;
export const mark: InulaNextHtmlTagFunc;
export const menu: InulaNextHtmlTagFunc<HTMLMenuElement>;
export const meta: InulaNextHtmlTagFunc<HTMLMetaElement>;
export const meter: InulaNextHtmlTagFunc<HTMLMeterElement>;
export const nav: InulaNextHtmlTagFunc;
export const noscript: InulaNextHtmlTagFunc;
export const object: InulaNextHtmlTagFunc<HTMLObjectElement>;
export const ol: InulaNextHtmlTagFunc<HTMLOListElement>;
export const optgroup: InulaNextHtmlTagFunc<HTMLOptGroupElement>;
export const option: InulaNextHtmlTagFunc<HTMLOptionElement>;
export const output: InulaNextHtmlTagFunc<HTMLOutputElement>;
export const p: InulaNextHtmlTagFunc<HTMLParagraphElement>;
export const picture: InulaNextHtmlTagFunc<HTMLPictureElement>;
export const pre: InulaNextHtmlTagFunc<HTMLPreElement>;
export const progress: InulaNextHtmlTagFunc<HTMLProgressElement>;
export const q: InulaNextHtmlTagFunc<HTMLQuoteElement>;
export const rp: InulaNextHtmlTagFunc;
export const rt: InulaNextHtmlTagFunc;
export const ruby: InulaNextHtmlTagFunc;
export const s: InulaNextHtmlTagFunc;
export const samp: InulaNextHtmlTagFunc;
export const script: InulaNextHtmlTagFunc<HTMLScriptElement>;
export const section: InulaNextHtmlTagFunc;
export const select: InulaNextHtmlTagFunc<HTMLSelectElement>;
export const slot: InulaNextHtmlTagFunc<HTMLSlotElement>;
export const small: InulaNextHtmlTagFunc;
export const source: InulaNextHtmlTagFunc<HTMLSourceElement>;
export const span: InulaNextHtmlTagFunc<HTMLSpanElement>;
export const strong: InulaNextHtmlTagFunc;
export const style: InulaNextHtmlTagFunc<HTMLStyleElement>;
export const sub: InulaNextHtmlTagFunc;
export const summary: InulaNextHtmlTagFunc;
export const sup: InulaNextHtmlTagFunc;
export const table: InulaNextHtmlTagFunc<HTMLTableElement>;
export const tbody: InulaNextHtmlTagFunc<HTMLTableSectionElement>;
export const td: InulaNextHtmlTagFunc<HTMLTableCellElement>;
export const template: InulaNextHtmlTagFunc<HTMLTemplateElement>;
export const textarea: InulaNextHtmlTagFunc<HTMLTextAreaElement>;
export const tfoot: InulaNextHtmlTagFunc<HTMLTableSectionElement>;
export const th: InulaNextHtmlTagFunc<HTMLTableCellElement>;
export const thead: InulaNextHtmlTagFunc<HTMLTableSectionElement>;
export const time: InulaNextHtmlTagFunc<HTMLTimeElement>;
export const title: InulaNextHtmlTagFunc<HTMLTitleElement>;
export const tr: InulaNextHtmlTagFunc<HTMLTableRowElement>;
export const track: InulaNextHtmlTagFunc<HTMLTrackElement>;
export const u: InulaNextHtmlTagFunc;
export const ul: InulaNextHtmlTagFunc<HTMLUListElement>;
export const var_: InulaNextHtmlTagFunc;
export const video: InulaNextHtmlTagFunc<HTMLVideoElement>;
export const wbr: InulaNextHtmlTagFunc;
export const acronym: InulaNextHtmlTagFunc;
export const applet: InulaNextHtmlTagFunc<HTMLUnknownElement>;
export const basefont: InulaNextHtmlTagFunc;
export const bgsound: InulaNextHtmlTagFunc<HTMLUnknownElement>;
export const big: InulaNextHtmlTagFunc;
export const blink: InulaNextHtmlTagFunc<HTMLUnknownElement>;
export const center: InulaNextHtmlTagFunc;
export const dir: InulaNextHtmlTagFunc<HTMLDirectoryElement>;
export const font: InulaNextHtmlTagFunc<HTMLFontElement>;
export const frame: InulaNextHtmlTagFunc<HTMLFrameElement>;
export const frameset: InulaNextHtmlTagFunc<HTMLFrameSetElement>;
export const isindex: InulaNextHtmlTagFunc<HTMLUnknownElement>;
export const keygen: InulaNextHtmlTagFunc<HTMLUnknownElement>;
export const listing: InulaNextHtmlTagFunc<HTMLPreElement>;
export const marquee: InulaNextHtmlTagFunc<HTMLMarqueeElement>;
export const menuitem: InulaNextHtmlTagFunc;
export const multicol: InulaNextHtmlTagFunc<HTMLUnknownElement>;
export const nextid: InulaNextHtmlTagFunc<HTMLUnknownElement>;
export const nobr: InulaNextHtmlTagFunc;
export const noembed: InulaNextHtmlTagFunc;
export const noframes: InulaNextHtmlTagFunc;
export const param: InulaNextHtmlTagFunc<HTMLParamElement>;
export const plaintext: InulaNextHtmlTagFunc;
export const rb: InulaNextHtmlTagFunc;
export const rtc: InulaNextHtmlTagFunc;
export const spacer: InulaNextHtmlTagFunc<HTMLUnknownElement>;
export const strike: InulaNextHtmlTagFunc;
export const tt: InulaNextHtmlTagFunc;
export const xmp: InulaNextHtmlTagFunc<HTMLPreElement>;
export const animate: InulaNextHtmlTagFunc<SVGAnimateElement>;
export const animateMotion: InulaNextHtmlTagFunc<SVGAnimateMotionElement>;
export const animateTransform: InulaNextHtmlTagFunc<SVGAnimateTransformElement>;
export const circle: InulaNextHtmlTagFunc<SVGCircleElement>;
export const clipPath: InulaNextHtmlTagFunc<SVGClipPathElement>;
export const defs: InulaNextHtmlTagFunc<SVGDefsElement>;
export const desc: InulaNextHtmlTagFunc<SVGDescElement>;
export const ellipse: InulaNextHtmlTagFunc<SVGEllipseElement>;
export const feBlend: InulaNextHtmlTagFunc<SVGFEBlendElement>;
export const feColorMatrix: InulaNextHtmlTagFunc<SVGFEColorMatrixElement>;
export const feComponentTransfer: InulaNextHtmlTagFunc<SVGFEComponentTransferElement>;
export const feComposite: InulaNextHtmlTagFunc<SVGFECompositeElement>;
export const feConvolveMatrix: InulaNextHtmlTagFunc<SVGFEConvolveMatrixElement>;
export const feDiffuseLighting: InulaNextHtmlTagFunc<SVGFEDiffuseLightingElement>;
export const feDisplacementMap: InulaNextHtmlTagFunc<SVGFEDisplacementMapElement>;
export const feDistantLight: InulaNextHtmlTagFunc<SVGFEDistantLightElement>;
export const feDropShadow: InulaNextHtmlTagFunc<SVGFEDropShadowElement>;
export const feFlood: InulaNextHtmlTagFunc<SVGFEFloodElement>;
export const feFuncA: InulaNextHtmlTagFunc<SVGFEFuncAElement>;
export const feFuncB: InulaNextHtmlTagFunc<SVGFEFuncBElement>;
export const feFuncG: InulaNextHtmlTagFunc<SVGFEFuncGElement>;
export const feFuncR: InulaNextHtmlTagFunc<SVGFEFuncRElement>;
export const feGaussianBlur: InulaNextHtmlTagFunc<SVGFEGaussianBlurElement>;
export const feImage: InulaNextHtmlTagFunc<SVGFEImageElement>;
export const feMerge: InulaNextHtmlTagFunc<SVGFEMergeElement>;
export const feMergeNode: InulaNextHtmlTagFunc<SVGFEMergeNodeElement>;
export const feMorphology: InulaNextHtmlTagFunc<SVGFEMorphologyElement>;
export const feOffset: InulaNextHtmlTagFunc<SVGFEOffsetElement>;
export const fePointLight: InulaNextHtmlTagFunc<SVGFEPointLightElement>;
export const feSpecularLighting: InulaNextHtmlTagFunc<SVGFESpecularLightingElement>;
export const feSpotLight: InulaNextHtmlTagFunc<SVGFESpotLightElement>;
export const feTile: InulaNextHtmlTagFunc<SVGFETileElement>;
export const feTurbulence: InulaNextHtmlTagFunc<SVGFETurbulenceElement>;
export const filter: InulaNextHtmlTagFunc<SVGFilterElement>;
export const foreignObject: InulaNextHtmlTagFunc<SVGForeignObjectElement>;
export const g: InulaNextHtmlTagFunc<SVGGElement>;
export const image: InulaNextHtmlTagFunc<SVGImageElement>;
export const line: InulaNextHtmlTagFunc<SVGLineElement>;
export const linearGradient: InulaNextHtmlTagFunc<SVGLinearGradientElement>;
export const marker: InulaNextHtmlTagFunc<SVGMarkerElement>;
export const mask: InulaNextHtmlTagFunc<SVGMaskElement>;
export const metadata: InulaNextHtmlTagFunc<SVGMetadataElement>;
export const mpath: InulaNextHtmlTagFunc<SVGMPathElement>;
export const path: InulaNextHtmlTagFunc<SVGPathElement>;
export const pattern: InulaNextHtmlTagFunc<SVGPatternElement>;
export const polygon: InulaNextHtmlTagFunc<SVGPolygonElement>;
export const polyline: InulaNextHtmlTagFunc<SVGPolylineElement>;
export const radialGradient: InulaNextHtmlTagFunc<SVGRadialGradientElement>;
export const rect: InulaNextHtmlTagFunc<SVGRectElement>;
export const set: InulaNextHtmlTagFunc<SVGSetElement>;
export const stop: InulaNextHtmlTagFunc<SVGStopElement>;
export const svg: InulaNextHtmlTagFunc<SVGSVGElement>;
export const switch_: InulaNextHtmlTagFunc<SVGSwitchElement>;
export const symbol: InulaNextHtmlTagFunc<SVGSymbolElement>;
export const text: InulaNextHtmlTagFunc<SVGTextElement>;
export const textPath: InulaNextHtmlTagFunc<SVGTextPathElement>;
export const tspan: InulaNextHtmlTagFunc<SVGTSpanElement>;
export const view: InulaNextHtmlTagFunc<SVGViewElement>;
