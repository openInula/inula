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

import deepMerge from '../../../../src/utils/configUtils/deepMerge';

describe('deepMerge function', () => {
  it('should return an empty object if no arguments are passed', () => {
    expect(deepMerge()).toEqual({});
  });

  it('should merge two objects', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { b: { d: 3 }, e: 4 };
    expect(deepMerge(obj1, obj2)).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 });
  });

  it('should merge three or more objects', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { b: { d: 3 }, e: 4 };
    const obj3 = { f: 5 };
    expect(deepMerge(obj1, obj2, obj3)).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4, f: 5 });
  });

  it('should merge objects which later overlap', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { b: { c: 1, d: 3 }, e: 4 };
    expect(deepMerge(obj1, obj2)).toEqual({ a: 1, b: { c: 1, d: 3 }, e: 4 });
  });
});
