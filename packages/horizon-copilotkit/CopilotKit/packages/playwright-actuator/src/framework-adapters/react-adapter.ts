/**
 * React Framework Adapter
 * 处理 React 组件的事件触发，确保能够正确触发 React 的合成事件系统
 */

export interface ReactSyntheticEvent {
  target: any;
  currentTarget: any;
  type: string;
  nativeEvent: Event;
  preventDefault: () => void;
  stopPropagation: () => void;
  persist: () => void;
  bubbles: boolean;
  cancelable: boolean;
  defaultPrevented: boolean;
  eventPhase: number;
  isTrusted: boolean;
  timeStamp: number;
}

export interface ReactEventTriggerResult {
  success: boolean;
  method: 'react' | 'native';
  error?: string;
}

/**
 * React 事件适配器类
 */
export class ReactEventAdapter {
  private logger: any;

  constructor(logger?: any) {
    this.logger = logger || console;
  }

  /**
   * 触发 React change 事件
   */
  async triggerChangeEvent(
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    value?: string
  ): Promise<ReactEventTriggerResult> {
    // 如果提供了值，先设置元素的值
    if (value !== undefined) {
      (element as any).value = value;
    }

    // 尝试触发 React 事件
    const reactResult = await this.tryTriggerReactEvent(element, 'change');
    if (reactResult.success) {
      return reactResult;
    }

    // 回退到原生事件
    return this.triggerNativeChangeEvent(element);
  }

  /**
   * 触发 React input 事件
   */
  async triggerInputEvent(
    element: HTMLInputElement | HTMLTextAreaElement,
    value?: string
  ): Promise<ReactEventTriggerResult> {
    // 如果提供了值，先设置元素的值
    if (value !== undefined) {
      element.value = value;
    }

    // 尝试触发 React 事件
    const reactResult = await this.tryTriggerReactEvent(element, 'input');
    if (reactResult.success) {
      return reactResult;
    }

    // 回退到原生事件
    return this.triggerNativeInputEvent(element);
  }

  /**
   * 尝试触发 React 合成事件
   */
  private async tryTriggerReactEvent(
    element: Element,
    eventType: string
  ): Promise<ReactEventTriggerResult> {
    try {
      // 查找 React 内部属性
      const reactFiberKey = this.findReactFiberKey(element);
      if (!reactFiberKey) {
        return { success: false, method: 'react', error: 'React fiber key not found' };
      }

      const reactFiber = (element as any)[reactFiberKey];
      if (!reactFiber) {
        return { success: false, method: 'react', error: 'React fiber not found' };
      }

      // 查找事件处理器
      const eventHandler = this.findEventHandler(reactFiber, eventType);
      if (!eventHandler) {
        return { 
          success: false, 
          method: 'react', 
          error: `React ${eventType} handler not found` 
        };
      }

      // 创建合成事件对象
      const syntheticEvent = this.createSyntheticEvent(element, eventType);
      
      // 调用 React 事件处理器
      await eventHandler(syntheticEvent);

      this.logger.debug(`React ${eventType} 事件已触发`);
      return { success: true, method: 'react' };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.debug(`触发 React ${eventType} 事件失败: ${errorMessage}`);
      return { success: false, method: 'react', error: errorMessage };
    }
  }

  /**
   * 查找 React Fiber 键名
   */
  private findReactFiberKey(element: Element): string | null {
    const keys = Object.keys(element);
    return keys.find(key => 
      key.startsWith('__reactFiber') || 
      key.startsWith('__reactInternalInstance') ||
      key.startsWith('__reactProps')
    ) || null;
  }

  /**
   * 查找事件处理器
   */
  private findEventHandler(reactFiber: any, eventType: string): Function | null {
    const handlerName = `on${eventType.charAt(0).toUpperCase()}${eventType.slice(1)}`;
    
    // 在 memoizedProps 中查找
    if (reactFiber.memoizedProps && reactFiber.memoizedProps[handlerName]) {
      return reactFiber.memoizedProps[handlerName];
    }
    
    // 在 pendingProps 中查找
    if (reactFiber.pendingProps && reactFiber.pendingProps[handlerName]) {
      return reactFiber.pendingProps[handlerName];
    }
    
    // 直接在 fiber 上查找
    if (reactFiber[handlerName]) {
      return reactFiber[handlerName];
    }

    // 查找 props 对象
    const props = reactFiber.memoizedProps || reactFiber.pendingProps || reactFiber.props;
    if (props && props[handlerName]) {
      return props[handlerName];
    }

    return null;
  }

  /**
   * 创建 React 合成事件对象
   */
  private createSyntheticEvent(element: Element, eventType: string): ReactSyntheticEvent {
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
      persist: () => {},
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
  ): ReactEventTriggerResult {
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
  ): ReactEventTriggerResult {
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
   * 触发 React click 事件
   */
  async triggerClickEvent(element: Element): Promise<ReactEventTriggerResult> {
    // 尝试触发 React 事件
    const reactResult = await this.tryTriggerReactEvent(element, 'click');
    if (reactResult.success) {
      return reactResult;
    }

    // 回退到原生事件
    return this.triggerNativeClickEvent(element);
  }

  /**
   * 触发 React 右键事件 (contextmenu)
   */
  async triggerContextMenuEvent(element: Element): Promise<ReactEventTriggerResult> {
    // 尝试触发 React 事件
    const reactResult = await this.tryTriggerReactEvent(element, 'contextmenu');
    if (reactResult.success) {
      return reactResult;
    }

    // 回退到原生事件
    return this.triggerNativeContextMenuEvent(element);
  }

  /**
   * 触发原生 click 事件（备用方案）
   */
  private triggerNativeClickEvent(element: Element): ReactEventTriggerResult {
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
  private triggerNativeContextMenuEvent(element: Element): ReactEventTriggerResult {
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
   * 检查元素是否是 React 组件
   */
  isReactComponent(element: Element): boolean {
    return this.findReactFiberKey(element) !== null;
  }
}

/**
 * 创建单例 React 适配器实例
 */
let reactAdapterInstance: ReactEventAdapter | null = null;

export function getReactAdapter(logger?: any): ReactEventAdapter {
  if (!reactAdapterInstance) {
    reactAdapterInstance = new ReactEventAdapter(logger);
  }
  return reactAdapterInstance;
}

/**
 * 便捷函数：触发 React change 事件
 */
export async function triggerReactChangeEvent(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value?: string,
  logger?: any
): Promise<ReactEventTriggerResult> {
  const adapter = getReactAdapter(logger);
  return adapter.triggerChangeEvent(element, value);
}

/**
 * 便捷函数：触发 React input 事件
 */
export async function triggerReactInputEvent(
  element: HTMLInputElement | HTMLTextAreaElement,
  value?: string,
  logger?: any
): Promise<ReactEventTriggerResult> {
  const adapter = getReactAdapter(logger);
  return adapter.triggerInputEvent(element, value);
}

/**
 * 便捷函数：触发 React click 事件
 */
export async function triggerReactClickEvent(
  element: Element,
  logger?: any
): Promise<ReactEventTriggerResult> {
  const adapter = getReactAdapter(logger);
  return adapter.triggerClickEvent(element);
}

/**
 * 便捷函数：触发 React 右键事件
 */
export async function triggerReactContextMenuEvent(
  element: Element,
  logger?: any
): Promise<ReactEventTriggerResult> {
  const adapter = getReactAdapter(logger);
  return adapter.triggerContextMenuEvent(element);
}