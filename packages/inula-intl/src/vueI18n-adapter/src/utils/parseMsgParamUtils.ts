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

import { AllMessages, Messages } from '../../../types/types';
import { isNull, isObject } from './utils';
import {
  AFTER_PATH,
  APPEND,
  BEFORE_PATH,
  ERROR,
  IN_DOUBLE_QUOTE,
  IN_SINGLE_QUOTE,
  IN_SUB_PATH,
  INC_SUB_PATH_DEPTH,
  pathStateMachine,
  PUSH,
  PUSH_SUB_PATH,
} from '../constants';
import { PathStateMachine, PathValue } from '../type/types';

export default class I18nPath {
  // 使用严格类型的缓存对象
  private _cache: Record<string, string[]> = Object.create(null);

  /**
   * External parse that check for a cache hit first
   */
  parsePath(path: string): string[] {
    let hit: string[] = this._cache[path];
    if (!hit) {
      hit = parse(path);
      if (hit) {
        this._cache[path] = hit;
      }
    }
    return hit || [];
  }

  getPathValue(obj: string | Messages | AllMessages, id: string): PathValue {
    // 如果传入的不是对象，则返回null
    if (!isObject(obj)) {
      return null;
    }
    // 解析路径
    const paths: string[] = this.parsePath(id);

    if (paths.length === 0) {
      return null;
    } else {
      let last: any = obj;
      for (const path of paths) {
        const value: any = last[path];
        // 如果路径对应的值为undefined或null，则返回null
        if (value === undefined || value === null) {
          return null;
        }
        last = value;
      }
      return last;
    }
  }
}

/**
 * Parse a string path into an array of segments
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
function parse(path: string): string[] {
  const keys: string[] = [];
  let index: number = -1;
  let mode: number = BEFORE_PATH;
  let subPathDepth: number = 0;
  let c: string | undefined;
  let key: any;
  let newChar: string;
  let type: string;
  let transition: any;
  let action: () => void | boolean;
  let typeMap: PathStateMachine;
  const actions: Array<() => void | boolean> = [];

  actions[PUSH] = function () {
    if (key !== undefined) {
      keys.push(key);
      key = undefined;
    }
  };

  actions[APPEND] = function () {
    if (key === undefined) {
      key = newChar;
    } else {
      key += newChar;
    }
  };

  actions[INC_SUB_PATH_DEPTH] = function () {
    actions[APPEND]();
    subPathDepth++;
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  actions[PUSH_SUB_PATH] = function () {
    if (subPathDepth > 0) {
      subPathDepth--;
      mode = IN_SUB_PATH;
      actions[APPEND]();
    } else {
      subPathDepth = 0;
      if (key === undefined) {
        return false;
      }
      key = formatSubPath(key);
      if (key === false) {
        return false;
      } else {
        actions[PUSH]();
      }
    }
  };

  function maybeUnescapeQuote(): boolean | void {
    const nextChar: string = path[index + 1];
    if ((mode === IN_SINGLE_QUOTE && nextChar === "'") || (mode === IN_DOUBLE_QUOTE && nextChar === '"')) {
      index++;
      newChar = '\\' + nextChar;
      actions[APPEND]();
      return true;
    }
  }

  while (mode !== null) {
    index++;
    c = path[index];

    if (c === '\\' && maybeUnescapeQuote()) {
      continue;
    }

    type = getPathCharType(c);

    //  根据不同的字符串，进行匹配对应的状态模式
    typeMap = pathStateMachine[mode];
    transition = typeMap[type] || typeMap['else'] || ERROR;

    if (transition === ERROR) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return; // parse error
    }

    mode = transition[0];
    action = actions[transition[1]];
    if (action) {
      newChar = transition[2];
      newChar = newChar === undefined ? c : newChar;
      if (action() === false) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return;
      }
    }

    if (mode === AFTER_PATH) {
      return keys;
    }
  }
}

// 格式化子路径
function formatSubPath(path: string): boolean | string {
  const trimmed: string = path.trim();
  if (path.charAt(0) === '0' && isNaN(Number(path))) {
    return false;
  }

  return isLiteral(trimmed) ? stripQuotes(trimmed) : '*' + trimmed;
}

const literalValueRE: RegExp = /^\s?(?:true|false|-?[\d.]+|'[^']*'|"[^"]*")\s?$/;

function isLiteral(exp: string): boolean {
  return literalValueRE.test(exp);
}

/**
 * 剥离引号
 */
function stripQuotes(str: string): string | boolean {
  const a: number = str.charCodeAt(0);
  const b: number = str.charCodeAt(str.length - 1);
  return a === b && (a === 0x22 || a === 0x27) ? str.slice(1, -1) : str;
}

function getPathCharType(ch: string): string {
  if (ch === undefined || ch === null) {
    return 'eof';
  }

  const code: number = ch.charCodeAt(0);

  switch (code) {
    case 0x5b: // [
    case 0x5d: // ]
    case 0x2e: // .
    case 0x22: // "
    case 0x27: // '
      return ch;

    case 0x5f: // _
    case 0x24: // $
    case 0x2d: // -
      return 'ident';

    case 0x09: // Tab
    case 0x0a: // Newline
    case 0x0d: // Return
    case 0xa0: // No-break space
    case 0xfeff: // Byte Order Mark
    case 0x2028: // Line Separator
    case 0x2029: // Paragraph Separator
      return 'ws';
  }

  return 'ident';
}
