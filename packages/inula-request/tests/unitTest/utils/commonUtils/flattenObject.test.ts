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

describe('flattenObject function', () => {
  it('should return an empty object if the source object is null or undefined', () => {
    expect(utils.flattenObject(null)).toEqual({});
    expect(utils.flattenObject(undefined)).toEqual({});
  });

  it('should flatten a simple object', () => {
    const sourceObj = { a: 1, b: 'hello', c: true };
    const destObj = utils.flattenObject(sourceObj);
    expect(destObj).toEqual({ a: 1, b: 'hello', c: true });
  });

  it('should flatten an object with a prototype', () => {
    const parentObj = { a: 1 };
    const sourceObj = Object.create(parentObj);
    sourceObj.b = 'hello';
    sourceObj.c = true;
    const destObj = utils.flattenObject(sourceObj);
    expect(destObj).toEqual({ a: 1, b: 'hello', c: true });
  });

  it('should filter out properties based on a property filter function', () => {
    const sourceObj = { a: 1, b: 'hello', c: true };
    const propFilter = (prop: string | symbol) => prop !== 'b';
    const destObj = utils.flattenObject(sourceObj, undefined, undefined, propFilter);
    expect(destObj).toEqual({ a: 1, c: true });
  });
});
