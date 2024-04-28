/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
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

import { describe, expect, it } from 'vitest';
import { genCode, mockAnalyze } from '../mock';
import { PropType } from '../../src/constants';
import { propsAnalyze } from '../../src/analyzer/propsAnalyze';

const analyze = (code: string) => mockAnalyze(code, [propsAnalyze]);

describe('analyze props', () => {
  it('should work', () => {
    const root = analyze(/*js*/ `
      Component(({foo, bar}) => {})
    `);
    expect(root.props.length).toBe(2);
  });

  it('should support default value', () => {
    const root = analyze(/*js*/ `
      Component(({foo = 'default', bar = 123}) => {})
    `);
    expect(root.props.length).toBe(2);
    expect(root.props[0].name).toBe('foo');
    expect(root.props[1].name).toBe('bar');
  });

  it('should support alias', () => {
    const root = analyze(/*js*/ `
      Component(({'foo': renamed, bar: anotherName}) => {})
    `);
    expect(root.props.length).toBe(2);
    expect(root.props[0].name).toBe('foo');
    expect(root.props[0].alias).toBe('renamed');
    expect(root.props[1].name).toBe('bar');
    expect(root.props[1].alias).toBe('anotherName');
  });

  it('should support nested props', () => {
    const root = analyze(/*js*/ `
      Component(({foo: {nested1, nested2}, bar}) => {})
    `);
    expect(root.props.length).toBe(2);
    expect(root.props[0].name).toBe('foo');
    expect(root.props[0].nestedProps).toEqual(['nested1', 'nested2']);
    expect(genCode(root.props[0].nestedRelationship)).toMatchInlineSnapshot(`
      "{
        nested1,
        nested2
      }"
    `);
    expect(root.props[1].name).toBe('bar');
  });

  it('should support complex nested props', () => {
    // language=js
    const root = analyze(/*js*/ `
      Component(function ({
        prop1, prop2: {p2: [p20X = defaultVal, {p211, p212: p212X = defaultVal}, ...restArr], p3, ...restObj}}
      ) {});
    `);
    // we should collect prop1, p20X, p211, p212X, p3
    expect(root.props.length).toBe(2);
    expect(root.props[0].name).toBe('prop1');
    expect(root.props[1].name).toBe('prop2');
    expect(root.props[1].nestedProps).toEqual(['p20X', 'p211', 'p212X', 'restArr', 'p3', 'restObj']);
    expect(genCode(root.props[1].nestedRelationship)).toMatchInlineSnapshot(`
      "{
        p2: [p20X = defaultVal, {
          p211,
          p212: p212X = defaultVal
        }, ...restArr],
        p3,
        ...restObj
      }"
    `);
  });

  it('should support rest element', () => {
    const root = analyze(/*js*/ `
      Component(({foo, ...rest}) => {})
    `);
    expect(root.props.length).toBe(2);
    expect(root.props[0].name).toBe('foo');
    expect(root.props[0].type).toBe(PropType.SINGLE);
    expect(root.props[1].name).toBe('rest');
    expect(root.props[1].type).toBe(PropType.REST);
  });

  it('should support empty props', () => {
    const root = analyze(/*js*/ `
      Component(() => {})
    `);
    expect(root.props.length).toBe(0);
  });
});
