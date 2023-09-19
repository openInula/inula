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

import ruleUtils from '../../src/utils/parseRuleUtils';

describe('ruleUtils test', () => {
  describe('getRegGroups function', () => {
    it('should return the correct number of capturing groups in the regular expression pattern', () => {
      const pattern1 = 'abc(def)ghi(jkl)mno';
      const pattern2 = 'abc(def)ghi';
      const pattern3 = 'abc';
      const pattern4 = '';

      const result1 = ruleUtils.getRegGroups(pattern1);
      const result2 = ruleUtils.getRegGroups(pattern2);
      const result3 = ruleUtils.getRegGroups(pattern3);
      const result4 = ruleUtils.getRegGroups(pattern4);

      expect(result1).toBe(2);
      expect(result2).toBe(1);
      expect(result3).toBe(0);
      expect(result4).toBe(0);
    });
  });

  describe('getReg', () => {
    it('should return the correct regular expression when input is a string', () => {
      const input1 = 'abc';
      const input2 = '^\\d+$';
      const input3 = '[a-zA-Z]';

      const result1 = ruleUtils.getReg(input1);
      const result2 = ruleUtils.getReg(input2);
      const result3 = ruleUtils.getReg(input3);

      expect(result1).toBe('(?:abc)');
      expect(result2).toBe('(?:\\^\\\\d\\+\\$)');
      expect(result3).toBe('(?:\\[a\\-zA\\-Z\\])');
    });

    it('should throw an error when input is an invalid regular expression object', () => {
      const input = {
        source: 'abc',
        ignoreCase: true,
        global: false,
        sticky: false,
        multiline: true,
      };

      expect(() => {
        ruleUtils.getReg(input);
      }).toThrowError('prohibition sign');
    });

    it('should throw an error when input regular expression object has forbidden flags', () => {
      const input1 = {
        source: 'abc',
        ignoreCase: true,
        global: false,
        sticky: false,
        multiline: false,
      };

      const input2 = {
        source: 'abc',
        ignoreCase: false,
        global: true,
        sticky: false,
        multiline: false,
      };

      const input3 = {
        source: 'abc',
        ignoreCase: false,
        global: false,
        sticky: true,
        multiline: false,
      };

      const input4 = {
        source: 'abc',
        ignoreCase: false,
        global: false,
        sticky: false,
        multiline: true,
      };

      expect(() => {
        ruleUtils.getReg(input1);
      }).toThrowError('/i prohibition sign');

      expect(() => {
        ruleUtils.getReg(input2);
      }).toThrowError('/g prohibition sign');

      expect(() => {
        ruleUtils.getReg(input3);
      }).toThrowError('/y prohibition sign');

      expect(() => {
        ruleUtils.getReg(input4);
      }).toThrowError('/m prohibition sign');
    });
  });

  describe('getRegUnion function', () => {
    it('should return the correct regular expression union of input patterns', () => {
      const patterns1 = ['abc', 'def', 'ghi'];
      const patterns2 = ['\\d+', '[a-z]+', '[A-Z]+'];
      const patterns3 = [];

      const result1 = ruleUtils.getRegUnion(patterns1);
      const result2 = ruleUtils.getRegUnion(patterns2);
      const result3 = ruleUtils.getRegUnion(patterns3);

      expect(result1).toBe('(?:(?:abc)|(?:def)|(?:ghi))');
      expect(result2).toBe('(?:(?:\\d+)|(?:[a-z]+)|(?:[A-Z]+))');
      expect(result3).toBe('(?!)');
    });
  });

  describe('getRuleOptions function', () => {
    it('should return the correct options object with default type', () => {
      const type = 'content';
      const obj = { match: 'abc' };

      const result = ruleUtils.getRuleOptions(type, obj);

      expect(result).toEqual({
        defaultType: type,
        lineBreaks: false,
        pop: false,
        next: null,
        push: null,
        error: false,
        fallback: false,
        value: null,
        type: null,
        shouldThrow: false,
        match: ['abc'],
      });
    });

    it('should throw an error if type property is a string', () => {
      const type = 'content';
      const obj = { match: 'abc', type: 'invalid' };

      expect(() => {
        ruleUtils.getRuleOptions(type, obj);
      }).toThrowError('The type attribute cannot be a string.');
    });

    it('should throw an error if match property includes include property', () => {
      const type = 'content';
      const obj = { match: 'abc', include: 'state' };

      expect(() => {
        ruleUtils.getRuleOptions(type, obj);
      }).toThrowError('The matching rule cannot contain the status!');
    });

    it('should sort the match property correctly', () => {
      const type = 'content';
      const obj = { match: ['abc', /def/, 'ghi', /[0-9]+/, /^xyz$/] };

      const result = ruleUtils.getRuleOptions(type, obj);

      expect(result.match).toEqual(['abc', 'ghi', /def/, /[0-9]+/, /^xyz$/]);
    });
  });

  describe('getRulesByArray', () => {
    it('should return an empty array if the input array is empty', () => {
      const array = [];
      const result = ruleUtils.getRulesByArray(array);
      expect(result).toEqual([]);
    });

    it('should throw an error if a rule object does not have a type property', () => {
      const array = [{ match: 'abc' }, { type: 'content', match: 'def' }];
      expect(() => {
        ruleUtils.getRulesByArray(array);
      }).toThrowError('The rule does not have the type attribute.');
    });

    it('should handle multiple include properties', () => {
      const array = [
        { include: [{ type: 'other1', match: 'abc' }] },
        {
          include: [
            { type: 'other2', match: 'def' },
            { type: 'other3', match: 'ghi' },
          ],
        },
      ];
      const result = ruleUtils.getRulesByArray(array);
      expect(result).toEqual([
        { include: { type: 'other1', match: 'abc' } },
        { include: { type: 'other2', match: 'def' } },
        { include: { type: 'other3', match: 'ghi' } },
      ]);
    });
  });

  describe('getRulesByObject', () => {
    it('should handle empty object correctly', () => {
      const object = {};

      const result = ruleUtils.getRulesByObject(object);

      expect(result).toEqual([]);
    });

    it('should handle include property correctly', () => {
      const object = {
        include: ['rule1', 'rule2'],
      };

      const result = ruleUtils.getRulesByObject(object);

      expect(result).toEqual([{ include: 'rule1' }, { include: 'rule2' }]);
    });

    it('should handle nested objects correctly', () => {
      const object = {
        rule1: {
          match: 'abc',
          next: 'rule2',
          fallback: true,
        },
        rule2: [/def/, { match: 'ghi', push: 'rule3' }],
        rule3: {
          match: 'jkl',
          error: true,
        },
      };

      const result = ruleUtils.getRulesByObject(object);

      const item1 = ruleUtils.getRuleOptions('rule1', { match: 'abc', next: 'rule2', fallback: true });
      const item2 = ruleUtils.getRuleOptions('rule2', [/def/]);
      delete item2[0];
      const item3 = ruleUtils.getRuleOptions('rule2', { match: 'ghi', push: 'rule3' });
      const item4 = ruleUtils.getRuleOptions('rule3', { match: 'jkl', error: true });

      expect(result).toEqual([item1, item2, item3, item4]);
    });
  });

  describe('transferReg function', () => {
    it('should escape special characters in the input string', () => {
      const input = '[-/\\^$*+?.()|[\\]{}]';
      const expected = '\\[\\-\\/\\\\\\^\\$\\*\\+\\?\\.\\(\\)\\|\\[\\\\\\]\\{\\}\\]';

      const result = ruleUtils.transferReg(input);

      expect(result).toBe(expected);
    });

    it('should return the same string if no special characters are present', () => {
      const input = 'abcdefg';

      const result = ruleUtils.transferReg(input);

      expect(result).toBe(input);
    });
  });
});
