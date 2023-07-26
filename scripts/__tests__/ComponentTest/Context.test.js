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

import * as Inula from '../../../libs/inula/index';
import { getLogUtils } from '../jest/testUtils';

describe('Context Test', () => {
  const LogUtils = getLogUtils();
  it('Provider及其内部consumer组件都不受制于shouldComponentUpdate函数或者Inula.memo()', () => {
    const LanguageTypes = {
      JAVA: 'Java',
      JAVASCRIPT: 'JavaScript',
    };
    const defaultValue = { type: LanguageTypes.JAVASCRIPT };
    const SystemLanguageContext = Inula.createContext(defaultValue);
    const SystemLanguageConsumer = SystemLanguageContext.Consumer;
    const SystemLanguageProvider = (props) => {
      LogUtils.log('SystemLanguageProvider');
      return (
        <SystemLanguageContext.Provider value={props.type}>
          {props.children}
        </SystemLanguageContext.Provider>
      );
    };

    const Consumer = () => {
      LogUtils.log('Consumer');
      return (
        <SystemLanguageConsumer>
          {type => {
            LogUtils.log('Consumer DOM mutations');
            return <p>{type}</p>;
          }}
        </SystemLanguageConsumer>
      );
    };

    class Middle extends Inula.Component {
      shouldComponentUpdate() {
        return false;
      }
      render() {
        LogUtils.log('Middle');
        return this.props.children;
      }
    }

    const App = (props) => {
      LogUtils.log('App');
      return (
        <SystemLanguageProvider type={props.value}>
          <Middle>
            <Middle>
              <Consumer />
            </Middle>
          </Middle>
        </SystemLanguageProvider>
      );
    };

    Inula.render(<App value={LanguageTypes.JAVA} />, container);
    expect(container.querySelector('p').innerHTML).toBe('Java');
    expect(LogUtils.getAndClear()).toEqual([
      'App',
      'SystemLanguageProvider',
      'Middle',
      'Middle',
      'Consumer',
      'Consumer DOM mutations'
    ]);

    // 组件不变，Middle没有更新，消费者也不会执行
    Inula.render(<App value={LanguageTypes.JAVA} />, container);
    expect(container.querySelector('p').innerHTML).toBe('Java');
    expect(LogUtils.getAndClear()).toEqual([
      'App',
      'SystemLanguageProvider'
    ]);

    Inula.render(<App value={LanguageTypes.JAVASCRIPT} />, container);
    expect(container.querySelector('p').innerHTML).toBe('JavaScript');
    // 组件更新，但是Middle没有更新，会绕过Middle
    expect(LogUtils.getAndClear()).toEqual([
      'App',
      'SystemLanguageProvider',
      'Consumer DOM mutations'
    ]);
  });

  it('嵌套consumer provider', () => {
    const Num = {
      ONE: 1,
      TWO: 2,
    };
    const NumberContext = Inula.createContext(0);
    const NumberConsumer = NumberContext.Consumer;
    const NumberProvider = (props) => {
      LogUtils.log(`SystemLanguageProvider: ${props.type}`);
      return (
        <NumberContext.Provider value={props.type}>
          {props.children}
        </NumberContext.Provider>
      );
    };

    const Consumer = () => {
      LogUtils.log('Consumer');
      return (
        <NumberConsumer>
          {type => {
            LogUtils.log('Consumer DOM mutations');
            return <p>{type}</p>;
          }}
        </NumberConsumer>
      );
    };

    class Middle extends Inula.Component {
      shouldComponentUpdate() {
        return false;
      }
      render() {
        LogUtils.log('Middle');
        return this.props.children;
      }
    }

    const App = (props) => {
      LogUtils.log('App');
      return (
        <NumberProvider type={props.value}>
          <NumberProvider type={props.value + 1}>
            <Middle>
              <Consumer />
            </Middle>
          </NumberProvider>
        </NumberProvider>
      );
    };

    // Consumer决定于距离它最近的provider
    Inula.render(<App value={Num.ONE} />, container);
    expect(container.querySelector('p').innerHTML).toBe('2');
    expect(LogUtils.getAndClear()).toEqual([
      'App',
      'SystemLanguageProvider: 1',
      'SystemLanguageProvider: 2',
      'Middle',
      'Consumer',
      'Consumer DOM mutations'
    ]);
    // 更新
    Inula.render(<App value={Num.TWO} />, container);
    expect(container.querySelector('p').innerHTML).toBe('3');
    expect(LogUtils.getAndClear()).toEqual([
      'App',
      'SystemLanguageProvider: 2',
      'SystemLanguageProvider: 3',
      'Consumer DOM mutations'
    ]);
  });

  it('设置defaultValue', () => {
    const Num = {
      ONE: 1,
      TWO: 2,
    };
    const NumberContext = Inula.createContext(0);
    const NewNumberContext = Inula.createContext(1);
    const NumberConsumer = NumberContext.Consumer;
    const NumberProvider = props => {
      return (
        <NumberContext.Provider value={props.type}>
          {props.children}
        </NumberContext.Provider>
      );
    };
    const NewNumberProvider = props => {
      return (
        <NewNumberContext.Provider value={props.type}>
          {props.children}
        </NewNumberContext.Provider>
      );
    };

    class Middle extends Inula.Component {
      shouldComponentUpdate() {
        return false;
      }
      render() {
        return this.props.children;
      }
    }

    const NewApp = (props) => {
      return (
        <NewNumberProvider value={props.value}>
          <Middle>
            <NumberConsumer>
              {type => {
                LogUtils.log('Consumer DOM mutations');
                return <p>{type}</p>;
              }}
            </NumberConsumer>
          </Middle>
        </NewNumberProvider>
      );
    };

    const App = (props) => {
      return (
        <NumberProvider value={props.value}>
          <Middle>
            <NumberConsumer>
              {type => {
                LogUtils.log('Consumer DOM mutations');
                return <p>{type}</p>;
              }}
            </NumberConsumer>
          </Middle>
        </NumberProvider>
      );
    };

    Inula.render(<NewApp value={Num.ONE} />, container);
    // 没有匹配到Provider,会使用defaultValue
    expect(container.querySelector('p').innerHTML).toBe('0');

    // 更新,设置value为undefined
    Inula.render(<App value={undefined} />, container);
    // 设置value为undefined时，defaultValue不生效
    expect(container.querySelector('p').innerHTML).toBe('');
  });

  it('不同provider下的多个consumer', () => {
    const NumContext = Inula.createContext(1);
    const Consumer = NumContext.Consumer;

    function Provider(props) {
      return (
        <Consumer>
          {value => (
            <NumContext.Provider value={props.value || value * 2}>
              {props.children}
            </NumContext.Provider>
          )}
        </Consumer>
      );
    }

    class Middle extends Inula.Component {
      shouldComponentUpdate() {
        return false;
      }
      render() {
        return this.props.children;
      }
    }

    const App = props => {
      return (
        <Provider value={props.value}>
          <Middle>
            <Middle>
              <Provider>
                <Consumer>
                  {value => <p>{value}</p>}
                </Consumer>
              </Provider>
            </Middle>
            <Middle>
              <Consumer>
                {value => <p id='p'>{value}</p>}
              </Consumer>
            </Middle>
          </Middle>
        </Provider>
      );
    };

    Inula.render(<App value={2} />, container);
    expect(container.querySelector('p').innerHTML).toBe('4');
    expect(container.querySelector('#p').innerHTML).toBe('2');

    Inula.render(<App value={3} />, container);
    expect(container.querySelector('p').innerHTML).toBe('6');
    expect(container.querySelector('#p').innerHTML).toBe('3');
  });

  it('consumer里的child更新是不会重新渲染', () => {
    const NumContext = Inula.createContext(1);
    const Consumer = NumContext.Consumer;

    let setNum;
    const ReturnDom = props => {
      const [num, _setNum] = Inula.useState(0);
      setNum = _setNum;
      LogUtils.log('ReturnDom');
      return (
        <p>{`Context: ${props.context}, Num: ${num}`}</p>
      );
    };

    const App = props => {
      return (
        <NumContext.Provider value={props.value}>
          <Consumer>
            {value => {
              LogUtils.log('Consumer');
              return <ReturnDom context={value} />;
            }}
          </Consumer>
        </NumContext.Provider>
      );
    };

    Inula.render(<App value={2} />, container);
    expect(container.querySelector('p').innerHTML).toBe('Context: 2, Num: 0');
    expect(LogUtils.getAndClear()).toEqual([
      'Consumer',
      'ReturnDom'
    ]);
    setNum(3);
    expect(container.querySelector('p').innerHTML).toBe('Context: 2, Num: 3');
    expect(LogUtils.getAndClear()).toEqual(['ReturnDom']);
  });


  it('consumer可以拿到其他context的值', () => {
    const NumContext = Inula.createContext(1);
    const TypeContext = Inula.createContext('typeA');

    const NumAndType = () => {
      const type = Inula.useContext(TypeContext);
      return (
        <NumContext.Consumer>
          {value => {
            LogUtils.log('Consumer');
            return <p>{`Num: ${value}, Type: ${type}`}</p>;
          }}
        </NumContext.Consumer>
      );
    };

    const App = props => {
      return (
        <NumContext.Provider value={props.num}>
          <TypeContext.Provider value={props.type}>
            <NumAndType />
          </TypeContext.Provider>
        </NumContext.Provider>
      );
    };

    Inula.render(<App num={2} type={'typeB'} />, container);
    expect(container.querySelector('p').innerHTML).toBe('Num: 2, Type: typeB');

    Inula.render(<App num={2} type={'typeR'} />, container);
    expect(container.querySelector('p').innerHTML).toBe('Num: 2, Type: typeR');

    Inula.render(<App num={8} type={'typeR'} />, container);
    expect(container.querySelector('p').innerHTML).toBe('Num: 8, Type: typeR');
  });

  // antd menu 级连context场景，menu路径使用级联context实现
  it('nested context', () => {
    const NestedContext = Inula.createContext([]);
    let updateContext;

    function App() {
      const [state, useState] = Inula.useState([]);
      updateContext = useState;
      return (
        <NestedContext.Provider value={state}>
          <Sub1 />
          <Sub2 />
        </NestedContext.Provider>
      );
    }

    const div1Ref = Inula.createRef();
    const div2Ref = Inula.createRef();

    let updateSub1;
    function Sub1() {
      const path = Inula.useContext(NestedContext);
      const [_, setState] = Inula.useState({});
      updateSub1 = () => setState({});
      return (
        <NestedContext.Provider value={[...path, 1]}>
          <Son divRef={div1Ref} />
        </NestedContext.Provider>
      );
    }

    function Sub2() {
      const path = Inula.useContext(NestedContext);

      return (
        <NestedContext.Provider value={[...path, 2]}>
          <Sub3 />
        </NestedContext.Provider>
      );
    }

    function Sub3() {
      const path = Inula.useContext(NestedContext);

      return (
        <NestedContext.Provider value={[...path, 3]}>
          <Son divRef={div2Ref} />
        </NestedContext.Provider>
      );
    }

    function Son({ divRef }) {
      const path = Inula.useContext(NestedContext);
      return (
        <NestedContext.Provider value={path}>
          <div ref={divRef}>{path.join(',')}</div>
        </NestedContext.Provider>
      );
    }

    Inula.render(<App />, container);
    updateSub1();
    expect(div1Ref.current.innerHTML).toEqual('1');
    expect(div2Ref.current.innerHTML).toEqual('2,3');

    updateContext([0]);
    expect(div1Ref.current.innerHTML).toEqual('0,1');
    expect(div2Ref.current.innerHTML).toEqual('0,2,3');

    // 局部更新Sub1
    updateSub1();
    expect(div1Ref.current.innerHTML).toEqual('0,1');
    expect(div2Ref.current.innerHTML).toEqual('0,2,3');
  });
});
