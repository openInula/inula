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

import { Location } from '../router';
import { Action } from '../history/types';

// 获取redux state中的值
export function getIn(state: Record<string, any>, path: string[]): any {
  if (!state) {
    return state;
  }
  const length = path.length;
  if (!length) {
    return undefined;
  }
  let res = state;
  for (let i = 0; i < length && !!res; ++i) {
    res = res[path[i]];
  }
  return res;
}

// 从store的state中获取Router、Location、Action、Hash等信息
const stateReader = (storeType: string) => {
  const isRouter = (value: unknown) => {
    return value !== null && typeof value === 'object' && !!getIn(value, ['location']) && !!getIn(value, ['action']);
  };

  const getRouter = (state: any) => {
    const router = getIn(state, ['router']);
    if (!isRouter(router)) {
      throw new Error(`Could not find router reducer in ${storeType} store, it must be mounted under "router"`);
    }
    return router!;
  };

  const getLocation = <S>(state: any): Partial<Location<S>> => getIn(getRouter(state), ['location']);
  const getAction = (state: any): Action => getIn(getRouter(state), ['action']);
  const getSearch = (state: any): string => getIn(getRouter(state), ['location', 'search']);
  const getHash = (state: any): string => getIn(getRouter(state), ['location', 'hash']);

  return {
    getHash,
    getAction,
    getSearch,
    getRouter,
    getLocation,
  };
};

export default stateReader;
