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

describe('mapping to for', () => {
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
