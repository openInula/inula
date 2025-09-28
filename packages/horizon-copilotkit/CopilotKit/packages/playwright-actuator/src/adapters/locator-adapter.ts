/// <reference path="../types/global.d.ts" />
import type { 
  ClickOptions, 
  FillOptions, 
  TypeOptions, 
  LocatorOptions, 
  ElementWaitOptions,
  Logger,
  PageContext,
  EventSimulator,
  FrameAdapter as FrameAdapterType
} from '../../types/index.js';
import { getReactAdapter } from '../framework-adapters/react-adapter.js';
import { getOpenInulaAdapter } from '../framework-adapters/openinula-adapter.js';
import { 
  getRoleSelector, 
  elementMatchesText, 
  elementMatchesAccessibleName,
  buildGetByTextSelector,
  buildGetByLabelSelector,
  buildGetByPlaceholderSelector,
  buildGetByTestIdSelector,
  buildGetByTitleSelector,
  type RoleOptions 
} from '../utils/role-selector-utils.js';

interface FilterOptions {
  hasText?: string | RegExp;
  hasNotText?: string | RegExp;
  hasAccessibleName?: string | RegExp;  // 新增：用于 accessible name 匹配
  exact?: boolean;
  position?: number | 'last';
}

// 查询策略接口
interface QueryStrategy {
  type: 'selector' | 'role' | 'text' | 'label' | 'placeholder' | 'testid' | 'title';
  selector?: string;
  role?: string;
  roleOptions?: { name?: string | RegExp; exact?: boolean };
  text?: string;
  textOptions?: { exact?: boolean };
  labelText?: string;
  labelOptions?: { exact?: boolean };
  placeholder?: string;
  placeholderOptions?: { exact?: boolean };
  testId?: string;
  title?: string;
  titleOptions?: { exact?: boolean };
  parentStrategy?: QueryStrategy;
}

/**
 * Locator 适配器 - 实现 Playwright Locator API with Lazy Execution
 */
class LocatorAdapter {
  private page: PageContext;
  private options: LocatorOptions;
  private filters: FilterOptions[];
  private logger: Logger;
  private eventSimulator: EventSimulator;
  private _element?: Element;
  private _queryStrategy: QueryStrategy; // 查询策略，延迟执行
  private _resolvedElements?: Element[]; // 缓存已解析的元素集合，仅在需要时计算

  // 为了向后兼容，提供 selector getter
  private get selector(): string {
    return this.getSelectorFromStrategy(this._queryStrategy);
  }

  /**
   * 从查询策略生成选择器字符串（用于日志和错误信息）
   */
  private getSelectorFromStrategy(strategy: QueryStrategy): string {
    if (strategy.parentStrategy) {
      const parentSelector = this.getSelectorFromStrategy(strategy.parentStrategy);
      const childSelector = this.getStrategySelectorPart(strategy);
      return `${parentSelector} ${childSelector}`;
    }
    return this.getStrategySelectorPart(strategy);
  }

  private getStrategySelectorPart(strategy: QueryStrategy): string {
    switch (strategy.type) {
      case 'selector':
        return strategy.selector || '*';
      case 'role':
        return `[role="${strategy.role}"]`;
      case 'text':
        return `text="${strategy.text}"`;
      case 'label':
        return `label="${strategy.labelText}"`;
      case 'placeholder':
        return `placeholder="${strategy.placeholder}"`;
      case 'testid':
        return `[data-testid="${strategy.testId}"]`;
      case 'title':
        return `[title="${strategy.title}"]`;
      default:
        return '*';
    }
  }

  constructor(queryStrategy: QueryStrategy | string, page: PageContext, options: LocatorOptions = {}) {
    // 兼容旧的构造函数调用方式
    if (typeof queryStrategy === 'string') {
      this._queryStrategy = {
        type: 'selector',
        selector: queryStrategy
      };
    } else {
      this._queryStrategy = queryStrategy;
    }
    
    this.page = page;
    this.options = options;
    this.filters = [];
    this.logger = page.logger || ((typeof window !== 'undefined' && window.PlaywrightLogger) 
      ? new window.PlaywrightLogger() 
      : console as unknown as Logger);
    this.eventSimulator = page.eventSimulator;
  }

  /**
   * 获取正确的文档对象（支持 iframe 场景）
   */
  private getDocument(): Document {
    // 如果 page 是 BasePageContext 实例，使用其 getContext() 方法获取正确的 document
    if (this.page && typeof (this.page as any).getContext === 'function') {
      const context = (this.page as any).getContext();
      return context.document;
    }
    // 兼容旧的接口：如果 page 有 frameDocument 属性，说明是在 iframe 中
    if (this.page && (this.page as any).frameDocument) {
      return (this.page as any).frameDocument;
    }
    // 否则使用主页面的 document
    return document;
  }

  /**
   * 获取正确的 window 对象（支持 iframe 场景）
   */
  private getContextWindow(): Window {
    // 如果 page 是 BasePageContext 实例，使用其 getContext() 方法获取正确的 window
    if (this.page && typeof (this.page as any).getContext === 'function') {
      const context = (this.page as any).getContext();
      return context.window;
    }
    // 兼容旧的接口：如果 page 有 frameWindow 属性，说明是在 iframe 中
    if (this.page && (this.page as any).frameWindow) {
      return (this.page as any).frameWindow;
    }
    // 否则使用主页面的 window
    return window;
  }

  /**
   * 检查元素是否是指定的 HTML 元素类型（支持 iframe 场景）
   */
  private isHTMLElement(element: Element, type: 'HTMLElement' | 'HTMLInputElement' | 'HTMLTextAreaElement' | 'HTMLSelectElement' | 'HTMLButtonElement' | 'HTMLIFrameElement'): boolean {
    const contextWindow = this.getContextWindow();
    const Constructor = (contextWindow as any)[type];
    if (!Constructor) {
      // 如果无法获取构造函数，回退到全局检查
      return element instanceof (globalThis as any)[type];
    }
    return element instanceof Constructor;
  }

  /**
   * 创建事件对象（支持 iframe 场景）
   */
  private createEvent(type: string, options?: EventInit): Event {
    const contextWindow = this.getContextWindow();
    const EventConstructor = (contextWindow as any).Event;
    if (EventConstructor) {
      return new EventConstructor(type, options);
    }
    // 回退到全局 Event 构造函数
    return new Event(type, options);
  }

