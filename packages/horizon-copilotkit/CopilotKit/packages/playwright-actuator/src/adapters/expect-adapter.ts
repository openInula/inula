/// <reference path="../types/global.d.ts" />
import type { ExpectMatcherOptions, Logger } from '../../types/index.js';

/**
 * Expect 适配器 - 实现 Playwright Expect API
 */
class ExpectAdapter {
  private target: any;
  private isNot: boolean;
  private timeout: number;
  private logger: Logger;

  constructor(target: any, options: { timeout?: number } = {}) {
    this.target = target;
    this.isNot = false;
    this.timeout = options.timeout || 5000;
    this.logger = (typeof window !== 'undefined' && window.PlaywrightLogger) 
      ? new window.PlaywrightLogger() 
      : console as unknown as Logger;
  }

  /**
   * 取反
   */
  get not(): ExpectAdapter {
    const newExpect = new ExpectAdapter(this.target, { timeout: this.timeout });
    newExpect.isNot = !this.isNot;
    return newExpect;
  }

  // =============== 可见性断言 ===============

  /**
   * 断言元素可见
   */
  async toBeVisible(options: ExpectMatcherOptions = {}): Promise<void> {
    const timeout = options.timeout || this.timeout;
    const expected = !this.isNot;
    
    try {
      await this.waitForCondition(
        async () => {
          const isVisible = await this.target.isVisible();
          return isVisible === expected;
        },
        timeout,
        `期望元素${expected ? '可见' : '不可见'}`
      );
      
      this.logger.debug(`✅ 元素${expected ? '可见' : '不可见'}断言通过`);
    } catch (error) {
      const actualVisible = await this.target.isVisible();
      throw new Error(`期望元素${expected ? '可见' : '不可见'}，但实际${actualVisible ? '可见' : '不可见'}`);
    }
  }

  /**
   * 断言元素隐藏
   */
  async toBeHidden(options: ExpectMatcherOptions = {}): Promise<void> {
    const timeout = options.timeout || this.timeout;
    const expected = !this.isNot; // Hidden means NOT visible
    
    try {
      await this.waitForCondition(
        async () => {
          const isVisible = await this.target.isVisible();
          return isVisible !== expected; // Element should NOT be visible when expected to be hidden
        },
        timeout,
        `期望元素${expected ? '隐藏' : '可见'}`
      );
      
      this.logger.debug(`✅ 元素${expected ? '隐藏' : '可见'}断言通过`);
    } catch (error) {
      const actualVisible = await this.target.isVisible();
      throw new Error(`期望元素${expected ? '隐藏' : '可见'}，但实际${actualVisible ? '可见' : '隐藏'}`);
    }
  }

  // =============== 状态断言 ===============

  /**
   * 断言元素启用
   */
  async toBeEnabled(options: ExpectMatcherOptions = {}): Promise<void> {
    const timeout = options.timeout || this.timeout;
    const expected = !this.isNot;
    
    try {
      await this.waitForCondition(
        async () => {
          const isEnabled = await this.target.isEnabled();
          return isEnabled === expected;
        },
        timeout,
        `期望元素${expected ? '启用' : '禁用'}`
      );
      
      this.logger.debug(`✅ 元素${expected ? '启用' : '禁用'}断言通过`);
    } catch (error) {
      const actualEnabled = await this.target.isEnabled();
      throw new Error(`期望元素${expected ? '启用' : '禁用'}，但实际${actualEnabled ? '启用' : '禁用'}`);
    }
  }

  /**
   * 断言元素禁用
   */
  async toBeDisabled(options: ExpectMatcherOptions = {}): Promise<void> {
    const timeout = options.timeout || this.timeout;
    const expected = this.isNot;
    
    try {
      await this.waitForCondition(
        async () => {
          const isEnabled = await this.target.isEnabled();
          return isEnabled === expected;
        },
        timeout,
        `期望元素${expected ? '启用' : '禁用'}`
      );
      
      this.logger.debug(`✅ 元素${expected ? '启用' : '禁用'}断言通过`);
    } catch (error) {
      const actualEnabled = await this.target.isEnabled();
      throw new Error(`期望元素${expected ? '启用' : '禁用'}，但实际${actualEnabled ? '启用' : '禁用'}`);
    }
  }

