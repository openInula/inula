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

//@ts-ignore
import * as Inula from '../../../../libs/inula/index';
import { createStore } from '../../../../libs/inula/src/inulax/store/StoreHandler';
import { triggerClickEvent } from '../../jest/commonComponents';
import { describe, beforeEach, afterEach, it, expect } from '@jest/globals';

const { unmountComponentAtNode } = Inula;

describe('Self referencing', () => {
  let container: HTMLElement | null = null;

  const BUTTON_ID = 'btn';
  const RESULT_ID = 'result';

  const useSelfRefStore = createStore({
    state: {
      val: 2,
    },
    actions: {
      increaseVal: function(state) {
        state.val = state.val * 2 - 1;
      },
    },
    computed: {
      value: state => state.val,
      double: function() {
        return this.value * 2;
      },
    },
  });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container?.remove();
    container = null;
  });

  it('Should use own getters', () => {
    function App() {
      const store = useSelfRefStore();

      return (
        <div>
          <p id={RESULT_ID}>{store.double}</p>
          <button onClick={store.increaseVal} id={BUTTON_ID}>
            increase value
          </button>
        </div>
      );
    }

    Inula.render(<App />, container);

    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('4');

    Inula.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });

    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('6');

    Inula.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });

    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('10');
  });

  it('should access other stores', () => {
    const useOtherStore = createStore({
      state: {},
      actions: {
        doIncreaseVal: () => useSelfRefStore().increaseVal(),
      },
      computed: {
        selfRefStoreValue: () => useSelfRefStore().value,
      },
    });

    function App() {
      const store = useOtherStore();

      return (
        <div>
          <p id={RESULT_ID}>{store.selfRefStoreValue}</p>
          <button onClick={store.doIncreaseVal} id={BUTTON_ID}>
            increase value in other store
          </button>
        </div>
      );
    }

    Inula.render(<App />, container);

    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('5');

    Inula.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });

    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('9');
  });

  it('should use parametric getters', () => {
    const useArrayStore = createStore({
      state: {
        items: ['a', 'b', 'c'],
      },
      actions: {
        setItem: (state, index, value) => (state.items[index] = value),
      },
      computed: {
        getItem: state => index => state.items[index],
      },
    });

    function App() {
      const store = useArrayStore();

      return (
        <div>
          <p id={RESULT_ID}>{store.getItem(0) + store.getItem(1) + store.getItem(2)}</p>
          <button
            id={BUTTON_ID}
            onClick={() => {
              store.setItem(0, 'd');
              store.setItem(1, 'e');
              store.setItem(2, 'f');
            }}
          >
            change
          </button>
        </div>
      );
    }

    Inula.render(<App />, container);
    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('abc');

    Inula.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });
    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('def');
  });
});
