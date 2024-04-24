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
import { isCondNode } from '../../src/analyze';
import { mockAnalyze } from '../mock';

describe('analyze early return', () => {
  it('should work', () => {
    const root = mockAnalyze(`
      function App() {
        if (count > 1) {
          return <div>1</div>
        }
        return <div>
          <if cond={count > 1}>{count} is bigger than is 1</if>
          <else>{count} is smaller than 1</else>
        </div>;
      }
    `);
    const branchNode = root?.child;
    if (!isCondNode(branchNode)) {
      throw new Error('Should be branch node');
    }
    expect(branchNode.branches.length).toBe(1);
  });

  it('should work with multi if', () => {
    const root = mockAnalyze(`
      function App() {
        if (count > 1) {
          return <div>1</div>
        }
        if (count > 2) {
          return <div>2</div>
        }
        return <div></div>;
      }
    `);
    const branchNode = root?.child;
    if (!isCondNode(branchNode)) {
      throw new Error('Should be branch node');
    }
    expect(branchNode.branches.length).toBe(1);
    const subBranch = branchNode.child.child;
    if (!isCondNode(subBranch)) {
      throw new Error('SubBranchNode should be branch node');
    }
    expect(subBranch.branches.length).toBe(1);
  });

  it('should work with nested if', () => {
    const root = mockAnalyze(`
      function App() {
        if (count > 1) {
          if (count > 2) {
            return <div>2</div>
          }
          return <div>1</div>
        }
        return <div></div>;
      }
    `);
    const branchNode = root?.child;
    if (!isCondNode(branchNode)) {
      throw new Error('Should be branch node');
    }
    expect(branchNode.branches.length).toBe(1);
    const subBranchNode = branchNode.branches[0].content.child;
    if (!isCondNode(subBranchNode)) {
      throw new Error('SubBranchNode should be branch node');
    }
    expect(subBranchNode.branches.length).toBe(1);
  });
});
