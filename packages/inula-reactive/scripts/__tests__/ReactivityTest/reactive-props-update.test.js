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

import Inula, { createRef, render, useReactive } from '../../../src/index';

describe('测试在DOM的props中使用响应式数据', () => {
  it('在class props中使用响应式数据', () => {
    let rObj;
    const ref = createRef();

    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive({ class: 'c1', color: 'blue' });
      rObj = _rObj;

      fn();

      return (
        <div ref={ref} className={_rObj.class}>
          {_rObj.color}
        </div>
      );
    };

    render(<App />, container);
    expect(ref.current.innerHTML).toEqual('blue');
    expect(ref.current.getAttribute('class')).toEqual('c1');

    rObj.class.set('c2');
    expect(ref.current.getAttribute('class')).toEqual('c2');

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('在style中使用响应式数据', () => {
    let rObj;
    const ref = createRef();

    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive({ class: 'c1', color: 'blue' });
      rObj = _rObj;

      fn();

      return (
        <div ref={ref} style={{ color: _rObj.color }}>
          {_rObj.color}
        </div>
      );
    };

    render(<App />, container);
    expect(ref.current.innerHTML).toEqual('blue');
    expect(ref.current.getAttribute('style')).toEqual('color: blue;');

    rObj.color.set('red');
    expect(ref.current.getAttribute('style')).toEqual('color: red;');

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('在input中使用响应式数据', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();

    const App = () => {
      const _rObj = useReactive({ class: 'c1', color: 'blue' });
      rObj = _rObj;

      fn();

      return <input ref={ref} value={_rObj.color}></input>;
    };
    render(<App />, container);
    expect(ref.current.value).toEqual('blue');

    rObj.color.set('red');
    expect(ref.current.value).toEqual('red');

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
