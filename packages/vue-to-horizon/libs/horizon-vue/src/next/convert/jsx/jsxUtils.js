const htmlTags = [
  // 主根元素
  'html',

  // 文档元数据
  'base', 'head', 'link', 'meta', 'style', 'title',

  // 内容分区
  'address', 'article', 'aside', 'footer', 'header', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'hgroup', 'main', 'nav', 'section',

  // 文本内容
  'blockquote', 'dd', 'div', 'dl', 'dt', 'figcaption', 'figure', 'hr', 'li', 'menu',
  'ol', 'p', 'pre', 'ul',

  // 内联文本
  'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'dfn', 'em', 'i',
  'kbd', 'mark', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'small', 'span', 'strong',
  'sub', 'sup', 'time', 'u', 'var', 'wbr',

  // 图片和多媒体
  'area', 'audio', 'img', 'map', 'track', 'video',

  // 内嵌内容
  'embed', 'iframe', 'object', 'picture', 'portal', 'source',

  // 脚本
  'canvas', 'noscript', 'script',

  // 编辑标识
  'del', 'ins',

  // 表格内容
  'caption', 'col', 'colgroup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr',

  // 表单
  'button', 'datalist', 'fieldset', 'form', 'input', 'label', 'legend', 'meter',
  'optgroup', 'option', 'output', 'progress', 'select', 'textarea',

  // 交互元素
  'details', 'dialog', 'summary',

  // Web组件
  'slot', 'template'
];

/**
 * 判断标签名是否是有效的HTML标签
 * @param {string} tagName - 要检查的标签名
 * @returns {boolean} - 如果是有效的HTML标签返回true，否则返回false
 */
export const isValidHtmlTag = (tagName) => {
  // 转换为小写以进行不区分大小写的比较
  const normalizedTagName = tagName.toLowerCase();
  return htmlTags.includes(normalizedTagName);
};
