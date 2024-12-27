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
import { render, useContext, createContext } from '../../src';

vi.mock('../../src/scheduler', async () => {
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

      render(App(), container);
      expect(container.innerHTML).toBe('<div>Hello, World!</div>');
    });

    it('should support JSX elements in arrays', ({ container }) => {
      function App() {
        const elements = [<div>First</div>, <div>Second</div>, <div>Third</div>];
        return <>{elements}</>;
      }

      render(App(), container);
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

      render(App(), container);
      expect(container.innerHTML).toBe('<h1>Title</h1><p>Content</p><footer>Footer</footer>');
    });
    //
    // it('should support functions returning JSX elements', ({ container }) => {
    //   function App() {
    //     const getElement = (text: string) => <span>{text}</span>;
    //     return <div>{getElement('Hello')}</div>;
    //   }
    //
    //   render(App(), container);
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

      render(App({}), container);
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

      render(App(), container);
      expect(container.innerHTML).toBe('<div>Dark Theme</div>');
    });
    it('should render string literals', ({ container }) => {
      function App() {
        return <div>{'Hello, World!'}</div>;
      }
      render(App(), container);
      expect(container.innerHTML).toBe('<div>Hello, World!</div>');
    });

    it('should render numbers', ({ container }) => {
      function App() {
        return <div>{42}</div>;
      }
      render(App(), container);
      expect(container.innerHTML).toBe('<div>42</div>');
    });

    it('should render booleans (as empty string)', ({ container }) => {
      function App() {
        return <div>{true}</div>;
      }
      render(App(), container);
      expect(container.innerHTML).toBe('<div></div>');
    });

    it('should render null and undefined (as empty string)', ({ container }) => {
      function App() {
        return (
          <div>
            {null}
            {undefined}
          </div>
        );
      }
      render(App(), container);
      expect(container.innerHTML).toBe('<div></div>');
    });

    it('should render arrays of elements', ({ container }) => {
      function App() {
        return <div>{[<span key="1">One</span>, <span key="2">Two</span>]}</div>;
      }
      render(App(), container);
      expect(container.innerHTML).toBe('<div><span key="1">One</span><span key="2">Two</span></div>');
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
      render(App(), container);
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
      render(App(), container);
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
      render(App(), container);
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
      render(App(), container);
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
      render(App(), container);
      expect(container.innerHTML).toBe('<div class="outer"><p class="inner"><span>Nested content</span></p></div>');
    });

    it('should correctly render a mix of HTML elements and text', ({ container }) => {
      function App() {
        return (
          <div>
            Text before <span>Element</span> Text after
          </div>
        );
      }
      render(App(), container);
      expect(container.innerHTML).toBe('<div>Text before <span>Element</span> Text after</div>');
    });

    it('should correctly render text on both sides of an element', ({ container }) => {
      function App() {
        return (
          <div>
            Left side text <strong>Bold text</strong> Right side text
          </div>
        );
      }
      render(App(), container);
      expect(container.innerHTML).toBe('<div>Left side text <strong>Bold text</strong> Right side text</div>');
    });

    it('should correctly render a mix of curly braces, text, and elements in different orders', ({ container }) => {
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
      render(App(), container);
      expect(container.innerHTML).toBe(
        '<div>World, Hello <strong>!</strong><em>Greetings</em> World to you' + 'Welcome <span>dear</span> World</div>'
      );
    });
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

      render(App(), container);
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

      render(App(), container);
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

      render(App(), container);
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
    //   render(App(), container);
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

      render(App(), container);
      expect(container.innerHTML).toBe('<div>True</div><div>Conditional</div><button>Toggle</button>');

      container.querySelector('button')?.click();
      expect(container.innerHTML).toBe('<div>False</div><button>Toggle</button>');
    });
  });
});