  /**
   * 基于已解析元素创建新的 locator（保留用于内部使用）
   */
  static fromElements(elements: Element[], page: PageContext, queryStrategy: QueryStrategy): LocatorAdapter {
    const locator = new LocatorAdapter(queryStrategy, page);
    locator._resolvedElements = elements;
    return locator;
  }


  // =============== 元素解析方法 ===============

  /**
   * 获取当前的元素集合（延迟执行）
   */
  private getCurrentElements(): Element[] {
    // 如果已经有解析的元素，直接返回
    if (this._resolvedElements) {
      return this._resolvedElements;
    }
    
    // 执行查询策略
    const elements = this.executeQueryStrategy(this._queryStrategy);
    
    // 应用所有过滤器
    return this.applyFilters(elements);
  }

  /**
   * 执行查询策略（递归处理父策略）
   */
  private executeQueryStrategy(strategy: QueryStrategy): Element[] {
    // 如果有父策略，先执行父策略
    let parentElements: Element[] | undefined;
    if (strategy.parentStrategy) {
      parentElements = this.executeQueryStrategy(strategy.parentStrategy);
      // 如果父查询没有结果，直接返回空数组
      if (parentElements.length === 0) {
        return [];
      }
    }

    let result: Element[];
    switch (strategy.type) {
      case 'selector':
        result = this.queryElementsBySelector(strategy.selector!, parentElements);
        break;
      case 'role':
        result = this.queryElementsByRole(strategy.role!, strategy.roleOptions || {}, parentElements);
        break;
      case 'text':
        result = this.queryElementsByText(strategy.text!, strategy.textOptions || {}, parentElements);
        break;
      case 'label':
        result = this.queryElementsByLabel(strategy.labelText!, strategy.labelOptions || {}, parentElements);
        break;
      case 'placeholder':
        result = this.queryElementsByPlaceholder(strategy.placeholder!, strategy.placeholderOptions || {}, parentElements);
        break;
      case 'testid':
        result = this.queryElementsByTestId(strategy.testId!, parentElements);
        break;
      case 'title':
        result = this.queryElementsByTitle(strategy.title!, strategy.titleOptions || {}, parentElements);
        break;
      default:
        result = [];
    }
    
    return result;
  }

  // =============== 链式过滤器方法 ===============

  /**
   * 过滤 locator - 延迟执行（符合 Playwright 行为）
   */
  filter(options: FilterOptions): LocatorAdapter {
    // 创建新的 locator，继承当前查询策略，添加过滤器
    const newLocator = new LocatorAdapter(this._queryStrategy, this.page);
    newLocator.filters = [...this.filters, options];
    return newLocator;
  }

  /**
   * 获取第一个元素
   */
  first(): LocatorAdapter {
    return this.nth(0);
  }

  /**
   * 获取最后一个元素
   */
  last(): LocatorAdapter {
    return this.filter({ position: 'last' });
  }

  /**
   * 获取第 n 个元素
   */
  nth(n: number): LocatorAdapter {
    return this.filter({ position: n });
  }

  /**
   * 创建子 Locator (在当前 Locator 范围内查找)
   */
  locator(selector: string, options: LocatorOptions = {}): LocatorAdapter {
    // 创建子查询策略
    const childStrategy: QueryStrategy = {
      type: 'selector',
      selector: selector,
      parentStrategy: this._queryStrategy
    };
    
    const newLocator = new LocatorAdapter(childStrategy, this.page, options);
    // 不继承父级的过滤器！过滤器是针对特定元素类型的，不适用于子元素
    // newLocator.filters = [...this.filters];
    return newLocator;
  }

  /**
   * 根据角色查找元素
   */
  getByRole(role: string, options: { name?: string | RegExp; exact?: boolean } = {}): LocatorAdapter {
    const { name, exact = false } = options;
    
    // 创建角色查询策略
    const roleStrategy: QueryStrategy = {
      type: 'role',
      role: role,
      roleOptions: { name, exact },
      parentStrategy: this._queryStrategy
    };
    
    const newLocator = new LocatorAdapter(roleStrategy, this.page);
    
    // 如果指定了 name，添加 accessible name 过滤
    if (name) {
      newLocator.filters.push({
        hasAccessibleName: name,
        exact
      });
    }
    
    return newLocator;
  }

  /**
   * 组合两个 XPath 表达式
   */
  private combineXPaths(parentXpath: string, childXpath: string): string {
    // 处理包含 | 操作符的复杂 XPath
    if (parentXpath.includes(' | ')) {
      // 父 XPath 有多个部分，需要为每个部分添加子路径
      const parentParts = parentXpath.split(' | ');
      const combinedParts = parentParts.map(parentPart => {
        const cleanParentPart = parentPart.trim();
        // 如果子 XPath 也有多个部分，则每个父部分都要与每个子部分组合
        if (childXpath.includes(' | ')) {
          const childParts = childXpath.split(' | ');
          return childParts.map(childPart => {
            const cleanChildPart = childPart.trim().replace(/^\/+/, '');
            return `(${cleanParentPart})//${cleanChildPart}`;
          }).join(' | ');
        } else {
          const cleanChildXpath = childXpath.replace(/^\/+/, '');
          return `(${cleanParentPart})//${cleanChildXpath}`;
        }
      });
      return `xpath=${combinedParts.join(' | ')}`;
    } else {
      // 简单情况：父 XPath 只有一个部分
      if (childXpath.includes(' | ')) {
        const childParts = childXpath.split(' | ');
        const combinedParts = childParts.map(childPart => {
          const cleanChildPart = childPart.trim().replace(/^\/+/, '');
          return `(${parentXpath})//${cleanChildPart}`;
        });
        return `xpath=${combinedParts.join(' | ')}`;
      } else {
        const cleanChildXpath = childXpath.replace(/^\/+/, '');
        return `xpath=(${parentXpath})//${cleanChildXpath}`;
      }
    }
  }

