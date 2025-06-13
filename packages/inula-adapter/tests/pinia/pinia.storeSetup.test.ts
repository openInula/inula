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

import { beforeEach, describe, it, vi, expect } from 'vitest';
import { defineStore } from '../../src/pinia/pinia';
import { vueReactive } from '@cloudsop/horizon';

const { ref, watch, computed, nextTick } = vueReactive;

function expectType<T>(_value: T): void {}

describe('store with setup syntax', () => {
  function mainFn() {
    const name = ref('Eduardo');
    const counter = ref(0);

    function increment(amount = 1) {
      counter.value += amount;
    }

    const double = computed(() => counter.value * 2);

    return { name, counter, increment, double };
  }

  let id = 0;

  function createStore() {
    return defineStore(String(id++), mainFn);
  }

  let useStore = createStore();

  beforeEach(() => {
    useStore = createStore();
  });

  it('should extract the $state', () => {
    const store = useStore();
    expectType<{ name: string; counter: number }>(store.$state);
    expect(store.$state).toEqual({ name: 'Eduardo', counter: 0 });
    expect(store.name).toBe('Eduardo');
    expect(store.counter).toBe(0);
    expect(store.double).toBe(0);
    store.increment();
    expect(store.counter).toBe(1);
    expect(store.double).toBe(2);
    expect(store.$state).toEqual({ name: 'Eduardo', counter: 1 });
    expect(store.$state).not.toHaveProperty('double');
    expect(store.$state).not.toHaveProperty('increment');
  });

  it('can store a function', () => {
    const store = defineStore(String(id++), () => {
      const fn = ref(() => {});

      function action() {}

      return { fn, action };
    })();
    expectType<{ fn: () => void }>(store.$state);
    expect(store.$state).toEqual({ fn: expect.any(Function) });
    expect(store.fn).toEqual(expect.any(Function));
    store.action();
  });

  it('can directly access state at the store level', () => {
    const store = useStore();

    expect(store.name).toBe('Eduardo');
    store.name = 'Ed';
    expect(store.name).toBe('Ed');
  });

  it('state is reactive', () => {
    const store = useStore();
    const upperCased = computed(() => store.name.toUpperCase());
    expect(upperCased.value).toBe('EDUARDO');
    store.name = 'Ed';
    expect(upperCased.value).toBe('ED');
  });

  it('state can be watched', async () => {
    const store = useStore();
    const spy = vi.fn();
    watch(() => store.name, spy);
    expect(spy).not.toHaveBeenCalled();
    store.name = 'Ed';
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('state refs can be watched', async () => {
    const store = useStore();
    const spy = vi.fn();
    watch(() => store.name, spy);
    expect(spy).not.toHaveBeenCalled();
    const nameRef = ref('Ed');
    store.name = nameRef;
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('unwraps refs', () => {
    const name = ref('Eduardo');
    const counter = ref(0);
    const double = computed(() => {
      return counter.value * 2;
    });

    // const pinia = createPinia();
    // setActivePinia(pinia);
    const useStore = defineStore({
      id: String(id++),
      state: () => ({
        name,
        counter,
        double,
      }),
    });

    const store = useStore();

    expect(store.name).toBe('Eduardo');
    expect(store.$state.name).toBe('Eduardo');
    expect(store.$state).toEqual({
      name: 'Eduardo',
      counter: 0,
      double: 0,
    });

    name.value = 'Ed';
    expect(store.name).toBe('Ed');
    expect(store.$state.name).toBe('Ed');

    store.$state.name = 'Edu';
    expect(store.name).toBe('Edu');

    // store.$patch({ counter: 2 });
    store.counter = 2;
    expect(store.counter).toBe(2);
    expect(counter.value).toBe(2);
  });
});
