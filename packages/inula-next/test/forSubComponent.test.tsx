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
describe('for sub component', () => {
  it.fails('should transform for loop', ({ container }) => {
    function MyComp() {
      let name = 'test';
      let arr = [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
      ];
      return (
        <for each={arr}>
          {' '}
          {({ x, y }, index) => {
            let name1 = 'test';
            const onClick = () => {
              name1 = 'test2';
            };
            return (
              <div className={name} onClick={onClick} style={{ x: index }}>
                {name1}
              </div>
            );
          }}
        </for>
      );
    }
    render(MyComp, container);
    expect(container.innerHTML).toBe('<div><div>1</div><div>2</div><div>3</div><div>4</div></div>');
  });
});
