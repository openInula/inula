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
    const [root, waveBitsMap] = analyze(/*js*/ `
      Component(({}) => {
        let unused0; // 0
        let name; // 1 0b1
        let unused; // 2
        let unused1; // 3
        let unused2; // 4
        let count = name; // 5 0b10
        let doubleCount = count * 2; // 6 0b100
        const Double =  Component(() => {
          let count3 = 1; // 7
          let count2 = 1; // 8
          let count = 1; // 9 0b1000
          const db = count * 2; // 10 0b10000
          return <input>{count}{db * count}</input>;
        });

        const Triple =  Component(() => {
          let unused3 = 1; // 11
          let unused2 = 1; // 12
          let count = 1; // 13
          const triple = count * 3; // 14
          const TripleChild =  Component(() => {
            let unused2 = 1; // 15
            let count = 1; // 16
            const subTriple = count * 3; // 17
            return <input>{count}{triple * count}</input>;
          });
          return <input>{count}{triple * count}</input>;
        });
        return <div className={count}>{doubleCount}</div>;
      });
    `);
    expect(waveBitsMap).toMatchInlineSnapshot(`
      Map {
        9 => 16,
        13 => 64,
        5 => 4,
        1 => 6,
      }
    `);
  });
});
