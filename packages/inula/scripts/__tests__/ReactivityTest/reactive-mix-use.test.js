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

import Inula, {createRef, render, useReactive, useState, Show} from '../../../src/index';

describe('传统API和响应式API混合使用', () => {
  it('混合使用1', () => {
    let rObj, isShow, update;
    const ref = createRef();
    const fn = jest.fn();

    const App = () => {
      const _isShow = useReactive(true);
      isShow = _isShow;

      const [_, setState] = useState({});

      update = () => setState({});
      return (
        <Show if={isShow}>
          <Child />
        </Show>
      );
    };

    const Child = () => {
      const _rObj = useReactive('blue');
      rObj = _rObj;

      fn();

      return <div ref={ref} className={_rObj}></div>;
    };

    render(<App />, container);
    expect(ref.current.className).toEqual('blue');

    // 改变了DOM结构
    isShow.set(false);
    expect(ref.current).toEqual(null);

    update();

    expect(ref.current).toEqual(null);
  });


});
