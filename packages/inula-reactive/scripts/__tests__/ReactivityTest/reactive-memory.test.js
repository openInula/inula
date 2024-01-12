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
import { Show } from '../../../src/reactive/components/Show';
import { Switch } from '../../../src/reactive/components/Switch';

describe('响应式数据usedRContexts', () => {
  it('测试响应式数据的usedRContexts会随着VNode的删除而清除', () => {
    let rObj;
    const refBlue = createRef();
    const refRed = createRef();
    const refYellow = createRef();
    const refNothing = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive('blue');
      rObj = _rObj;

      fn();

      return (
        <Switch default={<div ref={refNothing}>nothing</div>}>
          {/*if不能写成 _rObj === 'red' 或者 _rObj.get() === 'red' */}
          <Show if={() => _rObj.get() === 'blue'}>
            <div id="1" ref={refBlue}>
              {_rObj}
            </div>
          </Show>
          <Show if={() => _rObj.get() === 'red'}>
            <div id="2" ref={refRed}>
              {_rObj}
            </div>
          </Show>
          <Show if={() => _rObj.get() === 'yellow'}>
            <div id="3" ref={refYellow}>
              {_rObj}
            </div>
          </Show>
        </Switch>
      );
    };

    render(<App />, container);
    expect(refBlue.current.innerHTML).toEqual('blue');
    // rObj被3个RContext依赖，分别是Switch组件、Show组件、div[id=1]的Children
    expect(rObj.usedRContexts.size).toEqual(3);

    act(() => {
      rObj.set('red');
    });
    expect(refRed.current.innerHTML).toEqual('red');
    // rObj被3个Effect依赖，分别是Switch组件、Show组件、div[id=2]的Children
    expect(rObj.usedRContexts.size).toEqual(3);

    act(() => {
      rObj.set('black');
    });
    expect(refNothing.current.innerHTML).toEqual('nothing');
    // rObj被1个RContext依赖，分别是Switch组件
    expect(rObj.usedRContexts.size).toEqual(1);

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
