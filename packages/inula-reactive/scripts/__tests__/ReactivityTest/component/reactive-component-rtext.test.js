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

import Inula, { render, createRef, act, useReactive, useCompute, reactive, RText } from '../../../../src/index';

describe('测试 RText 组件', () => {
  it('使用RText精准更新', () => {
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
          <RText>{_rObj}</RText>
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
