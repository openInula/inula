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

import { describe, it, vi, expect, beforeEach } from 'vitest';
import { defineStore } from '../../src/pinia/pinia';

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
    getters: {
      nonA(): boolean {
        return !this.a;
      },
      otherComputed() {
        return this.nonA;
      },
    },
    actions: {
      async getNonA() {
        return this.nonA;
      },
      simple() {
        this.toggle();
        return 'simple';
      },

      toggle() {
        return (this.a = !this.a);
      },

      setFoo(foo: string) {
        this.nested.foo = foo;
      },

      combined() {
        this.toggle();
        this.setFoo('bar');
      },

      throws() {
        throw new Error('fail');
      },

      async rejects() {
        throw 'fail';
      },
    },
  });
}
describe('pinia state', () => {
  let useStore = createStore();

  beforeEach(() => {
    useStore = createStore();
  });

  it('can use the store as this', () => {
    const store = useStore();
    expect(store.$state.a).toBe(true);
    store.toggle();
    expect(store.$state.a).toBe(false);
  });

  it('store is forced as the context', () => {
    const store = useStore();
    expect(store.$state.a).toBe(true);
    expect(() => {
      store.toggle.call(null);
    }).not.toThrow();
    expect(store.$state.a).toBe(false);
  });

  it('can call other actions', () => {
    const store = useStore();
    expect(store.$state.a).toBe(true);
    expect(store.$state.nested.foo).toBe('foo');
    store.combined();
    expect(store.$state.a).toBe(false);
    expect(store.$state.nested.foo).toBe('bar');
  });

  it('throws errors', () => {
    const store = useStore();
    expect(() => store.throws()).toThrowError('fail');
  });

  it('throws async errors', async () => {
    const store = useStore();
    expect.assertions(1);
    await expect(store.rejects()).rejects.toBe('fail');
  });

  it('can catch async errors', async () => {
    const store = useStore();
    expect.assertions(3);
    const spy = vi.fn();
    await expect(store.rejects().catch(spy)).resolves.toBe(undefined);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('fail');
  });

  it('can destructure actions', () => {
    const store = useStore();
    const { simple } = store;
    expect(simple()).toBe('simple');
    // works with the wrong this
    expect({ simple }.simple()).toBe('simple');
    // special this check
    expect({ $id: 'o', simple }.simple()).toBe('simple');
    // override the function like devtools do
    expect(
      {
        simple,
        // otherwise it would fail
        toggle() {},
      }.simple()
    ).toBe('simple');
  });
});
