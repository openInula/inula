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

class CustomHeaders {
  private _headers: Map<string, string>;

  constructor(headers?: Record<string, string>) {
    this._headers = new Map<string, string>();
    if (headers) {
      for (const key of Object.keys(headers)) {
        this._headers.set(key.toLowerCase(), headers[key]);
      }
    }
  }

  has(name: string): boolean {
    return this._headers.has(name.toLowerCase());
  }

  get(name: string): string | null {
    const headerValue = this._headers.get(name.toLowerCase());
    return headerValue !== undefined ? headerValue : null;
  }

  set(name: string, value: string): void {
    this._headers.set(name.toLowerCase(), value);
  }

  delete(name: string): void {
    this._headers.delete(name.toLowerCase());
  }

  forEach(callback: (value: string, name: string, parent: Map<string, string>) => void): void {
    this._headers.forEach(callback);
  }
}

export default CustomHeaders;
