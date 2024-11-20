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

import { variablesAnalyze } from '../../src/analyze/Analyzers/variablesAnalyze';
import { viewAnalyze } from '../../src/analyze/Analyzers/viewAnalyze';
import { functionalMacroAnalyze } from '../../src/analyze/Analyzers/functionalMacroAnalyze';
import { describe, expect, it } from 'vitest';
import { findVarByName, findSubCompByName } from './utils';
import { mockAnalyze } from './mock';
import { SubCompStmt } from '../../src/analyze/types';

const analyze = (code: string) => mockAnalyze(code, [variablesAnalyze, viewAnalyze, functionalMacroAnalyze]);
describe('prune unused bit', () => {
  it('should work', () => {
    const root = analyze(/*js*/ `
      Component(({}) => {
        let unused0;
        let name; // 0b1
        let unused;
        let unused1;
        let unused2;
        let count = name; // 0b10
        let doubleCount = count * 2; // 0b100
        const Double =  Component(() => {
          let count3 = 1;
          let count2 = 1;
          let count = 1; // 0b1000
          const db = count * 2; // 0b10000
          return <input>{count}{db * count}</input>;
        });

        const Triple =  Component(() => {
          let unused3 = 1;
          let unused2 = 1;
          let count = 1; // 0b1000
          const triple = count * 3; // 0b10000
          const TripleChild =  Component(() => {
            let unused2 = 1;
            let count = 1; // 0b1000
            const subTriple = count * 3; // 0b10000
            return <input>{count}{triple * count}</input>;
          });
          return <input>{count}{triple * count}</input>;
        });
        return <div className={count}>{doubleCount}</div>;
      });
    `);
    expect(root.scope.reactiveMap).toMatchInlineSnapshot(`
      Map {
        "name" => 0,
        "count" => 1,
        "doubleCount" => 2,
      }
    `);
    const DoubleNode = root.body[7] as SubCompStmt;
    expect(DoubleNode.component.scope.reactiveMap).toMatchInlineSnapshot(`
      Map {
        "count" => 3,
        "db" => 4,
      }
    `);
    const TripleNode = root.body[8] as SubCompStmt;
    expect(TripleNode.component.scope.reactiveMap).toMatchInlineSnapshot(`
      Map {
        "count" => 3,
        "triple" => 4,
      }
    `);
    const TripleChildNode = TripleNode.component.body[4] as SubCompStmt;
    expect(TripleChildNode.component.scope.reactiveMap).toMatchInlineSnapshot(`
      Map {
        "count" => 5,
      }
    `);
  });
});
