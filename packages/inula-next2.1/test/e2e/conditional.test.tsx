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
/**
 * @jsxImportSource @openinula/next
 */

import { describe, expect, vi } from 'vitest';
import { domTest as it } from './utils';
import { render, useContext, createContext } from '../../src';

vi.mock('../../src/scheduler', async () => {
  return {
    schedule: (task: () => void) => {
      task();
    },
  };
});

describe('rendering', () => {
  it('should switch from empty conditional nodes', ({ container }) => {
    let set: (num: number) => void;

    function App() {
      let count = 0;
      set = (val: number) => {
        count = val;
      };

      function text() {
        return 'Hello';
      }

      return (
        <div>
          <if cond={count > 0}>{text()}</if>
        </div>
      );
    }

    render(App(), container);
    expect(container.innerHTML).toBe('<div></div>');
    set(1);
    expect(container.innerHTML).toBe('<div>Hello</div>');
  });

  it('should support nested if', ({ container }) => {
    let next: (num: number) => void;

    function TrafficLight() {
      let lightIndex = 0;

      let light = lightIndex ? 'green' : 'red';

      function nextLight() {
        lightIndex = (lightIndex + 1) % 2;
      }

      next = nextLight;

      return (
        <>
          <button onClick={nextLight}>Next light</button>
          <p>Light is: {light}</p>
          <p>
            You must:
            <if cond={light === 'red'}>
              <span>STOP</span>
            </if>
            <else-if cond={light === 'green'}>
              <span>GO</span>
            </else-if>
          </p>
        </>
      );
    }
    render(TrafficLight(), container);
    expect(container.innerHTML).toMatchInlineSnapshot(
      `"<button>Next light</button><p>Light is: red</p><p>You must:</p>"`
    );
    next();
    expect(container.innerHTML).toMatchInlineSnapshot();
  });

  it('should support nested context', ({ container }) => {
    let set: (num: number) => void;

    const FileContext = createContext({ level: 0, path: [] });

    // 文件夹组件
    const Folder = ({ name, children }) => {
      const { path } = useContext(FileContext);

      return <FileContext path={[...path, name]}>{children}</FileContext>;
    };

    // 文件组件
    const File = ({ name }) => {
      const { path } = useContext(FileContext);
      return (
        <div>
          {path.join(',')},{name}
        </div>
      );
    };

    // 示例用法
    const FileSystem = () => {
      return (
        <Folder name="root">
          <File name="file1.txt" />
          <Folder name="Subfolder 2">
            <File name="file5.txt" />
          </Folder>
        </Folder>
      );
    };

    render(FileSystem(), container);
    expect(container.innerHTML).toMatchInlineSnapshot(
      `"<div>root,file1.txt</div><div>root,Subfolder 2,file1.txt</div>"`
    );
  });
});
