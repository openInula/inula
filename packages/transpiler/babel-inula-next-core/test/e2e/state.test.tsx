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

describe('state', () => {
  it('should transform destructing state', () => {
    expect(
      transform(`
        function App() {
          let x = 0;
          const [count, setCount] = genState(x);
          return <div>
            {count} is smaller than 1
          </div>;
        }
      `)
    ).toMatchInlineSnapshot(`
      "import { createComponent as $$createComponent, updateNode as $$updateNode, notCached as $$notCached, createElement as $$createElement, createNode as $$createNode, insertNode as $$insertNode, createTextNode as $$createTextNode, appendNode as $$appendNode, initCompNode as $$initCompNode } from "@openinula/next";
      function App() {
        let self;
        let x = 0;
        let count;
        let setCount;
        self = $$createComponent({
          updateState: changed => {
            if (changed & 1) {
              if ($$notCached(self, "cache0", [x])) {
                {
                  $$updateNode(self, [count, setCount] = genState(x), 2 /*0b10*/);
                }
              }
            }
          },
          getUpdateViews: () => {
            let $node0, $node1, $node2;
            $node0 = $$createElement("div");
            $node1 = $$createNode(3 /*Exp*/, () => count, [count]);
            $$insertNode($node0, $node1, 0);
            $node2 = $$createTextNode(" is smaller than 1", []);
            $$appendNode($node0, $node2);
            $node0._$nodes = [$node1, $node2];
            return [[$node0], $changed => {
              if ($changed & 2) {
                $node1 && $$updateNode($node1, () => count, [count]);
              }
              return [$node0];
            }];
          }
        });
        return $$initCompNode(self);
      }"
    `);
  });

  it('should transform functional dependency state', () => {
    expect(
      transform(`
        function App() {
          let x = 1;
          const double = x * 2;
          const quadruple = double * 2;
          const getQuadruple = () => quadruple;
          const y = getQuadruple() + x;
          return <div>{y}</div>;
        }
      `)
    ).toMatchInlineSnapshot(`
      "import { Comp as $$Comp, createComponent as $$createComponent, updateNode as $$updateNode, notCached as $$notCached, createElement as $$createElement, createNode as $$createNode, insertNode as $$insertNode, initCompNode as $$initCompNode } from "@openinula/next";
      function App() {
        let self;
        let x = 1;
        let double;
        let quadruple;
        const getQuadruple = () => quadruple;
        let y;
        self = $$createComponent({
          updateState: changed => {
            if (changed & 1) {
              if ($$notCached(self, "cache0", [x])) {
                $$updateNode(self, double = x * 2, 2 /*0b10*/);
                $$updateNode(self, y = getQuadruple() + x, 4 /*0b100*/);
              }
            }
            if (changed & 2) {
              if ($$notCached(self, "cache1", [double])) {
                quadruple = double * 2;
              }
            }
          },
          getUpdateViews: () => {
            let $node0, $node1;
            $node0 = $$createElement("div");
            $node1 = $$createNode(3 /*Exp*/, () => y, [y]);
            $$insertNode($node0, $node1, 0);
            $node0._$nodes = [$node1];
            return [[$node0], $changed => {
              if ($changed & 4) {
                $node1 && $$updateNode($node1, () => y, [y]);
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
