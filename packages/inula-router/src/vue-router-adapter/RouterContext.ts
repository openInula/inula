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

import { createContext } from 'openinula';
import type { NormalizedRouteRecord, RouteLocation } from './types';
import type { VueRouter } from './Router';
import { START_LOCATION } from './const';

export const RouterContext = createContext<VueRouter>(null as any);

export const RouteContext = createContext<RouteLocation>(START_LOCATION);

export const CurrentRouteRecord = createContext<NormalizedRouteRecord>(null as any);

// provide match depth for <RouterView/>
export const ViewDepth = createContext<{ depth: number }>({ depth: 0 });
