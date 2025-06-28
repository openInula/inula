/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
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

import { AllMessages, Locale, Messages } from '../../../types/types';
import I18nPath from './parseMsgParamUtils';

export function includes(arr: Array<any>, item: any): boolean {
  return !!~arr.indexOf(item);
}

export function dealNumberOrTimesArgs(args: any[], numericOrTimeConstansArr: string[]) {
  let locale: Locale = 'en';
  let key: string;
  let options: object = {};

  if (args.length === 1) {
    if (typeof args[0] == 'string') {
      key = args[0];
    } else if (typeof args[0] == 'object') {
      if (args[0].locale) {
        locale = args[0].locale;
      }
      if (args[0].key) {
        key = args[0].key;
      }
      options = Object.keys(args[0]).reduce((acc, key) => {
        if (includes(numericOrTimeConstansArr, key)) {
          return { ...acc, [key]: args[0][key] };
        }
        return acc;
      }, {});
    }
  } else if (args.length === 2) {
    if (typeof args[0] == 'string') {
      key = args[0];
    }
    if (typeof args[1] == 'string') {
      locale = args[1];
    }
  }

  const dealLocale = locale.substring(0, 2);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return { dealLocale, key, options };
}

export function isObject(obj: string | Messages | AllMessages): boolean {
  return obj !== null && typeof obj === 'object';
}

// eslint-disable-next-line @typescript-eslint/ban-types
const toString: Function = Object.prototype.toString;
const OBJECT_STRING: string = '[object Object]';

export function isPlainObject(obj: any): boolean {
  return toString.call(obj) === OBJECT_STRING;
}

export function isString(val: any): boolean {
  return typeof val === 'string';
}

export const isArray = Array.isArray;

export function isNull(val: any): boolean {
  return val === null || val === undefined;
}

export function isFunction(val: any): boolean {
  return typeof val === 'function';
}

export function dealMsgArgs(pathRet, message, key) {
  if (isArray(pathRet) || isPlainObject(pathRet)) {
    return pathRet;
  }

  let ret: any;
  if (isNull(pathRet)) {
    /* istanbul ignore else */
    if (isPlainObject(message)) {
      ret = message[key];
      if (!(isString(ret) || isFunction(ret))) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Value of key '${key}' is not a string or function !`);
        }
        return null;
      }
    } else {
      return null;
    }
  } else {
    /* istanbul ignore else */
    if (isString(pathRet) || isFunction(pathRet)) {
      ret = pathRet;
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Value of key '${key}' is not a string or function!`);
      }
      return null;
    }
  }
  return ret;
}
