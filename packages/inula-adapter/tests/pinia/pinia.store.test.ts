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
import { vueReactive } from 'openinula';

const { watch, nextTick } = vueReactive;

let id = 0;
function createStore() {
  return defineStore({
    id: String(id++),
    state: () => ({
      a: true,
      nested: {
        foo: 'foo',
        a: { b: 'string' },
      },
    }),
  });
}

describe('pinia state', () => {
  let useStore = createStore();

  beforeEach(() => {
    useStore = createStore();
  });

  it('reuses a store', () => {
    const useStore = defineStore({ id: String(id++) });
    expect(useStore()).toBe(useStore());
  });

  it('works with id as first argument', () => {
    const useStore = defineStore(String(id++), {
      state: () => ({
        a: true,
        nested: {
          foo: 'foo',
          a: { b: 'string' },
        },
      }),
    });
    expect(useStore()).toBe(useStore());
    const useStoreEmpty = defineStore(String(id++), {});
    expect(useStoreEmpty()).toBe(useStoreEmpty());
  });

  it('sets the initial state', () => {
    const store = useStore();
    expect(store.$state).toEqual({
      a: true,
      nested: {
        foo: 'foo',
        a: { b: 'string' },
      },
    });
  });

  it.skip('can replace its state', () => {
    const store = useStore();
    const spy = vi.fn();
    watch(() => store.a, spy);
    expect(store.a).toBe(true);

    expect(spy).toHaveBeenCalledTimes(0);
    store.$state = {
      a: false,
      nested: {
        foo: 'bar',
        a: {
          b: 'hey',
        },
      },
    };
    expect(spy).toHaveBeenCalledTimes(1);

    expect(store.$state).toEqual({
      a: false,
      nested: {
        foo: 'bar',
        a: { b: 'hey' },
      },
    });
  });

  it('can be $unsubscribe', async () => {
    const useStore = defineStore({
      id: 'main',
      state: () => ({ n: 0 }),
    });

    const store = useStore();
    const spy = vi.fn();

    store.$subscribe(spy);
    store.$state.n++;
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(1);

    expect(useStore()).toBe(store);
    store.$unsubscribe(spy);
    store.$state.n++;
    await nextTick();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
