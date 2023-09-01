/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */

import { EventCallback } from "../types/types";

/**
 * 定义一个时间触发器类，使用泛型实现动态时间的监听
 */
class EventDispatcher<E extends Record<string, EventCallback>> {
  // 声明_events，用于存储事件和对应的监听器
  private _events: Map<keyof E, Set<EventCallback>>;

  constructor() {
    this._events = new Map();
  }

  /**
   * on 方法，向指定的事件添加监听器，并返回一个用于移除该监听器的函数
   * @param event
   * @param listener
   */
  on(event: keyof E, listener: E[keyof E]): () => void {
    if (!this._events.has(event)) {
      this._events.set(event, new Set());
    }
    const listeners = this._events.get(event)!;
    listeners.add(listener);

    return () => {
      this.removeListener(event, listener);
    };
  }

  /**
   * removeListener 方法，移除指定事件的监听器
   * @param event
   * @param listener
   */
  removeListener(event: keyof E, listener: E[keyof E]): void {
    if (!this._events.has(event)) {
      return;
    }
    const listeners = this._events.get(event)!;
    listeners.delete(listener);
    if (listeners.size === 0) {
      this._events.delete(event);
    }
  }

  /**
   * emit 方法，触发指定事件，并按照监听器注册顺序执行监听器
   * @param event
   * @param args
   */
  emit(event: keyof E, ...args: Parameters<E[keyof E]>): void {
    if (!this._events.has(event)) {
      return;
    }

    // 获取该事件对应的监听器集合，并按照注册顺序执行每个监听器
    const listeners = this._events.get(event)!;
    for (const listener of listeners) {
      listener.apply(this, args);
    }
  }
}

export default EventDispatcher;
