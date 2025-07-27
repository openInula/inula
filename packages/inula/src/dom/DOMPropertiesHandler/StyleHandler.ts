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

/**
 * 不需要加长度单位的 css 属性
 */
const noUnitCSS = [
  'animationIterationCount',
  'columnCount',
  'columns',
  'gridArea',
  'fontWeight',
  'lineClamp',
  'lineHeight',
  'opacity',
  'order',
  'orphans',
  'tabSize',
  'widows',
  'zIndex',
  'zoom',
];

const length = noUnitCSS.length;
for (let i = 0; i < length; i++) {
  const cssKey = noUnitCSS[i];
  const attributeKey = cssKey.charAt(0).toUpperCase() + cssKey.slice(1);

  // css 兼容性前缀 webkit: chrome, mo: IE或者Edge, Moz: 火狐
  noUnitCSS.push('Webkit' + attributeKey);
  noUnitCSS.push('mo' + attributeKey);
  noUnitCSS.push('Moz' + attributeKey);
}

function isNeedUnitCSS(styleName: string) {
  return !(
    noUnitCSS.includes(styleName) ||
    styleName.startsWith('borderImage') ||
    styleName.startsWith('flex') ||
    styleName.startsWith('gridRow') ||
    styleName.startsWith('gridColumn') ||
    styleName.startsWith('stroke') ||
    styleName.startsWith('box') ||
    styleName.endsWith('Opacity')
  );
}

/**
 * 对一些没有写单位的样式进行适配，例如：width: 10 => width: 10px
 * 对空值或布尔值进行适配，转为空字符串
 * 去掉多余空字符
 */
export function adjustStyleValue(name: string, value: unknown, isCustomProperty = false) {
  if (value === '' || value === null || value === undefined || typeof value === 'boolean') {
    return '';
  }

  if (!isCustomProperty && typeof value === 'number' && value !== 0 && isNeedUnitCSS(name)) {
    return `${value}px`;
  }

  return value;
}

/**
 * 设置 DOM 节点的 style 属性
 */
export function setStyles(dom, styles) {
  if (!styles) {
    return;
  }

  const style = dom.style;
  for (let name of Object.keys(styles)) {
    const isCssVariable = name.startsWith('--');
    const styleVal = adjustStyleValue(name, styles[name], isCssVariable);
    if (name === 'float') {
      name = 'cssFloat';
    }
    // 以--开始的样式直接设置即可
    if (isCssVariable) {
      style.setProperty(name, styleVal);
    } else {
      // 使用这种赋值方式，浏览器可以将'WebkitLineClamp'， 'backgroundColor'分别识别为'-webkit-line-clamp'和'backgroud-color'
      style[name] = styleVal;
    }
  }
}
