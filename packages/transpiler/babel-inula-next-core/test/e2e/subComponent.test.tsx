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
      "import { createComponent as $$createComponent, updateNode as $$updateNode, notCached as $$notCached, createElement as $$createElement, setHTMLProp as $$setHTMLProp, initCompNode as $$initCompNode, Comp as $$Comp, insertNode as $$insertNode } from "@openinula/next";
      function App() {
        let self;
        let val = 123;
        function Input() {
          let self1;
          let double;
          self1 = $$createComponent({
            updateState: changed => {
              if (changed & 1) {
                if ($$notCached(self1, "cache0", [val])) {
                  $$updateNode(self1, double = val * 2, 2 /*0b10*/);
                }
              }
            },
            getUpdateViews: () => {
              let $node0;
              $node0 = $$createElement("input");
              $$setHTMLProp($node0, "value", () => double, [double]);
              return [[$node0], $changed => {
                if ($changed & 2) {
                  $node0 && $$setHTMLProp($node0, "value", () => double, [double]);
                }
                return [$node0];
              }];
            }
          });
          return $$initCompNode(self1);
        }
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0, $node1;
            $node0 = $$createElement("div");
            $node1 = $$Comp(Input, {});
            $$insertNode($node0, $node1, 0);
            $node0._$nodes = [$node1];
            return [[$node0], $changed => {
              if ($changed & 3) {
                $$updateNode($node1, null, 3);
              }
              return [$node0];
            }];
          }
        });
        return $$initCompNode(self);
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
      "import { Comp as $$Comp, createComponent as $$createComponent, createElement as $$createElement, setHTMLProp as $$setHTMLProp, initCompNode as $$initCompNode, createNode as $$createNode, updateNode as $$updateNode, insertNode as $$insertNode } from "@openinula/next";
      function App() {
        let self;
        let val = 123;
        function JSX_input() {
          let self1;
          self1 = $$createComponent({
            updateState: changed => {},
            getUpdateViews: () => {
              let $node0;
              $node0 = $$createElement("input");
              $$setHTMLProp($node0, "value", () => val, [val]);
              return [[$node0], $changed => {
                if ($changed & 1) {
                  $node0 && $$setHTMLProp($node0, "value", () => val, [val]);
                }
                return [$node0];
              }];
            }
          });
          return $$initCompNode(self1);
        }
        const input = $$Comp(JSX_input);
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0, $node1;
            $node0 = $$createElement("div");
            $node1 = $$createNode(3 /*Exp*/, () => input, [input]);
            $$insertNode($node0, $node1, 0);
            $node0._$nodes = [$node1];
            return [[$node0], $changed => {
              if ($changed & 2) {
                $node1 && $$updateNode($node1, () => input, [input]);
              }
              return [$node0];
            }];
          }
        });
        return $$initCompNode(self);
      }"
    `);
  });
});
