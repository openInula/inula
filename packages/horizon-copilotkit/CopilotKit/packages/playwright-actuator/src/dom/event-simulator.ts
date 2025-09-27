/// <reference path="../types/global.d.ts" />
import type { ClickOptions, KeyboardOptions, Logger } from '../../types/index.js';

/**
 * 事件模拟器 - 模拟各种用户交互事件
 */
class EventSimulator {
  private readonly logger: Logger;

  constructor() {
    this.logger = (typeof window !== 'undefined' && window.PlaywrightLogger) 
      ? new window.PlaywrightLogger() 
      : console as unknown as Logger;
  }

  /**
   * 模拟点击事件
   */
  simulateClick(element: HTMLElement, options: ClickOptions = {}): void {
    const { button = 0 as number, clickCount = 1, delay = 0 } = options;
    
    // 确保元素获得焦点
    element.focus();

    // 触发完整的鼠标事件序列
    const mouseEvents: Array<keyof HTMLElementEventMap> = ['mousedown', 'mouseup', 'click'];
    
    mouseEvents.forEach((eventType, index) => {
      setTimeout(() => {
        const event = new MouseEvent(eventType, {
          view: window,
          bubbles: true,
          cancelable: true,
          button: button as number,
          detail: clickCount
        });
        
        element.dispatchEvent(event);
        this.logger.debug(`触发 ${eventType} 事件`);
      }, delay * index);
    });
  }

  /**
   * 模拟双击事件
   */
  simulateDoubleClick(element: HTMLElement): void {
    this.simulateClick(element, { clickCount: 1 });
    
    setTimeout(() => {
      const dblClickEvent = new MouseEvent('dblclick', {
        view: window,
        bubbles: true,
        cancelable: true,
        detail: 2
      });
      element.dispatchEvent(dblClickEvent);
      this.logger.debug('触发 dblclick 事件');
    }, 100);
  }

  /**
   * 模拟悬停事件
   */
  simulateHover(element: HTMLElement): void {
    const events: Array<keyof HTMLElementEventMap> = ['mouseover', 'mouseenter'];
    
    events.forEach(eventType => {
      const event = new MouseEvent(eventType, {
        view: window,
        bubbles: true,
        cancelable: true
      });
      element.dispatchEvent(event);
      this.logger.debug(`触发 ${eventType} 事件`);
    });
  }

  /**
   * 模拟键盘事件
   */
  simulateKeyPress(element: HTMLElement, key: string, options: KeyboardOptions = {}): void {
    const { ctrlKey = false, shiftKey = false, altKey = false, metaKey = false } = options;
    
    element.focus();
    
    // 首先触发 keydown 事件
    const keydownEvent = new KeyboardEvent('keydown', {
      key: key,
      code: this.getKeyCode(key),
      bubbles: true,
      cancelable: true,
      ctrlKey,
      shiftKey,
      altKey,
      metaKey
    });
    
    element.dispatchEvent(keydownEvent);
    
    // 处理特殊导航键的实际行为
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      this.handleNavigationKey(element as HTMLInputElement | HTMLTextAreaElement, key);
    }
    
    // 触发 keypress 事件 (某些键不触发 keypress)
    if (!['Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Backspace', 'Delete'].includes(key)) {
      const keypressEvent = new KeyboardEvent('keypress', {
        key: key,
        code: this.getKeyCode(key),
        bubbles: true,
        cancelable: true,
        ctrlKey,
        shiftKey,
        altKey,
        metaKey
      });
      element.dispatchEvent(keypressEvent);
    }
    
    // 触发 keyup 事件
    const keyupEvent = new KeyboardEvent('keyup', {
      key: key,
      code: this.getKeyCode(key),
      bubbles: true,
      cancelable: true,
      ctrlKey,
      shiftKey,
      altKey,
      metaKey
    });
    
