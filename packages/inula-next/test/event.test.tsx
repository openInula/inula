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
import { describe, expect, vi } from 'vitest';
import { domTest as it } from './utils';
import { render } from '../src';

vi.mock('../src/scheduler', async () => {
  return {
    schedule: (task: () => void) => {
      task();
    },
  };
});

describe('Event Handling', () => {
  it('Should correctly handle onClick events', ({ container }) => {
    let clicked = false;
    function App() {
      const handleClick = () => {
        clicked = true;
      };
      return <button onClick={handleClick}>Click me</button>;
    }

    render(App, container);
    const button = container.querySelector('button');
    button.click();
    expect(clicked).toBe(true);
  });

  it.fails('Should correctly handle onMouseOver events', ({ container }) => {
    let hovered = false;
    function App() {
      const handleMouseOver = () => {
        hovered = true;
      };
      return <div onMouseOver={handleMouseOver}>Hover me</div>;
    }

    render(App, container);
    const div = container.querySelector('div');
    div.dispatchEvent(new MouseEvent('mouseover'));
    expect(hovered).toBe(true);
  });

  it('Should correctly handle onKeyPress events', ({ container }) => {
    let keypressed = '';
    function App() {
      const handleKeyPress = event => {
        keypressed = event.key;
      };
      return <input onKeyPress={handleKeyPress} />;
    }

    render(App, container);
    const input = container.querySelector('input');
    const event = new KeyboardEvent('keypress', { key: 'A' });
    input.dispatchEvent(event);
    expect(keypressed).toBe('A');
  });

  it('Should correctly handle onSubmit events', ({ container }) => {
    let submitted = false;
    function App() {
      const handleSubmit = event => {
        event.preventDefault();
        submitted = true;
      };
      return (
        <form onSubmit={handleSubmit}>
          <button type="submit">Submit</button>
        </form>
      );
    }

    render(App, container);
    const form = container.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    expect(submitted).toBe(true);
  });

  it.fails('Should correctly handle custom events', ({ container }) => {
    let customEventData = null;
    function App() {
      const handleCustomEvent = event => {
        customEventData = event.detail;
      };
      return <div onCustomEvent={handleCustomEvent}>Custom event target</div>;
    }

    render(App, container);
    const div = container.querySelector('div');
    const customEvent = new CustomEvent('customEvent', { detail: { message: 'Hello, Custom Event!' } });
    div.dispatchEvent(customEvent);
    expect(customEventData).toEqual({ message: 'Hello, Custom Event!' });
  });

  it('Should correctly handle events when the handler is a variable', ({ container }) => {
    let count = 0;
    function App() {
      const incrementCount = () => {
        count++;
      };
      return <button onClick={incrementCount}>Increment</button>;
    }

    render(App, container);
    const button = container.querySelector('button');
    button.click();
    expect(count).toBe(1);
  });

  it('Should correctly handle events when the handler is an expression returning a function', ({ container }) => {
    let lastClicked = '';
    function App() {
      const createHandler = buttonName => () => {
        lastClicked = buttonName;
      };
      return (
        <div>
          <button onClick={() => createHandler('Button A')()}>A</button>
          <button onClick={() => createHandler('Button B')()}>B</button>
        </div>
      );
    }

    render(App, container);
    const buttons = container.querySelectorAll('button');
    buttons[0].click();
    expect(lastClicked).toBe('Button A');
    buttons[1].click();
    expect(lastClicked).toBe('Button B');
  });
});

