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

import Inula, { render, createRef, useReactive, reactive, For } from '../../../../../src/index';
import { beforeEach } from '@jest/globals';
import { getRNode } from '../../../../../src/reactive/Utils';

const Row = ({ item }) => {
  return (
    <li id={item.id} key={item.id}>
      {item.name}
    </li>
  );
};

const TableList = ({ item }) => {
  return <For each={item.items}>{item => <RowList item={item} />}</For>;
};

const RowList = ({ item }) => {
  return <For each={item.items}>{item => <Row item={item} />}</For>;
};

let rObj;
let ref;
let appFn;
let App;
let itemFn;
let globalData;

describe('测试 For 组件的更新', () => {
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

  it('通过 set 更新每行数据的id', () => {
    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(5);

    let a = container.querySelector('#id-1');
    expect(a.innerHTML).toEqual('p1');

    // 更新id
    rObj.items.set([
      { id: 'id-11', name: 'p1' },
      { id: 'id-22', name: 'p2' },
      { id: 'id-33', name: 'p3' },
      { id: 'id-44', name: 'p4' },
      { id: 'id-55', name: 'p5' },
    ]);

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(5);
    expect(appFn).toHaveBeenCalledTimes(1);

    // 只有第一次渲染执行5次
    expect(itemFn).toHaveBeenCalledTimes(5);

    a = container.querySelector('#id-11');
    expect(a.innerHTML).toEqual('p1');
  });

  it('等长 set 更新每行数据', () => {
    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(5);

    let li = container.querySelector('#id-1');
    expect(li.innerHTML).toEqual('p1');

    // 更新
    rObj.items.set([
      { id: 'id-1', name: 'p11' },
      { id: 'id-2', name: 'p2' },
      { id: 'id-3', name: 'p33' },
      { id: 'id-4', name: 'p4' },
      { id: 'id-5', name: 'p55' },
    ]);

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(5);
    expect(appFn).toHaveBeenCalledTimes(1);

    // 只有第一次渲染执行5次
    expect(itemFn).toHaveBeenCalledTimes(5);

    li = container.querySelector('#id-1');
    expect(li.innerHTML).toEqual('p11');
  });

  it('通过 reverse 反转数组', () => {
    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(5);

    // 反转数组
    rObj.items.reverse();

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(5);
    expect(appFn).toHaveBeenCalledTimes(1);

    // 第一次渲染执行5次，反转需要5-1次
    expect(itemFn).toHaveBeenCalledTimes(9);

    let li1 = container.querySelector('li:nth-child(1)');
    expect(li1.innerHTML).toEqual('p5');
    let li2 = container.querySelector('li:nth-child(2)');
    expect(li2.innerHTML).toEqual('p4');
    let li3 = container.querySelector('li:nth-child(3)');
    expect(li3.innerHTML).toEqual('p3');
    let li4 = container.querySelector('li:nth-child(4)');
    expect(li4.innerHTML).toEqual('p2');
    let li5 = container.querySelector('li:nth-child(5)');
    expect(li5.innerHTML).toEqual('p1');
  });

  it('通过 copyWithin 修改数组', () => {
    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(5);

    // 反转数组
    rObj.items.copyWithin(3, 1, 4);

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(5);
    expect(appFn).toHaveBeenCalledTimes(1);

    expect(itemFn).toHaveBeenCalledTimes(7);

    // 结果是：
    // { id: 'id-1', name: 'p1' },
    // { id: 'id-2', name: 'p2' },
    // { id: 'id-3', name: 'p3' },
    // { id: 'id-2', name: 'p2' },
    // { id: 'id-3', name: 'p3' },

    let li1 = container.querySelector('li:nth-child(1)');
    expect(li1.innerHTML).toEqual('p1');
    let li2 = container.querySelector('li:nth-child(2)');
    expect(li2.innerHTML).toEqual('p2');
    let li3 = container.querySelector('li:nth-child(3)');
    expect(li3.innerHTML).toEqual('p3');
    let li4 = container.querySelector('li:nth-child(4)');
    expect(li4.innerHTML).toEqual('p2');
    let li5 = container.querySelector('li:nth-child(5)');
    expect(li5.innerHTML).toEqual('p3');
  });
});

