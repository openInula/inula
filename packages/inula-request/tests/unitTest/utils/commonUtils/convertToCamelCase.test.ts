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

describe('convertToCamelCase function', () => {
  it('should convert kebab case to camel case', () => {
    const input = 'my-first-post';
    const expectedOutput = 'myFirstPost';
    const result = utils.convertToCamelCase(input);
    expect(result).toBe(expectedOutput);
  });

  it('should convert snake case to camel case', () => {
    const input = 'my_snake_case_post';
    const expectedOutput = 'mySnakeCasePost';
    const result = utils.convertToCamelCase(input);
    expect(result).toBe(expectedOutput);
  });

  it('should convert space separated words to camel case', () => {
    const input = 'my space separated words';
    const expectedOutput = 'mySpaceSeparatedWords';
    const result = utils.convertToCamelCase(input);
    expect(result).toBe(expectedOutput);
  });

  it('should handle already camel cased words', () => {
    const input = 'myCamelCasedWords';
    const expectedOutput = 'myCamelCasedWords';
    const result = utils.convertToCamelCase(input);
    expect(result).toBe(expectedOutput);
  });

  it('should handle empty input', () => {
    const input = '';
    const expectedOutput = '';
    const result = utils.convertToCamelCase(input);
    expect(result).toBe(expectedOutput);
  });

  it('should handle input with only one word', () => {
    const input = 'hello';
    const expectedOutput = 'hello';
    const result = utils.convertToCamelCase(input);
    expect(result).toBe(expectedOutput);
  });
});
