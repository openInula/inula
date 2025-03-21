/*
 * Copyright (c) 2025 Huawei Technologies Co.,Ltd.
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
import { render, watch, untrack } from '../../src';

vi.mock('../../src/scheduler', async () => {
  return {
    schedule: (task: () => void) => {
      task();
    },
  };
});

describe('Untrack', () => {
  it('Should not reactive with untrack', ({ container }) => {
    const fn = vi.fn();
    function HelloWorld() {
      let a = 0;
      let b = 0;
      watch(() => {
        fn(untrack(() => a) + b);
      });
      return (
        <>
          <button
            id="a-btn"
            onClick={() => {
              a++;
            }}
          >
            a: {a}
          </button>
          <button
            id="b-btn"
            onClick={() => {
              b++;
            }}
          >
            b: {b}
          </button>
        </>
      );
    }

    render(HelloWorld(), container);
    expect(fn).toHaveBeenCalledTimes(1);
    document.getElementById('a-btn')!.click();
    // `a` is not reactive with untrack
    expect(fn).toHaveBeenCalledTimes(1);
    document.getElementById('b-btn')!.click();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith(2);
  });
});
