/**
 * OpenInula Framework Adapter
 * 处理 OpenInula 组件的事件触发，确保能够正确触发 OpenInula 的事件系统
 */

export interface OpenInulaEvent {
  target: any;
  currentTarget: any;
  type: string;
  nativeEvent: Event;
  preventDefault: () => void;
  stopPropagation: () => void;
  bubbles: boolean;
  cancelable: boolean;
  defaultPrevented: boolean;
  eventPhase: number;
  isTrusted: boolean;
  timeStamp: number;
}

export interface OpenInulaEventTriggerResult {
  success: boolean;
  method: 'openinula' | 'native';
  error?: string;
}

/**
 * OpenInula 事件适配器类
 */
export class OpenInulaEventAdapter {
  private logger: any;

  constructor(logger?: any) {
    this.logger = logger || console;
  }

  /**
   * 触发 OpenInula change 事件
   */
  async triggerChangeEvent(
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    value?: string
  ): Promise<OpenInulaEventTriggerResult> {
    // 如果提供了值，先设置元素的值
    if (value !== undefined) {
      (element as any).value = value;
    }

    // 尝试触发 OpenInula 事件
    const openinulaResult = await this.tryTriggerOpenInulaEvent(element, 'change');
    if (openinulaResult.success) {
      return openinulaResult;
    }

    // 回退到原生事件
    return this.triggerNativeChangeEvent(element);
  }

  /**
   * 触发 OpenInula input 事件
   */
  async triggerInputEvent(
    element: HTMLInputElement | HTMLTextAreaElement,
    value?: string
  ): Promise<OpenInulaEventTriggerResult> {
    // 如果提供了值，先设置元素的值
    if (value !== undefined) {
      element.value = value;
    }

    // 尝试触发 OpenInula 事件
    const openinulaResult = await this.tryTriggerOpenInulaEvent(element, 'input');
    if (openinulaResult.success) {
      return openinulaResult;
    }

    // 回退到原生事件
    return this.triggerNativeInputEvent(element);
  }

  /**
   * 尝试触发 OpenInula 事件
   */
  private async tryTriggerOpenInulaEvent(
    element: Element,
    eventType: string
  ): Promise<OpenInulaEventTriggerResult> {
    try {
      // 查找 OpenInula 内部属性
      const openinulaNodeKey = this.findOpenInulaNodeKey(element);
      if (!openinulaNodeKey) {
        return { success: false, method: 'openinula', error: 'OpenInula node key not found' };
      }

      const openinulaNode = (element as any)[openinulaNodeKey];
      if (!openinulaNode) {
        return { success: false, method: 'openinula', error: 'OpenInula node not found' };
      }

      // 查找事件处理器
      const eventHandler = this.findEventHandler(openinulaNode, eventType);
      if (!eventHandler) {
        return { 
          success: false, 
          method: 'openinula', 
          error: `OpenInula ${eventType} handler not found` 
        };
      }

      // 创建事件对象
      const event = this.createOpenInulaEvent(element, eventType);
      
      // 调用 OpenInula 事件处理器
      await eventHandler(event);

      this.logger.debug(`OpenInula ${eventType} 事件已触发`);
      return { success: true, method: 'openinula' };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.debug(`触发 OpenInula ${eventType} 事件失败: ${errorMessage}`);
      return { success: false, method: 'openinula', error: errorMessage };
    }
  }

  /**
   * 查找 OpenInula Node 键名
   */
  private findOpenInulaNodeKey(element: Element): string | null {
    const keys = Object.keys(element);
    return keys.find(key => 
      key.startsWith('_inula_vNode_')
    ) || null;
  }

  /**
   * 查找事件处理器
   */
  private findEventHandler(openinulaNode: any, eventType: string): Function | null {
    const handlerName = `on${eventType.charAt(0).toUpperCase()}${eventType.slice(1)}`;
    
    // 在 props 中查找
    if (openinulaNode.props && openinulaNode.props[handlerName]) {
      return openinulaNode.props[handlerName];
    }
    
    // 在 oldProps 中查找（如果存在）
    if (openinulaNode.oldProps && openinulaNode.oldProps[handlerName]) {
      return openinulaNode.oldProps[handlerName];
    }

    // 直接在 node 上查找
    if (openinulaNode[handlerName]) {
      return openinulaNode[handlerName];
    }

    // 查找其他可能的 props 对象
    const propsObj = openinulaNode.props || openinulaNode.oldProps;
    if (propsObj && propsObj[handlerName]) {
      return propsObj[handlerName];
    }

    return null;
  }