describe('测试 For 组件的更新，3层数据', () => {
  beforeEach(() => {
    ref = createRef();
    appFn = jest.fn();
    itemFn = jest.fn();

    App = () => {
      const _rObj = useReactive({
        items: [
          {
            id: 'id-1',
            items: [
              {
                id: 'id-1',
                items: [
                  { id: 'id-1', name: 'p1' },
                  { id: 'id-2', name: 'p2' },
                  { id: 'id-3', name: 'p3' },
                ],
              },
              {
                id: 'id-2',
                items: [
                  { id: 'id-4', name: 'p4' },
                  { id: 'id-5', name: 'p5' },
                  { id: 'id-6', name: 'p6' },
                ],
              },
              {
                id: 'id-3',
                items: [
                  { id: 'id-7', name: 'p7' },
                  { id: 'id-8', name: 'p8' },
                  { id: 'id-9', name: 'p9' },
                ],
              },
            ],
          },
          {
            id: 'id-2',
            items: [
              {
                id: 'id-1',
                items: [
                  { id: 'id-10', name: 'p10' },
                  { id: 'id-11', name: 'p11' },
                  { id: 'id-12', name: 'p12' },
                ],
              },
              {
                id: 'id-2',
                items: [
                  { id: 'id-13', name: 'p13' },
                  { id: 'id-14', name: 'p14' },
                  { id: 'id-15', name: 'p15' },
                ],
              },
              {
                id: 'id-3',
                items: [
                  { id: 'id-16', name: 'p16' },
                  { id: 'id-17', name: 'p17' },
                  { id: 'id-18', name: 'p18' },
                ],
              },
            ],
          },
        ],
      });
      rObj = _rObj;

      appFn();

      return (
        <div ref={ref}>
          <For each={_rObj.items}>
            {item => {
              itemFn();
              return <TableList item={item} />;
            }}
          </For>
        </div>
      );
    };
  });

  it('通过 set 更新第三层数据', () => {
    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(18);

    let li = container.querySelector('#id-4');
    expect(li.innerHTML).toEqual('p4');

    // 更新
    rObj.items.set([
      {
        id: 'id-1',
        items: [
          {
            id: 'id-1',
            items: [
              { id: 'id-1', name: 'p1' },
              { id: 'id-2', name: 'p2' },
              { id: 'id-3', name: 'p3' },
            ],
          },
          {
            id: 'id-2',
            items: [
              { id: 'id-4', name: 'p444' },
              { id: 'id-5', name: 'p5' },
              { id: 'id-6', name: 'p6' },
            ],
          },
          {
            id: 'id-3',
            items: [
              { id: 'id-7', name: 'p7' },
              { id: 'id-8', name: 'p8' },
              { id: 'id-9', name: 'p9' },
            ],
          },
        ],
      },
      {
        id: 'id-2',
        items: [
          {
            id: 'id-1',
            items: [
              { id: 'id-10', name: 'p10' },
              { id: 'id-11', name: 'p11' },
              { id: 'id-12', name: 'p12' },
            ],
          },
          {
            id: 'id-2',
            items: [
              { id: 'id-13', name: 'p13' },
              { id: 'id-14', name: 'p14' },
              { id: 'id-15', name: 'p15' },
            ],
          },
          {
            id: 'id-3',
            items: [
              { id: 'id-16', name: 'p16' },
              { id: 'id-17', name: 'p17' },
              { id: 'id-18', name: 'p18' },
            ],
          },
        ],
      },
    ]);

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(18);
    expect(appFn).toHaveBeenCalledTimes(1);

    // 只有第一次渲染执行2次
    expect(itemFn).toHaveBeenCalledTimes(2);

    li = container.querySelector('#id-4');
    expect(li.innerHTML).toEqual('p444');
  });

  it('通过 set 删除第3层数据', () => {
    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(18);

    let li = container.querySelector('#id-8');
    expect(li.innerHTML).toEqual('p8');

    // 更新
    rObj.items.set([
      {
        id: 'id-1',
        items: [
          {
            id: 'id-1',
            items: [{ id: 'id-1', name: 'p1' }],
          },
          {
            id: 'id-2',
            items: [
              { id: 'id-4', name: 'p4' },
              { id: 'id-5', name: 'p5' },
            ],
          },
          {
            id: 'id-3',
            items: [
              { id: 'id-7', name: 'p7' },
              { id: 'id-8', name: 'p888' },
              { id: 'id-9', name: 'p9' },
            ],
          },
        ],
      },
      {
        id: 'id-2',
        items: [
          {
            id: 'id-1',
            items: [
              { id: 'id-10', name: 'p10' },
              { id: 'id-11', name: 'p11' },
              { id: 'id-12', name: 'p12' },
            ],
          },
          {
            id: 'id-2',
            items: [
              { id: 'id-13', name: 'p13' },
              { id: 'id-14', name: 'p14' },
              { id: 'id-15', name: 'p15' },
            ],
          },
          {
            id: 'id-3',
            items: [
              { id: 'id-16', name: 'p16' },
              { id: 'id-17', name: 'p17' },
              { id: 'id-18', name: 'p18' },
            ],
          },
        ],
      },
    ]);

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(15);
    expect(appFn).toHaveBeenCalledTimes(1);

    // 第一次渲染执行2次，更新也触发了1次
    expect(itemFn).toHaveBeenCalledTimes(3);

    li = container.querySelector('#id-8');
    expect(li.innerHTML).toEqual('p888');
  });

  it('通过 set 删除第1、3层数据', () => {
    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(18);

    let li = container.querySelector('#id-8');
    expect(li.innerHTML).toEqual('p8');

    // 更新
    rObj.items.set([
      {
        id: 'id-1',
        items: [
          {
            id: 'id-1',
            items: [{ id: 'id-1', name: 'p1' }],
          },
          {
            id: 'id-2',
            items: [
              { id: 'id-4', name: 'p4' },
              { id: 'id-5', name: 'p5' },
            ],
          },
          {
            id: 'id-3',
            items: [
              { id: 'id-7', name: 'p7' },
              { id: 'id-8', name: 'p888' },
              { id: 'id-9', name: 'p9' },
            ],
          },
        ],
      },
    ]);

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(6);
    expect(appFn).toHaveBeenCalledTimes(1);

    // 第一次渲染执行2次，更新也触发了1次
    expect(itemFn).toHaveBeenCalledTimes(3);

    li = container.querySelector('#id-8');
    expect(li.innerHTML).toEqual('p888');
  });

  it('通过 set 删除第1、2、3层数据', () => {
    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(18);

    let li = container.querySelector('#id-8');
    expect(li.innerHTML).toEqual('p8');

    // 更新
    rObj.items.set([
      {
        id: 'id-1',
        items: [
          {
            id: 'id-2',
            items: [
              { id: 'id-4', name: 'p4' },
              { id: 'id-5', name: 'p5' },
            ],
          },
          {
            id: 'id-3',
            items: [
              { id: 'id-7', name: 'p7' },
              { id: 'id-8', name: 'p888' },
              { id: 'id-9', name: 'p9' },
            ],
          },
        ],
      },
    ]);

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(5);
    expect(appFn).toHaveBeenCalledTimes(1);

    // 第一次渲染执行2次，更新也触发了1次
    expect(itemFn).toHaveBeenCalledTimes(3);

    li = container.querySelector('#id-8');
    expect(li.innerHTML).toEqual('p888');
  });

  it('通过 set 把数组设置成boolean和number', () => {
    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(18);

    // 更新
    rObj.items.set([
      {
        id: 'id-1',
        items: [
          {
            id: 'id-1',
            items: [true],
          },
          {
            id: 'id-2',
            items: 11,
          },
          {
            id: 'id-3',
            items: [
              { id: 'id-7', name: 'p7' },
              { id: 'id-8', name: 'p8' },
              { id: 'id-9', name: 'p9' },
            ],
          },
        ],
      },
    ]);

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(4);
    expect(appFn).toHaveBeenCalledTimes(1);

    // 第一次渲染执行2次，更新也触发了1次
    expect(itemFn).toHaveBeenCalledTimes(3);
  });

  it('通过 set 把数组设置成boolean和number，再修改下面数据部分', () => {
    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(18);

    // 更新
    rObj.items.set([
      {
        id: 'id-1',
        items: [
          {
            id: 'id-1',
            items: [true],
          },
          {
            id: 'id-2',
            items: 11, // 数组变数字，不会报错
            xxx: 'xxx', // 多出来的数据不影响
          },
          {
            id: 'id-3',
            items: [
              { id: 'id-7', name: 'p7' },
              { id: 'id-8', name: 'p888' },
              { id: 'id-9', name: 'p9' },
            ],
          },
        ],
      },
    ]);

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(4);
    expect(appFn).toHaveBeenCalledTimes(1);

    // 第一次渲染执行2次，更新也触发了1次
    expect(itemFn).toHaveBeenCalledTimes(3);

    let li = container.querySelector('#id-8');
    expect(li.innerHTML).toEqual('p888');
  });

  it('通过 set 把对象中的数组设置成boolean', () => {
    App = () => {
      const _rObj = useReactive({
        id: 'id-1',
        items: [
          { id: 'id-1', name: 'p1' },
          { id: 'id-2', name: 'p2' },
          { id: 'id-3', name: 'p3' },
        ],
      });
      rObj = _rObj;

      appFn();

      return (
        <div ref={ref}>
          <For each={_rObj.items}>
            {item => {
              itemFn();
              return (
                <li id={item.id} key={item.id}>
                  {item.name}
                </li>
              );
            }}
          </For>
        </div>
      );
    };

    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(3);

    // 更新
    rObj.set({
      id: 'id-1',
      items: [true],
    });

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(1);
    expect(appFn).toHaveBeenCalledTimes(1);

    // 第一次渲染执行3次，更新也触发了1次
    expect(itemFn).toHaveBeenCalledTimes(4);
  });
});

