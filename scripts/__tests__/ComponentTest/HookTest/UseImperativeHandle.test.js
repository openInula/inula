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
import { Text } from '../../jest/commonComponents';
import { getLogUtils } from '../../jest/testUtils';

describe('useImperativeHandle Hook Test', () => {
  const {
    useState,
    useImperativeHandle,
    forwardRef,
    act,
  } = Inula;
  const { unmountComponentAtNode } = Inula;
  const LogUtils = getLogUtils();
  it('测试useImperativeHandle', () => {

    let App = (props, ref) => {
      const [num, setNum] = useState(0);
      useImperativeHandle(ref, () => ({ num, setNum }), []);
      return <p>{num}</p>;
    };
    let App1 = (props, ref) => {
      const [num1, setNum1] = useState(0);
      useImperativeHandle(ref, () => ({ num1, setNum1 }), [num1]);
      return <p>{num1}</p>;
    };

    App = forwardRef(App);
    App1 = forwardRef(App1);
    const counter = Inula.createRef(null);
    const counter1 = Inula.createRef(null);
    Inula.render(<App ref={counter} />, container);
    expect(counter.current.num).toBe(0);
    act(() => {
      counter.current.setNum(1);
    });
    // useImperativeHandle的dep为[],所以不会变
    expect(counter.current.num).toBe(0);
    // 清空container
    unmountComponentAtNode(container);

    Inula.render(<App1 ref={counter1} />, container);
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
    };
    let App1 = (props, ref) => {
      const [num1, setNum1] = useState(0);
      useImperativeHandle(ref, () => ({ num1, setNum1 }), []);
      return <Text text={num1} />;
    };

    App = forwardRef(App);
    App1 = forwardRef(App1);
    const counter = Inula.createRef(null);
    const counter1 = Inula.createRef(null);
    Inula.render(<App ref={counter} />, container);
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

    Inula.render(<App1 ref={counter1} />, container);
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
