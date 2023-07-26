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
import Inula, { createStore } from '../../../../libs/inula/index';
import { triggerClickEvent } from '../../jest/commonComponents';
import { describe, beforeEach, afterEach, it, expect } from '@jest/globals';

const { unmountComponentAtNode } = Inula;

const useStore1 = createStore({
  state: { counter: 1 },
  actions: {
    add: state => state.counter++,
    reset: state => (state.counter = 1),
  },
});

const useStore2 = createStore({
  state: { counter2: 1 },
  actions: {
    add2: state => state.counter2++,
    reset: state => (state.counter2 = 1),
  },
});

describe('Using multiple stores', () => {
  let container: HTMLElement | null = null;

  const BUTTON_ID = 'btn';
  const BUTTON_ID2 = 'btn2';
  const RESULT_ID = 'result';

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    useStore1().reset();
    useStore2().reset();
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container?.remove();
    container = null;
  });

  it('Should use multiple stores in class component', () => {
    class App extends Inula.Component {
      render() {
        const { counter, add } = useStore1();
        const { counter2, add2 } = useStore2();

        return (
          <div>
            <button
              id={BUTTON_ID}
              onClick={() => {
                add();
              }}
            >
              add
            </button>
            <button
              id={BUTTON_ID2}
              onClick={() => {
                add2();
              }}
            >
              add
            </button>
            <p id={RESULT_ID}>
              {counter} {counter2}
            </p>
          </div>
        );
      }
    }

    Inula.render(<App />, container);

    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('1 1');
    Inula.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });
    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('2 1');

    Inula.act(() => {
      triggerClickEvent(container, BUTTON_ID2);
    });
    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('2 2');
  });

  it('Should use use stores in cycles and multiple methods', () => {
    interface App {
      store: any;
      store2: any;
    }
    class App extends Inula.Component {
      constructor() {
        super();
        this.store = useStore1();
        this.store2 = useStore2();
      }

      render() {
        const { counter, add } = useStore1();
        const store2 = useStore2();
        const { counter2, add2 } = store2;

        for (let i = 0; i < 100; i++) {
          const { counter, add } = useStore1();
          const store2 = useStore2();
          const { counter2, add2 } = store2;
        }

        return (
          <div>
            <button
              id={BUTTON_ID}
              onClick={() => {
                add();
              }}
            >
              add
            </button>
            <button
              id={BUTTON_ID2}
              onClick={() => {
                this.store2.add2();
              }}
            >
              add
            </button>
            <p id={RESULT_ID}>
              {counter} {counter2}
            </p>
          </div>
        );
      }
    }

    Inula.render(<App />, container);

    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('1 1');
    Inula.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });
    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('2 1');

    Inula.act(() => {
      triggerClickEvent(container, BUTTON_ID2);
    });
    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('2 2');
  });

  it('Should use multiple stores in function component', () => {
    function App() {
      const { counter, add } = useStore1();
      const store2 = useStore2();
      const { counter2, add2 } = store2;

      return (
        <div>
          <button
            id={BUTTON_ID}
            onClick={() => {
              add();
            }}
          >
            add
          </button>
          <button
            id={BUTTON_ID2}
            onClick={() => {
              add2();
            }}
          >
            add
          </button>
          <p id={RESULT_ID}>
            {counter} {counter2}
          </p>
        </div>
      );
    }

    Inula.render(<App />, container);

    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('1 1');
    Inula.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });
    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('2 1');

    Inula.act(() => {
      triggerClickEvent(container, BUTTON_ID2);
    });
    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('2 2');
  });
});
