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
  it('should transform for loop', ({ container }) => {
    function MyComp() {
      let name = 'test';
      let arr = [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
      ];
      return (
        <for each={arr}>
          {({ x, y }: { x: number; y: number }, index) => {
            let name1 = 'test';
            const onClick = () => {
              name1 = 'changed';
            };
            return (
              <div onClick={onClick} id={`item${index}`}>
                {name1}
                {index}
              </div>
            );
          }}
        </for>
      );
    }

    render(MyComp, container);
    expect(container.innerHTML).toBe(
      '<div id="item0">test0</div><div id="item1">test1</div><div id="item2">test2</div>'
    );
    const item = container.querySelector('#item0') as HTMLDivElement;
    item.click();
    expect(container.innerHTML).toBe(
      '<div id="item0">changed0</div><div id="item1">test1</div><div id="item2">test2</div>'
    );
  });

  it('should transform map to for jsx element', ({ container }) => {
    function MyComp() {
      const arr = [1, 2, 3];
      return (
        <>
          {arr.map(item => (
            <div>{item}</div>
          ))}
        </>
      );
    }

    render(MyComp, container);
    expect(container.innerHTML).toBe('<div>1</div><div>2</div><div>3</div>');
  });
  it('should transform map in map to for', ({ container }) => {
    function MyComp() {
      const matrix = [
        [1, 2],
        [3, 4],
      ];
      return <div>{matrix.map(arr => arr.map(item => <div>{item}</div>))}</div>;
    }

    render(MyComp, container);
    expect(container.innerHTML).toBe('<div><div>1</div><div>2</div><div>3</div><div>4</div></div>');
  });

  // Compile error
  // it.fails('should transform last map to for" ', ({ container }) => {
  //   function MyComp() {
  //     let arr = [1, 2, 3];
  //     return (
  //       <div>
  //         {arr
  //           .map(item => <div>{item}</div>)
  //           .map(item => (
  //             <div>{item}</div>
  //           ))}
  //       </div>
  //     );
  //   }
  //
  //   render(MyComp, container);
  //   expect(container.innerHTML).toBe('<div><div>1</div><div>2</div><div>3</div><div>4</div></div>');
  // });
  it('Should correctly render a single-level loop of elements', ({ container }) => {
    function App() {
      const fruits = ['Apple', 'Banana', 'Cherry'];
      return <for each={fruits}>{fruit => <li>{fruit}</li>}</for>;
    }

    render(App, container);
    expect(container.innerHTML).toMatchInlineSnapshot(`"<li>Apple</li><li>Banana</li><li>Cherry</li>"`);
  });

  it('Should correctly render nested loops of elements', ({ container }) => {
    function App() {
      const matrix = [
        [1, 2],
        [3, 4],
        [5, 6],
      ];
      return (
        <for each={matrix}>
          {row => (
            <div>
              <for each={row}>{cell => <span>{cell}</span>}</for>
            </div>
          )}
        </for>
      );
    }

    render(App, container);
    expect(container.innerHTML).toMatchInlineSnapshot(
      `"<div><span>1</span><span>2</span></div><div><span>3</span><span>4</span></div><div><span>5</span><span>6</span></div>"`
    );
  });

  it('Should correctly render loops with complex data structures', ({ container }) => {
    function App() {
      const users = [
        { id: 1, name: 'Alice', hobbies: ['reading', 'gaming'] },
        { id: 2, name: 'Bob', hobbies: ['cycling', 'photography'] },
      ];
      return (
        <for each={users}>
          {user => (
            <div>
              <h2>{user.name}</h2>
              <ul>
                <for each={user.hobbies}>{hobby => <li>{hobby}</li>}</for>
              </ul>
            </div>
          )}
        </for>
      );
    }

    render(App, container);
    expect(container.innerHTML).toMatchInlineSnapshot(
      `"<div><h2>Alice</h2><ul><li>reading</li><li>gaming</li></ul></div><div><h2>Bob</h2><ul><li>cycling</li><li>photography</li></ul></div>"`
    );
  });

  it('Should correctly render when for tag input is an array map', ({ container }) => {
    function App() {
      const numbers = [1, 2, 3, 4, 5];
      return <for each={numbers.map(n => n * 2)}>{doubledNumber => <span>{doubledNumber}</span>}</for>;
    }

    render(App, container);
    expect(container.innerHTML).toMatchInlineSnapshot(
      `"<span>2</span><span>4</span><span>6</span><span>8</span><span>10</span>"`
    );
  });
});
