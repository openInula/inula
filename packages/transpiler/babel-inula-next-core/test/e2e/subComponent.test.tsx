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
import { transform } from '../mock';

describe('nested component', () => {
  it('should transform subComponent', () => {
    expect(
      transform(`
        function App() {
          let val = 123;
          function Input() {
            let double = val * 2
            return <input value={double}/>;
          }
          return <div><Input /></div>;
        }
      `)
    ).toMatchInlineSnapshot(`
      "import { compBuilder as $$compBuilder, setHTMLProp as $$setHTMLProp, createHTMLNode as $$createHTMLNode, createCompNode as $$createCompNode } from "@openinula/next";
      function App() {
        const $$self = $$compBuilder();
        let val = 123;
        function Input() {
          const $$self1 = $$compBuilder($$self);
          let double;
          $$self1.deriveState(() => (double = val * 2), () => [val], 1);
          return $$self1.prepare().init($$createHTMLNode("input", $$node => {
            $$setHTMLProp($$node, "value", () => double, [double], 2);
          }));
        }
        return $$self.prepare().init($$createHTMLNode("div", null, $$createCompNode(Input, {}, null)));
      }"
    `);
  });

  it('should transform JSX slice', () => {
    expect(
      transform(`
        function App() {
          let val = 123;
          const input = <input value={val}/>;
          return <div>{input}</div>;
        }
      `)
    ).toMatchInlineSnapshot(`
      "import { createCompNode as $$createCompNode, compBuilder as $$compBuilder, setHTMLProp as $$setHTMLProp, createHTMLNode as $$createHTMLNode, createExpNode as $$createExpNode } from "@openinula/next";
      function App() {
        const $$self = $$compBuilder();
        let val = 123;
        function JSX_input() {
          const $$self1 = $$compBuilder($$self);
          return $$self1.prepare().init($$createHTMLNode("input", $$node => {
            $$setHTMLProp($$node, "value", () => val, [val], 1);
          }));
        }
        let input = $$createCompNode(JSX_input);
        return $$self.prepare().init($$createHTMLNode("div", null, $$createExpNode(() => input, () => [input], 2)));
      }"
    `);
  });
});
