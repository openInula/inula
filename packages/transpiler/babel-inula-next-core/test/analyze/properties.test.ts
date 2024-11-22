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
import { genCode } from '../mock';
import { variablesAnalyze } from '../../src/analyze/Analyzers/variablesAnalyze';
import { ComponentNode, StateStmt, DerivedStmt, SubCompStmt } from '../../src/analyze/types';
import { findVarByName } from './utils';
import { viewAnalyze } from '../../src/analyze/Analyzers/viewAnalyze';
import { mockAnalyze } from './mock';
import { propsAnalyze } from '../../src/analyze/Analyzers/propsAnalyze';

const analyze = (code: string) => mockAnalyze(code, [variablesAnalyze, viewAnalyze, propsAnalyze]);

const getStates = (root: ComponentNode) => root.body.filter(node => node.type === 'state') as StateStmt[];
describe('analyze properties', () => {
  it('should work', () => {
    const [root, waveBitsMap] = analyze(`
      Component(() => {
        let foo = 1;
        const bar = 1;

        return <div>{foo}{bar}</div>;
      })
    `);
    expect(getStates(root).length).toBe(1);
    expect(waveBitsMap).toMatchInlineSnapshot(`
      Map {
        "foo" => 1,
        "bar" => 2,
      }
    `);
  });

  describe('state dependency', () => {
    it('should analyze dependency from state', () => {
      const [root, waveBitsMap] = analyze(`
        Component(() => {
          let foo = 1;
          let bar = foo;
          let _ = bar; // use bar to avoid pruning
        })
      `);
      expect(root.scope.reactiveMap).toMatchInlineSnapshot(`
        Map {
          "foo" => 0,
          "bar" => 1,
        }
      `);
    });

    it('should analyze dependency from state in different shape', () => {
      const [root, waveBitsMap] = analyze(`
        Component(() => {
          let foo = 1;
          let a = 1;
          let b = 0;
          let bar = { foo: foo ? a : b };
          let _ = bar; // use bar to avoid pruning
        })
      `);
      expect(root.scope.reactiveMap).toMatchInlineSnapshot(`
        Map {
          "foo" => 0,
          "a" => 1,
          "b" => 2,
          "bar" => 3,
        }
      `);
    });

    it('should analyze dependency from props', () => {
      const [root, waveBitsMap] = analyze(`
        Component(({ foo }) => {
          let bar = foo;
          let _ = bar; // use bar to avoid pruning
        })
      `);
      expect(root.scope.reactiveMap).toMatchInlineSnapshot(`
        Map {
          "foo" => 0,
          "bar" => 1,
        }
      `);
    });

    it('should analyze dependency from nested props', () => {
      const [root, waveBitsMap] = analyze(`
        Component(({ foo: foo1, name: [first, last] }) => {
          let bar = [foo1, first, last];
        })
      `);
      expect(root.scope.reactiveMap).toMatchInlineSnapshot(`
        Map {
          "foo1" => 0,
          "first" => 1,
          "last" => 1,
        }
      `);
    });

    it('should not collect invalid dependency', () => {
      const [root, waveBitsMap] = analyze(`
        const cond = true
        Component(() => {
          let bar = cond ? count : window.innerWidth;
          let _ = bar; // use bar to avoid pruning
        })
      `);
      expect(root.scope.reactiveMap).toMatchInlineSnapshot(`
        Map {
          "bar" => 0,
        }
      `);
    });
  });

  describe('subComponent', () => {
    it('should analyze dependency from subComponent', () => {
      const [root, waveBitsMap] = analyze(`
        Component(() => {
          let foo = 1;
          const Sub = Component(() => {
            let bar = foo;
            let _ = bar; // use bar to avoid pruning
          });
        })
      `);
      expect(root.scope.reactiveMap).toMatchInlineSnapshot(`
        Map {
          "foo" => 0,
        }
      `);

      const subNode = root.body[1] as SubCompStmt;
      expect(subNode.component.scope.reactiveMap).toMatchInlineSnapshot(`
        Map {
          "bar" => 1,
        }
      `);
    });

    it('should analyze dependency in parent', () => {
      const [root, waveBitsMap] = analyze(/*jsx*/ `
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
      const sonNode = root.body[3] as SubCompStmt;
      // Son > middleName
      // Son > name
      expect(sonNode.component.scope.reactiveMap).toMatchInlineSnapshot(`
        Map {
          "middleName" => 3,
          "name" => 4,
        }
      `);
      const grandSonNode = sonNode.component.body[2] as SubCompStmt;
      // GrandSon > grandSonName
      expect(grandSonNode.component.scope.reactiveMap).toMatchInlineSnapshot(`
        Map {
          "grandSonName" => 5,
        }
      `);
    });
  });
});
