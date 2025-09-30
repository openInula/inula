/**
 * 通信服务
 * 提供统一的消息发送和接收接口
 */

import { DevToolMessage, MessageSource, InulaVersion } from './types';

export class MessageService {
  private listeners: Map<string, Set<(message: DevToolMessage) => void>> = new Map();

  /**
   * 创建标准消息
   */
  createMessage<T = any>(
    type: string,
    data: T,
    from: MessageSource,
    options?: {
      tabId?: number;
      version?: InulaVersion;
    }
  ): DevToolMessage<T> {
    return {
      type: 'INULA_DEV_TOOLS',
      payload: {
        type,
        data,
        tabId: options?.tabId,
        version: options?.version,
      },
      from,
    };
  }

  /**
   * 检查消息来源
   */
  checkMessageSource(message: any, expectedSource: MessageSource): boolean {
    return message?.from === expectedSource && message?.type === 'INULA_DEV_TOOLS';
  }

  /**
   * 提取版本信息
   */
  extractVersion(message: DevToolMessage): InulaVersion | undefined {
    return message.payload.version;
  }

  /**
   * 监听特定类型的消息
   */
  on(messageType: string, callback: (message: DevToolMessage) => void): void {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, new Set());
    }
    this.listeners.get(messageType)!.add(callback);
  }

  /**
   * 移除消息监听
   */
  off(messageType: string, callback: (message: DevToolMessage) => void): void {
    const callbacks = this.listeners.get(messageType);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * 触发消息
   */
  emit(message: DevToolMessage): void {
    const callbacks = this.listeners.get(message.payload.type);
    if (callbacks) {
      callbacks.forEach(callback => callback(message));
    }
  }

  /**
   * 发送消息到 background
   */
  sendToBackground(message: DevToolMessage): void {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage(message);
    }
  }

  /**
   * 发送消息到 content script
   */
  sendToContentScript(tabId: number, message: DevToolMessage): void {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.sendMessage(tabId, message);
    }
  }

  /**
   * 发送消息到 panel
   */
  sendToPanel(message: DevToolMessage, port?: chrome.runtime.Port): void {
    if (port) {
      port.postMessage(message);
    }
  }

  /**
   * 发送消息到页面（通过 window.postMessage）
   */
  sendToPage(message: DevToolMessage): void {
    window.postMessage(message, '*');
  }
}

// 导出单例
export const messageService = new MessageService();
