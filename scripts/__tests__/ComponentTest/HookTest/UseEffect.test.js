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
import { getLogUtils } from '../../jest/testUtils';
import { Text } from '../../jest/commonComponents';

describe('useEffect Hook Test', () => {
  const {
    useEffect,
    useLayoutEffect,
    useState,
    memo,
    forwardRef,
    act,
  } = Inula;

  const LogUtils = getLogUtils();
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
      );
    };
    Inula.render(<App />, container);
    expect(document.getElementById('p').style.display).toBe('block');
    // 点击按钮触发num加1
    container.querySelector('button').click();

    expect(document.getElementById('p').style.display).toBe('none');
    container.querySelector('button').click();
    expect(container.querySelector('p').style.display).toBe('inline');
  });

  it('act方法', () => {
    const App = () => {
      return <Text text={'op'} />;
    };

    act(() => {
      Inula.render(<App />, container, () => {
        LogUtils.log('num effect');
      });
      // 第一次渲染为同步，所以同步执行的可以写在act里做判断
      expect(LogUtils.getAndClear()).toEqual(['op', 'num effect']);
      expect(container.textContent).toBe('op');
    });
    act(() => {
      Inula.render(null, container, () => {
        LogUtils.log('num effect89');
      });
      // 第二次渲染为异步，所以同步执行的不可以写在act里做判断，act里拿到的为空数组
      expect(LogUtils.getAndClear()).toEqual([]);
    });
    expect(LogUtils.getAndClear()).toEqual(['num effect89']);
    expect(container.textContent).toBe('');
  });

  it('兄弟节点被删除，useEffect依然正常', () => {
    const App = () => {
      return <Text text="App" />;
    };
    const NewApp = () => {
      useEffect(() => {
        LogUtils.log(`NewApp effect`);
      }, []);
      return <Text text="NewApp" />;
    };
    const na = <NewApp />;
    // <App />必须设置key值，否则在diff的时候na会被视为不同组件
    Inula.render([<App key="app" />, na], container);
    expect(LogUtils.getAndClear()).toEqual([
      'App',
      'NewApp'
    ]);
    expect(container.textContent).toBe('AppNewApp');
    expect(LogUtils.getAndClear()).toEqual([]);
    // 在执行新的render前，会执行完上一次render的useEffect，所以LogUtils会加入'NewApp effect'。
    Inula.render([na], container);
    expect(LogUtils.getAndClear()).toEqual(['NewApp effect', 'NewApp']);
    expect(container.textContent).toBe('NewApp');
    expect(LogUtils.getAndClear()).toEqual([]);
  });

  it('兄弟节点更新，useEffect依然正常', () => {
    const App = () => {
      const [num, setNum] = useState(0);
      useLayoutEffect(() => {
        if (num === 0) {
          setNum(1);
        }
        LogUtils.log('App Layout effect ' + num);
      });
      return <Text text="App" />;
    };
    const NewApp = () => {
      useEffect(() => {
        LogUtils.log(`NewApp effect`);
      }, []);
      return <Text text="NewApp" />;
    };
    // <App />必须设置key值，否则在diff的时候na会被视为不同组件
    Inula.render([<App key="app" />, <NewApp />], container);
    expect(LogUtils.getAndClear()).toEqual([
      'App',
      'NewApp',
      'App Layout effect 0',
      // 在App更新前，会执行完NewApp的useEffect
      'NewApp effect',
      'App',
      'App Layout effect 1',
    ]);
    expect(container.textContent).toBe('AppNewApp');
  });

  it('兄弟节点执行新的挂载动作，useEffect依然正常', () => {
    const newContainer = document.createElement('div');
    const App = () => {
      useLayoutEffect(() => {
        LogUtils.log('App Layout effect');
        Inula.render(<Text text="NewContainer" />, newContainer);
      });
      return <Text text="App" />;
    };
    const NewApp = () => {
      useEffect(() => {
        LogUtils.log(`NewApp effect`);
      }, []);
      return <Text text="NewApp" />;
    };
    // <App />必须设置key值，否则在diff的时候na会被视为不同组件
    Inula.render([<App key="app" />, <NewApp />], container);
    expect(LogUtils.getAndClear()).toEqual([
      'App',
      'NewApp',
      'App Layout effect',
      // 在执行useLayoutEffectApp的render前，会执行完NewApp的useEffect
      'NewApp effect',
      'NewContainer',
    ]);
    expect(container.textContent).toBe('AppNewApp');
  });

  it('执行新render的useEffect前会先执行旧render的useEffect', () => {
    const App = (props) => {
      useEffect(() => {
        LogUtils.log(`First effect [${props.num}]`);
      });
      return <Text text={'num: ' + props.num} />;
    };
    act(() => {
      Inula.render(<App num={0} />, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual(['num: 0', 'callback effect']);
      expect(container.textContent).toEqual('num: 0');
    });
    expect(LogUtils.getAndClear()).toEqual(['First effect [0]']);
    act(() => {
      Inula.render(<App num={1} />, container, () => LogUtils.log('callback effect'));

    });
    // 此时异步执行，act执行完后会执行新render的useEffect
    expect(LogUtils.getAndClear()).toEqual([
      'num: 1',
      'callback effect',
      'First effect [1]'
    ]);
    expect(container.textContent).toEqual('num: 1');
  });

  it('混合使用useEffect', () => {
    const App = (props) => {
      useEffect(() => {
        LogUtils.log(`First effect [${props.num}]`);
      });
      useEffect(() => {
        LogUtils.log(`Second effect [${props.num}]`);
      });
      return <Text text={'num: ' + props.num} />;
    };
    act(() => {
      Inula.render(<App num={0} />, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual(['num: 0', 'callback effect']);
      expect(container.textContent).toEqual('num: 0');
    });
    expect(LogUtils.getAndClear()).toEqual(['First effect [0]', 'Second effect [0]']);
    act(() => {
      Inula.render(<App num={1} />, container, () => LogUtils.log('callback effect'));
    });
    // 第二次render时异步执行，act保证所有效果都已更新，所以先常规记录日志
    // 然后记录useEffect的日志
    expect(LogUtils.getAndClear()).toEqual([
      'num: 1',
      'callback effect',
      'First effect [1]',
      'Second effect [1]'
    ]);
    expect(container.textContent).toEqual('num: 1');
  });

  it('创建，销毁useEffect', () => {
    const App = (props) => {
      useEffect(() => {
        LogUtils.log(`num effect [${props.num}]`);
        return () => {
          LogUtils.log('num effect destroy');
        };
      }, [props.num]);
      useEffect(() => {
        LogUtils.log(`word effect [${props.word}]`);
        return () => {
          LogUtils.log('word effect destroy');
        };
      }, [props.word]);
      useLayoutEffect(() => {
        LogUtils.log(`num Layouteffect [${props.num}]`);
        return () => {
          LogUtils.log('num Layouteffect destroy');
        };
      }, [props.num]);
      useLayoutEffect(() => {
        LogUtils.log(`word Layouteffect [${props.word}]`);
        return () => {
          LogUtils.log('word Layouteffect destroy');
        };
      }, [props.word]);
      return <Text text={'num: ' + props.num + ',word: ' + props.word} />;
    };

    act(() => {
      Inula.render(<App num={0} word={'App'} />, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual([
        'num: 0,word: App',
        'num Layouteffect [0]',
        'word Layouteffect [App]',
        'callback effect'
      ]);
    });
    expect(LogUtils.getAndClear()).toEqual([
      'num effect [0]',
      'word effect [App]',
    ]);

    act(() => {
      // 此时word改变，num不变
      Inula.render(<App num={0} word={'Inula'} />, container, () => LogUtils.log('callback effect'));
    });
    expect(LogUtils.getAndClear()).toEqual([
      'num: 0,word: Inula',
      'word Layouteffect destroy',
      'word Layouteffect [Inula]',
      'callback effect',
      // 最后执行异步的
      'word effect destroy',
      'word effect [Inula]',
    ]);

    act(() => {
      // 此时num和word的所有effect都销毁
      Inula.render(null, container, () => LogUtils.log('callback effect'));
    });
    expect(LogUtils.getAndClear()).toEqual([
      'num Layouteffect destroy',
      'word Layouteffect destroy',
      'callback effect',
      // 最后执行异步useEffect
      'num effect destroy',
      'word effect destroy',
    ]);
  });

  it('销毁不含依赖数组的useEffect', () => {
    const App = (props) => {
      useEffect(() => {
        LogUtils.log(`num effect [${props.num}]`);
        return () => {
          LogUtils.log('num effect destroy');
        };
      });
      return <Text text={'num: ' + props.num} />;
    };

    act(() => {
      Inula.render(<App num={0} />, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual([
        'num: 0',
        'callback effect'
      ]);
      expect(container.textContent).toEqual('num: 0');
    });
    expect(LogUtils.getAndClear()).toEqual([
      'num effect [0]',
    ]);

    act(() => {
      Inula.render(<App num={1} />, container, () => LogUtils.log('callback effect'));
    });
    expect(LogUtils.getAndClear()).toEqual([
      'num: 1',
      'callback effect',
      // 最后执行异步
      'num effect destroy',
      'num effect [1]',
    ]);
    expect(container.textContent).toEqual('num: 1');
    expect(LogUtils.getAndClear()).toEqual([]);

    act(() => {
      Inula.render(null, container, () => LogUtils.log('callback effect'));
    });
    expect(LogUtils.getAndClear()).toEqual([
      'callback effect',
      'num effect destroy'
    ]);
    expect(container.textContent).toEqual('');
    expect(LogUtils.getAndClear()).toEqual([]);
  });

  it('销毁依赖空数组的useEffect', () => {
    const App = (props) => {
      useEffect(() => {
        LogUtils.log(`num effect [${props.num}]`);
        return () => {
          LogUtils.log('num effect destroy');
        };
      }, []);
      return <Text text={'num: ' + props.num} />;
    };

    act(() => {
      Inula.render(<App num={0} />, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual([
        'num: 0',
        'callback effect'
      ]);
      expect(container.textContent).toEqual('num: 0');
    });
    expect(LogUtils.getAndClear()).toEqual([
      'num effect [0]',
    ]);

    act(() => {
      Inula.render(<App num={1} />, container, () => LogUtils.log('callback effect'));
    });
    expect(LogUtils.getAndClear()).toEqual([
      'num: 1',
      'callback effect'
      // 依赖空数组，没有执行useEffect
    ]);
    expect(container.textContent).toEqual('num: 1');
    expect(LogUtils.getAndClear()).toEqual([]);

    act(() => {
      Inula.render(null, container, () => LogUtils.log('callback effect'));
    });
    expect(LogUtils.getAndClear()).toEqual([
      'callback effect',
      'num effect destroy'
    ]);
    expect(container.textContent).toEqual('');
    expect(LogUtils.getAndClear()).toEqual([]);
  });

  it('useEffect里使用useState(1', () => {
    let setNum;
    const App = () => {
      const [num, _setNum] = Inula.useState(0);
      useEffect(() => {
        LogUtils.log(`num effect [${num}]`);
        setNum = () => _setNum(1);
      }, [num]);
      useLayoutEffect(() => {
        LogUtils.log(`num Layouteffect [${num}]`);
        return () => {
          LogUtils.log('num Layouteffect destroy');
        };
      }, []);
      return <Text text={'num: ' + num} />;
    };

    act(() => {
      Inula.render(<App num={0} />, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual([
        'num: 0',
        'num Layouteffect [0]',
        'callback effect'
      ]);
    });
    expect(LogUtils.getAndClear()).toEqual([
      'num effect [0]',
    ]);

    act(() => {
      setNum();
    });
    expect(LogUtils.getAndClear()).toEqual([
      'num: 1',
      'num effect [1]'
    ]);
    expect(LogUtils.getAndClear()).toEqual([]);
  });

  it('useEffect里使用useState(2', () => {
    let setNum;
    const App = () => {
      const [num, _setNum] = useState(0);
      setNum = _setNum;
      useEffect(() => {
        LogUtils.log(`App effect`);
        setNum(1);
      }, []);
      return <Text text={'Num: ' + num} />;
    };

    Inula.render(<App />, container, () => LogUtils.log('App callback effect'));
    expect(LogUtils.getAndClear()).toEqual(['Num: 0', 'App callback effect']);
    expect(container.textContent).toEqual('Num: 0');
    act(() => {
      setNum(2);
    });

    // 虽然执行了setNum(2)，但执行到setNum(1)，所以最终num为1
    expect(LogUtils.getAndClear()).toEqual([
      'App effect',
      'Num: 1',
    ]);

    expect(container.textContent).toEqual('Num: 1');
  });

  it('useEffect与memo一起使用(1', () => {
    let setNum;
    const App = memo(() => {
      const [num, _setNum] = useState(0);
      setNum = _setNum;
      useEffect(() => {
        LogUtils.log(`num effect [${num}]`);
        return () => {
          LogUtils.log(`num effect destroy ${num}`);
        };
      });
      return <Text text={num} />;
    });
    act(() => {
      Inula.render(<App />, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual([
        0,
        'callback effect'
      ]);
      expect(container.textContent).toEqual('0');
    });
    expect(LogUtils.getAndClear()).toEqual(['num effect [0]']);

    // 不会重新渲染
    act(() => {
      Inula.render(<App />, container, () => LogUtils.log('callback effect'));
    });
    expect(LogUtils.getAndClear()).toEqual(['callback effect']);
    expect(container.textContent).toEqual('0');
    expect(LogUtils.getAndClear()).toEqual([]);

    // 会重新渲染
    act(() => {
      setNum(1);
    });
    expect(LogUtils.getAndClear()).toEqual([
      1,
      'num effect destroy 0',
      'num effect [1]'
    ]);
    expect(container.textContent).toEqual('1');
    expect(LogUtils.getAndClear()).toEqual([]);

    act(() => {
      Inula.render(null, container, () => LogUtils.log('callback effect'));
    });
    expect(LogUtils.getAndClear()).toEqual([
      'callback effect',
      'num effect destroy 1'
    ]);
    expect(container.textContent).toEqual('');
    expect(LogUtils.getAndClear()).toEqual([]);
  });

  it('useEffect与memo一起使用(2', () => {
    const compare = (prevProps, nextProps) => prevProps.num === nextProps.num;
    const App = memo((props) => {
      useEffect(() => {
        LogUtils.log(`num effect [${props.num}]`);
        return () => {
          LogUtils.log(`num effect destroy ${props.num}`);
        };
      });
      return <Text text={props.num} />;
    }, compare);
    act(() => {
      Inula.render(<App num={0} />, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual([
        0,
        'callback effect'
      ]);
      expect(container.textContent).toEqual('0');
    });
    expect(LogUtils.getAndClear()).toEqual(['num effect [0]']);

    // 不会重新渲染
    act(() => {
      Inula.render(<App num={0} />, container, () => LogUtils.log('callback effect'));
    });
    expect(LogUtils.getAndClear()).toEqual(['callback effect']);
    expect(container.textContent).toEqual('0');
    expect(LogUtils.getAndClear()).toEqual([]);

    // 会重新渲染
    act(() => {
      Inula.render(<App num={1} />, container, () => LogUtils.log('callback effect'));
    });
    expect(LogUtils.getAndClear()).toEqual([
      1,
      'callback effect',
      // 执行异步，先清除旧的，再执行新的
      'num effect destroy 0',
      'num effect [1]'
    ]);
    expect(container.textContent).toEqual('1');
    expect(LogUtils.getAndClear()).toEqual([]);

    act(() => {
      Inula.render(null, container, () => LogUtils.log('callback effect'));
    });
    expect(LogUtils.getAndClear()).toEqual(['callback effect', 'num effect destroy 1']);
    expect(container.textContent).toEqual('');
    expect(LogUtils.getAndClear()).toEqual([]);
  });

  it('useEffect处理错误', () => {
    const App = (props) => {
      useEffect(() => {
        LogUtils.log('throw Error');
        throw new Error('mistake');
        // eslint-disable-next-line no-unreachable
        LogUtils.log(`Mount with [${props.num}]`);
        return () => {
          LogUtils.log(`Unmount with [${props.num}]`);
        };
      });
      return <Text text={'Number: ' + props.num} />;
    };
    act(() => {
      Inula.render(<App num={0} />, container, () =>
        LogUtils.log('App callback effect'),
      );
      expect(LogUtils.getAndClear()).toEqual(['Number: 0', 'App callback effect']);
      expect(container.textContent).toEqual('Number: 0');
    });
    // 处理错误，不会向下执行LogUtils.log(`Mount with [${props.num}]`);
    expect(LogUtils.getAndClear()).toEqual(['throw Error']);

    act(() => {
      Inula.render(null, container, () =>
        LogUtils.log('App callback effect'),
      );
    });
    expect(LogUtils.getAndClear()).toEqual([
      'App callback effect',
      // 不会处理卸载部分 LogUtils.log(`Unmount with [${props.num}]`);
    ]);
    expect(container.textContent).toEqual('');
    expect(LogUtils.getAndClear()).toEqual([]);
  });

  it('卸载useEffect', () => {
    const App = (props) => {
      useEffect(() => {
        LogUtils.log(`num effect [${props.num}]`);
        return () => {
          LogUtils.log(`num effect destroy ${props.num}`);
        };
      }, []);
      if (props.num < 0) {
        useEffect(() => {
          LogUtils.log(`New num effect [${props.num}]`);
          return () => {
            LogUtils.log(`New num effect destroy ${props.num}`);
          };
        }, []);
      }
      return <Text text={`Number: ${props.num}`} />;
    };

    act(() => {
      Inula.render(<App num={0} />, container, () => LogUtils.log('num effect'));
      expect(LogUtils.getAndClear()).toEqual(['Number: 0', 'num effect']);
      expect(container.textContent).toBe('Number: 0');
    });
    expect(LogUtils.getAndClear()).toEqual(['num effect [0]']);

    act(() => {
      Inula.render(null, container, () => LogUtils.log('num effect'));
    });
    expect(LogUtils.getAndClear()).toEqual(['num effect', 'num effect destroy 0']);
    expect(container.textContent).toBe('');
    expect(LogUtils.getAndClear()).toEqual([]);
  });

  it('同步刷新不会导致effect执行', () => {
    let setNum;
    const App = () => {
      const [num, _setNum] = useState(0);
      setNum = _setNum;
      useEffect(() => {
        LogUtils.log(`num effect [${num}]`);
        _setNum(1);
      }, []);
      return <Text text={`Number: ${num}`} />;
    };

    Inula.render(<App />, container, () => LogUtils.log('num effect'));
    expect(LogUtils.getAndClear()).toEqual(['Number: 0', 'num effect']);
    expect(container.textContent).toBe('Number: 0');

    act(() => {
      // 模拟同步刷新
      (function () {
        setNum(2);
      })();
    });
    expect(LogUtils.getAndClear()).toEqual(['num effect [0]', 'Number: 1']);
    expect(container.textContent).toBe('Number: 1');
    expect(LogUtils.getAndClear()).toEqual([]);
  });

  it('当组件的更新方法在卸载函数中，组件更新不会告警', () => {
    const App = () => {
      LogUtils.log('useEffect');
      const [num, setNum] = useState(0);
      useEffect(() => {
        LogUtils.log('effect');
        return () => {
          setNum(1);
          LogUtils.log('effect destroy');
        };
      }, []);
      return num;
    };

    act(() => {
      Inula.render(<App />, container, () => LogUtils.log('num effect'));
      expect(LogUtils.getAndClear()).toEqual(['useEffect', 'num effect']);
    });
    expect(LogUtils.getAndClear()).toEqual(['effect']);

    act(() => {
      Inula.render(null, container);
    });
    // 不会处理setNum(1)
    expect(LogUtils.getAndClear()).toEqual(['effect destroy']);
  });

  it('当组件的更新方法在卸载函数中，组件的子组件更新不会告警', () => {
    const App = () => {
      LogUtils.log('App');
      const appRef = Inula.createRef(null);
      useEffect(() => {
        LogUtils.log('App effect');
        return () => {
          appRef.current(1);
          LogUtils.log('App effect destroy');
        };
      }, []);
      return <AppChild ref={appRef} />;
    };

    let AppChild = (props, ref) => {
      LogUtils.log('AppChild');
      const [num, setNum] = useState(0);
      useEffect(() => {
        LogUtils.log('Child effect');
        ref.current = setNum;
      }, []);
      return num;
    };
    AppChild = forwardRef(AppChild);

    act(() => {
      Inula.render(<App />, container, () => LogUtils.log('num effect'));
      expect(LogUtils.getAndClear()).toEqual([
        'App',
        'AppChild',
        'num effect'
      ]);
    });
    expect(LogUtils.getAndClear()).toEqual(['Child effect', 'App effect']);

    act(() => {
      Inula.render(null, container);
    });
    // 销毁时执行appRef.current(1)不会报错
    expect(LogUtils.getAndClear()).toEqual(['App effect destroy']);
  });

  it('当组件的更新方法在卸载函数中，组件的父组件更新不会告警', () => {
    const App = () => {
      LogUtils.log('App');
      const [num, setNum] = useState(0);
      return <AppChild num={num} setNum={setNum} />;
    };

    let AppChild = (props) => {
      LogUtils.log('AppChild');
      useEffect(() => {
        LogUtils.log('Child effect');
        return () => {
          LogUtils.log('Child effect destroy');
          props.setNum(1);
        };
      }, []);
      return props.num;
    };

    act(() => {
      Inula.render(<App />, container, () => LogUtils.log('num effect'));
      expect(LogUtils.getAndClear()).toEqual([
        'App',
        'AppChild',
        'num effect'
      ]);
    });
    expect(LogUtils.getAndClear()).toEqual(['Child effect']);

    act(() => {
      Inula.render(null, container);
    });
    // 销毁时执行 props.setNum(1);不会报错
    expect(LogUtils.getAndClear()).toEqual(['Child effect destroy']);
  });
});
