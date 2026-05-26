/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
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

import { describe, it, vi, expect } from 'vitest';
import { render, act, vueReactive, useEffect } from 'openinula';
import { useReactiveProps } from '../../src/vue';

const { useReactive, useComputed, useWatch, nextTick } = vueReactive;

describe('reactive props', () => {
  it('should reactive props work, when pass number', () => {
    const App = () => {
      const data = useReactive({
        count: 1,
      });

      const increase = () => {
        data.count = data.count + 1;
      };

      return (
        <>
          <div>
            <h2>Parent Component</h2>
            <button onClick={increase}>Toggle</button>
            <Child count={data.count} />
          </div>
        </>
      );
    };

    const Child = rawProps => {
      const props = useReactiveProps(rawProps);
      const countComputed = useComputed(() => {
        return props.count;
      });

      return (
        <div>
          <h3>Child Component</h3>
          <div id={'active'}>{countComputed.value}</div>
        </div>
      );
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<App />, container);

    expect(document.querySelector('#active')!.innerHTML).toBe('1');

    act(() => {
      container.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(document.querySelector('#active')!.innerHTML).toBe('2');
  });

  it('should reactive props work, when pass array', async () => {
    const App = () => {
      const data = useReactive({
        array: ['item1', 'item2', 'item3'],
      });

      const updateArray = () => {
        data.array = ['item4', 'item5', 'item6', 'item7'];
      };
      const addItem = () => {
        data.array.push('item88');
      };

      return (
        <>
          <div>
            <h2>Parent Component</h2>
            <button id={'updateBtn'} onClick={updateArray}>
              updateArray
            </button>
            <button id={'addBtn'} onClick={addItem}>
              addItem
            </button>
            <Child items={data.array} name={null} />
          </div>
        </>
      );
    };

    const Child = rawProps => {
      const props = useReactiveProps(rawProps, {
        name: { default: () => 'child1' },
        fn: {
          type: Function,
          default: () => {
            return false;
          },
        },
      });
      const data = useReactive({
        items: [],
      });

      useWatch(
        () => props.items,
        () => {
          data.items = props.items;
        },
        { deep: true }
      );

      useEffect(() => {
        data.items = props.items;
      }, []);

      return (
        <div>
          <h3>{props.name}</h3>
          <ul>
            {data.items.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      );
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    act(() => {
      render(<App />, container);
    });

    expect(document.querySelectorAll('li').length).toBe(3);

    act(() => {
      container.querySelector('#updateBtn')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // 依赖useWatch，需要加个nextTick
    await nextTick();
    expect(document.querySelectorAll('li').length).toBe(4);

    act(() => {
      container.querySelector('#addBtn')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(document.querySelectorAll('li').length).toBe(5);
  });

  it('should support set [] to []', () => {
    function App() {
      const dataReactive: { pagination: number[] } = useReactive({ pagination: [] });
      useEffect(() => {
        dataReactive.pagination = [];
        dataReactive.pagination.push(1);
      }, []);

      return (
        <div>
          <Child pagination={dataReactive.pagination}></Child>
        </div>
      );
    }

    const Child = rawProps => {
      const props = useReactiveProps(rawProps);

      const len = props.pagination.length;
      return (
        <div>
          <div id={'len'}>{len}</div>
        </div>
      );
    };

    const container = document.createElement('div');
    act(() => {
      render(<App />, container);
    });

    expect(container.querySelector('#len')!.innerHTML).toBe('1');
  });
});
