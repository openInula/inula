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
import { functionalMacroAnalyze } from '../../src/analyze/Analyzers/functionalMacroAnalyze';
import { types as t } from '@openinula/babel-api';
import { mockAnalyze } from './mock';

const analyze = (code: string) => mockAnalyze(code, [functionalMacroAnalyze]);
const combine = (body: t.Statement[]) => t.program(body);

describe('analyze lifeCycle', () => {
  it('should collect will mount', () => {
    const root = analyze(/*js*/ `
      Component(() => {
        willMount(() => {
          console.log('test');
        })
      })
    `);

    expect(genCode(combine(root.lifecycle.willMount!))).toMatchInlineSnapshot(`
      "{
        console.log('test');
      }"
    `);
  });

  it('should collect on mount', () => {
    const root = analyze(/*js*/ `
      Component(() => {
        didMount(() => {
          console.log('test');
        })
      })
    `);

    expect(genCode(combine(root.lifecycle.didMount!))).toMatchInlineSnapshot(`
      "{
        console.log('test');
      }"
    `);
  });

  it('should  async on mount', () => {
    const root = analyze(/*js*/ `
      Component(() => {
        didMount(async () => {
          const data = await fetch(API_URL)
        })
      })
    `);

    expect(genCode(combine(root.lifecycle.didMount!))).toMatchInlineSnapshot(`
      "(async () => {
        const data = await fetch(API_URL);
      })();"
    `);
  });

  it('should collect willUnmount', () => {
    const root = analyze(/*js*/ `
      Component(() => {
        willUnmount(() => {
          console.log('test');
        })
      })
    `);

    expect(genCode(combine(root.lifecycle.willUnmount!))).toMatchInlineSnapshot(`
      "{
        console.log('test');
      }"
    `);
  });

  it('should collect didUnmount', () => {
    const root = analyze(/*js*/ `
      Component(() => {
        didUnmount(() => {
          console.log('test');
        })
      })
    `);

    expect(genCode(combine(root.lifecycle.didUnmount!))).toMatchInlineSnapshot(`
      "{
        console.log('test');
      }"
    `);
  });

  it('should handle multiple lifecycle methods', () => {
    const root = analyze(/*js*/ `
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

    expect(genCode(combine(root.lifecycle.willMount!))).toMatchInlineSnapshot(`
      "{
        console.log('willMount');
      }"
    `);
    expect(genCode(combine(root.lifecycle.didMount!))).toMatchInlineSnapshot(`
      "{
        console.log('didMount');
      }"
    `);
    expect(genCode(combine(root.lifecycle.willUnmount!))).toMatchInlineSnapshot(`
      "{
        console.log('willUnmount');
      }"
    `);
    expect(genCode(combine(root.lifecycle.didUnmount!))).toMatchInlineSnapshot(`
      "{
        console.log('didUnmount');
      }"
    `);
  });
});
