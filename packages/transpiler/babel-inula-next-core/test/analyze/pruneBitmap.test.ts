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
import { mockAnalyze } from '../mock';
import { describe, expect, it } from 'vitest';
import { findVarByName, findSubCompByName } from './utils';

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
        const Input =  Component(() => {
          let count3 = 1;
          let count2 = 1;
          let count = 1; // 0b1000
          const db = count * 2; // 0b10000
          return <input>{count}{db * count}</input>;
        });
        return <div className={count}>{doubleCount}</div>;
      });
    `);
    // test plain var
    const unusedVar = findVarByName(root, 'unused');
    expect(unusedVar.type).toEqual('plain');
    // test computed
    const countVar = findVarByName(root, 'count');
    expect(countVar.bit).toEqual(0b10);
    expect(countVar.dependency!.depMask).toEqual(0b1);

    // test view
    const div = root.children![0] as any;
    expect(div.children[0].content.depMask).toEqual(0b100);
    expect(div.props.className.depMask).toEqual(0b10);

    // test sub component
    const InputCompNode = findSubCompByName(root, 'Input');
    // @ts-expect-error it's the {count}
    const inputFirstExp = InputCompNode.children![0].children[0];
    expect(inputFirstExp.content.depMask).toEqual(0b1000);
    // @ts-expect-error it's the {doubleCount}
    const inputSecondExp = InputCompNode.children![0].children![1];
    expect(inputSecondExp.content.depMask).toEqual(0b11000);
  });
});
