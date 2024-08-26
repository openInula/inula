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

describe('props', () => {
  describe('normal props', () => {
    it('should support prop', ({ container }) => {
      function Child({ name }) {
        return <h1>{name}</h1>;
      }

      function App() {
        return <Child name={'hello world!!!'} />;
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

    it('should support prop alias', ({ container }) => {
      function Child({ name: alias }) {
        return <h1>{alias}</h1>;
      }

      function App() {
        return <Child name={'prop alias'} />;
      }

      render(App, container);
      expect(container).toMatchInlineSnapshot(`
      <div>
        <h1>
          prop alias
        </h1>
      </div>
    `);
    });

    it('should support prop alias with default value', ({ container }) => {
      function Child({ name: alias = 'default' }) {
        return <h1>{alias}</h1>;
      }

      function App() {
        return <Child />;
      }

      render(App, container);
      expect(container).toMatchInlineSnapshot(`
      <div>
        <h1>
          default
        </h1>
      </div>
    `);
    });
  });

  describe('children', () => {
    it('should support children', ({ container }) => {
      function Child({ children }) {
        return <h1>{children}</h1>;
      }

      function App() {
        return <Child>child content</Child>;
      }

      render(App, container);
      expect(container).toMatchInlineSnapshot(`
      <div>
        <h1>
          child content
        </h1>
      </div>
    `);
    });

    it('should support children alias', ({ container }) => {
      function Child({ children: alias }) {
        return <h1>{alias}</h1>;
      }

      function App() {
        return <Child>children alias</Child>;
      }

      render(App, container);
      expect(container).toMatchInlineSnapshot(`
      <div>
        <h1>
          children alias
        </h1>
      </div>
    `);
    });

    it('should support children alias with default value', ({ container }) => {
      function Child({ children: alias = 'default child' }) {
        return <h1>{alias}</h1>;
      }

      function App() {
        return <Child />;
      }

      render(App, container);
      expect(container).toMatchInlineSnapshot(`
      <div>
        <h1>
          default child
        </h1>
      </div>
    `);
    });
  });
});

describe('extended prop tests', () => {
  it('should correctly pass and render string props', ({ container }) => {
    function Child({ text }) {
      return <p>{text}</p>;
    }

    function App() {
      return <Child text="Hello, world!" />;
    }

    render(App, container);
    expect(container).toMatchInlineSnapshot(`
        <div>
          <p>
            Hello, world!
          </p>
        </div>
      `);
  });

  it('should correctly pass and render number props', ({ container }) => {
    function Child({ number }) {
      return <span>{number}</span>;
    }

    function App() {
      return <Child number={42} />;
    }

    render(App, container);
    expect(container).toMatchInlineSnapshot(`
        <div>
          <span>
            42
          </span>
        </div>
      `);
  });

  it('should correctly pass and render boolean props', ({ container }) => {
    function Child({ isActive }) {
      return <div>{isActive ? 'Active' : 'Inactive'}</div>;
    }

    function App() {
      return <Child isActive={true} />;
    }

    render(App, container);
    expect(container).toMatchInlineSnapshot(`
        <div>
          <div>
            Active
          </div>
        </div>
      `);
  });

  it.fails('should correctly pass and render array props', ({ container }) => {
    function Child({ items }) {
      return (
        <ul>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }

    function App() {
      return <Child items={['Apple', 'Banana', 'Cherry']} />;
    }

    render(App, container);
    expect(container).toMatchInlineSnapshot(`
        <div>
          <ul>
            <li>Apple</li>
            <li>Banana</li>
            <li>Cherry</li>
          </ul>
        </div>
      `);
  });

  it.fails('should correctly pass and render object props', ({ container }) => {
    function Child({ person }) {
      return (
        <div>
          {person.name}, {person.age}
        </div>
      );
    }

    function App() {
      return <Child person={{ name: 'Alice', age: 30 }} />;
    }

    render(App, container);
    expect(container).toMatchInlineSnapshot(`
        <div>
          <div>
            Alice, 30
          </div>
        </div>
      `);
  });

  it('should correctly handle default prop values', ({ container }) => {
    function Child({ message = 'Default message' }) {
      return <h2>{message}</h2>;
    }

    function App() {
      return <Child />;
    }

    render(App, container);
    expect(container).toMatchInlineSnapshot(`
        <div>
          <h2>
            Default message
          </h2>
        </div>
      `);
  });

  it.fails('should correctly spread props', ({ container }) => {
    function Child(props) {
      return (
        <div>
          {props.a} {props.b} {props.c}
        </div>
      );
    }

    function App() {
      const extraProps = { b: 'World', c: '!' };
      return <Child a="Hello" {...extraProps} />;
    }

    render(App, container);
    expect(container).toMatchInlineSnapshot(`
        <div>
          <div>
            Hello World !
          </div>
        </div>
      `);
  });

  it.fails('should handle props without values', ({ container }) => {
    function Child({ isDisabled }) {
      return <button disabled={isDisabled}>Click me</button>;
    }

    function App() {
      return <Child isDisabled />;
    }

    render(App, container);
    expect(container).toMatchInlineSnapshot(`
        <div>
          <button disabled>
            Click me
          </button>
        </div>
      `);
  });

  it('should handle props with expressions', ({ container }) => {
    function Child({ result }) {
      return <div>{result}</div>;
    }

    function App() {
      return <Child result={1 + 2 * 3} />;
    }

    render(App, container);
    expect(container).toMatchInlineSnapshot(`
        <div>
          <div>
            7
          </div>
        </div>
      `);
  });
});
