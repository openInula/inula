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

describe('getObjectKey function', () => {
  it('should return null if object is empty', () => {
    const obj = {};
    const result = utils.getObjectKey(obj, 'foo');
    expect(result).toBeNull();
  });

  it('should return null if key is not found', () => {
    const obj = { a: 1, b: 2 };
    const result = utils.getObjectKey(obj, 'c');
    expect(result).toBeNull();
  });

  it('should return matching key in case-insensitive manner', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result1 = utils.getObjectKey(obj, 'B');
    const result2 = utils.getObjectKey(obj, 'C');
    expect(result1).toBe('b');
    expect(result2).toBe('c');
  });
});
