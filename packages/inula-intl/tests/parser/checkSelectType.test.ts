/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
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
