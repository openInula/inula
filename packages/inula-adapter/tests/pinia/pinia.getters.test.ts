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

import { describe, it, expect, beforeEach } from 'vitest';
import { defineStore } from '../../src/pinia/pinia';

let id = 0;
function createStore() {
  return defineStore({
    id: String(id++),
    state: () => ({
      name: 'Eduardo',
    }),
    getters: {
      upperCaseName(store) {
        return store.name.toUpperCase();
      },
      doubleName(): string {
        return this.upperCaseName;
      },
      composed(): string {
        return this.upperCaseName + ': ok';
      },
      arrowUpper: state => {
        // @ts-expect-error
        state.nope;
        return state.name.toUpperCase();
      },
    },
    actions: {
      o() {
        this.arrowUpper.toUpperCase();
        this.o().toUpperCase();
        return 'a string';
      },
    },
  });
}

describe('pinia getters', () => {
  let useStore = createStore();
  let useB;
  let useA;
  beforeEach(() => {
    useStore = createStore();

    useB = defineStore({
      id: 'B',
      state: () => ({ b: 'b' }),
    });
  });

  it('adds getters to the store', () => {
    const store = useStore();
    expect(store.upperCaseName).toBe('EDUARDO');

    // @ts-expect-error
    store.nope;

    store.name = 'Ed';
    expect(store.upperCaseName).toBe('ED');
  });

  it('updates the value', () => {
    const store = useStore();
    store.name = 'Ed';
    expect(store.upperCaseName).toBe('ED');
  });

  it('can use other getters', () => {
    const store = useStore();
    expect(store.composed).toBe('EDUARDO: ok');
    store.name = 'Ed';
    expect(store.composed).toBe('ED: ok');
  });

  it('keeps getters reactive when hydrating', () => {
    const store = useStore();
    store.name = 'Jack';
    expect(store.name).toBe('Jack');
    expect(store.upperCaseName).toBe('JACK');
    store.name = 'Ed';
    expect(store.upperCaseName).toBe('ED');
  });
});
