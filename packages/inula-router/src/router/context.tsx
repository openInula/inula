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

import { createContext } from 'openinula';
import { History, Location } from './index';
import { Matched } from './matcher/parser';

function createNamedContext<T>(name: string, defaultValue: T) {
  const context = createContext<T>(defaultValue);
  context.displayName = name;
  return context;
}

export type RouterContextValue = {
  history: History;
  location: Location;
  match: Matched | null;
};

const RouterContext = createNamedContext<RouterContextValue>('Router', {} as any);

export default RouterContext;