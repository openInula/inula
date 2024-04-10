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
import { render, View } from '../src';

describe('rendering', () => {
  describe('basic', () => {
    it('should support basic dom', ({ container }) => {
      function App() {
        return <h1>hello world!!!</h1>;
      }

      render(App, container);
      expect(container).toMatchInlineSnapshot(`
      <div>
        <h1>
          hello world!!!
        </h1>
      </div>
    `);
    });

    it('should support text and variable mixing', ({ container }) => {
      function App() {
        const name = 'world';
        return <h1>hello {name}!!!</h1>;
      }

      render(App, container);
      expect(container).toMatchInlineSnapshot(`
        <div>
          <h1>
            hello 
            world
            !!!
          </h1>
        </div>
      `);
    });

    // TODO: SHOULD FIX
    it('should support dom has multiple layers ', ({ container }) => {
      function App() {
        let count = 0;

        return (
          <div>
            Header
            <h1>hello world!!!</h1>
            <section>
              <button>Add, Now is {count}</button>
            </section>
            Footer
          </div>
        );
      }

      render(App, container);
      expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <h1>
            hello world!!!
          </h1>
          <section>
            <button>
              Add, Now is
              0
            </button>
          </section>
        </div>
      </div>
    `);
    });

    // TODO: SHOULD FIX
    it('should support tag, text and variable mixing', ({ container }) => {
      function App() {
        let count = 'world';

        return (
          <section>
            count: {count}
            <button>Add, count is {count}</button>
          </section>
        );
      }

      render(App, container);
      expect(container).toMatchInlineSnapshot();
    });
  });

  describe('style', () => {
    it('should apply styles correctly', ({ container }) => {
      function App() {
        return <h1 style={{ color: 'red' }}>hello world!!!</h1>;
      }

      render(App, container);
      const h1 = container.querySelector('h1');
      expect(h1.style.color).toBe('red');
    });

    it('should apply multiple styles correctly', ({ container }) => {
      function App() {
        return <h1 style={{ color: 'red', fontSize: '20px' }}>hello world!!!</h1>;
      }

      render(App, container);
      const h1 = container.querySelector('h1');
      expect(h1.style.color).toBe('red');
      expect(h1.style.fontSize).toBe('20px');
    });

    it('should override styles correctly', ({ container }) => {
      function App() {
        return (
          <h1 style={{ color: 'red' }}>
            <span style={{ color: 'blue' }}>hello world!!!</span>
          </h1>
        );
      }

      render(App, container);
      const span = container.querySelector('span');
      expect(span.style.color).toBe('blue');
    });

    it('should handle dynamic styles', ({ container }) => {
      const color = 'red';

      function App() {
        return <h1 style={{ color }}>hello world!!!</h1>;
      }

      render(App, container);
      const h1 = container.querySelector('h1');
      expect(h1.style.color).toBe('red');
    });
  });

  describe('event', () => {
    it('should handle click events', ({ container }) => {
      const handleClick = vi.fn();

      function App() {
        return <button onClick={handleClick}>Click me</button>;
      }

      render(App, container);
      const button = container.querySelector('button');
      button.click();

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('components', () => {
    it('should render components', ({ container }) => {
      function Button({ children }) {
        return <button>{children}</button>;
      }

      function App() {
        return (
          <div>
            <h1>hello world!!!</h1>
            <Button>Click me</Button>
          </div>
        );
      }

      render(App, container);
      expect(container).toMatchInlineSnapshot(`
        <div>
          <div>
            <h1>
              hello world!!!
            </h1>
            <button>
              Click me
            </button>
          </div>
        </div>
      `);
    });
  });
});
