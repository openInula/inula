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

import Inula, { render, createRef, act, useReactive } from '../../../../src/index';
import { Block } from '../../../../src/reactive/components/Block';

describe('测试 Block 组件', () => {
  it('使用 Block 控制更新范围', () => {
    let rObj, rColor;
    const ref = createRef();
    const fn = jest.fn();
    const fn1 = jest.fn();
    const App = () => {
      const _rObj = useReactive({ count: 0 });
      const _rColor = useReactive('blue');
      rObj = _rObj;
      rColor = _rColor;

      fn();

      return (
        <div ref={ref}>
          111 222
          <Block>
            {() => {
              fn1();
              const count = _rObj.count.get();
              return (
                <>
                  <div>Count: {count}</div>
                  <div>{_rColor}</div>
                </>
              );
            }}
          </Block>
        </div>
      );
    };

    render(<App />, container);

    expect(ref.current.innerHTML).toEqual('111 222<div>Count: 0</div><div>blue</div>');

    // 会触发View刷新
    rObj.count.set(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn1).toHaveBeenCalledTimes(2);
    expect(ref.current.innerHTML).toEqual('111 222<div>Count: 1</div><div>blue</div>');

    // 不会触发View刷新
    rColor.set('red');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn1).toHaveBeenCalledTimes(2);
    expect(ref.current.innerHTML).toEqual('111 222<div>Count: 1</div><div>red</div>');
  });

  it('使用 Block 包裹一个Atom', () => {
    let rObj;
    const ref1 = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive('blue');
      rObj = _rObj;

      fn();

      return (
        // div下面有多个元素，_rObj就需要用RText包裹
        <div ref={ref1}>
          111 222
          <Block>{_rObj}</Block>
        </div>
      );
    };

    render(<App />, container);
    expect(ref1.current.innerHTML).toEqual('111 222blue');
    rObj.set('red');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(ref1.current.innerHTML).toEqual('111 222red');
  });
});
