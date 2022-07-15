import * as Horizon from '@cloudsop/horizon/index.ts';
import { createStore, applyMiddleware, thunk } from '../../../../libs/horizon/src/horizonx/adapters/redux';
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
