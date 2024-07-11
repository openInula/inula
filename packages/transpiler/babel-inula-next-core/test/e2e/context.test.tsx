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

describe('context', () => {
  describe('consumer', () => {
    it('should generate update function for single context with specific key', () => {
      expect(
        transform(`
        function App() {
          const { level, path } = useContext(UserContext);
          console.log(level, path);

          return <div>{level}-{path}</div>;
        }
      `)
      ).toMatchInlineSnapshot(`
        "import { createElement as $$createElement, createComponent as $$createComponent, setStyle as $$setStyle, setDataset as $$setDataset, setEvent as $$setEvent, delegateEvent as $$delegateEvent, setHTMLProp as $$setHTMLProp, setHTMLAttr as $$setHTMLAttr, setHTMLProps as $$setHTMLProps, setHTMLAttrs as $$setHTMLAttrs, createTextNode as $$createTextNode, updateText as $$updateText, insertNode as $$insertNode, ForNode as $$ForNode, CondNode as $$CondNode, ExpNode as $$ExpNode, ContextProvider as $$ContextProvider, PropView as $$PropView, render as $$render, notCached as $$notCached, Comp as $$Comp, useHook as $$useHook, createHook as $$createHook, untrack as $$untrack, runOnce as $$runOnce } from "@openinula/next";
        function App() {
          let self;
          let path_$c$_ = useContext(UserContext, "path");
          let level_$c$_ = useContext(UserContext, "level");
          self = $$createComponent({
            updateState: changed => {},
            updateContext: (ctx, key, value) => {
              if (ctx === UserContext) {
                if (key === "path") {
                  self.updateDerived(path_$c$_ = value, 1 /*0b1*/);
                }
                if (key === "level") {
                  self.updateDerived(level_$c$_ = value, 2 /*0b10*/);
                }
              }
            },
            getUpdateViews: () => {
              console.log(level_$c$_, path_$c$_);
              let $node0, $node1, $node2, $node3;
              $node0 = $$createElement("div");
              $node1 = new $$ExpNode(level_$c$_, [level_$c$_]);
              $$insertNode($node0, $node1, 0);
              $node2 = $$createTextNode("-", []);
              $$insertNode($node0, $node2, 1);
              $node3 = new $$ExpNode(path_$c$_, [path_$c$_]);
              $$insertNode($node0, $node3, 2);
              $node0._$nodes = [$node1, $node2, $node3];
              return [[$node0], $changed => {
                if ($changed & 1) {
                  $node3 && $node3.update(() => path_$c$_, [path_$c$_]);
                }
                if ($changed & 2) {
                  $node1 && $node1.update(() => level_$c$_, [level_$c$_]);
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

  describe('provider', () => {
    it('should provide specific key', () => {
      expect(
        transform(`
        function App() {
          let level;
          return <FileContext level={level} />
        }
      `)
      ).toMatchInlineSnapshot(`
        "import { createElement as $$createElement, createComponent as $$createComponent, setStyle as $$setStyle, setDataset as $$setDataset, setEvent as $$setEvent, delegateEvent as $$delegateEvent, setHTMLProp as $$setHTMLProp, setHTMLAttr as $$setHTMLAttr, setHTMLProps as $$setHTMLProps, setHTMLAttrs as $$setHTMLAttrs, createTextNode as $$createTextNode, updateText as $$updateText, insertNode as $$insertNode, ForNode as $$ForNode, CondNode as $$CondNode, ExpNode as $$ExpNode, ContextProvider as $$ContextProvider, PropView as $$PropView, render as $$render, notCached as $$notCached, Comp as $$Comp, useHook as $$useHook, createHook as $$createHook, untrack as $$untrack, runOnce as $$runOnce } from "@openinula/next";
        function App() {
          let self;
          let level;
          self = $$createComponent({
            updateState: changed => {},
            getUpdateViews: () => {
              let $node0;
              $node0 = new $$ContextProvider(FileContext, {
                level: level
              }, {
                level: [level]
              });
              $node0.initNodes([]);
              return [[$node0], $changed => {
                if ($changed & 1) {
                  $node0 && $node0.updateContext("level", () => level, [level]);
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
});
