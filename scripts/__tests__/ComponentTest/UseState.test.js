import * as React from '../../../libs/horizon/src/external/Horizon';
import * as HorizonDOM from '../../../libs/horizon/src/dom/DOMExternal';
//import { act } from 'react-dom/test-utils';
import * as Scheduler from 'scheduler';

describe('useState Hook Test', () => {
  const { useState, forwardRef, useImperativeHandle, memo } = React;
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
    Scheduler.reset();
  });

  const Text = (props) => {
    Scheduler.unstable_yieldValue(props.text);
    return <p>{props.text}</p>;
  }

  it('多个useState', () => {
    const App = () => {
      const [num, setNum] = useState(0);
      const [count, setCount] = useState(0);
      return (
        <p
          onClick={() => {
            setNum(num + 1);
            setCount(count + 2);
          }}
        >
          {num}{count}
        </p>
      );
    }
    HorizonDOM.render(<App />, container);
    expect(container.querySelector('p').innerHTML).toBe('00');
    container.querySelector('p').click();
    expect(container.querySelector('p').innerHTML).toBe('12');
    container.querySelector('p').click();
    expect(container.querySelector('p').innerHTML).toBe('24');
  });

  it('同一个useState声明的状态会被覆盖处理', () => {
    const App = () => {
      const [num, setNum] = useState(0);
      return (
        <p
          onClick={() => {
            setNum(num + 1);
            setNum(num + 2);
          }}
        >
          {num}
        </p>
      );
    }
    HorizonDOM.render(<App />, container);
    expect(container.querySelector('p').innerHTML).toBe('0');
    container.querySelector('p').click();
    expect(container.querySelector('p').innerHTML).toBe('2');
    container.querySelector('p').click();
    expect(container.querySelector('p').innerHTML).toBe('4');
  });

  it('useState设置相同的值时不会重新渲染', () => {
    let setNum;
    const App = () => {
      const [num, _setNum] = useState(0);
      setNum = _setNum;
      return <Text text={num} />;
    }
    HorizonDOM.render(<App />, container);
    expect(container.querySelector('p').innerHTML).toBe('0');
    expect(Scheduler).toHaveYielded([0]);
    // useState修改state 时，设置相同的值，函数组件不会重新渲染
    setNum(0);
    expect(Scheduler).toHaveYielded([]);
    expect(container.querySelector('p').innerHTML).toBe('0');
  });

  it('useState的惰性初始化', () => {
    //let data = null;
    const App = forwardRef((props, ref) => {
      const [num, setNum] = useState(() => {
        // if (data === null) {
        //   data = ['initNum'];
        // } else {
        //   data.push('initNum');
        // }
        Scheduler.unstable_yieldValue(props.initNum);
        return props.initNum
      });
      useImperativeHandle(ref, () => ({ setNum }))
      return <p>{num}</p>;

    })
    const ref = React.createRef(null);
    HorizonDOM.render(<App initNum={1} ref={ref} />, container);
    expect(Scheduler).toHaveYielded([1]);
    expect(container.querySelector('p').innerHTML).toBe('1');
    // 设置num为3
    ref.current.setNum(3);
    // 初始化函数只在初始渲染时被调用,所以Scheduler里的dataArray清空后没有新增。
    expect(Scheduler).toHaveYielded([]);
    expect(container.querySelector('p').innerHTML).toBe('3');
  });

  it('useState与memo一起使用', () => {
    let setNum;
    const App = memo((props) => {
      const [num, _setNum] = useState(0);
      setNum = _setNum;
      return <Text text={num} />;
    })
    HorizonDOM.render(<App />, container);
    expect(Scheduler).toHaveYielded([0]);
    expect(container.querySelector('p').innerHTML).toBe('0');
    // 不会重新渲染
    HorizonDOM.render(<App />, container);
    expect(Scheduler).toHaveYielded([]);
    expect(container.querySelector('p').innerHTML).toBe('0');
    // 会重新渲染
    setNum(1)
    expect(Scheduler).toHaveYielded([1]);
    expect(container.querySelector('p').innerHTML).toBe('1');
  });
});
