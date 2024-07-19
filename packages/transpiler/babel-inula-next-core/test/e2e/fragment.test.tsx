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

describe('fragment', () => {
  it('should support elements in fragment', () => {
    expect(
      transform(`
        import { render } from '@openinula/next';

        function App () {
          return <><div>xxx</div></>
        }
        render(
          App,
          document.getElementById('app')
        );
      `)
    ).toMatchInlineSnapshot(`
      "import { createElement as $$createElement, createComponent as $$createComponent, setStyle as $$setStyle, setDataset as $$setDataset, setEvent as $$setEvent, delegateEvent as $$delegateEvent, setHTMLProp as $$setHTMLProp, setHTMLAttr as $$setHTMLAttr, setHTMLProps as $$setHTMLProps, setHTMLAttrs as $$setHTMLAttrs, createTextNode as $$createTextNode, updateText as $$updateText, insertNode as $$insertNode, ForNode as $$ForNode, CondNode as $$CondNode, ExpNode as $$ExpNode, ContextProvider as $$ContextProvider, PropView as $$PropView, render as $$render, notCached as $$notCached, Comp as $$Comp, useHook as $$useHook, createHook as $$createHook, untrack as $$untrack, runOnce as $$runOnce } from "@openinula/next";
      import { render } from '@openinula/next';
      function App() {
        let self;
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0;
            $node0 = $$createElement("div");
            $node0.textContent = "xxx";
            return [[$node0],,];
          }
        });
        return self.init();
      }
      render(App, document.getElementById('app'));"
    `);
  });
});
