import * as React from '../../../libs/horizon/src/external/Horizon';
import * as HorizonDOM from '../../../libs/horizon/src/dom/DOMExternal';
import * as LogUtils from '../jest/logUtils';
import { act } from '../jest/customMatcher';

describe('useEffect Hook Test', () => {
  const { useEffect, useLayoutEffect, useState, memo } = React;
  const { unmountComponentAtNode } = HorizonDOM;
  let container = null;
  beforeEach(() => {
    LogUtils.clear();
    // 创建一个 DOM 元素作为渲染目标
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // 退出时进行清理
    unmountComponentAtNode(container);
    container.remove();
    container = null;
    LogUtils.clear();
  });

  const Text = (props) => {
    LogUtils.log(props.text);
    return <p>{props.text}</p>;
  }

  it('兄弟节点被删除，useEffect依然正常', () => {
    const App = () => {
      return <Text text="App" />;
    }
    const NewApp = () => {
      useEffect(() => {
        LogUtils.log(`NewApp effect`);
      }, []);
      return <Text text="NewApp" />;
    }
    const na = <NewApp />;
    // <App />必须设置key值，否则在diff的时候na会被视为不同组件
    HorizonDOM.render([<App key="app" />, na], container);
    expect(LogUtils.getAndClear()).toEqual([
      'App',
      'NewApp'
    ]);
    expect(container.textContent).toBe('AppNewApp');
    expect(LogUtils.getAndClear()).toEqual([]);
    // 在执行新的render前，会执行完上一次render的useEffect，所以LogUtils会加入'NewApp effect'。
    HorizonDOM.render([na], container);
    expect(LogUtils.getAndClear()).toEqual(['NewApp effect']);
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
    }
    const NewApp = () => {
      useEffect(() => {
        LogUtils.log(`NewApp effect`);
      }, []);
      return <Text text="NewApp" />;
    }
    // <App />必须设置key值，否则在diff的时候na会被视为不同组件
    HorizonDOM.render([<App key="app" />, <NewApp />], container);
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
        HorizonDOM.render(<Text text="NewContainer" />, newContainer);
      });
      return <Text text="App" />;
    }
    const NewApp = () => {
      useEffect(() => {
        LogUtils.log(`NewApp effect`);
      }, []);
      return <Text text="NewApp" />;
    }
    // <App />必须设置key值，否则在diff的时候na会被视为不同组件
    HorizonDOM.render([<App key="app" />, <NewApp />], container);
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
    }
    act(() => {
      HorizonDOM.render(<App num={0} />, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual(['num: 0', 'callback effect']);
      expect(container.textContent).toEqual('num: 0');
      HorizonDOM.render(<App num={1} />, container, () => LogUtils.log('callback effect'));
      // 执行新的render前，会执行旧render的useEffect，所以会添加'First effect [0]'
      expect(LogUtils.getAndClear()).toEqual(['First effect [0]', 'num: 1', 'callback effect']);
      expect(container.textContent).toEqual('num: 1');
    })
    // 最后在act执行完后会执行新render的useEffect
    expect(LogUtils.getAndClear()).toEqual(['First effect [1]']);
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
    }
    act(() => {
      HorizonDOM.render(<App num={0} />, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual(['num: 0', 'callback effect']);
      expect(container.textContent).toEqual('num: 0');
    })
    expect(LogUtils.getAndClear()).toEqual(['First effect [0]', 'Second effect [0]']);
    act(() => {
      HorizonDOM.render(<App num={1} />, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual(['num: 1', 'callback effect']);
      expect(container.textContent).toEqual('num: 1');
    })
    expect(LogUtils.getAndClear()).toEqual(['First effect [1]', 'Second effect [1]']);
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
    }

    act(() => {
      HorizonDOM.render(<App num={0} word={'App'} />, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual([
        'num: 0,word: App',
        'num Layouteffect [0]',
        'word Layouteffect [App]',
        'callback effect'
      ]);
    })
    expect(LogUtils.getAndClear()).toEqual([
      'num effect [0]',
      'word effect [App]',
    ]);

    act(() => {
      // 此时word改变，num不变
      HorizonDOM.render(<App num={0} word={'React'} />, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual([
        'num: 0,word: React',
        'word Layouteffect destroy',
        'word Layouteffect [React]',
        'callback effect'
      ]);
    });
    expect(LogUtils.getAndClear()).toEqual([
      'word effect destroy',
      'word effect [React]',
    ]);

    act(() => {
      // 此时num和word的所有effect都销毁
      HorizonDOM.render(null, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual([
        'num Layouteffect destroy',
        'word Layouteffect destroy',
        'callback effect'
      ]);
    });
    expect(LogUtils.getAndClear()).toEqual([
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
    }

    act(() => {
      HorizonDOM.render(<App num={0} />, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual([
        'num: 0',
        'callback effect'
      ]);
      expect(container.textContent).toEqual('num: 0');
    })
    expect(LogUtils.getAndClear()).toEqual([
      'num effect [0]',
    ]);

    act(() => {
      HorizonDOM.render(<App num={1} />, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual([
        'num: 1',
        'callback effect'
      ]);
      expect(container.textContent).toEqual('num: 1');
    });
    expect(LogUtils.getAndClear()).toEqual([
      'num effect destroy',
      'num effect [1]',
    ]);

    act(() => {
      HorizonDOM.render(null, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual([
        'callback effect'
      ]);
      expect(container.textContent).toEqual('');
    });
    expect(LogUtils.getAndClear()).toEqual([
      'num effect destroy'
    ]);
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
    }

    act(() => {
      HorizonDOM.render(<App num={0} />, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual([
        'num: 0',
        'callback effect'
      ]);
      expect(container.textContent).toEqual('num: 0');
    })
    expect(LogUtils.getAndClear()).toEqual([
      'num effect [0]',
    ]);

    act(() => {
      HorizonDOM.render(<App num={1} />, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual([
        'num: 1',
        'callback effect'
      ]);
      expect(container.textContent).toEqual('num: 1');
    });
    // 没有执行useEffect
    expect(LogUtils.getAndClear()).toEqual([]);

    act(() => {
      HorizonDOM.render(null, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual([
        'callback effect'
      ]);
      expect(container.textContent).toEqual('');
    });
    expect(LogUtils.getAndClear()).toEqual([
      'num effect destroy'
    ]);
  });

  it('useEffect里使用useState(1', () => {
    let setNum;
    const App = () => {
      const [num, _setNum] = React.useState(0);
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
    }

    act(() => {
      HorizonDOM.render(<App num={0} />, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual([
        'num: 0',
        'num Layouteffect [0]',
        'callback effect'
      ]);
    })
    expect(LogUtils.getAndClear()).toEqual([
      'num effect [0]',
    ]);

    act(() => {
      setNum();
      expect(LogUtils.getAndClear()).toEqual([
        'num: 1'
      ]);
    });
    expect(LogUtils.getAndClear()).toEqual(['num effect [1]']);
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
    }

    HorizonDOM.render(<App />, container, () => LogUtils.log('Sync effect'));
    expect(LogUtils.getAndClear()).toEqual(['Num: 0', 'Sync effect']);
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

  it('useEffect与memo一起使用', () => {
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
    })
    act(() => {
      HorizonDOM.render(<App />, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual([
        0,
        'callback effect'
      ]);
      expect(container.textContent).toEqual('0');
    });
    expect(LogUtils.getAndClear()).toEqual(['num effect [0]']);

    // 不会重新渲染
    act(() => {
      HorizonDOM.render(<App />, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual(['callback effect']);
      expect(container.textContent).toEqual('0');
    });
    expect(LogUtils.getAndClear()).toEqual([]);

    // 会重新渲染
    act(() => {
      setNum(1);
      expect(LogUtils.getAndClear()).toEqual([1]);
      expect(container.textContent).toEqual('1');
    });
    expect(LogUtils.getAndClear()).toEqual([
      'num effect destroy 0',
      'num effect [1]'
    ]);

    act(() => {
      HorizonDOM.render(null, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual(['callback effect']);
      expect(container.textContent).toEqual('');
    });
    expect(LogUtils.getAndClear()).toEqual(['num effect destroy 1']);
  });

})
