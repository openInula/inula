/// <reference path="../types/global.d.ts" />
import type { 
  ClickOptions, 
  FillOptions, 
  TypeOptions,
  BoundingBox,
  ViewportSize,
  Logger,
  BaseLocator 
} from '../../types/index.js';
import { 
  getRoleSelector, 
  buildGetByTextSelector,
  buildGetByLabelSelector, 
  buildGetByPlaceholderSelector,
  buildGetByTestIdSelector,
  buildGetByTitleSelector,
  type RoleOptions 
} from '../utils/role-selector-utils.js';

/**
 * 页面上下文接口 - 统一 Page 和 Frame 的操作环境
 */
export interface PageContext {
  readonly document: Document;
  readonly window: Window;
}

/**
 * 基础页面操作类 - Page 和 Frame 的共同基类
 */
export abstract class BasePageContext {
  public readonly logger: Logger;
  protected abstract getContext(): PageContext;

  constructor() {
    this.logger = new (window.PlaywrightLogger || (console as any))() as Logger;
  }

  // =============== 基本信息方法 ===============

  /**
   * 获取标题
   */
  async title(): Promise<string> {
    return this.getContext().document.title;
  }

  /**
   * 获取内容
   */
  async content(): Promise<string> {
    return this.getContext().document.documentElement.outerHTML;
  }

  // =============== 元素交互方法 ===============

  /**
   * 等待元素
   */
  async waitForSelector(selector: string, options: { timeout?: number; state?: string } = {}): Promise<Element> {
    const { timeout = 30000, state = 'visible' } = options;
    
    // 如果是 xpath，需要特殊处理（只有 PageAdapter 支持）
    if (selector.startsWith('xpath=')) {
      // 检查子类是否支持 waitForXPath
      if ('waitForXPath' in this && typeof (this as any).waitForXPath === 'function') {
        return await (this as any).waitForXPath(selector.substring(6), { timeout });
      } else {
        throw new Error('XPath selectors are not supported in this context');
      }
    }
    
    // 处理 :visible 和 :hidden 伪类选择器
    let actualSelector = selector;
    let requiredState = state;
    
    if (selector.includes(':visible')) {
      actualSelector = selector.replace(':visible', '');
      requiredState = 'visible';
    } else if (selector.includes(':hidden')) {
      actualSelector = selector.replace(':hidden', '');
      requiredState = 'hidden';
    }
    
    // 等待元素存在
    const element = await this.waitForElementInContext(actualSelector, timeout);
    
    // 检查可见性状态
    if (requiredState === 'visible') {
      await this.waitForConditionInContext(
        () => {
          const rect = element.getBoundingClientRect();
          const context = this.getContext();
          const style = context.window.getComputedStyle(element as HTMLElement);
          return rect.width > 0 && rect.height > 0 && 
                 style.visibility !== 'hidden' && style.display !== 'none';
        },
        timeout,
        `元素 "${actualSelector}" 等待可见超时`
      );
    } else if (requiredState === 'hidden') {
      await this.waitForConditionInContext(
        () => {
          const rect = element.getBoundingClientRect();
          const context = this.getContext();
          const style = context.window.getComputedStyle(element as HTMLElement);
          return rect.width === 0 || rect.height === 0 || 
                 style.visibility === 'hidden' || style.display === 'none';
        },
        timeout,
        `元素 "${actualSelector}" 等待隐藏超时`
      );
    }
    
    return element;
  }

  /**
   * 点击元素
   */
  async click(selector: string, _options?: ClickOptions): Promise<void> {
    const element = await this.waitForSelector(selector);
    const context = this.getContext();
    
    const clickEvent = new (context.window as any).Event('click', {
      bubbles: true,
      cancelable: true
    });
    
    element.dispatchEvent(clickEvent);
    this.logger.debug(`Clicked: ${selector}`);
  }

