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

import { createStore, watch, vueReactive } from '../../../../src/index';
import { nextTick } from '../../../../src/inulax/proxy/Scheduler';

const { watchEffect } = vueReactive;

describe('watch', () => {
  it('should watch primitive state variable', async () => {
    const useStore = createStore({
      state: {
        variable: 'x',
      },
      actions: {
        change: state => (state.variable = 'a'),
      },
    });

    const store = useStore();
    let counter = 0;

    watch(store.$s, state => {
      counter++;
      expect(state.variable).toBe('a');
    });

    store.change();
    await nextTick();

    expect(counter).toBe(1);
  });
  it('should watch object variable', async () => {
    const useStore = createStore({
      state: {
        variable: 'x',
      },
      actions: {
        change: state => (state.variable = 'a'),
      },
    });

    const store = useStore();
    let counter = 0;

    store.$s.watch('variable', () => {
      counter++;
    });

    store.change();

    expect(counter).toBe(1);
  });

  it('should watch array item', async () => {
    const useStore = createStore({
      state: {
        arr: ['x'],
      },
      actions: {
        change: state => (state.arr[0] = 'a'),
      },
    });

    const store = useStore();
    let counter = 0;

    store.$s.arr.watch('0', () => {
      counter++;
    });

    store.change();

    expect(counter).toBe(1);
  });

  it('should watch collection item', async () => {
    const useStore = createStore({
      state: {
        collection: new Map([['a', 'a']]),
      },
      actions: {
        change: state => state.collection.set('a', 'x'),
      },
    });

    const store = useStore();
    let counter = 0;

    store.collection.watch('a', () => {
      counter++;
    });

    store.change();

    expect(counter).toBe(1);
  });

  it('should watch multiple variables independedntly', async () => {
    const useStore = createStore({
      state: {
        bool1: true,
        bool2: false,
      },
      actions: {
        toggle1: state => (state.bool1 = !state.bool1),
        toggle2: state => (state.bool2 = !state.bool2),
      },
    });

    let counter1 = 0;
    let counterAll = 0;
    const store = useStore();

    watch(store.$s, () => {
      counterAll++;
    });

    store.$s.watch('bool1', () => {
      counter1++;
    });

    store.toggle1();
    store.toggle1();

    store.toggle2();

    store.toggle1();

    store.toggle2();
    store.toggle2();

    await nextTick();

    expect(counter1).toBe(3);
    expect(counterAll).toBe(1);
  });

  it('should watch multiple variables independedntly', async () => {
    const useStore = createStore({
      state: {
        bool1: true,
        bool2: false,
      },
      actions: {
        toggle1: state => (state.bool1 = !state.bool1),
        toggle2: state => (state.bool2 = !state.bool2),
      },
    });

    let counter1 = 0;
    let counterAll = 0;
    const store = useStore();

    watch(store.$s, () => {
      counterAll++;
    });

    store.$s.watch('bool1', () => {
      counter1++;
    });

    store.toggle1();
    store.toggle1();

    store.toggle2();

    store.toggle1();

    store.toggle2();
    store.toggle2();

    await nextTick();

    expect(counter1).toBe(3);
    expect(counterAll).toBe(1);
  });
});

describe('watchEffect', () => {
  it('should watchEffect obj item', async () => {
    const useStore = createStore({
      state: {
        variable1: '1',
        variable2: '2',
      },
      actions: {
        change1: state => (state.variable1 = '11'),
        change2: state => (state.variable2 = '22'),
      },
    });

    const store = useStore();
    let counter = 0;

    watchEffect(() => {
      store.variable1;
      counter++;
    });

    expect(counter).toBe(1);

    store.change1();
    await nextTick();

    expect(counter).toBe(2);

    store.change2();
    await nextTick();

    expect(counter).toBe(2);
  });

  it('should watchEffect deep obj item', async () => {
    const useStore = createStore({
      state: {
        obj: {
          a: 'x',
        },
      },
      actions: {
        change: state => (state.obj.a = 'a'),
      },
    });

    const store = useStore();
    let counter = 0;

    watchEffect(() => {
      store.obj.a;
      counter++;
    });

    expect(counter).toBe(1);

    store.change();
    await nextTick();

    expect(counter).toBe(2);
  });

  it('should watchEffect Map item', async () => {
    const useStore = createStore({
      state: {
        collection: new Map([['a', 'a']]),
      },
      actions: {
        change: state => state.collection.set('a', 'x'),
      },
    });

    const store = useStore();
    let counter = 0;

    watchEffect(() => {
      store.collection.get('a');
      counter++;
    });

    expect(counter).toBe(1);

    store.change();
    await nextTick();

    expect(counter).toBe(2);
  });

  it('should watchEffect Set item', async () => {
    const useStore = createStore({
      state: {
        set: new Set(['a']),
      },
      actions: {
        change: state => state.set.delete('a'),
      },
    });

    const store = useStore();
    let counter = 0;

    watchEffect(() => {
      store.set.has('a');
      counter++;
    });

    expect(counter).toBe(1);

    store.change();
    await nextTick();

    expect(counter).toBe(2);
  });

  it('should watchEffect WeakSet item', async () => {
    const obj = { a: 1 };
    const useStore = createStore({
      state: {
        set: new WeakSet([obj]),
      },
      actions: {
        change: state => state.set.delete(obj),
      },
    });

    const store = useStore();
    let counter = 0;

    watchEffect(() => {
      store.$s.set.has(obj);
      counter++;
    });

    expect(counter).toBe(1);

    store.change();
    await nextTick();

    expect(counter).toBe(2);
  });

  it('should watchEffect array item', async () => {
    const useStore = createStore({
      state: {
        arr: ['x'],
      },
      actions: {
        change: state => (state.arr[0] = 'a'),
      },
    });

    const store = useStore();
    let counter = 0;

    watchEffect(() => {
      store.arr[0];
      counter++;
    });

    expect(counter).toBe(1);

    store.change();
    await nextTick();

    expect(counter).toBe(2);
  });
});
