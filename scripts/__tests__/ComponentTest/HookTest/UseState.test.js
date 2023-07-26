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

describe('useState Hook Test', () => {
  const {
    useState,
    forwardRef,
    useImperativeHandle,
    memo,
    act,
  } = Inula;
  const LogUtils = getLogUtils();

  it('简单使用useState', () => {
    const App = () => {
      const [num, setNum] = useState(0);
      return (
        <>
          <p>{num}</p>
          <button onClick={() => setNum(num + 1)} />
        </>
      );
    };
    Inula.render(<App />, container);
    expect(container.querySelector('p').innerHTML).toBe('0');
    // 点击按钮触发num加1
    container.querySelector('button').click();
    expect(container.querySelector('p').innerHTML).toBe('1');
  });

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
    };
    Inula.render(<App />, container);
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
    };
    Inula.render(<App />, container);
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
    };
    Inula.render(<App />, container);
    expect(container.querySelector('p').innerHTML).toBe('0');
    expect(LogUtils.getAndClear()).toEqual([0]);
    // useState修改state 时，设置相同的值，函数组件不会重新渲染
    setNum(0);
    expect(LogUtils.getAndClear()).toEqual([]);
    expect(container.querySelector('p').innerHTML).toBe('0');
  });

  it('useState的惰性初始化', () => {
    const App = forwardRef((props, ref) => {
      const [num, setNum] = useState(() => {
        LogUtils.log(props.initNum);
        return props.initNum;
      });
      useImperativeHandle(ref, () => ({ setNum }));
      return <p>{num}</p>;

    });
    const ref = Inula.createRef(null);
    Inula.render(<App initNum={1} ref={ref} />, container);
    expect(LogUtils.getAndClear()).toEqual([1]);
    expect(container.querySelector('p').innerHTML).toBe('1');
    // 设置num为3
    ref.current.setNum(3);
    // 初始化函数只在初始渲染时被调用,所以Scheduler里的dataArray清空后没有新增。
    expect(LogUtils.getAndClear()).toEqual([]);
    expect(container.querySelector('p').innerHTML).toBe('3');
  });

  it('useState与memo一起使用', () => {
    let setNum;
    const App = memo(() => {
      const [num, _setNum] = useState(0);
      setNum = _setNum;
      return <Text text={num} />;
    });
    Inula.render(<App />, container);
    expect(LogUtils.getAndClear()).toEqual([0]);
    expect(container.querySelector('p').innerHTML).toBe('0');
    // 不会重新渲染
    Inula.render(<App />, container);
    expect(LogUtils.getAndClear()).toEqual([]);
    expect(container.querySelector('p').innerHTML).toBe('0');
    // 会重新渲染
    setNum(1);
    expect(LogUtils.getAndClear()).toEqual([1]);
    expect(container.querySelector('p').innerHTML).toBe('1');
  });

  it('卸载useState', () => {
    let setNum;
    let setCount;

    const App = (props) => {
      const [num, setNum_1] = useState(0);
      setNum = setNum_1;

      let count;
      if (props.hasCount) {
        const [count_1, setCount_1] = useState(0);
        count = count_1;
        setCount = setCount_1;
      } else {
        count = 'null';
      }

      return <Text text={`Number: ${num}, Count: ${count}`} />;
    };

    Inula.render(<App hasCount={true} />, container);
    expect(LogUtils.getAndClear()).toEqual(['Number: 0, Count: 0']);
    expect(container.textContent).toBe('Number: 0, Count: 0');
    act(() => {
      setNum(1);
      setCount(2);
    });
    expect(LogUtils.getAndClear()).toEqual(['Number: 1, Count: 2']);
    expect(container.textContent).toBe('Number: 1, Count: 2');

    jest.spyOn(console, 'error').mockImplementation();
    expect(() => {
      Inula.render(<App hasCount={false} />, container);
    }).toThrow('Hooks are less than expected, please check whether the hook is written in the condition.');
  });
});
