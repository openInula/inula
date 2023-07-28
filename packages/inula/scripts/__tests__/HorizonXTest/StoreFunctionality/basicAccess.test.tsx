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
import Inula from '../../../../libs/inula/index';
import { triggerClickEvent } from '../../jest/commonComponents';
import { useLogStore } from './store';
import { describe, beforeEach, afterEach, it, expect } from '@jest/globals';
import { createStore } from '../../../../libs/inula/src/inulax/store/StoreHandler';

const { unmountComponentAtNode } = Inula;

describe('Basic store manipulation', () => {
  let container: HTMLElement | null = null;

  const BUTTON_ID = 'btn';
  const RESULT_ID = 'result';

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container?.remove();
    container = null;
  });

  it('Should use getters', () => {
    function App() {
      const logStore = useLogStore();

      return <div id={RESULT_ID}>{logStore.length}</div>;
    }

    Inula.render(<App />, container);

    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('1');
  });

  it('Should use direct setters', () => {
    function App() {
      const logStore = useLogStore();

      return (
        <div>
          <button
            id={BUTTON_ID}
            onClick={() => {
              logStore.logs = ['q'];
            }}
          >
            add
          </button>
          <p id={RESULT_ID}>{logStore.logs[0]}</p>
        </div>
      );
    }

    Inula.render(<App />, container);

    Inula.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });

    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('q');
  });

  it('Should use actions and update components', () => {
    function App() {
      const logStore = useLogStore();

      return (
        <div>
          <button
            id={BUTTON_ID}
            onClick={() => {
              logStore.addLog('a');
            }}
          >
            add
          </button>
          <p id={RESULT_ID}>{logStore.length}</p>
        </div>
      );
    }

    Inula.render(<App />, container);

    Inula.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });

    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('2');
  });

  it('should call actions from own actions', () => {
    const useIncrementStore = createStore({
      id: 'incrementStore',
      state: {
        count: 2,
      },
      actions: {
        increment: state => {
          state.count++;
        },
        doublePlusOne: function (state) {
          state.count = state.count * 2;
          this.increment();
        },
      },
    });

    function App() {
      const incrementStore = useIncrementStore();

      return (
        <div>
          <button
            id={BUTTON_ID}
            onClick={() => {
              incrementStore.doublePlusOne();
            }}
          >
            +
          </button>
          <p id={RESULT_ID}>{incrementStore.count}</p>
        </div>
      );
    }

    Inula.render(<App />, container);

    Inula.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });

    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('5');
  });

  it('should call computed from own actions', () => {
    const useIncrementStore = createStore({
      id: 'incrementStore',
      state: {
        count: 2,
      },
      actions: {
        doublePlusOne: function (state) {
          state.count = this.double + 1;
        },
      },
      computed: {
        double: state => {
          return state.count * 2;
        },
      },
    });

    function App() {
      const incrementStore = useIncrementStore();

      return (
        <div>
          <button
            id={BUTTON_ID}
            onClick={() => {
              incrementStore.doublePlusOne();
            }}
          >
            +
          </button>
          <p id={RESULT_ID}>{incrementStore.count}</p>
        </div>
      );
    }

    Inula.render(<App />, container);

    Inula.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });

    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('5');
  });
});
