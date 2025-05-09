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
import convertRawHeaders from '../utils/headerUtils/convertRawHeaders';
import { HeaderMatcher } from '../types/types';
import checkHeaderName from '../utils/headerUtils/checkHeaderName';
import processValueByParser from '../utils/headerUtils/processValueByParser';
import deleteHeader from '../utils/headerUtils/deleteHeader';

export type IrHeaderValue = IrHeaders | string | string[] | number | boolean | null;

export type RawIrHeaders = {
  [key: string]: IrHeaderValue;
};

class IrHeaders {
  // 定义 IrHeaders 类索引签名
  [key: string]: any;

  constructor(headers?: RawIrHeaders | IrHeaders | string) {
    if (headers) {
      this.set(headers);
    }
  }

  private _setHeader(_header: string, _value?: IrHeaderValue, _rewrite?: IrHeaderValue | boolean) {
    const normalizedHeader = _header ? String(_header).trim().toLowerCase() : undefined;
    if (!normalizedHeader) {
      throw new Error('header name must be a non-empty string');
    }

    const key = utils.getObjectKey(this, normalizedHeader);

    // this[key] 可能为 false
    if (!key || this[key] === undefined || _rewrite === true || (_rewrite === undefined && this[key] !== false)) {
      this[key || _header] = utils.getNormalizedValue(_value);
    }
  }

  private _setHeaders(headers: RawIrHeaders | IrHeaders, valueOrRewrite?: IrHeaderValue | boolean) {
    return utils.forEach<IrHeaderValue>(headers, (_value: string | string[], _header: string) => {
      return this._setHeader(_header, _value, valueOrRewrite);
    });
  }

  private isIrHeader(object: unknown): object is IrHeaders {
    return object instanceof this.constructor;
  }

  set(headerName?: string, value?: IrHeaderValue, rewrite?: boolean): IrHeaders;
  set(headers?: RawIrHeaders | IrHeaders | Headers | string, rewrite?: boolean): IrHeaders;
  set(
    header?: RawIrHeaders | IrHeaders | Headers | string,
    valueOrRewrite?: IrHeaderValue | boolean,
    rewrite?: boolean
  ): IrHeaders {
    // 通过传入的 headers 创建 IrHeaders 对象
    if (utils.checkPlainObject<RawIrHeaders | IrHeaders>(header) || this.isIrHeader(header)) {
      this._setHeaders(header, valueOrRewrite);
    } else if (utils.checkString(header) && (header = header.trim()) && !checkHeaderName(header)) {
      this._setHeaders(convertRawHeaders(header), valueOrRewrite);
    } else if (utils.checkHeaders(header)) {
      for (const [k, v] of header.entries()) {
        this._setHeader(v, k, rewrite);
      }
    } else {
      if (header) {
        this._setHeader(header, valueOrRewrite, rewrite);
      }
    }
    return this;
  }

  // 从对象中获取指定 header 的值，并根据可选的 parser 参数来处理和返回这个值
  get(header: string, parser?: HeaderMatcher): string | string[] | null | undefined {
    const normalizedHeader = String(header).trim().toLowerCase();

    if (!normalizedHeader) {
      return;
    }

    const key = utils.getObjectKey(this, normalizedHeader);

    if (!key) {
      return;
    }

    const value = (this as any)[key];

    return processValueByParser(key, value, parser);
  }

  has(header: string): boolean {
    const normalizedHeader = String(header).trim().toLowerCase();

    if (normalizedHeader) {
      const key = utils.getObjectKey(this, normalizedHeader);
      return !!(key && this[key] !== undefined);
    }

    return false;
  }

  delete(header: string | string[]): boolean {
    if (Array.isArray(header)) {
      return header.some(deleteHeader, this);
    } else {
      return deleteHeader.call(this, header);
    }
  }

  clear(): boolean {
    const keys = Object.keys(this);
    let deleted = false;

    for (const key of keys) {
      delete this[key];
      deleted = true;
    }

    return deleted;
  }

  concat(...items: (Record<string, string | string[]> | IrHeaders)[]): IrHeaders {
    return IrHeaders.concat(this, ...items);
  }

  toJSON(arrayToStr?: boolean): Record<string, string | string[]> {
    // 过滤无意义的转换
    const entries = Object.entries(this).filter(([, value]) => {
      return value != null && value !== false;
    });

    const mappedEntries = entries.map(([header, value]) => {
      // 配置 arrayToStr 将 value 对应的数组值转换成逗号分隔，如  "hobbies": ["reading", "swimming", "hiking"] -> "hobbies": "reading, swimming, hiking"
      return [header, arrayToStr && Array.isArray(value) ? value.join(', ') : value];
    });

    return Object.fromEntries(mappedEntries);
  }

  toString(): string {
    const entries = this.toJSON();
    return Object.keys(entries).reduce((acc, header) => {
      return acc + header + ': ' + entries[header] + '\n';
    }, '');
  }

  normalize(): this {
    // 存储已处理过的 header
    const headers: Record<string, boolean> = {};

    for (const header in this) {
      const value = this[header];
      const key = utils.getObjectKey(headers, header);

      // 若 key 存在，说明当前遍历到的 header 已经被处理过
      if (key) {
        this[key] = utils.getNormalizedValue(value);

        // header 和 key 不相等，key 是忽略大小写的，所以需要删除处理前的 header
        delete this[header];
        continue;
      }

      const normalizedHeader = header.trim();

      if (normalizedHeader !== header) {
        delete this[header];
      }

      this[normalizedHeader] = utils.getNormalizedValue(value);

      headers[normalizedHeader] = true;
    }

    return this;
  }

  static from(thing: Record<string, string | string[]> | IrHeaders): IrHeaders {
    if (thing instanceof IrHeaders) {
      return thing;
    } else {
      const newInstance = new IrHeaders(thing);

      // 删除值为 undefined 请求头， fetch 进行自动配置
      for (const key in newInstance) {
        if (newInstance[key] === undefined) {
          delete newInstance[key];
        }
      }

      return newInstance;
    }
  }

  static concat(
    firstItem: Record<string, string | string[]> | IrHeaders,
    ...otherItems: (Record<string, string | string[]> | IrHeaders)[]
  ): IrHeaders {
    // 初始化一个 IrHeaders 对象实例
    const newHeaders = new IrHeaders(firstItem);
    otherItems.forEach(item => newHeaders.set(item));

    // 删除值为 undefined 请求头， fetch 进行自动配置
    for (const key of Object.keys(newHeaders)) {
      const headerValue = newHeaders[key];
      if (headerValue === undefined || headerValue === null) {
        newHeaders.delete(key);
      }
    }

    return newHeaders;
  }
}

export default IrHeaders;
