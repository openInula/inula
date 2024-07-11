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
      "import { createElement as $$createElement, createComponent as $$createComponent, setStyle as $$setStyle, setDataset as $$setDataset, setEvent as $$setEvent, delegateEvent as $$delegateEvent, setHTMLProp as $$setHTMLProp, setHTMLAttr as $$setHTMLAttr, setHTMLProps as $$setHTMLProps, setHTMLAttrs as $$setHTMLAttrs, createTextNode as $$createTextNode, updateText as $$updateText, insertNode as $$insertNode, ForNode as $$ForNode, CondNode as $$CondNode, ExpNode as $$ExpNode, ContextProvider as $$ContextProvider, PropView as $$PropView, render as $$render, notCached as $$notCached, Comp as $$Comp, useHook as $$useHook, createHook as $$createHook, untrack as $$untrack, runOnce as $$runOnce } from "@openinula/next";
      function App() {
        let self;
        let count = 0;
        let ref;
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0, $node1;
            $node1 = new $$PropView($addUpdate => {
              let $node0;
              $node0 = $$createTextNode("test", []);
              return [$node0];
            });
            $node0 = $$Comp(Input, {
              "ref": function ($el) {
                typeof ref === "function" ? ref($el) : ref = $el;
              },
              "children": $node1
            });
            return [[$node0], $changed => {
              $node1 && $node1.update($changed);
              return [$node0];
            }];
          }
        });
        return self.init();
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
              self.updateDerived(ref_$p$_ = newValue, 1 /*0b1*/);
            }
          },
          getUpdateViews: () => {
            let $node0;
            $node0 = $$createElement("input");
            typeof ref_$p$_ === "function" ? ref_$p$_($node0) : ref_$p$_ = $node0;
            return [[$node0],,];
          }
        });
        return self.init();
      }"
    `);
  });
});
