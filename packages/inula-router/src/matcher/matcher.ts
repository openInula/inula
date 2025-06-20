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

import { createPathParser } from './parser';
import { scoreCompare } from './utils';
import type { Parser, ParserOption } from './types';

type RouteRecordName = string | symbol;

interface AgnosticRouteRecord<T extends AgnosticRouteRecord<T>> {
  path: string;
  component?: unknown | undefined;
  meta?: Record<string | number | symbol, unknown>;
  strict?: boolean;
  sensitive?: boolean;
  name?: RouteRecordName;
  children?: T[];
}

export interface RouteBranch<T extends AgnosticRouteRecord<T>, R = T> {
  path: T['path'];
  score: number[];
  component: T['component'];
  key: string[];
  regexp: RegExp;
  parse: Parser<unknown>['parse'];
  compile: Parser<unknown>['compile'];
  parent?: RouteBranch<T, R>;
  children: RouteBranch<T, R>[];
  raw: R;
}

interface CommonLocation {
  path: string;
  name?: string | symbol | null;
  params: Param;
}

interface MatcherOption {
  strict?: boolean;
  sensitive?: boolean;
}

type Param = Record<string, string | string[]>;

const defaultMatcherOption: MatcherOption = {
  strict: false,
  sensitive: false,
};

function isRouteName(name: unknown): name is RouteRecordName {
  return typeof name === 'string' || typeof name === 'undefined';
}

function getLocationParams(params: Param, keys: string[]): Param {
  const newParams: Param = {};
  for (const key of keys) {
    if (key in params) {
      newParams[key] = params[key];
    }
  }
  return newParams;
}

function convertRecordToBranch<T extends AgnosticRouteRecord<T>, R extends AgnosticRouteRecord<T>>(
  record: R,
  option: ParserOption
): RouteBranch<T, R> {
  const parser = createPathParser(record.path, option);
  return {
    raw: record,
    path: record.path,
    score: parser.score,
    parse: parser.parse,
    regexp: parser.regexp,
    compile: parser.compile,
    component: record.component,
    key: parser.keys,
    children: [],
  };
}

function agnosticRouteMatcher<T extends AgnosticRouteRecord<T>, R extends AgnosticRouteRecord<T> = T>(
  routes: T[],
  option: MatcherOption = defaultMatcherOption,
  branchHandler: (item: T) => R = item => item as unknown as R
) {
  const branches: RouteBranch<T, R>[] = [];
  const branchesMap = new Map<RouteRecordName, RouteBranch<T, R>>();

  function addBranch(route: T, parent: RouteBranch<T, R> | null = null, recursive: boolean = true) {
    const normalizedRecord = branchHandler(route);
    const path = normalizedRecord.path!;
    if (parent && !path.startsWith('/')) {
      const concatSlash = parent.path.endsWith('/') ? '' : '/';
      normalizedRecord.path = parent.path + (path ? concatSlash + path : '');
    }
    const recordParserOption = mergeDefault(
      {
        exact: true,
        caseSensitive: option.sensitive,
        strictMode: option.strict,
      },
      {
        caseSensitive: route.sensitive,
        strictMode: route.strict,
      }
    );
    const branch = convertRecordToBranch<T, R>(normalizedRecord, recordParserOption);
    if (parent) {
      branch.parent = parent;
      parent.children.push(branch);
    }
    const originalBranch = branch;
    branches.push(branch);
    if (branch.raw.name) {
      branchesMap.set(branch.raw.name, branch);
    }
    if (Array.isArray(route.children) && recursive) {
      for (const child of route.children) {
        addBranch(child, branch);
      }
    }
    branches.sort((a, b) => {
      const score = scoreCompare(a.score, b.score);
      if (score !== 0) {
        return score;
      }
      return a.parent ? -1 : 1;
    });
    return originalBranch ? () => delBranch(originalBranch) : () => {};
  }

  function getNamedBranch(name: RouteRecordName) {
    if (branchesMap.has(name)) {
      return branchesMap.get(name)!.raw;
    }
    return undefined;
  }

  function delBranch(branchRef: RouteRecordName | RouteBranch<T, R>) {
    if (isRouteName(branchRef)) {
      const branch = branchesMap.get(branchRef);
      if (branch) {
        branchesMap.delete(branchRef);
        const branchIndex = branches.indexOf(branch);
        if (branchIndex > -1) {
          branches.splice(branchIndex, 1);
          branch.children.forEach(b => delBranch(b));
        }
      }
    } else {
      const idx = branches.indexOf(branchRef);
      if (idx > -1) {
        branches.splice(idx, 1);
        if (branchRef.raw.name) {
          branchesMap.delete(branchRef.raw.name);
        }
      }
      branchRef.children.forEach(b => delBranch(b));
    }
    branches.sort((a, b) => scoreCompare(a.score, b.score));
  }

  function matchPath(to: Readonly<Partial<CommonLocation>>, from: Readonly<CommonLocation>) {
    let path: RouteBranch<T, R>['path'];
    let branch: RouteBranch<T, R> | undefined;
    let name: RouteRecordName | undefined;
    let params: Param = {};

    if ('name' in to && to.name) {
      branch = branchesMap.get(to.name);
      if (!branch) {
        throw Error('route now found');
      }
      name = branch.raw.name;
      params = getLocationParams(from.params, branch.key);
      if (to.params) {
        params = Object.assign(params, getLocationParams(to.params, branch.key));
      }
      path = branch.compile(params);
    } else if (to.path != null) {
      path = to.path;
      for (const b of branches) {
        if (b.regexp.test(path)) {
          branch = b;
          break;
        }
      }
      if (branch) {
        params = branch.parse(path)!.params;
        name = branch.raw.name;
      }
    } else {
      branch = from.name ? branchesMap.get(from.name) : branches.find(b => b.regexp.test(from.path));
      if (!branch) {
        throw Error('route now found');
      }
      name = branch.raw.name;
      params = Object.assign({}, from.params, to.params);
      path = branch.compile(params);
    }
    const matched: R[] = [];
    let parentBranch = branch;
    while (parentBranch) {
      matched.push(parentBranch.raw);
      parentBranch = parentBranch.parent;
    }
    // push is 800 times faster than unshift
    matched.reverse();
    if (matched.length < 1) {
      console.warn(`url "${path}" has no matched route`);
    }

    return {
      name,
      path,
      params,
      matched,
      meta: merge(matched),
    };
  }

  routes.forEach(r => addBranch(r));

  return {
    branches,
    addBranch,
    delBranch,
    matchPath,
    getNamedBranch,
  };
}

type RecordMeta = Pick<AgnosticRouteRecord<any>, 'meta'>;

function merge<T extends RecordMeta>(data: T[]) {
  return data.reduce((prev, currentValue) => Object.assign(prev, currentValue.meta), {});
}

function mergeDefault<T extends { [key: string]: any }>(defaultOptions: T, partialOptions: Partial<T>): T {
  const mergedOption = {} as T;
  for (const key in defaultOptions) {
    mergedOption[key] =
      key in partialOptions && partialOptions[key] != null ? partialOptions[key]! : defaultOptions[key];
  }
  return mergedOption;
}

export { agnosticRouteMatcher };