  /**
   * 双击元素
   */
  async dblclick(selector: string, _options?: ClickOptions): Promise<void> {
    const element = await this.waitForSelector(selector);
    const context = this.getContext();
    
    const dblClickEvent = new (context.window as any).MouseEvent('dblclick', {
      bubbles: true,
      cancelable: true
    });
    
    element.dispatchEvent(dblClickEvent);
    this.logger.debug(`Double clicked: ${selector}`);
  }

  /**
   * 填充表单
   */
  async fill(selector: string, value: string, _options?: FillOptions): Promise<void> {
    const element = await this.waitForSelector(selector) as HTMLInputElement | HTMLTextAreaElement;
    const context = this.getContext();
    
    // 检查元素是否可以填充 - 对于测试环境中的 mock，只检查是否有 value 属性
    if (!('value' in element)) {
      throw new Error(`Element is not fillable: ${selector}`);
    }

    // 清空现有值
    (element as any).value = '';
    // 设置新值
    (element as any).value = value;

    // 触发 input 和 change 事件
    const inputEvent = new (context.window as any).Event('input', {
      bubbles: true,
      cancelable: true
    });
    const changeEvent = new (context.window as any).Event('change', {
      bubbles: true,
      cancelable: true
    });

    element.dispatchEvent(inputEvent);
    element.dispatchEvent(changeEvent);
    
    this.logger.debug(`填充: ${selector} = "${value}"`);
  }

  /**
   * 输入文本
   */
  async type(selector: string, text: string, options: TypeOptions = {}): Promise<void> {
    const element = await this.waitForSelector(selector);
    const context = this.getContext();
    const delay = options.delay || 0;

    // 聚焦元素
    (element as HTMLElement).focus();

    // 逐字符输入
    for (const char of text) {
      const keydownEvent = new (context.window as any).KeyboardEvent('keydown', {
        key: char,
        bubbles: true,
        cancelable: true
      });
      const keyupEvent = new (context.window as any).KeyboardEvent('keyup', {
        key: char,
        bubbles: true,
        cancelable: true
      });

      element.dispatchEvent(keydownEvent);
      
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        element.value += char;
        
        const inputEvent = new (context.window as any).Event('input', {
          bubbles: true,
          cancelable: true
        });
        element.dispatchEvent(inputEvent);
      }

      element.dispatchEvent(keyupEvent);

      if (delay > 0) {
        await this.waitForTimeout(delay);
      }
    }
    
