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

import Inula, { render, createRef, act, useReactive, useCompute, reactive, Show } from '../../../../src/index';

describe('测试 Show 组件', () => {
  it('if为primitive值', () => {
    let rObj;
    const ref1 = createRef();
    const ref2 = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive('blue');
      rObj = _rObj;

      fn();

      return (
        // 如果else中的dom和children一个类型，需要增加key，否则会被框架当作同一个dom
        <Show
          if={_rObj}
          else={
            <div key="else" ref={ref2}>
              Loading...
            </div>
          }
        >
          <div key="if" ref={ref1}>
            {_rObj}
          </div>
        </Show>
      );
    };

    render(<App />, container);
    expect(ref1.current.innerHTML).toEqual('blue');
    rObj.set('');
    expect(ref2.current.innerHTML).toEqual('Loading...');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('if为primitive值，没有else', () => {
    let rObj;
    const ref1 = createRef();
    const ref2 = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive('blue');
      rObj = _rObj;

      fn();

      return (
        // 如果else中的dom和children一个类型，需要增加key，否则会被框架当作同一个dom
        <Show if={_rObj}>
          <div ref={ref1}>{_rObj}</div>
        </Show>
      );
    };

    render(<App />, container);
    expect(ref1.current.innerHTML).toEqual('blue');
    rObj.set('');
    expect(ref2.current).toEqual(null);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('if为reactive object值', () => {
    let rObj;
    const ref1 = createRef();
    const ref2 = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive({
        color: 'blue',
      });
      rObj = _rObj;

      fn();

      return (
        // 如果else中的dom和children一个类型，需要增加key，否则会被框架当作同一个dom
        <Show
          if={_rObj.color}
          else={
            <div key="else" ref={ref2}>
              Loading...
            </div>
          }
        >
          <div key="if" ref={ref1}>
            {_rObj.color}
          </div>
        </Show>
      );
    };

    render(<App />, container);
    expect(ref1.current.innerHTML).toEqual('blue');
    rObj.color.set('');
    expect(ref2.current.innerHTML).toEqual('Loading...');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('if为函数', () => {
    let rObj;
    const ref1 = createRef();
    const ref2 = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive({
        color: 'blue',
      });
      rObj = _rObj;

      fn();

      return (
        // 如果else中的dom和children一个类型，需要增加key，否则会被框架当作同一个dom
        <Show
          if={() => _rObj.color}
          else={
            <div key="else" ref={ref2}>
              Loading...
            </div>
          }
        >
          <div key="if" ref={ref1}>
            {_rObj.color}
          </div>
        </Show>
      );
    };

    render(<App />, container);
    expect(ref1.current.innerHTML).toEqual('blue');
    rObj.color.set('');
    expect(ref2.current.innerHTML).toEqual('Loading...');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('if的children、else是函数', () => {
    const ref1 = createRef();
    const ref2 = createRef();
    const fn = jest.fn();
    const _count = reactive(0);
    const _rObj = reactive({
      color: 'blue',
    });

    const App = () => {
      fn();

      return (
        // 如果else中的dom和children一个类型，需要增加key，否则会被框架当作同一个dom
        <Show
          if={() => _rObj.color}
          else={() => (
            <div key="else" ref={ref2}>
              Loading...
            </div>
          )}
        >
          {() => {
            const text = useCompute(() => {
              return _rObj.color.get() + _count.get();
            });

            return (
              <div key="if" ref={ref1}>
                {text}
              </div>
            );
          }}
        </Show>
      );
    };

    render(<App />, container);
    expect(ref1.current.innerHTML).toEqual('blue0');
    // 修改children函数中使用到的响应式变量，也会触发Show组件更新
    _count.set(1);
    expect(ref1.current.innerHTML).toEqual('blue1');
    _rObj.color.set('');
    expect(ref2.current.innerHTML).toEqual('Loading...');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
