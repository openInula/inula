/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
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

import utils from '../utils/commonUtils/utils';
import { InterceptorHandler, IrInterceptorManager } from '../types/interfaces';
import { FulfilledFn, RejectedFn } from '../types/types';

class InterceptorManager<V> implements IrInterceptorManager<V> {
  private handlers: (InterceptorHandler<V> | null)[];

  constructor() {
    this.handlers = [];
  }

  use(
    fulfilled?: FulfilledFn<V>,
    rejected?: RejectedFn,
    options?: { synchronous?: boolean; runWhen?: (value: V) => boolean }
  ): number {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : undefined,
    });
    return this.handlers.length - 1;
  }

  eject(id: number): void {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }

  clear(): void {
    this.handlers = [];
  }

  forEach(func: (...arg: any) => any) {
    utils.forEach(this.handlers, function forEachHandler(h: any) {
      if (h !== null) {
        func(h);
      }
    });
  }
}

export default InterceptorManager;
