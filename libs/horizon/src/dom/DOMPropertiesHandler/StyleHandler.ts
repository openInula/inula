/**
 * 设置 DOM 节点的 style 属性
 */
export function setStyles(dom, styles) {
  if (!styles) {
    return;
  }

  const style = dom.style;
  const styleKeys = Object.keys(styles);

  for (let i = 0; i < styleKeys.length; i++) {
    const styleKey = styleKeys[i];
    const styleVal = styles[styleKey];

    const validStyleValue = adjustStyleValue(styleKey, styleVal);

    style[styleKey] = validStyleValue;
  }
}

/**
 * 1. 对空值或布尔值进行适配，转为空字符串
 * 2. 去掉多余空字符
 */
export function adjustStyleValue(name, value) {
  let validValue;

  if (value === '' || value == null || typeof value === 'boolean') {
    validValue = '';
  } else {
    validValue = String(value).trim();
  }

  return validValue;
}
