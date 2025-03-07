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

/* eslint-disable no-sparse-arrays */

// 属性值的数据类型
export enum PROPERTY_TYPE {
  BOOLEAN, // 普通布尔类型
  STRING, // 普通的字符串类型
  SPECIAL, // 需要特殊处理的属性类型
  BOOLEAN_STR, // 字符串类型的 true false
}

export type PropDetails = {
  propName: string;
  type: PROPERTY_TYPE;
  attrName: string;
  attrNS: string | null;
};

type PropData = string | PROPERTY_TYPE | undefined | null;

function convertAttrName(attributeName: string): string {
  return attributeName.replace(/[-:]([a-z])/g, (s: string) => s[1].toUpperCase());
}

function SvgAttributes(): (string | undefined)[][] {
  const attributes: (string | undefined)[][] = [];

  // SVG 属性
  [
    'accent-height',
    'alignment-baseline',
    'arabic-form',
    'baseline-shift',
    'cap-height',
    'clip-path',
    'clip-rule',
    'color-interpolation',
    'color-interpolation-filters',
    'color-profile',
    'color-rendering',
    'dominant-baseline',
    'enable-background',
    'fill-opacity',
    'fill-rule',
    'flood-color',
    'flood-opacity',
    'font-family',
    'font-size',
    'font-size-adjust',
    'font-stretch',
    'font-style',
    'font-variant',
    'font-weight',
    'glyph-name',
    'glyph-orientation-horizontal',
    'glyph-orientation-vertical',
    'horiz-adv-x',
    'horiz-origin-x',
    'image-rendering',
    'letter-spacing',
    'lighting-color',
    'marker-end',
    'marker-mid',
    'marker-start',
    'overline-position',
    'overline-thickness',
    'paint-order',
    'panose-1',
    'pointer-events',
    'rendering-intent',
    'shape-rendering',
    'stop-color',
    'stop-opacity',
    'strikethrough-position',
    'strikethrough-thickness',
    'stroke-dasharray',
    'stroke-dashoffset',
    'stroke-linecap',
    'stroke-linejoin',
    'stroke-miterlimit',
    'stroke-opacity',
    'stroke-width',
    'text-anchor',
    'text-decoration',
    'text-rendering',
    'underline-position',
    'underline-thickness',
    'unicode-bidi',
    'unicode-range',
    'units-per-em',
    'v-alphabetic',
    'v-hanging',
    'v-ideographic',
    'v-mathematical',
    'vector-effect',
    'vert-adv-y',
    'vert-origin-x',
    'vert-origin-y',
    'word-spacing',
    'writing-mode',
    'xmlns:xlink',
    'x-height',
  ].forEach(name => {
    attributes.push([convertAttrName(name), , name]);
  });

  // xlink namespace 的 SVG 属性
  ['xlink:actuate', 'xlink:arcrole', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type'].forEach(name => {
    attributes.push([convertAttrName(name), , name, 'http://www.w3.org/1999/xlink']);
  });

  // xml namespace 的 SVG 属性
  ['xml:base', 'xml:lang', 'xml:space'].forEach(name => {
    attributes.push([convertAttrName(name), , name, 'http://www.w3.org/XML/1998/namespace']);
  });

  return attributes;
}

