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

describe('objectToQueryString function', () => {
  it('should return empty string if object is empty', () => {
    const input = {};
    const expectedResult = '';
    const result = utils.objectToQueryString(input);
    expect(result).toBe(expectedResult);
  });

  it('should return a query string with one parameter', () => {
    const input = { key: 'value' };
    const expectedResult = 'key=value';
    const result = utils.objectToQueryString(input);
    expect(result).toBe(expectedResult);
  });

  it('should return a query string with multiple parameters', () => {
    const input = { key1: 'value1', key2: 'value2' };
    const expectedResult = 'key1=value1&key2=value2';
    const result = utils.objectToQueryString(input);
    expect(result).toBe(expectedResult);
  });

  it('should encode keys and values', () => {
    const input = { 'key with spaces': 'value with spaces' };
    const expectedResult = 'key%20with%20spaces=value%20with%20spaces';
    const result = utils.objectToQueryString(input);
    expect(result).toBe(expectedResult);
  });

  it('should handle values of different types', () => {
    const input = {
      key1: 'string',
      key2: 42,
      key3: true,
      key4: [1, 2, 3],
      key5: { a: 'b' },
    };
    const expectedResult =
      'key1=string&key2=42&key3=true&key4=1%2C2%2C3&key5=%5Bobject%20Object%5D';
    const result = utils.objectToQueryString(input);
    expect(result).toBe(expectedResult);
  });
});
