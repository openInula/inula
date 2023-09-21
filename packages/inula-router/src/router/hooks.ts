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

import { useContext } from 'openinula';
import RouterContext from './context';
import { Matched, matchPath, Params } from './matcher/parser';
import { History } from '../history/types';
import { Location } from './index';

function useHistory<S>(): History<S>;
function useHistory() {
  return useContext(RouterContext).history;
}

function useLocation<S>(): Location<S>;
function useLocation() {
  return useContext(RouterContext).location;
}

function useParams<P>(): Params<P> | {};
function useParams() {
  const match = useContext(RouterContext).match;
  return match ? match.params : {};
}

function useRouteMatch<P>(path?: string): Matched<P> | null;
function useRouteMatch(path?: string) {
  const pathname = useLocation().pathname;
  const match = useContext(RouterContext).match;
  if (path) {
    return matchPath(pathname, path);
  }
  return match;
}

export { useHistory, useLocation, useParams, useRouteMatch };