  /**
   * 创建 OpenInula 事件对象
   */
  private createOpenInulaEvent(element: Element, eventType: string): OpenInulaEvent {
    let nativeEvent: Event;

    // 根据事件类型创建相应的事件对象
    if (this.isMouseEvent(eventType)) {
      // 创建 MouseEvent，支持右键等鼠标事件
      const rect = element.getBoundingClientRect();
      const mouseEventInit: MouseEventInit = {
        bubbles: true,
        cancelable: true,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        button: this.getMouseButton(eventType),
        buttons: this.getMouseButtons(eventType),
        detail: eventType === 'dblclick' ? 2 : 1
      };
      nativeEvent = new MouseEvent(eventType, mouseEventInit);
    } else {
      // 创建普通 Event
      nativeEvent = new Event(eventType, { bubbles: true, cancelable: true });
    }
    
    return {
      target: {
        ...element,
        value: (element as any).value || '',
        name: (element as any).name || '',
        id: element.id || '',
        checked: (element as any).checked,
        type: (element as any).type
      },
      currentTarget: element,
      type: eventType,
      nativeEvent,
      preventDefault: () => nativeEvent.preventDefault(),
      stopPropagation: () => nativeEvent.stopPropagation(),
      bubbles: true,
      cancelable: true,
      defaultPrevented: false,
      eventPhase: 2,
      isTrusted: false,
      timeStamp: Date.now()
    };
  }

