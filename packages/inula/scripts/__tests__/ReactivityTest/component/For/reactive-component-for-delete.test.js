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

import Inula, { render, createRef, useReactive, For } from '../../../../../src/index';
import { beforeEach } from '@jest/globals';

const Row = ({ item }) => {
  return <li id={item.id} key={item.id}>{item.name}</li>;
};

let rObj;
let ref;
let appFn;
let App;
let itemFn;

describe('测试 For 组件的删除', () => {
  beforeEach(() => {
    ref = createRef();
    appFn = jest.fn();
    itemFn = jest.fn();

    App = () => {
      const _rObj = useReactive({
        items: [
          { id: 'id-1', name: 'p1' },
          { id: 'id-2', name: 'p2' },
          { id: 'id-3', name: 'p3' },
          { id: 'id-4', name: 'p4' },
          { id: 'id-5', name: 'p5' },
        ],
      });
      rObj = _rObj;

      appFn();

      return (
        <div ref={ref}>
          <For each={_rObj.items}>
            {item => {
              itemFn();
              return <Row item={item} />;
            }}
          </For>
        </div>
      );
    };
  });

  it('通过 pop 删除最后1行', () => {
    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(5);

    // 删除最后一行
    rObj.items.pop();

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(4);
    expect(appFn).toHaveBeenCalledTimes(1);

    // 第一次渲染执行5次，pop无需更新
    expect(itemFn).toHaveBeenCalledTimes(5);
  });

  it('通过 splice 删除中间2行', () => {
    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(5);

    // 删除中间一行
    rObj.items.splice(2, 2);

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(3);
    expect(appFn).toHaveBeenCalledTimes(1);

    // 第一次渲染执行5次，splice无需更新
    expect(itemFn).toHaveBeenCalledTimes(5);
  });

  it('通过 splice 删除中间2行，增加1行', () => {
    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(5);

    // 删除中间2行，增加1行
    rObj.items.splice(2, 2, ...[{ id: 6, name: 'p6' }]);

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(4);
    expect(appFn).toHaveBeenCalledTimes(1);

    // 第一次渲染执行5次，splice新增1行会执行1次
    expect(itemFn).toHaveBeenCalledTimes(6);
  });

  it('通过 set 删除中间2行', () => {
    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(5);

    // 删除中间2行
    rObj.items.set([
      { id: 'id-1', name: 'p1' },
      { id: 'id-2', name: 'p2' },
      { id: 'id-5', name: 'p5' },
    ]);

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(3);
    expect(appFn).toHaveBeenCalledTimes(1);

    // 第一次渲染执行5次，splice无需更新
    expect(itemFn).toHaveBeenCalledTimes(5);
  });
});
