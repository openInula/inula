/// <reference path="../types/global.d.ts" />
import type { 
  PageGotoOptions, 
  ViewportSize,
  ClickOptions,
  TypeOptions,
  EventSimulator,
  FrameAdapter as FrameAdapterType
} from '../../types/index.js';
import { BasePageContext, type PageContext } from './base-page-context.js';
import FrameLocatorAdapter from './frame-locator-adapter.js';

/**
 * Page 适配器 - 实现 Playwright Page API
 * 继承 BasePageContext，避免与 FrameAdapter 的代码重复
 */
class PageAdapter extends BasePageContext {
  private readonly eventSimulator: EventSimulator;

  constructor() {
    super();
    // 不再需要创建 waitManager，使用基类的通用方法
    this.eventSimulator = new window.PlaywrightEventSimulator();
  }

  /**
   * 获取页面上下文
   */
  protected getContext(): PageContext {
    return {
      document: document,
      window: window
    };
  }

  // =============== 页面特有方法 ===============

  /**
   * 获取当前 URL
   */
  url(): string {
    return window.location.href;
  }

  // =============== 导航方法 ===============

  /**
   * 导航到指定 URL
   */
  async goto(url: string, options: PageGotoOptions = {}): Promise<{ url: string; status: number }> {
    const { waitUntil = 'load', timeout = 30000 } = options;
    
    this.logger.info(`导航到: ${url}`);
    
    if (window.location.href !== url) {
      window.location.href = url;
      await this.waitForLoadState(waitUntil);
    }
    
    return { url: window.location.href, status: 200 };
  }

  /**
   * 后退
   */
  async goBack(options: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' } = {}): Promise<void> {
    const { waitUntil = 'load' } = options;
    window.history.back();
    await this.waitForLoadState(waitUntil);
  }

  /**
   * 前进
   */
  async goForward(options: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' } = {}): Promise<void> {
    const { waitUntil = 'load' } = options;
    window.history.forward();
    await this.waitForLoadState(waitUntil);
  }

  /**
   * 刷新页面
   */
  async reload(options: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' } = {}): Promise<void> {
    const { waitUntil = 'load' } = options;
    window.location.reload();
    await this.waitForLoadState(waitUntil);
  }

  // =============== 重写部分方法以使用事件模拟器 ===============

  /**
   * 点击元素（使用事件模拟器）
   */
  async click(selector: string, options: ClickOptions = {}): Promise<void> {
    const element = await this.waitForSelector(selector);
    await this.scrollIntoViewIfNeeded(element);
    
    this.eventSimulator.simulateClick(element, options);
    this.logger.debug(`点击: ${selector}`);
  }

  /**
   * 双击元素（使用事件模拟器）
   */
  async dblclick(selector: string, options: ClickOptions = {}): Promise<void> {
    const element = await this.waitForSelector(selector);
    await this.scrollIntoViewIfNeeded(element);
    
    this.eventSimulator.simulateDoubleClick(element);
    this.logger.debug(`双击: ${selector}`);
  }

  /**
   * 按键操作（使用事件模拟器）
   */
  async press(selector: string, key: string, options: TypeOptions = {}): Promise<void> {
    const element = await this.waitForSelector(selector) as HTMLElement;
    element.focus();
    
    this.eventSimulator.simulateKeyPress(element, key, options);
    this.logger.debug(`按键: ${selector} -> ${key}`);
  }

  /**
   * 输入文本（使用事件模拟器）
   */
  async type(selector: string, text: string, options: TypeOptions = {}): Promise<void> {
    const element = await this.waitForSelector(selector) as HTMLInputElement | HTMLTextAreaElement;
    await this.eventSimulator.simulateTyping(element, text, options);
    this.logger.debug(`输入: ${selector} -> \"${text}\"`);
  }

  /**
   * 悬停（使用事件模拟器）
   */
  async hover(selector: string): Promise<void> {
    const element = await this.waitForSelector(selector);
    await this.scrollIntoViewIfNeeded(element);
    
    this.eventSimulator.simulateHover(element);
    this.logger.debug(`悬停: ${selector}`);
  }

  // =============== 等待方法重写 ===============

