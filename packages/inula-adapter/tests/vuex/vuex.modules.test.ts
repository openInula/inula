/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
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

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createStore } from '../../src/vuex/vuex';

const TEST = 'TEST';

describe('vuex modules', () => {
  it('dynamic module registration', () => {
    const store = createStore({
      modules: {
        foo: {
          state: { bar: 1 },
          mutations: { inc: state => state.bar++ },
          actions: { inc: ({ commit }) => commit('inc') },
          getters: { fooBar: state => state.bar },
        },
        one: {
          state: { a: 0 },
          mutations: {
            aaa(state, n) {
              state.a += n;
            },
          },
        },
      },
    });

    store.registerModule('hi', {
      state: { a: 1 },
      mutations: { inc: state => state.a++ },
      actions: { incHi: ({ commit }) => commit('inc') },
      getters: { ga: state => state.a },
    });

    // expect(store._mutations.inc.length).toBe(2);
    expect(store.state.hi.a).toBe(1);
    expect(store.getters.ga).toBe(1);

    // assert initial modules work as expected after dynamic registration
    expect(store.state.foo.bar).toBe(1);
    expect(store.getters.fooBar).toBe(1);

    // test dispatching actions defined in dynamic module
    store.dispatch('incHi');
    expect(store.state.hi.a).toBe(2);
    expect(store.getters.ga).toBe(2);

    expect(store.state.foo.bar).toBe(1);
    expect(store.getters.fooBar).toBe(1);

    // unregister
    store.unregisterModule('hi');
    expect(store.state.hi).toBeUndefined();
    expect(store.getters.ga).toBeUndefined();

    // assert initial modules still work as expected after unregister
    store.dispatch('inc');
    expect(store.state.foo.bar).toBe(2);
    expect(store.getters.fooBar).toBe(2);
  });

  it('dynamic module registration with namespace inheritance', () => {
    const store = createStore({
      modules: {
        a: {
          namespaced: true,
        },
      },
    });
    const actionSpy = vi.fn();
    const mutationSpy = vi.fn();
    store.registerModule('b', {
      state: { value: 1 },
      getters: { foo: state => state.value },
      actions: { foo: actionSpy },
      mutations: { foo: mutationSpy },
    });

    expect(store.state.b.value).toBe(1);
    expect(store.getters['foo']).toBe(1);

    store.dispatch('foo');
    expect(actionSpy).toHaveBeenCalled();

    store.commit('foo');
    expect(mutationSpy).toHaveBeenCalled();
  });

  it('dynamic module existance test', () => {
    const store = createStore({});

    store.registerModule('bonjour', {});

    expect(store.hasModule('bonjour')).toBe(true);
    store.unregisterModule('bonjour');
    expect(store.hasModule('bonjour')).toBe(false);
  });

  it('should keep getters when component gets destroyed', async () => {
    const store = createStore({});

    const spy = vi.fn();

    const moduleA = {
      namespaced: true,
      state: () => ({ value: 1 }),
      getters: {
        getState(state) {
          spy();
          return state.value;
        },
      },
      mutations: {
        increment: state => {
          state.value++;
        },
      },
    };

    store.registerModule('moduleA', moduleA);

    expect(store.getters['moduleA/getState']).toBe(1);
    expect(spy).toHaveBeenCalledTimes(1);

    store.commit('moduleA/increment');

    expect(store.getters['moduleA/getState']).toBe(2);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should not fire an unrelated watcher', () => {
    const spy = vi.fn();
    const store = createStore({
      modules: {
        a: {
          state: { value: 1 },
        },
        b: {},
      },
    });

    store.watch(state => state.a, spy);
    store.registerModule('c', {
      state: { value: 2 },
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it('state as function (multiple module in same store)', () => {
    const store = createStore({
      modules: {
        one: {
          state: { a: 0 },
          mutations: {
            [TEST](state, n) {
              state.a += n;
            },
          },
        },
        two: {
          state() {
            return { a: 0 };
          },
          mutations: {
            [TEST](state, n) {
              state.a += n;
            },
          },
        },
      },
    });

    expect(store.state.one.a).toBe(0);
    expect(store.state.two.a).toBe(0);

    store.commit(TEST, 1);
    expect(store.state.one.a).toBe(1);
    expect(store.state.two.a).toBe(1);
  });

  it('state as function (same module in multiple stores)', () => {
    const storeA = createStore({
      modules: {
        foo: {
          state() {
            return { a: 0 };
          },
          mutations: {
            [TEST](state, n) {
              state.a += n;
            },
          },
        },
      },
    });

    const storeB = createStore({
      modules: {
        bar: {
          state() {
            return { a: 0 };
          },
          mutations: {
            [TEST](state, n) {
              state.a += n;
            },
          },
        },
      },
    });

    expect(storeA.state.foo.a).toBe(0);
    expect(storeB.state.bar.a).toBe(0);

    storeA.commit(TEST, 1);
    expect(storeA.state.foo.a).toBe(1);
    expect(storeB.state.bar.a).toBe(0);

    storeB.commit(TEST, 2);
    expect(storeA.state.foo.a).toBe(1);
    expect(storeB.state.bar.a).toBe(2);
  });

  it('module: mutation', function () {
    const store = createStore({
      state: {
        a: 1,
      },
      mutations: {
        [TEST](state, n) {
          state.a += n;
        },
      },
      modules: {
        nested: {
          state: { a: 2 },
          mutations: {
            [TEST](state, n) {
              state.a += n;
            },
          },
        },
        four: {
          state: { a: 6 },
          mutations: {
            [TEST](state, n) {
              state.a += n;
            },
          },
        },
      },
    });
    store.commit(TEST, 1);
    expect(store.state.a).toBe(2);
    expect(store.state.nested.a).toBe(3);
    expect(store.state.four.a).toBe(7);
  });

  it('module: action', function () {
    let calls = 0;

    const store = createStore({
      state: {
        a: 1,
      },
      actions: {
        [TEST]({ state, rootState }) {
          calls++;
          expect(state.a).toBe(1);
          expect(rootState).toBe(store.state);
        },
      },
      modules: {
        nested: {
          state: { a: 2 },
          actions: {
            [TEST]({ state, rootState }) {
              calls++;
              expect(state.a).toBe(2);
              expect(rootState).toBe(store.state);
            },
          },
        },
        four: {
          state: { a: 6 },
          actions: {
            [TEST]({ state, rootState }) {
              calls++;
              expect(state.a).toBe(6);
              expect(rootState).toBe(store.state);
            },
          },
        },
      },
    });
    store.dispatch(TEST);
    expect(calls).toBe(3);
  });

  it('module: getters', function () {
    const store = createStore({
      state: {
        a: 1,
      },
      getters: {
        constant: () => 0,
        [`getter1`]: (state, getters, rootState) => {
          expect(getters.constant).toBe(0);
          expect(rootState.a).toBe(store.state.a);
          return state.a;
        },
      },
      modules: {
        nested: {
          state: { a: 2 },
          getters: {
            [`getter2`]: (state, getters, rootState) => {
              expect(getters.constant).toBe(0);
              expect(rootState.a).toBe(store.state.a);
              return state.a;
            },
          },
        },
        four: {
          state: { a: 6 },
          getters: {
            [`getter6`]: (state, getters, rootState) => {
              expect(getters.constant).toBe(0);
              expect(rootState.a).toBe(store.state.a);
              return state.a;
            },
          },
        },
      },
    });
    [1, 2, 6].forEach(n => {
      expect(store.getters[`getter${n}`]).toBe(n);
    });
  });

  it('module: namespace', () => {
    const actionSpy = vi.fn();
    const mutationSpy = vi.fn();

    const store = createStore({
      modules: {
        a: {
          namespaced: true,
          state: {
            a: 1,
          },
          getters: {
            b: () => 2,
          },
          actions: {
            [TEST]: actionSpy,
          },
          mutations: {
            [TEST]: mutationSpy,
          },
        },
      },
    });

    expect(store.state.a.a).toBe(1);
    expect(store.getters['a/b']).toBe(2);
    store.dispatch('a/' + TEST);
    expect(actionSpy).toHaveBeenCalled();
    store.commit('a/' + TEST);
    expect(mutationSpy).toHaveBeenCalled();
  });

  it('module: getters are namespaced in namespaced module', () => {
    const store = createStore({
      state: { value: 'root' },
      getters: {
        foo: state => state.value,
      },
      modules: {
        a: {
          namespaced: true,
          state: { value: 'module' },
          getters: {
            foo: state => {
              return state.value;
            },
            bar: (state, getters) => {
              return getters.foo;
            },
            baz: (state, getters, rootState, rootGetters) => rootGetters.foo,
          },
        },
      },
    });

    expect(store.getters['a/foo']).toBe('module');
    expect(store.getters['a/bar']).toBe('module');
    expect(store.getters['a/baz']).toBe('root');
  });

  it('module: action context is namespaced in namespaced module', () => {
    const rootActionSpy = vi.fn();
    const rootMutationSpy = vi.fn();
    const moduleActionSpy = vi.fn();
    const moduleMutationSpy = vi.fn();

    const store = createStore({
      state: { value: 'root' },
      getters: { foo: state => state.value },
      actions: { foo: rootActionSpy },
      mutations: { foo: rootMutationSpy },
      modules: {
        a: {
          namespaced: true,
          state: { value: 'module' },
          getters: { foo: state => state.value },
          actions: {
            foo: moduleActionSpy,
            test({ dispatch, commit, getters, rootGetters }) {
              expect(getters.foo).toBe('module');
              expect(rootGetters.foo).toBe('root');

              dispatch('foo');
              expect(moduleActionSpy).toHaveBeenCalledTimes(1);
              dispatch('foo', null, { root: true });
              expect(rootActionSpy).toHaveBeenCalledTimes(1);

              commit('foo');
              expect(moduleMutationSpy).toHaveBeenCalledTimes(1);
              commit('foo', null, { root: true });
              expect(rootMutationSpy).toHaveBeenCalledTimes(1);
            },
          },
          mutations: { foo: moduleMutationSpy },
        },
      },
    });

    store.dispatch('a/test');
  });

  it('dispatching multiple actions in different modules', () => {
    const store = createStore({
      modules: {
        a: {
          actions: {
            [TEST]() {
              return 1;
            },
          },
        },
        b: {
          actions: {
            [TEST]() {
              return new Promise(r => r(2));
            },
          },
        },
      },
    });
    store.dispatch(TEST).then(res => {
      expect(res[0]).toBe(1);
      expect(res[1]).toBe(2);
    });
  });
});