describe('JSX Element Attributes', () => {
  it('should correctly initialize attributes', ({ container }) => {
    function App() {
      return (
        <div id="test" className="example">
          Content
        </div>
      );
    }
    render(App(), container);
    expect(container.innerHTML).toBe('<div id="test" class="example">Content</div>');
  });

  it('should correctly update attributes', ({ container }) => {
    function App() {
      let className = 'initial';

      function updateClass() {
        className = 'updated';
      }

      return (
        <>
          <div className={className}>Content</div>
          <button onClick={updateClass}>Update</button>
        </>
      );
    }
    render(App(), container);
    expect(container.innerHTML).toBe('<div class="initial">Content</div><button>Update</button>');

    container.querySelector('button')?.click();
    expect(container.innerHTML).toBe('<div class="updated">Content</div><button>Update</button>');
  });

  it('should correctly render attributes dependent on variables', ({ container }) => {
    function App() {
      let className = 'initial';
      let b = className;
      function updateClass() {
        className = 'updated';
      }

      return (
        <>
          <div className={b}>Content</div>
          <button onClick={updateClass}>Update</button>
        </>
      );
    }
    render(App(), container);
    expect(container.innerHTML).toBe('<div class="initial">Content</div><button>Update</button>');

    container.querySelector('button')?.click();
    expect(container.innerHTML).toBe('<div class="updated">Content</div><button>Update</button>');
  });

  it('should correctly render attributes with expressions', ({ container }) => {
    function App() {
      const count = 5;
      return <div data-count={`Count is ${count}`}>Content</div>;
    }
    render(App(), container);
    expect(container.innerHTML).toBe('<div data-count="Count is 5">Content</div>');
  });

  it('should correctly render boolean attributes', ({ container }) => {
    function App() {
      const disabled = true;
      return <button disabled={disabled}>Click me</button>;
    }
    render(App(), container);
    expect(container.innerHTML).toBe('<button disabled="">Click me</button>');
  });

  it('should correctly render attributes without values', ({ container }) => {
    function App() {
      const checked = true;
      return <input type="checkbox" checked />;
    }
    render(App(), container);
    expect(container.querySelector('input')?.checked).toBe(true);
  });

  it('should correctly spread multiple attributes', ({ container }) => {
    function App() {
      const props = {
        id: 'test-id',
        className: 'test-class',
        'data-test': 'test-data',
      };
      return <div {...props}>Content</div>;
    }
    render(App(), container);
    expect(container.innerHTML).toBe('<div id="test-id" class="test-class" data-test="test-data">Content</div>');
  });

  it('should correctly handle attribute spreading and individual props', ({ container }) => {
    function App() {
      const props = {
        id: 'base-id',
        className: 'base-class',
      };
      return (
        <div {...props} id="override-id" data-extra="extra">
          Content
        </div>
      );
    }
    render(App(), container);
    expect(container.innerHTML).toBe('<div id="override-id" class="base-class" data-extra="extra">Content</div>');
  });
});

