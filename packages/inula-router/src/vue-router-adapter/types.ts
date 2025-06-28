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
import { HistoryState } from './vueHistory';
import { RouteRecord, VueRouter } from './Router';
import { NavigationFailure } from './routerError';

declare global {
  interface Window {
    $router: VueRouter;
    $route: NormalizedRouteRecord;
  }
}

export type RouteQueryAndHash = {
  query?: LocationQuery;
  hash?: string;
};

export type RouteLocationOptions = {
  replace?: boolean;
  force?: boolean;
  state?: HistoryState;
};

export interface RouteLocationPathRaw extends RouteQueryAndHash, RouteLocationOptions {
  path: string;
}

export type RouteRecordName = string | symbol;

export interface RouteLocationNamedRaw extends RouteQueryAndHash, RouteLocationOptions {
  name?: RouteRecordName;
  params?: Record<string, string | string[]>;
  path?: undefined;
}

export interface MatcherLocation {
  name?: RouteRecordName | null;
  path: string;
  params: Record<string, string | string[]>;
  meta: RouteMetaData;
  matched: NormalizedRouteRecord[];
}

export interface RouteLocation extends MatcherLocation {
  fullPath: string;
  query: LocationQuery;
  hash: string;
  redirectedFrom?: RouteLocation | undefined;
}

export interface NormalizedRouteRecord {
  path: RouteRecord['path'];
  redirected: RouteRecord['redirect'];
  name: RouteRecord['name'];
  component: RouteRecord['component'];
  children: RouteRecord['children'];

  meta?: RouteRecord['meta'];
  props: RouteRecord['props'];

  beforeEnter: RouteRecord['beforeEnter'];
  leaveGuards: Set<NavigationGuard>;
  updateGuards: Set<NavigationGuard>;
}

export type LocationQueryValue = string | null;

export type LocationQuery = Record<string, LocationQueryValue | LocationQueryValue[]>;

export type RouteLocationRaw = string | RouteLocationPathRaw | RouteLocationNamedRaw;

export type RouteMetaData = Record<string | number | symbol, unknown>;

export type RouteRedirectOption = RouteLocationRaw | ((to: RouteLocation) => RouteLocationRaw);

export type NavigationGuardReturn = void | Error | RouteLocationRaw | boolean;

export interface NavigationGuardNext {
  (): void;

  (error: Error): void;

  (location: RouteLocationRaw): void;

  (valid: boolean | undefined): void;
}

export interface NavigationGuard {
  (
    to: RouteLocation,
    from: RouteLocation,
    next: NavigationGuardNext
  ): NavigationGuardReturn | Promise<NavigationGuardReturn>;
}

export interface NavigationHook {
  (to: RouteLocation, from: RouteLocation, failure?: NavigationFailure | void): any;
}

export interface ExceptListener {
  (error: any, to: RouteLocation, from: RouteLocation): any;
}
