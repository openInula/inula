/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
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

import { createStore } from '../../../../libs/inula';
import { watch } from '../../../../libs/inula';

describe('watch', () => {
  it('shouhld watch primitive state variable', async () => {
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

    expect(counter).toBe(1);
  });
  it('shouhld watch object variable', async () => {
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

  it('shouhld watch array item', async () => {
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

    store.arr.watch('0', () => {
      counter++;
    });

    store.change();

    expect(counter).toBe(1);
  });

  it('shouhld watch collection item', async () => {
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

    expect(counter1).toBe(3);
    expect(counterAll).toBe(6);
  });
});
