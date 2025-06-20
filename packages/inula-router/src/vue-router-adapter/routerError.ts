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

import { MatcherLocation, RouteLocation, type RouteLocationRaw } from './types';
import { ErrorTypes } from './const';

export interface MatcherError extends Error {
  type: ErrorTypes.MATCHER_NOT_FOUND;
  location: MatcherLocation;
  currentLocation?: MatcherLocation;
}

export interface NavigationFailure extends Error {
  type: ErrorTypes.NAVIGATION_CANCELLED | ErrorTypes.NAVIGATION_ABORTED | ErrorTypes.NAVIGATION_DUPLICATED;
  from: RouteLocation;
  to: RouteLocation;
}

export interface NavigationRedirectError extends Omit<NavigationFailure, 'to' | 'type'> {
  type: ErrorTypes.NAVIGATION_GUARD_REDIRECT;
  to: RouteLocationRaw;
}

export type RouteError = MatcherError | NavigationFailure | NavigationRedirectError;

const NavigationFailureSymbol = Symbol('navigation failure');

export function createRouterError<T extends RouteError>(type: T['type'], params: Omit<T, 'type' | keyof Error>): T {
  return Object.assign(new Error(), { type: type, [NavigationFailureSymbol]: true }, params) as unknown as T;
}

export function isNavigationFailure(error: any, type: ErrorTypes) {
  return (
    error instanceof Error &&
    NavigationFailureSymbol in error &&
    (type == null || Boolean((error as unknown as NavigationFailure).type & type))
  );
}
