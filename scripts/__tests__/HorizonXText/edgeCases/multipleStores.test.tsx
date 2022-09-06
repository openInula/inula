//@ts-ignore
import Horizon, { createStore } from '@cloudsop/horizon/index.ts';
import { triggerClickEvent } from '../../jest/commonComponents';
import { describe, beforeEach, afterEach, it, expect } from '@jest/globals';

const { unmountComponentAtNode } = Horizon;

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
    class App extends Horizon.Component {
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

    Horizon.render(<App />, container);

    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('1 1');
    Horizon.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });
    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('2 1');

    Horizon.act(() => {
      triggerClickEvent(container, BUTTON_ID2);
    });
    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('2 2');
  });

  it('Should use use stores in cycles and multiple methods', () => {
    interface App {
      store: any;
      store2: any;
    }
    class App extends Horizon.Component {
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

    Horizon.render(<App />, container);

    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('1 1');
    Horizon.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });
    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('2 1');

    Horizon.act(() => {
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

    Horizon.render(<App />, container);

    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('1 1');
    Horizon.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });
    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('2 1');

    Horizon.act(() => {
      triggerClickEvent(container, BUTTON_ID2);
    });
    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('2 2');
  });
});
