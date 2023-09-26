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

import Inula, { render, createRef, useReactive, reactive, memo, For } from '../../../../../src/index';

const Item = ({ item }) => {
  return <li key={item.id}>{item.name}</li>;
};

describe('测试 For 组件', () => {
  it('使用For组件遍历reactive“数组”', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const Item = ({ item }) => {
      return <li key={item.id}>{item.name}</li>;
    };

    const App = () => {
      const _rObj = useReactive({
        items: [
          { name: 'p1', id: 1 },
          { name: 'p2', id: 2 },
        ],
      });
      rObj = _rObj;

      fn();

      return (
        <div ref={ref}>
          <For each={_rObj.items}>
            {item => {
              return <Item item={item} />;
            }}
          </For>
        </div>
      );
    };

    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(2);

    // 每次修改items都会触发整个组件刷新
    rObj.items.set([{ name: 'p11', id: 1 }]);

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(1);
    expect(fn).toHaveBeenCalledTimes(1);

    // 每次修改items都会触发整个组件刷新
    rObj.items.push({ name: 'p22', id: 2 });

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(2);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('reactive“数组”从[]变成有值', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const Item = ({ item }) => {
      return <li key={item.id}>{item.name}</li>;
    };

    const App = () => {
      const _rObj = useReactive({
        items: [],
      });
      rObj = _rObj;

      fn();

      return (
        <div ref={ref}>
          <For each={_rObj.items}>
            {item => {
              return <Item item={item} />;
            }}
          </For>
        </div>
      );
    };

    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(0);

    // 每次修改items都会触发整个组件刷新
    rObj.items.set([{ name: 'p11', id: 1 }]);

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(1);
    expect(fn).toHaveBeenCalledTimes(1);

    // 每次修改items都会触发整个组件刷新
    rObj.items.push({ name: 'p22', id: 2 });

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(2);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('数组3行变到4行', () => {
    const state = reactive({
      data: {
        lines: [
          { id: 'id-1', label: '1' },
          { id: 'id-2', label: '2' },
          { id: 'id-3', label: '3' },
        ],
      },
    });

    const Row = memo(({ item }) => {
      return (
        <tr>
          <td>{item.id}</td>
          <td>
            <a id={item.id}>{item.label}</a>
          </td>
        </tr>
      );
    });

    const RowList = () => {
      return <For each={state.data.lines}>{item => <Row item={item} />}</For>;
    };

    const App = () => {
      return (
        <div>
          <table>
            <tbody>
              <RowList />
            </tbody>
          </table>
        </div>
      );
    };

    render(<App />, container);

    let a = container.querySelector('#id-1');

    expect(a.innerHTML).toEqual('1');
    expect(state.data.lines.length).toEqual(3);
    state.data.set({
      lines: [
        { id: 'id-4', label: '4' },
        { id: 'id-5', label: '5' },
        { id: 'id-6', label: '6' },
        { id: 'id-7', label: '7' },
      ],
    });
    expect(state.data.lines.length).toEqual(4);
    a = container.querySelector('#id-4');

    expect(a.innerHTML).toEqual('4');
    const b = container.querySelector('#id-6');
    expect(b.innerHTML).toEqual('6');
  });

  it('使用基本数据数组的loop方法', () => {
    let rObj;
    const fn = jest.fn();

    const App = () => {
      const _rObj = useReactive({
        items: [1, 2, 3, 4],
      });
      rObj = _rObj;

      fn();

      return (
        <div>
          {_rObj.items.map(rItem => {
            return <li>{rItem}</li>;
          })}
        </div>
      );
    };

    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(4);

    // 每次修改items都会触发整个组件刷新
    rObj.items.set([1, 2, 3]);

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(3);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('数组reverse', () => {
  it('调用数组的reverse方法', () => {
    let rObj;
    const fn = jest.fn();

    const App = () => {
      const _rObj = useReactive({
        items: [
          { id: 1, name: 'p1' },
          { id: 2, name: 'p2' },
          { id: 3, name: 'p3' },
        ],
      });
      rObj = _rObj;

      fn();

      return (
        <div>
          <For each={_rObj.items}>
            {item => {
              return <Item item={item} />;
            }}
          </For>
        </div>
      );
    };

    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(3);

    // 反转
    rObj.items.reverse();

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(3);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
