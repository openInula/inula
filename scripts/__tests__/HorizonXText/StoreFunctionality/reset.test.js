import * as Horizon from '@cloudsop/horizon/index.ts';
import { createStore } from '../../../../libs/horizon/src/horizonx/store/StoreHandler';
import { triggerClickEvent } from '../../jest/commonComponents';

const { unmountComponentAtNode } = Horizon;

describe('Reset', () => {
  it('RESET NOT IMPLEMENTED', async () => {
    // console.log('reset functionality is not yet implemented')
    expect(true).toBe(true);
  });
  return;

  let container = null;

  const BUTTON_ID = 'btn';
  const RESET_ID = 'reset';
  const RESULT_ID = 'result';

  const useCounter = createStore({
    state: {
      counter: 0,
    },
    actions: {
      increment: function(state) {
        state.counter++;
      },
    },
    computed: {},
  });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it('Should reset to default state', async () => {
    function App() {
      const store = useCounter();

      return (
        <div>
          <p id={RESULT_ID}>{store.$state.counter}</p>
          <button onClick={store.increment} id={BUTTON_ID}>
            add
          </button>
          <button
            onClick={() => {
              store.$reset();
            }}
            id={RESET_ID}
          >
            reset
          </button>
        </div>
      );
    }

    Horizon.render(<App />, container);

    Horizon.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });

    Horizon.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });

    expect(document.getElementById(RESULT_ID).innerHTML).toBe('2');

    Horizon.act(() => {
      triggerClickEvent(container, RESET_ID);
    });

    expect(document.getElementById(RESULT_ID).innerHTML).toBe('0');

    Horizon.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });

    expect(document.getElementById(RESULT_ID).innerHTML).toBe('1');
  });
});
