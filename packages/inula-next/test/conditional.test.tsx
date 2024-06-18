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

describe('conditional rendering', () => {
  it('should if, else, else if', ({ container }) => {
    let set: (num: number) => void;

    function App() {
      let count = 2;
      set = (val: number) => {
        count = val;
      };
      return (
        <>
          <if cond={count > 1}>{count} is bigger than is 1</if>
          <else-if cond={count === 1}>{count} is equal to 1</else-if>
          <else>{count} is smaller than 1</else>
        </>
      );
    }

    render(App, container);
    expect(container.innerHTML).toBe('2 is bigger than is 1');
    set(1);
    expect(container.innerHTML).toBe('1 is equal to 1');
    set(0);
    expect(container.innerHTML).toBe('0 is smaller than 1');
  });

  it('should support nested if', ({ container }) => {
    let set: (num: number) => void;

    function App() {
      let count = 0;
      set = (val: number) => {
        count = val;
      };
      return (
        <if cond={count > 1}>
          {count} is bigger than is 1
          <if cond={count > 2}>
            <div>{count} is bigger than is 2</div>
          </if>
        </if>
      );
    }

    render(App, container);
    expect(container.innerHTML).toMatchInlineSnapshot(`""`);
    set(2);
    expect(container.innerHTML).toMatchInlineSnapshot(`
      "2 is bigger than is 1
                "
    `);
    set(3);
    expect(container.innerHTML).toMatchInlineSnapshot(`
      "3 is bigger than is 1
                <div>3 is bigger than is 2</div>"
    `);
    set(2);
    expect(container.innerHTML).toMatchInlineSnapshot(`
      "2 is bigger than is 1
                "
    `);
  });
});
