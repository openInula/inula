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
      "import { createComponent as $$createComponent, createElement as $$createElement, ExpNode as $$ExpNode, insertNode as $$insertNode, ForNode as $$ForNode } from "@openinula/next";
      function MyComp() {
        let self;
        let arr = [1, 2, 3];
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0;
            $node0 = new $$ForNode(arr, 1, null, (item, $idx, $updateArr) => {
              let $node0, $node1;
              $updateArr[$idx] = ($changed, $item) => {
                item = $item;
                if ($changed & 1) {
                  $node1 && $node1.update(() => item, [item]);
                }
              };
              $node0 = $$createElement("div");
              $node1 = new $$ExpNode(item, [item]);
              $$insertNode($node0, $node1, 0);
              $node0._$nodes = [$node1];
              return [$node0];
            });
            return [[$node0], $changed => {
              if ($changed & 1) {
                $node0 && $node0.updateArray(arr, null);
              }
              $node0 && $node0.update($changed);
              return [$node0];
            }];
          }
        });
        return self.init();
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
    expect(transformedCode).toMatchInlineSnapshot('TODO');
  });
});
