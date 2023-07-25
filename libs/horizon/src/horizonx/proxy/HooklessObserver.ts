/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
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

import type { IObserver } from './Observer';

/**
 * 一个对象（对象、数组、集合）对应一个Observer
 */
export class HooklessObserver implements IObserver {
  listeners: ((mutation) => void)[] = [];

  useProp(key: string | symbol): void {}

  addListener(listener: (mutation) => void) {
    this.listeners.push(listener);
  }

  removeListener(listener: (mutation) => void) {
    this.listeners = this.listeners.filter(item => item != listener);
  }

  getListeners() {
    return this.listeners;
  }

  setProp(key: string | symbol, mutation: any): void {
    this.triggerChangeListeners(mutation);
  }

  triggerChangeListeners(mutation: any): void {
    this.listeners.forEach(listener => {
      listener(mutation);
    });
  }

  triggerUpdate(vNode): void {}

  allChange(): void {}

  clearByVNode(vNode): void {}
}
