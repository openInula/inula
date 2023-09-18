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

import checkHeaderName from '../../../../src/utils/headerUtils/checkHeaderName';

describe('checkHeaderName', () => {
  it('should return true for valid header name', () => {
    const validHeaderName = 'Content-Type';
    const result = checkHeaderName(validHeaderName);
    expect(result).toBe(true);
  });

  it('should return false for invalid header name', () => {
    const invalidHeaderName = 'Content-Type!';
    const result = checkHeaderName(invalidHeaderName);
    expect(result).toBe(false);
  });

  it('should return false for empty string', () => {
    const emptyString = '';
    const result = checkHeaderName(emptyString);
    expect(result).toBe(false);
  });
});
