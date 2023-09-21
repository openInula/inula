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

describe('toBooleanObject function', () => {
  it('should return an object with boolean properties', () => {
    const result = utils.toBooleanObject('foo,bar,baz', ',');
    expect(result).toEqual({
      'foo': true,
      'bar': true,
      'baz': true,
    });
  });

  it('should handle an array of strings as input', () => {
    const result = utils.toBooleanObject(['foo', 'bar', 'baz']);
    expect(result).toEqual({
      'foo': true,
      'bar': true,
      'baz': true,
    });
  });

  it('should return an empty object for empty input', () => {
    const result = utils.toBooleanObject('');
    expect(result).toEqual({});
  });

  it('should handle custom delimiter', () => {
    const result = utils.toBooleanObject('foo|bar|baz', '|');
    expect(result).toEqual({
      'foo': true,
      'bar': true,
      'baz': true,
    });
  });

  it('should handle spaces in input', () => {
    const result = utils.toBooleanObject('foo, bar, baz', ',');
    expect(result).toEqual({
      'foo': true,
      'bar': true,
      'baz': true,
    });
  });
});

