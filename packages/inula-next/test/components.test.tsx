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
    it('should support ref', ({ container }) => {
      let ref: HTMLElement;

      function App() {
        let count = 0;
        let _ref: HTMLElement;

        didMount(() => {
          ref = _ref;
        });

        return <div ref={_ref}>test</div>;
      }

      render(App, container);

      expect(ref).toBeInstanceOf(HTMLElement);
    });

    it('should support ref forwarding', ({ container }) => {
      let ref: HTMLElement;

      function App() {
        let count = 0;
        let _ref: HTMLElement;

        didMount(() => {
          ref = _ref;
        });

        return <Input ref={_ref}>test</Input>;
      }

      function Input({ ref }) {
        return <input ref={ref} />;
      }

      render(App, container);
      expect(ref).toBeInstanceOf(HTMLInputElement);
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
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should support comp ref exposing', ({ container }) => {
      let ref: HTMLElement;
      const fn = vi.fn();

      function App() {
        let count = 0;
        let _ref;
        didMount(() => {
          ref = _ref;
          _ref.fn();
        });
        return <Input ref={_ref}>test</Input>;
      }

      function Input({ ref }) {
        let input;
        didMount(() => {
          ref({ fn, input });
        });
        return <input ref={input} />;
      }

      render(App, container);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(ref.input).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('env', () => {
    it('should support env', ({ container }) => {
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

    it('should support recursive env', ({ container }) => {
      // Folder is the consumer and provider at same time
      const Folder = ({ name, children }, { level = 0 }) => {
        return (
          <env level={level + 1}>
            <div>
              <h1>{`Folder: ${name}, level: ${level}`}</h1>
              {children}
            </div>
          </env>
        );
      };
      const File = ({ name }, { level }) => {
        return <div>{`File: ${name}, level: ${level}`}</div>;
      };

      const App = () => {
        return (
          <Folder name="Root">
            <File name="file1.txt" />
            <Folder name="Subfolder 2">
              <File name="file2.txt" />
            </Folder>
          </Folder>
        );
      };

      render(App, container);
      expect(container).toMatchInlineSnapshot(`
        <div>
          <div>
            <h1>
              Folder: Root, level: 0
            </h1>
            <div>
              File: file1.txt, level: 1
            </div>
            <div>
              <h1>
                Folder: Subfolder 2, level: 1
              </h1>
              <div>
                File: file2.txt, level: 2
              </div>
            </div>
          </div>
        </div>
      `);
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
