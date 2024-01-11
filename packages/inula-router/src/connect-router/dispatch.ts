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

import { ActionMessage, ActionName } from './actions';
import { History } from '../history/types';

// 定义connect-router对应的redux dispatch函数
export function routerMiddleware(history: History) {
  return function (_: any) {
    return function (next: any) {
      return function (action: ActionMessage) {
        if (action.type !== ActionName.CALL_HISTORY_METHOD) {
          return next(action);
        }
        const {
          payload: { method, args },
        } = action;
        if (method in history) {
          (history as any)[method](...args);
        }
      };
    };
  };
}