// 属性相关数据
// 依次为 propertyName、type、attributeName、attributeNamespace，不填则使用默认值
// type 默认 STRING
// attributeName 默认与 propertyName 相同
// attributeNamespace 默认 null
const propertiesData = [
  // 一些特殊属性
  ['children', PROPERTY_TYPE.SPECIAL],
  ['dangerouslySetInnerHTML', PROPERTY_TYPE.SPECIAL],
  ['defaultValue', PROPERTY_TYPE.SPECIAL],
  ['defaultChecked', PROPERTY_TYPE.SPECIAL],
  ['innerHTML', PROPERTY_TYPE.SPECIAL],
  ['style', PROPERTY_TYPE.SPECIAL],

  // propertyName 和 attributeName 不一样
  ['acceptCharset', , 'accept-charset'],
  ['className', , 'class'],
  ['htmlFor', , 'for'],
  ['httpEquiv', , 'http-equiv'],
  // 字符串类型的 true false
  ['contentEditable', PROPERTY_TYPE.BOOLEAN_STR, 'contenteditable'],
  ['spellCheck', PROPERTY_TYPE.BOOLEAN_STR, 'spellcheck'],
  ['draggable', PROPERTY_TYPE.BOOLEAN_STR],
  ['value', PROPERTY_TYPE.BOOLEAN_STR],
  // SVG 相关，字符串类型的 true false
  ['autoReverse', PROPERTY_TYPE.BOOLEAN_STR],
  ['externalResourcesRequired', PROPERTY_TYPE.BOOLEAN_STR],
  ['focusable', PROPERTY_TYPE.BOOLEAN_STR],
  ['preserveAlpha', PROPERTY_TYPE.BOOLEAN_STR],
  // 布尔类型
  ['allowFullScreen', PROPERTY_TYPE.BOOLEAN, 'allowfullscreen'],
  ['async', PROPERTY_TYPE.BOOLEAN],
  ['autoFocus', PROPERTY_TYPE.BOOLEAN, 'autofocus'],
  ['autoPlay', PROPERTY_TYPE.BOOLEAN, 'autoplay'],
  ['controls', PROPERTY_TYPE.BOOLEAN],
  ['default', PROPERTY_TYPE.BOOLEAN],
  ['defer', PROPERTY_TYPE.BOOLEAN],
  ['disabled', PROPERTY_TYPE.BOOLEAN],
  ['disablePictureInPicture', PROPERTY_TYPE.BOOLEAN, 'disablepictureinpicture'],
  ['disableRemotePlayback', PROPERTY_TYPE.BOOLEAN, 'disableremoteplayback'],
  ['formNoValidate', PROPERTY_TYPE.BOOLEAN, 'formnovalidate'],
  ['hidden', PROPERTY_TYPE.BOOLEAN],
  ['loop', PROPERTY_TYPE.BOOLEAN],
  ['noModule', PROPERTY_TYPE.BOOLEAN, 'nomodule'],
  ['noValidate', PROPERTY_TYPE.BOOLEAN, 'novalidate'],
  ['open', PROPERTY_TYPE.BOOLEAN],
  ['playsInline', PROPERTY_TYPE.BOOLEAN, 'playsinline'],
  ['readOnly', PROPERTY_TYPE.BOOLEAN, 'readonly'],
  ['required', PROPERTY_TYPE.BOOLEAN],
  ['reversed', PROPERTY_TYPE.BOOLEAN],
  ['scoped', PROPERTY_TYPE.BOOLEAN],
  ['seamless', PROPERTY_TYPE.BOOLEAN],
  ['itemScope', PROPERTY_TYPE.BOOLEAN, 'itemscope'],
  // 框架需要当做 property 来处理的，而不是 attribute 来处理的属性
  ['checked', PROPERTY_TYPE.BOOLEAN],
  ['multiple', PROPERTY_TYPE.BOOLEAN],
  ['muted', PROPERTY_TYPE.BOOLEAN],
  ['selected', PROPERTY_TYPE.BOOLEAN],

  // HTML and SVG 中都有的属性，大小写敏感
  ['tabIndex', , 'tabindex'],
  ['crossOrigin', , 'crossorigin'],
  // 接受 URL 的属性
  ['xlinkHref', , 'xlink:href', 'http://www.w3.org/1999/xlink'],
  ['formAction', , 'formaction'],

  ...SvgAttributes(),
];

const propsDetailData = {};

propertiesData.forEach(record => {
  const propName = record[0];
  let [type, attrName, attrNS] = record.slice(1) as PropData[];

  if (type === undefined) {
    type = PROPERTY_TYPE.STRING;
  }

  if (!attrName) {
    attrName = propName;
  }

  if (!attrNS) {
    attrNS = null;
  }

  propsDetailData[propName!] = {
    propName,
    type,
    attrName,
    attrNS,
  };
});

export function getPropDetails(name: string): PropDetails | null {
  return propsDetailData[name] || null;
}
