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

import { parseKeyValuePairs } from '../../../../src/utils/headerUtils/processValueByParser';

describe('parseKeyValuePairs function', () => {
  it('should parse key-value pairs separated by commas', () => {
    const input = 'key1=value1, key2=value2, key3=value3';
    const expectedOutput = {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    };
    const result = parseKeyValuePairs(input);
    expect(result).toEqual(expectedOutput);
  });

  it('should parse key-value pairs separated by semicolons', () => {
    const input = 'key1=value1; key2=value2; key3=value3';
    const expectedOutput = {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    };
    const result = parseKeyValuePairs(input);
    expect(result).toEqual(expectedOutput);
  });

  it('should parse key-value pairs with no spaces', () => {
    const input = 'key1=value1,key2=value2,key3=value3';
    const expectedOutput = {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    };
    const result = parseKeyValuePairs(input);
    expect(result).toEqual(expectedOutput);
  });

  it('should parse key-value pairs with leading/trailing spaces', () => {
    const input = '  key1 = value1 , key2 = value2 , key3 = value3  ';
    const expectedOutput = {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    };
    const result = parseKeyValuePairs(input);
    expect(result).toEqual(expectedOutput);
  });

  it('should parse key-value pairs with spaces', () => {
    const input = 'key1=value1, key2=value with spaces, key3=value3';
    const expectedOutput = {
      key1: 'value1',
      key2: 'value with spaces',
      key3: 'value3',
    };
    const result = parseKeyValuePairs(input);
    expect(result).toEqual(expectedOutput);
  });

  it('should return an empty object for empty input', () => {
    const input = '';
    const expectedOutput = {};
    const result = parseKeyValuePairs(input);
    expect(result).toEqual(expectedOutput);
  });
});
