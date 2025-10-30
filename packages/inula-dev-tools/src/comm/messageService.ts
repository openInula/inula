/*
 * Copyright (c) 2025 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { MessageBus, MessageHandler, MessageSource, MessageType, DevToolMessage } from './types';

/**
 * 消息总线实现
 */
export class MessageService implements MessageBus {
  private handlers = new Map<string, Set<MessageHandler>>();
  private source: MessageSource;

  constructor(source: MessageSource) {
    this.source = source;
  }

  /**
   * 创建消息
   */
  private createMessage<T>(type: MessageType | string, data?: T): DevToolMessage<T> {
    return {
      source: this.source,
      type,
      data,
      timestamp: Date.now(),
    };
  }

  /**
   * 验证消息来源
   */
  public isValidMessage(message: any, expectedSource?: MessageSource): message is DevToolMessage {
    if (!message || typeof message !== 'object') {
      return false;
    }
    if (!message.source || !message.type) {
      return false;
    }
    if (expectedSource && message.source !== expectedSource) {
      return false;
    }
    return true;
  }

  /**
   * 发送消息
   */
  send<T = any>(type: MessageType | string, data?: T): void {
    const message = this.createMessage(type, data);
    window.postMessage(message, '*');
  }

  /**
   * 监听消息
   */
  on<T = any>(type: MessageType | string, handler: MessageHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    // 返回取消监听函数
    return () => this.off(type, handler);
  }

  /**
   * 移除监听
   */
  off<T = any>(type: MessageType | string, handler: MessageHandler<T>): void {
    const handlers = this.handlers.get(type);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(type);
      }
    }
  }

  /**
   * 分发消息
   */
  dispatch(message: DevToolMessage): void {
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message.data);
        } catch (error) {
          console.error(`Error handling message ${message.type}:`, error);
        }
      });
    }
  }

  /**
   * 清除所有监听
   */
  clear(): void {
    this.handlers.clear();
  }
}

/**
 * 创建Window消息监听器
 */
export function createWindowMessageListener(
  messageService: MessageService,
  expectedSource?: MessageSource
): () => void {
  const listener = (event: MessageEvent) => {
    // 只接收来自当前窗口的消息
    if (event.source !== window) {
      return;
    }

    const message = event.data;
    if (!messageService.isValidMessage(message, expectedSource)) {
      return;
    }

    messageService.dispatch(message);
  };

  window.addEventListener('message', listener);

  // 返回清理函数
  return () => {
    window.removeEventListener('message', listener);
  };
}

