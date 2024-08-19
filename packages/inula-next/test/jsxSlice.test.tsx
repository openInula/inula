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
import { render, useContext, createContext } from '../src';

vi.mock('../src/scheduler', async () => {
  return {
    schedule: (task: () => void) => {
      task();
    },
  };
});

describe('JSX Element Usage in Various Contexts', () => {
  describe('mount', () => {
    it('should support variable assignment of JSX elements', ({ container }) => {
      function App() {
        const element = <div>Hello, World!</div>;
        return <>{element}</>;
      }

      render(App, container);
      expect(container.innerHTML).toBe('<div>Hello, World!</div>');
    });

    it('should support JSX elements in arrays', ({ container }) => {
      function App() {
        const elements = [<div>First</div>, <div>Second</div>, <div>Third</div>];
        return <>{elements}</>;
      }

      render(App, container);
      expect(container.innerHTML).toBe('<div>First</div><div>Second</div><div>Third</div>');
    });

    it('should support JSX elements as object properties', ({ container }) => {
      function App() {
        const obj = {
          header: <h1>Title</h1>,
          content: <p>Content</p>,
          footer: <footer>Footer</footer>,
        };
        return (
          <>
            {obj.header}
            {obj.content}
            {obj.footer}
          </>
        );
      }

      render(App, container);
      expect(container.innerHTML).toBe('<h1>Title</h1><p>Content</p><footer>Footer</footer>');
    });
    //
    // it('should support functions returning JSX elements', ({ container }) => {
    //   function App() {
    //     const getElement = (text: string) => <span>{text}</span>;
    //     return <div>{getElement('Hello')}</div>;
    //   }
    //
    //   render(App, container);
    //   expect(container.innerHTML).toBe('<div><span>Hello</span></div>');
    // });

    it('should support JSX elements in conditional expressions', ({ container }) => {
      function App({ condition = true }: { condition: boolean }) {
        return (
          <>
            {condition ? <div>True</div> : <div>False</div>}
            {condition && <div>Conditional</div>}
          </>
        );
      }

      render(App, container);
      expect(container.innerHTML).toBe('<div>True</div><div>Conditional</div>');
    });

    it('should support JSX elements as Context Provider values', ({ container }) => {
      const ThemeContext = createContext(null);

      function App() {
        const theme = <div>Dark Theme</div>;
        return (
          <ThemeContext value={theme}>
            <ThemeConsumer />
          </ThemeContext>
        );
      }

      function ThemeConsumer() {
        let { value } = useContext(ThemeContext);
        return <>{value}</>;
      }

      render(App, container);
      expect(container.innerHTML).toBe('<div>Dark Theme</div>');
    });
    it('should render string literals', ({ container }) => {
      function App() {
        return <div>{'Hello, World!'}</div>;
      }
      render(App, container);
      expect(container.innerHTML).toBe('<div>Hello, World!</div>');
    });

    it('should render numbers', ({ container }) => {
      function App() {
        return <div>{42}</div>;
      }
      render(App, container);
      expect(container.innerHTML).toBe('<div>42</div>');
    });

    it.fails('should render booleans (as empty string)', ({ container }) => {
      function App() {
        return <div>{true}</div>;
      }
      render(App, container);
      expect(container.innerHTML).toBe('<div></div>');
    });

    it.fails('should render null and undefined (as empty string)', ({ container }) => {
      function App() {
        return (
          <div>
            {null}
            {undefined}
          </div>
        );
      }
      render(App, container);
      expect(container.innerHTML).toBe('<div></div>');
    });

    it.fails('should render arrays of elements', ({ container }) => {
      function App() {
        return <div>{[<span key="1">One</span>, <span key="2">Two</span>]}</div>;
      }
      render(App, container);
      expect(container.innerHTML).toBe('<div><span>One</span><span>Two</span></div>');
    });

    it('should render function components', ({ container }) => {
      function Child() {
        return <span>Child Component</span>;
      }
      function App() {
        return (
          <div>
            <Child />
          </div>
        );
      }
      render(App, container);
      expect(container.innerHTML).toBe('<div><span>Child Component</span></div>');
    });

    it('should render fragments', ({ container }) => {
      function App() {
        return (
          <>
            <span>First</span>
            <span>Second</span>
          </>
        );
      }
      render(App, container);
      expect(container.innerHTML).toBe('<span>First</span><span>Second</span>');
    });

    it('should render elements with props', ({ container }) => {
      function App() {
        return (
          <div className="test" id="myDiv">
            Content
          </div>
        );
      }
      render(App, container);
      expect(container.innerHTML).toBe('<div class="test" id="myDiv">Content</div>');
    });

    it('should render elements with children prop', ({ container }) => {
      function Wrapper({ children }: { children: React.ReactNode }) {
        return <div className="wrapper">{children}</div>;
      }
      function App() {
        return (
          <Wrapper>
            <span>Child Content</span>
          </Wrapper>
        );
      }
      render(App, container);
      expect(container.innerHTML).toBe('<div class="wrapper"><span>Child Content</span></div>');
    });

    it('should correctly render nested HTML elements', ({ container }) => {
      function App() {
        return (
          <div className="outer">
            <p className="inner">
              <span>Nested content</span>
            </p>
          </div>
        );
      }
      render(App, container);
      expect(container.innerHTML).toBe('<div class="outer"><p class="inner"><span>Nested content</span></p></div>');
    });

    it.fails('should correctly render a mix of HTML elements and text', ({ container }) => {
      function App() {
        return (
          <div>
            Text before <span>Element</span> Text after
          </div>
        );
      }
      render(App, container);
      expect(container.innerHTML).toBe('<div>Text before <span>Element</span> Text after</div>');
    });

    it.fails('should correctly render text on both sides of an element', ({ container }) => {
      function App() {
        return (
          <div>
            Left side text <strong>Bold text</strong> Right side text
          </div>
        );
      }
      render(App, container);
      expect(container.innerHTML).toBe('<div>Left side text <strong>Bold text</strong> Right side text</div>');
    });

    it.fails(
      'should correctly render a mix of curly braces, text, and elements in different orders',
      ({ container }) => {
        function App() {
          const name = 'World';
          return (
            <div>
              {/* Curly braces, then text, then element */}
              {name}, Hello <strong>!</strong>
              {/* Element, then curly braces, then text */}
              <em>Greetings</em> {name} to you
              {/* Text, then element, then curly braces */}
              Welcome <span>dear</span> {name}
            </div>
          );
        }
        render(App, container);
        expect(container.innerHTML).toBe(
          '<div>World, Hello <strong>!</strong><em>Greetings</em> World to you' +
            'Welcome <span>dear</span> World</div>'
        );
      }
    );
  });
  describe('update', () => {
    it('should support variable assignment of JSX elements and updates', ({ container }) => {
      function App() {
        let element = <div>Hello, World!</div>;

        function updateElement() {
          element = <div>Updated World!</div>;
        }

        return (
          <>
            {element}
            <button onClick={updateElement}>Update</button>
          </>
        );
      }

      render(App, container);
      expect(container.innerHTML).toBe('<div>Hello, World!</div><button>Update</button>');

      container.querySelector('button')?.click();
      expect(container.innerHTML).toBe('<div>Updated World!</div><button>Update</button>');
    });

    it('should support JSX elements in arrays with updates', ({ container }) => {
      function App() {
        let elements = [<div>First</div>, <div>Second</div>, <div>Third</div>];

        function updateElements() {
          elements = [<div>Updated First</div>, <div>Updated Second</div>, <div>Updated Third</div>];
        }

        return (
          <>
            {elements}
            <button onClick={updateElements}>Update</button>
          </>
        );
      }

      render(App, container);
      expect(container.innerHTML).toBe('<div>First</div><div>Second</div><div>Third</div><button>Update</button>');

      container.querySelector('button')?.click();
      expect(container.innerHTML).toBe(
        '<div>Updated First</div><div>Updated Second</div><div>Updated Third</div><button>Update</button>'
      );
    });

    it('should support JSX elements as object properties with updates', ({ container }) => {
      function App() {
        let obj = {
          header: <h1>Title</h1>,
          content: <p>Content</p>,
          footer: <footer>Footer</footer>,
        };

        function updateObj() {
          obj = {
            header: <h1>Updated Title</h1>,
            content: <p>Updated Content</p>,
            footer: <footer>Updated Footer</footer>,
          };
        }

        return (
          <>
            {obj.header}
            {obj.content}
            {obj.footer}
            <button onClick={updateObj}>Update</button>
          </>
        );
      }

      render(App, container);
      expect(container.innerHTML).toBe('<h1>Title</h1><p>Content</p><footer>Footer</footer><button>Update</button>');

      container.querySelector('button')?.click();
      expect(container.innerHTML).toBe(
        '<h1>Updated Title</h1><p>Updated Content</p><footer>Updated Footer</footer><button>Update</button>'
      );
    });

    // it('should support functions returning JSX elements with updates', ({ container }) => {
    //   function App() {
    //     let text = 'Hello';
    //
    //     const getElement = (t: string) => <span>{t}</span>;
    //
    //     function updateText() {
    //       text = 'Updated Hello';
    //     }
    //
    //     return (
    //       <div>
    //         {getElement(text)}
    //         <button onClick={updateText}>Update</button>
    //       </div>
    //     );
    //   }
    //
    //   render(App, container);
    //   expect(container.innerHTML).toBe('<div><span>Hello</span><button>Update</button></div>');
    //
    //   container.querySelector('button')?.click();
    //   expect(container.innerHTML).toBe('<div><span>Updated Hello</span><button>Update</button></div>');
    // });

    it('should support JSX elements in conditional expressions with updates', ({ container }) => {
      function App() {
        let condition = true;

        function toggleCondition() {
          condition = !condition;
        }

        return (
          <>
            {condition ? <div>True</div> : <div>False</div>}
            {condition && <div>Conditional</div>}
            <button onClick={toggleCondition}>Toggle</button>
          </>
        );
      }

      render(App, container);
      expect(container.innerHTML).toBe('<div>True</div><div>Conditional</div><button>Toggle</button>');

      container.querySelector('button')?.click();
      expect(container.innerHTML).toBe('<div>False</div><button>Toggle</button>');
    });
  });
});
