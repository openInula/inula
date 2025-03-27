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

describe('ref', () => {
  it('should transform ref forwarding', () => {
    expect(
      transform(`
        function App() {
          let count = 0;
          let ref;
          return <Input ref={ref}>test</Input>;
        }

        function Input({ ref }) {
          return <input ref={ref} />;
        }

      `)
    ).toMatchInlineSnapshot(`
      "import { compBuilder as $$compBuilder, createTextNode as $$createTextNode, createChildren as $$createChildren, createCompNode as $$createCompNode, setRef as $$setRef, createHTMLNode as $$createHTMLNode } from "@openinula/next";
      function App() {
        const $$self = $$compBuilder();
        let count = 0;
        let ref;
        return $$self.prepare().init($$createCompNode(Input, {
          "ref": function ($el) {
            typeof ref === "function" ? ref($el) : ref = $el;
          },
          "children": $$createChildren(() => [$$createTextNode("test")], $$self)
        }, $$node => {
          $$node.updateProp("ref", () => ref, [ref], 1);
        }));
      }
      function Input({
        ref
      }) {
        const $$self = $$compBuilder();
        $$self.addProp("ref", $$value => ref = $$value, 1);
        return $$self.prepare().init($$createHTMLNode("input", $$node => {
          $$setRef($$node, () => typeof ref === "function" ? ref($$node) : ref = $$node);
        }));
      }"
    `);
  });
});
