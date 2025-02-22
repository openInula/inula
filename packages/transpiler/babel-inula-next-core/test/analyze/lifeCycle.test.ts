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
import { functionalMacroAnalyze } from '../../src/analyze/Analyzers/functionalMacroAnalyze';
import { mockAnalyze } from './mock';
import { LifecycleStmt } from '../../src/analyze/types';

const analyze = (code: string) => mockAnalyze(code, [functionalMacroAnalyze]);

describe('analyze lifeCycle', () => {
  it('should collect will mount', () => {
    const [root] = analyze(/*js*/ `
      Component(() => {
        willMount(() => {
          console.log('test');
        })
      })
    `);

    expect(root.body[1].type).toBe('lifecycle');
    expect((root.body[1] as LifecycleStmt).lifeCycle).toBe('willMount');
  });

  it('should collect on mount', () => {
    const [root] = analyze(/*js*/ `
      Component(() => {
        didMount(() => {
          console.log('test');
        })
      })
    `);

    expect(root.body[1].type).toBe('lifecycle');
    expect((root.body[1] as LifecycleStmt).lifeCycle).toBe('didMount');
  });

  it('should  async on mount', () => {
    const [root] = analyze(/*js*/ `
      Component(() => {
        didMount(async () => {
          const data = await fetch(API_URL)
        })
      })
    `);

    expect(root.body[1].type).toBe('lifecycle');
    expect((root.body[1] as LifecycleStmt).lifeCycle).toBe('didMount');
  });

  it('should collect willUnmount', () => {
    const [root] = analyze(/*js*/ `
      Component(() => {
        willUnmount(() => {
          console.log('test');
        })
      })
    `);

    expect(root.body[1].type).toBe('lifecycle');
    expect((root.body[1] as LifecycleStmt).lifeCycle).toBe('willUnmount');
  });

  it('should collect didUnmount', () => {
    const [root] = analyze(/*js*/ `
      Component(() => {
        didUnmount(() => {
          console.log('test');
        })
      })
    `);

    expect(root.body[1].type).toBe('lifecycle');
    expect((root.body[1] as LifecycleStmt).lifeCycle).toBe('didUnmount');
  });

  it('should handle multiple lifecycle methods', () => {
    const [root] = analyze(/*js*/ `
      Component(() => {
        willMount(() => {
          console.log('willMount');
        })
        didMount(() => {
          console.log('didMount');
        })
        willUnmount(() => {
          console.log('willUnmount');
        })
        didUnmount(() => {
          console.log('didUnmount');
        })
      })
    `);

    expect(root.body[1].type).toBe('lifecycle');
    expect((root.body[1] as LifecycleStmt).lifeCycle).toBe('willMount');
    expect(root.body[2].type).toBe('lifecycle');
    expect((root.body[2] as LifecycleStmt).lifeCycle).toBe('didMount');
    expect(root.body[3].type).toBe('lifecycle');
    expect((root.body[3] as LifecycleStmt).lifeCycle).toBe('willUnmount');
    expect(root.body[4].type).toBe('lifecycle');
    expect((root.body[4] as LifecycleStmt).lifeCycle).toBe('didUnmount');
  });
});
