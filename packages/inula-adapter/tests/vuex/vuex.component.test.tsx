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

import { describe, expect, it, vi } from 'vitest';
import { act, render } from '@cloudsop/horizon';
import { useMapState, useMapGetters, useMapMutations } from '../../src/vuex/maps';
import { createStore, registerStore, useStore } from '../../src/vuex';
import '../utils/globalSetup';

describe('vuex in component', () => {
  it('should store work in component', () => {
    const store = createStore({
      modules: {
        foo: {
          state: { counter: 1 },
          mutations: {
            inc: state => {
              state.counter++;
            },
          },
          actions: { inc: ({ commit }) => commit('inc') },
          getters: { double: state => state.counter * 2 },
        },
      },
    });
    registerStore(store);

    const Comp = () => {
      const store = useStore();

      return (
        <>
          <div>
            counter: <span id={'counter'}>{store.state.foo.counter}</span>
          </div>
          <div>
            double: <span id={'double'}>{store.getters.double}</span>
          </div>
          <button onClick={() => store.commit('foo/inc')}>Inc</button>
        </>
      );
    };

    render(<Comp />, global.container);

    expect(document.querySelector('#counter')!.innerHTML).toBe('1');
    expect(document.querySelector('#double')!.innerHTML).toBe('2');

    act(() => {
      global.container.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(document.querySelector('#counter')!.innerHTML).toBe('2');
    expect(document.querySelector('#double')!.innerHTML).toBe('4');
  });

  it('should maps api work in component', () => {
    const store = createStore({
      modules: {
        foo: {
          state: { counter: 1 },
          mutations: {
            inc: state => {
              state.counter++;
            },
          },
          actions: { inc: ({ commit }) => commit('inc') },
          getters: { double: state => state.counter * 2 },
        },
      },
    });
    registerStore(store);

    const Comp = () => {
      const { counter } = useMapState('foo', ['counter']);
      const { double } = useMapGetters('foo', ['double']);
      const { inc } = useMapMutations('foo', ['inc']);

      return (
        <>
          <div>
            counter: <span id={'counter'}>{counter.value}</span>
          </div>
          <div>
            double: <span id={'double'}>{double.value}</span>
          </div>
          <button onClick={() => inc()}>Inc</button>
        </>
      );
    };

    render(<Comp />, global.container);

    expect(document.querySelector('#counter')!.innerHTML).toBe('1');
    expect(document.querySelector('#double')!.innerHTML).toBe('2');

    act(() => {
      global.container.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(document.querySelector('#counter')!.innerHTML).toBe('2');
    expect(document.querySelector('#double')!.innerHTML).toBe('4');
  });
});
