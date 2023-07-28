/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
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

import * as Inula from '../../../../libs/inula/index';

describe('useContext Hook Test', () => {
  const { useState, useContext, createContext, act, unmountComponentAtNode } = Inula;

  it('简单使用useContext', () => {
    const LanguageTypes = {
      JAVA: 'Java',
      JAVASCRIPT: 'JavaScript',
    };
    const defaultValue = { type: LanguageTypes.JAVASCRIPT };
    const SystemLanguageContext = Inula.createContext(defaultValue);

    const SystemLanguageProvider = ({ type, children }) => {
      return (
        <SystemLanguageContext.Provider value={{ type }}>
          {children}
        </SystemLanguageContext.Provider>
      );
    };
    const TestFunction = () => {
      const context = useContext(SystemLanguageContext);
      return <p id="p">{context.type}</p>;
    };
    let setValue;
    const App = () => {
      const [value, _setValue] = useState(LanguageTypes.JAVA);
      setValue = _setValue;
      return (
        <div className="App">
          <SystemLanguageProvider type={value}>
            <TestFunction />
          </SystemLanguageProvider>
        </div>
      );
    };
    Inula.render(<TestFunction />, container);
    // 测试当Provider未提供时，获取到的默认值'JavaScript'。
    expect(container.querySelector('p').innerHTML).toBe('JavaScript');
    unmountComponentAtNode(container);
    Inula.render(<App />, container);
    // 测试当Provider提供时，可以获取到Provider的值'Java'。
    expect(container.querySelector('p').innerHTML).toBe('Java');
    // 测试当Provider改变时，可以获取到最新Provider的值。
    act(() => setValue(LanguageTypes.JAVASCRIPT));
    expect(container.querySelector('p').innerHTML).toBe('JavaScript');
  });

  it('更新后useContext仍能获取到context', () => {
    const Context = createContext({});
    const ref = Inula.createRef();

    function App() {
      return (
        <Context.Provider
          value={{
            text: 'context',
          }}
        >
          <Child />
        </Context.Provider>
      );
    }

    let update;

    function Child() {
      const context = useContext(Context);
      const [_, setState] = useState({});
      update = () => setState({});

      return <div ref={ref}>{context.text}</div>;
    }

    Inula.render(<App />, container);
    expect(ref.current.innerHTML).toBe('context');

    update();

    expect(ref.current.innerHTML).toBe('context');
  });
});
