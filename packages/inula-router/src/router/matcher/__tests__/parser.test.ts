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

import { matchPath, generatePath, createPathParser } from '../parser';

describe('parser test', () => {
  it('parse param test', function () {
    const parser = createPathParser('/www.a.com/:b/:c/', { strictMode: true });
    const res = parser.parse('/www.a.com/bbb/ccc/');
    expect(res!.params).toStrictEqual({ b: 'bbb', c: 'ccc' });
    expect(res!.score).toStrictEqual([10, 6, 6]);
  });

  it('parse param test2', function () {
    const parser = createPathParser('/www.a.com/:b/:c', { exact: false });
    const res = parser.parse('/www.a.com/bbb/ccc');
    expect(res!.params).toStrictEqual({ b: 'bbb', c: 'ccc' });
    expect(res!.score).toStrictEqual([10, 6, 6]);
  });

  it('compile test1', function () {
    const url = generatePath('/www.a.com/a/:b', { b: 'xyz' });
    expect(url).toBe('/www.a.com/a/xyz');
  });

  it('compile test2', function () {
    const url = generatePath('/www.a.com/a/:b/c', { b: 'xyz' });
    expect(url).toBe('/www.a.com/a/xyz/c');
  });

  it('compile test3', function () {
    const action = () => generatePath('/www.a.com/a/:b/:c', { b: 'xyz' });
    expect(action).toThrow(new Error('Param is invalid.'));
  });

  it('parse wildcard', function () {
    const parser = createPathParser('/www.a.com/a/*', { exact: true });
    const params = parser.parse('/www.a.com/a/b1/c1/d1');
    const params1 = parser.parse('/www.a.com/a/b1/c1/');
    const params2 = parser.parse('/www.a.com/a/b1/');
    const params3 = parser.parse('/www.a.com/a1/b1/');
    expect(params!.params).toStrictEqual({ '*': ['b1', 'c1', 'd1'] });
    expect(params!.score).toStrictEqual([10, 10, 3, 3, 3]);
    expect(params1!.params).toStrictEqual({ '*': ['b1', 'c1'] });
    expect(params1!.score).toStrictEqual([10, 10, 3, 3]);
    expect(params2!.params).toStrictEqual({ '*': ['b1'] });
    expect(params2!.score).toStrictEqual([10, 10, 3]);
    expect(params3).toBeNull();
  });

  it('compile wildcard', function () {
    const url = generatePath('/www.a.com/:b/*', { b: 'abc', '*': ['x', 'y', 'z'] });
    expect(url).toEqual('/www.a.com/abc/x/y/z');
  });

  it('wildcard all', function () {
    const parser = createPathParser('/www.a.com/*', { exact: true });
    const matched = parser.parse('/www.a.com/x2/yy3/zzz4');
    expect(matched!.params).toStrictEqual({ '*': ['x2', 'yy3', 'zzz4'] });
    expect(matched!.score).toStrictEqual([10, 3, 3, 3]);
  });

  it('enable strict mode', function () {
    const matched = matchPath('/www.a.com/xx/yy', '/www.a.com/:x/:y/', { strictMode: true });
    expect(matched).toBeNull();
  });

  it('multiple matched priority test1', function () {
    const matched = matchPath('/www.a.com/aa/bb', ['/www.a.com/:x/:y', '/www.a.com/aa/:x']);
    expect(matched?.params).toStrictEqual({ x: 'bb' });
  });

  it('multiple matched priority test2', function () {
    const matched = matchPath('/www.a.com/abc/bcd', ['/www.a.com/:x/:y', '/www.a.com/abc/bcd', '/www.a.com/a/:x']);
    expect(matched?.params).toEqual({});
  });

  it('multiple matched priority test3', function () {
    const matched = matchPath('/www.a.com/abc/bcd', ['/www.a.com/:x/:y', '/www.a.com/a/b', '/www.a.com/a/:x']);
    expect(matched?.params).toEqual({ x: 'abc', y: 'bcd' });
  });

  it('not match', function () {
    const matched = matchPath('/www.b.com/a', '/www.a.com/a');
    expect(matched).toBeNull();
  });

  it('wildcard match', () => {
    const matched = matchPath('/www.a.com', '/*');
    expect(matched).not.toBeNull();
  });

  it('wildcard match without slash', () => {
    const matched = matchPath('/www.a.com', '*');
    expect(matched).not.toBeNull();
  });

  it('wildcard match a slash', () => {
    const matched = matchPath('/', '*');
    expect(matched).not.toBeNull();
    expect(matched?.isExact).toEqual(true);
  });

  it('partial matching', function () {
    const parser = createPathParser('/www.a.com/a/*');
    const matched = parser.parse('/www.a.com/a/bbb');
    expect(matched !== null).toStrictEqual(true);
    expect(matched!.params).toEqual({ '*': ['bbb'] });
  });

  it('url without end slash match wildcard', function () {
    const parser = createPathParser('/about/', { strictMode: false });
    const matched = parser.parse('/about');
    expect(matched).toStrictEqual({
      path: '/about/',
      url: '/about',
      score: [10],
      isExact: true,
      params: {},
    });
  });

  it('url without end slash match wildcard (strictMode)', function () {
    const parser = createPathParser('/about/', { strictMode: true });
    const matched = parser.parse('/about');
    expect(matched).toBeNull();
  });

  it('exact match false', function () {
    const parser = createPathParser('/about/', { strictMode: false, exact: false });
    const matched = parser.parse('/about/abc');
    expect(matched).not.toBeNull();
  });

  it('exact match true', function () {
    const parser = createPathParser('/about/', { strictMode: false, exact: true });
    const matched = parser.parse('/about/abc');
    expect(matched).toBeNull();
  });

  it('exact false match', function () {
    const parser = createPathParser('/about/', { strictMode: true, exact: false });
    const matched = parser.parse('/about');
    expect(matched).toBeNull();
  });

  it('exact false match2', function () {
    const res = matchPath('/about1/aaa', '/about1/:a', { strictMode: true, exact: false });
    expect(res).toEqual({
      path: '/about1/:a',
      url: '/about1/aaa',
      isExact: true,
      params: { a: 'aaa' },
      score: [10, 6],
    });
  });

  it('exact false match3', function () {
    const res = matchPath('/about1/aaa/111', '/about1/:a', { strictMode: true, exact: false });
    expect(res).toEqual({
      path: '/about1/:a',
      url: '/about1/aaa',
      isExact: false,
      params: { a: 'aaa' },
      score: [10, 6],
    });
  });

  it('exact false match4', function () {
    const res = matchPath('/aaa111', '/aaa', { strictMode: true, exact: false });
    expect(res).toBeNull();
  });

  it('exact false match5', function () {
    const res = matchPath('/about/1111', '/about/', { strictMode: false, exact: false });
    expect(res).toEqual({
      path: '/about/',
      url: '/about/',
      isExact: false,
      params: {},
      score: [10],
    });
  });

  it('matchPath special symbol', function () {
    const res = matchPath('/about-home/1111', '/about-home/', { strictMode: false, exact: false });
    expect(res).toEqual({
      path: '/about-home/',
      url: '/about-home/',
      isExact: false,
      params: {},
      score: [10],
    });
  });

  it('dynamic param with pattern', () => {
    const parser = createPathParser('/detail/:action(info)');
    const res = parser.parse('/detail/info/123');
    expect(res).toEqual({
      isExact: false,
      path: '/detail/:action(info)',
      url: '/detail/info',
      score: [10, 6],
      params: { action: 'info' },
    });
  });

  it('wildcard after dynamic param with pattern', () => {
    const parser = createPathParser('/detail/:action(info)/*');
    const res = parser.parse('/detail/info/123');
    expect(res).toEqual({
      isExact: true,
      path: '/detail/:action(info)/*',
      url: '/detail/info/123',
      score: [10, 6, 3],
      params: { action: 'info', '*': ['123'] },
    });
  });
  it('dynamic param with regexp pattern after wildcard', () => {
    const parser = createPathParser('/detail/*/:action(\\d+)');
    const res = parser.parse('/detail/abc/xyz/123');
    expect(res).toEqual({
      isExact: true,
      path: '/detail/*/:action(\\d+)',
      url: '/detail/abc/xyz/123',
      score: [10, 3, 3, 6],
      params: { action: '123', '*': ['abc', 'xyz'] },
    });
  });
  it('dynamic param with regexp pattern', () => {
    const parser = createPathParser('/detail/:action(\\d+)');
    const res = parser.parse('/detail/123');
    expect(res).toEqual({
      isExact: true,
      path: '/detail/:action(\\d+)',
      url: '/detail/123',
      score: [10, 6],
      params: { action: '123' },
    });
  });

  it('dynamic param with regexp pattern not exact', () => {
    const parser = createPathParser('/detail/:action(\\d+)/pages', { exact: true });
    const res = parser.parse('/detail/123/pages');
    expect(res).toEqual({
      isExact: true,
      path: '/detail/:action(\\d+)/pages',
      url: '/detail/123/pages',
      score: [10, 6, 10],
      params: { action: '123' },
    });

    const res1 = parser.parse('/detail/123/page');
    expect(res1).toBeNull();
  });

  it('dynamic param with complex regexp pattern', () => {
    const parser = createPathParser('/detail/:action([\\da-z]+)', { exact: true, caseSensitive: true });
    const res = parser.parse('/detail/a123');
    expect(res).toEqual({
      isExact: true,
      path: '/detail/:action([\\da-z]+)',
      url: '/detail/a123',
      score: [10, 6],
      params: { action: 'a123' },
    });

    const res1 = parser.parse('/detail/b123');
    expect(res1).not.toBeNull();

    const res2 = parser.parse('/detail/A123');
    expect(res2).toBeNull();
  });

  it('wildcard param in centre', function () {
    const parser = createPathParser('/a/b/*/:c/c');
    const res = parser.parse('/a/b/d/x/yy/zzz/abc/c');
    const res2 = parser.parse('/a/b/abc/c');
    expect(res!.params).toEqual({
      '*': ['d', 'x', 'yy', 'zzz'],
      c: 'abc',
    });
    expect(res2).toBe(null);
  });

  it('support wildcard "*" in end of static path 1', function () {
    const parser = createPathParser('/home*');
    const res = parser.parse('/homeAbc/a123');
    expect(res).toEqual({
      isExact: true,
      path: '/home*',
      url: '/homeAbc/a123',
      score: [10],
      params: { '0': 'Abc/a123' },
    });
  });
  it('support wildcard "*" in url and dynamic param at end', function () {
    const parser = createPathParser('/home*/:a+');
    const res = parser.parse('/homeAbc/a');
    expect(res).toEqual({
      path: '/home*/:a+',
      url: '/homeAbc/a',
      isExact: true,
      score: [10, 6],
      params: { '0': 'Abc', a: 'a' },
    });
  });
  it('parse url with optional param 1', () => {
    const parser = createPathParser('/catalog/logical-view/:pageType/:viewName?');
    const res = parser.parse('/catalog/logical-view/create');
    expect(res).toStrictEqual({
      isExact: true,
      path: '/catalog/logical-view/:pageType/:viewName?',
      url: '/catalog/logical-view/create',
      score: [10, 10, 6, 6],
      params: { pageType: 'create', viewName: undefined },
    });
    const res2 = parser.parse('/catalog/logical-view/create/view1');
    expect(res2).toStrictEqual({
      isExact: true,
      path: '/catalog/logical-view/:pageType/:viewName?',
      url: '/catalog/logical-view/create/view1',
      score: [10, 10, 6, 6],
      params: { pageType: 'create', viewName: 'view1' },
    });
  });
  it('parse url with wildcard param 1', () => {
    const parser = createPathParser('/home/:p*');
    const res = parser.parse('/home/123');
    expect(res).toStrictEqual({
      path: '/home/:p*',
      url: '/home/123',
      isExact: true,
      params: { p: '123' },
      score: [10, 6],
    });
    const res2 = parser.parse('/home/123/456');
    expect(res2).toStrictEqual({
      path: '/home/:p*',
      url: '/home/123/456',
      isExact: true,
      params: { p: '123/456' },
      score: [10, 6],
    });
  });
  it('parse url with wildcard param in middle of URL', () => {
    const parser = createPathParser('/home/:p*/link');
    const res = parser.parse('/home/123/link');
    expect(res).toStrictEqual({
      path: '/home/:p*/link',
      url: '/home/123/link',
      isExact: true,
      params: { p: '123' },
      score: [10, 6, 10],
    });
    const res2 = parser.parse('/home/link');
    expect(res2).toStrictEqual({
      path: '/home/:p*/link',
      url: '/home/link',
      isExact: true,
      params: { p: undefined },
      score: [10, 6, 10],
    });
  });
  it('parse url with optional param 2', () => {
    const parser = createPathParser('/user/:userid?/profile');
    const res = parser.parse('/user/profile');
    expect(res).toStrictEqual({
      isExact: true,
      params: { userid: undefined },
      path: '/user/:userid?/profile',
      score: [10, 6, 10],
      url: '/user/profile',
    });
    const res2 = parser.parse('/user/123/profile');
    expect(res2).toStrictEqual({
      isExact: true,
      params: { userid: '123' },
      path: '/user/:userid?/profile',
      score: [10, 6, 10],
      url: '/user/123/profile',
    });
  });
  it('complex url pattern test 1', function () {
    const parser = createPathParser('/dump/taskList/:action(add|config)/lifecyclePolicy/:name?');
    const res = parser.parse('/dump/taskList/add/lifecyclePolicy/');
    expect(res).toStrictEqual({
      isExact: true,
      path: '/dump/taskList/:action(add|config)/lifecyclePolicy/:name?',
      url: '/dump/taskList/add/lifecyclePolicy/',
      score: [10, 10, 6, 10, 6],
      params: { action: 'add', name: undefined },
    });
    const res1 = parser.parse('/dump/taskList/add/lifecyclePolicy/new');
    expect(res1).toStrictEqual({
      isExact: true,
      path: '/dump/taskList/:action(add|config)/lifecyclePolicy/:name?',
      url: '/dump/taskList/add/lifecyclePolicy/new',
      score: [10, 10, 6, 10, 6],
      params: { action: 'add', name: 'new' },
    });
  });
});
