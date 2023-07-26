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

import * as Inula from '../../../../libs/inula/index';
import { createStore, applyMiddleware, thunk } from '../../../../libs/inula/src/inulax/adapters/redux';
import {describe, it, expect} from '@jest/globals';

describe('Redux thunk', () => {
  it('should use apply thunk middleware', async () => {
    const MAX_TODOS = 5;

    function addTodosIfAllowed(todoText) {
      return (dispatch, getState) => {
        const state = getState();

        if (state.todos.length < MAX_TODOS) {
          dispatch({type: 'ADD_TODO', text: todoText});
        }
      }
    }

    const todoStore = createStore((state = {todos: []}, action) => {
      if (action.type === 'ADD_TODO') {
        return {todos: state.todos?.concat(action.text)};
      }
      return state;
    }, null, applyMiddleware(thunk));

    for (let i = 0; i < 10; i++) {
      //TODO: resolve thunk problems
      (todoStore.dispatch as unknown as (delayedAction:(dispatch,getState)=>void)=>void)(addTodosIfAllowed('todo no.' + i));
    }

    expect(todoStore.getState().todos.length).toBe(5);
  });
});
