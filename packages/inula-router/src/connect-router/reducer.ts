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

import { ActionName } from './actions';
import { Action, History } from '../history/types';
import { Location } from '../router';

type LocationWithQuery = Partial<Location> & { query?: Record<string, any> };

// 解析location对象，将其中的query参数解析并注入
function injectQueryParams(location?: LocationWithQuery): LocationWithQuery {
  if (location && location.query) {
    return location;
  }

  const queryString = location && location.search;

  if (!queryString) {
    return {
      ...location,
      query: {},
    };
  }
  const queryObject: Record<string, any> = {};

  const params = new URLSearchParams(queryString);
  params.forEach((value, key) => (queryObject[key] = value));

  return {
    ...location,
    query: queryObject,
  };
}

type InitRouterState = {
  location: LocationWithQuery;
  action: Action;
};

type Payload = {
  type?: ActionName;
  payload?: any;
};

export function createConnectRouter() {
  // 初始化redux State
  return (history: History) => {
    const initRouterState = {
      location: injectQueryParams(history.location),
      action: history.action,
    };

    // 定义connect-router对应的redux reducer函数
    return (state: InitRouterState = initRouterState, { type, payload }: Payload = {}): any => {
      if (type === ActionName.LOCATION_CHANGE) {
        const { location, action, isFirstRendering } = payload;
        if (isFirstRendering) {
          return state;
        }
        return { ...state, location: injectQueryParams(location), action: action };
      }
      return state;
    };
  };
}
