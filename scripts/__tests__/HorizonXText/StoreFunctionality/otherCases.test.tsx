//@ts-ignore
import * as Horizon from '@cloudsop/horizon/index.ts';
import { createStore } from '../../../../libs/horizon/src/horizonx/store/StoreHandler';
import { triggerClickEvent } from '../../jest/commonComponents';
import { describe, beforeEach, afterEach, it, expect } from '@jest/globals';

const { unmountComponentAtNode } = Horizon;

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

    Horizon.render(<App />, container);

    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('4');

    Horizon.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });

    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('6');

    Horizon.act(() => {
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

    Horizon.render(<App />, container);

    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('5');

    Horizon.act(() => {
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

    Horizon.render(<App />, container);
    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('abc');

    Horizon.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });
    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('def');
  });
});
