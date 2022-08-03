//@ts-ignore
import * as Horizon from '@cloudsop/horizon/index.ts';
import { triggerClickEvent } from '../../jest/commonComponents';
import { useLogStore } from './store';
import { describe, beforeEach, afterEach, it, expect } from '@jest/globals';

const { unmountComponentAtNode } = Horizon;

describe('Dollar store access', () => {
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

  it('Should use $s and $c', () => {
    function App() {
      const logStore = useLogStore();

      return <div id={RESULT_ID}>{logStore.$c.length()}</div>;
    }

    Horizon.render(<App />, container);

    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('1');
  });

  it('Should use $a and update components', () => {
    function App() {
      const logStore = useLogStore();

      return (
        <div>
          <button
            id={BUTTON_ID}
            onClick={() => {
              logStore.$a.addLog('data');
            }}
          >
            add
          </button>
          <p id={RESULT_ID}>{logStore.$c.length()}</p>
        </div>
      );
    }

    Horizon.render(<App />, container);

    Horizon.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });

    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('2');
  });
});
