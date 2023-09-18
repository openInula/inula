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

describe('stringifySafely function', () => {
  it('should return the input string if it is a valid JSON string', () => {
    const input = '{"a": 1, "b": 2}';
    const result = utils.stringifySafely(input);
    expect(result).toBe(input.trim());
  });

  it('should call the parser function if it is provided', () => {
    const input = '{"a": 1, "b": 2}';
    const parser = jest.fn().mockReturnValue({ a: 1, b: 2 });
    const result = utils.stringifySafely(input, parser);
    expect(result).toBe(input.trim());
    expect(parser).toHaveBeenCalledWith(input);
  });

  it('should throw an error if the parser function throws an error', () => {
    const input = '{"a": 1, "b": 2}';
    const parser = jest.fn().mockImplementation(() => {
      throw new Error('Invalid JSON');
    });
    expect(() => utils.stringifySafely(input, parser)).toThrow('Invalid JSON');
  });

  it('should use the encoder function to stringify the input', () => {
    const input = { a: 1, b: 2 };
    const encoder = jest.fn().mockReturnValue('{"a":1,"b":2}');
    const result = utils.stringifySafely(input, undefined, encoder);
    expect(result).toBe('{"a":1,"b":2}');
    expect(encoder).toHaveBeenCalledWith(input);
  });
});
