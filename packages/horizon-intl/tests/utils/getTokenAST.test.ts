/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */
import getTokenAST from '../../src/utils/getTokenAST';
import * as assert from 'assert';

describe('getTokenAST', () => {
  it('should return an array containing a string', () => {
    const result = getTokenAST(['Hello', 'world']);
    expect(result).toEqual(['Hello', 'world']);
  });

  it('should handle octothorpe tokens', () => {
    const result = getTokenAST([{ type: 'octothorpe' }, 'Hello']);
    expect(result).toContain('#');
  });

  it('should handle argument tokens', () => {
    const result = getTokenAST([{ type: 'argument', arg: 'foo' }]);
    expect(result).toEqual([['foo']]);
  });

  it('should handle function tokens with param', () => {
    const result = getTokenAST([{ type: 'function', arg: 'foo', key: 'bar', param: { tokens: ['baz'] } }]);
    expect(result).toEqual([['foo', 'bar', 'baz']]);
  });

  it('should handle function tokens without param', () => {
    const result = getTokenAST([{ type: 'function', arg: 'foo', key: 'bar' }]);
    expect(result).toEqual([['foo', 'bar']]);
  });

  it('should handle other tokens with offset', () => {
    const result = getTokenAST([{ type: 'other', arg: 'foo', offset: '1', cases: [{ key: 'one', tokens: ['bar'] }] }]);
    expect(result).toEqual([['foo', 'other', { offset: 1, one: ['bar'] }]]);
  });

  it('should handle other tokens without offset', () => {
    const result = getTokenAST([{ type: 'other', arg: 'foo', cases: [{ key: 'one', tokens: ['bar'] }] }]);
    expect(result).toEqual([['foo', 'other', { one: ['bar'] }]]);
  });
  it('returns [arg, key, param] if token type is "function"', () => {
    const tokens = [
      {
        type: 'function',
        arg: 'arg1',
        key: 'key1',
        param: { tokens: ['param1'] },
      },
    ];
    const result = getTokenAST(tokens);
    expect(result).toEqual([['arg1', 'key1', 'param1']]);
  });
  it('If the input parameter is not an array, an error should be thrown.', () => {
    const input = 'invalid input';
    assert.throws(() => getTokenAST(input), Error);
  });
  it('应该返回包含字符串的数组', () => {
    const tokens = [
      'Hello',
      { type: 'octothorpe' },
      { type: 'argument', arg: 'name' },
      {
        type: 'function',
        arg: 'formatDate',
        key: 'date',
        param: {
          tokens: ['YYYY-MM-DD'],
        },
      },
    ];
    const expected = ['Hello', '#', ['name'], ['formatDate', 'date', 'YYYY-MM-DD']];
    const result = getTokenAST(tokens);
    expect(result).toStrictEqual(expected);
  });

  it('对于复杂的 tokens 数组，应该返回嵌套的格式化数组', () => {
    const expected = [
      'Hello',
      '#',
      ['name'],
      ['formatDate', 'date', 'YYYY-MM-DD'],
      [
        'formatNumber',
        'number',
        {
          cases: [
            {
              key: 'uppercase',
              tokens: [
                'TRUE',
                {
                  plural: {
                    cases: {
                      '=0': 'zero',
                      '=1': 'one',
                      other: 'other',
                    },
                  },
                },
              ],
            },
            {
              key: 'lowercase',
              tokens: [
                'lowercase',
                'none',
                {
                  cases: {
                    '=0': 'zero',
                    '=1': 'one',
                    other: 'other',
                  },
                },
              ],
            },
          ],
          offset: 1,
        },
      ],
    ];

    const tokens = [
      'Hello',
      { type: 'octothorpe' },
      { type: 'argument', arg: 'name' },
      {
        type: 'function',
        arg: 'formatDate',
        key: 'date',
        param: {
          tokens: ['YYYY-MM-DD'],
        },
      },
      {
        type: 'function',
        arg: 'formatNumber',
        key: 'number',
        param: {
          tokens: [
            {
              offset: 1,
              cases: [
                {
                  key: 'uppercase',
                  tokens: ['TRUE', { plural: { cases: { '=0': 'zero', '=1': 'one', other: 'other' } } }],
                },
                {
                  key: 'lowercase',
                  tokens: ['lowercase', 'none', { cases: { '=0': 'zero', '=1': 'one', other: 'other' } }],
                },
              ],
            },
          ],
        },
      },
    ];

    const result = getTokenAST(tokens);
    expect(result).toStrictEqual(expected);
  });
});