  /**
   * 等待 XPath 元素
   */
  async waitForXPath(xpath: string, options: { timeout?: number } = {}): Promise<Element> {
    const { timeout = 30000 } = options;
    let foundElement: Element | null = null;
    
    await this.waitForConditionInDocument(
      () => {
        const context = this.getContext();
        const result = context.document.evaluate(xpath, context.document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        foundElement = result.singleNodeValue as Element | null;
        return foundElement !== null;
      },
      timeout,
      `XPath 元素等待超时: ${xpath}`
    );
    
    if (!foundElement) {
      throw new Error(`XPath element not found: ${xpath}`);
    }
    
    return foundElement;
  }

  /**
   * 等待 URL
   */
  async waitForURL(url: string | RegExp, options: { timeout?: number } = {}): Promise<void> {
    const { timeout = 30000 } = options;
    await this.waitForURLInDocument(url, timeout);
  }

  /**
   * 等待加载状态
   */
  async waitForLoadState(state: 'load' | 'domcontentloaded' | 'networkidle' = 'load'): Promise<void> {
    return this.waitForLoadStateInDocument(state);
  }

  /**
   * 等待函数（使用基类通用方法）
   */
  async waitForFunction<T>(fn: () => T, options: { timeout?: number } = {}): Promise<T> {
    const { timeout = 30000 } = options;
    return this.waitForConditionInDocument(
      () => {
        const result = fn();
        return Boolean(result);
      },
      timeout,
      '等待函数条件超时'
    ) as Promise<T>;
  }

  // =============== 脚本相关方法 ===============

  /**
   * 添加脚本标签
   */
  async addScriptTag(options: { url?: string; path?: string; content?: string; type?: string } = {}): Promise<HTMLScriptElement> {
    const { url, content, type = 'text/javascript' } = options;
    
    const script = document.createElement('script');
    script.type = type;
    
    if (url) {
      script.src = url;
    } else if (content) {
      script.textContent = content;
    }
    
    document.head.appendChild(script);
    
    // 等待脚本加载
    if (url) {
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
    }
    
    this.logger.debug('添加脚本标签');
    return script;
  }

  /**
   * 添加样式标签
   */
  async addStyleTag(options: { url?: string; path?: string; content?: string } = {}): Promise<HTMLLinkElement | HTMLStyleElement> {
    const { url, content } = options;
    
    if (url) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
      return link;
    } else if (content) {
      const style = document.createElement('style');
      style.textContent = content;
      document.head.appendChild(style);
      return style;
    }

    throw new Error('Either url or content must be provided');
  }

  // =============== 视口方法 ===============

  /**
   * 设置视口大小（有限支持）
   */
  async setViewportSize(_size: ViewportSize): Promise<ViewportSize> {
    // 浏览器环境中无法直接设置视口大小
    this.logger.warn('浏览器环境中无法设置视口大小');
    return { width: window.innerWidth, height: window.innerHeight };
  }

  // =============== Frame 相关方法 ===============

  /**
   * 创建 FrameLocator
   */
  frameLocator(selector: string): FrameLocatorAdapter {
    return new FrameLocatorAdapter(selector, {
      frameDocument: undefined,
      waitForSelector: this.waitForSelector.bind(this),
      scrollIntoViewIfNeeded: this.scrollIntoViewIfNeeded.bind(this),
      waitForTimeout: this.waitForTimeout.bind(this),
      logger: this.logger,
      eventSimulator: this.eventSimulator,
      createFrameAdapter: this.createFrameAdapter.bind(this)
    });
  }

  /**
   * 获取页面中的所有 frame 元素
   */
  frames(): HTMLIFrameElement[] {
    return Array.from(document.querySelectorAll('iframe, frame')) as HTMLIFrameElement[];
  }

  /**
   * 获取主框架（当前页面）
   */
  mainFrame(): PageAdapter {
    return this;
  }

  /**
   * 根据 URL 或 name 查找 frame
   */
  frame(options: { url?: string | RegExp; name?: string }): FrameAdapterType | null {
    const frames = this.frames();
    
    if (options.url) {
      for (const frameElement of frames) {
        try {
          if (frameElement.src && this.matchesUrl(frameElement.src, options.url)) {
            return this.createFrameAdapter(frameElement);
          }
          
          if (frameElement.contentWindow && this.matchesUrl(frameElement.contentWindow.location.href, options.url)) {
            return this.createFrameAdapter(frameElement);
          }
        } catch (error) {
          continue;
        }
      }
    }
    
    if (options.name) {
      for (const frameElement of frames) {
        if (frameElement.name === options.name) {
          return this.createFrameAdapter(frameElement);
        }
      }
    }
    
    return null;
  }

  /**
   * 检查是否包含 frame
   */
  hasFrames(): boolean {
    return this.frames().length > 0;
  }

  /**
   * 等待 frame 出现
   */
  async waitForFrame(selector: string, options: { timeout?: number } = {}): Promise<any> {
    const { timeout = 30000 } = options;
    const startTime = Date.now();
    const interval = 100;

    while (Date.now() - startTime < timeout) {
      const frameElement = document.querySelector(selector) as HTMLIFrameElement;
      if (frameElement && frameElement.tagName.toLowerCase() === 'iframe') {
        return this.createFrameAdapter(frameElement);
      }
      await this.waitForTimeout(interval);
    }

    throw new Error(`Frame not found within timeout: ${selector}`);
  }

  /**
   * 创建 FrameAdapter 实例
   */
  private createFrameAdapter(frameElement: HTMLIFrameElement): FrameAdapterType | null {
    const FrameAdapterClass = window.PlaywrightFrameAdapter;
    if (!FrameAdapterClass) {
      throw new Error('PlaywrightFrameAdapter not found in global scope');
    }
    
    try {
      return new FrameAdapterClass(frameElement);
    } catch (error) {
      this.logger.warn(`Cannot create frame adapter: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * 检查 URL 是否匹配
   */
  private matchesUrl(url: string, pattern: string | RegExp): boolean {
    if (typeof pattern === 'string') {
      return url.includes(pattern);
    } else {
      return pattern.test(url);
    }
  }
}

// 导出给浏览器使用
if (typeof window !== 'undefined') {
  window.PlaywrightPageAdapter = PageAdapter;
}

// ES6 模块导出
export default PageAdapter;