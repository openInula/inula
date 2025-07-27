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
import { checkSelectType } from '../../src/parser/parser';

describe('checkSelectType function', () => {
  it('should return true for valid select types', () => {
    expect(checkSelectType('plural')).toBe(true);
    expect(checkSelectType('select')).toBe(true);
    expect(checkSelectType('selectordinal')).toBe(true);
  });

  it('should return false for invalid select types', () => {
    expect(checkSelectType('invalid')).toBe(false);
    expect(checkSelectType('other')).toBe(false);
    expect(checkSelectType('')).toBe(false);
  });
});
