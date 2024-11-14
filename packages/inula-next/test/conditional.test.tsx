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
import { render } from '../src';

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
      "2 is bigger than is 1"
    `);
    set(3);
    expect(container.innerHTML).toMatchInlineSnapshot(`
      "3 is bigger than is 1<div>3 is bigger than is 2</div>"
    `);
    set(2);
    expect(container.innerHTML).toMatchInlineSnapshot(`
      "2 is bigger than is 1"
    `);
  });
  it('should transform "and expression in and expression" to "if tag in if tag"', ({ container }) => {
    let set: (num: number) => void;

    function MyComp() {
      let count = 0;
      set = (val: number) => {
        count = val;
      };
      return <div>{count > 0 && count > 1 && <h1>hello world {count}</h1>}</div>;
    }

    render(MyComp, container);
    set(0);
    expect(container.innerHTML).toMatchInlineSnapshot(`"<div></div>"`);
    set(1);
    expect(container.innerHTML).toMatchInlineSnapshot(`"<div></div>"`);
    set(2);
    expect(container.innerHTML).toMatchInlineSnapshot(`"<div><h1>hello world 2</h1></div>"`);
  });

  it('should not transform "and expression" whose right is identifier', ({ container }) => {
    let set: (num: number) => void;

    function MyComp() {
      let count = 0;
      set = val => {
        count = val;
      };
      return <div>{count > 0 && count > 1 ? <h1>hello world {count}</h1> : `Empty`}</div>;
    }

    render(MyComp, container);
    set(0);
    expect(container.innerHTML).toMatchInlineSnapshot(`"<div>Empty</div>"`);
    set(1);
    expect(container.innerHTML).toMatchInlineSnapshot(`"<div>Empty</div>"`);
    set(2);
    expect(container.innerHTML).toMatchInlineSnapshot(`"<div><h1>hello world 2</h1></div>"`);
  });

  it('should transform "condition expression in condition expression" to "if else tag in if else tag"', ({
    container,
  }) => {
    let set: (num: number) => void;

    function MyComp() {
      let count = 0;
      set = val => {
        count = val;
      };
      return <div>{count > 0 ? count > 1 ? <h1>hello world {count}</h1> : 'Empty2' : 'Empty1'}</div>;
    }

    render(MyComp, container);
    set(0);
    expect(container.innerHTML).toMatchInlineSnapshot(`"<div>Empty1</div>"`);
    set(1);
    expect(container.innerHTML).toMatchInlineSnapshot(`"<div>Empty2</div>"`);
    set(2);
    expect(container.innerHTML).toMatchInlineSnapshot(`"<div><h1>hello world 2</h1></div>"`);
  });
});

describe('additional conditional rendering tests', () => {
  it('Should correctly render content based on a single if condition', ({ container }) => {
    let set: (num: number) => void;

    function App() {
      let count = 0;
      set = (val: number) => {
        count = val;
      };
      return (
        <div>
          <if cond={count > 5}>Count is greater than 5</if>
        </div>
      );
    }

    render(App, container);
    expect(container.innerHTML).toBe('<div></div>');
    set(6);
    expect(container.innerHTML).toBe('<div>Count is greater than 5</div>');
  });

  it('Should correctly render content based on if-else conditions', ({ container }) => {
    let set: (num: number) => void;

    function App() {
      let count = 0;
      set = (val: number) => {
        count = val;
      };
      return (
        <div>
          <if cond={count % 2 === 0}>Count is even</if>
          <else>Count is odd</else>
        </div>
      );
    }

    render(App, container);
    expect(container.innerHTML).toBe('<div>Count is even</div>');
    set(1);
    expect(container.innerHTML).toBe('<div>Count is odd</div>');
    set(2);
    expect(container.innerHTML).toBe('<div>Count is even</div>');
  });

  it('Should correctly render content based on if-else-if-else conditions', ({ container }) => {
    let set: (num: number) => void;

    function App() {
      let count = 0;
      set = (val: number) => {
        count = val;
      };
      return (
        <div>
          <if cond={count > 10}>Count is greater than 10</if>
          <else-if cond={count > 5}>Count is greater than 5 but not greater than 10</else-if>
          <else-if cond={count > 0}>Count is greater than 0 but not greater than 5</else-if>
          <else>Count is 0 or negative</else>
        </div>
      );
    }

    render(App, container);
    expect(container.innerHTML).toBe('<div>Count is 0 or negative</div>');
    set(3);
    expect(container.innerHTML).toBe('<div>Count is greater than 0 but not greater than 5</div>');
    set(7);
    expect(container.innerHTML).toBe('<div>Count is greater than 5 but not greater than 10</div>');
    set(11);
    expect(container.innerHTML).toBe('<div>Count is greater than 10</div>');
  });

  it('Should correctly handle nested conditional rendering', ({ container }) => {
    let set: (obj: { x: number; y: number }) => void;

    function App() {
      let state = { x: 0, y: 0 };
      set = (val: { x: number; y: number }) => {
        state = val;
      };
      return (
        <div>
          <if cond={state.x > 0}>
            X is positive
            <if cond={state.y > 0}>
              <div>Both X and Y are positive</div>
            </if>
            <else>
              <div>X is positive but Y is not</div>
            </else>
          </if>
          <else>
            X is not positive
            <if cond={state.y > 0}>
              <div>X is not positive but Y is</div>
            </if>
            <else>
              <div>Neither X nor Y are positive</div>
            </else>
          </else>
        </div>
      );
    }

    render(App, container);
    expect(container.innerHTML).toBe('<div>X is not positive<div>Neither X nor Y are positive</div></div>');
    set({ x: 1, y: 0 });
    expect(container.innerHTML).toBe('<div>X is positive<div>X is positive but Y is not</div></div>');
    set({ x: 1, y: 1 });
    expect(container.innerHTML).toBe('<div>X is positive<div>Both X and Y are positive</div></div>');
    set({ x: 0, y: 1 });
    expect(container.innerHTML).toBe('<div>X is not positive<div>X is not positive but Y is</div></div>');
  });
});
