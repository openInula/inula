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
import { render, createContext, useContext } from '../../src';

vi.mock('../../src/scheduler', async () => {
  return {
    schedule: (task: () => void) => {
      task();
    },
  };
});

describe('context', () => {
  it('should support context', ({ container }) => {
    const TheContext = createContext({
      theme: '',
    });

    function App() {
      return (
        <TheContext theme="dark">
          <Child name="child" />
        </TheContext>
      );
    }

    function Child({ name }) {
      const { theme } = useContext(TheContext);
      return (
        <>
          name is {name}, theme is {theme}
        </>
      );
    }

    render(App(), container);
    expect(container.innerHTML.trim()).toBe('name is child, theme is dark');
  });

  it('should support recursive context', ({ container }) => {
    const FileContext = createContext({
      level: 0,
    });
    // Folder is the consumer and provider at same time
    const Folder = ({ name, children }) => {
      const { level } = useContext(FileContext);
      return (
        <FileContext level={level + 1}>
          <div>
            <h1>{`Folder: ${name}, level: ${level}`}</h1>
            {children}
          </div>
        </FileContext>
      );
    };
    const File = ({ name }) => {
      const { level } = useContext(FileContext);

      return <div>{`File: ${name}, level: ${level}`}</div>;
    };

    const App = () => {
      return (
        <Folder name="Root">
          <File name="file1.txt" />
          <Folder name="Subfolder 2">
            <File name="file2.txt" />
          </Folder>
        </Folder>
      );
    };

    render(App(), container);
    expect(container).toMatchInlineSnapshot(`
        <div>
          <div>
            <h1>
              Folder: Root, level: 0
            </h1>
            <div>
              File: file1.txt, level: 1
            </div>
            <div>
              <h1>
                Folder: Subfolder 2, level: 1
              </h1>
              <div>
                File: file2.txt, level: 2
              </div>
            </div>
          </div>
        </div>
      `);
  });

  it('should support use context in conditional node', ({ container }) => {
    const ThemeContext = createContext('light');

    function Child({ name }) {
      const { theme } = useContext(ThemeContext);
      return (
        <>
          <h1>{name}</h1>
          <div>{theme}</div>
        </>
      );
    }

    let showChild;

    function App() {
      let show = false;
      showChild = () => {
        show = true;
      };
      return (
        <>
          <ThemeContext theme="dark">
            <if cond={show}>
              <Child name="True branch" />
            </if>
            <else>
              <Child name="False branch" />
            </else>
          </ThemeContext>
          <ThemeContext theme="light">
            <Child name="Side branch" />
          </ThemeContext>
        </>
      );
    }

    render(App(), container);
    expect(container.innerHTML).toMatchInlineSnapshot(
      `"<h1>False branch</h1><div>dark</div><h1>Side branch</h1><div>light</div>"`
    );
    showChild();
    expect(container.innerHTML).toMatchInlineSnapshot(
      `"<h1>True branch</h1><div>dark</div><h1>Side branch</h1><div>light</div>"`
    );
  });

  it('should support use context in loop node', ({ container }) => {
    const ItemContext = createContext(null);
    const ThemeContext = createContext('light');
    let addItem;

    function ItemList() {
      const items = ['Apple', 'Banana'];
      addItem = item => {
        items.push(item);
      };
      return (
        <ThemeContext theme="dark">
          <ul>
            <for each={items}>
              {item => (
                <ItemContext item={item}>
                  <ListItem />
                </ItemContext>
              )}
            </for>
          </ul>
        </ThemeContext>
      );
    }

    function ListItem() {
      const { item } = useContext(ItemContext);
      const { theme } = useContext(ThemeContext);
      return <li>{`${theme} - ${item}`}</li>;
    }

    render(ItemList(), container);
    expect(container.innerHTML).toMatchInlineSnapshot(`"<ul><li>dark - Apple</li><li>dark - Banana</li></ul>"`);
    addItem('grape');
    expect(container.innerHTML).toMatchInlineSnapshot(
      `"<ul><li>dark - Apple</li><li>dark - Banana</li><li>dark - grape</li></ul>"`
    );
  });

  it('should update context value', ({ container }) => {
    const CountContext = createContext(0);

    function Counter() {
      const { count } = useContext(CountContext);
      return <div>Count: {count}</div>;
    }

    function App({ initialCount = 0 }) {
      let count = initialCount;
      const onClick = () => (count = count + 1);
      return (
        <CountContext count={count}>
          <Counter />
          <button onClick={onClick}>Increment</button>
        </CountContext>
      );
    }

    render(App({}), container);
    expect(container.querySelector('div').textContent).toBe('Count: 0');

    container.querySelector('button').click();
    expect(container.querySelector('div').textContent).toBe('Count: 1');
  });
  it('Should correctly create and provide context', ({ container }) => {
    const ThemeContext = createContext('light');

    function App() {
      return (
        <ThemeContext theme="dark">
          <Child />
        </ThemeContext>
      );
    }

    function Child() {
      const { theme } = useContext(ThemeContext);
      return <div>Current theme: {theme}</div>;
    }

    render(App(), container);
    expect(container.innerHTML).toBe('<div>Current theme: dark</div>');
  });

  it('Should correctly consume context in child components', ({ container }) => {
    const UserContext = createContext({ name: '', age: 0 });

    function App() {
      return (
        <UserContext name="Alice" age={30}>
          <Parent />
        </UserContext>
      );
    }

    function Parent() {
      return (
        <div>
          <Child1 />
          <Child2 />
        </div>
      );
    }

    function Child1() {
      const { name } = useContext(UserContext);
      return <div>Name: {name}</div>;
    }

    function Child2() {
      const { age } = useContext(UserContext);
      return <div>Age: {age}</div>;
    }

    render(App(), container);
    expect(container.innerHTML).toBe('<div><div>Name: Alice</div><div>Age: 30</div></div>');
  });

  it('Should correctly update context and re-render consumers', ({ container }) => {
    const CountContext = createContext(0);

    function App() {
      let count = 0;
      const increment = () => {
        count += 1;
      };

      return (
        <CountContext count={count}>
          <Counter />
          <button onClick={increment}>Increment</button>
        </CountContext>
      );
    }

    function Counter() {
      const { count } = useContext(CountContext);
      return <div>Count: {count}</div>;
    }

    render(App(), container);
    expect(container.querySelector('div').textContent).toBe('Count: 0');

    container.querySelector('button').click();
    expect(container.querySelector('div').textContent).toBe('Count: 1');
  });

  it('Should correctly update children using context', ({ container }) => {
    const NumContext = createContext({ num: null });

    let updateNum: () => void;
    function Parent({ children }) {
      let num = 1;
      updateNum = () => {
        num++;
      };
      return <NumContext num={num}>{children}</NumContext>;
    }

    function Son() {
      const { num } = useContext(NumContext);
      return <h1>{num}</h1>;
    }

    function App() {
      return (
        <Parent>
          <Son />
        </Parent>
      );
    }

    render(App(), container);
    expect(container.innerHTML).toBe('<h1>1</h1>');
    updateNum!();
    expect(container.innerHTML).toBe('<h1>2</h1>');
    updateNum!();
    expect(container.innerHTML).toBe('<h1>3</h1>');
    updateNum!();
  });

  it('Should handle nested contexts correctly', ({ container }) => {
    const ThemeContext = createContext('light');
    const LanguageContext = createContext('en');

    function App() {
      return (
        <ThemeContext theme="dark">
          <LanguageContext language="fr">
            <Child />
          </LanguageContext>
        </ThemeContext>
      );
    }

    function Child() {
      const { theme } = useContext(ThemeContext);
      const { language } = useContext(LanguageContext);
      return (
        <div>
          Theme: {theme}, Language: {language}
        </div>
      );
    }

    render(App(), container);
    expect(container.innerHTML).toBe('<div>Theme: dark, Language: fr</div>');
  });

  it('Should use default value when no provider is present', ({ container }) => {
    const DefaultContext = createContext({ message: 'Default message' });

    function App() {
      return <Child />;
    }

    function Child() {
      const { message } = useContext(DefaultContext);
      return <div>{message}</div>;
    }

    render(App(), container);
    expect(container.innerHTML).toBe('<div>Default message</div>');
  });

  it('Should support whole context object as value', ({ container }) => {
    const AppContext = createContext('en');
    let updateContext;

    function App() {
      let context = { language: 'en', theme: 'light' };
      updateContext = () => {
        context = { language: 'fr', theme: 'dark' };
      };
      return (
        <AppContext language={context.language} theme={context.theme}>
          <Child />
        </AppContext>
      );
    }

    function Child() {
      const context = useContext(AppContext);
      return (
        <div>
          Theme: {context.theme}, Language: {context.language}
        </div>
      );
    }

    render(App(), container);
    expect(container.innerHTML).toBe('<div>Theme: light, Language: en</div>');
    updateContext();
    expect(container.innerHTML).toBe('<div>Theme: dark, Language: fr</div>');
  });

  it('Should support partial context', ({ container }) => {
    const AppContext = createContext({
      theme: 'light',
      language: 'en',
    });
    let updateContext: () => void;

    function App() {
      let theme = 'light';
      const language = 'en';
      updateContext = () => {
        theme = 'dark';
      };
      return (
        <AppContext language={language} theme={theme}>
          <Child />
        </AppContext>
      );
    }

    function Child() {
      const { language } = useContext(AppContext);
      return <div>Language: {language}</div>;
    }

    render(App(), container);
    expect(container.innerHTML).toBe('<div>Language: en</div>');
    updateContext!();
    expect(container.innerHTML).toBe('<div>Language: en</div>');
  });

  it('Should support object spread in provider', ({ container }) => {
    const AppContext = createContext({
      theme: 'light',
      language: 'en',
    });
    let updateContext: () => void;

    function App() {
      let context = { language: 'en', theme: 'light' };
      updateContext = () => {
        context = { language: 'fr', theme: 'dark' };
      };
      return (
        <AppContext {...context}>
          <Child />
        </AppContext>
      );
    }

    function Child() {
      const context = useContext(AppContext);
      return (
        <div>
          Theme: {context.theme}, Language: {context.language}
        </div>
      );
    }

    render(App(), container);
    expect(container.innerHTML).toBe('<div>Theme: light, Language: en</div>');
    updateContext!();
    expect(container.innerHTML).toBe('<div>Theme: dark, Language: fr</div>');
  });

  it('Should support object spread in provider and consume by key', ({ container }) => {
    const AppContext = createContext({
      language: 'en',
    });
    let updateContext: () => void;

    function App() {
      let context = { language: 'en', theme: 'light' };
      updateContext = () => {
        context = { language: 'fr', theme: 'dark' };
      };
      return (
        <AppContext {...context}>
          <Child />
        </AppContext>
      );
    }

    function Child() {
      const { language, theme } = useContext(AppContext);
      return (
        <div>
          Theme: {theme}, Language: {language}
        </div>
      );
    }

    render(App(), container);
    expect(container.innerHTML).toBe('<div>Theme: light, Language: en</div>');
    updateContext!();
    expect(container.innerHTML).toBe('<div>Theme: dark, Language: fr</div>');
  });
});
