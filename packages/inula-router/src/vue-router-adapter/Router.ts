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

import type { VueHistory } from './vueHistory';
import { ComponentType, createElement, FunctionComponent, InulaElement } from '@cloudsop/horizon';
import type {
  ExceptListener,
  NavigationGuard,
  NavigationGuardNext,
  NavigationHook,
  NormalizedRouteRecord,
  RouteLocation,
  RouteLocationRaw,
  RouteMetaData,
  RouteRecordName,
  RouteRedirectOption,
} from './types';
import { agnosticRouteMatcher, RouteBranch } from '../matcher/matcher';
import { ErrorTypes, START_LOCATION } from './const';
import {
  createCallBackList,
  isSameRouteLocation,
  locationToObject,
  normalizeQuery,
  parseURL,
  stringifyUrl,
} from './utils';
import { createRouterError, NavigationFailure } from './routerError';
import RouterLink from './RouterLink';
import RouterView from './RouterView';
import { RouterProvider } from './RouterProvider';

interface App {
  rootComponent: InulaElement;

  component(name: string, component: FunctionComponent<any>): void;

  config: AppConfig;
}

interface AppConfig {
  globalProperties: Record<string, any>;
}

export interface VueRouter {
  readonly currentRoute: RouteLocation;

  readonly option: RouterOptions;

  listening: boolean;

  // dynamic operate route methods
  addRoute(route: RouteRecord): () => void;

  removeRoute(name: RouteRecordName): void;

  hasRoute(name: RouteRecordName): boolean;

  getRoutes(): RouteBranch<RouteRecord, NormalizedRouteRecord>[];

  resolve(to: Readonly<RouteLocationRaw>, from?: Readonly<RouteLocation>): RouteLocation;

  // negative methods
  push(to: RouteLocationRaw): Promise<NavigationFailure | void | undefined>;

  replace(to: RouteLocationRaw): Promise<NavigationFailure | void | undefined>;

  go(delta: number): void;

  back(): void;

  forward(): void;

  // hooks
  beforeEach(guard: NavigationGuard): () => void;

  beforeResolve(guard: NavigationGuard): () => void;

  afterEach(guard: NavigationHook): () => void;

  onError(handler: ExceptListener): () => void;

  // status
  isReady(): Promise<void>;

  install(app: App): void;
}

export interface VueRouterInternal extends VueRouter {
  // trigger when popstate event
  pop(to: RouteLocationRaw): void;

  // use for RouterProvider
  subscribeRouteChange(observer: RouteObserver): () => void;
}

interface RouterMatchOption {
  sensitive?: boolean;
  strict?: boolean;
  start?: boolean;
  end?: boolean;
}

type RouteRecordOption = Omit<RouterMatchOption, 'start' | 'end'>;

export interface RouteRecordBase extends RouteRecordOption {
  path: string;
  redirect?: RouteRedirectOption;
  alias?: string | string[];
  name?: RouteRecordName;
  meta?: RouteMetaData;
  children?: unknown[];
  props?: boolean | Record<string, unknown>;
  beforeEnter?: NavigationGuard | NavigationGuard[];
}

export interface RouteRecordSingleView extends RouteRecordBase {
  component: ComponentType<any>;
  children?: never;
}

export interface RouteRecordWithChildren extends RouteRecordBase {
  component: ComponentType<any>;
  children: RouteRecord[];
}

export interface RouteRecordRedirect extends RouteRecordBase {
  redirect?: RouteRedirectOption;
  component?: never;
  props?: never;
  children?: never;
}

export type RouteRecord = RouteRecordSingleView | RouteRecordWithChildren | RouteRecordRedirect;

export type Guard<T = any> = () => Promise<T>;

export interface RouteObserver {
  (to: RouteLocation, from: RouteLocation): void;
}

export interface RouterOptions extends RouteRecordOption {
  history: VueHistory;
  routes: RouteRecord[];
  linkActiveClass?: string;
  linkExactActiveClass?: string;
}

function normalizeRouteRecord(record: RouteRecord): NormalizedRouteRecord {
  return {
    beforeEnter: record.beforeEnter,
    children: record.children || [],
    component: record.component,
    leaveGuards: new Set<NavigationGuard>(),
    meta: record.meta || {},
    name: record.name,
    path: record.path,
    props: record.props || {},
    redirected: record.redirect,
    updateGuards: new Set<NavigationGuard>(),
  };
}

