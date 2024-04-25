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
import { propertiesAnalyze } from '../../src/analyze/propertiesAnalyze';
import { propsAnalyze } from '../../src/analyze/propsAnalyze';
import { ComponentNode } from '../../src/analyze/types';

const analyze = (code: string) => mockAnalyze(code, [propsAnalyze, propertiesAnalyze]);

describe('analyze properties', () => {
  it('should work', () => {
    const root = analyze(`
      Component(() => {
        let foo = 1;
        let bar = 1;
      })
    `);
    expect(root.variables.length).toBe(2);
  });

  describe('state dependency', () => {
    it('should analyze dependency from state', () => {
      const root = analyze(`
        Component(() => {
          let foo = 1;
          let bar = foo;
        })
      `);
      expect(root.variables.length).toBe(2);
      expect(root.variables[0].isComputed).toBe(false);
      expect(genCode(root.variables[0].value)).toBe('1');
      expect(root.variables[1].isComputed).toBe(true);
      expect(genCode(root.variables[1].value)).toBe('foo');
      expect(root.dependencyMap).toEqual({ bar: ['foo'] });
    });

    it('should analyze dependency from state in different shape', () => {
      const root = analyze(`
        Component(() => {
          let foo = 1;
          let a = 1;
          let b = 0;
          let bar = { foo: foo ? a : b };
        })
      `);
      expect(root.variables.length).toBe(4);
      expect(root.variables[3].isComputed).toBe(true);
      expect(genCode(root.variables[3].value)).toMatchInlineSnapshot(`
        "{
          foo: foo ? a : b
        }"
      `);
      expect(root.dependencyMap).toEqual({ bar: ['foo', 'a', 'b'] });
    });

    it('should analyze dependency from props', () => {
      const root = analyze(`
        Component(({ foo }) => {
          let bar = foo;
        })
      `);
      expect(root.variables.length).toBe(1);
      expect(root.variables[0].isComputed).toBe(true);
      expect(root.dependencyMap).toEqual({ bar: ['foo'] });
    });

    it('should analyze dependency from nested props', () => {
      const root = analyze(`
        Component(({ foo: foo1, name: [first, last] }) => {
          let bar = [foo1, first, last];
        })
      `);
      expect(root.variables.length).toBe(1);
      expect(root.variables[0].isComputed).toBe(true);
      expect(root.dependencyMap).toEqual({ bar: ['foo1', 'first', 'last'] });
    });

    it('should not collect invalid dependency', () => {
      const root = analyze(`
        const cond = true
        Component(() => {
          let bar = cond ? count : window.innerWidth;
        })
      `);
      expect(root.variables.length).toBe(1);
      expect(root.variables[0].isComputed).toBe(false);
      expect(root.dependencyMap).toEqual({});
    });
  });

  describe('subComponent', () => {
    it('should analyze dependency from subComponent', () => {
      const root = analyze(`
        Component(() => {
          let foo = 1;
          const Sub = Component(() => {
            let bar = foo;
          });
        })
      `);
      expect(root.variables.length).toBe(2);
      expect(root.dependencyMap).toEqual({ Sub: ['foo'] });
      expect((root.variables[1].value as ComponentNode).dependencyMap).toMatchInlineSnapshot(`
        {
          "bar": [
            "foo",
          ],
        }
      `);
    });
  });

  it('should collect method', () => {
    const root = analyze(`
      Component(() => {
        let foo = 1;
        const onClick = () => {};
        const onHover = function() {
          onClick(foo)
        };
        function onInput() {}
      })
    `);
    expect(root.variables.map(p => p.name)).toEqual(['foo', 'onClick', 'onHover', 'onInput']);
    expect(root.variables[1].type).toBe('method');
    expect(root.variables[2].type).toBe('method');
    expect(root.dependencyMap).toMatchInlineSnapshot('{}');
  });
});