  /**
   * 判断是否为鼠标事件
   */
  private isMouseEvent(eventType: string): boolean {
    const mouseEvents = ['click', 'dblclick', 'mousedown', 'mouseup', 'contextmenu', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave'];
    return mouseEvents.includes(eventType);
  }

  /**
   * 获取鼠标按钮值
   */
  private getMouseButton(eventType: string): number {
    switch (eventType) {
      case 'contextmenu':
        return 2; // 右键
      case 'click':
      case 'dblclick':
      case 'mousedown':
      case 'mouseup':
        return 0; // 左键
      default:
        return 0;
    }
  }

  /**
   * 获取鼠标按钮状态
   */
  private getMouseButtons(eventType: string): number {
    switch (eventType) {
      case 'contextmenu':
        return 2; // 右键按下
      case 'click':
      case 'dblclick':
      case 'mousedown':
      case 'mouseup':
        return 1; // 左键按下
      default:
        return 0;
    }
  }

  /**
   * 触发原生 change 事件（备用方案）
   */
  private triggerNativeChangeEvent(
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  ): OpenInulaEventTriggerResult {
    try {
      const changeEvent = new Event('change', { 
        bubbles: true, 
        cancelable: true 
      });

      // 设置事件的 target 属性
      Object.defineProperty(changeEvent, 'target', { 
        value: element, 
        enumerable: true 
      });

      element.dispatchEvent(changeEvent);
      
      this.logger.debug('原生 change 事件已触发');
      return { success: true, method: 'native' };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.debug(`触发原生 change 事件失败: ${errorMessage}`);
      return { success: false, method: 'native', error: errorMessage };
    }
  }

  /**
   * 触发原生 input 事件（备用方案）
   */
  private triggerNativeInputEvent(
    element: HTMLInputElement | HTMLTextAreaElement
  ): OpenInulaEventTriggerResult {
    try {
      const inputEvent = new Event('input', { 
        bubbles: true, 
        cancelable: true 
      });

      // 设置事件的 target 属性
      Object.defineProperty(inputEvent, 'target', { 
        value: element, 
        enumerable: true 
      });

      element.dispatchEvent(inputEvent);
      
      this.logger.debug('原生 input 事件已触发');
      return { success: true, method: 'native' };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.debug(`触发原生 input 事件失败: ${errorMessage}`);
      return { success: false, method: 'native', error: errorMessage };
    }
  }

  /**
   * 触发 OpenInula click 事件
   */
  async triggerClickEvent(element: Element): Promise<OpenInulaEventTriggerResult> {
    // 尝试触发 OpenInula 事件
    const openinulaResult = await this.tryTriggerOpenInulaEvent(element, 'click');
    if (openinulaResult.success) {
      return openinulaResult;
    }

    // 回退到原生事件
    return this.triggerNativeClickEvent(element);
  }

  /**
   * 触发 OpenInula 右键事件 (contextmenu)
   */
  async triggerContextMenuEvent(element: Element): Promise<OpenInulaEventTriggerResult> {
    // 尝试触发 OpenInula 事件
    const openinulaResult = await this.tryTriggerOpenInulaEvent(element, 'contextmenu');
    if (openinulaResult.success) {
      return openinulaResult;
    }

    // 回退到原生事件
    return this.triggerNativeContextMenuEvent(element);
  }

  /**
   * 触发原生 click 事件（备用方案）
   */
  private triggerNativeClickEvent(element: Element): OpenInulaEventTriggerResult {
    try {
      const rect = element.getBoundingClientRect();
      const clickEvent = new MouseEvent('click', { 
        bubbles: true, 
        cancelable: true,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        button: 0,
        buttons: 1
      });

      // 设置事件的 target 属性
      Object.defineProperty(clickEvent, 'target', { 
        value: element, 
        enumerable: true 
      });

      element.dispatchEvent(clickEvent);
      
      this.logger.debug('原生 click 事件已触发');
      return { success: true, method: 'native' };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.debug(`触发原生 click 事件失败: ${errorMessage}`);
      return { success: false, method: 'native', error: errorMessage };
    }
  }

  /**
   * 触发原生 contextmenu 事件（备用方案）
   */
  private triggerNativeContextMenuEvent(element: Element): OpenInulaEventTriggerResult {
    try {
      const rect = element.getBoundingClientRect();
      const contextMenuEvent = new MouseEvent('contextmenu', { 
        bubbles: true, 
        cancelable: true,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        button: 2,
        buttons: 2
      });

      // 设置事件的 target 属性
      Object.defineProperty(contextMenuEvent, 'target', { 
        value: element, 
        enumerable: true 
      });

      element.dispatchEvent(contextMenuEvent);
      
      this.logger.debug('原生 contextmenu 事件已触发');
      return { success: true, method: 'native' };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.debug(`触发原生 contextmenu 事件失败: ${errorMessage}`);
      return { success: false, method: 'native', error: errorMessage };
    }
  }

  /**
   * 触发用户交互相关的辅助事件（focus、blur）
   */
  async triggerInteractionEvents(element: Element): Promise<void> {
    try {
      // 触发 focus 事件
      element.dispatchEvent(new Event('focus', { bubbles: true }));
      
      // 短暂延迟后触发 blur，模拟用户交互
      setTimeout(() => {
        element.dispatchEvent(new Event('blur', { bubbles: true }));
      }, 10);
      
      this.logger.debug('用户交互事件已触发');
    } catch (error) {
      // 忽略交互事件错误，这些不是关键事件
      this.logger.debug(`触发交互事件失败: ${error}`);
    }
  }

  /**
   * 检查元素是否是 OpenInula 组件
   */
  isOpenInulaComponent(element: Element): boolean {
    return this.findOpenInulaNodeKey(element) !== null;
  }
}

/**
 * 创建单例 OpenInula 适配器实例
 */
let openinulaAdapterInstance: OpenInulaEventAdapter | null = null;

export function getOpenInulaAdapter(logger?: any): OpenInulaEventAdapter {
  if (!openinulaAdapterInstance) {
    openinulaAdapterInstance = new OpenInulaEventAdapter(logger);
  }
  return openinulaAdapterInstance;
}

/**
 * 便捷函数：触发 OpenInula change 事件
 */
export async function triggerOpenInulaChangeEvent(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value?: string,
  logger?: any
): Promise<OpenInulaEventTriggerResult> {
  const adapter = getOpenInulaAdapter(logger);
  return adapter.triggerChangeEvent(element, value);
}

/**
 * 便捷函数：触发 OpenInula input 事件
 */
export async function triggerOpenInulaInputEvent(
  element: HTMLInputElement | HTMLTextAreaElement,
  value?: string,
  logger?: any
): Promise<OpenInulaEventTriggerResult> {
  const adapter = getOpenInulaAdapter(logger);
  return adapter.triggerInputEvent(element, value);
}

/**
 * 便捷函数：触发 OpenInula click 事件
 */
export async function triggerOpenInulaClickEvent(
  element: Element,
  logger?: any
): Promise<OpenInulaEventTriggerResult> {
  const adapter = getOpenInulaAdapter(logger);
  return adapter.triggerClickEvent(element);
}

/**
 * 便捷函数：触发 OpenInula 右键事件
 */
export async function triggerOpenInulaContextMenuEvent(
  element: Element,
  logger?: any
): Promise<OpenInulaEventTriggerResult> {
  const adapter = getOpenInulaAdapter(logger);
  return adapter.triggerContextMenuEvent(element);
}