    this.logger.debug(`Typed: ${selector} -> "${text}"`);
  }

  /**
   * 按键操作
   */
  async press(selector: string, key: string, _options?: TypeOptions): Promise<void> {
    const element = await this.waitForSelector(selector) as HTMLElement;
    const context = this.getContext();
    
    element.focus();
    
    const keyEvent = new (context.window as any).KeyboardEvent('keydown', {
      key: key,
      bubbles: true,
      cancelable: true
    });
    
    element.dispatchEvent(keyEvent);
    this.logger.debug(`Pressed key: ${selector} -> ${key}`);
  }

  /**
   * 悬停
   */
  async hover(selector: string): Promise<void> {
    const element = await this.waitForSelector(selector);
    const context = this.getContext();
    
    const mouseOverEvent = new (context.window as any).MouseEvent('mouseover', {
      bubbles: true,
      cancelable: true
    });

    element.dispatchEvent(mouseOverEvent);
    this.logger.debug(`Hovered: ${selector}`);
  }

  /**
   * 选择复选框
   */
  async check(selector: string): Promise<void> {
    const element = await this.waitForSelector(selector) as HTMLInputElement;
    const context = this.getContext();
    
    if (element.type === 'checkbox' || element.type === 'radio') {
      element.checked = true;
      element.dispatchEvent(new (context.window as any).Event('change', { bubbles: true }));
      this.logger.debug(`选择: ${selector}`);
    }
  }

  /**
   * 取消选择复选框
   */
  async uncheck(selector: string): Promise<void> {
    const element = await this.waitForSelector(selector) as HTMLInputElement;
    const context = this.getContext();
    
    if (element.type === 'checkbox') {
      element.checked = false;
      element.dispatchEvent(new (context.window as any).Event('change', { bubbles: true }));
      this.logger.debug(`取消选择: ${selector}`);
    }
  }

  /**
   * 选择下拉选项
   */
  async selectOption(selector: string, values: string | string[]): Promise<void> {
    const element = await this.waitForSelector(selector) as HTMLSelectElement;
    const context = this.getContext();
    
    if (element.tagName === 'SELECT') {
      if (Array.isArray(values)) {
        Array.from(element.options).forEach(option => {
          option.selected = values.includes(option.value) || values.includes(option.text);
        });
      } else {
        element.value = values;
      }
      element.dispatchEvent(new (context.window as any).Event('change', { bubbles: true }));
      this.logger.debug(`Selected option: ${selector} = ${values}`);
    }
  }

  /**
   * 聚焦元素
   */
  async focus(selector: string): Promise<void> {
    const element = await this.waitForSelector(selector) as HTMLElement;
    await this.scrollIntoViewIfNeeded(element);
    
    element.focus();
    this.logger.debug(`聚焦: ${selector}`);
  }

  // =============== 脚本执行方法 ===============

  /**
   * 在上下文中执行脚本
   */
  async evaluate<T>(fn: (...args: any[]) => T, ...args: any[]): Promise<T> {
    const context = this.getContext();
    try {
      return fn.apply(context.window, args);
    } catch (error) {
      this.logger.error('Script execution failed:', error);
      throw error;
    }
  }

  /**
   * 在上下文中执行脚本并返回句柄
   */
  async evaluateHandle<T>(fn: (...args: any[]) => T, ...args: any[]): Promise<T> {
    return this.evaluate(fn, ...args);
  }

  // =============== 元素信息获取方法 ===============

  /**
   * 获取元素文本内容
   */
  async textContent(selector: string): Promise<string | null> {
    const element = await this.waitForSelector(selector);
    return element.textContent;
  }

  /**
   * 获取元素内部 HTML
   */
  async innerHTML(selector: string): Promise<string> {
    const element = await this.waitForSelector(selector);
    return element.innerHTML;
  }

  /**
   * 获取元素属性
   */
  async getAttribute(selector: string, name: string): Promise<string | null> {
    const element = await this.waitForSelector(selector);
    return element.getAttribute(name);
  }

  /**
   * 检查元素是否可见
   */
  async isVisible(selector: string): Promise<boolean> {
    try {
      const element = await this.waitForSelector(selector);
      const context = this.getContext();
      const style = context.window.getComputedStyle(element as HTMLElement);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             style.opacity !== '0';
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取元素边界框
   */
  async boundingBox(selector: string): Promise<BoundingBox> {
    const element = await this.waitForSelector(selector);
    const context = this.getContext();
    const rect = element.getBoundingClientRect();
    
    return {
      x: rect.left + context.window.scrollX,
      y: rect.top + context.window.scrollY,
      width: rect.width,
      height: rect.height
    };
  }

  /**
   * 获取视口大小
   */
  viewportSize(): ViewportSize {
    const context = this.getContext();
    return { 
      width: context.window.innerWidth, 
      height: context.window.innerHeight 
    };
  }

  // =============== 辅助方法 ===============

  /**
   * 等待超时
   */
  async waitForTimeout(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 等待函数条件（使用通用等待逻辑）
   */
  async waitForFunction<T>(fn: () => T, options: { timeout?: number } = {}): Promise<T> {
    const { timeout = 30000 } = options;
    const context = this.getContext();
    let result: T;
    
    // 使用一个简化版的 waitForCondition 等待逻辑
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const check = async (): Promise<void> => {
        try {
          result = fn.call(context.window);
          if (result) {
            resolve(result);
            return;
          }
        } catch (error) {
          // 继续等待，忽略错误
        }

        if (Date.now() - startTime >= timeout) {
          reject(new Error(`waitForFunction 超时 (${timeout}ms)`));
          return;
        }

        setTimeout(check, 100);
      };

      check();
    });
  }

  /**
   * 滚动元素到可视区域
   */
  async scrollIntoViewIfNeeded(element: Element): Promise<void> {
    const rect = element.getBoundingClientRect();
    const context = this.getContext();
    const isInViewport = rect.top >= 0 && rect.bottom <= context.window.innerHeight &&
                        rect.left >= 0 && rect.right <= context.window.innerWidth;
    
    if (!isInViewport) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await this.waitForTimeout(100);
      this.logger.debug('Element scrolled into view');
    }
  }

  // =============== 现代定位器方法 ===============

  /**
   * 创建 Locator
   */
  locator(selector: string, options: Record<string, any> = {}): BaseLocator {
    const LocatorAdapterClass = window.PlaywrightLocatorAdapter;
    if (!LocatorAdapterClass) {
      throw new Error('PlaywrightLocatorAdapter not found in global scope');
    }
    return new LocatorAdapterClass(selector, this, options);
  }

  /**
   * 根据角色定位
   */
  getByRole(role: string, options: { name?: string; exact?: boolean; level?: number } = {}): BaseLocator {
    const { name, exact = false, level } = options;
    const roleOptions: RoleOptions = { exact, level };
    
    if (name) {
      const baseSelector = getRoleSelector(role, roleOptions);
      return this.locator(baseSelector).filter({
        hasAccessibleName: name,
        exact: exact
      });
    }
    
    const baseSelector = getRoleSelector(role, roleOptions);
    return this.locator(baseSelector);
  }

  /**
   * 根据文本定位
   */
  getByText(text: string, options: { exact?: boolean } = {}): BaseLocator {
    const { exact = false } = options;
    const selector = buildGetByTextSelector(text, exact);
    return this.locator(selector);
  }

  /**
   * 根据标签定位
   */
  getByLabel(text: string, options: { exact?: boolean } = {}): BaseLocator {
    const { exact = false } = options;
    const selector = buildGetByLabelSelector(text, exact);
    return this.locator(selector);
  }

  /**
   * 根据占位符定位
   */
  getByPlaceholder(text: string, options: { exact?: boolean } = {}): BaseLocator {
    const { exact = false } = options;
    const selector = buildGetByPlaceholderSelector(text, exact);
    return this.locator(selector);
  }

  /**
   * 根据测试 ID 定位
   */
  getByTestId(testId: string): BaseLocator {
    const selector = buildGetByTestIdSelector(testId);
    return this.locator(selector);
  }

  /**
   * 根据标题定位
   */
  getByTitle(text: string, options: { exact?: boolean } = {}): BaseLocator {
    const { exact = false } = options;
    const selector = buildGetByTitleSelector(text, exact);
    return this.locator(selector);
  }

  // =============== 抽象方法 ===============

  /**
   * 等待元素在上下文中出现
   */
  /**
   * 等待元素在上下文中出现（默认实现，子类可以覆盖）
   */
  protected async waitForElementInContext(selector: string, timeout: number): Promise<Element> {
    return await this.waitForElementInDocument(selector, timeout);
  }

  
  /**
   * 等待条件满足（由子类实现具体的等待逻辑）
   */
  /**
   * 等待条件满足（默认实现，子类可以覆盖）
   */
  protected async waitForConditionInContext<T>(
    conditionFn: () => T | Promise<T>, 
    timeout: number, 
    errorMessage: string
  ): Promise<T> {
    return await this.waitForConditionInDocument(conditionFn, timeout, errorMessage);
  }

  // =============== 通用等待方法（可以替代各种自定义 WaitManager）===============

  /**
   * 通用的元素查找方法，支持 CSS 选择器、XPath 和 text 选择器
   */
  protected querySelector(selector: string): Element | null {
    const context = this.getContext();
    const doc = context.document;
    
    if (selector.startsWith('xpath=')) {
      const xpath = selector.substring(6);
      const result = doc.evaluate(
        xpath,
        doc,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      return result.singleNodeValue as Element | null;
    } else if (selector.startsWith('text=')) {
      const text = selector.substring(5);
      const xpath = `//*[contains(normalize-space(text()), "${text}")]`;
      const result = doc.evaluate(
        xpath,
        doc,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      return result.singleNodeValue as Element | null;
    } else {
      return doc.querySelector(selector);
    }
  }

  /**
   * 通用的等待元素方法，使用当前上下文的 document
   */
  protected async waitForElementInDocument(selector: string, timeout: number = 30000): Promise<Element> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      // 立即检查
      const existing = this.querySelector(selector);
      if (existing) {
        this.logger.debug(`元素立即找到: ${selector}`);
        return resolve(existing);
      }

      let timeoutId: NodeJS.Timeout | undefined;
      let observer: MutationObserver | undefined;

      const cleanup = (): void => {
        if (timeoutId) clearTimeout(timeoutId);
        if (observer) observer.disconnect();
      };

      // 设置超时
      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error(`等待元素超时: ${selector} (${timeout}ms)`));
      }, timeout);

      // 监听 DOM 变化
      observer = new MutationObserver(() => {
        const element = this.querySelector(selector);
        if (element) {
          cleanup();
          const elapsed = Date.now() - startTime;
          this.logger.debug(`元素找到: ${selector} (${elapsed}ms)`);
          resolve(element);
        }
      });

      const context = this.getContext();
      const observeTarget = context.document.body || context.document.documentElement;
      observer.observe(observeTarget, {
        childList: true,
        subtree: true,
        attributes: true
      });
    });
  }

  /**
   * 通用的等待条件方法
   */
  protected async waitForConditionInDocument<T>(
    conditionFn: () => T | Promise<T>, 
    timeout: number = 30000, 
    errorMessage: string = '等待条件超时'
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const check = async (): Promise<void> => {
        try {
          const result = await conditionFn();
          if (result) {
            const elapsed = Date.now() - startTime;
            this.logger.debug(`条件满足 (${elapsed}ms)`);
            resolve(result);
            return;
          }
        } catch (error) {
          this.logger.debug('条件检查出错，继续等待:', (error as Error).message);
        }

        if (Date.now() - startTime >= timeout) {
          reject(new Error(`${errorMessage} (${timeout}ms)`));
          return;
        }

        setTimeout(check, 100);
      };

      check();
    });
  }

  /**
   * 等待URL匹配的通用方法
   */
  protected async waitForURLInDocument(urlPattern: string | RegExp, timeout: number = 30000): Promise<boolean> {
    return this.waitForConditionInDocument(
      () => {
        const context = this.getContext();
        const currentUrl = context.window.location.href;
        if (typeof urlPattern === 'string') {
          return currentUrl.includes(urlPattern);
        }
        if (urlPattern instanceof RegExp) {
          return urlPattern.test(currentUrl);
        }
        return false;
      },
      timeout,
      `等待URL变化超时: ${urlPattern}`
    );
  }

  /**
   * 等待加载状态的通用方法
   */
  protected async waitForLoadStateInDocument(state: 'load' | 'domcontentloaded' | 'networkidle' = 'load'): Promise<void> {
    return new Promise((resolve) => {
      const context = this.getContext();
      const doc = context.document;
      
      const checkState = (): void => {
        if (state === 'load' && doc.readyState === 'complete') {
          this.logger.debug('页面完全加载');
          resolve();
        } else if (state === 'domcontentloaded' && doc.readyState !== 'loading') {
          this.logger.debug('DOM 内容加载完成');
          resolve();
        } else if (state === 'networkidle') {
          // 简单实现：等待 500ms 无网络请求
          setTimeout(() => {
            this.logger.debug('网络空闲');
            resolve();
          }, 500);
        }
      };

      if (doc.readyState === 'complete' && state === 'load') {
        resolve();
      } else if (doc.readyState !== 'loading' && state === 'domcontentloaded') {
        resolve();
      } else {
        doc.addEventListener('readystatechange', checkState, { once: true });
      }
    });
  }
}