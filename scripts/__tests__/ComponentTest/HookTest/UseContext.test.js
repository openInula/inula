/* eslint-disable no-undef */
import * as React from '../../../../libs/horizon/src/external/Horizon';
import * as HorizonDOM from '../../../../libs/horizon/src/dom/DOMExternal';
import { act } from '../../jest/customMatcher';

describe('useContext Hook Test', () => {
  const { useState, useContext } = React;
  const { unmountComponentAtNode } = HorizonDOM;

  it('简单使用useContext', () => {
    const LanguageTypes = {
      JAVA: 'Java',
      JAVASCRIPT: 'JavaScript',
    };
    const defaultValue = { type: LanguageTypes.JAVASCRIPT };
    const SystemLanguageContext = React.createContext(defaultValue);

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
    }
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
      )
    }
    HorizonDOM.render(<TestFunction />, container);
    // 测试当Provider未提供时，获取到的默认值'JavaScript'。
    expect(container.querySelector('p').innerHTML).toBe('JavaScript');
    unmountComponentAtNode(container);
    HorizonDOM.render(<App />, container);
    // 测试当Provider提供时，可以获取到Provider的值'Java'。
    expect(container.querySelector('p').innerHTML).toBe('Java');
    // 测试当Provider改变时，可以获取到最新Provider的值。
    act(() => setValue(LanguageTypes.JAVASCRIPT));
    expect(container.querySelector('p').innerHTML).toBe('JavaScript');
  });
});
