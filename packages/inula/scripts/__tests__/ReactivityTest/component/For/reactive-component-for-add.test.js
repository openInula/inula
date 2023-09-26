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

describe('测试 For 组件的新增', () => {
  beforeEach(() => {
    ref = createRef();
    appFn = jest.fn();
    itemFn = jest.fn();

    App = () => {
      const _rObj = useReactive({
        items: [
          { id: 'id-1', name: 'p1' },
          { id: 'id-2', name: 'p2' },
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

  it('通过 push 在后面添加1行', () => {
    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(2);

    // 在后面添加一行
    rObj.items.push({ id: 'id-3', name: 'p3' });

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(3);
    expect(appFn).toHaveBeenCalledTimes(1);

    // 第一次渲染执行2次，push更新执行1次
    expect(itemFn).toHaveBeenCalledTimes(3);
  });

  it('通过 unshift 在前面添加2行', () => {
    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(2);

    // 在前面添加2行
    rObj.items.unshift({ id: 'id-3', name: 'p3' }, { id: 'id-4', name: 'p4' });

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(4);
    expect(appFn).toHaveBeenCalledTimes(1);

    // 第一次渲染执行2次，unshift更新执行2次
    expect(itemFn).toHaveBeenCalledTimes(4);
  });

  it('通过 set 在后面添加1行', () => {
    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(2);

    // 在后面添加一行
    rObj.items.set([
      { id: 'id-1', name: 'p1' },
      { id: 'id-2', name: 'p2' },
      { id: 'id-3', name: 'p3' },
    ]);

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(3);
    expect(appFn).toHaveBeenCalledTimes(1);

    // 第一次渲染执行2次，push更新执行1次
    expect(itemFn).toHaveBeenCalledTimes(3);

    let li = container.querySelector('#id-3');
    expect(li.innerHTML).toEqual('p3');
  });

  it('For标签使用，使用push创建3000行表格数据', () => {
    let reactiveObj;
    const App = () => {
      const sourceData = useReactive([]);
      reactiveObj = sourceData;

      return (
        <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
          <table border='1' width='100%'>
            <tr>
              <th>序号</th>
              <th>名称</th>
              <th>年龄</th>
              <th>性别</th>
              <th>名族</th>
              <th>其他</th>
            </tr>
            <For each={sourceData}>
              {
                eachItem => {
                  return (
                    <tr>
                      <th style={{ color: eachItem.color }}>{eachItem.value}</th>
                      <th style={{ color: eachItem.color }}>{eachItem.value}</th>
                      <th style={{ color: eachItem.color }}>{eachItem.value}</th>
                      <th style={{ color: eachItem.color }}>{eachItem.value}</th>
                      <th style={{ color: eachItem.color }}>{eachItem.value}</th>
                      <th style={{ color: eachItem.color }}>{eachItem.value}</th>
                    </tr>
                  );
                }
              }
            </For>
          </table>
        </div>
      );
    };
    render(<App />, container);

    // 不推荐：循环push
    for (let i = 0; i < 2; i++) {
      reactiveObj.push({ value: i, color: null });
    }
    expect(reactiveObj.get().length).toEqual(2);

    let items = container.querySelectorAll('tr');
    expect(items.length).toEqual(3);
  });
});
