import { createStore, useStore } from '../../../../libs/inula';
import { describe, beforeEach, afterEach, it, expect } from '@jest/globals';

describe('Using deep variables', () => {
  it('should listen to object variable change', () => {
    let counter = 0;
    const useTestStore = createStore({
      state: { a: { b: { c: 1 } } },
    });
    const testStore = useTestStore();
    testStore.$subscribe(() => {
      counter++;
    });

    testStore.a.b.c = 0;

    expect(counter).toBe(1);
  });

  it('should listen to deep variable change', () => {
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

    expect(counter).toBe(6);
  });

  it('should use set', () => {
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

    expect(testStore.data.has(a)).toBe(false);

    testStore.data.add(a);

    const values = Array.from(testStore.data.values());
    expect(values.length).toBe(1);

    let counter = 0;
    testStore.$subscribe(mutation => {
      counter++;
    });

    values.forEach(val => {
      val.a = !val.a;
    });

    expect(testStore.data.has(a)).toBe(true);

    expect(counter).toBe(1);
  });

  it('should use map', () => {
    const useTestStore = createStore({
      state: { data: new Map() },
    });
    const testStore = useTestStore();

    const data = { key: { a: 1 }, value: { b: 2 } };

    testStore.data.set(data.key, data.value);

    const key = Array.from(testStore.data.keys())[0];

    expect(testStore.data.has(key)).toBe(true);

    testStore.data.set(data.key, data.value);
    testStore.data.set(data.key, data.value);
    testStore.data.delete(key);

    expect(testStore.data.get(key)).toBe();

    testStore.data.set(data.key, data.value);

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

  it('should use weakMap', () => {
    const useTestStore = createStore({
      state: { data: new WeakMap() },
    });
    const testStore = useTestStore();

    const data = { key: { a: 1 }, value: { b: 2 } };

    testStore.data.set(data.key, data.value);

    let counter = 0;
    testStore.$subscribe(mutation => {
      counter++;
    });

    testStore.data.get(data.key).b++;

    expect(counter).toBe(1);
  });
});