function initRouter(options: RouterOptions): VueRouterInternal {
  const { history, routes } = options;

  const matcher = agnosticRouteMatcher<RouteRecord, NormalizedRouteRecord>(
    routes,
    {
      sensitive: options.sensitive,
      strict: options.strict,
    },
    item => normalizeRouteRecord(item)
  );

  const beforeEachGuards = createCallBackList<NavigationGuard>();
  const beforeResolveGuards = createCallBackList<NavigationGuard>();
  const afterEachGuards = createCallBackList<NavigationHook>();
  const exceptListeners = createCallBackList<ExceptListener>();

  const observers = createCallBackList<RouteObserver>();

  function resolve(to: Readonly<RouteLocationRaw>, from?: Readonly<RouteLocation>): RouteLocation {
    from = Object.assign({}, from || router.currentRoute);
    if (typeof to === 'string') {
      const normalizedLocation = parseURL(to, from.path);
      const matchedRoute = matcher.matchPath({ path: normalizedLocation.path }, from);
      return Object.assign(normalizedLocation, matchedRoute);
    }

    let matcherLocation;

    if (to.path != null) {
      matcherLocation = Object.assign({}, to, { path: parseURL(to.path, from.path).path });
    } else {
      const targetParams = Object.assign({}, to.params);
      for (const key of Object.keys(targetParams)) {
        if (targetParams[key] == null) {
          delete targetParams[key];
        }
      }
      matcherLocation = Object.assign({}, to, { params: targetParams });
    }
    const matchedRoute = matcher.matchPath(matcherLocation, from);
    const fullPath = stringifyUrl(Object.assign(to, { path: matchedRoute.path }));
    const query = normalizeQuery(to.query);
    const hash = to.hash || '';
    return Object.assign({ fullPath, query, hash }, matchedRoute);
  }

  async function push(to: RouteLocationRaw, redirectFrom?: RouteLocation) {
    const replace = typeof to === 'string' ? false : to.replace;
    const force = typeof to === 'string' ? false : to.force;
    const target = router.resolve(to);
    const from = router.currentRoute;

    const redirectLocation = extractRedirect(target);
    if (redirectLocation) {
      return push(Object.assign(redirectLocation, { replace: to, force: force }), redirectFrom || target);
    }

    target.redirectedFrom = redirectFrom;
    let failure: NavigationFailure | void | undefined;
    if (!force && isSameRouteLocation(target, from)) {
      failure = createRouterError<NavigationFailure>(ErrorTypes.NAVIGATION_DUPLICATED, { to: target, from });
    }

    return failure
      ? Promise.resolve(failure)
      : triggerGuards(target, from)
          .catch(err => triggerError(err, target, from))
          .then((failure: NavigationFailure | void) => {
            if (failure) {
              Promise.reject('infinite redirect in navigation guard');
            } else {
              doNavigate(target, true, replace);
            }
            triggerAfterEach(target, from);
          });
  }

  function replace(to: RouteLocationRaw) {
    const dest = typeof to === 'string' ? parseURL(to) : to;
    return push(Object.assign(dest, { replace: true }));
  }

  function extractRedirect(to: Readonly<RouteLocation>): RouteLocationRaw | null {
    const lastMatched = to.matched[to.matched.length - 1];
    if (lastMatched && lastMatched.redirected) {
      const redirect = lastMatched.redirected;
      let newTarget = typeof redirect === 'function' ? redirect(to) : redirect;
      if (typeof newTarget === 'string') {
        if (newTarget.includes('?') || newTarget.includes('#')) {
          newTarget = locationToObject(newTarget, router.currentRoute);
        } else {
          newTarget = { path: newTarget };
        }
      }
      return Object.assign(
        {
          query: to.query,
          hash: to.hash,
          params: newTarget.path != null ? {} : to.params,
        },
        newTarget
      );
    }
    return null;
  }

  async function pop(to: RouteLocationRaw) {
    const target = router.resolve(to);
    const from = router.currentRoute;
    return triggerGuards(target, from)
      .catch(error => {
        return triggerError(error, target, from);
      })
      .then((failure: NavigationFailure | void) => {
        doNavigate(target, false);
        triggerAfterEach(target, from, failure);
      })
      .catch();
  }

  async function triggerGuards(to: RouteLocation, from: RouteLocation) {
    let guards: Guard[] = [];
    const { leavingRecords, updateRecords, enterRecords } = analyseChangingRecord(to, from);

    for (const record of leavingRecords) {
      record.leaveGuards.forEach(guard => {
        guards.push(guardToPromise(guard, to, from));
      });
    }

    return runGuardQueue(guards)
      .then(() => {
        guards = [];
        for (const beforeEachGuard of beforeEachGuards.list()) {
          guards.push(guardToPromise(beforeEachGuard, to, from));
        }
        return runGuardQueue(guards);
      })
      .then(() => {
        guards = [];
        for (const record of updateRecords) {
          record.updateGuards.forEach(guard => {
            guards.push(guardToPromise(guard, to, from));
          });
        }
        return runGuardQueue(guards);
      })
      .then(() => {
        guards = [];
        for (const record of enterRecords) {
          if (record.beforeEnter) {
            if (Array.isArray(record.beforeEnter)) {
              const beforeEnters = record.beforeEnter.map(r => guardToPromise(r, to, from));
              guards = guards.concat(beforeEnters);
            } else {
              guards.push(guardToPromise(record.beforeEnter, to, from));
            }
          }
        }
        return runGuardQueue(guards);
      })
      .then(() => {
        guards = [];
        for (const guard of beforeResolveGuards.list()) {
          guards.push(guardToPromise(guard, to, from));
        }
        return runGuardQueue(guards);
      })
      .catch(err => {
        Promise.reject(err);
      });
  }

  function doNavigate(to: RouteLocation, triggerHistory?: boolean, replace?: boolean) {
    if (triggerHistory) {
      if (replace) {
        history.replace(to.fullPath);
      } else {
        history.push(to.fullPath);
      }
    }
    notifyUpdate({ currentRoute: to });
  }

  function triggerAfterEach(to: RouteLocation, from: RouteLocation, failure?: NavigationFailure | void): void {
    afterEachGuards.list().forEach(guard => guard(to, from, failure));
  }

  function triggerError(error: any, to: RouteLocation, from: RouteLocation) {
    for (const trigger of exceptListeners.list()) {
      trigger(error, to, from);
    }
    return Promise.reject(error);
  }

  function notifyUpdate(newAttrs: Partial<VueRouter>) {
    if ('currentRoute' in newAttrs) {
      const prevLocation = router.currentRoute;
      Object.assign(router, newAttrs);
      observers.list().forEach(trigger => {
        trigger(router.currentRoute, prevLocation);
      });
    }
  }

  function install(this: VueRouter, app: App) {
    // wrap RouterProvider for App
    app.component('RouterLink', RouterLink);
    app.component('RouterView', RouterView);
    app.rootComponent = createElement(RouterProvider, { router: this }, app.rootComponent);
    app.config.globalProperties.$router = this;
    Object.defineProperty(app.config.globalProperties, '$route', {
      enumerable: true,
      get: () => this.currentRoute,
    });
  }

  function subscribeRouteChange(observer: RouteObserver) {
    return observers.add(observer);
  }

  const router: VueRouterInternal = {
    currentRoute: START_LOCATION,
    option: options,
    listening: true,
    go: history.go,
    back: () => history.go(-1),
    forward: () => history.go(1),
    push: push,
    pop: pop,
    replace: replace,
    resolve: resolve,
    beforeEach: beforeEachGuards.add,
    beforeResolve: beforeResolveGuards.add,
    afterEach: afterEachGuards.add,
    onError: exceptListeners.add,
    addRoute(route: RouteRecord): () => void {
      return matcher.addBranch(route);
    },
    removeRoute(name: RouteRecordName) {
      return matcher.delBranch(name);
    },
    hasRoute(name: RouteRecordName): boolean {
      return Boolean(matcher.getNamedBranch(name));
    },
    getRoutes(): RouteBranch<RouteRecord, NormalizedRouteRecord>[] {
      return matcher.branches;
    },
    isReady(): Promise<void> {
      return Promise.resolve();
    },
    install: install,
    subscribeRouteChange,
  };

  return router;
}

