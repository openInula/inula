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

describe('getNormalizedValue function', () => {
  it('should return the same value if it is false or null', () => {
    expect(utils.getNormalizedValue(false)).toBe(false);
    expect(utils.getNormalizedValue(null)).toBe(null);
  });

  it('should convert the value to string if it is not false or null', () => {
    expect(utils.getNormalizedValue('test')).toBe('test');
    expect(utils.getNormalizedValue(123)).toBe('123');
    expect(utils.getNormalizedValue(true)).toBe('true');
  });

  it('should recursively normalize array values', () => {
    expect(utils.getNormalizedValue(['foo', 'bar', 123])).toEqual(['foo', 'bar', '123']);
    expect(utils.getNormalizedValue(['test', false, null])).toEqual(['test', false, null]);
    expect(utils.getNormalizedValue(['one', ['two', 'three']])).toEqual(['one', ['two', 'three']]);
  });
});
