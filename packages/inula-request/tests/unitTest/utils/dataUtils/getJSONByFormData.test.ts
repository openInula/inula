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

import getJSONByFormData from '../../../../src/utils/dataUtils/getJSONByFormData';

describe('getJSONByFormData function', () => {
  it('should convert FormData to JSON object', () => {
    const formData = new FormData();
    formData.append('name', 'John');
    formData.append('age', '30');

    const result = getJSONByFormData(formData);

    expect(result).toEqual({
      name: 'John',
      age: '30',
    });
  });

  it('should return null if FormData or entries() is not available', () => {
    const invalidFormData = {} as FormData;
    const result = getJSONByFormData(invalidFormData);

    expect(result).toBeNull();
  });

  it('should handle empty FormData', () => {
    const emptyFormData = new FormData();

    const result = getJSONByFormData(emptyFormData);

    expect(result).toEqual({});
  });
});