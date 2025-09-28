/// <reference path="../types/global.d.ts" />
import type { 
  ClickOptions, 
  FillOptions, 
  TypeOptions,
  LocatorOptions,
  FrameLocatorParent,
  FrameAdapter as FrameAdapterType
} from '../../types/index.js';

/**
 * FrameLocator 适配器 - 实现 Playwright FrameLocator API
 * 用于延迟定位和操作 iframe
 */
export class FrameLocatorAdapter {
  private readonly selector: string;
  private readonly parentPage: FrameLocatorParent; // PageAdapter 或 FrameAdapter

  constructor(selector: string, parentPage: FrameLocatorParent) {
    this.selector = selector;
    this.parentPage = parentPage;
  }

  /**
   * 获取 FrameAdapter 实例（延迟获取）
   */
  private getFrameAdapter(): FrameAdapterType {
    const frameElement = this.getFrameElement();
    const adapter = this.parentPage.createFrameAdapter ? 
      this.parentPage.createFrameAdapter(frameElement) :
      this.createFrameAdapter(frameElement);
    
    if (!adapter) {
      throw new Error('Failed to create frame adapter');
    }
    
    return adapter;
  }

  /**
   * 获取 iframe 元素
   */
  private getFrameElement(): HTMLIFrameElement {
    const doc = this.getParentDocument();
    const frameElement = doc.querySelector(this.selector) as HTMLIFrameElement;
    
    if (!frameElement) {
      throw new Error(`Frame not found: ${this.selector}`);
    }
    
    if (frameElement.tagName.toLowerCase() !== 'iframe') {
      throw new Error(`Element is not an iframe: ${this.selector}`);
    }
    
    return frameElement;
  }

