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

describe('useMemo Hook Test', () => {
  const { useMemo, useState } = Inula;
  const LogUtils = getLogUtils();

  it('测试useMemo', () => {
    let setMemo;
    const App = () => {
      const [num, setNum] = useState(0);
      const [memoDependent, _setMemo] = useState('App');
      setMemo = _setMemo;
      const text = useMemo(() => {
        setNum(num + 1);
        return memoDependent;
      }, [memoDependent]);
      return (
        <>
          <p>{text}</p>
          <p id="p">{num}</p>
        </>
      );
    };
    Inula.render(<App words="App" />, container);
    expect(container.querySelector('p').innerHTML).toBe('App');
    expect(container.querySelector('#p').innerHTML).toBe('1');
    // 修改useMemo的依赖项，num会加一，text会改变。
    setMemo('Apps');
    expect(container.querySelector('p').innerHTML).toBe('Apps');
    expect(container.querySelector('#p').innerHTML).toBe('2');
    // useMemo的依赖项不变，num不会加一，text不会改变。
    setMemo('Apps');
    expect(container.querySelector('p').innerHTML).toBe('Apps');
    expect(container.querySelector('#p').innerHTML).toBe('2');
    // 修改useMemo的依赖项，num会加一，text会改变。
    setMemo('App');
    expect(container.querySelector('p').innerHTML).toBe('App');
    expect(container.querySelector('#p').innerHTML).toBe('3');
  });

  it('触发useMemo', () => {
    const App = (props) => {
      const num = useMemo(() => {
        LogUtils.log(props._num);
        return props._num + 1;
      }, [props._num]);
      return <Text text={num} />;
    };
    Inula.render(<App _num={0} />, container);
    expect(LogUtils.getAndClear()).toEqual([
      0,
      1
    ]);
    expect(container.textContent).toBe('1');

    Inula.render(<App _num={1} />, container);
    expect(LogUtils.getAndClear()).toEqual([
      1,
      2
    ]);
    expect(container.textContent).toBe('2');

    Inula.render(<App _num={1} />, container);
    // 不会触发useMemo
    expect(LogUtils.getAndClear()).toEqual([2]);
    expect(container.textContent).toBe('2');

    Inula.render(<App _num={2} />, container);
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
    };

    const num1 = () => {
      LogUtils.log('num 1');
      return 1;
    };

    const num2 = () => {
      LogUtils.log('num 2');
      return 2;
    };

    Inula.render(<App _num={num1} />, container);
    expect(LogUtils.getAndClear()).toEqual(['num 1', 1]);

    Inula.render(<App _num={num1} />, container);
    expect(LogUtils.getAndClear()).toEqual(['num 1', 1]);

    Inula.render(<App _num={num1} />, container);
    expect(LogUtils.getAndClear()).toEqual(['num 1', 1]);

    Inula.render(<App _num={num2} />, container);
    expect(LogUtils.getAndClear()).toEqual(['num 2', 2]);
  });
});
