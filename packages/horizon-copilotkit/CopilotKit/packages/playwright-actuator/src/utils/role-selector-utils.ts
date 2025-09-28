/**
 * 角色选择器工具 - 提供统一的角色到选择器映射逻辑
 */

export interface RoleOptions {
  name?: string | RegExp;
  exact?: boolean;
  level?: number;
}

/**
 * 角色到选择器的映射表
 * 包含显式 role 属性和隐式角色元素
 */
export const ROLE_SELECTORS: Record<string, string> = {
  'button': 'button, input[type="button"], input[type="submit"], input[type="reset"], [role="button"]',
  'link': 'a[href], [role="link"]',
  'textbox': 'input:not([type]), input[type=""], input[type="text"], input[type="email"], input[type="password"], input[type="search"], input[type="tel"], input[type="url"], input[type="date"], textarea, [role="textbox"]',
  'combobox': 'select, [role="combobox"]',
  'checkbox': 'input[type="checkbox"], [role="checkbox"]',
  'radio': 'input[type="radio"], [role="radio"]',
  'spinbutton': 'input[type="number"], [role="spinbutton"]',
  'slider': 'input[type="range"], [role="slider"]',
  'searchbox': 'input[type="search"], [role="searchbox"]',
  'heading': 'h1, h2, h3, h4, h5, h6, [role="heading"]',
  'img': 'img, [role="img"]',
  'list': 'ul, ol, [role="list"]',
  'listitem': 'li, [role="listitem"]',
  'listbox': 'select[multiple], [role="listbox"]',
  'option': 'option, [role="option"]',
  'tab': '[role="tab"]',
  'tabpanel': '[role="tabpanel"]',
  'dialog': '[role="dialog"], dialog',
  'table': 'table, [role="table"]',
  'row': 'tr, [role="row"]',
  'cell': 'td, [role="cell"]',
  'columnheader': 'th, [role="columnheader"]',
  'rowheader': 'th[scope="row"], [role="rowheader"]'
};

/**
 * 获取角色对应的 CSS 选择器
 */
export function getRoleSelector(role: string, options: RoleOptions = {}): string {
  const { level } = options;
  
  // 处理带级别的标题角色
  if (level && role === 'heading') {
    return `h${level}[role="heading"], h${level}`;
  }
  
  // 返回预定义的角色选择器，如果没有则回退到基本 role 属性
  return ROLE_SELECTORS[role] || `[role="${role}"]`;
}

/**
 * 构建带名称匹配的 XPath 表达式
 * 支持所有 accessible name 的来源方式
 */
