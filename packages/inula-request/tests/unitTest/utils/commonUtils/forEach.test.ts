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

describe('forEach function', () => {
  it('should do nothing when input is null or undefined', () => {
    const func = jest.fn();
    utils.forEach(null, func);
    utils.forEach(undefined, func);
    expect(func).not.toHaveBeenCalled();
  });

  it('should iterate over array and call function with value, index and array', () => {
    const arr = [1, 2, 3];
    const func = jest.fn();
    utils.forEach(arr, func);
    expect(func).toHaveBeenCalledTimes(3);
    expect(func).toHaveBeenCalledWith(1, 0, arr);
    expect(func).toHaveBeenCalledWith(2, 1, arr);
    expect(func).toHaveBeenCalledWith(3, 2, arr);
  });

  it('should iterate over object and call function with value, key and object', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const func = jest.fn();
    utils.forEach(obj, func);
    expect(func).toHaveBeenCalledTimes(3);
    expect(func).toHaveBeenCalledWith(1, 'a', obj);
    expect(func).toHaveBeenCalledWith(2, 'b', obj);
    expect(func).toHaveBeenCalledWith(3, 'c', obj);
  });

  it('should include all properties when options.includeAll is true', () => {
    const obj = Object.create({ c: 3 });
    obj.a = 1;
    obj.b = 2;
    const func = jest.fn();
    utils.forEach(obj, func, { includeAll: true });
    expect(func).toHaveBeenCalledWith(1, 'a', obj);
    expect(func).toHaveBeenCalledWith(2, 'b', obj);
    expect(func).toHaveBeenCalledWith(3, 'c', obj);
  });
});
