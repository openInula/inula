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

import { Callback, FilterFunc, PropFilterFunc } from '../../types/types';

/**
 * 将函数 func 绑定到指定的 this 上下文对象 thisArg
 *
 * @param func 需要绑定上下文的函数
 * @param thisArg 上下文对象
 *
 * @returns {any} 新的函数，当这个新的函数被调用时，它会调用 func 函数，并使用 apply() 方法将 thisArg 作为上下文对象，将传递的参数作为 func 函数的参数传递给它
 */
function bind(func: Function, thisArg: any): (...args: any[]) => any {
  return (...args: any[]) => func.apply(thisArg, args);
}

/**
 * 获取输入的变量类型
 *
 * @param input 需要判断类型的变量
 *
 * @returns {string} 输入变量的类型名称
 */
function getType(input: any): string {
  const str: string = Object.prototype.toString.call(input);
  return str.slice(8, -1).toLowerCase();
}

/**
 * 输入类型名称构造判断相应类型的函数
 *
 * @param type 需要判断的类型名称
 *
 * @returns {Function} 工厂函数，用以判断输入值是否为当前类型
 */
const createTypeChecker = (type: string) => (input: any) => getType(input) === type.toLowerCase();

const checkString = createTypeChecker('string');

const checkFunction = createTypeChecker('function');

const checkNumber = createTypeChecker('number');

const checkObject = (input: any) => input !== null && typeof input === 'object';

const checkBoolean = (input: any) => input === true || input === false;

const checkUndefined = createTypeChecker('undefined');

/**
 * 判断变量类型是否为纯对象
 *
 * @param input 需要判断的变量
 *
 * @returns {boolean} 如果变量为纯对象 则返回 true，否则返回 false
 */
const checkPlainObject = (input: any) => {
  if (Object.prototype.toString.call(input) !== '[object Object]') {
    return false;
  }

  const prototype = Object.getPrototypeOf(input);
  return prototype === null || prototype === Object.prototype;
};

const checkDate = createTypeChecker('Date');

const checkFile = createTypeChecker('File');

const checkBlob = createTypeChecker('Blob');

const checkStream = (input: any) => checkObject(input) && checkFunction(input.pipe);

const checkFileList = createTypeChecker('FileList');

const checkFormData = (input: any) => input instanceof FormData;

const checkURLSearchParams = createTypeChecker('URLSearchParams');

const checkRegExp = createTypeChecker('RegExp');

const checkHTMLForm = createTypeChecker('HTMLFormElement');

/**
 * 对数组或对象中的每个元素执行指定的回调函数
 *
 * @param input 待遍历的数组或对象
 * @param func 用于处理每个元素的回调函数
 * @param options 可选配置项，用于控制遍历过程
 *
 * @returns {void} 无返回值
 *
 * @template T
 */
function forEach<T>(
  input: T | T[] | Record<string, T> | null | undefined,
  func: Function,
  options: { includeAll?: boolean } = {}
): void {
  if (input === null || input === undefined) {
    return;
  }

  const { includeAll = false } = options;

  if (typeof input !== 'object') {
    input = [input] as T[];
  }

  if (Array.isArray(input)) {
    (input as T[]).forEach((value, index, array) => {
      func.call(null, value, index, array);
    });
  } else {
    const keys = includeAll ? getAllPropertyNames(input as Record<string, T>) : Object.keys(input as Record<string, T>);
    keys.forEach(key => {
      func.call(null, (input as Record<string, T>)[key], key, input!);
    });
  }
}

/**
 * 查找给定对象中与指定键名相等（忽略大小写）的键名，并返回该键名,如果对象中不存在与指定键名相等的键名，则返回 null
 *
 * @param obj 待查找的对象
 * @param key 要查找的键名
 *
 * @returns {string | null} 与指定键名相等的键名，或者 null
 */
function getObjectKey<T>(obj: Record<string, T>, key: string): string | null {
  const _key = key.toLowerCase();
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (k.toLowerCase() === _key) {
      return k;
    }
  }
  return null;
}

