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

describe('condition', () => {
  it('should transform jsx', () => {
    expect(
      transform(`
        function App() {
          return <div>
            <if cond={count > 1}>{count} is bigger than is 1</if>
            <else>{count} is smaller than 1</else>
          </div>;
        }
      `)
    ).toMatchInlineSnapshot(`
      "import { createElement as $$createElement, createComponent as $$createComponent, setStyle as $$setStyle, setDataset as $$setDataset, setEvent as $$setEvent, delegateEvent as $$delegateEvent, setHTMLProp as $$setHTMLProp, setHTMLAttr as $$setHTMLAttr, setHTMLProps as $$setHTMLProps, setHTMLAttrs as $$setHTMLAttrs, createTextNode as $$createTextNode, updateText as $$updateText, insertNode as $$insertNode, ForNode as $$ForNode, CondNode as $$CondNode, ExpNode as $$ExpNode, ContextProvider as $$ContextProvider, PropView as $$PropView, render as $$render, notCached as $$notCached, Comp as $$Comp, useHook as $$useHook, createHook as $$createHook, untrack as $$untrack, runOnce as $$runOnce } from "@openinula/next";
      function App() {
        let self;
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0, $node1;
            $node0 = $$createElement("div");
            $node1 = new $$CondNode(0, $thisCond => {
              if (count > 1) {
                if ($thisCond.cond === 0) {
                  $thisCond.didntChange = true;
                  return [];
                }
                $thisCond.cond = 0;
                let $node0, $node1;
                $thisCond.updateFunc = $changed => {};
                $node0 = new $$ExpNode(count, []);
                $node1 = $$createTextNode(" is bigger than is 1", []);
                return $thisCond.cond === 0 ? [$node0, $node1] : $thisCond.updateCond();
              } else {
                if ($thisCond.cond === 1) {
                  $thisCond.didntChange = true;
                  return [];
                }
                $thisCond.cond = 1;
                let $node0, $node1;
                $thisCond.updateFunc = $changed => {};
                $node0 = new $$ExpNode(count, []);
                $node1 = $$createTextNode(" is smaller than 1", []);
                return $thisCond.cond === 1 ? [$node0, $node1] : $thisCond.updateCond();
              }
            });
            $$insertNode($node0, $node1, 0);
            $node0._$nodes = [$node1];
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
  it('should transform condition to if jsx element', () => {
    const code = `
        function MyComp() {
          const show = true;
          return <div>{show && <h1>hello world</h1>}</div>
        }
      `;
    const transformedCode = transform(code);
    expect(transformedCode)
      .toMatchInlineSnapshot(`"import { createElement as $$createElement, createComponent as $$createComponent, setStyle as $$setStyle, setDataset as $$setDataset, setEvent as $$setEvent, delegateEvent as $$delegateEvent, setHTMLProp as $$setHTMLProp, setHTMLAttr as $$setHTMLAttr, setHTMLProps as $$setHTMLProps, setHTMLAttrs as $$setHTMLAttrs, createTextNode as $$createTextNode, updateText as $$updateText, insertNode as $$insertNode, ForNode as $$ForNode, CondNode as $$CondNode, ExpNode as $$ExpNode, EnvNode as $$EnvNode, PropView as $$PropView, render as $$render, notCached as $$notCached } from "@openinula/next";
function MyComp() {
  let self;
  const show = true;
  self = $$createComponent({
    updateState: changed => {},
    updateProp: (propName, newValue) => {},
    getUpdateViews: () => {
      let $node0, $node1;
      $node0 = $$createElement("div");
      $node1 = new $$CondNode(0, $thisCond => {
        if (show) {
          if ($thisCond.cond === 0) {
            $thisCond.didntChange = true;
            return [];
          }
          $thisCond.cond = 0;
          let $node0, $node1;
          $thisCond.updateFunc = $changed => {
            $node0 && $node0.update($changed);
          };
          $node0 = new $$PropView($addUpdate => {
            let $node0;
            $node0 = $$createElement("h1");
            $node0.textContent = "hello world";
            return [$node0];
          });
          $node1 = new $$ExpNode($node0, []);
          return $thisCond.cond === 0 ? [$node1] : $thisCond.updateCond();
        } else {
          if ($thisCond.cond === 1) {
            $thisCond.didntChange = true;
            return [];
          }
          $thisCond.cond = 1;
          $thisCond.updateFunc = $changed => {};
          return $thisCond.cond === 1 ? [] : $thisCond.updateCond();
        }
      });
      $$insertNode($node0, $node1, 0);
      $node0._$nodes = [$node1];
      return [[$node0], $changed => {
        $node1 && $node1.update($changed);
        return [$node0];
      }];
    }
  });
  return self.init();
}"`);
  });
  it('should transform triple to if else jsx element', () => {
    const code = `
        function MyComp() {
          const show = true;
          return <div>{show ? <h1>hello world</h1> : 'Empty'}</div>
        }
      `;
    const transformedCode = transform(code);
    expect(transformedCode)
      .toMatchInlineSnapshot(`"import { createElement as $$createElement, createComponent as $$createComponent, setStyle as $$setStyle, setDataset as $$setDataset, setEvent as $$setEvent, delegateEvent as $$delegateEvent, setHTMLProp as $$setHTMLProp, setHTMLAttr as $$setHTMLAttr, setHTMLProps as $$setHTMLProps, setHTMLAttrs as $$setHTMLAttrs, createTextNode as $$createTextNode, updateText as $$updateText, insertNode as $$insertNode, ForNode as $$ForNode, CondNode as $$CondNode, ExpNode as $$ExpNode, EnvNode as $$EnvNode, PropView as $$PropView, render as $$render, notCached as $$notCached } from "@openinula/next";
function MyComp() {
  let self;
  const show = true;
  self = $$createComponent({
    updateState: changed => {},
    updateProp: (propName, newValue) => {},
    getUpdateViews: () => {
      let $node0, $node1;
      $node0 = $$createElement("div");
      $node1 = new $$CondNode(0, $thisCond => {
        if (show) {
          if ($thisCond.cond === 0) {
            $thisCond.didntChange = true;
            return [];
          }
          $thisCond.cond = 0;
          let $node0, $node1;
          $thisCond.updateFunc = $changed => {
            $node0 && $node0.update($changed);
          };
          $node0 = new $$PropView($addUpdate => {
            let $node0;
            $node0 = $$createElement("h1");
            $node0.textContent = "hello world";
            return [$node0];
          });
          $node1 = new $$ExpNode($node0, []);
          return $thisCond.cond === 0 ? [$node1] : $thisCond.updateCond();
        } else {
          if ($thisCond.cond === 1) {
            $thisCond.didntChange = true;
            return [];
          }
          $thisCond.cond = 1;
          let $node0;
          $thisCond.updateFunc = $changed => {};
          $node0 = $$createTextNode('Empty', []);
          return $thisCond.cond === 1 ? [$node0] : $thisCond.updateCond();
        }
      });
      $$insertNode($node0, $node1, 0);
      $node0._$nodes = [$node1];
      return [[$node0], $changed => {
        $node1 && $node1.update($changed);
        return [$node0];
      }];
    }
  });
  return self.init();
}"`);
  });
});