describe('event emission', () => {
  it('should handle emit to parent', ({ container }) => {
    function AnswerButton({ onYes, onNo }) {
      return (
        <>
          <button onClick={onYes}>YES</button>

          {/*<button onClick={onNo}>NO</button>*/}
        </>
      );
    }
    function App() {
      let isHappy = false;

      function onAnswerNo() {
        isHappy = false;
      }

      function onAnswerYes() {
        isHappy = true;
      }

      return (
        <>
          <p>Are you happy?</p>
          <AnswerButton onYes={onAnswerYes} onNo={onAnswerNo} />
          <p style={{ fontSize: 50 }}>{isHappy ? 'yes' : 'no'}</p>
        </>
      );
    }

    render(App, container);
    expect(container).toMatchInlineSnapshot(`
        <div>
          <p>
            Are you happy?
          </p>
          <button>
            YES
          </button>
          <p>
            no
          </p>
        </div>
      `);
    container.querySelector('button')?.click();
    expect(container).toMatchInlineSnapshot(`
        <div>
          <p>
            Are you happy?
          </p>
          <button>
            YES
          </button>
          <p>
            yes
          </p>
        </div>
      `);
  });
  it('should correctly emit events to parent component', ({ container }) => {
    function Child({ onEvent }) {
      return <button onClick={() => onEvent('clicked')}>Click me</button>;
    }

    function App() {
      let eventReceived = '1';

      function handleEvent(event) {
        eventReceived = event;
      }

      return (
        <>
          <Child onEvent={handleEvent} />
          <p>{eventReceived}</p>
        </>
      );
    }

    render(App, container);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <button>
          Click me
        </button>
        <p>
          1
        </p>
      </div>
    `);

    container.querySelector('button')?.click();
    expect(container).toMatchInlineSnapshot(`
      <div>
        <button>
          Click me
        </button>
        <p>
          clicked
        </p>
      </div>
    `);
  });

  it('should correctly update parent state based on emitted events', ({ container }) => {
    function Counter({ onIncrement, onDecrement }) {
      return (
        <div>
          <button onClick={onIncrement}>+</button>
          <button onClick={onDecrement}>-</button>
        </div>
      );
    }

    function App() {
      let count = 0;

      function increment() {
        count += 1;
      }

      function decrement() {
        count -= 1;
      }

      return (
        <>
          <Counter onIncrement={increment} onDecrement={decrement} />
          <p>Count:{count}</p>
        </>
      );
    }

    render(App, container);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <button>
            +
          </button>
          <button>
            -
          </button>
        </div>
        <p>
          Count:
          0
        </p>
      </div>
    `);

    container.querySelectorAll('button')[0]?.click();
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <button>
            +
          </button>
          <button>
            -
          </button>
        </div>
        <p>
          Count:
          1
        </p>
      </div>
    `);

    container.querySelectorAll('button')[1]?.click();
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <button>
            +
          </button>
          <button>
            -
          </button>
        </div>
        <p>
          Count:
          0
        </p>
      </div>
    `);
  });

  it('should correctly handle multiple event emissions', ({ container }) => {
    function MultiButton({ onClickA, onClickB, onClickC }) {
      return (
        <div>
          <button onClick={onClickA}>A</button>
          <button onClick={onClickB}>B</button>
          <button onClick={onClickC}>C</button>
        </div>
      );
    }

    function App() {
      let lastClicked = 'A';

      function handleClick(button) {
        lastClicked = button;
      }

      return (
        <>
          <MultiButton
            onClickA={() => handleClick('A')}
            onClickB={() => handleClick('B')}
            onClickC={() => handleClick('C')}
          />
          <p>Last clicked:{lastClicked}</p>
        </>
      );
    }

    render(App, container);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <button>
            A
          </button>
          <button>
            B
          </button>
          <button>
            C
          </button>
        </div>
        <p>
          Last clicked:
          A
        </p>
      </div>
    `);

    container.querySelectorAll('button')[1]?.click();
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <button>
            A
          </button>
          <button>
            B
          </button>
          <button>
            C
          </button>
        </div>
        <p>
          Last clicked:
          B
        </p>
      </div>
    `);
  });

  it('should handle both arrow functions and function variables', ({ container }) => {
    function Child({ onEventA, onEventB }) {
      return (
        <div>
          <button onClick={onEventA}>Event A</button>
          <button onClick={onEventB}>Event B</button>
        </div>
      );
    }

    function App() {
      let eventResult = '1';

      const handleEventA = () => {
        eventResult = 'Arrow function called';
      };

      function handleEventB() {
        eventResult = 'Function variable called';
      }

      return (
        <>
          <Child onEventA={handleEventA} onEventB={handleEventB} />
          <p>{eventResult}</p>
        </>
      );
    }

    render(App, container);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <button>
            Event A
          </button>
          <button>
            Event B
          </button>
        </div>
        <p>
          1
        </p>
      </div>
    `);

    container.querySelectorAll('button')[0]?.click();
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <button>
            Event A
          </button>
          <button>
            Event B
          </button>
        </div>
        <p>
          Arrow function called
        </p>
      </div>
    `);

    container.querySelectorAll('button')[1]?.click();
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <button>
            Event A
          </button>
          <button>
            Event B
          </button>
        </div>
        <p>
          Function variable called
        </p>
      </div>
    `);
  });

  it('should handle multi-layer event functions', ({ container }) => {
    function GrandChild({ onEvent }) {
      return <button onClick={() => onEvent('GrandChild clicked')}>Click GrandChild</button>;
    }

    function Child({ onParentEvent }) {
      function handleChildEvent(message) {
        onParentEvent(`Child received: ${message}`);
      }

      return <GrandChild onEvent={handleChildEvent} />;
    }

    function App() {
      let message = '1';

      function handleAppEvent(receivedMessage) {
        message = `App received: ${receivedMessage}`;
      }

      return (
        <>
          <Child onParentEvent={handleAppEvent} />
          <p>{message}</p>
        </>
      );
    }

    render(App, container);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <button>
          Click GrandChild
        </button>
        <p>
          1
        </p>
      </div>
    `);

    container.querySelector('button')?.click();
    expect(container).toMatchInlineSnapshot(`
      <div>
        <button>
          Click GrandChild
        </button>
        <p>
          App received: Child received: GrandChild clicked
        </p>
      </div>
    `);
  });
});
