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

import Translation from '../../src/intl/format/Translation';
import creatI18nCache from '../../src/intl/format/cache/cache';

describe('Translation', () => {
  let translation;
  beforeEach(() => {
    // 在每个测试之前创建一个新的 Translation 实例
    const compiledMessage = ['Hello, ', ['name', 'text', null], '!'];
    const locale = 'en';
    const locales = {};
    const localeConfig = {};
    translation = new Translation(compiledMessage, locale, locales, localeConfig, creatI18nCache());
  });
  describe('formatMessage', () => {
    it('should return the message if it is not an array', () => {
      const result = translation.formatMessage('test message', jest.fn());
      expect(result).toBe('test message');
    });

    it('should concatenate string tokens in the message array', () => {
      const result = translation.formatMessage(['Hello, ', 'World!'], jest.fn());
      expect(result).toBe('Hello, World!');
    });

    it('should handle token arrays and use ctx to get the value', () => {
      const ctx = jest.fn().mockReturnValue('Hello');
      const result = translation.formatMessage([['name', 'type', 'format']], ctx);
      expect(result).toBe('Hello');
      expect(ctx).toHaveBeenCalledWith('name', 'type', 'format');
    });

    it('should skip null values returned by ctx', () => {
      const ctx = jest.fn().mockReturnValue(null);
      const result = translation.formatMessage([['name', 'type', 'format'], 'World!'], ctx);
      expect(result).toBe('{name}World!');
    });

    it('should handle nested formats in the token array', () => {
      const ctx = jest.fn((name, type, format) => format.value);
      const formatObject = {
        value: 'Hello',
      };
      const result = translation.formatMessage([['name', 'type', formatObject], ', World!'], ctx);
      expect(result).toBe('Hello, World!');
    });
    it('should return a string when compiledMessage is a string', () => {
      const compiledMessage = 'Hello, world!';
      const textFormatter = jest.fn();
      const result = translation.formatMessage(compiledMessage, textFormatter);

      expect(result).toBe('Hello, world!');
      expect(textFormatter).not.toHaveBeenCalled();
    });

    it('should format a message with placeholders', () => {
      const compiledMessage = ['Hello, ', ['name', 'text', null], '!'];
      // @ts-ignore
      const textFormatter = jest.fn((name, type, format) => {
        if (name === 'name') {
          return 'John';
        }
        return '';
      });
      const result = translation.formatMessage(compiledMessage, textFormatter);

      expect(result).toBe('Hello, John!');
      expect(textFormatter).toHaveBeenCalledWith('name', 'text', null);
      expect(textFormatter).toHaveBeenCalledTimes(1);
    });

    it('should format a message with formatted placeholders', () => {
      const compiledMessage = ['Hello, ', ['name', 'text', { text: 'Lowercase' }], '!'];
      // @ts-ignore
      const textFormatter = jest.fn((name, type, format) => {
        if (name === 'name') {
          return 'John';
        }
        return '';
      });
      const result = translation.formatMessage(compiledMessage, textFormatter);

      expect(result).toBe('Hello, John!');
      expect(textFormatter).toHaveBeenCalledWith('name', 'text', { text: 'Lowercase' });
      expect(textFormatter).toHaveBeenCalledTimes(1);
    });

    it('should recursively format a message with nested placeholders', () => {
      const compiledMessage = [
        'Hello, ',
        ['name', 'text', null],
        '! Your age is ',
        ['age', 'number', { style: 'decimal' }],
        '.',
      ];
      // @ts-ignore
      const textFormatter = jest.fn((name, type, format) => {
        if (name === 'name') {
          return 'John';
        } else if (name === 'age') {
          return '30';
        }
        return '';
      });
      const result = translation.formatMessage(compiledMessage, textFormatter);

      expect(result).toBe('Hello, John! Your age is 30.');
      expect(textFormatter).toHaveBeenCalledWith('name', 'text', null);
      expect(textFormatter).toHaveBeenCalledWith('age', 'number', { style: 'decimal' });
      expect(textFormatter).toHaveBeenCalledTimes(2);
    });
  });
});
