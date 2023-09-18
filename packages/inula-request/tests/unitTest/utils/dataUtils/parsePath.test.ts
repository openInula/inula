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

import { parsePath } from '../../../../src/utils/dataUtils/getJSONByFormData';

describe('parsePath function', () => {
  it('should parse path correctly', () => {
    expect(parsePath('users[0].name')).toEqual(['users', '0', 'name']);
    expect(parsePath('books[2][title]')).toEqual(['books', '2', 'title']);
    expect(parsePath('')).toEqual([]);
    expect(parsePath('property')).toEqual(['property']);
  });
});
