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

import * as Inula from 'openinula';
import styles from './PanelX.less';
import { DevToolPanel } from '../utils/constants';

export function highlight(source, search) {
  if (!search || !source?.split) {
    return source;
  }

  const parts = source.split(search);
  const result = [];

  for (let i = 0; i < parts.length * 2 - 1; i++) {
    if (i % 2) {
      result.push(<span className={styles.highlighted}>{search}</span>);
    } else {
      result.push(parts[i / 2]);
    }
  }

  return result;
}

export function displayValue(val: any, search = '') {
  if (typeof val === 'boolean') {
    return <span>{highlight(val ? 'true' : 'false', search)}</span>;
  }

  if (val === '') {
    return <span className={styles.red}>{'""'}</span>;
  }

  if (typeof val === 'undefined') {
    return <span className={styles.grey}>{highlight('undefined', search)}</span>;
  }

  if (val === 'null') {
    return <span className={styles.grey}>{highlight('null', search)}</span>;
  }

  if (typeof val === 'string') {
    if (val.match(/^function\s?\(/)) {
      return (
        <span>
          <i>ƒ</i>
          {highlight(val.match(/^function\s?\([\w,]*\)/g)[0].replace(/^function\s?/, ''), search)}
        </span>
      );
    }
    return <span className={styles.red}>"{highlight(val, search)}"</span>;
  }
  if (typeof val === 'number') {
    return <span className={styles.blue}>{highlight('' + val, search)}</span>;
  }
  if (typeof val === 'function') {
    const args = val
      .toString()
      .match(/^function\s?\([\w,]*\)/g)[0]
      .replace(/^function\s?/, '');
    return (
      <span>
        <i>ƒ</i>
        {highlight(args, search)}
      </span>
    );
  }
  if (typeof val === 'object') {
    if (val?._type === 'WeakSet') {
      return <span>WeakSet()</span>;
    }

    if (val?._type === 'WeakMap') {
      return <span>WeakMap()</span>;
    }
  }
}

export function fullTextSearch(value, search) {
  if (!value) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some(val => fullTextSearch(val, search));
  }

  if (typeof value === 'object') {
    if (value?._type === 'Set') {
      return value.values.some(val => fullTextSearch(val, search));
    }
    if (value?._type === 'Map') {
      return value.entries.some((key, val) => fullTextSearch(key, search) || fullTextSearch(val, search));
    }
    return Object.values(value).some(val => fullTextSearch(val, search));
  }

  return value.toString().includes(search);
}

export function omit(obj, ...attrs) {
  const res = { ...obj };
  attrs.forEach(attr => delete res[attr]);
  return res;
}

export function stringify(data) {
  if (typeof data === 'string' && data.startsWith('function(')) {
    return (
      <span>
        <i>ƒ</i>
        {data.match(/^function\([\w,]*\)/g)[0].substring(8)}
      </span>
    );
  }

  if (!data) {
    return displayValue(data);
  }

  if (Array.isArray(data)) {
    return `Array(${data.length})`;
  }

  if (typeof data === 'object') {
    return `{${Object.entries(data).map(([key, value]) => {
      if (typeof value === 'string' && value.startsWith('function(')) {
        return (
          <span>
            <span className={styles.purple}>{key}</span>
            <span>
              <i>ƒ</i>
              {value.match(/^function\([\w,]*\)/g)[0].substring(8)}
            </span>
          </span>
        );
      }
      if (!value) {
        return (
          <span>
            <span className={styles.purple}>{key}</span>:{displayValue(value)}
          </span>
        );
      }
      if (Array.isArray(value)) {
        return (
          <span>
            <span className={styles.purple}>{key}</span>: {`Array(${value.length})`}
          </span>
        );
      }
      if (typeof value === 'object') {
        if ((value as any)?._type === 'WeakSet') {
          return (
            <span>
              <span className={styles.purple}>{key}</span>: {'WeakSet()'}
            </span>
          );
        }
        if ((value as any)?._type === 'WeakMap') {
          return (
            <span>
              <span className={styles.purple}>{key}</span>: {'WeakMap'}
            </span>
          );
        }
        if ((value as any)?._type === 'Set') {
          return (
            <span>
              <span className={styles.purple}>{key}</span>: {`Set(${(value as Set<any>).size})`}
            </span>
          );
        }
        if ((value as any)?._type === 'Map') {
          return (
            <span>
              <span className={styles.purple}>{key}</span>: {`Map(${(value as Map<any, any>).size})`}
            </span>
          );
        }

        // object
        return (
          <span>
            <span className={styles.purple}>{key}</span>: {'{...}'}
          </span>
        );
      }
      return (
        <span>
          <span className={styles.purple}>{key}</span>: {displayValue(value)}
        </span>
      );
    })}}`;
  }
  return data;
}

export function sendMessage(payload) {
  chrome.runtime.sendMessage({
    type: 'INULA_DEV_TOOLS',
    payload,
    from: DevToolPanel,
  });
}
