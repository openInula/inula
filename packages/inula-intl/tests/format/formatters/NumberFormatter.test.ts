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

import { NumberFormatter } from '../../../src/intl';
import creatI18nCache from '../../../src/intl/format/cache/cache';

describe('NumberFormatter', () => {
  it('number formatter is memoized', async () => {
    const firstRunt0 = performance.now();
    const numberFormatter1 = new NumberFormatter('es', {});
    numberFormatter1.numberFormat(10000);
    const firstRunt1 = performance.now();
    const firstRunResult = firstRunt1 - firstRunt0;

    const seconddRunt0 = performance.now();
    const numberFormatter = new NumberFormatter('es', {});
    numberFormatter.numberFormat(10000);
    const secondRunt1 = performance.now();
    const secondRunResult = secondRunt1 - seconddRunt0;

    expect(secondRunResult).toBeLessThan(firstRunResult);
  });

  it('formats a number with default options', () => {
    const format = new NumberFormatter('en-US');
    expect(format.numberFormat(1000)).toBe('1,000');
  });

  it('formats a number with custom options', () => {
    const format = new NumberFormatter('en-US', { style: 'currency', currency: 'USD' });
    expect(format.numberFormat(1000)).toBe('$1,000.00');
  });

  it('does not memoize the formatter with different options', () => {
    const format1 = new NumberFormatter('en-US', { style: 'currency', currency: 'USD' });
    const format2 = new NumberFormatter('en-US', { style: 'currency', currency: 'EUR' });
    expect(format1).not.toBe(format2);
  });

  it('formats negative numbers', () => {
    const format = new NumberFormatter('en-US', { style: 'currency', currency: 'USD' });
    expect(format.numberFormat(-1000)).toBe('-$1,000.00');
  });

  it('formats numbers with different locales', () => {
    const format1 = new NumberFormatter('en-US', { style: 'currency', currency: 'USD' });
    const format2 = new NumberFormatter('fr-FR', { style: 'currency', currency: 'EUR' });
    expect(format1.numberFormat(1000)).toBe('$1,000.00');
  });
  it('should format a positive number correctly', () => {
    const formatter = new NumberFormatter('en-US');
    const number = 12345.6789;
    const formatted = formatter.numberFormat(number);
    expect(formatted).toEqual('12,345.679');
  });

  it('should format a negative number correctly', () => {
    const formatter = new NumberFormatter('en-US');
    const number = -12345.6789;
    const formatted = formatter.numberFormat(number);
    expect(formatted).toEqual('-12,345.679');
  });

  it('should format using specified format options', () => {
    const formatOptions = { style: 'currency', currency: 'EUR' };
    const formatter = new NumberFormatter('en-US', formatOptions);
    const number = 12345.6789;
    const formatted = formatter.numberFormat(number);
    expect(formatted).toEqual('€12,345.68');
  });

  it('should format using memorized formatter when useMemorize is true', () => {
    const formatter = new NumberFormatter('en-US', undefined, creatI18nCache());
    const number = 12345.6789;
    const formatted1 = formatter.numberFormat(number);
    const formatted2 = formatter.numberFormat(number);
    expect(formatted1).toEqual(formatted2);
  });

  it('should create a new formatter when useMemorize is false', () => {
    const formatter = new NumberFormatter('en-US', undefined);
    const number = 12345.6789;
    const formatted1 = formatter.numberFormat(number);
    const formatted2 = formatter.numberFormat(number);
    expect(formatted1).toEqual(formatted2);
  });
});
