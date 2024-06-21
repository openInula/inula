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
import { render } from '../src';

vi.mock('../src/scheduler', async () => {
  return {
    schedule: (task: () => void) => {
      task();
    },
  };
});
describe('for', () => {
  it('should work', ({ container }) => {
    function App() {
      const arr = [0, 1, 2];
      return <for each={arr}>{item => <div>{item}</div>}</for>;
    }

    render(App, container);
    expect(container.innerHTML).toMatchInlineSnapshot(`"<div>0</div><div>1</div><div>2</div>"`);
  });

  it('should update item when arr changed', ({ container }) => {
    let updateArr: (num: number) => void;

    function App() {
      const arr = [0, 1, 2];
      updateArr = (num: number) => {
        arr.push(num);
      };
      return <for each={arr}>{item => <div>{item}</div>}</for>;
    }

    render(App, container);
    expect(container.children.length).toEqual(3);
    updateArr(3);
    expect(container.children.length).toEqual(4);
    expect(container.innerHTML).toMatchInlineSnapshot(`"<div>0</div><div>1</div><div>2</div><div>3</div>"`);
  });

  it('should get index', ({ container }) => {
    let update: (num: number) => void;
    function App() {
      const arr = [0, 1, 2];
      update = (num: number) => {
        arr.push(num);
      };
      return <for each={arr}>{(item, index) => <div>{index}</div>}</for>;
    }

    render(App, container);
    expect(container.innerHTML).toMatchInlineSnapshot(`"<div>0</div><div>1</div><div>2</div>"`);
    update(3);
    expect(container.innerHTML).toMatchInlineSnapshot(`"<div>0</div><div>1</div><div>2</div><div>3</div>"`);
  });
});
