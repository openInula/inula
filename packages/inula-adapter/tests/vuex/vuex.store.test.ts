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

import { describe, it, expect, vi } from 'vitest';
import { createStore } from '../../src/vuex/vuex';
import { vueReactive } from 'openinula';

const { nextTick } = vueReactive;

const TEST_M = 'TEST_M';
const TEST_A = 'TEST_A';

describe('vuex Store', () => {
  it('committing mutations', () => {
    const store = createStore({
      state: {
        a: 1,
      },
      mutations: {
        [TEST_M](state, n) {
          state.a += n;
        },
      },
    });
    store.commit(TEST_M, 2);
    expect(store.state.a).toBe(3);
  });

  it('committing with object style', () => {
    const store = createStore({
      state: {
        a: 1,
      },
      mutations: {
        [TEST_M](state, payload) {
          state.a += payload.amount;
        },
      },
    });
    store.commit({
      type: TEST_M,
      amount: 2,
    });
    expect(store.state.a).toBe(3);
  });

  it('dispatching actions, sync', () => {
    const store = createStore({
      state: {
        a: 1,
      },
      mutations: {
        [TEST_M](state, n) {
          state.a += n;
        },
      },
      actions: {
        [TEST_A]({ commit }, n) {
          commit(TEST_M, n);
        },
      },
    });
    store.dispatch(TEST_A, 2);
    expect(store.state.a).toBe(3);
  });

  it('dispatching with object style', () => {
    const store = createStore({
      state: {
        a: 1,
      },
      mutations: {
        [TEST_M](state, n) {
          state.a += n;
        },
      },
      actions: {
        [TEST_A]({ commit }, payload) {
          commit(TEST_M, payload.amount);
        },
      },
    });
    store.dispatch({
      type: TEST_A,
      amount: 2,
    });
    expect(store.state.a).toBe(3);
  });

  it('dispatching actions, with returned Promise', () => {
    const store = createStore({
      state: {
        a: 1,
      },
      mutations: {
        [TEST_M](state, n) {
          state.a += n;
        },
      },
      actions: {
        [TEST_A]({ commit }, n) {
          return new Promise(resolve => {
            setTimeout(() => {
              commit(TEST_M, n);
              resolve('');
            }, 0);
          });
        },
      },
    });
    expect(store.state.a).toBe(1);
    store.dispatch(TEST_A, 2).then(() => {
      expect(store.state.a).toBe(3);
    });
  });

  it('composing actions with async/await', () => {
    const store = createStore({
      state: {
        a: 1,
      },
      mutations: {
        [TEST_M](state, n) {
          state.a += n;
        },
      },
      actions: {
        [TEST_A]({ commit }, n) {
          return new Promise(resolve => {
            setTimeout(() => {
              commit(TEST_M, n);
              resolve('');
            }, 0);
          });
        },
        two: async ({ commit, dispatch }, n) => {
          await dispatch(TEST_A, 1);
          expect(store.state.a).toBe(2);
          commit(TEST_M, n);
        },
      },
    });
    expect(store.state.a).toBe(1);
    store.dispatch('two', 3).then(() => {
      expect(store.state.a).toBe(5);
    });
  });

  it('detecting action Promise errors', () => {
    const store = createStore({
      actions: {
        [TEST_A]() {
          return new Promise((resolve, reject) => {
            reject('no');
          });
        },
      },
    });
    const thenSpy = vi.fn();
    store
      .dispatch(TEST_A)
      .then(thenSpy)
      .catch((err: string) => {
        expect(thenSpy).not.toHaveBeenCalled();
        expect(err).toBe('no');
      });
  });

  it('getters', () => {
    const store = createStore({
      state: {
        a: 0,
      },
      getters: {
        state: state => (state.a > 0 ? 'hasAny' : 'none'),
      },
      mutations: {
        [TEST_M](state, n) {
          state.a += n;
        },
      },
      actions: {
        check({ getters }, value) {
          // check for exposing getters into actions
          expect(getters.state).toBe(value);
        },
      },
    });
    expect(store.getters.state).toBe('none');
    store.dispatch('check', 'none');

    store.commit(TEST_M, 1);

    expect(store.getters.state).toBe('hasAny');
    store.dispatch('check', 'hasAny');
  });

  it('should accept state as function', () => {
    const store = createStore({
      state: () => ({
        a: 1,
      }),
      mutations: {
        [TEST_M](state, n) {
          state.a += n;
        },
      },
    });
    expect(store.state.a).toBe(1);
    store.commit(TEST_M, 2);
    expect(store.state.a).toBe(3);
  });

  it('subscribe: should handle subscriptions / unsubscriptions', async () => {
    const subscribeSpy = vi.fn();
    const secondSubscribeSpy = vi.fn();
    const testPayload = 2;
    const store = createStore({
      state: {
        a: 1,
      },
      mutations: {
        [TEST_M](state) {
          state.a++;
        },
      },
    });

    const unsubscribe = store.subscribe(subscribeSpy);
    store.subscribe(secondSubscribeSpy);
    store.commit(TEST_M, testPayload);
    await nextTick();
    unsubscribe();
    store.commit(TEST_M, testPayload);
    await nextTick();

    expect(subscribeSpy).toHaveBeenCalledTimes(1);
    expect(secondSubscribeSpy).toHaveBeenCalledTimes(2);
  });

  it('subscribe: should handle subscriptions with synchronous unsubscriptions', async () => {
    const subscribeSpy = vi.fn();
    const testPayload = 2;
    const store = createStore({
      state: {
        a: 1,
      },
      mutations: {
        [TEST_M](state) {
          state.a++;
        },
      },
    });

    const unsubscribe = store.subscribe(() => unsubscribe());
    store.subscribe(subscribeSpy);
    store.commit(TEST_M, testPayload);
    await nextTick();

    expect(subscribeSpy).toHaveBeenCalledTimes(1);
  });

  it('subscribeAction: should handle subscriptions with synchronous unsubscriptions', async () => {
    const subscribeSpy = vi.fn();
    const testPayload = 2;
    const store = createStore({
      state: {
        a: 1,
      },
      actions: {
        [TEST_A]({ state }) {
          state.a++;
        },
      },
    });

    const unsubscribe = store.subscribeAction(() => unsubscribe());
    store.subscribeAction(subscribeSpy);
    store.dispatch(TEST_A, testPayload);
    await nextTick();

    expect(subscribeSpy).toHaveBeenCalledTimes(1);
  });

  it('watch: with resetting vm', async () => {
    const store = createStore({
      state: {
        count: 0,
      },
      mutations: {
        [TEST_M]: state => state.count++,
      },
    });

    const spy = vi.fn();
    store.watch(state => state.count, spy);

    store.commit(TEST_M);
    await nextTick();
    expect(store.state.count).toBe(1);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("watch: getter function has access to store's getters object", () => {
    const store = createStore({
      state: {
        count: 0,
      },
      mutations: {
        [TEST_M]: state => state.count++,
      },
      getters: {
        getCount: state => state.count,
      },
    });

    const getter = function getter(state: any) {
      return state.count;
    };
    const spy = vi.spyOn({ getter }, 'getter');
    const spyCb = vi.fn();

    store.watch(spy as any, spyCb);

    store.commit(TEST_M);
    expect(store.state.count).toBe(1);

    expect(spy).toHaveBeenCalledWith(store.state, store.getters);
  });
});