  /**
   * 断言复选框选中
   */
  async toBeChecked(options: ExpectMatcherOptions = {}): Promise<void> {
    const timeout = options.timeout || this.timeout;
    const expected = !this.isNot;
    
    try {
      await this.waitForCondition(
        async () => {
          const isChecked = await this.target.isChecked();
          return isChecked === expected;
        },
        timeout,
        `期望元素${expected ? '选中' : '未选中'}`
      );
      
      this.logger.debug(`✅ 元素${expected ? '选中' : '未选中'}断言通过`);
    } catch (error) {
      const actualChecked = await this.target.isChecked();
      throw new Error(`期望元素${expected ? '选中' : '未选中'}，但实际${actualChecked ? '选中' : '未选中'}`);
    }
  }

  // =============== 内容断言 ===============

  /**
   * 断言包含文本
   */
  async toHaveText(expectedText: string | RegExp | string[], options: ExpectMatcherOptions = {}): Promise<void> {
    const timeout = options.timeout || this.timeout;
    const useInnerText = options.useInnerText || false;
    
    try {
      await this.waitForCondition(
        async () => {
          const actualText = useInnerText 
            ? await this.target.innerText()
            : await this.target.textContent();
          
          let matches: boolean;
          if (Array.isArray(expectedText)) {
            matches = expectedText.every(text => actualText.includes(text));
          } else if (expectedText instanceof RegExp) {
            matches = expectedText.test(actualText);
          } else {
            matches = actualText.includes(expectedText);
          }
          
          return this.isNot ? !matches : matches;
        },
        timeout,
        `期望文本${this.isNot ? '不' : ''}包含 "${expectedText}"`
      );
      
      this.logger.debug(`✅ 文本${this.isNot ? '不' : ''}包含断言通过`);
    } catch (error) {
      const actualText = useInnerText 
        ? await this.target.innerText()
        : await this.target.textContent();
      throw new Error(`期望文本${this.isNot ? '不' : ''}包含 "${expectedText}"，但实际文本为 "${actualText}"`);
    }
  }

  /**
   * 断言确切文本
   */
  async toHaveExactText(expectedText: string, options: ExpectMatcherOptions = {}): Promise<void> {
    const timeout = options.timeout || this.timeout;
    const useInnerText = options.useInnerText || false;
    
    try {
      await this.waitForCondition(
        async () => {
          const actualText = useInnerText 
            ? await this.target.innerText()
            : await this.target.textContent();
          
          const matches = actualText.trim() === expectedText.trim();
          return this.isNot ? !matches : matches;
        },
        timeout,
        `期望文本${this.isNot ? '不' : ''}完全匹配 "${expectedText}"`
      );
      
      this.logger.debug(`✅ 确切文本${this.isNot ? '不' : ''}匹配断言通过`);
    } catch (error) {
      const actualText = useInnerText 
        ? await this.target.innerText()
        : await this.target.textContent();
      throw new Error(`期望文本${this.isNot ? '不' : ''}完全匹配 "${expectedText}"，但实际文本为 "${actualText}"`);
    }
  }

  /**
   * 断言包含文本（部分）
   */
  async toContainText(expectedText: string | RegExp, options: ExpectMatcherOptions = {}): Promise<void> {
    return this.toHaveText(expectedText, options);
  }

  // =============== 属性断言 ===============

