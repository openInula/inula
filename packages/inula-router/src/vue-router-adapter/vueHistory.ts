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

import { createBrowserHistory } from '../history/browerHistory';
import { createHrefHandler, normalizeBase } from './utils';
import { createLocation, createPath, stripBasename, addHeadSlash } from '../history/utils';
import type { ActionInfo, CommonListener, CreateLocationHandler } from '../history/types';

export type HistoryLocation = string;
export type HistoryState = {
  [key: string | number]: HistoryStateValue;
};
type HistoryStateValue = string | number | boolean | null | undefined | HistoryState | HistoryStateValue[];

interface HistoryCallback {
  (to: HistoryLocation, from: HistoryLocation, information: ActionInfo): void;
}

export interface VueHistory {
  // props
  readonly base: string;
  readonly location: HistoryLocation;
  readonly state: HistoryState;

  // methods
  push(to: HistoryLocation, data?: HistoryState): void;

  replace(to: HistoryLocation, data?: HistoryState): void;

  go(delta: number, triggerListeners?: boolean): void;

  listen(cb: HistoryCallback): () => void;

  /**
   * @internal
   * @desc use for internal only
   * @param listener {CommonListener}
   */
  listenLocation(listener: CommonListener): () => void;

  createHref(location: HistoryLocation): string;

  destroy(): void;
}

function createVueBaseHistory(handler: CreateLocationHandler<any>, base?: string): VueHistory {
  const urlBase = normalizeBase(base);
  const locationHandler = handler.locationHandler ? handler.locationHandler(urlBase) : null;
  const hrefHandler = handler.baseHandler ? handler.baseHandler(urlBase) : null;
  const baseHistory = createBrowserHistory<any>({ basename: urlBase, locationHandler, baseHandler: hrefHandler });

  const listen = (listener: HistoryCallback) => {
    return baseHistory.addListener({ type: 'pop', listener: listener });
  };

  const listenLocation = (listener: CommonListener) => {
    return baseHistory.listen(listener);
  };

  const push = (to: HistoryLocation, data?: HistoryState) => {
    return baseHistory.push(stripBasename(to, urlBase), data);
  };

  const replace = (to: HistoryLocation, data?: HistoryState) => {
    return baseHistory.replace(stripBasename(to, urlBase), data);
  };

  const historyAdapter: VueHistory = {
    base: urlBase,
    location: '',
    state: {},
    go: baseHistory.go,
    push: push,
    listen,
    listenLocation,
    replace: replace,
    destroy: baseHistory.destroy,
    createHref: createHrefHandler(urlBase),
  };

  // let location and state readonly
  Object.defineProperties(historyAdapter, {
    location: {
      enumerable: true,
      get: () => createPath(locationHandler ? locationHandler(baseHistory.location) : baseHistory.location),
    },
    state: {
      enumerable: true,
      get: () => baseHistory.location.state,
    },
  });

  return historyAdapter;
}

function createWebHistory(base?: string): VueHistory {
  return createVueBaseHistory({}, base);
}

function createWebHashHistory(base?: string): VueHistory {
  base = location.host ? base || location.pathname + location.search : '';

  if (!base.includes('#')) {
    base += '#';
  }

  const getLocation = (basename: string) => () => {
    const { pathname, search, hash } = window.location;
    const hashPos = basename.indexOf('#');
    if (hashPos > -1) {
      const slicePos = hash.includes(basename.slice(hashPos)) ? basename.slice(hashPos).length : 1;
      const pathFromHash = addHeadSlash(hash.slice(slicePos));
      return createLocation('', pathFromHash);
    }
    const path = stripBasename(pathname, basename);
    return createLocation('', path + search + hash);
  };

  const getBase = (base: string) => () => {
    const hashIndex = base.indexOf('#');
    if (hashIndex !== -1) {
      return window.location.host && document.querySelector('base') ? base : base.slice(hashIndex);
    }
    return location.protocol + '//' + location.host + base;
  };

  const hashHandlers: CreateLocationHandler<any> = { locationHandler: getLocation, baseHandler: getBase };

  return createVueBaseHistory(hashHandlers, base);
}

export { createWebHistory, createWebHashHistory };