/**
 * 将源对象的属性合并到目标对象中
 *
 * @param target 目标对象，表示要将属性合并到这个对象中
 * @param source 源对象，表示要从这个对象中提取属性，并合并到目标对象中
 * @param thisArg 可选参数，表示要将函数类型的属性绑定到这个对象上，以便在调用时可以正确设置 `this` 上下文
 * @param options 可选参数，一个配置对象，用于控制是否仅遍历对象自身的属性而不包括继承的属性
 *
 * @returns {Record<string, any>} 返回目标对象，表示合并后的对象
 */
function extendObject(
  target: Record<string, any>,
  source: Record<string, any>,
  thisArg?: any,
  options?: { includeAll?: boolean }
) {
  const { includeAll = false } = options || {};

  forEach(
    source,
    (val: any, key: any) => {
      if (thisArg && checkFunction(val)) {
        target[key as number] = bind(val, thisArg);
      } else {
        target[key as number] = val;
      }
      // @ts-ignore
    },
    { includeAll: includeAll }
  );

  return target;
}

/**
 * 获取对象所有属性名，包括原型
 *
 * @param obj 需要获取的对象
 *
 * @returns {string[]} 所有属性名数组
 */
function getAllPropertyNames(obj: Record<string, any>): string[] {
  let result: string[] = [];
  let currentObj = obj;
  while (currentObj) {
    const propNames = Object.getOwnPropertyNames(currentObj);
    propNames.forEach(propName => {
      if (result.indexOf(propName) === -1) {
        result.push(propName);
      }
    });
    currentObj = Object.getPrototypeOf(currentObj);
  }
  return result;
}

/**
 * 将给定对象转换为扁平对象，通过展平嵌套对象和数组
 * 嵌套对象通过连接键使用分隔符展平
 * 嵌套数组通过使用分隔符将索引附加到父键上进行展平
 *
 * @param sourceObj 要展平的对象
 * @param destObj 目标对象，用于存储扁平化后的对象，如果未提供则会创建一个新对象
 * @param filter 控制是否继续展平父对象的回调函数，可选
 * @param propFilter 控制哪些属性不进行展平的回调函数，可选
 *
 * @returns {Record<any, any>} 一个新对象，它是输入对象的扁平表示
 */
function flattenObject(
  sourceObj: Record<any, any> | null | undefined,
  destObj: Record<any, any> = {},
  filter?: FilterFunc,
  propFilter?: PropFilterFunc
): Record<any, any> {
  let props: (string | symbol)[];
  let i: number;
  let prop: string | symbol;
  const merged: Record<string, boolean> = {};

  if (sourceObj === null || sourceObj === undefined) {
    return destObj;
  }

  do {
    props = getAllPropertyNames(sourceObj);
    i = props.length;

    while (i-- > 0) {
      prop = props[i];

      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop as any]) {
        destObj[prop as any] = sourceObj[prop as any];
        merged[prop as any] = true;
      }
    }

    sourceObj = filter && Object.getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

  return destObj;
}

/**
 * 迭代一个对象，对其所有的属性（包括继承来的）进行迭代，并对每个属性值调用回调函数
 *
 * @param obj 待迭代的对象
 * @param func 迭代时对每个属性值调用的回调函数
 *
 * @returns {void} 无返回值
 */
function forEachEntry(obj: Record<any, any>, func: (key: any, val: any) => void) {
  if (obj instanceof Map) {
    obj.forEach((value, key) => func(key, value));
  } else {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        func(key, obj[key]);
      }
    }
  }
}

/**
 * 将给定的字符串或字符串数组转换为一个对象，该对象的键为字符串或字符串数组中的唯一值，值为布尔值 `true`
 *
 * @param input 给定的字符串或字符串数组。
 * @param delimiter 当 `arrayOrString` 参数是字符串时，指定用于拆分字符串的分隔符
 *
 * @returns {Record<any, boolean>} 一个对象，其中包含唯一的字符串值，并且每个值的键对应于输入的字符串或字符串数组
 */
const toBooleanObject = (input: string | string[], delimiter?: string): Record<any, boolean> => {
  const obj: Record<string, boolean> = {};

  const define = (arr: string[]) => {
    arr.forEach(value => {
      obj[value.trim()] = true;
    });
  };

  if (Array.isArray(input)) {
    define(input);
  } else {
    const stringArray = input.split(delimiter || '');
    define(stringArray);
  }

  return obj;
};

/**
 * 将一个对象转换为 JSON 对象，安全地处理循环引用
 *
 * @param obj 要转换的对象
 *
 * @returns {Record<string, any> |null} 转换后的 JSON 对象
 */