    element.dispatchEvent(keyupEvent);
    this.logger.debug(`触发键盘事件: ${key}`);
  }

  /**
   * 处理导航键的实际行为
   */
  private handleNavigationKey(element: HTMLInputElement | HTMLTextAreaElement, key: string): void {
    const start = element.selectionStart || 0;
    const end = element.selectionEnd || 0;
    const value = element.value || '';
    
    switch (key) {
      case 'Home':
        element.setSelectionRange(0, 0);
        break;
        
      case 'End':
        element.setSelectionRange(value.length, value.length);
        break;
        
      case 'ArrowLeft':
        if (start > 0) {
          const newPos = Math.max(0, start - 1);
          element.setSelectionRange(newPos, newPos);
        }
        break;
        
      case 'ArrowRight':
        if (start < value.length) {
          const newPos = Math.min(value.length, start + 1);
          element.setSelectionRange(newPos, newPos);
        }
        break;
        
      case 'Backspace':
        if (start === end && start > 0) {
          // 删除光标前的字符
          element.value = value.slice(0, start - 1) + value.slice(end);
          element.setSelectionRange(start - 1, start - 1);
          element.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (start !== end) {
          // 删除选中文本
          element.value = value.slice(0, start) + value.slice(end);
          element.setSelectionRange(start, start);
          element.dispatchEvent(new Event('input', { bubbles: true }));
        }
        break;
        
      case 'Delete':
        if (start === end && start < value.length) {
          // 删除光标后的字符
          element.value = value.slice(0, start) + value.slice(end + 1);
          element.setSelectionRange(start, start);
          element.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (start !== end) {
          // 删除选中文本
          element.value = value.slice(0, start) + value.slice(end);
          element.setSelectionRange(start, start);
          element.dispatchEvent(new Event('input', { bubbles: true }));
        }
        break;
    }
  }

  /**
   * 模拟输入序列
   */
  async simulateTyping(element: HTMLInputElement | HTMLTextAreaElement, text: string, options: { delay?: number } = {}): Promise<void> {
    const { delay = 50 } = options;
    
    element.focus();
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      // 获取当前光标位置
      const start = element.selectionStart || 0;
      const end = element.selectionEnd || 0;
      const currentValue = element.value || '';
      
      // 在光标位置插入字符
      const newValue = currentValue.slice(0, start) + char + currentValue.slice(end);
      element.value = newValue;
      
      // 更新光标位置
      const newCursorPos = start + 1;
      element.setSelectionRange(newCursorPos, newCursorPos);
      
      // 触发输入事件
      element.dispatchEvent(new Event('input', { bubbles: true }));
      this.simulateKeyPress(element, char);
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // 触发 change 事件
    element.dispatchEvent(new Event('change', { bubbles: true }));
    this.logger.debug(`输入文本: "${text}"`);
  }

  /**
   * 模拟表单控件变化
   */
  simulateFormChange(element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, value: string | boolean): void {
    if ((element as HTMLInputElement).type === 'checkbox' || (element as HTMLInputElement).type === 'radio') {
      (element as HTMLInputElement).checked = value as boolean;
    } else if (element.tagName === 'SELECT') {
      (element as HTMLSelectElement).value = value as string;
    } else {
      (element as HTMLInputElement | HTMLTextAreaElement).value = value as string;
    }
    
    // 触发相关事件
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    
    this.logger.debug(`表单控件变化: ${element.tagName} = ${value}`);
  }

  /**
   * 获取键码
   */
  private getKeyCode(key: string): string {
    const keyCodes: Record<string, string> = {
      'Enter': 'Enter',
      'Escape': 'Escape',
      'Tab': 'Tab',
      'Backspace': 'Backspace',
      'Delete': 'Delete',
      'Home': 'Home',
      'End': 'End',
      'ArrowUp': 'ArrowUp',
      'ArrowDown': 'ArrowDown',
      'ArrowLeft': 'ArrowLeft',
      'ArrowRight': 'ArrowRight',
      ' ': 'Space'
    };
    
    return keyCodes[key] || key;
  }

  /**
   * 滚动元素到可视区域
   */
  async scrollIntoView(element: Element, options: { behavior?: ScrollBehavior; block?: ScrollLogicalPosition } = {}): Promise<void> {
    const { behavior = 'smooth', block = 'center' } = options;
    
    element.scrollIntoView({ behavior, block });
    
    // 等待滚动完成
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.logger.debug('元素滚动到可视区域');
  }
}


// 导出给浏览器使用
if (typeof window !== 'undefined') {
  window.PlaywrightEventSimulator = EventSimulator;
}


// ES6 模块导出
export default EventSimulator;