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

//@ts-ignore
import * as Inula from '../../../../libs/inula/index';
import {
  createStore,
  applyMiddleware,
  combineReducers,
  bindActionCreators,
} from '../../../../libs/inula/src/inulax/adapters/redux';
import { describe, it, expect } from '@jest/globals';

describe('Redux adapter', () => {
  it('should use getState()', async () => {
    const reduxStore = createStore((state, action) => {
      return state;
    }, 0);

    expect(reduxStore.getState()).toBe(0);
  });

  it('Should use default state, dispatch action and update state', async () => {
    const reduxStore = createStore((state, action) => {
      switch (action.type) {
        case 'ADD':
          return { counter: state.counter + 1 };
        default:
          return { counter: 0 };
      }
    });

    expect(reduxStore.getState().counter).toBe(0);

    reduxStore.dispatch({ type: 'ADD' });

    expect(reduxStore.getState().counter).toBe(1);
  });

  it('Should attach and detach listeners', async () => {
    let counter = 0;
    const reduxStore = createStore((state = 0, action) => {
      switch (action.type) {
        case 'ADD':
          return state + 1;
        default:
          return state;
      }
    });

    reduxStore.dispatch({ type: 'ADD' });
    expect(counter).toBe(0);
    expect(reduxStore.getState()).toBe(1);
    const unsubscribe = reduxStore.subscribe(() => {
      counter++;
    });
    reduxStore.dispatch({ type: 'ADD' });
    reduxStore.dispatch({ type: 'ADD' });
    expect(counter).toBe(2);
    expect(reduxStore.getState()).toBe(3);
    unsubscribe();
    reduxStore.dispatch({ type: 'ADD' });
    reduxStore.dispatch({ type: 'ADD' });
    expect(counter).toBe(2);
    expect(reduxStore.getState()).toBe(5);
  });

  it('Should bind action creators', async () => {
    const addTodo = text => {
      return {
        type: 'ADD_TODO',
        text,
      };
    };

    const reduxStore = createStore((state = [], action) => {
      if (action.type === 'ADD_TODO') {
        return [...state, action.text];
      }
      return state;
    });

    const actions = bindActionCreators({ addTodo }, reduxStore.dispatch);

    actions.addTodo('todo');

    expect(reduxStore.getState()[0]).toBe('todo');
  });

  it('Should replace reducer', async () => {
    const reduxStore = createStore((state, action) => {
      switch (action.type) {
        case 'ADD':
          return { counter: state.counter + 1 };
        default:
          return { counter: 0 };
      }
    });

    reduxStore.dispatch({ type: 'ADD' });

    expect(reduxStore.getState().counter).toBe(1);

    reduxStore.replaceReducer((state, action) => {
      switch (action.type) {
        case 'SUB':
          return { counter: state.counter - 1 };
        default:
          return { counter: 0 };
      }
    });

    reduxStore.dispatch({ type: 'SUB' });

    expect(reduxStore.getState().counter).toBe(0);
  });

  it('Should combine reducers', async () => {
    const booleanReducer = (state = false, action) => {
      switch (action.type) {
        case 'TOGGLE':
          return !state;
        default:
          return state;
      }
    };

    const addReducer = (state = 0, action) => {
      switch (action.type) {
        case 'ADD':
          return state + 1;
        default:
          return state;
      }
    };

    const reduxStore = createStore(combineReducers({ check: booleanReducer, counter: addReducer }));

    expect(reduxStore.getState().counter).toBe(0);
    expect(reduxStore.getState().check).toBe(false);

    reduxStore.dispatch({ type: 'ADD' });
    reduxStore.dispatch({ type: 'TOGGLE' });

    expect(reduxStore.getState().counter).toBe(1);
    expect(reduxStore.getState().check).toBe(true);
  });

  it('Should apply enhancers', async () => {
    let counter = 0;
    let middlewareCallList: string[] = [];

    const callCounter = store => next => action => {
      middlewareCallList.push('callCounter');
      counter++;
      let result = next(action);
      return result;
    };

    const reduxStore = createStore(
      (state, action) => {
        switch (action.type) {
          case 'toggle':
            return {
              check: !state.check,
            };
          default:
            return state;
        }
      },
      { check: false },
      applyMiddleware(callCounter)
    );

    reduxStore.dispatch({ type: 'toggle' });
    reduxStore.dispatch({ type: 'toggle' });

    expect(counter).toBe(3); // NOTE: first action is always store initialization
  });

  it('Should apply multiple enhancers', async () => {
    let counter = 0;
    let lastAction = '';
    let middlewareCallList: string[] = [];

    const callCounter = store => next => action => {
      middlewareCallList.push('callCounter');
      counter++;
      let result = next(action);
      return result;
    };

    const lastFunctionStorage = store => next => action => {
      middlewareCallList.push('lastFunctionStorage');
      lastAction = action.type;
      let result = next(action);
      return result;
    };

    const reduxStore = createStore(
      (state, action) => {
        switch (action.type) {
          case 'toggle':
            return {
              check: !state.check,
            };
          default:
            return state;
        }
      },
      { check: false },
      applyMiddleware(callCounter, lastFunctionStorage)
    );

    reduxStore.dispatch({ type: 'toggle' });

    expect(counter).toBe(2); // NOTE: first action is always store initialization
    expect(lastAction).toBe('toggle');
    expect(middlewareCallList[0]).toBe('callCounter');
    expect(middlewareCallList[1]).toBe('lastFunctionStorage');
  });
});
