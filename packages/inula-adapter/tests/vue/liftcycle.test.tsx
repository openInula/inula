/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
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
import { render, act, useState } from 'openinula';
import { onBeforeUnmount, onUnmounted, onMounted, onBeforeMount, onUpdated } from '../../src/vue/lifecycle';

describe('lifecycle', () => {
  it('should call the onBeforeMount', () => {
    const fn = vi.fn(() => {
      expect(document.querySelector('span')).toBeNull();
    });

    const Comp = () => {
      const [toggle, setToggle] = useState(true);

      return (
        <>
          {toggle ? <Child /> : null}
          <button onClick={() => setToggle(false)}>Unmount</button>
        </>
      );
    };

    const Child = () => {
      onBeforeMount(fn);
      return <span />;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Comp />, container);

    expect(document.querySelector('span')).not.toBeNull();

    act(() => {
      container.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should call the onMounted', () => {
    const fn = vi.fn(() => {
      // 断言在组件卸载之后，子组件不存在于 DOM 中
      expect(document.querySelector('span')).not.toBeNull();
    });

    const Comp = () => {
      const [toggle, setToggle] = useState(true);

      return (
        <>
          {toggle ? <Child /> : null}
          <button onClick={() => setToggle(false)}>Unmount</button>
        </>
      );
    };

    const Child = () => {
      onMounted(fn);
      return <span />;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Comp />, container);

    expect(document.querySelector('span')).not.toBeNull();

    act(() => {
      container.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should call the onUnmounted after the component unmounts', () => {
    const fn = vi.fn(() => {
      // 断言在组件卸载之后，子组件不存在于 DOM 中
      expect(document.querySelector('span')).not.toBeNull();
    });

    const Comp = () => {
      const [toggle, setToggle] = useState(true);

      return (
        <>
          {toggle ? <Child /> : null}
          <button onClick={() => setToggle(false)}>Unmount</button>
        </>
      );
    };

    const Child = () => {
      onUnmounted(fn);
      return <span />;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Comp />, container);

    expect(document.querySelector('span')).not.toBeNull();

    act(() => {
      container.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should call the onBeforeUnmount before the component unmounts', () => {
    const fn = vi.fn(() => {
      // 断言在组件卸载之前，子组件仍然存在于 DOM 中
      expect(document.querySelector('span')).not.toBeNull();
    });

    const Comp = () => {
      const [toggle, setToggle] = useState(true);

      return (
        <>
          {toggle ? <Child /> : null}
          <button onClick={() => setToggle(false)}>Unmount</button>
        </>
      );
    };

    const Child = () => {
      onBeforeUnmount(fn);
      return <span />;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Comp />, container);

    expect(document.querySelector('span')).not.toBeNull();

    act(() => {
      container.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(fn).toHaveBeenCalledTimes(1);

    expect(document.querySelector('span')).toBeNull();
  });

  it('should call the onUpdated/onBeforeUpdate', () => {
    const fn = vi.fn(() => {
      expect(document.querySelector('span')!.outerHTML).toBe('<span>0</span>');
    });

    const Comp = () => {
      const [toggle, setToggle] = useState(true);

      onUpdated(fn);

      return (
        <>
          <span>{toggle ? 1 : 0}</span>
          <button onClick={() => setToggle(false)}>Unmount</button>
        </>
      );
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Comp />, container);

    expect(fn).toHaveBeenCalledTimes(0);
    expect(document.querySelector('span')!.outerHTML).toBe('<span>1</span>');

    container.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
