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

describe('children', () => {
  it('should support children', () => {
    expect(
      transform(`
      function App() {
        return <Child name={'hello world!!!'} />;
      }
    `)
    ).toMatchInlineSnapshot(`
      "import { createComponent as $$createComponent, Comp as $$Comp, setProp as $$setProp, initCompNode as $$initCompNode } from "@openinula/next";
      function App() {
        let self;
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0;
            $node0 = $$Comp(Child, {
              "name": 'hello world!!!'
            });
            return [[$node0],,];
          }
        });
        return $$initCompNode(self);
      }"
    `);
  });
  it('should support children in comp', () => {
    expect(
      transform(`
      function MyComp() {
        let count = 0;
        const add = () => (count += 1);
        return (
          <>
            <Sub>
              <h1>{count}</h1>
            </Sub>
          </>
        );
      }
      `)
    ).toMatchInlineSnapshot(`
      "import { updateNode as $$updateNode, createComponent as $$createComponent, createElement as $$createElement, createNode as $$createNode, insertNode as $$insertNode, Comp as $$Comp, initCompNode as $$initCompNode } from "@openinula/next";
      function MyComp() {
        let self;
        let count = 0;
        const add = () => $$updateNode(self, count += 1, 1 /*0b1*/);
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0, $node1;
            $node1 = $$createNode(6 /*Children*/, $addUpdate => {
              let $node0, $node1;
              $addUpdate($changed => {
                if ($changed & 1) {
                  $node1 && $$updateNode($node1, () => count, [count]);
                }
              });
              $node0 = $$createElement("h1");
              $node1 = $$createNode(3 /*Exp*/, () => count, [count]);
              $$insertNode($node0, $node1, 0);
              $node0._$nodes = [$node1];
              return [$node0];
            });
            $node0 = $$Comp(Sub, {
              "children": $node1
            });
            return [[$node0], $changed => {
              $$updateNode($node1, $changed);
              return [$node0];
            }];
          }
        });
        return $$initCompNode(self);
      }"
    `);
  });

  it('should support null children', () => {
    expect(
      transform(`
      function App() {
        fn();
        return null;
      }
    `)
    ).toMatchInlineSnapshot(`
      "import { createComponent as $$createComponent, initCompNode as $$initCompNode } from "@openinula/next";
      function App() {
        let self;
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            fn();
          }
        });
        return $$initCompNode(self);
      }"
    `);
  });
});
