/**
 * 设置 DOM 节点的 style 属性
 */
export function setStyles(dom, styles) {
  if (!styles) {
    return;
  }

  const style = dom.style;
  Object.keys(styles).forEach((name) => {
    const styleVal = styles[name];

    const validStyleValue = adjustStyleValue(name, styleVal);

    style[name] = validStyleValue;
  });
}

/**
 * 不需要加长度单位的 css 属性
 */
const noUnitCSS = ['animationIterationCount', 'columnCount', 'columns', 'gridArea', 'fontWeight', 'lineClamp',
  'lineHeight', 'opacity', 'order', 'orphans', 'tabSize', 'widows', 'zIndex', 'zoom'];

function isNeedUnitCSS(propName: string) {
  return !(noUnitCSS.includes(propName)
    || propName.startsWith('borderImage')
    || propName.startsWith('flex')
    || propName.startsWith('gridRow')
    || propName.startsWith('gridColumn')
    || propName.startsWith('stroke')
    || propName.startsWith('box')
    || propName.endsWith('Opacity'));
}

/**
 * 对一些没有写单位的样式进行适配，例如：width: 10 => width: 10px
 * 对空值或布尔值进行适配，转为空字符串
 * 去掉多余空字符
 */
export function adjustStyleValue(name, value) {
  let validValue = value;

  if (typeof value === 'number' && value !== 0 && isNeedUnitCSS(name)) {
    validValue = `${value}px`;
  } else if (value === '' || value == null || typeof value === 'boolean') {
    validValue = '';
  }

  return validValue;
}
