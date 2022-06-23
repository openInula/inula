import * as Horizon from '@cloudsop/horizon/index.ts';
import { triggerClickEvent } from '../../jest/commonComponents';
import { useLogStore } from './store';

const { unmountComponentAtNode } = Horizon;

describe('Basic store manipulation', () => {
  let container = null;

  const BUTTON_ID = 'btn';
  const RESULT_ID = 'result';

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it('Should use getters', () => {
    function App() {
      const logStore = useLogStore();

      return <div id={RESULT_ID}>{logStore.length}</div>;
    }

    Horizon.render(<App />, container);

    expect(document.getElementById(RESULT_ID).innerHTML).toBe('1');
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

    Horizon.render(<App />, container);

    Horizon.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });

    expect(document.getElementById(RESULT_ID).innerHTML).toBe('2');
  });
});
