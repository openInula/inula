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
import { render, act, vueReactive } from '@cloudsop/horizon';
import { defineExpose } from '../../src/vue/sfcAPI';
import '../utils/globalSetup';

const { useReference, useInstance } = vueReactive;

describe('sfc APIs', () => {
  it('defineExpose: should expose methods to parent component through ref', () => {
    const Child = () => {
      const count = useReference(0);

      defineExpose({
        increment: () => {
          count.value++;
        },
        getCount: () => count.value,
      });

      return <div id="child">Count: {count.value}</div>;
    };

    const App = () => {
      const childRef = useReference<any>(null);

      const handleClick = () => {
        if (childRef.value) {
          childRef.value.increment();
        }
      };

      return (
        <div>
          <Child
            ref={val => {
              childRef.value = useInstance(val);
            }}
          />
          <button onClick={handleClick}>Increment</button>
        </div>
      );
    };

    document.body.appendChild(global.container);
    render(<App />, global.container);

    // 验证初始值
    expect(document.querySelector('#child')!.innerHTML).toBe('Count: 0');

    // 点击按钮触发子组件方法
    act(() => {
      global.container.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // 验证方法被调用后的结果
    expect(document.querySelector('#child')!.innerHTML).toBe('Count: 1');
  });

  it('defineExpose: should handle multiple exposed properties updates', () => {
    const Child = () => {
      const count = useReference(0);
      const name = useReference('test');

      defineExpose({
        updateName: () => {
          name.value = 'updated';
        },
        count,
      });

      return (
        <div id="child">
          Count: {count.value} - Name: {name.value}
        </div>
      );
    };

    const App = () => {
      const childRef = useReference<any>(null);

      const handleUpdate = () => {
        if (childRef.value) {
          childRef.value.updateName();
          childRef.value.count.value++;
        }
      };

      return (
        <div>
          <Child
            ref={val => {
              childRef.value = useInstance(val);
            }}
          />
          <button onClick={handleUpdate}>Update All</button>
        </div>
      );
    };

    document.body.appendChild(global.container);
    render(<App />, global.container);

    // 验证初始值
    expect(document.querySelector('#child')!.innerHTML).toBe('Count: 0 - Name: test');

    // 点击按钮更新所有属性
    act(() => {
      global.container.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // 验证所有属性都被更新
    expect(document.querySelector('#child')!.innerHTML).toBe('Count: 1 - Name: updated');
  });
});
