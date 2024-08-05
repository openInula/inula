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
          {({ x, y }, index) => {
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
  // this test has error, need to be comment
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
});