describe('测试 For 组件的更新，反复增删', () => {
  beforeEach(() => {
    ref = createRef();
    appFn = jest.fn();
    itemFn = jest.fn();

    App = () => {
      const _rObj = useReactive({
        items: [],
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

  it('先用 splice 删除1行，再通过 set 新增2行', () => {
    render(<App />, container);

    function removeFirstRow() {
      rObj.items.splice(0, 1);
    }

    removeFirstRow();

    // 新增2行
    rObj.items.set([
      { id: 'id-1', name: 'p1' },
      { id: 'id-2', name: 'p2' },
    ]);

    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(2);

    // 再新增2行
    rObj.items.set(
      rObj.items.concat([
        { id: 'id-3', name: 'p3' },
        { id: 'id-4', name: 'p4' },
      ])
    );

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(4);
  });

  it('先用 set 新增6行，删除1行，交换两行位置', () => {
    render(<App />, container);

    // 新增2行
    rObj.items.set([
      { id: 'id-1', name: 'p1' },
      { id: 'id-2', name: 'p2' },
      { id: 'id-3', name: 'p3' },
      { id: 'id-4', name: 'p4' },
      { id: 'id-5', name: 'p5' },
      { id: 'id-6', name: 'p6' },
    ]);

    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(6);

    // 删除一行
    rObj.items.splice(0, 1);

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(5);

    function swapRows() {
      const arr = rObj.items.slice();
      const tmp = arr[1];
      arr[1] = arr[arr.length - 2];
      arr[arr.length - 2] = tmp;
      rObj.items.set(arr);
    }

    swapRows();

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(5);

    let li2 = container.querySelector('li:nth-child(2)');
    expect(li2.innerHTML).toEqual('p5');

    let li4 = container.querySelector('li:nth-child(4)');
    expect(li4.innerHTML).toEqual('p3');
  });

  it('先用 set 新增4行，交换两行位置，删除1行', () => {
    render(<App />, container);

    // 新增2行
    rObj.items.set([
      { id: 'id-1', name: 'p1' },
      { id: 'id-2', name: 'p2' },
      { id: 'id-3', name: 'p3' },
      { id: 'id-4', name: 'p4' },
    ]);

    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(4);

    function swapRows() {
      const arr = rObj.items.slice();
      const tmp = arr[1];
      arr[1] = arr[arr.length - 2];
      arr[arr.length - 2] = tmp;
      rObj.items.set(arr);
    }

    // 前后边上第2行交换
    swapRows();

    // 删除一行
    rObj.items.splice(0, 1);

    // 结果是：
    // { id: 'id-3', name: 'p3' },
    // { id: 'id-2', name: 'p2' },
    // { id: 'id-4', name: 'p4' },

    let li2 = container.querySelector('li:nth-child(2)');
    expect(li2.innerHTML).toEqual('p2');
  });
});

describe('测试 For 组件的更新，直接修改raw数组对象', () => {
  beforeEach(() => {
    ref = createRef();
    appFn = jest.fn();
    itemFn = jest.fn();

    globalData = {
      items: [
        { id: 'id-1', name: 'p1' },
        { id: 'id-2', name: 'p2' },
        { id: 'id-3', name: 'p3' },
        { id: 'id-4', name: 'p4' },
        { id: 'id-5', name: 'p5' },
      ],
    };

    App = () => {
      const _rObj = useReactive(globalData);
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

  it('向原始数组中增加1行数据，再通过 set 更新响应式数据，是不会更新的', () => {
    render(<App />, container);

    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(5);

    // 新增1行
    globalData.items.push({ id: 'id-6', name: 'p6' });

    // 无法触发更新，因为globalData.items的引用相同，不会触发监听
    rObj.set(globalData);

    items = container.querySelectorAll('li');
    // 不会更新
    expect(items.length).toEqual(5);
  });

  it('应该直接修改响应式数据的方式', () => {
    render(<App />, container);

    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(5);

    // 直接修改响应式数据的方式，新增1行
    rObj.items.push({ id: 'id-6', name: 'p6' });
    items = container.querySelectorAll('li');
    expect(items.length).toEqual(6);
  });
});

describe('更新多属性对象', () => {
  beforeEach(() => {
    ref = createRef();
    appFn = jest.fn();
    itemFn = jest.fn();

    globalData = {
      items: [
        { id: 'id-1', name: 'p1', class: 'c1' },
        { id: 'id-2', name: 'p2', class: 'c2' },
        { id: 'id-3', name: 'p3', class: 'c3' },
        { id: 'id-4', name: 'p4', class: 'c4' },
        { id: 'id-5', name: 'p5', class: 'c5' },
      ],
    };

    const Row = ({ item }) => {
      return (
        <li id={item.id} key={item.id} class={item.class}>
          {item.name}
        </li>
      );
    };

    App = () => {
      const _rObj = useReactive(globalData);
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

  it('对象数据的属性类型变化，后面的属性更正常', () => {
    render(<App />, container);

    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(5);

    let li = container.querySelector('#id-2');
    expect(li.getAttribute('class')).toEqual('c2');

    rObj.set({
      items: [
        { id: 'id-1', name: 'p1', class: 'c1' },
        { id: 'id-2', name: [true], class: 'c2222' },
        { id: 'id-3', name: 'p3', class: 'c3' },
        { id: 'id-4', name: 'p4', class: 'c4' },
        { id: 'id-5', name: 'p5', class: 'c5' },
      ],
    });

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(5);

    li = container.querySelector('#id-2');
    expect(li.getAttribute('class')).toEqual('c2222');
  });
});

describe('在class组件中使用for组件', () => {
  it('在类中使用reactive数据', () => {
    let rObj;
    let appInst;
    const ref = createRef();

    class App extends Inula.Component {
      constructor(props) {
        super(props);

        appInst = this;

        this.state = {
          name: 1,
        };

        this._rObj = reactive(1);
        rObj = this._rObj;
      }

      render() {
        return <div ref={ref}>{this._rObj}</div>;
      }
    }

    render(<App />, container);

    expect(ref.current.innerHTML).toEqual('1');

    // 触发组件重新渲染
    appInst.setState({ name: 2 });

    rObj.set('2');

    // rObj只应该有一个依赖
    expect(rObj.usedRContexts.size).toEqual(1);

    expect(ref.current.innerHTML).toEqual('2');
  });

  it('在类中使用reactive数组数据', () => {
    let rObj;
    let appInst;
    const ref = createRef();

    class Row extends Inula.Component {
      constructor(props) {
        super(props);
      }

      render() {
        const { item } = this.props;
        return (
          <li id={item.id} key={item.id}>
            {item.name}
          </li>
        );
      }
    }

    class App extends Inula.Component {
      constructor(props) {
        super(props);

        appInst = this;

        this.state = {
          name: 1,
        };

        this._rObj = reactive({
          items: [
            { id: 'id-1', name: 'p1', class: 'c1' },
            { id: 'id-2', name: 'p2', class: 'c2' },
            { id: 'id-3', name: 'p3', class: 'c3' },
            { id: 'id-4', name: 'p4', class: 'c4' },
            { id: 'id-5', name: 'p5', class: 'c5' },
          ],
        });
        rObj = this._rObj;
      }

      render() {
        return (
          <div ref={ref}>
            <For each={this._rObj.items}>
              {item => {
                return <Row item={item} />;
              }}
            </For>
          </div>
        );
      }
    }

    render(<App />, container);

    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(5);

    // 直接修改响应式数据的方式，新增1行
    rObj.items.push({ id: 'id-6', name: 'p6' });
    items = container.querySelectorAll('li');
    expect(items.length).toEqual(6);

    // 触发组件重新渲染
    appInst.setState({ name: 2 });

    // rObj只应该有一个依赖
    expect(getRNode(rObj.items).usedRContexts.size).toEqual(1);
  });

  describe('更新多属性对象', () => {
    beforeEach(() => {
      ref = createRef();
      appFn = jest.fn();
      itemFn = jest.fn();

      globalData = {
        items: [
          { id: 'id-1', name: 'p1', class: 'c1' },
          { id: 'id-2', name: 'p2', class: 'c2' },
        ],
      };

      const Row = ({ item }) => {
        return (
          <li id={item.id} key={item.id} class={item.class}>
            {item.name}
          </li>
        );
      };

      App = () => {
        const _rObj = useReactive(globalData);
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

    it('更新数组的一个原数据，调试subscribeAttr，只被调用一次', () => {
      render(<App />, container);

      let items = container.querySelectorAll('li');
      expect(items.length).toEqual(2);

      let li = container.querySelector('#id-2');
      expect(li.getAttribute('class')).toEqual('c2');

      rObj.set({
        items: [
          { id: 'id-1', name: 'p1', class: 'c1' },
          { id: 'id-2', name: 'p2', class: 'c222' },
        ],
      });

      items = container.querySelectorAll('li');
      expect(items.length).toEqual(2);

      li = container.querySelector('#id-2');
      expect(li.getAttribute('class')).toEqual('c222');
    });

    it('更新数组的一个原数据', () => {
      render(<App />, container);

      let items = container.querySelectorAll('li');
      expect(items.length).toEqual(2);

      let li = container.querySelector('#id-2');
      expect(li.getAttribute('class')).toEqual('c2');

      rObj.items[1].set({ id: 'id-2', name: 'p2', class: 'c222' });

      items = container.querySelectorAll('li');
      expect(items.length).toEqual(2);

      li = container.querySelector('#id-2');
      expect(li.getAttribute('class')).toEqual('c222');

      expect(itemFn).toHaveBeenCalledTimes(2);
    });

    it('For的数组是基本数据，更改其中一个，另外两个能精准更新', () => {
      const rowFn = jest.fn();

      const Row = ({ item, index }) => {
        rowFn();
        return <li id={index}>{item}</li>;
      };

      const App = () => {
        const _rObj = useReactive({
          id: 'id-1',
          items: [{ a: 1 }, 2, 3],
        });
        rObj = _rObj;

        appFn();

        return (
          <div ref={ref}>
            <For each={_rObj.items}>
              {(item, index) => {
                itemFn();
                return <Row item={item} index={index}></Row>;
              }}
            </For>
          </div>
        );
      };

      render(<App />, container);
      let items = container.querySelectorAll('li');
      expect(items.length).toEqual(3);

      // 更新
      rObj.set({
        id: 'id-1',
        items: [2, 3, 4],
      });

      items = container.querySelectorAll('li');
      expect(items.length).toEqual(3);
      expect(appFn).toHaveBeenCalledTimes(1);

      // 第一次渲染执行3次，更新也触发了1次
      expect(itemFn).toHaveBeenCalledTimes(4);

      // 第一次渲染执行3次，更新也触发了1次
      expect(rowFn).toHaveBeenCalledTimes(4);
    });
  });
});
