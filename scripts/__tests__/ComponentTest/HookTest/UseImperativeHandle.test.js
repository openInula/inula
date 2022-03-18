/* eslint-disable no-undef */
import * as React from '../../../../libs/horizon/src/external/Horizon';
import * as HorizonDOM from '../../../../libs/horizon/src/dom/DOMExternal';
import * as LogUtils from '../../jest/logUtils';
import { act } from '../../jest/customMatcher';
import Text from '../../jest/Text';

describe('useImperativeHandle Hook Test', () => {
  const {
    useState,
    useImperativeHandle,
    forwardRef
  } = React;
  const { unmountComponentAtNode } = HorizonDOM;
  
  it('测试useImperativeHandle', () => {

    let App = (props, ref) => {
      const [num, setNum] = useState(0);
      useImperativeHandle(ref, () => ({ num, setNum }), []);
      return <p>{num}</p>;
    }
    let App1 = (props, ref) => {
      const [num1, setNum1] = useState(0);
      useImperativeHandle(ref, () => ({ num1, setNum1 }), [num1]);
      return <p>{num1}</p>;
    }

    App = forwardRef(App);
    App1 = forwardRef(App1);
    const counter = React.createRef(null);
    const counter1 = React.createRef(null);
    HorizonDOM.render(<App ref={counter} />, container);
    expect(counter.current.num).toBe(0);
    act(() => {
      counter.current.setNum(1);
    });
    // useImperativeHandle的dep为[],所以不会变
    expect(counter.current.num).toBe(0);
    // 清空container
    unmountComponentAtNode(container);

    HorizonDOM.render(<App1 ref={counter1} />, container);
    expect(counter1.current.num1).toBe(0);
    act(() => {
      counter1.current.setNum1(1);
    });
    // useImperativeHandle的dep为[num1],所以会变
    expect(counter1.current.num1).toBe(1);
  });

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
});