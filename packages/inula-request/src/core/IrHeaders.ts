import utils from '../utils/commonUtils/utils';
import convertRawHeaders from '../utils/headerUtils/convertRawHeaders';
import { HeaderMatcher } from '../types/types';
import checkHeaderName from '../utils/headerUtils/checkHeaderName';
import processValueByParser from '../utils/headerUtils/processValueByParser';
import deleteHeader from '../utils/headerUtils/deleteHeader';

class IrHeaders {
  // 定义 IrHeaders 类索引签名
  [key: string]: any;

  constructor(headers?: Record<string, string | string[]> | IrHeaders) {
    // 将默认响应头加入 IrHeaders
    this.defineAccessor();

    if (headers) {
      this.set(headers);
    }
  }

  private _setHeader(
    header: Record<string, string | string[]> | IrHeaders | string,
    _value: string | string[],
    _header: string
  ) {
    const normalizedHeader = String(header).trim().toLowerCase();
    const key = utils.getObjectKey(this, normalizedHeader);

    // this[key] 可能为 false
    if (!key || this[key] === undefined) {
      this[key || _header] = utils.getNormalizedValue(_value);
    }
  };

  private _setHeaders(headers: Record<string, string | string[]> | IrHeaders | string) {
    return utils.forEach(headers, (_value: string | string[], _header: string) => {
      return this._setHeader(headers, _value, _header);
    });
  }

  set(header: Record<string, string | string[]> | IrHeaders | string): this {
    // 通过传入的 headers 创建 IrHeaders 对象
    if (utils.checkPlainObject(header) || header instanceof this.constructor) {
      this._setHeaders(header);
    } else if (utils.checkString(header) && (header = header.trim()) && !checkHeaderName(header as string)) {
      this._setHeaders(convertRawHeaders(header as string));
    } else {
      if (header) {
        this._setHeader(header, header as string, header as string);
      }
    }

    return this;
  }

  // 从对象中获取指定 header 的值，并根据可选的parser参数来处理和返回这个值
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
    const entries = Object.entries(this).filter(([_, value]) => {
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
      if (Object.prototype.hasOwnProperty.call(this, header)) {
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
    }

    return this;
  }

  defineAccessor() {
    // 用于标记当前响应头访问器是否已添加
    const accessors = {};

    // 定义默认头部
    const defaultHeaders = ['Content-Type', 'Content-Length', 'Accept', 'Accept-Encoding', 'User-Agent'];

    // 将默认响应头加入 IrHeaders
    defaultHeaders.forEach(header => {
      if (!accessors[header]) {
        Object.defineProperty(this, header, {
          writable: true,
          enumerable: true,
          configurable: true,
        });

        accessors[header] = true;
      }
    });
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
    const newInstance = new IrHeaders(firstItem);
    const mergedObject = Object.assign({}, newInstance, ...otherItems);

    for (const key in mergedObject) {
      if (Object.prototype.hasOwnProperty.call(mergedObject, key)) {
        newInstance[key] = mergedObject[key];
      }
    }

    // 删除值为 undefined 请求头， fetch 进行自动配置
    for (const key in newInstance) {
      if (newInstance[key] === undefined) {
        delete newInstance[key];
      }
    }

    return newInstance;
  }
}

export default IrHeaders;
