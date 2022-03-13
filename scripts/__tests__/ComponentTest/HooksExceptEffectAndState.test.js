import * as React from '../../../libs/horizon/src/external/Horizon';
import * as HorizonDOM from '../../../libs/horizon/src/dom/DOMExternal';
import * as LogUtils from '../jest/logUtils';
import { act } from '../jest/customMatcher';

describe('Hook Test', () => {
  const { useMemo, useRef, useState, useImperativeHandle, forwardRef, useLayoutEffect, useEffect } = React;
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

  describe('useLayoutEffect Test', () => {
    it('useLayoutEffect的触发时序', () => {
      const App = (props) => {
        useLayoutEffect(() => {
          LogUtils.log('LayoutEffect');
        });
        return <Text text={props.num} />;
      }
      HorizonDOM.render(<App num={1} />, container, () => LogUtils.log('Sync effect'));
      expect(LogUtils.getAndClear()).toEqual([
        1,
        // 同步在渲染之后
        'LayoutEffect',
        'Sync effect'
      ]);
      expect(container.querySelector('p').innerHTML).toBe('1');
      // 更新
      HorizonDOM.render(<App num={2} />, container, () => LogUtils.log('Sync effect'));
      expect(LogUtils.getAndClear()).toEqual([
        2,
        'LayoutEffect',
        'Sync effect'
      ]);
      expect(container.querySelector('p').innerHTML).toBe('2');
    });

    it('创建，销毁useLayoutEffect', () => {
      const App = (props) => {
        useEffect(() => {
          LogUtils.log(`num effect [${props.num}]`);
          return () => {
            LogUtils.log('num effect destroy');
          };
        }, [props.num]);
        useLayoutEffect(() => {
          LogUtils.log(`num Layouteffect [${props.num}]`);
          return () => {
            LogUtils.log(`num [${props.num}] Layouteffect destroy`);
          };
        }, [props.num]);
        return <Text text={'num: ' + props.num} />;
      }

      act(() => {
        HorizonDOM.render(<App num={0} />, container, () => LogUtils.log('callback effect'));
        expect(LogUtils.getAndClear()).toEqual([
          'num: 0',
          'num Layouteffect [0]',
          'callback effect'
        ]);
        expect(container.textContent).toBe('num: 0');
      })

      // 更新
      act(() => {
        HorizonDOM.render(<App num={1} />, container, () => LogUtils.log('callback effect'));
      })
      expect(LogUtils.getAndClear()).toEqual([
        // 异步effect
        'num effect [0]',
        'num: 1',
        // 旧Layouteffect销毁
        'num [0] Layouteffect destroy',
        // 新Layouteffect建立
        'num Layouteffect [1]',
        'callback effect',
        // 异步旧的effect销毁
        'num effect destroy',
        // 异步新的effect建立
        'num effect [1]'
      ]);

      act(() => {
        HorizonDOM.render(null, container, () => LogUtils.log('callback effect'));
      })
      expect(LogUtils.getAndClear()).toEqual([
        // 同步Layouteffect销毁
        'num [1] Layouteffect destroy',
        'callback effect',
        // 最后执行异步effect销毁
        'num effect destroy',
      ]);
    });
  })

  describe('useMemo Test', () => {
    it('触发useMemo', () => {
      const App = (props) => {
        const num = useMemo(() => {
          LogUtils.log(props._num);
          return props._num + 1;
        }, [props._num]);
        return <Text text={num} />;
      }
      HorizonDOM.render(<App _num={0} />, container);
      expect(LogUtils.getAndClear()).toEqual([
        0,
        1
      ]);
      expect(container.textContent).toBe('1');

      HorizonDOM.render(<App _num={1} />, container);
      expect(LogUtils.getAndClear()).toEqual([
        1,
        2
      ]);
      expect(container.textContent).toBe('2');

      HorizonDOM.render(<App _num={1} />, container);
      // 不会触发useMemo
      expect(LogUtils.getAndClear()).toEqual([2]);
      expect(container.textContent).toBe('2');

      HorizonDOM.render(<App _num={2} />, container);
      expect(LogUtils.getAndClear()).toEqual([
        2,
        3
      ]);
      expect(container.textContent).toBe('3');
    });

    it('输入不变，重新渲染也会触发useMemo', () => {
      const App = (props) => {
        const num = useMemo(props._num);
        return <Text text={num} />;
      }

      const num1 = () => {
        LogUtils.log('num 1');
        return 1;
      }

      const num2 = () => {
        LogUtils.log('num 2');
        return 2;
      }

      HorizonDOM.render(<App _num={num1} />, container);
      expect(LogUtils.getAndClear()).toEqual(['num 1', 1]);

      HorizonDOM.render(<App _num={num1} />, container);
      expect(LogUtils.getAndClear()).toEqual(['num 1', 1]);

      HorizonDOM.render(<App _num={num1} />, container);
      expect(LogUtils.getAndClear()).toEqual(['num 1', 1]);

      HorizonDOM.render(<App _num={num2} />, container);
      expect(LogUtils.getAndClear()).toEqual(['num 2', 2]);
    });
  })

  describe('useRef Test', () => {
    it('更新current值时不会re-render', () => {
      const App = () => {
        const ref = useRef(1);
        return (
          <>
            <button onClick={() => {
              ref.current += 1;
            }}>
              button
            </button>
            <Text text={ref.current} />;
          </>
        )

      }
      HorizonDOM.render(<App />, container);
      expect(LogUtils.getAndClear()).toEqual([1]);
      expect(container.querySelector('p').innerHTML).toBe('1');
      // 点击按钮触发ref.current加1
      container.querySelector('button').click();
      // ref.current改变不会触发重新渲染
      expect(LogUtils.getAndClear()).toEqual([]);
      expect(container.querySelector('p').innerHTML).toBe('1');
    });
  })

  describe('useImperativeHandle Test', () => {
    it('useImperativeHandle没有配置dep时自动更新', () => {

      let App = (props, ref) => {
        const [num, setNum] = useState(0);
        useImperativeHandle(ref, () => ({ num, setNum }));
        return <Text text={num} />;
      }
      let App1 = (props, ref) => {
        const [num1, setNum1] = useState(0);
        useImperativeHandle(ref, () => ({ num1, setNum1 }), []);
        return <Text text={num1} />;
      }

      App = forwardRef(App);
      App1 = forwardRef(App1);
      const counter = React.createRef(null);
      const counter1 = React.createRef(null);
      HorizonDOM.render(<App ref={counter} />, container);
      expect(LogUtils.getAndClear()).toEqual([0]);
      expect(counter.current.num).toBe(0);
      act(() => {
        counter.current.setNum(1);
      });
      expect(LogUtils.getAndClear()).toEqual([1]);
      // useImperativeHandle没有配置的dep,所以会自动更新
      expect(counter.current.num).toBe(1);
      // 清空container
      unmountComponentAtNode(container);

      HorizonDOM.render(<App1 ref={counter1} />, container);
      expect(LogUtils.getAndClear()).toEqual([0]);
      expect(counter1.current.num1).toBe(0);
      act(() => {
        counter1.current.setNum1(1);
      });
      expect(LogUtils.getAndClear()).toEqual([1]);
      // useImperativeHandle的dep为[],所以不会变
      expect(counter1.current.num1).toBe(0);
    });
  })
})
