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

import { createStore } from '../../../../src/index';
import { describe, it, expect } from '@jest/globals';
import { nextTick } from '../../../../src/inulax/proxy/Scheduler';

describe('Using deep variables', () => {
  it('should listen to object variable change', async () => {
    let counter = 0;
    const useTestStore = createStore({
      state: { a: { b: { c: 1 } } },
    });
    const testStore = useTestStore();
    testStore.$subscribe(() => {
      counter++;
    });

    testStore.a.b.c = 0;

    await nextTick();

    expect(counter).toBe(1);
  });

  it('should listen to deep variable change', async () => {
    let counter = 0;
    const useTestStore = createStore({
      state: { color: [{ a: 1 }, 255, 255] },
    });
    const testStore = useTestStore();
    testStore.$subscribe(() => {
      counter++;
    });

    for (let i = 0; i < 5; i++) {
      testStore.color[0].a = i;
    }
    testStore.color = 'x';
    await nextTick();

    expect(counter).toBe(6);
  });

  it('should use set', async () => {
    const useTestStore = createStore({
      state: { data: new Set() },
    });
    const testStore = useTestStore();

    const a = { a: true };

    testStore.data.add(a);

    expect(testStore.data.has(a)).toBe(true);

    testStore.data.add(a);
    testStore.data.add(a);
    testStore.data.delete(a);
    await nextTick();

    expect(testStore.data.has(a)).toBe(false);

    testStore.data.add(a);
    await nextTick();

    const values = Array.from(testStore.data.values());
    expect(values.length).toBe(1);

    let counter = 0;
    testStore.$subscribe(mutation => {
      counter++;
    });

    values.forEach(val => {
      val.a = !val.a;
    });
    await nextTick();

    expect(testStore.data.has(a)).toBe(true);

    expect(counter).toBe(1);
  });

  it('should use map', async () => {
    const useTestStore = createStore({
      state: { data: new Map() },
    });
    const testStore = useTestStore();

    const data = { key: { a: 1 }, value: { b: 2 } };

    testStore.data.set(data.key, data.value);
    await nextTick();

    const key = Array.from(testStore.data.keys())[0];

    expect(testStore.data.has(key)).toBe(true);
    expect(testStore.data.has(data.key)).toBe(true);

    testStore.data.set(data.key, data.value);
    testStore.data.set(data.key, data.value);
    testStore.data.delete(key);
    await nextTick();

    expect(testStore.data.get(key)).toBe();

    testStore.data.set(data.key, data.value);
    await nextTick();

    const entries = Array.from(testStore.data.entries());
    expect(entries.length).toBe(1);

    let counter = 0;
    testStore.$subscribe(mutation => {
      counter++;
    });

    entries.forEach(([key, value]) => {
      key.a++;
      value.b++;
    });
    await nextTick();

    expect(counter).toBe(2);
  });

  it('should use weakSet', () => {
    const useTestStore = createStore({
      state: { data: new WeakSet() },
    });
    const testStore = useTestStore();

    const a = { a: true };

    testStore.data.add(a);

    expect(testStore.data.has(a)).toBe(true);

    testStore.data.add(a);
    testStore.data.add(a);
    testStore.data.delete(a);

    expect(testStore.data.has(a)).toBe(false);

    testStore.data.add(a);

    expect(testStore.data.has(a)).toBe(true);
  });

  it('should use weakMap', async () => {
    const useTestStore = createStore({
      state: { data: new WeakMap() },
    });
    const testStore = useTestStore();

    const data = { key: { a: 1 }, value: { b: 2 } };

    testStore.data.set(data.key, data.value);
    await nextTick();

    expect(testStore.data.has(data.key)).toBe(true);

    let counter = 0;
    testStore.$subscribe(mutation => {
      counter++;
    });

    testStore.data.get(data.key).b++;

    await nextTick();

    expect(counter).toBe(1);
  });
});
