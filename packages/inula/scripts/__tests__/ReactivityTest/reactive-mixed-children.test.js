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

import Inula, { render, createRef, act, useReactive } from '../../../src/index';

describe('测试混合型的 children', () => {
  it('children是 字符串+Atom 场景', () => {
    let rObj;
    const ref1 = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive(0);
      rObj = _rObj;

      fn();

      return (
        // div下面有多个元素
        <div ref={ref1}>Count: {_rObj}</div>
      );
    };

    render(<App />, container);
    expect(ref1.current.innerHTML).toEqual('Count: 0');
    rObj.set(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(ref1.current.innerHTML).toEqual('Count: 1');
  });

  it('children是 字符串+Atom 场景2', () => {
    let rObj;
    const ref1 = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive({ count: 0 });
      rObj = _rObj;

      fn();

      return (
        // div下面有多个元素
        <div ref={ref1}>Count: {_rObj.count}</div>
      );
    };

    render(<App />, container);
    expect(ref1.current.innerHTML).toEqual('Count: 0');
    rObj.count.set(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(ref1.current.innerHTML).toEqual('Count: 1');
  });
});