  /**
   * 断言有属性
   */
  async toHaveAttribute(name: string, value?: string | RegExp, options: ExpectMatcherOptions = {}): Promise<void> {
    const timeout = options.timeout || this.timeout;
    
    try {
      await this.waitForCondition(
        async () => {
          const actualValue = await this.target.getAttribute(name);
          
          let matches: boolean;
          if (value === undefined) {
            matches = actualValue !== null;
          } else if (value instanceof RegExp) {
            matches = value.test(actualValue || '');
          } else {
            matches = actualValue === value;
          }
          
          return this.isNot ? !matches : matches;
        },
        timeout,
        `期望${this.isNot ? '不' : ''}有属性 "${name}"`
      );
      
      this.logger.debug(`✅ 属性${this.isNot ? '不' : ''}存在断言通过`);
    } catch (error) {
      const actualValue = await this.target.getAttribute(name);
      throw new Error(`期望${this.isNot ? '不' : ''}有属性 "${name}"${value !== undefined ? ` = "${value}"` : ''}，但实际值为 "${actualValue}"`);
    }
  }

  /**
   * 断言有值
   */
  async toHaveValue(expectedValue: string | RegExp, options: ExpectMatcherOptions = {}): Promise<void> {
    const timeout = options.timeout || this.timeout;
    
    try {
      await this.waitForCondition(
        async () => {
          const actualValue = await this.target.inputValue();
          
          let matches: boolean;
          if (expectedValue instanceof RegExp) {
            matches = expectedValue.test(actualValue);
          } else {
            matches = actualValue === expectedValue;
          }
          
          return this.isNot ? !matches : matches;
        },
        timeout,
        `期望值${this.isNot ? '不' : ''}为 "${expectedValue}"`
      );
      
      this.logger.debug(`✅ 值${this.isNot ? '不' : ''}匹配断言通过`);
    } catch (error) {
      const actualValue = await this.target.inputValue();
      throw new Error(`期望值${this.isNot ? '不' : ''}为 "${expectedValue}"，但实际值为 "${actualValue}"`);
    }
  }

  /**
   * 断言有类名
   */
  async toHaveClass(expectedClass: string | string[] | RegExp, options: ExpectMatcherOptions = {}): Promise<void> {
    const timeout = options.timeout || this.timeout;
    
    try {
      await this.waitForCondition(
        async () => {
          const classAttr = await this.target.getAttribute('class');
          const classes = classAttr ? classAttr.split(' ') : [];
          
          let matches: boolean;
          if (Array.isArray(expectedClass)) {
            matches = expectedClass.every(cls => classes.includes(cls));
          } else if (expectedClass instanceof RegExp) {
            matches = expectedClass.test(classAttr || '');
          } else {
            matches = classes.includes(expectedClass);
          }
          
          return this.isNot ? !matches : matches;
        },
        timeout,
        `期望${this.isNot ? '不' : ''}有类名 "${expectedClass}"`
      );
      
      this.logger.debug(`✅ 类名${this.isNot ? '不' : ''}存在断言通过`);
    } catch (error) {
      const classAttr = await this.target.getAttribute('class');
      throw new Error(`期望${this.isNot ? '不' : ''}有类名 "${expectedClass}"，但实际类名为 "${classAttr}"`);
    }
  }

  /**
   * 断言有 ID
   */
  async toHaveId(expectedId: string, options: ExpectMatcherOptions = {}): Promise<void> {
    return this.toHaveAttribute('id', expectedId, options);
  }

  // =============== 数量断言 ===============

  /**
   * 断言数量
   */
  async toHaveCount(expectedCount: number, options: ExpectMatcherOptions = {}): Promise<void> {
    const timeout = options.timeout || this.timeout;
    
    try {
      await this.waitForCondition(
        async () => {
          const actualCount = await this.target.count();
          const matches = actualCount === expectedCount;
          return this.isNot ? !matches : matches;
        },
        timeout,
        `期望数量${this.isNot ? '不' : ''}为 ${expectedCount}`
      );
      
      this.logger.debug(`✅ 数量${this.isNot ? '不' : ''}匹配断言通过`);
    } catch (error) {
      const actualCount = await this.target.count();
      throw new Error(`期望数量${this.isNot ? '不' : ''}为 ${expectedCount}，但实际数量为 ${actualCount}`);
    }
  }

  // =============== URL 断言 ===============

