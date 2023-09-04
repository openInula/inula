/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
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
