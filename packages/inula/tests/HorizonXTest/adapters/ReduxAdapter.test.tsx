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

//@ts-ignore
import * as Inula from '../../../src/index';
import {
  createStore,
  applyMiddleware,
  combineReducers,
  bindActionCreators,
  compose,
  ReduxAction,
} from '../../../src/inulax/adapters/redux';
import TestComponent from './connectTest2';
import { log, getAndClear } from '../../jest/logUtils';

describe('Redux adapter', () => {
  it('createStore get initial state ', () => {
    const store = createStore(
      (state, _) => {
        return state;
      },
      [{ id: 123, text: 'Hello world' }]
    );
    expect(store.getState()).toEqual([{ id: 123, text: 'Hello world' }]);
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

    expect(reduxStore.getState().counter).toBe(-1);
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
    expect(counter).toBe(2); // execute dispatch two times, applyMiddleware was called same times
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

    expect(counter).toBe(1); // execute dispatch two times, applyMiddleware was called same times
    expect(lastAction).toBe('toggle');
    expect(middlewareCallList[0]).toBe('callCounter');
    expect(middlewareCallList[1]).toBe('lastFunctionStorage');
  });

  it('mapDispatchToProps should has return', () => {
    const getData = () => () => {
      return new Promise<void>(resolve => {
        log('request data');
        setTimeout(() => resolve(), 1000);
      }).then(() => {
        log('get resp');
      });
    };

    const {
      reduxAdapter: { connect, Provider, createStore, thunk, applyMiddleware, compose },
    } = Inula;

    const store = createStore(() => ({}), compose(applyMiddleware(...[thunk])));
    const Component = connect({} as any, { getData })(TestComponent);

    Inula.act(() => {
      Inula.render(
        <Provider store={store}>
          <Component />
        </Provider>,
        document.body
      );
    });
    jest.runAllTimersAsync().then(() => {
      expect(getAndClear()).toEqual(['request data', 'get resp', 'get data']);
    });
  });
});

describe('test createStore', () => {
  interface Todo {
    id: number;
    text: string;
  }

  type TodoAction = { type: 'ADD_TODO'; text: string };

  function id(state: { id: number }[]) {
    return state.reduce((result, item) => (item.id > result ? item.id : result), 0) + 1;
  }

  function addTodo(text: string): TodoAction {
    return { type: 'ADD_TODO', text };
  }

  function todos(state: Todo[] = [], action: TodoAction): Todo[] {
    switch (action.type) {
      case 'ADD_TODO':
        return [
          ...state,
          {
            id: id(state),
            text: action.text,
          },
        ];
      default:
        return state;
    }
  }

  function todosReverse(state: Todo[] = [], action: TodoAction) {
    switch (action.type) {
      case 'ADD_TODO':
        return [
          {
            id: id(state),
            text: action.text,
          },
          ...state,
        ];
      default:
        return state;
    }
  }

  it('maintains state integrity when updating the reducer.', () => {
    const store = createStore(todos);
    store.dispatch(addTodo('Hello'));
    store.dispatch(addTodo('World'));
    expect(store.getState()).toEqual([
      { id: 1, text: 'Hello' },
      { id: 2, text: 'World' },
    ]);
    store.replaceReducer(todosReverse);
    expect(store.getState()).toEqual([
      { id: 1, text: 'Hello' },
      { id: 2, text: 'World' },
    ]);
    store.dispatch(addTodo('Foo'));
    expect(store.getState()).toEqual([
      { id: 3, text: 'Foo' },
      { id: 1, text: 'Hello' },
      { id: 2, text: 'World' },
    ]);
    store.replaceReducer(todos);
    expect(store.getState()).toEqual([
      { id: 3, text: 'Foo' },
      { id: 1, text: 'Hello' },
      { id: 2, text: 'World' },
    ]);
  });

  it('listeners property should be private', async () => {
    const store = createStore(todos);
    let resolve: (value: unknown) => void = () => {};
    const asyncTask = new Promise(_resolve => {
      resolve = _resolve;
    });

    store.subscribe(function (this: any) {
      resolve(this);
    });
    store.dispatch(addTodo('Hello'));
    const result = await asyncTask;

    expect(result).toBe(undefined);
  });

  it('handles nested dispatches gracefully', () => {
    function foo(state = 0, action: ReduxAction) {
      return action.type === 'foo' ? 1 : state;
    }

    function bar(state = 0, action: ReduxAction) {
      return action.type === 'bar' ? 2 : state;
    }

    const store = createStore(combineReducers({ foo, bar }));

    store.subscribe(() => {
      const state = store.getState();
      if (state.bar === 0) {
        store.dispatch({ type: 'bar' });
      }
    });

    store.dispatch({ type: 'foo' });
    expect(store.getState()).toEqual({
      foo: 1,
      bar: 2,
    });
  });
});

describe('test redux util function combineReducers', () => {
  const func1 = (state = {}) => state;
  const func2 = (state = {}) => state;
  const ACTION = { type: 'ACTION' };

  it('combineReducers return a composite reducer that maps the state keys to given reducer', () => {
    const reducer = combineReducers({
      counter: (state = 0, action) => (action.type === 'increment' ? state + 1 : state),
      stack: (state = [], action) => (action.type === 'push' ? [...state, action.value] : state),
    });

    const s1 = reducer({}, { type: 'increment' });
    expect(s1).toEqual({ counter: 1, stack: [] });
    const s2 = reducer(s1, { type: 'push', value: 'a' });
    expect(s2).toEqual({ counter: 1, stack: ['a'] });
  });

  it('state stays the same if reducers do not change', function () {
    const originalCompositeReducer = combineReducers({ func1, func2 });
    const store = createStore(originalCompositeReducer);

    store.dispatch(ACTION);

    const initialState = store.getState();

    store.replaceReducer(combineReducers({ func1, func2 }));
    store.dispatch(ACTION);

    const nextState = store.getState();
    expect(nextState).toBe(initialState);
  });

  it('state update if more than one combineReducers are removed', () => {
    const originalCompositeReducer = combineReducers({ func1, func2 });
    const store = createStore(originalCompositeReducer);

    store.dispatch(ACTION);

    const initialState = store.getState();

    store.replaceReducer(combineReducers({ func2 }));

    const nextState = store.getState();
    expect(nextState).not.toBe(initialState);
  });

  it('when combineReducers changed the return should change', function () {
    const baz = (state = {}) => state;

    const originalCompositeReducer = combineReducers({ func1, func2 });
    const store = createStore(originalCompositeReducer);

    store.dispatch(ACTION);

    const initialState = store.getState();

    store.replaceReducer(combineReducers({ baz, func2 }));
    store.dispatch(ACTION);

    const nextState = store.getState();
    expect(nextState).not.toBe(initialState);
  });
});

describe('test redux util function compose', () => {
  it('composes from right to left', () => {
    const double = x => x * 2;
    const square = x => x * x;
    expect(compose(square)(5)).toBe(25);
    expect(compose(square, double)(5)).toBe(100);
    expect(compose(double, square, double)(5)).toBe(200);
  });

  it('can be seeded with multiple arguments', () => {
    const square = x => x * x;
    const add = (x, y) => x + y;
    expect(compose(square, add)(1, 2)).toBe(9);
  });
});
