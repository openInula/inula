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
          const [count, setCount] = useState(0);
          return <div>
            {count} is smaller than 1
          </div>;
        }
      `)
    ).toMatchInlineSnapshot(`
      "import { createElement as $$createElement, createComponent as $$createComponent, setStyle as $$setStyle, setDataset as $$setDataset, setEvent as $$setEvent, delegateEvent as $$delegateEvent, setHTMLProp as $$setHTMLProp, setHTMLAttr as $$setHTMLAttr, setHTMLProps as $$setHTMLProps, setHTMLAttrs as $$setHTMLAttrs, createTextNode as $$createTextNode, updateText as $$updateText, insertNode as $$insertNode, ForNode as $$ForNode, CondNode as $$CondNode, ExpNode as $$ExpNode, ContextProvider as $$ContextProvider, PropView as $$PropView, render as $$render, notCached as $$notCached, Comp as $$Comp, useHook as $$useHook, createHook as $$createHook, untrack as $$untrack, runOnce as $$runOnce } from "@openinula/next";
      function App() {
        let self;
        let _useState_$h$_ = $$useHook(useState, [0], 1);
        let count;
        let setCount;
        self = $$createComponent({
          updateState: changed => {
            if (changed & 1) {
              if ($$notCached(self, "random_str", [_useState_$h$_?.value])) {
                {
                  self.updateDerived([count, setCount] = _useState_$h$_.value(), 2 /*0b10*/);
                }
              }
            }
          },
          getUpdateViews: () => {
            let $node0, $node1, $node2;
            $node0 = $$createElement("div");
            $node1 = new $$ExpNode(count, [count]);
            $$insertNode($node0, $node1, 0);
            $node2 = $$createTextNode(" is smaller than 1\\n          ", []);
            $$insertNode($node0, $node2, 1);
            $node0._$nodes = [$node1, $node2];
            return [[$node0], $changed => {
              if ($changed & 2) {
                $node1 && $node1.update(() => count, [count]);
              }
              return [$node0];
            }];
          }
        });
        return self.init();
      }"
    `);
  });
});
