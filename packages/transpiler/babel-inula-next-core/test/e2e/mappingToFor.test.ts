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

describe('mapping2ForPlugin', () => {
  it('should transform map to for jsxelement', () => {
    const code = `
        function MyComp() {
          let arr = [1, 2, 3];
          return (
            <>
            {arr.map((item) => (<div>{item}</div>))}
            </>
          )
        }
      `;
    const transformedCode = transform(code);
    expect(transformedCode).toMatchInlineSnapshot(`
      "import { createComponent as $$createComponent, createElement as $$createElement, createNode as $$createNode, updateNode as $$updateNode, insertNode as $$insertNode, updateChildren as $$updateChildren, initCompNode as $$initCompNode } from "@openinula/next";
      function MyComp() {
        let self;
        let arr = [1, 2, 3];
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0;
            $node0 = $$createNode(1 /*For*/, arr, 1, null, (item, $idx, $updateArr) => {
              let $node0, $node1;
              $updateArr[$idx] = ($changed, $item) => {
                item = $item;
                if ($changed & 1) {
                  $node1 && $$updateNode($node1, () => item, [item]);
                }
              };
              $node0 = $$createElement("div");
              $node1 = $$createNode(3 /*Exp*/, () => item, [item]);
              $$insertNode($node0, $node1, 0);
              $node0._$nodes = [$node1];
              return [$node0];
            });
            return [[$node0], $changed => {
              if ($changed & 1) {
                $node0 && $$updateNode($node0, arr, null);
              }
              $node0 && $$updateChildren($node0, $changed);
              return [$node0];
            }];
          }
        });
        return $$initCompNode(self);
      }"
    `);
  });
  it.fails('should transform last map to for ', () => {
    const code = `
        function MyComp() {
          let arr = [1, 2, 3];
          return (
            <div>
            {arr.map(item => <h1>{item}</h1>).map((item) => (<div>{item}</div>))}
            </div>
          )
        }
      `;
    const transformedCode = transform(code);
    expect(transformedCode).toMatchInlineSnapshot(`
      "import { createComponent as $$createComponent, createElement as $$createElement, createNode as $$createNode, updateNode as $$updateNode, insertNode as $$insertNode, updateChildren as $$updateChildren, initCompNode as $$initCompNode } from "@openinula/next";
      function MyComp() {
        let self;
        let arr = [1, 2, 3];
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0, $node1;
            $node0 = $$createElement("div");
            $node1 = $$createNode(1 /*For*/, arr.map(item => <h1>{item}</h1>), 1, null, (item, $idx, $updateArr) => {
              let $node0, $node1;
              $updateArr[$idx] = ($changed, $item) => {
                item = $item;
                if ($changed & 1) {
                  $node1 && $$updateNode($node1, () => item, [item]);
                }
              };
              $node0 = $$createElement("div");
              $node1 = $$createNode(3 /*Exp*/, () => item, [item]);
              $$insertNode($node0, $node1, 0);
              $node0._$nodes = [$node1];
              return [$node0];
            });
            $$insertNode($node0, $node1, 0);
            $node0._$nodes = [$node1];
            return [[$node0], $changed => {
              if ($changed & 1) {
                $node1 && $$updateNode($node1, arr.map(item => <h1>{item}</h1>), null);
              }
              $node1 && $$updateChildren($node1, $changed);
              return [$node0];
            }];
          }
        });
        return $$initCompNode(self);
      }"
    `);
  });
});
