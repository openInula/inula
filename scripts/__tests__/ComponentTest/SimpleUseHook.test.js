import * as React from '../../../libs/horizon/src/external/Horizon';
import * as HorizonDOM from '../../../libs/horizon/src/dom/DOMExternal';
import { act } from 'react-dom/test-utils';


describe('Hook Test', () => {
  const { useState, useReducer, useEffect, useLayoutEffect, useContext } = React;
  const { unmountComponentAtNode } = HorizonDOM;
  let container = null;
  beforeEach(() => {
    // 创建一个 DOM 元素作为渲染目标
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // 退出时进行清理
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });


  it('简单使用useState', () => {
    const App = () => {
      const [num, setNum] = useState(0);
      return (
        <>
          <p>{num}</p>
          <button onClick={() => setNum(num + 1)} />
        </>
      )
    }
    HorizonDOM.render(<App />, container);
    expect(container.querySelector('p').innerHTML).toBe('0');
    //点击按钮触发num加1
    container.querySelector('button').click();
    expect(container.querySelector('p').innerHTML).toBe('1');
  });

  it('简单使用useEffect', () => {
    const App = () => {
      const [num, setNum] = useState(0);
      useEffect(() => {
        document.getElementById('p').style.display = num === 0 ? 'none' : 'inline';
      });
      return (
        <>
          <p style={{ display: 'block' }} id="p">{num}</p>
          <button onClick={() => setNum(num + 1)} />
        </>
      )
    }
    HorizonDOM.render(<App />, container);
    expect(document.getElementById('p').style.display).toBe('block');
    //点击按钮触发num加1
    container.querySelector('button').click();
    expect(document.getElementById('p').style.display).toBe('none');
    container.querySelector('button').click();
    expect(container.querySelector('p').style.display).toBe('inline');
  });

  it('简单使用useLayoutEffect', () => {
    const App = () => {
      const [num, setNum] = useState(0);
      useLayoutEffect(() => {
        document.getElementById('p').style.display = num === 0 ? 'none' : 'inline';
      });
      return (
        <>
          <p style={{ display: 'block' }} id="p">{num}</p>
          <button onClick={() => setNum(num + 1)} />
        </>
      )
    }
    HorizonDOM.render(<App />, container);
    expect(document.getElementById('p').style.display).toBe('none');
    container.querySelector('button').click();
    expect(container.querySelector('p').style.display).toBe('inline');
  });

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
    //测试当Provider未提供时，获取到的默认值'JavaScript'。
    expect(container.querySelector('p').innerHTML).toBe('JavaScript');
    unmountComponentAtNode(container);
    HorizonDOM.render(<App />, container);
    //测试当Provider提供时，可以获取到Provider的值'Java'。
    expect(container.querySelector('p').innerHTML).toBe('Java');
    //测试当Provider改变时，可以获取到最新Provider的值。
    act(() => setValue(LanguageTypes.JAVASCRIPT));
    expect(container.querySelector('p').innerHTML).toBe('JavaScript');
  });

  it('简单使用useReducer', () => {
    const intlCar = { logo: '', price: 0 };
    let dispatch;
    const App = () => {
      const carReducer = (state, action) => {
        switch (action.logo) {
          case 'ford':
            return {
              ...intlCar,
              logo: 'ford',
              price: 76
            };
          case 'bmw':
            return {
              ...intlCar,
              logo: 'bmw',
              price: 100
            };
          case 'benz':
            return {
              ...intlCar,
              logo: 'benz',
              price: 80
            };
          default:
            return {
              ...intlCar,
              logo: 'audi',
              price: 88
            };
        }
      }
      const [car, carDispatch] = useReducer(carReducer, intlCar);
      dispatch = carDispatch;
      return (
        <div>
          <p>{car.logo}</p>
          <p id={'senP'}>{car.price}</p>
        </div>
      )
    }
    HorizonDOM.render(<App />, container);
    expect(container.querySelector('p').innerHTML).toBe('');
    expect(container.querySelector('#senP').innerHTML).toBe('0');
    //触发bmw
    dispatch({ logo: 'bmw' });
    expect(container.querySelector('p').innerHTML).toBe('bmw');
    expect(container.querySelector('#senP').innerHTML).toBe('100');
    //触发carReducer里的switch的default项
    dispatch({ logo: 'wrong logo' });
    expect(container.querySelector('p').innerHTML).toBe('audi');
    expect(container.querySelector('#senP').innerHTML).toBe('88');
  });
});