const toJSONSafe = (obj: Record<string, any>): Record<string, any> | null => {
  const visited = new WeakSet<any>();

  const visit = (source: Record<string, any>): Record<string, any> | null => {
    if (checkObject(source)) {
      if (visited.has(source)) {
        return null;
      }
      visited.add(source);

      if ('toJSON' in source) {
        return (source as any).toJSON();
      }

      const target: any = Array.isArray(source) ? [] : {};

      for (const [key, value] of Object.entries(source)) {
        const reducedValue = visit(value);
        if (!checkUndefined(reducedValue)) {
          target[key] = reducedValue;
        }
      }

      return target;
    }

    return source;
  };

  return visit(obj);
};

/**
 * 安全地将一个值转换为 JSON 字符串，解析无效的 JSON 字符串时不会抛出 SyntaxError
 *
 * @template T
 *
 * @param rawValue 要转换为 JSON 字符串的值，可以是一个字符串或任何其他类型的值
 * @param parser 自定义的 JSON 解析函数。默认为 `JSON.parse`
 * @param encoder 自定义的 JSON 编码函数。默认为 `JSON.stringify`
 *
 * @returns {string} 生成的 JSON 字符串
 *
 * @throws {Error} 如果在解析过程中出现非 SyntaxError 类型的错误，则会抛出该错误
 */
function stringifySafely<T>(
  rawValue: any,
  parser?: (jsonString: string) => T,
  encoder: (value: T) => string = JSON.stringify
): string {
  if (typeof rawValue === 'string') {
    try {
      (parser ?? JSON.parse)(rawValue);
      return rawValue.trim();
    } catch (e) {
      if ((e as Error).name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return encoder(rawValue);
}

/**
 * 将一个字符串转换为驼峰式命名法
 *
 * @param str 要转换的字符串
 *
 * @returns {string} 转换后的字符串
 */
const convertToCamelCase = (str: string) => {
  return str
    .split(/[-_\s]/)
    .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join('');
};

function objectToQueryString(obj: Record<string, any>) {
  return Object.keys(obj)
    .map(key => {
      // params 中 value 为数组时需特殊处理，如：{ key: [1, 2, 3] } -> key[]=1&key[]=2&key[]=3
      if (Array.isArray(obj[key])) {
        let urlPart = '';
        obj[key].forEach((value: string) => {
          urlPart = `${urlPart}${key}[]=${value}&`;
          return urlPart;
        });
        return urlPart.slice(0, -1);
      }
      return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
    })
    .join('&');
}

const all = <T>(promises: Array<Promise<T>>): Promise<T[]> => Promise.all(promises);

function spread<T>(callback: Callback<T>): (arr: any[]) => T {
  return (arr: any[]): T => callback.apply(null, arr);
}

function getNormalizedValue(value: string | any[] | boolean | null | number): string | any[] | boolean | null {
  if (value === false || value === null || value === undefined) {
    return value;
  }

  return Array.isArray(value) ? value.map(item => getNormalizedValue(item) as string) : String(value);
}

function isIE(): boolean {
  return /MSIE|Trident/.test(window.navigator.userAgent);
}

function getObjectByArray(arr: any[]): Record<string, any> {
  return arr.reduce((obj, item, index) => {
    obj[index] = item;
    return obj;
  }, {});
}

function filterUndefinedValues(obj: Record<any, any>) {
  return Object.keys(obj).reduce((result, key) => {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}

const utils = {
  bind,
  checkFormData,
  checkString,
  checkNumber,
  checkBoolean,
  checkObject,
  checkPlainObject,
  checkUndefined,
  checkDate,
  checkFile,
  checkBlob,
  checkStream,
  checkRegExp,
  checkFunction,
  checkURLSearchParams,
  checkFileList,
  checkHTMLForm,
  forEach,
  extendObject,
  flattenObject,
  getType,
  createTypeChecker,
  forEachEntry,
  toBooleanObject,
  getObjectKey,
  toJSONSafe,
  stringifySafely,
  convertToCamelCase,
  objectToQueryString,
  spread,
  all,
  getNormalizedValue,
  isIE,
  getObjectByArray,
  filterUndefinedValues,
};

export default utils;
