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
import utils from '../../src/utils/utils';

describe('generateKey', () => {
  it('should generate a key for a single locale without options', () => {
    const result = utils.generateKey('en');
    expect(result).toBe('en:{}');
  });

  it('should generate a key for multiple locales without options', () => {
    const result = utils.generateKey(['en', 'fr']);
    expect(result).toBe('en-fr:{}');
  });

  it('should sort multiple locales before generating the key', () => {
    const result = utils.generateKey(['fr', 'en']);
    expect(result).toBe('en-fr:{}');
  });

  it('should generate a key with options for a single locale', () => {
    const result = utils.generateKey('en', { foo: 'bar' });
    expect(result).toBe('en:{"foo":"bar"}');
  });

  it('should generate a key with options for multiple locales', () => {
    const result = utils.generateKey(['en', 'fr'], { foo: 'bar' });
    expect(result).toBe('en-fr:{"foo":"bar"}');
  });

  it('should sort multiple locales and consider options before generating the key', () => {
    const result = utils.generateKey(['fr', 'en'], { foo: 'bar' });
    expect(result).toBe('en-fr:{"foo":"bar"}');
  });
});
