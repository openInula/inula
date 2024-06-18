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

import { describe, expect, vi } from 'vitest';
import { domTest as it } from './utils';
import { render, View } from '../src';

describe('lifecycle', () => {
  it('should call willMount', ({ container }) => {
    const fn = vi.fn();

    function App() {
      willMount: {
        expect(container.innerHTML).toBe('');
        fn();
      }

      return <div>test</div>;
    }

    render(App, container);
    expect(fn).toHaveBeenCalled();
  });

  it('should call didMount', ({ container }) => {
    const fn = vi.fn();

    function App() {
      didMount(() => {
        expect(container.innerHTML).toBe('<div>test</div>');
        fn();
      });

      return <div>test</div>;
    }

    render(App, container);
    expect(fn).toHaveBeenCalled();
  });

  // TODO: implement unmount
  it.skip('should call willUnmount', ({ container }) => {
    const fn = vi.fn();

    function App() {
      willUnmount: {
        expect(container.innerHTML).toBe('<div>test</div>');
        fn();
      }

      return <div>test</div>;
    }

    render(App, container);
    expect(fn).toHaveBeenCalled();
  });
});