export function buildRoleXPathWithName(role: string, name: string, options: RoleOptions = {}): string {
  const { exact = false } = options;
  const selector = getRoleSelector(role, options);
  
  // 将 CSS 选择器转换为 XPath 部分
  const xpathParts: string[] = [];
  const selectorParts = selector.split(', ');
  
  selectorParts.forEach(part => {
    const trimmedPart = part.trim();
    let xpathPart = '';
    
    // 特殊处理复杂的 CSS 选择器
    if (trimmedPart === 'input:not([type])') {
      xpathPart = './/input[not(@type)]';
    } else if (trimmedPart === 'input[type=""]') {
      xpathPart = './/input[@type=""]';
    } else if (trimmedPart.includes('[')) {
      // 处理带属性的元素，如 input[type="text"] 或纯属性选择器 [role="row"]
      const [tag, attrPart] = trimmedPart.split('[');
      const attr = attrPart.replace(/\]$/, '');
      const elementTag = tag || '*'; // 如果没有标签名，使用通配符
      
      if (attr.includes('=')) {
        // 有值的属性，如 type="button"
        const [attrName, attrValue] = attr.split('=');
        const cleanAttrName = attrName.trim();
        const cleanAttrValue = attrValue.replace(/['"]/g, '').trim();
        xpathPart = `.//${elementTag}[@${cleanAttrName}="${cleanAttrValue}"]`;
      } else {
        // 仅存在性检查的属性
        const cleanAttrName = attr.trim();
        xpathPart = `.//${elementTag}[@${cleanAttrName}]`;
      }
    } else {
      // 简单标签名
      xpathPart = `.//${trimmedPart}`;
    }
    
    // 构建 accessible name 匹配条件（按优先级排序）
    const nameConditions: string[] = [];
    
    if (exact) {
      // 1. aria-label（最高优先级）
      nameConditions.push(`@aria-label="${name}"`);
      // 2. aria-labelledby 引用的元素文本
      nameConditions.push(`@aria-labelledby = //label[normalize-space(text())="${name}"]/@id`);
      nameConditions.push(`@aria-labelledby = //*[normalize-space(text())="${name}"]/@id`);
      // 3. for 关联的 label 文本
      nameConditions.push(`@id = //label[normalize-space(text())="${name}"]/@for`);
      // 4. 父级 label 的文本内容
      nameConditions.push(`parent::label[normalize-space(text())="${name}"]`);
      nameConditions.push(`ancestor::label[normalize-space(text())="${name}"]`);
      // 5. 元素自身的文本内容
      nameConditions.push(`normalize-space(.)="${name}"`);
      // 6. placeholder 作为 fallback
      nameConditions.push(`@placeholder="${name}"`);
      // 7. title 作为 fallback
      nameConditions.push(`@title="${name}"`);
    } else {
      // 包含匹配
      nameConditions.push(`contains(@aria-label, "${name}")`);
      nameConditions.push(`@aria-labelledby = //label[contains(normalize-space(text()), "${name}")]/@id`);
      nameConditions.push(`@aria-labelledby = //*[contains(normalize-space(text()), "${name}")]/@id`);
      nameConditions.push(`@id = //label[contains(normalize-space(text()), "${name}")]/@for`);
      nameConditions.push(`parent::label[contains(normalize-space(text()), "${name}")]`);
      nameConditions.push(`ancestor::label[contains(normalize-space(text()), "${name}")]`);
      nameConditions.push(`contains(normalize-space(.), "${name}")`);
      nameConditions.push(`contains(@placeholder, "${name}")`);
      nameConditions.push(`contains(@title, "${name}")`);
    }
    
    // 组合所有条件
    const combinedCondition = nameConditions.join(' or ');
    xpathParts.push(`${xpathPart}[${combinedCondition}]`);
  });
  
  return xpathParts.join(' | ');
}

/**
 * 检查元素的文本内容是否匹配指定模式
 * 用于 filter.hasText，只匹配元素的文本内容，不检查 accessible name 相关属性
 * 模拟 Playwright 的 hasText 行为：包含检查 + 文本规范化
 */
export function elementMatchesText(element: Element, pattern: string | RegExp, exact: boolean = false): boolean {
  // 获取元素的完整可见文本内容，模拟 Playwright 的行为
  const text = getElementVisibleText(element);
  
  // 直接传递原始文本给 matchesText，让它负责规范化
  return matchesText(text, pattern, exact);
}

/**
 * 获取元素的可见文本内容
 * 递归遍历所有子节点，提取可见的文本内容，模拟 Playwright 的文本提取行为
 */
function getElementVisibleText(element: Element): string {
  const textParts: string[] = [];
  
  // 递归函数来遍历所有子节点
  function extractText(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      // 文本节点：直接添加文本内容（不 trim，保持原始空白字符）
      const textContent = node.textContent || '';
      if (textContent) {
        textParts.push(textContent);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      
      // 检查元素是否可见
      if (typeof window !== 'undefined' && window.getComputedStyle) {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return; // 跳过隐藏元素
        }
      }
      
      // 递归处理子节点
      for (const childNode of Array.from(el.childNodes)) {
        extractText(childNode);
      }
    }
  }
  
  extractText(element);
  
  // 直接连接所有文本片段，不添加额外空格，保持原始结构
  return textParts.join('');
}

// =============== 共享的 getBy* 方法选择器生成器 ===============

/**
 * 生成 getByText 的选择器
 */
export function buildGetByTextSelector(text: string, exact: boolean = false): string {
  if (exact) {
    return `xpath=.//*[normalize-space(text())="${text}"]`;
  } else {
    return `xpath=.//*[contains(normalize-space(text()), "${text}")]`;
  }
}

/**
 * 生成 getByLabel 的选择器
 */