  /**
   * 将选择器与父选择器组合
   */
  private combineSelectorWithParent(childSelector: string): string {
    // 如果子选择器是 XPath，需要特殊处理
    if (childSelector.startsWith('xpath=')) {
      const childXpath = childSelector.substring(6);
      if (this.selector.startsWith('xpath=')) {
        const parentXpath = this.selector.substring(6);
        // 处理复杂的 XPath 组合，特别是包含 | 操作符的情况
        return this.combineXPaths(parentXpath, childXpath);
      } else {
        // 父选择器是 CSS，子选择器是 XPath - 转换父选择器为 XPath
        const parentXpath = this.cssSelectorToXPath(this.selector);
        return this.combineXPaths(parentXpath, childXpath);
      }
    }
    
    // 如果父选择器是 XPath，子选择器是 CSS
    if (this.selector.startsWith('xpath=')) {
      const parentXpath = this.selector.substring(6);
      const childXpath = this.cssSelectorToXPath(childSelector);
      // 使用新的 combineXPaths 方法来正确处理复杂 XPath
      return this.combineXPaths(parentXpath, childXpath);
    }
    
    // 两个都是 CSS 选择器
    // 处理包含逗号的复杂选择器
    if (this.selector.includes(',')) {
      const parentParts = this.selector.split(',').map(part => part.trim());
      const combinedParts = parentParts.map(parentPart => `${parentPart} ${childSelector}`);
      return combinedParts.join(', ');
    } else {
      return `${this.selector} ${childSelector}`;
    }
  }

  /**
   * 将 CSS 选择器转换为 XPath 表达式（改进版）
   */
  private cssSelectorToXPath(cssSelector: string): string {
    // 处理逗号分隔的多个选择器
    if (cssSelector.includes(',')) {
      const selectors = cssSelector.split(',').map(s => s.trim());
      const xpathParts = selectors.map(sel => this.singleCssToXPath(sel));
      return xpathParts.join(' | ');
    }
    
    return this.singleCssToXPath(cssSelector);
  }

