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

describe('state', () => {
  it('should support "++"', ({ container }) => {
    let incrementCount: () => void;
    function UserInput() {
      let count = 0;
      incrementCount = () => {
        count++;
      };

      return <h1>{count}</h1>;
    }
    render(UserInput, container);
    expect(container.innerHTML).toBe('<h1>0</h1>');
    incrementCount();
    expect(container.innerHTML).toBe('<h1>1</h1>');
  });
});
