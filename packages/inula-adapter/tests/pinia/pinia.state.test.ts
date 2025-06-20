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
import { createPinia, defineStore } from '../../src/pinia/pinia';
import { vueReactive } from 'openinula';

const { watch, computed, ref, reactive, nextTick } = vueReactive;

let id = 0;

function createStore() {
  return defineStore(String(id++), {
    state: () => ({
      name: 'Eduardo',
      counter: 0,
      nested: { n: 0 },
    }),
    actions: {
      increment(state, amount) {
        this.counter += amount;
      },
    },
    getters: {
      upperCased() {
        return this.name.toUpperCase();
      },
    },
  });
}

describe('pinia state', () => {
  let useStore = createStore();

  beforeEach(() => {
    useStore = createStore();
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

  it('can be set on store', () => {
    const pinia = createPinia();
    const store = useStore(pinia);

    store.name = 'a';

    expect(store.name).toBe('a');
    expect(store.$state.name).toBe('a');
  });

  it('can be set on store.$state', () => {
    const pinia = createPinia();
    const store = useStore(pinia);

    store.$state.name = 'a';

    expect(store.name).toBe('a');
    expect(store.$state.name).toBe('a');
  });

  it('can be nested set on store', () => {
    const pinia = createPinia();
    const store = useStore(pinia);

    store.nested.n = 3;

    expect(store.nested.n).toBe(3);
    expect(store.$state.nested.n).toBe(3);
  });

  it('can be nested set on store.$state', () => {
    const pinia = createPinia();
    const store = useStore(pinia);

    store.$state.nested.n = 3;

    expect(store.nested.n).toBe(3);
    expect(store.$state.nested.n).toBe(3);
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

  it('state can be watched when a ref is given', async () => {
    const store = useStore();
    const spy = vi.fn();
    watch(() => store.name, spy);
    expect(spy).not.toHaveBeenCalled();
    const nameRef = ref('Ed');
    // @ts-expect-error
    store.$state.name = nameRef;
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('can be given a ref', () => {
    const pinia = createPinia();
    const store = useStore(pinia);

    // @ts-expect-error
    store.$state.name = ref('Ed');

    expect(store.name).toBe('Ed');
    expect(store.$state.name).toBe('Ed');

    store.name = 'Other';
    expect(store.name).toBe('Other');
    expect(store.$state.name).toBe('Other');
  });
});