export function buildGetByLabelSelector(text: string, exact: boolean = false): string {
  // 支持的表单元素类型
  const formElements = ['input', 'select', 'textarea'];
  
  // 构建 XPath，支持多种表单元素类型和多种关联方式
  let xpathParts: string[] = [];
  
  if (exact) {
    // 精确匹配 - 优先顺序：aria-label > for关联 > 嵌套 > aria-labelledby
    formElements.forEach(elementType => {
      xpathParts.push(`.//${elementType}[@aria-label="${text}"]`);
    });
    formElements.forEach(elementType => {
      // Note: for 关联的情况下，我们需要在整个文档中查找label，所以这里仍然使用//
      xpathParts.push(`.//${elementType}[@id = //label[normalize-space(text())="${text}"]/@for]`);
    });
    formElements.forEach(elementType => {
      xpathParts.push(`.//label[normalize-space(text())="${text}"]//${elementType}`);
    });
    formElements.forEach(elementType => {
      // aria-labelledby 也需要在整个文档中查找引用的元素
      xpathParts.push(`.//${elementType}[@aria-labelledby = //label[normalize-space(text())="${text}"]/@id]`);
    });
  } else {
    // 包含匹配 - 同样的优先顺序
    formElements.forEach(elementType => {
      xpathParts.push(`.//${elementType}[contains(@aria-label, "${text}")]`);
    });
    formElements.forEach(elementType => {
      xpathParts.push(`.//${elementType}[@id = //label[contains(normalize-space(text()), "${text}")]/@for]`);
    });
    formElements.forEach(elementType => {
      xpathParts.push(`.//label[contains(normalize-space(text()), "${text}")]//${elementType}`);
    });
    formElements.forEach(elementType => {
      xpathParts.push(`.//${elementType}[@aria-labelledby = //label[contains(normalize-space(text()), "${text}")]/@id]`);
    });
  }
  
  return `xpath=${xpathParts.join(' | ')}`;
}

/**
 * 生成 getByPlaceholder 的选择器
 */
export function buildGetByPlaceholderSelector(text: string, exact: boolean = false): string {
  return exact 
    ? `[placeholder="${text}"]`
    : `[placeholder*="${text}"]`;
}

/**
 * 生成 getByTestId 的选择器
 */
export function buildGetByTestIdSelector(testId: string): string {
  return `[data-testid="${testId}"]`;
}

/**
 * 生成 getByTitle 的选择器
 */
export function buildGetByTitleSelector(text: string, exact: boolean = false): string {
  return exact 
    ? `[title="${text}"]`
    : `[title*="${text}"]`;
}

/**
 * 检查元素是否匹配指定的 accessible name
 * 按照 accessible name 的优先级顺序检查
 * 用于 getByRole 中的 name 选项
 */
export function elementMatchesAccessibleName(element: Element, name: string | RegExp, exact: boolean = false): boolean {
  // 特殊处理：如果要匹配空字符串，检查元素是否没有任何 accessible name
  if (name === "" && exact) {
    return !hasAnyAccessibleName(element);
  }
  
  // 1. 优先检查 aria-label
  const ariaLabel = element.getAttribute('aria-label') || '';
  if (ariaLabel && matchesText(ariaLabel, name, exact)) {
    return true;
  }
  
  // 2. 检查 aria-labelledby 引用的元素
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelElement = document.getElementById(ariaLabelledBy);
    if (labelElement) {
      const labelText = labelElement.textContent?.trim() || '';
      if (matchesText(labelText, name, exact)) {
        return true;
      }
    }
  }
  
  // 3. 检查关联的 label（通过 for 属性）
  const elementId = element.getAttribute('id');
  if (elementId) {
    const labelElement = document.querySelector(`label[for="${elementId}"]`);
    if (labelElement) {
      const labelText = labelElement.textContent?.trim() || '';
      if (matchesText(labelText, name, exact)) {
        return true;
      }
    }
  }
  
  // 4. 检查父级或祖先 label 元素
  let parent = element.parentElement;
  while (parent) {
    if (parent.tagName.toLowerCase() === 'label') {
      const labelText = parent.textContent?.trim() || '';
      if (matchesText(labelText, name, exact)) {
        return true;
      }
      break; // 找到第一个 label 祖先就停止
    }
    parent = parent.parentElement;
  }
  
  // 5. 特殊处理：表格行的 accessible name
  if (element.tagName.toLowerCase() === 'tr' || element.getAttribute('role') === 'row') {
    const rowAccessibleName = getRowAccessibleName(element);
    if (rowAccessibleName && matchesText(rowAccessibleName, name, exact)) {
      return true;
    }
  }
  
  // 6. 检查元素自身的文本内容
  const textContent = element.textContent?.trim() || '';
  if (matchesText(textContent, name, exact)) {
    return true;
  }
  
  // 7. 检查 placeholder 属性（fallback）
  const placeholder = element.getAttribute('placeholder') || '';
  if (matchesText(placeholder, name, exact)) {
    return true;
  }
  
  // 8. 检查 title 属性（fallback）
  const title = element.getAttribute('title') || '';
  if (matchesText(title, name, exact)) {
    return true;
  }
  
  return false;
}

