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

import getMergedConfig from '../../../../src/utils/configUtils/getMergedConfig';

describe('getMergedConfig function', () => {
  it('should merge two configs correctly', () => {
    const config1 = {
      baseURL: 'https://example.com/api',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    };

    const config2 = {
      method: 'POST',
      data: { name: 'John', age: 25 },
      headers: { Authorization: 'Bearer token' },
      responseType: 'json',
    };

    const mergedConfig = getMergedConfig(config1, config2);

    expect(mergedConfig).toEqual({
      baseURL: 'https://example.com/api',
      method: 'POST',
      data: { name: 'John', age: 25 },
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
      timeout: 5000,
      responseType: 'json',
    });
  });

  it('should handle missing or undefined config values', () => {
    const config1 = {
      baseURL: 'https://example.com/api',
      headers: { 'Content-Type': 'application/json' },
    };

    const config2 = {
      method: 'POST',
      data: { name: 'John', age: 25 },
      headers: undefined,
    };

    const mergedConfig = getMergedConfig(config1, config2);

    expect(mergedConfig).toEqual({
      baseURL: 'https://example.com/api',
      method: 'POST',
      data: { name: 'John', age: 25 },
      headers: { 'Content-Type': 'application/json' },
    });
  });
});
