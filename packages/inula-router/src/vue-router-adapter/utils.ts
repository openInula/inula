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

import type { HistoryLocation } from './vueHistory';
import { normalizeSlash, parseRelativePath } from '../history/utils';
import type { LocationQuery, RouteLocation, RouteLocationRaw } from './types';

export function normalizeBase(base?: string): string {
  if (!base) {
    if (typeof document !== 'undefined') {
      const baseEl = document.querySelector('base');
      base = (baseEl && baseEl.getAttribute('href')) || '/';
      base = base.replace(/^\w+:\/\/[^\/]+/, '');
    } else {
      base = '/';
    }
  }
  if (base[0] !== '/' && base[0] !== '#') {
    base = `/${base}`;
  }
  return normalizeSlash(base);
}

const BEFORE_HASH_RE = /^[^#]+#/;

export function createHrefHandler(base: string): (location: HistoryLocation) => string {
  return (location: HistoryLocation) => base.replace(BEFORE_HASH_RE, '#') + location;
}

export interface NormalizedLocation {
  path: string;
  fullPath: string;
  hash: string;
  query: LocationQuery;
}

export function parseURL(location: string, currentLocation: string = '/'): NormalizedLocation {
  let path: string | undefined,
    query: LocationQuery = {},
    searchString = '',
    hash = '';

  // Could use URL and URLSearchParams but IE 11 doesn't support it
  // TODO: move to new URL()
  const hashPos = location.indexOf('#');
  let searchPos = location.indexOf('?');
  // the hash appears before the search, so it's not part of the search string
  if (hashPos < searchPos && hashPos >= 0) {
    searchPos = -1;
  }

  if (searchPos > -1) {
    path = location.slice(0, searchPos);
    searchString = location.slice(searchPos + 1, hashPos > -1 ? hashPos : location.length);

    query = parseQuery(searchString);
  }

  if (hashPos > -1) {
    path = path || location.slice(0, hashPos);
    // keep the # character
    hash = location.slice(hashPos, location.length);
  }

  // no search and no query
  path = parseRelativePath(path != null ? path : location, currentLocation);
  // empty path means a relative query or hash `?foo=f`, `#thing`

  return {
    fullPath: path + (searchString && '?') + searchString + hash,
    path,
    query,
    hash: decode(hash),
  };
}

export function stringifyUrl(location: Partial<Omit<NormalizedLocation, 'fullPath'>>): string {
  const query: string = location.query ? stringifyQuery(location.query) : '';
  return location.path + (query && '?') + query + (location.hash || '');
}

function stringifyQuery(query: LocationQuery): string {
  const urlParams = new URLSearchParams();
  const keys = Object.keys(query);
  for (const key of keys) {
    const value = query[key];
    if (Array.isArray(value)) {
      value.forEach(v => {
        if (v) {
          urlParams.append(key, v);
        }
      });
    } else if (value !== undefined && value !== null) {
      urlParams.append(key, value.toString());
    }
  }
  return urlParams.toString();
}

export function normalizeQuery(query: Record<string | number, any> | undefined): LocationQuery {
  const normalizedQuery: LocationQuery = {};

  for (const key in query) {
    const value = query[key];
    if (value !== undefined) {
      normalizedQuery[key] = Array.isArray(value)
        ? value.map(v => (v == null ? null : '' + v))
        : value == null
          ? value
          : '' + value;
    }
  }
  return normalizedQuery;
}

export function locationToObject(
  location: RouteLocationRaw,
  currentRoute: RouteLocation
): Exclude<RouteLocationRaw, string> {
  return typeof location === 'string' ? parseURL(location, currentRoute.path) : { ...location };
}

function parseQuery(queryString: string): LocationQuery {
  const params = new URLSearchParams(queryString);
  return Object.fromEntries(params.entries());
}

function decode(text: string | number): string {
  return decodeURIComponent(String(text));
}

function shallowCompareArray<T>(a: T[], b: T[] | T): boolean {
  return Array.isArray(b) ? a.length === b.length && a.every((v, i) => b[i] === v) : a.length === 1 && a[0] === b;
}

function compareParams(a: RouteLocation['params'], b: RouteLocation['params']): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  for (const key of aKeys) {
    const aValue = a[key];
    const bValue = b[key];
    if (Array.isArray(aValue)) {
      if (!shallowCompareArray(aValue, bValue)) {
        return false;
      }
    } else if (Array.isArray(bValue)) {
      if (!shallowCompareArray(bValue, aValue)) {
        return false;
      }
    } else {
      return a === b;
    }
  }
  return true;
}

export function isSameRouteLocation(a: RouteLocation, b: RouteLocation): boolean {
  const matchLengthA = a.matched.length - 1;
  const matchLengthB = b.matched.length - 1;

  return (
    matchLengthA >= -1 &&
    matchLengthA === matchLengthB &&
    a.matched[matchLengthA] === b.matched[matchLengthB] &&
    compareParams(a.params, b.params) &&
    stringifyQuery(a.query) === stringifyQuery(b.query) &&
    a.hash === b.hash
  );
}

export function createCallBackList<T>() {
  let callbacks: T[] = [];

  const add = (cb: T) => {
    callbacks.push(cb);
    return () => {
      callbacks = callbacks.filter(item => item !== cb);
    };
  };

  return {
    add,
    list: () => callbacks.slice(0),
    clear: () => (callbacks.length = 0),
  };
}

export function guardEvent(e: MouseEvent) {
  // don't redirect with control keys
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;
  // don't redirect when preventDefault called
  if (e.defaultPrevented) return;
  // don't redirect on right click
  if (e.button !== undefined && e.button !== 0) return;
  // don't redirect if `target="_blank"`
  // @ts-expect-error getAttribute does exist
  if (e.currentTarget && e.currentTarget.getAttribute) {
    // @ts-expect-error getAttribute exists
    const target = e.currentTarget.getAttribute('target');
    if (/\b_blank\b/i.test(target)) return;
  }
  // this may be a Weex event which doesn't have this method
  if (e.preventDefault) e.preventDefault();

  return true;
}

export function includesParams(outer: RouteLocation['params'], inner: RouteLocation['params']): boolean {
  for (const key in inner) {
    const innerValue = inner[key];
    const outerValue = outer[key];
    if (typeof innerValue === 'string') {
      if (innerValue !== outerValue) return false;
    } else {
      if (
        !Array.isArray(outerValue) ||
        outerValue.length !== innerValue.length ||
        innerValue.some((value, i) => value !== outerValue[i])
      )
        return false;
    }
  }

  return true;
}
