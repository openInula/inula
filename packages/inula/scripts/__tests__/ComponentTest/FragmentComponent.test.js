/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
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

import * as Inula from '../../../src/index';
import { Text } from '../jest/commonComponents';
import { getLogUtils } from '../jest/testUtils';

describe('Fragment', () => {
  const LogUtils = getLogUtils();
  const { useEffect, useRef, act } = Inula;
  it('可以渲染空元素', () => {
    const element = <Inula.Fragment />;

    Inula.render(element, container);

    expect(container.textContent).toBe('');
  });
  it('可以渲染单个元素', () => {
    const element = (
      <Inula.Fragment>
        <Text text="Fragment" />
      </Inula.Fragment>
    );

    Inula.render(element, container);

    expect(LogUtils.getAndClear()).toEqual(['Fragment']);
    expect(container.textContent).toBe('Fragment');
  });

  it('可以渲染混合元素', () => {
    const element = (
      <Inula.Fragment>
        Java and <Text text="JavaScript" />
      </Inula.Fragment>
    );

    Inula.render(element, container);

    expect(LogUtils.getAndClear()).toEqual(['JavaScript']);
    expect(container.textContent).toBe('Java and JavaScript');
  });

  it('可以渲染集合元素', () => {
    const App = [<Text text="Java" />, <Text text="JavaScript" />];
    const element = <>{App}</>;

    Inula.render(element, container);

    expect(LogUtils.getAndClear()).toEqual(['Java', 'JavaScript']);
    expect(container.textContent).toBe('JavaJavaScript');
  });

  it('元素被放进不同层级Fragment里时,状态不会保留', () => {
    const ChildApp = props => {
      const flag = useRef(true);
      useEffect(() => {
        if (flag.current) {
          flag.current = false;
        } else {
          LogUtils.log('useEffect');
        }
      });

      return <p>{props.logo}</p>;
    };

    const App = props => {
      return props.change ? (
        <>
          <ChildApp logo={1} />
        </>
      ) : (
        <>
          <>
            <ChildApp logo={2} />
          </>
        </>
      );
    };

    act(() => {
      Inula.render(<App change={true} />, container);
    });
    expect(LogUtils.getNotClear()).toEqual([]);
    act(() => {
      Inula.render(<App change={false} />, container);
    });
    // 切换到不同层级Fragment时，副作用状态不会保留
    expect(LogUtils.getNotClear()).toEqual([]);
    expect(container.textContent).toBe('2');

    act(() => {
      Inula.render(<App change={true} />, container);
    });
    expect(LogUtils.getNotClear()).toEqual([]);
    expect(container.textContent).toBe('1');
  });

  it('元素被放进单层Fragment里,且在Fragment的顶部时,状态会保留', () => {
    const ChildApp = props => {
      const flag = useRef(true);
      useEffect(() => {
        if (flag.current) {
          flag.current = false;
        } else {
          LogUtils.log('useEffect');
        }
      });

      return <p>{props.logo}</p>;
    };

    const App = props => {
      return props.change ? (
        <ChildApp logo={1} />
      ) : (
        <>
          <ChildApp logo={2} />
        </>
      );
    };

    act(() => {
      Inula.render(<App change={true} />, container);
    });
    expect(LogUtils.getNotClear()).toEqual([]);
    act(() => {
      Inula.render(<App change={false} />, container);
    });
    // 状态会保留
    expect(LogUtils.getNotClear()).toEqual(['useEffect']);
    expect(container.textContent).toBe('2');

    act(() => {
      Inula.render(<App change={true} />, container);
    });
    expect(LogUtils.getNotClear()).toEqual(['useEffect', 'useEffect']);
    expect(container.textContent).toBe('1');
  });

  it('元素被放进单层Fragment里,但不在Fragment的顶部时,状态不会保留', () => {
    const ChildApp = props => {
      const flag = useRef(true);
      useEffect(() => {
        if (flag.current) {
          flag.current = false;
        } else {
          LogUtils.log('useEffect');
        }
      });

      return <p>{props.logo}</p>;
    };

    const App = props => {
      return props.change ? (
        <ChildApp logo={1} />
      ) : (
        <>
          <div>123</div>
          <ChildApp logo={2} />
        </>
      );
    };

    act(() => {
      Inula.render(<App change={true} />, container);
    });
    expect(LogUtils.getNotClear()).toEqual([]);
    act(() => {
      Inula.render(<App change={false} />, container);
    });
    // 状态不会保留
    expect(LogUtils.getNotClear()).toEqual([]);
    expect(container.textContent).toBe('1232');

    act(() => {
      Inula.render(<App change={true} />, container);
    });
    expect(LogUtils.getNotClear()).toEqual([]);
    expect(container.textContent).toBe('1');
  });

  it('元素被放进多层Fragment里时,状态不会保留', () => {
    const ChildApp = props => {
      const flag = useRef(true);
      useEffect(() => {
        if (flag.current) {
          flag.current = false;
        } else {
          LogUtils.log('useEffect');
        }
      });

      return <p>{props.logo}</p>;
    };

    const App = props => {
      return props.change ? (
        <ChildApp logo={1} />
      ) : (
        <>
          <>
            <>
              <ChildApp logo={2} />
            </>
          </>
        </>
      );
    };

    act(() => {
      Inula.render(<App change={true} />, container);
    });
    expect(LogUtils.getNotClear()).toEqual([]);
    act(() => {
      Inula.render(<App change={false} />, container);
    });
    // 状态不会保留
    expect(LogUtils.getNotClear()).toEqual([]);
    expect(container.textContent).toBe('2');

    act(() => {
      Inula.render(<App change={true} />, container);
    });
    expect(LogUtils.getNotClear()).toEqual([]);
    expect(container.textContent).toBe('1');
  });

  it('元素被切换放进同级Fragment里时,状态会保留', () => {
    const ChildApp = props => {
      const flag = useRef(true);
      useEffect(() => {
        if (flag.current) {
          flag.current = false;
        } else {
          LogUtils.log('useEffect');
        }
      });

      return <p>{props.logo}</p>;
    };

    const App = props => {
      return props.change ? (
        <>
          <>
            <>
              <ChildApp logo={1} />
            </>
          </>
        </>
      ) : (
        <>
          <>
            <>
              <ChildApp logo={2} />
            </>
          </>
        </>
      );
    };

    act(() => {
      Inula.render(<App change={true} />, container);
    });
    expect(LogUtils.getNotClear()).toEqual([]);
    act(() => {
      Inula.render(<App change={false} />, container);
    });
    // 状态会保留
    expect(LogUtils.getNotClear()).toEqual(['useEffect']);
    expect(container.textContent).toBe('2');

    act(() => {
      Inula.render(<App change={true} />, container);
    });
    expect(LogUtils.getNotClear()).toEqual(['useEffect', 'useEffect']);
    expect(container.textContent).toBe('1');
  });

  it('元素被切换放进同级Fragment,且在数组顶层时,状态会保留', () => {
    const ChildApp = props => {
      const flag = useRef(true);
      useEffect(() => {
        if (flag.current) {
          flag.current = false;
        } else {
          LogUtils.log('useEffect');
        }
      });

      return <p>{props.logo}</p>;
    };

    const App = props => {
      return props.change ? (
        <>
          <>
            <>
              <ChildApp logo={1} />
            </>
          </>
        </>
      ) : (
        <>
          <>
            <>{[<ChildApp logo={2} />]}</>
          </>
        </>
      );
    };

    act(() => {
      Inula.render(<App change={true} />, container);
    });
    expect(LogUtils.getNotClear()).toEqual([]);
    act(() => {
      Inula.render(<App change={false} />, container);
    });
    // 状态会保留
    expect(LogUtils.getNotClear()).toEqual(['useEffect']);
    expect(container.textContent).toBe('2');

    act(() => {
      Inula.render(<App change={true} />, container);
    });
    expect(LogUtils.getNotClear()).toEqual(['useEffect', 'useEffect']);
    expect(container.textContent).toBe('1');
  });

  it('数组里的顶层元素被切换放进单级Fragment时,状态会保留', () => {
    const ChildApp = props => {
      const flag = useRef(true);
      useEffect(() => {
        if (flag.current) {
          flag.current = false;
        } else {
          LogUtils.log('useEffect');
        }
      });

      return <p>{props.logo}</p>;
    };

    const App = props => {
      return props.change ? (
        [<ChildApp logo={1} />]
      ) : (
        <>
          <ChildApp logo={2} />
        </>
      );
    };

    act(() => {
      Inula.render(<App change={true} />, container);
    });
    expect(LogUtils.getNotClear()).toEqual([]);
    act(() => {
      Inula.render(<App change={false} />, container);
    });
    // 状态会保留
    expect(LogUtils.getNotClear()).toEqual(['useEffect']);
    expect(container.textContent).toBe('2');

    act(() => {
      Inula.render(<App change={true} />, container);
    });
    expect(LogUtils.getNotClear()).toEqual(['useEffect', 'useEffect']);
    expect(container.textContent).toBe('1');
  });

  it('Fragment里的顶层数组里的顶层元素被切换放进不同级Fragment时,状态不会保留', () => {
    const ChildApp = props => {
      const flag = useRef(true);
      useEffect(() => {
        if (flag.current) {
          flag.current = false;
        } else {
          LogUtils.log('useEffect');
        }
      });

      return <p>{props.logo}</p>;
    };

    const App = props => {
      return props.change ? (
        <>
          [<ChildApp logo={1} />]
        </>
      ) : (
        <>
          <>
            <ChildApp logo={2} />
          </>
        </>
      );
    };

    act(() => {
      Inula.render(<App change={true} />, container);
    });
    expect(LogUtils.getNotClear()).toEqual([]);
    act(() => {
      Inula.render(<App change={false} />, container);
    });
    // 状态会保留
    expect(LogUtils.getNotClear()).toEqual([]);
    expect(container.textContent).toBe('2');

    act(() => {
      Inula.render(<App change={true} />, container);
    });
    expect(LogUtils.getNotClear()).toEqual([]);
    expect(container.textContent).toBe('[1]');
  });

  it('Fragment的key值不同时,状态不会保留', () => {
    const ChildApp = props => {
      const flag = useRef(true);
      useEffect(() => {
        if (flag.current) {
          flag.current = false;
        } else {
          LogUtils.log('useEffect');
        }
      });

      return <p>{props.logo}</p>;
    };

    const App = props => {
      return props.change ? (
        <Inula.Fragment key="hf">
          <ChildApp logo={1} />
        </Inula.Fragment>
      ) : (
        <Inula.Fragment key="nhf">
          <ChildApp logo={2} />
        </Inula.Fragment>
      );
    };

    act(() => {
      Inula.render(<App change={true} />, container);
    });
    expect(LogUtils.getNotClear()).toEqual([]);
    act(() => {
      Inula.render(<App change={false} />, container);
    });
    // 状态不会保留
    expect(LogUtils.getNotClear()).toEqual([]);
    expect(container.textContent).toBe('2');

    act(() => {
      Inula.render(<App change={true} />, container);
    });
    expect(LogUtils.getNotClear()).toEqual([]);
    expect(container.textContent).toBe('1');
  });

  it('Fragment 设置相同的key不会重新渲染组件', () => {
    const { useState, useRef, act, Fragment } = Inula;
    let setFn;
    const didMount = jest.fn();
    const didUpdate = jest.fn();

    const App = () => {
      const [list, setList] = useState([
        { text: 'Apple', id: 1 },
        { text: 'Banana', id: 2 },
      ]);
      setFn = setList;

      return (
        <>
          {list.map(item => {
            return (
              <Fragment key={item.id}>
                <Child val={item.text}></Child>
              </Fragment>
            );
          })}
        </>
      );
    };

    const Child = ({ val }) => {
      const mount = useRef(false);
      useEffect(() => {
        if (!mount.current) {
          didMount();
          mount.current = true;
        } else {
          didUpdate();
        }
      });

      return <div>{val}</div>;
    };

    act(() => {
      Inula.render(<App />, container);
    });

    expect(didMount).toHaveBeenCalledTimes(2);
    act(() => {
      setFn([
        { text: 'Apple', id: 1 },
        { text: 'Banana', id: 2 },
        { text: 'Grape', id: 3 },
      ]);
    });
    // 数组前两项Key不变子组件<Child/>不会执行生命周期函数ComponentDidMount，只有第三个子组件会执行ComponentDidMount
    // 因此didMount执行3次，didUpdate执行两次
    expect(didMount).toHaveBeenCalledTimes(3);
    expect(didUpdate).toHaveBeenCalledTimes(2);
  });
});
