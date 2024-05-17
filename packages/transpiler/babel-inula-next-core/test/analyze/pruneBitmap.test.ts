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

import { variablesAnalyze } from '../../src/analyzer/variablesAnalyze';
import { ComponentNode } from '../../src/analyzer/types';
import { viewAnalyze } from '../../src/analyzer/viewAnalyze';
import { functionalMacroAnalyze } from '../../src/analyzer/functionalMacroAnalyze';
import { genCode, mockAnalyze } from '../mock';
import { describe, expect, it } from 'vitest';

const analyze = (code: string) => mockAnalyze(code, [variablesAnalyze, viewAnalyze, functionalMacroAnalyze]);
describe('prune unused bit', () => {
  it('should work', () => {
    const root = analyze(/*js*/ `
      Component(({}) => {
        let name;
        let className; // unused
        let className1; // unused
        let className2; // unused
        let count = name; // 1
        let doubleCount = count * 2; // 2
        const Input =  Component(() => {
          let count3 = 1;
          let count2 = 1;
          let count = 1;
          return <input>{count}{doubleCount}</input>;
        });
        return <div className={count}>{doubleCount}</div>;
      });
    `);
    const div = root.children![0] as any;
    expect(div.children[0].content.depMask).toEqual(0b111);
    expect(div.props.className.depMask).toEqual(0b11);

    // @ts-expect-error ignore ts here
    const InputCompNode = root.variables[4] as ComponentNode;
    // it's the {count}
    expect(inputFirstExp.content.depMask).toEqual(0b10000);
    // it's the {doubleCount}
    expect(inputSecondExp.content.depMask).toEqual(0b1101);
  });
});
