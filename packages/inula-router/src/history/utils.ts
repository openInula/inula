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

import { Action, Location, Path, To } from './types';

export function createPath(path: Partial<Path>): string {
  const { search, hash } = path;
  let pathname = path.pathname || '/';
  if (search && search !== '?') {
    pathname += search.startsWith('?') ? search : '?' + search;
  }
  if (hash && hash !== '#') {
    pathname += hash.startsWith('#') ? hash : '#' + hash;
  }
  return pathname;
}

export function parsePath(url: string): Partial<Path> {
  if (!url) {
    return {};
  }
  let parsedPath: Partial<Path> = {};

  let hashIdx = url.indexOf('#');
  if (hashIdx > -1) {
    parsedPath.hash = url.substring(hashIdx);
    url = url.substring(0, hashIdx);
  }

  let searchIdx = url.indexOf('?');
  if (searchIdx > -1) {
    parsedPath.search = url.substring(searchIdx);
    url = url.substring(0, searchIdx);
  }
  if (url) {
    parsedPath.pathname = url;
  }
  return parsedPath;
}

export function createLocation<S>(current: string | Location, to: To, state?: S, key?: string): Readonly<Location<S>> {
  let pathname = typeof current === 'string' ? current : current.pathname;
  let urlObj = typeof to === 'string' ? parsePath(to) : to;
  // 随机key长度取6
  const getRandKey = genRandomKey(6);
  const location = {
    pathname: pathname,
    search: '',
    hash: '',
    state: state,
    key: typeof key === 'string' ? key : getRandKey(),
    ...urlObj,
  };
  if (!location.pathname) {
    location.pathname = '/';
  }
  return location;
}

export function isLocationEqual(p1: Partial<Path>, p2: Partial<Path>) {
  return p1.pathname === p2.pathname && p1.search === p2.search && p1.hash === p2.hash;
}

export function addHeadSlash(path: string): string {
  if (path[0] === '/') {
    return path;
  }
  return '/' + path;
}

export function stripHeadSlash(path: string): string {
  if (path[0] === '/') {
    return path.substring(1);
  }
  return path;
}

export function normalizeSlash(path: string): string {
  const tempPath = addHeadSlash(path);
  if (tempPath[tempPath.length - 1] === '/') {
    return tempPath.substring(0, tempPath.length - 1);
  }
  return tempPath;
}

export function hasBasename(path: string, prefix: string): Boolean {
  return (
    path.toLowerCase().indexOf(prefix.toLowerCase()) === 0 && ['/', '?', '#', ''].includes(path.charAt(prefix.length))
  );
}

export function stripBasename(path: string, prefix: string): string {
  return hasBasename(path, prefix) ? path.substring(prefix.length) : path;
}

// 使用随机生成的Key记录被访问过的URL，当Block被被触发时利用delta值跳转到之前的页面
export function createMemoryRecord<T, S>(initVal: S, fn: (arg: S) => T) {
  let visitedRecord: T[] = [fn(initVal)];

  function getDelta(toKey: S, fromKey: S): number {
    let toIdx = visitedRecord.lastIndexOf(fn(toKey));
    if (toIdx === -1) {
      toIdx = 0;
    }
    let fromIdx = visitedRecord.lastIndexOf(fn(fromKey));
    if (fromIdx === -1) {
      fromIdx = 0;
    }
    return toIdx - fromIdx;
  }

  function addRecord(current: S, newRecord: S, action: Action) {
    const curVal = fn(current);
    const NewVal = fn(newRecord);
    if (action === Action.push) {
      const prevIdx = visitedRecord.lastIndexOf(curVal);
      const newVisitedRecord = visitedRecord.slice(0, prevIdx + 1);
      newVisitedRecord.push(NewVal);
      visitedRecord = newVisitedRecord;
    }
    if (action === Action.replace) {
      const prevIdx = visitedRecord.lastIndexOf(curVal);
      if (prevIdx !== -1) {
        visitedRecord[prevIdx] = NewVal;
      }
    }
  }

  return { getDelta, addRecord };
}

function genRandomKey(length: number): () => string {
  const end = length + 2;
  return () => {
    return Math.random().toString(18).substring(2, end);
  };
}
