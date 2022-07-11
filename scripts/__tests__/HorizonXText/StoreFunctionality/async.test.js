import * as Horizon from '@cloudsop/horizon/index.ts';
import { createStore } from '../../../../libs/horizon/src/horizonx/store/StoreHandler';
import { triggerClickEvent } from '../../jest/commonComponents';

const { unmountComponentAtNode } = Horizon;

function postpone(timer, func) {
  return new Promise(resolve => {
    setTimeout(function() {
      resolve(func());
    }, timer);
  });
}

describe('Asynchronous functions', () => {
  let container = null;

  const COUNTER_ID = 'counter';
  const TOGGLE_ID = 'toggle';
  const TOGGLE_FAST_ID = 'toggleFast';
  const RESULT_ID = 'result';

  let useAsyncCounter;

  beforeEach(() => {
    useAsyncCounter = createStore({
      state: {
        counter: 0,
        check: false,
      },
      actions: {
        increment: function(state) {
          return new Promise(resolve => {
            setTimeout(() => {
              state.counter++;
              resolve();
            }, 100);
          });
        },
        toggle: function(state) {
          state.check = !state.check;
        },
      },
      computed: {
        value: state => {
          return (state.check ? 'true' : 'false') + state.counter;
        },
      },
    });
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it('Should wait for async actions', async () => {
    jest.useRealTimers();
    let globalStore;

    function App() {
      const store = useAsyncCounter();
      globalStore = store;

      return (
        <div>
          <p id={RESULT_ID}>{store.value}</p>
          <button onClick={store.$queue.increment} id={COUNTER_ID}>
            add 1
          </button>
          <button onClick={store.$queue.toggle} id={TOGGLE_ID}>
            slow toggle
          </button>
          <button onClick={store.toggle} id={TOGGLE_FAST_ID}>
            fast toggle
          </button>
        </div>
      );
    }

    Horizon.render(<App />, container);

    // initial state
    expect(document.getElementById(RESULT_ID).innerHTML).toBe('false0');

    // slow toggle has nothing to wait for, it is resolved immediately
    Horizon.act(() => {
      triggerClickEvent(container, TOGGLE_ID);
    });

    expect(document.getElementById(RESULT_ID).innerHTML).toBe('true0');

    // counter increment is slow. slow toggle waits for result
    Horizon.act(() => {
      triggerClickEvent(container, COUNTER_ID);
    });
    Horizon.act(() => {
      triggerClickEvent(container, TOGGLE_ID);
    });

    expect(document.getElementById(RESULT_ID).innerHTML).toBe('true0');

    // fast toggle does not wait for counter and it is resolved immediately
    Horizon.act(() => {
      triggerClickEvent(container, TOGGLE_FAST_ID);
    });

    expect(document.getElementById(RESULT_ID).innerHTML).toBe('false0');

    // at 150ms counter increment will be resolved and slow toggle immediately after
    const t150 = postpone(150, () => {
      expect(document.getElementById(RESULT_ID).innerHTML).toBe('true1');
    });

    // before that, two more actions are added to queue - another counter and slow toggle
    Horizon.act(() => {
      triggerClickEvent(container, COUNTER_ID);
    });
    Horizon.act(() => {
      triggerClickEvent(container, TOGGLE_ID);
    });

    // at 250ms they should be already resolved
    const t250 = postpone(250, () => {
      expect(document.getElementById(RESULT_ID).innerHTML).toBe('false2');
    });

    await Promise.all([t150, t250]);
  });

  it('call async action by then', async () => {
    jest.useFakeTimers();
    let globalStore;

    function App() {
      const store = useAsyncCounter();
      globalStore = store;

      return (
        <div>
          <p id={RESULT_ID}>{store.value}</p>
        </div>
      );
    }

    Horizon.render(<App />, container);

    // call async action by then
    globalStore.$queue.increment().then(() => {
      expect(document.getElementById(RESULT_ID).innerHTML).toBe('false1');
    });

    expect(document.getElementById(RESULT_ID).innerHTML).toBe('false0');

    // past 150 ms
    jest.advanceTimersByTime(150);
  });
});
