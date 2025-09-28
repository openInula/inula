/// <reference path="../types/global.d.ts" />
import type { 
  LocatorOptions,
  BaseLocator,
  FrameAdapter as FrameAdapterType,
  EventSimulator,
} from '../../types/index.js';
import { BasePageContext, type PageContext } from './base-page-context.js';
import FrameLocatorAdapter from './frame-locator-adapter.js';

/**
 * Frame 适配器 - 实现 Playwright Frame API
 * 继承 BasePageContext，在 iframe 上下文中执行操作
 */
export class FrameAdapter extends BasePageContext {
  private readonly frameElement: HTMLIFrameElement;
  public readonly frameDocument: Document;
  private readonly frameWindow: Window;
  public readonly eventSimulator: EventSimulator;

  constructor(frameElement: HTMLIFrameElement) {
    super();
    this.frameElement = frameElement;
    
    // 验证 frame 是否可访问
    const frameWindow = frameElement.contentWindow;
    if (!frameWindow) {
      throw new Error('Cannot access frame window (cross-origin?)');
    }
    
    const frameDocument = frameWindow.document;
    if (!frameDocument) {
      throw new Error('Cannot access frame document');
    }
    
    this.frameWindow = frameWindow;
    this.frameDocument = frameDocument;
    this.eventSimulator = new window.PlaywrightEventSimulator();
    
    // 不再需要创建专门的 WaitManager，使用基类的通用方法
  }

  /**
   * 获取 frame 的页面上下文
   */
  protected getContext(): PageContext {
    return {
      document: this.frameDocument,
      window: this.frameWindow
    };
  }

  // =============== Frame 特有方法 ===============

  /**
   * 获取 frame 的 URL
   */
  url(): string {
    try {
      return this.frameWindow.location.href;
    } catch (error) {
      // Cross-origin frame
      return this.frameElement.src || '';
    }
  }

  /**
   * 检查 frame 是否分离
   */
  isDetached(): boolean {
    return !document.contains(this.frameElement);
  }

  /**
   * 导航到指定 URL
   */
  async goto(url: string, options: { waitUntil?: 'load' | 'domcontentloaded'; timeout?: number } = {}): Promise<{ url: string; status: number }> {
    const { waitUntil = 'load' } = options;
    
    this.frameElement.src = url;
    
    if (waitUntil === 'load') {
      await this.waitForLoadState('load');
    } else {
      await this.waitForLoadState('domcontentloaded');
    }
    
    return { url: this.url(), status: 200 };
  }

  /**
   * 等待加载状态
   */
  async waitForLoadState(state: 'load' | 'domcontentloaded' = 'load'): Promise<void> {
    return new Promise((resolve) => {
      if (state === 'load') {
        if (this.frameDocument.readyState === 'complete') {
          resolve();
          return;
        }
        this.frameWindow.addEventListener('load', () => resolve(), { once: true });
      } else {
        if (this.frameDocument.readyState === 'interactive' || this.frameDocument.readyState === 'complete') {
          resolve();
          return;
        }
        this.frameDocument.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
      }
    });
  }

  // =============== Frame 嵌套支持 ===============

  /**
   * 创建 FrameLocator（支持嵌套 iframe）
   */
  frameLocator(selector: string): FrameLocatorAdapter {
    return new FrameLocatorAdapter(selector, this);
  }

  /**
   * 获取当前 frame 中的所有子 frame 元素
   */
  frames(): HTMLIFrameElement[] {
    return Array.from(this.frameDocument.querySelectorAll('iframe, frame')) as HTMLIFrameElement[];
  }

  /**
   * 根据 URL 或 name 查找子 frame
   */
  frame(options: { url?: string | RegExp; name?: string }): FrameAdapterType | null {
    const frames = this.frames();
    
    if (options.url) {
      for (const frameElement of frames) {
        try {
          if (frameElement.src && this.matchesUrl(frameElement.src, options.url)) {
            return this.createNestedFrameAdapter(frameElement);
          }
          
          if (frameElement.contentWindow && this.matchesUrl(frameElement.contentWindow.location.href, options.url)) {
            return this.createNestedFrameAdapter(frameElement);
          }
        } catch (error) {
          continue;
        }
      }
    }
    
    if (options.name) {
      for (const frameElement of frames) {
        if (frameElement.name === options.name) {
          return this.createNestedFrameAdapter(frameElement);
        }
      }
    }
    
    return null;
  }

  /**
   * 等待子 frame 出现
   */
  async waitForFrame(selector: string, options: { timeout?: number } = {}): Promise<any> {
    const { timeout = 30000 } = options;
    const startTime = Date.now();
    const interval = 100;

    while (Date.now() - startTime < timeout) {
      const frameElement = this.frameDocument.querySelector(selector) as HTMLIFrameElement;
      if (frameElement && frameElement.tagName.toLowerCase() === 'iframe') {
        return this.createNestedFrameAdapter(frameElement);
      }
      await this.waitForTimeout(interval);
    }

    throw new Error(`Nested frame not found within timeout: ${selector}`);
  }

  /**
   * 创建嵌套 FrameAdapter 实例
   */
  private createNestedFrameAdapter(frameElement: HTMLIFrameElement): FrameAdapterType | null {
    const FrameAdapterClass = window.PlaywrightFrameAdapter;
    if (!FrameAdapterClass) {
      throw new Error('PlaywrightFrameAdapter not found in global scope');
    }
    
    try {
      return new FrameAdapterClass(frameElement);
    } catch (error) {
      this.logger.warn(`Cannot create nested frame adapter: ${(error as Error).message}`);
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

  // =============== 滚动重写 ===============

  /**
   * 滚动元素到可视区域（Frame 版本）
   */
  async scrollIntoViewIfNeeded(element: Element): Promise<void> {
    const rect = element.getBoundingClientRect();
    const frameRect = this.frameElement.getBoundingClientRect();
    
    // 检查元素是否在 frame 的可视区域内
    const isInViewport = rect.top >= 0 && rect.bottom <= frameRect.height &&
                        rect.left >= 0 && rect.right <= frameRect.width;
    
    if (!isInViewport) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await this.waitForTimeout(100);
      this.logger.debug('Element scrolled into view in frame');
    }
  }
}

export default FrameAdapter;