/**
 * 获取表格行的 accessible name
 * 根据 WAI-ARIA 规范，表格行的 accessible name 是所有单元格文本的组合
 */
function getRowAccessibleName(element: Element): string {
  // 获取所有单元格 (th 和 td)
  const cells = element.querySelectorAll('th, td, [role="cell"], [role="columnheader"], [role="rowheader"]');
  const cellTexts: string[] = [];
  
  cells.forEach(cell => {
    // 对于每个单元格，获取其可见文本内容
    // 优先使用 aria-label，然后是文本内容
    let cellText = '';
    
    const ariaLabel = cell.getAttribute('aria-label');
    if (ariaLabel?.trim()) {
      cellText = ariaLabel.trim();
    } else {
      // 获取单元格的文本内容，但排除隐藏元素
      cellText = getCellVisibleText(cell);
    }
    
    if (cellText) {
      cellTexts.push(cellText);
    }
  });
  
  return cellTexts.join(' ').trim();
}

/**
 * 获取单元格的可见文本内容
 */
function getCellVisibleText(cell: Element): string {
  // 递归获取所有可见的文本节点
  const getVisibleTextRecursive = (node: Node): string => {
    let text = '';
    
    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent || '').trim();
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const style = window.getComputedStyle(element);
      
      // 跳过隐藏元素
      if (style.display === 'none' || style.visibility === 'hidden') {
        return '';
      }
      
      // 递归处理子节点
      for (const childNode of Array.from(element.childNodes)) {
        text += getVisibleTextRecursive(childNode) + ' ';
      }
    }
    
    return text.trim();
  };
  
  const visibleText = getVisibleTextRecursive(cell);
  
  // 如果没有找到可见文本，回退到 textContent
  return visibleText || (cell.textContent?.trim() || '');
}

/**
 * 检查元素是否有任何形式的 accessible name
 */
function hasAnyAccessibleName(element: Element): boolean {
  // 1. 检查 aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.trim()) {
    return true;
  }
  
  // 2. 检查 aria-labelledby 引用的元素
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelElement = document.getElementById(ariaLabelledBy);
    if (labelElement && labelElement.textContent?.trim()) {
      return true;
    }
  }
  
  // 3. 检查关联的 label（通过 for 属性）
  const elementId = element.getAttribute('id');
  if (elementId) {
    const labelElement = document.querySelector(`label[for="${elementId}"]`);
    if (labelElement && labelElement.textContent?.trim()) {
      return true;
    }
  }
  
  // 4. 检查父级或祖先 label 元素
  let parent = element.parentElement;
  while (parent) {
    if (parent.tagName.toLowerCase() === 'label') {
      const labelText = parent.textContent?.trim() || '';
      if (labelText) {
        return true;
      }
      break; // 找到第一个 label 祖先就停止
    }
    parent = parent.parentElement;
  }
  
  // 5. 检查 placeholder 属性
  const placeholder = element.getAttribute('placeholder');
  if (placeholder && placeholder.trim()) {
    return true;
  }
  
  // 6. 检查 title 属性
  const title = element.getAttribute('title');
  if (title && title.trim()) {
    return true;
  }
  
  return false;
}

/**
 * 文本匹配辅助函数
 */
function matchesText(text: string, pattern: string | RegExp, exact: boolean): boolean {
  if (pattern instanceof RegExp) {
    return pattern.test(text);
  }
  
  // 规范化文本和模式：将多个空白字符合并为单个空格
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  const normalizedPattern = typeof pattern === 'string' 
    ? pattern.replace(/\s+/g, ' ').trim()
    : pattern;
  
  if (exact) {
    return normalizedText === normalizedPattern;
  }
  
  // 对于包含匹配，我们需要更灵活的空格处理
  // 如果直接匹配失败，尝试移除所有空格再匹配
  if (normalizedText.includes(normalizedPattern)) {
    return true;
  }
  
  // 如果标准匹配失败，尝试忽略所有空格的匹配
  const textWithoutSpaces = normalizedText.replace(/\s/g, '');
  const patternWithoutSpaces = normalizedPattern.replace(/\s/g, '');
  
  return textWithoutSpaces.includes(patternWithoutSpaces);
}