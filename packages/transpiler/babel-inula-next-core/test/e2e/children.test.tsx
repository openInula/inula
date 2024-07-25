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
      "import { createComponent as $$createComponent } from "@openinula/next";
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
        return self.init();
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
      "import { createComponent as $$createComponent, createElement as $$createElement, ExpNode as $$ExpNode, insertNode as $$insertNode, PropView as $$PropView } from "@openinula/next";
      function MyComp() {
        let self;
        let count = 0;
        const add = () => self.updateDerived(count += 1, 1 /*0b1*/);
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0, $node1;
            $node1 = new $$PropView($addUpdate => {
              let $node0, $node1;
              $addUpdate($changed => {
                if ($changed & 1) {
                  $node1 && $node1.update(() => count, [count]);
                }
              });
              $node0 = $$createElement("h1");
              $node1 = new $$ExpNode(count, [count]);
              $$insertNode($node0, $node1, 0);
              $node0._$nodes = [$node1];
              return [$node0];
            });
            $node0 = $$Comp(Sub, {
              "children": $node1
            });
            return [[$node0], $changed => {
              $node1 && $node1.update($changed);
              return [$node0];
            }];
          }
        });
        return self.init();
      }"
    `);
  });
});
