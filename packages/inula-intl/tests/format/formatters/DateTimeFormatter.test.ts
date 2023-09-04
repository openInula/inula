/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */

import { DateTimeFormatter } from '../../../index';

describe('DateTimeFormatter', () => {
  const date = new Date('2023-04-03T12:34:56Z');
  it('date formatter is memoized', async () => {
    const firstRunt0 = performance.now();
    const dateTimeFormatter1 = new DateTimeFormatter('es', {});
    dateTimeFormatter1.dateTimeFormat(new Date());
    const firstRunt1 = performance.now();
    const firstRunResult = firstRunt1 - firstRunt0;

    const seconddRunt0 = performance.now();
    const dateTimeFormatter2 = new DateTimeFormatter('es', {}, false);
    dateTimeFormatter2.dateTimeFormat(new Date());
    const seconddRunt1 = performance.now();
    const secondRunResult = seconddRunt1 - seconddRunt0;

    expect(secondRunResult).toBeLessThan(firstRunResult);
  });

  it('should format a date using default options', () => {
    const formatted = new DateTimeFormatter('en').dateTimeFormat(date);
    expect(formatted).toEqual('4/3/2023');
  });

  it('should format a date using custom options', () => {
    const formatted = new DateTimeFormatter('en-US', { weekday: 'long' }).dateTimeFormat(date);
    expect(formatted).toEqual('Monday');
  });

  it('should parse a date string and format it', () => {
    const formatted = new DateTimeFormatter('en-US').dateTimeFormat(date.toISOString());
    expect(formatted).toEqual('4/3/2023');
  });

  it('should memoize formatter instances by options and locales', () => {
    const spy = jest.spyOn(Intl, 'DateTimeFormat');
    const formatter1 = new DateTimeFormatter('en-US', { month: 'short' });
    const formatter2 = new DateTimeFormatter('en-US', { month: 'short' });
    const formatter3 = new DateTimeFormatter('en-GB', { month: 'short' });
    formatter1.dateTimeFormat(date);
    formatter2.dateTimeFormat(date);
    formatter3.dateTimeFormat(date);
    expect(spy).toHaveBeenCalledWith('en-US', { month: 'short' });
    expect(spy).toHaveBeenCalledWith('en-GB', { month: 'short' });
  });

  it('should not memoize formatter instances when memoize is false', () => {
    const spy = jest.spyOn(Intl, 'DateTimeFormat');
    const formatter1 = new DateTimeFormatter('en-US', { month: 'short' }, false);
    const formatter2 = new DateTimeFormatter('en-US', { month: 'short' }, false);
    formatter1.dateTimeFormat(date);
    formatter2.dateTimeFormat(date);
    expect(spy).toHaveBeenCalledTimes(5);
    expect(spy).toHaveBeenCalledWith('en-US', { month: 'short' });
  });
  it('should format a Date object correctly', () => {
    const formatter = new DateTimeFormatter('en-US');
    const date = new Date(2023, 0, 1);
    const formatted = formatter.dateTimeFormat(date);
    expect(formatted).toEqual('1/1/2023');
  });

  it('should format a string representation of date correctly', () => {
    const formatter = new DateTimeFormatter('en-US');
    const dateString = '2023-01-01';
    const formatted = formatter.dateTimeFormat(dateString);
    expect(formatted).toEqual('1/1/2023');
  });

  it('should format using specified format options', () => {
    const formatter = new DateTimeFormatter('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const date = new Date(2023, 0, 1);
    const formatted = formatter.dateTimeFormat(date);
    expect(formatted).toEqual('January 1, 2023');
  });

  it('should format using memorized formatter when useMemorize is true', () => {
    const formatter = new DateTimeFormatter('en-US',{"year":'numeric'}, true);
    const date = new Date(2023, 0, 1);
    const formatted1 = formatter.dateTimeFormat(date);
    const formatted2 = formatter.dateTimeFormat(date);
    expect(formatted1).toEqual(formatted2);
  });
});
