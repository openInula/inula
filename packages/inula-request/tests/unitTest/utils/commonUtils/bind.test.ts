/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
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

import utils from '../../../../src/utils/commonUtils/utils';

describe('bind function', () => {
  it('should return a new function', () => {
    const fn = () => {};
    const boundFn = utils.bind(fn, {});
    expect(boundFn).toBeInstanceOf(Function);
    expect(boundFn).not.toBe(fn);
  });

  it('should call original function with correct this value', () => {
    const thisArg = { name: 'Alice' };
    const fn = function (this: any) {
      return this['name'];
    };
    const boundFn = utils.bind(fn, thisArg);
    const result = boundFn();
    expect(result).toBe('Alice');
  });

  it('should pass arguments to the original function', () => {
    const fn = (a: number, b: number) => a + b;
    const boundFn = utils.bind(fn, {});
    const result = boundFn(2, 3);
    expect(result).toBe(5);
  });
});