  /**
   * 将单个 CSS 选择器转换为 XPath 表达式
   */
  private singleCssToXPath(cssSelector: string): string {
    const trimmed = cssSelector.trim();
    
    if (trimmed.startsWith('#')) {
      // ID 选择器: #id -> .//*[@id="id"]
      return `.//*[@id="${trimmed.substring(1)}"]`;
    } else if (trimmed.startsWith('.')) {
      // 类选择器: .class -> .//*[contains(@class, "class")]
      return `.//*[contains(@class, "${trimmed.substring(1)}")]`;
    } else if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      // 属性选择器
      const attrMatch = trimmed.match(/\[([^=]+)="([^"]+)"\]/);
      if (attrMatch) {
        return `.//*[@${attrMatch[1]}="${attrMatch[2]}"]`;
      }
      const attrExistsMatch = trimmed.match(/\[([^=\]]+)\]/);
      if (attrExistsMatch) {
        return `.//*[@${attrExistsMatch[1]}]`;
      }
    } else if (/^[a-zA-Z][a-zA-Z0-9-]*$/.test(trimmed)) {
      // 标签选择器: div -> .//div
      return `.//${trimmed}`;
    } else if (trimmed === '*') {
      // 通配符选择器: * -> .//*
      return `.//*`;
    } else if (trimmed.startsWith('*[') && trimmed.endsWith(']')) {
      // 通配符属性选择器: *[attr="value"] -> //*[@attr="value"]
      const attrPart = trimmed.substring(2, trimmed.length - 1);
      const attrMatch = attrPart.match(/([^=]+)="([^"]+)"/);
      if (attrMatch) {
        return `.//*[@${attrMatch[1]}="${attrMatch[2]}"]`;
      }
      const attrExistsMatch = attrPart.match(/^([^=\]]+)$/);
      if (attrExistsMatch) {
        return `.//*[@${attrExistsMatch[1]}]`;
      }
    }
    
    // 复杂选择器 - 回退到通配符，但提供更好的处理
    // 尝试提取标签名
    const tagMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9-]*)/);
    if (tagMatch) {
      return `.//${tagMatch[1]}`;
    }
    
    // 最后的回退 - 使用相对通配符
    return `.//*`;
  }

  /**
   * 根据文本过滤
   */
  getByText(text: string, options: { exact?: boolean } = {}): LocatorAdapter {
    const { exact = false } = options;
    
    // 创建文本查询策略
    const textStrategy: QueryStrategy = {
      type: 'text',
      text: text,
      textOptions: { exact },
      parentStrategy: this._queryStrategy
    };
    
    return new LocatorAdapter(textStrategy, this.page);
  }

  /**
   * 根据标签定位
   */
  getByLabel(text: string, options: { exact?: boolean } = {}): LocatorAdapter {
    const { exact = false } = options;
    
    // 创建标签查询策略
    const labelStrategy: QueryStrategy = {
      type: 'label',
      labelText: text,
      labelOptions: { exact },
      parentStrategy: this._queryStrategy
    };
    
    const newLocator = new LocatorAdapter(labelStrategy, this.page);
    
    // 如果是空字符串，添加过滤器匹配没有任何 label 的元素
    if (text === "") {
      newLocator.filters.push({
        hasAccessibleName: "",
        exact: true
      });
    }
    
    return newLocator;
  }

  /**
   * 根据占位符定位
   */
  getByPlaceholder(text: string, options: { exact?: boolean } = {}): LocatorAdapter {
    const { exact = false } = options;
    
    // 创建占位符查询策略
    const placeholderStrategy: QueryStrategy = {
      type: 'placeholder',
      placeholder: text,
      placeholderOptions: { exact },
      parentStrategy: this._queryStrategy
    };
    
    return new LocatorAdapter(placeholderStrategy, this.page);
  }

  /**
   * 根据测试 ID 定位
   */
  getByTestId(testId: string): LocatorAdapter {
    // 创建测试ID查询策略
    const testIdStrategy: QueryStrategy = {
      type: 'testid',
      testId: testId,
      parentStrategy: this._queryStrategy
    };
    
    return new LocatorAdapter(testIdStrategy, this.page);
  }

  /**
   * 根据标题定位
   */
  getByTitle(text: string, options: { exact?: boolean } = {}): LocatorAdapter {
    const { exact = false } = options;
    
    // 创建标题查询策略
    const titleStrategy: QueryStrategy = {
      type: 'title',
      title: text,
      titleOptions: { exact },
      parentStrategy: this._queryStrategy
    };
    
    return new LocatorAdapter(titleStrategy, this.page);
  }

  // =============== 原生事件触发辅助方法 ===============
  
  /**
   * 触发原生输入事件
   */
  private triggerNativeInputEvents(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
    // 触发 input 事件
    const inputEvent = this.createEvent('input', { bubbles: true, cancelable: true });
    Object.defineProperty(inputEvent, 'target', { value: element, enumerable: true });
    element.dispatchEvent(inputEvent);
    
    // 触发 change 事件
    const changeEvent = this.createEvent('change', { bubbles: true, cancelable: true });
    Object.defineProperty(changeEvent, 'target', { value: element, enumerable: true });
    element.dispatchEvent(changeEvent);
    
    // 触发用户交互事件
    this.triggerNativeInteractionEvents(element);
  }
  
  /**
   * 触发原生 change 事件
   */
  private triggerNativeChangeEvent(element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): void {
    const changeEvent = this.createEvent('change', { bubbles: true, cancelable: true });
    Object.defineProperty(changeEvent, 'target', { value: element, enumerable: true });
    element.dispatchEvent(changeEvent);
  }
  
  /**
   * 触发原生用户交互事件
   */
  private triggerNativeInteractionEvents(element: Element): void {
    try {
      element.dispatchEvent(this.createEvent('focus', { bubbles: true }));
      setTimeout(() => {
        element.dispatchEvent(this.createEvent('blur', { bubbles: true }));
      }, 10);
    } catch (error) {
      // 忽略交互事件错误
    }
  }

  // =============== 核心操作方法 ===============

  /**
   * 点击元素
   */
  async click(options: ClickOptions = {}): Promise<void> {
    // 等待元素可见
    const element = await this.waitFor({ state: 'visible', timeout: options.timeout || 30000 });
    
    // 等待元素可点击
    await this.waitForClickable(element, options.timeout || 30000);
    
    await this.page.scrollIntoViewIfNeeded(element);
    
    // 检查是否是右键点击
    const isRightClick = options.button === 'right';
    
    // 检查框架组件类型并使用相应适配器
    const reactAdapter = getReactAdapter(this.logger);
    const openinulaAdapter = getOpenInulaAdapter(this.logger);
    
    const isReactComponent = reactAdapter.isReactComponent(element);
    const isOpenInulaComponent = openinulaAdapter.isOpenInulaComponent(element);
    
    if (isReactComponent) {
      // React 组件：使用 React 适配器
      if (isRightClick) {
        const clickResult = await reactAdapter.triggerContextMenuEvent(element);
        this.logger.debug(`右键点击元素完成: ${this.selector} (${clickResult.method})`);
      } else {
        const clickResult = await reactAdapter.triggerClickEvent(element);
        this.logger.debug(`点击元素完成: ${this.selector} (${clickResult.method})`);
      }
    } else if (isOpenInulaComponent) {
      // OpenInula 组件：使用 OpenInula 适配器
      if (isRightClick) {
        const clickResult = await openinulaAdapter.triggerContextMenuEvent(element);
        this.logger.debug(`右键点击元素完成: ${this.selector} (${clickResult.method})`);
      } else {
        const clickResult = await openinulaAdapter.triggerClickEvent(element);
        this.logger.debug(`点击元素完成: ${this.selector} (${clickResult.method})`);
      }
    } else {
      // 原生元素：使用原生事件模拟器
      this.eventSimulator.simulateClick(element, options);
      this.logger.debug(`${isRightClick ? '右键' : ''}点击元素: ${this.selector} (native)`);
    }
  }

  /**
   * 双击元素
   */
  async dblclick(options: ClickOptions = {}): Promise<void> {
    // 等待元素可见
    const element = await this.waitFor({ state: 'visible', timeout: options.timeout || 30000 });
    
    // 等待元素可点击
    await this.waitForClickable(element, options.timeout || 30000);
    
    await this.page.scrollIntoViewIfNeeded(element);
    
    // 检查框架组件类型并使用相应适配器
    const reactAdapter = getReactAdapter(this.logger);
    const openinulaAdapter = getOpenInulaAdapter(this.logger);
    
    const isReactComponent = reactAdapter.isReactComponent(element);
    const isOpenInulaComponent = openinulaAdapter.isOpenInulaComponent(element);
    
    if (isReactComponent || isOpenInulaComponent) {
      // 对于框架组件，双击就是触发两次点击事件
      if (isReactComponent) {
        await reactAdapter.triggerClickEvent(element);
        await reactAdapter.triggerClickEvent(element);
        this.logger.debug(`双击元素完成: ${this.selector} (react)`);
      } else {
        await openinulaAdapter.triggerClickEvent(element);
        await openinulaAdapter.triggerClickEvent(element);
        this.logger.debug(`双击元素完成: ${this.selector} (openinula)`);
      }
    } else {
      // 原生元素：使用原生事件模拟器
      this.eventSimulator.simulateDoubleClick(element);
      this.logger.debug(`双击元素: ${this.selector} (native)`);
    }
  }

  /**
   * 填充表单
   */
  async fill(value: string, options: FillOptions = {}): Promise<void> {
    // 等待元素可见
    const element = await this.waitFor({ state: 'visible', timeout: options.timeout || 30000 }) as HTMLInputElement | HTMLTextAreaElement;
    
    // 等待元素可编辑
    await this.waitForEditable(element, options.timeout || 30000);
    
    await this.page.scrollIntoViewIfNeeded(element);
    
    // 清空并填充
    element.value = '';
    element.value = value;
    
    // 检查框架组件类型并使用相应适配器
    const reactAdapter = getReactAdapter(this.logger);
    const openinulaAdapter = getOpenInulaAdapter(this.logger);
    
    const isReactComponent = reactAdapter.isReactComponent(element);
    const isOpenInulaComponent = openinulaAdapter.isOpenInulaComponent(element);
    
    if (isReactComponent) {
      // React 组件：使用 React 适配器
      await reactAdapter.triggerInputEvent(element, value);
      const changeResult = await reactAdapter.triggerChangeEvent(element, value);
      await reactAdapter.triggerInteractionEvents(element);
      
      this.logger.debug(`填充元素完成: ${this.selector} = "${value}" (${changeResult.method})`);
    } else if (isOpenInulaComponent) {
      // OpenInula 组件：使用 OpenInula 适配器
      await openinulaAdapter.triggerInputEvent(element, value);
      const changeResult = await openinulaAdapter.triggerChangeEvent(element, value);
      await openinulaAdapter.triggerInteractionEvents(element);
      
      this.logger.debug(`填充元素完成: ${this.selector} = "${value}" (${changeResult.method})`);
    } else {
      // 原生元素：直接触发原生事件
      this.triggerNativeInputEvents(element, value);
      this.logger.debug(`填充元素完成: ${this.selector} = "${value}" (native)`);
    }
  }

  /**
   * 按键操作
   */
  async press(key: string, options: TypeOptions = {}): Promise<void> {
    const element = await this.getElement() as HTMLElement;
    element.focus();
    
    this.eventSimulator.simulateKeyPress(element, key, options);
    this.logger.debug(`按键: ${this.selector} -> ${key}`);
  }

  /**
   * 逐字符输入（模拟打字）
   */
  async pressSequentially(text: string, options: TypeOptions = {}): Promise<void> {
    const element = await this.getElement() as HTMLInputElement | HTMLTextAreaElement;
    await this.eventSimulator.simulateTyping(element, text, options);
    this.logger.debug(`逐字符输入: ${this.selector} -> "${text}"`);
  }

  /**
   * 悬停
   */
  async hover(options: { timeout?: number } = {}): Promise<void> {
    // 等待元素可见
    const element = await this.waitFor({ state: 'visible', timeout: options.timeout || 30000 }) as HTMLElement;
    await this.page.scrollIntoViewIfNeeded(element);
    
    // 检查框架组件类型并触发相应事件
    const reactAdapter = getReactAdapter(this.logger);
    const openinulaAdapter = getOpenInulaAdapter(this.logger);
    
    const isReactComponent = reactAdapter.isReactComponent(element);
    const isOpenInulaComponent = openinulaAdapter.isOpenInulaComponent(element);
    
    if (isReactComponent || isOpenInulaComponent) {
      // 对于框架组件，触发 mouseenter 和 mouseover 事件
      element.dispatchEvent(this.createEvent('mouseenter', { bubbles: true }));
      element.dispatchEvent(this.createEvent('mouseover', { bubbles: true }));
      this.logger.debug(`悬停元素完成: ${this.selector} (${isReactComponent ? 'react' : 'openinula'})`);
    } else {
      // 原生元素：使用原生事件模拟器
      this.eventSimulator.simulateHover(element);
      this.logger.debug(`悬停元素: ${this.selector} (native)`);
    }
  }

  /**
   * 选择复选框
   */
  async check(options: { timeout?: number } = {}): Promise<void> {
    // 等待元素可见并可点击
    const element = await this.waitFor({ state: 'visible', timeout: options.timeout || 30000 }) as HTMLInputElement;
    await this.waitForClickable(element, options.timeout || 30000);
    
    await this.page.scrollIntoViewIfNeeded(element);
    
    if (element.type === 'checkbox' || element.type === 'radio') {
      element.checked = true;
      
      // 检查框架组件类型并使用相应适配器
      const reactAdapter = getReactAdapter(this.logger);
      const openinulaAdapter = getOpenInulaAdapter(this.logger);
      
      const isReactComponent = reactAdapter.isReactComponent(element);
      const isOpenInulaComponent = openinulaAdapter.isOpenInulaComponent(element);
      
      if (isReactComponent) {
        const changeResult = await reactAdapter.triggerChangeEvent(element);
        this.logger.debug(`选择复选框: ${this.selector} (${changeResult.method})`);
      } else if (isOpenInulaComponent) {
        const changeResult = await openinulaAdapter.triggerChangeEvent(element);
        this.logger.debug(`选择复选框: ${this.selector} (${changeResult.method})`);
      } else {
        this.triggerNativeChangeEvent(element);
        this.logger.debug(`选择复选框: ${this.selector} (native)`);
      }
    }
  }

  /**
   * 取消选择复选框
   */
  async uncheck(options: { timeout?: number } = {}): Promise<void> {
    // 等待元素可见并可点击
    const element = await this.waitFor({ state: 'visible', timeout: options.timeout || 30000 }) as HTMLInputElement;
    await this.waitForClickable(element, options.timeout || 30000);
    
    await this.page.scrollIntoViewIfNeeded(element);
    
    if (element.type === 'checkbox') {
      element.checked = false;
      
      // 检查框架组件类型并使用相应适配器
      const reactAdapter = getReactAdapter(this.logger);
      const openinulaAdapter = getOpenInulaAdapter(this.logger);
      
      const isReactComponent = reactAdapter.isReactComponent(element);
      const isOpenInulaComponent = openinulaAdapter.isOpenInulaComponent(element);
      
      if (isReactComponent) {
        const changeResult = await reactAdapter.triggerChangeEvent(element);
        this.logger.debug(`取消选择复选框: ${this.selector} (${changeResult.method})`);
      } else if (isOpenInulaComponent) {
        const changeResult = await openinulaAdapter.triggerChangeEvent(element);
        this.logger.debug(`取消选择复选框: ${this.selector} (${changeResult.method})`);
      } else {
        this.triggerNativeChangeEvent(element);
        this.logger.debug(`取消选择复选框: ${this.selector} (native)`);
      }
    }
  }

  /**
   * 选择下拉选项
   */
  async selectOption(values: string | string[], options: { timeout?: number } = {}): Promise<void> {
    // 等待元素可见并可点击
    const element = await this.waitFor({ state: 'visible', timeout: options.timeout || 30000 }) as HTMLSelectElement;
    await this.waitForClickable(element, options.timeout || 30000);
    
    await this.page.scrollIntoViewIfNeeded(element);
    
    if (element.tagName === 'SELECT') {
      if (Array.isArray(values)) {
        // 多选
        Array.from(element.options).forEach(option => {
          option.selected = values.includes(option.value) || values.includes(option.text);
        });
      } else {
        element.value = values;
      }
      
      // 检查框架组件类型并使用相应适配器
      const reactAdapter = getReactAdapter(this.logger);
      const openinulaAdapter = getOpenInulaAdapter(this.logger);
      
      const isReactComponent = reactAdapter.isReactComponent(element);
      const isOpenInulaComponent = openinulaAdapter.isOpenInulaComponent(element);
      
      if (isReactComponent) {
        const changeResult = await reactAdapter.triggerChangeEvent(element);
        this.logger.debug(`选择下拉选项: ${this.selector} = ${values} (${changeResult.method})`);
      } else if (isOpenInulaComponent) {
        const changeResult = await openinulaAdapter.triggerChangeEvent(element);
        this.logger.debug(`选择下拉选项: ${this.selector} = ${values} (${changeResult.method})`);
      } else {
        this.triggerNativeChangeEvent(element);
        this.logger.debug(`选择下拉选项: ${this.selector} = ${values} (native)`);
      }
    }
  }

  // =============== 状态检查方法 ===============

  /**
   * 检查元素是否可见 - 立即判断，不等待
   * 符合Playwright的行为：立即返回当前状态，不进行等待
   */
  async isVisible(): Promise<boolean> {
    try {
      // 获取当前已存在的元素，不等待
      const elements = this.getCurrentElements();
      if (elements.length === 0) {
        return false; // 没有找到元素
      }
      
      // 检查第一个匹配元素的可见性
      const element = elements[0];
      return this.isElementVisible(element);
    } catch (error) {
      return false;
    }
  }

  /**
   * 检查元素是否隐藏
   */
  async isHidden(): Promise<boolean> {
    return !(await this.isVisible());
  }

  /**
   * 检查元素是否启用 - 立即判断，不等待
   */
  async isEnabled(): Promise<boolean> {
    try {
      const elements = this.getCurrentElements();
      if (elements.length === 0) {
        return false;
      }
      
      const element = elements[0] as HTMLInputElement | HTMLButtonElement | HTMLSelectElement | HTMLTextAreaElement;
      return !element.disabled && !element.hasAttribute('disabled');
    } catch (error) {
      return false;
    }
  }

  /**
   * 检查元素是否禁用
   */
  async isDisabled(): Promise<boolean> {
    return !(await this.isEnabled());
  }

  /**
   * 检查复选框是否选中 - 立即判断，不等待
   */
  async isChecked(): Promise<boolean> {
    try {
      const elements = this.getCurrentElements();
      if (elements.length === 0) {
        return false;
      }
      
      const element = elements[0] as HTMLInputElement;
      return element.checked || false;
    } catch (error) {
      return false;
    }
  }

  /**
   * 检查元素是否具有指定的CSS类 - 立即判断，不等待
   */
  async hasClass(className: string): Promise<boolean> {
    try {
      const elements = this.getCurrentElements();
      if (elements.length === 0) {
        return false;
      }
      
      const element = elements[0];
      return element.classList.contains(className);
    } catch (error) {
      return false;
    }
  }

  // =============== 内容获取方法 ===============

  /**
   * 获取文本内容
   */
  async textContent(): Promise<string> {
    const element = await this.getElement();
    return element.textContent || '';
  }

  /**
   * 获取内部文本
   */
  async innerText(): Promise<string> {
    const element = await this.getElement() as HTMLElement;
    return element.innerText || '';
  }

  /**
   * 获取 HTML 内容
   */
  async innerHTML(): Promise<string> {
    const element = await this.getElement() as HTMLElement;
    return element.innerHTML || '';
  }

  /**
   * 获取属性值
   */
  async getAttribute(name: string): Promise<string | null> {
    const element = await this.getElement();
    return element.getAttribute(name);
  }

  /**
   * 获取输入值
   */
  async inputValue(): Promise<string> {
    const element = await this.getElement() as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    return element.value || '';
  }

  // =============== JavaScript 执行方法 ===============

  /**
   * 在第一个匹配的元素上执行 JavaScript 函数
   */
  async evaluate<R, Arg = any>(
    pageFunction: (element: Element, arg?: Arg) => R | Promise<R>,
    arg?: Arg
  ): Promise<R> {
    const element = await this.getElement();
    
    try {
      // 直接在当前上下文中执行函数
      const result = await pageFunction(element, arg);
      
      // 确保返回值是可序列化的
      if (result !== undefined && result !== null) {
        // 尝试序列化和反序列化以验证可序列化性
        JSON.parse(JSON.stringify(result));
      }
      
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Evaluation failed: ${error.message}`);
      }
      throw new Error('Evaluation failed with unknown error');
    }
  }

  /**
   * 在所有匹配的元素上执行 JavaScript 函数
   */
  async evaluateAll<R, Arg = any>(
    pageFunction: (elements: Element[], arg?: Arg) => R | Promise<R>,
    arg?: Arg
  ): Promise<R> {
    const elements = this.getCurrentElements();
    
    try {
      // 直接在当前上下文中执行函数
      const result = await pageFunction(elements, arg);
      
      // 确保返回值是可序列化的
      if (result !== undefined && result !== null) {
        JSON.parse(JSON.stringify(result));
      }
      
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`EvaluateAll failed: ${error.message}`);
      }
      throw new Error('EvaluateAll failed with unknown error');
    }
  }

  /**
   * 在第一个匹配的元素上执行 JavaScript 函数，返回元素引用而非序列化值
   * 注意：在DOM环境中，我们直接返回元素引用，这与浏览器环境中的JSHandle不同
   */
  async evaluateHandle<R, Arg = any>(
    pageFunction: (element: Element, arg?: Arg) => R | Promise<R>,
    arg?: Arg
  ): Promise<R> {
    const element = await this.getElement();
    
    try {
      // 在DOM环境中直接执行并返回结果
      // 不进行序列化检查，允许返回DOM对象等不可序列化的值
      const result = await pageFunction(element, arg);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`EvaluateHandle failed: ${error.message}`);
      }
      throw new Error('EvaluateHandle failed with unknown error');
    }
  }

  // =============== 查询方法 ===============

  /**
   * 根据选择器查询元素
   */
  private queryElementsBySelector(selector: string, parentElements?: Element[]): Element[] {
    if (parentElements && parentElements.length > 0) {
      const allResults: Element[] = [];
      
      // 在每个父元素中查找子元素
      for (const parentElement of parentElements) {
        let childElements: Element[] = [];
        
        if (selector.startsWith('xpath=')) {
          const xpath = selector.substring(6);
          const doc = this.getDocument();
          const result = doc.evaluate(xpath, parentElement, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
          for (let i = 0; i < result.snapshotLength; i++) {
            const element = result.snapshotItem(i);
            if (element) childElements.push(element as Element);
          }
        } else {
          childElements = Array.from(parentElement.querySelectorAll(selector));
        }
        
        allResults.push(...childElements);
      }
      
      return allResults;
    }
    
    // 全局查询 - 如果没有父元素或父元素为空数组
    const doc = this.getDocument();
    if (selector.startsWith('xpath=')) {
      const xpath = selector.substring(6);
      const result = doc.evaluate(xpath, doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      const elements: Element[] = [];
      for (let i = 0; i < result.snapshotLength; i++) {
        const element = result.snapshotItem(i);
        if (element) elements.push(element as Element);
      }
      return elements;
    } else {
      return Array.from(doc.querySelectorAll(selector));
    }
  }

  /**
   * 根据角色查询元素
   */
  private queryElementsByRole(role: string, options: { name?: string | RegExp; exact?: boolean } = {}, parentElements?: Element[]): Element[] {
    const { name, exact = false } = options;
    const roleOptions: RoleOptions = { exact };
    
    // 使用共享工具函数获取角色选择器
    const roleSelector = getRoleSelector(role, roleOptions);
    
    // 查询角色元素
    const elements = this.queryElementsBySelector(roleSelector, parentElements);
    
    // 如果指定了 name，应用 accessible name 过滤
    if (name) {
      return elements.filter(element => 
        elementMatchesAccessibleName(element, name, exact)
      );
    }
    
    return elements;
  }

  /**
   * 根据文本查询元素
   */
  private queryElementsByText(text: string, options: { exact?: boolean } = {}, parentElements?: Element[]): Element[] {
    const { exact = false } = options;
    const selector = buildGetByTextSelector(text, exact);
    return this.queryElementsBySelector(selector, parentElements);
  }

  /**
   * 根据标签查询元素
   */
  private queryElementsByLabel(labelText: string, options: { exact?: boolean } = {}, parentElements?: Element[]): Element[] {
    const { exact = false } = options;
    const selector = buildGetByLabelSelector(labelText, exact);
    return this.queryElementsBySelector(selector, parentElements);
  }

  /**
   * 根据占位符查询元素
   */
  private queryElementsByPlaceholder(placeholder: string, options: { exact?: boolean } = {}, parentElements?: Element[]): Element[] {
    const { exact = false } = options;
    const selector = buildGetByPlaceholderSelector(placeholder, exact);
    return this.queryElementsBySelector(selector, parentElements);
  }

  /**
   * 根据测试ID查询元素
   */
  private queryElementsByTestId(testId: string, parentElements?: Element[]): Element[] {
    const selector = buildGetByTestIdSelector(testId);
    return this.queryElementsBySelector(selector, parentElements);
  }

  /**
   * 根据标题查询元素
   */
  private queryElementsByTitle(title: string, options: { exact?: boolean } = {}, parentElements?: Element[]): Element[] {
    const { exact = false } = options;
    const selector = buildGetByTitleSelector(title, exact);
    return this.queryElementsBySelector(selector, parentElements);
  }

  /**
   * 获取匹配元素的数量
   */
  async count(): Promise<number> {
    return this.getCurrentElements().length;
  }

  /**
   * 获取所有匹配的 locator
   */
  async all(): Promise<LocatorAdapter[]> {
    const elements = this.getCurrentElements();
    
    return elements.map(element => {
      const strategy: QueryStrategy = { type: 'selector', selector: this.buildUniqueSelector(element) };
      const locator = new LocatorAdapter(strategy, this.page);
      locator._element = element;
      return locator;
    });
  }

  // =============== 自动等待机制 ===============

  /**
   * 等待元素满足指定条件
   */
  async waitFor(options: ElementWaitOptions = {}): Promise<Element> {
    const { 
      timeout = 30000, 
      state = 'visible' 
    } = options;

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const element = await this.getElementImmediate();
        
        switch (state) {
          case 'visible':
            if (this.isElementVisible(element)) {
              return element;
            }
            break;
          case 'hidden':
            if (!this.isElementVisible(element)) {
              return element;
            }
            break;
          case 'attached':
            if (this.getDocument().contains(element)) {
              return element;
            }
            break;
          case 'detached':
            if (!this.getDocument().contains(element)) {
              throw new Error('元素已分离');
            }
            break;
        }
      } catch (error) {
        if (state === 'detached') {
          throw new Error('元素已分离');
        }
        // 对于其他状态，继续等待
      }

      // 等待一小段时间后重试
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error(`等待超时 (${timeout}ms): ${this.selector}, 状态: ${state}`);
  }

  /**
   * 检查元素是否可见
   */
  private isElementVisible(element: Element): boolean {
    // 获取正确的 window 对象（支持 iframe 环境）
    const contextWindow = this.getContextWindow();
    if (typeof contextWindow === 'undefined' || !contextWindow.getComputedStyle) {
      return true;
    }

    const style = contextWindow.getComputedStyle(element);
    
    // 检查基本可见性属性
    if (style.display === 'none' || 
        style.visibility === 'hidden') {
      return false;
    }

    // 检查元素尺寸
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return false;
    }

    return true;
  }

  /**
   * 检查元素是否可点击
   */
  private async isElementClickable(element: Element): Promise<boolean> {
    if (!this.isElementVisible(element)) {
      return false;
    }

    // 检查是否被禁用
    if (this.isHTMLElement(element, 'HTMLElement') && element.hasAttribute('disabled')) {
      return false;
    }

    // 先不检查位置，让click可以点击滚动条外的内容
    // // 检查是否被其他元素遮挡
    // const rect = element.getBoundingClientRect();
    // const centerX = rect.left + rect.width / 2;
    // const centerY = rect.top + rect.height / 2;
    
    // const elementAtPoint = document.elementFromPoint(centerX, centerY);
    
    // // 如果点击点的元素是目标元素或其子元素，则可点击
    // return element === elementAtPoint || element.contains(elementAtPoint);
    return true;
  }

  /**
   * 等待元素可点击
   */
  private async waitForClickable(element: Element, timeout: number = 30000): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await this.isElementClickable(element)) {
        return;
      }

      // 等待一小段时间后重试
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error(`等待元素可点击超时 (${timeout}ms): ${this.selector}`);
  }

  /**
   * 检查元素是否可编辑
   */
  private isElementEditable(element: Element): boolean {
    if (!this.isElementVisible(element)) {
      return false;
    }

    // 检查是否被禁用
    if (this.isHTMLElement(element, 'HTMLElement') && (
        element.hasAttribute('disabled') 
        // 暂时不支持 readonly 属性
        // element.hasAttribute('readonly')
    )) {
      return false;
    }

    // 检查是否是可编辑元素
    if (this.isHTMLElement(element, 'HTMLInputElement') || 
        this.isHTMLElement(element, 'HTMLTextAreaElement') || 
        this.isHTMLElement(element, 'HTMLSelectElement')) {
      return true;
    }

    // 检查 contenteditable
    if (this.isHTMLElement(element, 'HTMLElement') && (element as HTMLElement).isContentEditable) {
      return true;
    }

    return false;
  }

  /**
   * 等待元素可编辑
   */
  private async waitForEditable(element: Element, timeout: number = 30000): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (this.isElementEditable(element)) {
        return;
      }

      // 等待一小段时间后重试
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error(`等待元素可编辑超时 (${timeout}ms): ${this.selector}`);
  }

  /**
   * 立即获取元素（不等待）
   */
  private async getElementImmediate(): Promise<Element> {
    if (this._element && this.getDocument().contains(this._element)) {
      return this._element;
    }

    const elements = this.getCurrentElements();
    if (elements.length === 0) {
      throw new Error(`找不到元素: ${this.selector}`);
    }

    return elements[0];
  }

  /**
   * 获取单个元素（自动等待可见）
   */
  async getElement(): Promise<Element> {
    return await this.waitFor({ state: 'visible', timeout: 30000 });
  }

  /**
   * 应用过滤器
   */
  private applyFilters(elements: Element[]): Element[] {
    let filtered = elements;
    
    for (const filter of this.filters) {
      filtered = this.applyFilter(filtered, filter);
    }
    
    return filtered;
  }

  /**
   * 应用单个过滤器
   */
  private applyFilter(elements: Element[], filter: FilterOptions): Element[] {
    if (typeof filter.position === 'number') {
      return elements[filter.position] ? [elements[filter.position]] : [];
    }
    
    if (filter.position === 'last') {
      return elements.length > 0 ? [elements[elements.length - 1]] : [];
    }
    
    if (filter.hasText) {
      return elements.filter(element => {
        // filter.hasText 只匹配元素的文本内容，不匹配 accessible name 相关属性
        return elementMatchesText(element, filter.hasText!, filter.exact);
      });
    }
    
    if (filter.hasAccessibleName) {
      return elements.filter(element => {
        // filter.hasAccessibleName 匹配完整的 accessible name
        return elementMatchesAccessibleName(element, filter.hasAccessibleName!, filter.exact);
      });
    }
    
    if (filter.hasNotText) {
      return elements.filter(element => {
        const text = element.textContent || (element as HTMLElement).innerText || '';
        if (filter.hasNotText instanceof RegExp) {
          return !filter.hasNotText.test(text);
        }
        return !text.includes(filter.hasNotText as string);
      });
    }
    
    return elements;
  }

  /**
   * 构建唯一选择器
   */
  private buildUniqueSelector(element: Element): string {
    if (element.id) {
      return `#${element.id}`;
    }
    
    const path: string[] = [];
    let current: Element | null = element;
    
    while (current && current !== this.getDocument().body) {
      let selector = current.tagName.toLowerCase();
      
      if (current.className) {
        const classes = current.className.split(' ').filter(cls => cls.trim());
        if (classes.length > 0) {
          selector += '.' + classes.join('.');
        }
      }
      
      const siblings = Array.from(current.parentNode?.children || []).filter(
        child => child.tagName === current!.tagName
      );
      
      if (siblings.length > 1) {
        const index = siblings.indexOf(current);
        selector += `:nth-of-type(${index + 1})`;
      }
      
      path.unshift(selector);
      current = current.parentElement;
    }
    
    return path.join(' > ');
  }

  /**
   * 获取 iframe 元素的 contentFrame
   * 适用于通过 Locator 查找 iframe 元素再获取其 frame 的场景
   */
  async contentFrame(): Promise<FrameAdapterType | null> {
    try {
      // 等待元素出现
      const element = await this.waitFor({ state: 'attached', timeout: 10000 });
      
      // 检查是否是 iframe 或 frame 元素
      if (!element || (element.tagName.toLowerCase() !== 'iframe' && element.tagName.toLowerCase() !== 'frame')) {
        this.logger.warn(`Element is not an iframe or frame: ${this.selector}`);
        return null;
      }
      
      const frameElement = element as HTMLIFrameElement;
      
      // 检查 frame 是否可访问
      try {
        const frameWindow = frameElement.contentWindow;
        if (!frameWindow) {
          this.logger.warn(`Cannot access frame window (cross-origin?): ${this.selector}`);
          return null;
        }
        
        const frameDocument = frameWindow.document;
        if (!frameDocument) {
          this.logger.warn(`Cannot access frame document: ${this.selector}`);
          return null;
        }
      } catch (error) {
        this.logger.warn(`Frame access denied (cross-origin?): ${this.selector}`, error);
        return null;
      }
      
      // 创建 FrameAdapter 实例 - 支持测试和生产环境
      let FrameAdapterClass: any;
      if (typeof window !== 'undefined' && (window as any).PlaywrightFrameAdapter) {
        FrameAdapterClass = (window as any).PlaywrightFrameAdapter;
      } else if ((global as any).window && (global as any).window.PlaywrightFrameAdapter) {
        FrameAdapterClass = (global as any).window.PlaywrightFrameAdapter;
      }
      
      if (!FrameAdapterClass) {
        throw new Error('PlaywrightFrameAdapter not found in global scope');
      }
      
      try {
        const frameAdapter = new FrameAdapterClass(frameElement);
        this.logger.debug(`Created frame adapter for: ${this.selector}`);
        return frameAdapter;
      } catch (error) {
        this.logger.error(`Failed to create frame adapter: ${(error as Error).message}`);
        return null;
      }
      
    } catch (error) {
      this.logger.error(`contentFrame failed: ${(error as Error).message}`);
      return null;
    }
  }
}


// 导出给浏览器使用
if (typeof window !== 'undefined') {
  window.PlaywrightLocatorAdapter = LocatorAdapter;
}


// ES6 模块导出
export default LocatorAdapter;