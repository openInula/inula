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
vi.mock('../src/scheduler', async () => {
  return {
    schedule: (task: () => void) => {
      task();
    },
  };
});

describe('components', () => {
  describe('ref', () => {
    it.fails('should support ref', ({ container }) => {
      let ref: HTMLElement;

      function App() {
        let count = 0;
        let _ref: HTMLElement;

        didMount: {
          ref = _ref;
        }

        return <div ref={_ref}>test</div>;
      }

      render(App, container);

      expect(ref).toBeInstanceOf(HTMLElement);
    });

    it('should support ref with function', ({ container }) => {
      const fn = vi.fn();

      function App() {
        const ref = (el: HTMLElement) => {
          fn();
          expect(el).toBeInstanceOf(HTMLElement);
        };

        return <div ref={ref}>test</div>;
      }

      render(App, container);
      expect(fn).toHaveBeenCalled();
    });
  });

  describe('env', () => {
    it.fails('should support env', ({ container }) => {
      function App() {
        return (
          <env theme="dark">
            <Child name="child" />
          </env>
        );
      }

      function Child({ name }, { theme }) {
        return (
          <div>
            name is {name}, theme is {theme}
          </div>
        );
      }

      render(App, container);
      expect(container.innerHTML).toBe('<div>name is child, theme is dark</div>');
    });
  });

  describe('composition', () => {
    it('should update prop', ({ container }) => {
      let update: (name: string) => void;
      function App() {
        let name = 'child';
        update = (val: string) => {
          name = val;
        };
        return <Child name={name} />;
      }

      function Child({ name }: { name: string }) {
        return <div>name is {name}</div>;
      }

      render(App, container);
      expect(container.innerHTML).toBe('<div>name is child</div>');
      update('new');
      expect(container.innerHTML).toBe('<div>name is new</div>');
    });
  });
});
