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

describe('forEachEntry function', () => {
  const callback = jest.fn();
  it('should call the callback function for each entry in a plain object', () => {
    const obj = { a: 1, b: 2, c: 3 };
    utils.forEachEntry(obj, callback);
    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenCalledWith('a', 1);
    expect(callback).toHaveBeenCalledWith('b', 2);
    expect(callback).toHaveBeenCalledWith('c', 3);
  });

  it('should call the callback function for each entry in a Map object', () => {
    const obj = new Map([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);
    utils.forEachEntry(obj, callback);
    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenCalledWith('a', 1);
    expect(callback).toHaveBeenCalledWith('b', 2);
    expect(callback).toHaveBeenCalledWith('c', 3);
  });

  it('should not call the callback function for non-enumerable properties', () => {
    const obj = Object.create(
      {},
      {
        a: { value: 1, enumerable: true },
        b: { value: 2, enumerable: false },
        c: { value: 3, enumerable: true },
      }
    );
    utils.forEachEntry(obj, callback);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith('a', 1);
    expect(callback).toHaveBeenCalledWith('c', 3);
  });
});
