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

import { lexer } from '../lexer';

describe('path lexer Test', () => {
  it('basic lexer test', () => {
    const tokens = lexer('/www.a.com/b/c');
    expect(tokens).toStrictEqual([
      { type: 'delimiter', value: '/' },
      { type: 'static', value: 'www.a.com' },
      { type: 'delimiter', value: '/' },
      { type: 'static', value: 'b' },
      { type: 'delimiter', value: '/' },
      { type: 'static', value: 'c' },
    ]);
  });

  it('null tokens', () => {
    const tokens = lexer('');
    expect(tokens).toStrictEqual([]);
  });

  it('a slash test', () => {
    const tokens = lexer('/');
    expect(tokens).toStrictEqual([{ type: 'delimiter', value: '/' }]);
  });

  it('don\'t start with a slash', () => {
    const func = () => lexer('abc.com');
    expect(func).toThrow(Error('Url must start with "/".'));
  });

  it('dynamic params test', () => {
    const tokens = lexer('/www.a.com/:b');
    expect(tokens).toStrictEqual([
      { type: 'delimiter', value: '/' },
      { type: 'static', value: 'www.a.com' },
      { type: 'delimiter', value: '/' },
      { type: 'param', value: 'b' },
    ]);
  });

  it('dynamic params with pattern', () => {
    const tokens = lexer('/www.a.com/:b(a)/*');
    expect(tokens).toStrictEqual([
      { type: 'delimiter', value: '/' },
      { type: 'static', value: 'www.a.com' },
      { type: 'delimiter', value: '/' },
      { type: 'param', value: 'b' },
      { type: '(', value: '(' },
      { type: 'pattern', value: 'a' },
      { type: ')', value: ')' },
      { type: 'delimiter', value: '/' },
      { type: 'wildcard', value: '*' },
    ]);
  });

  it('dynamic params with pattern 2', () => {
    const tokens = lexer('/www.a.com/:b(abc|xyz)/*');
    expect(tokens).toStrictEqual([
      { type: 'delimiter', value: '/' },
      { type: 'static', value: 'www.a.com' },
      { type: 'delimiter', value: '/' },
      { type: 'param', value: 'b' },
      { type: '(', value: '(' },
      { type: 'pattern', value: 'abc|xyz' },
      { type: ')', value: ')' },
      { type: 'delimiter', value: '/' },
      { type: 'wildcard', value: '*' },
    ]);
  });
  it('wildcard params test', () => {
    const tokens = lexer('/www.a.com/:b');
    expect(tokens).toStrictEqual([
      { type: 'delimiter', value: '/' },
      { type: 'static', value: 'www.a.com' },
      { type: 'delimiter', value: '/' },
      { type: 'param', value: 'b' },
    ]);
  });
  it('wildcard in end of static param', () => {
    const tokens = lexer('/abc*');
    expect(tokens).toStrictEqual([
      { type: 'delimiter', value: '/' },
      { type: 'static', value: 'abc' },
      { type: 'pattern', value: '*' },
    ]);
  });
  it('wildcard in end of static param 2', () => {
    const tokens = lexer('/abc*/xyz*');
    expect(tokens).toStrictEqual([
      { type: 'delimiter', value: '/' },
      { type: 'static', value: 'abc' },
      { type: 'pattern', value: '*' },
      { type: 'delimiter', value: '/' },
      { type: 'static', value: 'xyz' },
      { type: 'pattern', value: '*' },
    ]);
  });
  it('url contain optional param at end', () => {
    const tokens = lexer('/user/:name?');
    expect(tokens).toEqual([
      { type: 'delimiter', value: '/' },
      { type: 'static', value: 'user' },
      { type: 'delimiter', value: '/' },
      { type: 'param', value: 'name' },
      { type: 'pattern', value: '?' },
    ]);
  });
  it('url contain optional param at middle', () => {
    const tokens = lexer('/user/:name?/profile');
    expect(tokens).toEqual([
      { type: 'delimiter', value: '/' },
      { type: 'static', value: 'user' },
      { type: 'delimiter', value: '/' },
      { type: 'param', value: 'name' },
      { type: 'pattern', value: '?' },
      { type: 'delimiter', value: '/' },
      { type: 'static', value: 'profile' },
    ]);
  });
});
