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

describe('createTypeChecker function', () => {
  it('should return a function', () => {
    const result = utils.createTypeChecker('string');
    expect(result).toBeInstanceOf(Function);
  });

  it('should return true for matching type', () => {
    const isString = utils.createTypeChecker('string');
    const result = isString('hello');
    expect(result).toBe(true);
  });

  it('should return false for non-matching type', () => {
    const isString = utils.createTypeChecker('string');
    const result = isString(123);
    expect(result).toBe(false);
  });

  it('should return true for matching type', () => {
    const result = utils.checkFunction((a: number, b: number) => a + b);
    expect(result).toBe(true);
  });

  it('should return false for non-matching type', () => {
    const result = utils.checkFunction(123);
    expect(result).toBe(false);
  });

  it('should return true for matching type', () => {
    const result = utils.checkNumber(123);
    expect(result).toBe(true);
  });

  it('should return false for non-matching type', () => {
    const result = utils.checkNumber('123');
    expect(result).toBe(false);
  });

  it('should return true for matching type', () => {
    const result = utils.checkObject({ name: 'Tom' });
    expect(result).toBe(true);
  });

  it('should return false for non-matching type', () => {
    const result = utils.checkObject('123');
    expect(result).toBe(false);
  });

  it('should return true for matching type', () => {
    const result = utils.checkBoolean(true);
    expect(result).toBe(true);
  });

  it('should return false for non-matching type', () => {
    const result = utils.checkBoolean('123');
    expect(result).toBe(false);
  });

  it('should return true for matching type', () => {
    const result = utils.checkUndefined(undefined);
    expect(result).toBe(true);
  });

  it('should return false for non-matching type', () => {
    const result = utils.checkUndefined('123');
    expect(result).toBe(false);
  });

  it('should return true for matching type', () => {
    const result = utils.checkPlainObject({ name: 'Jack' });
    expect(result).toBe(true);
  });

  it('should return true for matching type', () => {
    const result = utils.checkDate(new Date());
    expect(result).toBe(true);
  });

  it('should return false for non-matching type', () => {
    const result = utils.checkDate('2023-03-30');
    expect(result).toBe(false);
  });

  it('should return true for matching type', () => {
    const result = utils.checkDate(new Date());
    expect(result).toBe(true);
  });

  it('should return false for non-matching type', () => {
    const result = utils.checkDate('2023-03-30');
    expect(result).toBe(false);
  });

  it('should return true for matching type', () => {
    const data = 'Hello, world!';
    const blob = new Blob([data], { type: 'text/plain' });
    const result = utils.checkBlob(blob);
    expect(result).toBe(true);
  });

  it('should return false for non-matching type', () => {
    const result = utils.checkFile('test.txt');
    expect(result).toBe(false);
  });
});
