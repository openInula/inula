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
import { variablesAnalyze } from '../../src/analyze/Analyzers/variablesAnalyze';
import { ReactiveVariable, SubCompVariable } from '../../src/analyze/types';
import { findReactiveVarByName } from './utils';
import { viewAnalyze } from '../../src/analyze/Analyzers/viewAnalyze';

const analyze = (code: string) => mockAnalyze(code, [variablesAnalyze, viewAnalyze]);

describe('analyze properties', () => {
  it('should work', () => {
    const root = analyze(`
      Component(() => {
        let foo = 1;
        let bar = 1;

        return <div>{foo}{bar}</div>;
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
          let _ = bar; // use bar to avoid pruning
        })
      `);
      const fooVar = findReactiveVarByName(root, 'foo');
      expect(!!fooVar.dependency).toBe(false);
      expect(genCode(fooVar.value)).toBe('1');

      const barVar = findReactiveVarByName(root, 'bar');
      expect(!!barVar.dependency).toBe(true);
      expect(genCode(barVar.value)).toBe('foo');
      expect(barVar.bit).toEqual(0b10);
      expect(barVar.dependency!.depMask).toEqual(0b01);
    });

    it('should analyze dependency from state in different shape', () => {
      const root = analyze(`
        Component(() => {
          let foo = 1;
          let a = 1;
          let b = 0;
          let bar = { foo: foo ? a : b };
          let _ = bar; // use bar to avoid pruning
        })
      `);

      const barVar = root.variables[3] as ReactiveVariable;
      expect(!!barVar.dependency).toBe(true);
      expect(genCode(barVar.value)).toMatchInlineSnapshot(`
        "{
          foo: foo ? a : b
        }"
      `);
      expect(barVar.dependency!.depMask).toEqual(0b0111);
    });

    // TODO:MOVE TO PROPS PLUGIN TEST
    it.skip('should analyze dependency from props', () => {
      const root = analyze(`
        Component(({ foo }) => {
          let bar = foo;
        })
      `);
      expect(root.variables.length).toBe(1);

      const barVar = root.variables[0] as ReactiveVariable;
      expect(!!barVar.dependency).toBe(true);
    });

    // TODO:MOVE TO PROPS PLUGIN TEST
    it.skip('should analyze dependency from nested props', () => {
      const root = analyze(`
        Component(({ foo: foo1, name: [first, last] }) => {
          let bar = [foo1, first, last];
        })
      `);
      expect(root.variables.length).toBe(1);
      const barVar = root.variables[0] as ReactiveVariable;
      expect(!!barVar.dependency).toBe(true);
      // @ts-expect-error ignore ts here
      expect(root.dependencyMap).toEqual({ bar: ['foo1', 'first', 'last'] });
    });

    it('should not collect invalid dependency', () => {
      const root = analyze(`
        const cond = true
        Component(() => {
          let bar = cond ? count : window.innerWidth;
          let _ = bar; // use bar to avoid pruning
        })
      `);
      const barVar = root.variables[0] as ReactiveVariable;
      expect(!!barVar.dependency).toBe(false);
      expect(barVar.bit).toEqual(0b1);
    });
  });

  describe('subComponent', () => {
    it('should analyze dependency from subComponent', () => {
      const root = analyze(`
        Component(() => {
          let foo = 1;
          const Sub = Component(() => {
            let bar = foo;
            let _ = bar; // use bar to avoid pruning
          });
        })
      `);
      expect((root.variables[1] as SubCompVariable).ownAvailableVariables[0].dependency!.depMask).toBe(0b1);
    });

    it('should analyze dependency in parent', () => {
      const root = analyze(/*jsx*/ `
        Component(() => {
          let lastName;
          let parentFirstName = 'sheldon';
          const parentName = parentFirstName + lastName;
          const Son = Component(() => {
            let middleName = parentName
            const name = 'shelly'+ middleName + lastName;
            const GrandSon = Component(() => {
              let grandSonName = name + lastName;
              const _ = grandSonName; // use name to avoid pruning
            });
          });
        })
      `);
      const sonNode = root.variables[3] as SubCompVariable;
      // Son > middleName
      expect(findReactiveVarByName(sonNode, 'middleName').dependency!.depMask).toBe(0b100);
      // Son > name
      expect(findReactiveVarByName(sonNode, 'name').dependency!.depMask).toBe(0b1001);
      const grandSonNode = sonNode.variables[2] as SubCompVariable;
      // GrandSon > grandSonName
      expect(grandSonNode.ownAvailableVariables[0].dependency!.depMask).toBe(0b10001);
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
  });
});
