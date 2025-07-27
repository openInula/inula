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

import { createPath, parseRelativePath } from '../utils';

describe('createPath', () => {
  describe('given only a pathname', () => {
    it('returns the pathname unchanged', () => {
      const path = createPath({ pathname: 'https://google.com' });
      expect(path).toBe('https://google.com');
    });
  });

  describe('given a pathname and a search param', () => {
    it('returns the constructed pathname', () => {
      const path = createPath({
        pathname: 'https://google.com',
        search: '?something=cool',
      });
      expect(path).toBe('https://google.com?something=cool');
    });
  });

  describe('given a pathname and a search param without ?', () => {
    it('returns the constructed pathname', () => {
      const path = createPath({
        pathname: 'https://google.com',
        search: 'something=cool',
      });
      expect(path).toBe('https://google.com?something=cool');
    });
  });

  describe('given a pathname and a hash param', () => {
    it('returns the constructed pathname', () => {
      const path = createPath({
        pathname: 'https://google.com',
        hash: '#section-1',
      });
      expect(path).toBe('https://google.com#section-1');
    });
  });

  describe('given a pathname and a hash param without #', () => {
    it('returns the constructed pathname', () => {
      const path = createPath({
        pathname: 'https://google.com',
        hash: 'section-1',
      });
      expect(path).toBe('https://google.com#section-1');
    });
  });

  describe('given a full location object', () => {
    it('returns the constructed pathname', () => {
      const path = createPath({
        pathname: 'https://google.com',
        search: 'something=cool',
        hash: '#section-1',
      });
      expect(path).toBe('https://google.com?something=cool#section-1');
    });
  });

  describe('parse relative path', () => {
    it('from is absolute path', () => {
      const url = parseRelativePath('a', '/b/');
      expect(url).toBe('/b/a');
      const url2 = parseRelativePath('a', '');
      expect(url2).toBe('/a');
    });

    it('to is end with slash', () => {
      const url = parseRelativePath('a/', '/b/c/');
      expect(url).toBe('/b/c/a/');
      const url2 = parseRelativePath('a/', '/b/c');
      expect(url2).toBe('/b/a/');
    });

    it('to contain .. or .', () => {
      const url = parseRelativePath('../a/', '/b/c/');
      expect(url).toBe('/b/a/');
      const url2 = parseRelativePath('../a', '/b/c');
      expect(url2).toBe('/a');
      const url3 = parseRelativePath('../../a', '/b/c/d/e');
      expect(url3).toBe('/b/a');
    });

    it('to only contain ..', () => {
      const url = parseRelativePath('../..', '/b/c/e/');
      expect(url).toBe('/b/');
      const url2 = parseRelativePath('../..', '/b/c/e');
      expect(url2).toBe('/');
    });
  });
});
