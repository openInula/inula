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
/**
 * @jsxImportSource @openinula/next
 */

import { describe, expect, vi } from 'vitest';
import { domTest as it } from './utils';
import { render } from '../../src';

vi.mock('../../src/scheduler', async () => {
  return {
    schedule: (task: () => void) => {
      task();
    },
  };
});

describe('components', () => {
  describe('ref', () => {
    it('should support ref', ({ container }) => {
      let ref: HTMLElement;

      function App() {
        let count = 0;
        let _ref: HTMLElement;
        const div = <div></div>;

        didMount(() => {
          ref = _ref;
        });

        return <div ref={_ref}>test</div>;
      }

      render(App(), container);

      expect(ref).toBeInstanceOf(HTMLElement);
    });

    it('should support ref forwarding', ({ container }) => {
      let ref: HTMLElement;

      function App() {
        let count = 0;
        let _ref: HTMLElement;

        didMount(() => {
          ref = _ref;
        });

        return <Input ref={_ref}>test</Input>;
      }

      function Input({ ref }) {
        return <input ref={ref} />;
      }

      render(App(), container);
      expect(ref).toBeInstanceOf(HTMLInputElement);
    });

    it('should support ref with function', ({ container }) => {
      const fn = vi.fn();

      function App() {
        const ref = (el: HTMLElement) => {
          fn();
          expect(el).toBeInstanceOf(HTMLElement);
        };

        return <div ref={ref}>test</div>;
      }

      render(App(), container);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should support comp ref exposing', ({ container }) => {
      let ref: HTMLElement;
      const fn = vi.fn();

      function App() {
        let count = 0;
        let _ref;
        didMount(() => {
          ref = _ref;
          _ref.fn();
        });
        return <Input ref={_ref}>test</Input>;
      }

      function Input({ ref }) {
        let input: HTMLInputElement;
        didMount(() => {
          ref({ fn, input });
        });
        return <input ref={input} />;
      }

      render(App(), container);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(ref.input).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('composition', () => {
    it('should update prop', ({ container }) => {
      let update: (name: string) => void;

      function App() {
        let name = 'child';
        update = (val: string) => {
          name = val;
        };
        return <Child name={name} />;
      }

      function Child({ name }: { name: string }) {
        return <div>name is {name}</div>;
      }

      render(App(), container);
      expect(container.innerHTML).toBe('<div>name is child</div>');
      update('new');
      expect(container.innerHTML).toBe('<div>name is new</div>');
    });
  });
  describe('nested component', () => {
    it('should render sub component using parent state', ({ container }) => {
      function App() {
        let count = 0;

        function Heading() {
          return <h1>{count}</h1>;
        }

        return <Heading />;
      }

      render(App(), container);
      expect(container.innerHTML).toBe('<h1>0</h1>');
    });

    it('should update nested component when parent state changes', ({ container }) => {
      let setCount: (n: number) => void;

      function App() {
        let count = 0;
        setCount = (n: number) => {
          count = n;
        };

        function Counter() {
          return <div>Count: {count}</div>;
        }

        return <Counter />;
      }

      render(App(), container);
      expect(container.innerHTML).toBe('<div>Count: 0</div>');

      setCount(5);
      expect(container.innerHTML).toBe('<div>Count: 5</div>');
    });

    it('should pass props through multiple levels of nesting', ({ container }) => {
      function App() {
        let name = 'Alice';

        function Parent({ children }) {
          return (
            <div className="parent">
              <h2>Parent</h2>
              {children}
            </div>
          );
        }

        function Child({ name }: { name: string }) {
          return <div className="child">Hello, {name}!</div>;
        }

        return (
          <Parent>
            <Child name={name} />
          </Parent>
        );
      }

      render(App(), container);
      expect(container.innerHTML).toBe(
        '<div class="parent"><h2>Parent</h2><div class="child">Hello, Alice!</div></div>'
      );
    });

    it('should handle sibling nested components with independent state', ({ container }) => {
      let incrementA: () => void;
      let incrementB: () => void;

      function App() {
        let a = 0;
        let b = 0;
        incrementA = () => {
          a += 1;
        };
        incrementB = () => {
          b += 1;
        };

        function Counter({ name }: { name: string }) {
          const value = name === 'A' ? a : b;
          return (
            <div>
              Counter {name}: {value}
            </div>
          );
        }

        return (
          <div>
            <Counter name="A" />
            <Counter name="B" />
          </div>
        );
      }

      render(App(), container);
      expect(container.innerHTML).toBe('<div><div>Counter A: 0</div><div>Counter B: 0</div></div>');

      incrementA();
      expect(container.innerHTML).toBe('<div><div>Counter A: 1</div><div>Counter B: 0</div></div>');

      incrementB();
      expect(container.innerHTML).toBe('<div><div>Counter A: 1</div><div>Counter B: 1</div></div>');
    });
  });
});
