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

import { cleanPath, scoreCompare } from '../utils';

describe('test for utils', () => {
  it('cleanPath func test', () => {
    const pattern = '/www.a.com//b//c';
    const generated = cleanPath(pattern);
    expect(generated).toBe('/www.a.com/b/c');
  });

  it('parse score compare1', function () {
    const res = [[5], [10], [10, 5]].sort((a, b) => scoreCompare(a, b));
    expect(res).toStrictEqual([[10, 5], [10], [5]]);
  });

  it('parse score compare2', function () {
    const res = [[10], [10], [10, 5]].sort((a, b) => scoreCompare(a, b));
    expect(res).toStrictEqual([[10, 5], [10], [10]]);
  });
});