describe('JSX Element Inline Styles', () => {
  it('should correctly apply inline styles to an element', ({ container }) => {
    function App() {
      return <div style={{ color: 'red', fontSize: '16px' }}>Styled content</div>;
    }
    render(App(), container);
    expect(container.innerHTML).toBe('<div style="color: red; font-size: 16px;">Styled content</div>');
  });

  it('should correctly apply multiple inline styles to an element', ({ container }) => {
    function App() {
      return <div style={{ color: 'blue', fontSize: '20px', fontWeight: 'bold', margin: '10px' }}>Multiple styles</div>;
    }
    render(App(), container);
    expect(container.innerHTML).toBe(
      '<div style="color: blue; font-size: 20px; font-weight: bold; margin: 10px;">Multiple styles</div>'
    );
  });

  it('should correctly apply styles from a variable', ({ container }) => {
    function App() {
      const styleObj = { color: 'green', padding: '5px' };
      return <div style={styleObj}>Variable style</div>;
    }
    render(App(), container);
    expect(container.innerHTML).toBe('<div style="color: green; padding: 5px;">Variable style</div>');
  });

  it('should correctly update styles', ({ container }) => {
    function App() {
      let style = { color: 'purple' };

      function updateStyle() {
        style = { color: 'orange', fontSize: '24px' };
      }

      return (
        <>
          <div style={style}>Updatable style</div>
          <button onClick={updateStyle}>Update</button>
        </>
      );
    }
    render(App(), container);
    expect(container.innerHTML).toBe('<div style="color: purple;">Updatable style</div><button>Update</button>');

    container.querySelector('button')?.click();
    expect(container.innerHTML).toBe(
      '<div style="color: orange; font-size: 24px;">Updatable style</div><button>Update</button>'
    );
  });

  it('should correctly apply styles from an expression', ({ container }) => {
    function App() {
      const size = 18;
      return <div style={{ fontSize: `${size}px`, lineHeight: `${size * 1.5}px` }}>Expression style</div>;
    }
    render(App(), container);
    expect(container.innerHTML).toBe('<div style="font-size: 18px; line-height: 27px;">Expression style</div>');
  });

  it('should correctly merge style objects', ({ container }) => {
    function App() {
      const baseStyle = { color: 'red', fontSize: '16px' };
      const additionalStyle = { fontSize: '20px', fontWeight: 'bold' };
      return <div style={{ ...baseStyle, ...additionalStyle }}>Merged styles</div>;
    }
    render(App(), container);
    expect(container.innerHTML).toBe(
      '<div style="color: red; font-size: 20px; font-weight: bold;">Merged styles</div>'
    );
  });

  it('should correctly apply styles from a function call', ({ container }) => {
    function getStyles(color: string) {
      return { color, border: `1px solid ${color}` };
    }
    function App() {
      return <div style={getStyles('blue')}>Function style</div>;
    }
    render(App(), container);
    expect(container.innerHTML).toBe('<div style="color: blue; border: 1px solid blue;">Function style</div>');
  });

  it('should correctly apply styles based on a condition', ({ container }) => {
    function App() {
      const isActive = true;
      const style = isActive
        ? { backgroundColor: 'green', color: 'white' }
        : { backgroundColor: 'gray', color: 'black' };
      return <div style={style}>Conditional style</div>;
    }
    render(App(), container);
    expect(container.innerHTML).toBe('<div style="background-color: green; color: white;">Conditional style</div>');
  });

  it('should correctly apply styles based on an array of conditions', ({ container }) => {
    function App() {
      const conditions = [true, false, true];
      const style = {
        color: conditions[0] ? 'red' : 'blue',
        fontWeight: conditions[1] ? 'bold' : 'normal',
        fontSize: conditions[2] ? '20px' : '16px',
      };
      return <div style={style}>Array condition style</div>;
    }
    render(App(), container);
    expect(container.innerHTML).toBe(
      '<div style="color: red; font-weight: normal; font-size: 20px;">Array condition style</div>'
    );
  });

  it('should correctly apply styles using ternary and binary expressions', ({ container }) => {
    function App() {
      const isPrimary = true;
      const isLarge = true;
      return (
        <div
          style={{
            color: isPrimary ? 'blue' : 'gray',
            fontSize: isLarge && '24px',
          }}
        >
          Ternary and binary style
        </div>
      );
    }
    render(App(), container);
    expect(container.innerHTML).toBe('<div style="color: blue; font-size: 24px;">Ternary and binary style</div>');
  });

  it('should correctly apply styles using member expressions', ({ container }) => {
    const theme = {
      colors: {
        primary: 'blue',
        secondary: 'green',
      },
      sizes: {
        small: '12px',
        medium: '16px',
        large: '20px',
      },
    };
    function App() {
      return (
        <div
          style={{
            color: theme.colors.primary,
            fontSize: theme.sizes.medium,
          }}
        >
          Member expression style
        </div>
      );
    }
    render(App(), container);
    expect(container.innerHTML).toBe('<div style="color: blue; font-size: 16px;">Member expression style</div>');
  });
});
