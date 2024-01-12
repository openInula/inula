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

import Inula, { render, createRef, useState, useReactive, useCompute } from '../../../src/index';

describe('测试 useReactive(原生数据)', () => {
  it('reactive.get()作为children', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive('1');
      rObj = _rObj;

      fn();

      return <div ref={ref}>{_rObj.get()}</div>;
    };
    render(<App />, container);
    expect(ref.current.innerHTML).toEqual('1');
    rObj.set('2');
    expect(ref.current.innerHTML).toEqual('2');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('reactive作为children', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive('1');
      rObj = _rObj;

      fn();

      return <div ref={ref}>{_rObj}</div>;
    };
    render(<App />, container);
    expect(ref.current.innerHTML).toEqual('1');
    rObj.set('2');
    expect(ref.current.innerHTML).toEqual('2');
    rObj.set(prev => prev + '??');
    expect(ref.current.innerHTML).toEqual('2??');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('reactive.get()作为prop', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive(1);
      rObj = _rObj;

      fn();

      return <div ref={ref} className={_rObj.get()}></div>;
    };
    render(<App />, container);
    expect(ref.current.className).toEqual('1');
    rObj.set(2);
    expect(ref.current.className).toEqual('2');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('reactive作为prop', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive(1);
      rObj = _rObj;

      fn();

      return <div ref={ref} className={_rObj}></div>;
    };
    render(<App />, container);
    expect(ref.current.className).toEqual('1');
    rObj.set(2);
    expect(ref.current.className).toEqual('2');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('reactive.get()传入style', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();

    const App = () => {
      const _rObj = useReactive('blue');
      rObj = _rObj;

      fn();

      return <div ref={ref} style={{ color: _rObj.get() }}></div>;
    };
    render(<App />, container);
    const style = window.getComputedStyle(ref.current);
    expect(style.color).toEqual('blue');

    rObj.set('red');
    expect(ref.current.style.color).toEqual('red');

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('reactive传入style', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();

    const App = () => {
      const _rObj = useReactive('blue');
      rObj = _rObj;

      fn();

      return <div ref={ref} style={{ color: _rObj }}></div>;
    };
    render(<App />, container);
    const style = window.getComputedStyle(ref.current);
    expect(style.color).toEqual('blue');

    rObj.set('red');
    expect(ref.current.style.color).toEqual('red');

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('reactive传入Input value', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();

    const App = () => {
      const _rObj = useReactive('blue');
      rObj = _rObj;

      fn();

      return <input ref={ref} value={_rObj}></input>;
    };
    render(<App />, container);
    expect(ref.current.value).toEqual('blue');

    rObj.set('red');
    expect(ref.current.value).toEqual('red');

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('reactive传入Textarea value', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();

    const App = () => {
      const _rObj = useReactive('blue');
      rObj = _rObj;

      fn();

      return <textarea ref={ref} value={_rObj}></textarea>;
    };
    render(<App />, container);
    expect(ref.current.value).toEqual('blue');

    rObj.set('red');
    expect(ref.current.value).toEqual('red');

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('reactive父组件刷新， effect不应该重新监听', () => {
    let rObj, update;
    const ref = createRef();
    const fn = jest.fn();

    const App = () => {
      const [_, setState] = useState({});

      update = () => setState({});
      return <Child />;
    };

    const Child = () => {
      const _rObj = useReactive('blue');
      rObj = _rObj;

      fn();

      return <div ref={ref} className={_rObj}></div>;
    };

    render(<App />, container);
    expect(ref.current.className).toEqual('blue');
    expect(fn).toHaveBeenCalledTimes(1);
    update();
    expect(fn).toHaveBeenCalledTimes(2);
    rObj.set('red');
    expect(fn).toHaveBeenCalledTimes(2);
    expect(ref.current.className).toEqual('red');
  });

  it('不允许：从“原生数据”变成“对象”', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive('1');
      rObj = _rObj;

      fn();

      const cp = useCompute(() => {
        return _rObj.get() === '1' ? '1' : _rObj.data.get();
      });

      return <div ref={ref}>{cp}</div>;
    };
    render(<App />, container);
    expect(ref.current.innerHTML).toEqual('1');

    // 不允许：从“原生数据”变成“对象”
    expect(() => rObj.set({ data: '2' })).toThrow(Error('Not allowed Change Primitive to Object'));
  });

  it('允许：一个reactive属性从“原生数据”变成“对象”', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive({
        data: '1',
      });
      rObj = _rObj;

      fn();

      const cp = useCompute(() => {
        return _rObj.data.get() === '1' ? '1' : _rObj.data.num.get();
      });

      return <div ref={ref}>{cp}</div>;
    };
    render(<App />, container);
    expect(ref.current.innerHTML).toEqual('1');

    rObj.data.set({ num: '2' });
    expect(ref.current.innerHTML).toEqual('2');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
