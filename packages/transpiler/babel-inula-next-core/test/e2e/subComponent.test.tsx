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
      "import { createElement as $$createElement, createComponent as $$createComponent, setStyle as $$setStyle, setDataset as $$setDataset, setEvent as $$setEvent, delegateEvent as $$delegateEvent, setHTMLProp as $$setHTMLProp, setHTMLAttr as $$setHTMLAttr, setHTMLProps as $$setHTMLProps, setHTMLAttrs as $$setHTMLAttrs, createTextNode as $$createTextNode, updateText as $$updateText, insertNode as $$insertNode, ForNode as $$ForNode, CondNode as $$CondNode, ExpNode as $$ExpNode, ContextProvider as $$ContextProvider, PropView as $$PropView, render as $$render, notCached as $$notCached, Comp as $$Comp, useHook as $$useHook, createHook as $$createHook, untrack as $$untrack, runOnce as $$runOnce } from "@openinula/next";
      function App() {
        let self;
        let val = 123;
        function Input() {
          let self;
          self = $$createComponent({
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
          return self.init();
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
              if ($changed & 1) {
                $node1.updateDerived(null, 1);
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
