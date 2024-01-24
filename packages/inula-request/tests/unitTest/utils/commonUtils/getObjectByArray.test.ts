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

describe('getObjectByArray function', () => {
  it('should convert array to object with correct key-value pairs', () => {
    const arr = ['a', 'b', 'c'];
    const expected = {
      '0': 'a',
      '1': 'b',
      '2': 'c',
    };
    const result = utils.getObjectByArray(arr);
    expect(result).toEqual(expected);
  });

  it('should return an empty object if the input array is empty', () => {
    const arr: any[] = [];
    const expected = {};
    const result = utils.getObjectByArray(arr);
    expect(result).toEqual(expected);
  });

  it('should handle arrays with non-string elements', () => {
    const arr = [1, true, { key: 'value' }];
    const expected = {
      '0': 1,
      '1': true,
      '2': { key: 'value' },
    };
    const result = utils.getObjectByArray(arr);
    expect(result).toEqual(expected);
  });
});