  /**
   * 获取父文档
   */
  private getParentDocument(): Document {
    // 如果父页面是 FrameAdapter，使用其 frameDocument
    if (this.parentPage.frameDocument) {
      return this.parentPage.frameDocument;
    }
    // 否则使用主文档
    return document;
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
      throw new Error(`Cannot create frame adapter: ${(error as Error).message}`);
    }
  }

  // =============== Playwright FrameLocator API ===============

  /**
   * 点击 iframe 中的元素
   */
  async click(selector: string, options?: ClickOptions): Promise<void> {
    const frame = this.getFrameAdapter();
    return await frame.click(selector, options);
  }

  /**
   * 双击 iframe 中的元素
   */
  async dblclick(selector: string, options?: ClickOptions): Promise<void> {
    const frame = this.getFrameAdapter();
    return await frame.dblclick(selector, options);
  }

  /**
   * 填充 iframe 中的表单
   */
  async fill(selector: string, value: string, options?: FillOptions): Promise<void> {
    const frame = this.getFrameAdapter();
    return await frame.fill(selector, value, options);
  }

  /**
   * 在 iframe 中输入文本
   */
  async type(selector: string, text: string, options?: TypeOptions): Promise<void> {
    const frame = this.getFrameAdapter();
    return await frame.type(selector, text, options);
  }

  /**
   * 在 iframe 中按键
   */
  async press(selector: string, key: string, options?: TypeOptions): Promise<void> {
    const frame = this.getFrameAdapter();
    return await frame.press(selector, key, options);
  }

  /**
   * 悬停在 iframe 中的元素上
   */
  async hover(selector: string): Promise<void> {
    const frame = this.getFrameAdapter();
    return await frame.hover(selector);
  }

  /**
   * 选择 iframe 中的复选框
   */
  async check(selector: string): Promise<void> {
    const frame = this.getFrameAdapter();
    return await frame.check(selector);
  }

  /**
   * 取消选择 iframe 中的复选框
   */
  async uncheck(selector: string): Promise<void> {
    const frame = this.getFrameAdapter();
    return await frame.uncheck(selector);
  }

  /**
   * 选择 iframe 中的下拉选项
   */
  async selectOption(selector: string, values: string | string[]): Promise<void> {
    const frame = this.getFrameAdapter();
    return await frame.selectOption(selector, values);
  }

  /**
   * 聚焦 iframe 中的元素
   */
  async focus(selector: string): Promise<void> {
    const frame = this.getFrameAdapter();
    return await frame.focus(selector);
  }

  /**
   * 等待 iframe 中的元素
   */
  async waitForSelector(selector: string, options?: { timeout?: number; state?: 'attached' | 'detached' | 'visible' | 'hidden' }): Promise<Element> {
    const frame = this.getFrameAdapter();
    const element = await frame.waitForSelector(selector, options);
    if (!element) {
      throw new Error(`Element not found in frame: ${selector}`);
    }
    return element;
  }

  /**
   * 等待指定时间
   */
  async waitForTimeout(ms: number): Promise<void> {
    const frame = this.getFrameAdapter();
    return frame.waitForTimeout(ms);
  }

  /**
   * 创建 iframe 中的 Locator
   */
  locator(selector: string, options?: LocatorOptions): any {
    const frame = this.getFrameAdapter();
    return frame.locator(selector, options);
  }

  // =============== 现代定位器方法 ===============

  /**
   * 根据角色定位 iframe 中的元素
   */
  getByRole(role: string, options?: { name?: string; exact?: boolean; level?: number }): any {
    const frame = this.getFrameAdapter();
    return frame.getByRole(role, options);
  }

  /**
   * 根据文本定位 iframe 中的元素
   */
  getByText(text: string, options?: { exact?: boolean }): any {
    const frame = this.getFrameAdapter();
    return frame.getByText(text, options);
  }

  /**
   * 根据标签定位 iframe 中的元素
   */
  getByLabel(text: string, options?: { exact?: boolean }): any {
    const frame = this.getFrameAdapter();
    return frame.getByLabel(text, options);
  }

  /**
   * 根据占位符定位 iframe 中的元素
   */
  getByPlaceholder(text: string, options?: { exact?: boolean }): any {
    const frame = this.getFrameAdapter();
    return frame.getByPlaceholder(text, options);
  }

  /**
   * 根据测试 ID 定位 iframe 中的元素
   */
  getByTestId(testId: string): any {
    const frame = this.getFrameAdapter();
    return frame.getByTestId(testId);
  }

  /**
   * 根据标题定位 iframe 中的元素
   */
  getByTitle(text: string, options?: { exact?: boolean }): any {
    const frame = this.getFrameAdapter();
    return frame.getByTitle(text, options);
  }

  // =============== 嵌套 FrameLocator 支持 ===============

  /**
   * 创建嵌套的 FrameLocator
   */
  frameLocator(selector: string): FrameLocatorAdapter {
    const frame = this.getFrameAdapter();
    return new FrameLocatorAdapter(selector, frame);
  }

  // =============== 获取实际 Frame 对象 ===============

  /**
   * 获取实际的 FrameAdapter 对象
   * 这个方法不是标准的 Playwright API，但可以用于高级操作
   */
  frame(): any {
    return this.getFrameAdapter();
  }

  // =============== 属性获取方法 ===============

  /**
   * 获取 iframe 中元素的文本内容
   */
  async textContent(selector: string): Promise<string | null> {
    const frame = this.getFrameAdapter();
    return await frame.textContent(selector);
  }

  /**
   * 获取 iframe 中元素的内部 HTML
   */
  async innerHTML(selector: string): Promise<string> {
    const frame = this.getFrameAdapter();
    return await frame.innerHTML(selector);
  }

  /**
   * 获取 iframe 中元素的属性
   */
  async getAttribute(selector: string, name: string): Promise<string | null> {
    const frame = this.getFrameAdapter();
    return await frame.getAttribute(selector, name);
  }

  /**
   * 检查 iframe 中元素是否可见
   */
  async isVisible(selector: string): Promise<boolean> {
    const frame = this.getFrameAdapter();
    return await frame.isVisible(selector);
  }
}

export default FrameLocatorAdapter;