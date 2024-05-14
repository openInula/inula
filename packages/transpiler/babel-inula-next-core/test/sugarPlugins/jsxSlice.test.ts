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
import { compile } from './mock';
import jsxSlicePlugin from '../../src/sugarPlugins/jsxSlicePlugin';

const mock = (code: string) => compile([jsxSlicePlugin], code);

describe('jsx slice', () => {
  it('should work with jsx slice', () => {
    expect(
      mock(`
        function App() {
          const a = <div></div>
        }
      `)
    ).toMatchInlineSnapshot(/*jsx*/ `
      "function App() {
        const a = Component(() => <div></div>);
      }"
    `);
  });

  it('should work with jsx slice in ternary operator', () => {
    expect(
      mock(`
      function App() {
        const a = true ? <Table.Col></Table.Col> : <div></div>
      }
    `)
    ).toMatchInlineSnapshot(`
      "function App() {
        const JSX_Table_Col = Component(() => <Table.Col></Table.Col>);
        const JSX_div = Component(() => <div></div>);
        const a = true ? <JSX_Table_Col /> : <JSX_div />;
      }"
    `);
  });

  it('should work with jsx slice in arr', () => {
    expect(
      mock(`
      function App() {
        const arr = [<div></div>,<h1></h1>]
      }
    `)
    ).toMatchInlineSnapshot(`
      "function App() {
        const JSX_div = Component(() => <div></div>);
        const JSX_h = Component(() => <h1></h1>);
        const arr = [<JSX_div />, <JSX_h />];
      }"
    `);
  });

  it('fragment should work', () => {
    expect(
      mock(`
      function App() {
        const a = <>{test}</>
        const b = cond ? <><div></div></> : <><span></span></>
      }
    `)
    ).toMatchInlineSnapshot(`
      "function App() {
        const a = Component(() => <>{test}</>);
        const JSX_Fragment = Component(() => <><div></div></>);
        const JSX_Fragment2 = Component(() => <><span></span></>);
        const b = cond ? <JSX_Fragment /> : <JSX_Fragment2 />;
      }"
    `);
  });
});
