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
      "import { createComponent as $$createComponent, createTextNode as $$createTextNode, createNode as $$createNode, updateNode as $$updateNode, Comp as $$Comp, initCompNode as $$initCompNode, createElement as $$createElement } from "@openinula/next";
      function App() {
        let self;
        let count = 0;
        let ref;
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0, $node1;
            $node1 = $$createNode(6 /*Children*/, $addUpdate => {
              let $node0;
              $node0 = $$createTextNode("test", []);
              return [$node0];
            });
            $node0 = $$Comp(Input, {
              "ref": function ($el) {
                typeof ref === "function" ? ref($el) : $$updateNode(self, ref = $el, 1 /*0b1*/);
              },
              "children": $node1
            });
            return [[$node0], $changed => {
              $$updateNode($node1, $changed);
              return [$node0];
            }];
          }
        });
        return $$initCompNode(self);
      }
      function Input({
        ref
      }) {
        let self;
        let ref_$p$_ = ref;
        self = $$createComponent({
          updateState: changed => {},
          updateProp: (propName, newValue) => {
            if (propName === "ref") {
              $$updateNode(self, ref_$p$_ = newValue, 1 /*0b1*/);
            }
          },
          getUpdateViews: () => {
            let $node0;
            $node0 = $$createElement("input");
            typeof ref_$p$_ === "function" ? ref_$p$_($node0) : ref_$p$_ = $node0;
            return [[$node0],,];
          }
        });
        return $$initCompNode(self);
      }"
    `);
  });
});
