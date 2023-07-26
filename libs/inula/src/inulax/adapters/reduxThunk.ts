/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
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

import { ReduxStoreHandler, ReduxAction, ReduxMiddleware } from './redux';

function createThunkMiddleware(extraArgument?: any): ReduxMiddleware {
  return (store: ReduxStoreHandler) =>
    (next: (action: ReduxAction) => any) =>
    (
      action:
        | ReduxAction
        | ((dispatch: (action: ReduxAction) => void, store: ReduxStoreHandler, extraArgument?: any) => any)
    ) => {
      // This gets called for every action you dispatch.
      // If it's a function, call it.
      if (typeof action === 'function') {
        return action(store.dispatch, store.getState.bind(store), extraArgument);
      }

      // Otherwise, just continue processing this action as usual
      return next(action);
    };
}

export const thunk = createThunkMiddleware();
// @ts-ignore
thunk.withExtraArgument = createThunkMiddleware;