function analyseChangingRecord(to: RouteLocation, from: RouteLocation) {
  const leavingRecords: NormalizedRouteRecord[] = [];
  const updateRecords: NormalizedRouteRecord[] = [];
  const enterRecords: NormalizedRouteRecord[] = [];

  const maxLen = Math.max(to.matched.length, from.matched.length);
  for (let i = 0; i < maxLen; i++) {
    const recordFrom = from.matched[i];
    if (recordFrom) {
      if (to.matched.find(m => m === recordFrom)) {
        updateRecords.push(recordFrom);
      } else {
        leavingRecords.push(recordFrom);
      }
    }
    const recordTo = to.matched[i];
    if (recordTo) {
      if (from.matched.findIndex(m => m === recordTo) === -1) {
        enterRecords.push(recordTo);
      }
    }
  }

  return { leavingRecords, updateRecords, enterRecords };
}

function guardToPromise(guard: NavigationGuard, to: RouteLocation, from: RouteLocation): Guard {
  const promise = new Promise((resolve, reject) => {
    const next: NavigationGuardNext = (valid?: boolean | RouteLocationRaw | Error) => {
      if (valid === false) {
        reject(createRouterError(ErrorTypes.NAVIGATION_ABORTED, { from, to }));
      } else if (valid instanceof Error) {
        reject(valid);
      } else if (typeof valid === 'string' || (valid && typeof valid === 'object')) {
        reject(createRouterError(ErrorTypes.NAVIGATION_GUARD_REDIRECT, { from: to, to: valid }));
      } else {
        resolve(null);
      }
    };
    const guardReturn = guard(to, from, next);
    let guardCall = Promise.resolve(guardReturn);
    if (guard.length < 3) {
      guardCall = guardCall.then(next);
    }
    guardCall.catch(err => reject(err));
  });

  return () => promise;
}

function runGuardQueue(guards: Guard[]) {
  return guards.reduce((promise, guard) => promise.then(() => guard()), Promise.resolve());
}

export { initRouter };