  /**
   * 断言 URL
   */
  async toHaveURL(expectedUrl: string | RegExp, options: ExpectMatcherOptions = {}): Promise<void> {
    const timeout = options.timeout || this.timeout;
    
    try {
      await this.waitForCondition(
        () => {
          const currentUrl = window.location.href;
          
          let matches: boolean;
          if (expectedUrl instanceof RegExp) {
            matches = expectedUrl.test(currentUrl);
          } else {
            matches = currentUrl.includes(expectedUrl);
          }
          
          return this.isNot ? !matches : matches;
        },
        timeout,
        `期望 URL ${this.isNot ? '不' : ''}匹配 "${expectedUrl}"`
      );
      
      this.logger.debug(`✅ URL ${this.isNot ? '不' : ''}匹配断言通过`);
    } catch (error) {
      const currentUrl = window.location.href;
      throw new Error(`期望 URL ${this.isNot ? '不' : ''}匹配 "${expectedUrl}"，但当前 URL 为 "${currentUrl}"`);
    }
  }

  /**
   * 断言标题
   */
  async toHaveTitle(expectedTitle: string | RegExp, options: ExpectMatcherOptions = {}): Promise<void> {
    const timeout = options.timeout || this.timeout;
    
    try {
      await this.waitForCondition(
        () => {
          const currentTitle = document.title;
          
          let matches: boolean;
          if (expectedTitle instanceof RegExp) {
            matches = expectedTitle.test(currentTitle);
          } else {
            matches = currentTitle.includes(expectedTitle);
          }
          
          return this.isNot ? !matches : matches;
        },
        timeout,
        `期望标题${this.isNot ? '不' : ''}匹配 "${expectedTitle}"`
      );
      
      this.logger.debug(`✅ 标题${this.isNot ? '不' : ''}匹配断言通过`);
    } catch (error) {
      const currentTitle = document.title;
      throw new Error(`期望标题${this.isNot ? '不' : ''}匹配 "${expectedTitle}"，但当前标题为 "${currentTitle}"`);
    }
  }

  // =============== 通用断言 ===============

  /**
   * 断言包含指定值（用于数组等）
   */
  toContain(expectedValue: any): void {
    try {
      let contains: boolean;
      
      if (Array.isArray(this.target)) {
        contains = this.target.includes(expectedValue);
      } else if (typeof this.target === 'string') {
        contains = this.target.includes(expectedValue);
      } else {
        throw new Error('toContain 只支持数组或字符串类型');
      }
      
      const shouldContain = !this.isNot;
      if (contains !== shouldContain) {
        throw new Error(`期望${shouldContain ? '' : '不'}包含 "${expectedValue}"`);
      }
      
      this.logger.debug(`✅ 包含${shouldContain ? '' : '不'}断言通过`);
    } catch (error) {
      throw new Error(`期望${this.isNot ? '不' : ''}包含 "${expectedValue}"，但目标值为 ${JSON.stringify(this.target)}`);
    }
  }

  // =============== 辅助方法 ===============

  /**
   * 等待条件满足
   */
  private async waitForCondition(
    conditionFn: () => boolean | Promise<boolean>, 
    timeout: number, 
    description: string
  ): Promise<void> {
    const startTime = Date.now();
    
    const check = async (): Promise<void> => {
      try {
        const result = await conditionFn();
        if (result) {
          return;
        }
      } catch (error) {
        // 继续等待
      }

      if (Date.now() - startTime >= timeout) {
        throw new Error(`${description}超时 (${timeout}ms)`);
      }

      await new Promise(resolve => setTimeout(resolve, 100));
      return check();
    };

    return check();
  }
}

// 创建全局 expect 函数
function createExpect() {
  return function expect(target: any): ExpectAdapter {
    return new ExpectAdapter(target);
  };
}


// 导出给浏览器使用
if (typeof window !== 'undefined') {
  window.PlaywrightExpectAdapter = ExpectAdapter;
  window.PlaywrightExpect = createExpect();
}


// ES6 模块导出
export default ExpectAdapter;
export { createExpect };