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

class CustomAbortSignal {
  private _isAborted: boolean;
  private _listeners: Set<() => void>;

  constructor() {
    this._isAborted = false;
    this._listeners = new Set();
  }

  get aborted(): boolean {
    return this._isAborted;
  }

  addEventListener(listener: () => void): void {
    this._listeners.add(listener);
  }

  removeEventListener(listener: () => void): void {
    this._listeners.delete(listener);
  }

  abort(): void {
    if (!this._isAborted) {
      this._isAborted = true;
      this._listeners.forEach(listener => listener());
    }
  }
}

export default CustomAbortSignal;
