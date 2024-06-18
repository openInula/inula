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

describe('props', () => {
  it('should pass empty object without props', () => {
    expect(
      transform(`
        function App() {
          return <Child />;
        }
      `)
    ).toMatchInlineSnapshot(`
      "import { createElement as $$createElement, createComponent as $$createComponent, setStyle as $$setStyle, setDataset as $$setDataset, setEvent as $$setEvent, delegateEvent as $$delegateEvent, setHTMLProp as $$setHTMLProp, setHTMLAttr as $$setHTMLAttr, setHTMLProps as $$setHTMLProps, setHTMLAttrs as $$setHTMLAttrs, createTextNode as $$createTextNode, updateText as $$updateText, insertNode as $$insertNode, ForNode as $$ForNode, CondNode as $$CondNode, ExpNode as $$ExpNode, EnvNode as $$EnvNode, PropView as $$PropView, render as $$render, notCached as $$notCached } from "@openinula/next";
      function App() {
        let self;
        self = $$createComponent({
          updateState: changed => {},
          updateProp: (propName, newValue) => {},
          getUpdateViews: () => {
            let $node0;
            $node0 = Child({});
            return [[$node0],,];
          }
        });
        return self.init();
      }"
    `);
  });

  it('should handle props destructing', () => {
    expect(
      transform(`
        function App({ id, className = 'default' }) {
          return <div id={id} className={className}>
          </div>;
        }
      `)
    ).toMatchInlineSnapshot(`
      "import { createElement as $$createElement, createComponent as $$createComponent, setStyle as $$setStyle, setDataset as $$setDataset, setEvent as $$setEvent, delegateEvent as $$delegateEvent, setHTMLProp as $$setHTMLProp, setHTMLAttr as $$setHTMLAttr, setHTMLProps as $$setHTMLProps, setHTMLAttrs as $$setHTMLAttrs, createTextNode as $$createTextNode, updateText as $$updateText, insertNode as $$insertNode, ForNode as $$ForNode, CondNode as $$CondNode, ExpNode as $$ExpNode, EnvNode as $$EnvNode, PropView as $$PropView, render as $$render, notCached as $$notCached } from "@openinula/next";
      function App({
        id,
        className = 'default'
      }) {
        let self;
        let id_$p$_ = id;
        let className_$p$_ = className;
        self = $$createComponent({
          updateState: changed => {},
          updateProp: (propName, newValue) => {
            if (propName === "className") {
              self.updateDerived(className_$p$_ = newValue, 2 /*0b10*/);
            } else if (propName === "id") {
              self.updateDerived(id_$p$_ = newValue, 1 /*0b1*/);
            }
          },
          getUpdateViews: () => {
            let $node0;
            $node0 = $$createElement("div");
            $$setHTMLProp($node0, "id", () => id_$p$_, [id_$p$_]);
            $$setHTMLProp($node0, "className", () => className_$p$_, [className_$p$_]);
            return [[$node0], $changed => {
              if ($changed & 1) {
                $node0 && $$setHTMLProp($node0, "id", () => id_$p$_, [id_$p$_]);
              }
              if ($changed & 2) {
                $node0 && $$setHTMLProp($node0, "className", () => className_$p$_, [className_$p$_]);
              }
              return [$node0];
            }];
          }
        });
        return self.init();
      }"
    `);
  });

  it('should handle props nested destructing', () => {
    expect(
      transform(`
        function App({ info: { id, className = 'default', pos: [x, y] } }) {
          return <div id={id} className={className} style={{left: x, top: y}}>
          </div>;
        }
      `)
    ).toMatchInlineSnapshot(`
      "import { createElement as $$createElement, createComponent as $$createComponent, setStyle as $$setStyle, setDataset as $$setDataset, setEvent as $$setEvent, delegateEvent as $$delegateEvent, setHTMLProp as $$setHTMLProp, setHTMLAttr as $$setHTMLAttr, setHTMLProps as $$setHTMLProps, setHTMLAttrs as $$setHTMLAttrs, createTextNode as $$createTextNode, updateText as $$updateText, insertNode as $$insertNode, ForNode as $$ForNode, CondNode as $$CondNode, ExpNode as $$ExpNode, EnvNode as $$EnvNode, PropView as $$PropView, render as $$render, notCached as $$notCached } from "@openinula/next";
      function App({
        info
      }) {
        let self;
        let info_$p$_ = info;
        let id;
        let className;
        let x;
        let y;
        self = $$createComponent({
          updateState: changed => {
            if (changed & 1) {
              if ($$notCached(self, "random_str", [info_$p$_])) {
                {
                  self.updateDerived(({
                    id,
                    className = 'default',
                    pos: [x, y]
                  } = info_$p$_), 30 /*0b11110*/);
                }
              }
            }
          },
          updateProp: (propName, newValue) => {
            if (propName === "info") {
              self.updateDerived(info_$p$_ = newValue, 1 /*0b1*/);
            }
          },
          getUpdateViews: () => {
            let $node0;
            $node0 = $$createElement("div");
            $$setHTMLProp($node0, "id", () => id, [id]);
            $$setHTMLProp($node0, "className", () => className, [className]);
            $$setStyle($node0, {
              left: x,
              top: y
            });
            return [[$node0], $changed => {
              if ($changed & 2) {
                $node0 && $$setHTMLProp($node0, "id", () => id, [id]);
              }
              if ($changed & 4) {
                $node0 && $$setHTMLProp($node0, "className", () => className, [className]);
              }
              if ($changed & 24) {
                $node0 && $$setStyle($node0, {
                  left: x,
                  top: y
                });
              }
              return [$node0];
            }];
          }
        });
        return self.init();
      }"
    `);
  });

  it('should support alias', () => {
    expect(
      transform(/**jsx*/ `
        function Child({ name: alias }) {
         return <h1>{alias}</h1>;
        }
      `)
    ).toMatchInlineSnapshot(`
      "import { createElement as $$createElement, createComponent as $$createComponent, setStyle as $$setStyle, setDataset as $$setDataset, setEvent as $$setEvent, delegateEvent as $$delegateEvent, setHTMLProp as $$setHTMLProp, setHTMLAttr as $$setHTMLAttr, setHTMLProps as $$setHTMLProps, setHTMLAttrs as $$setHTMLAttrs, createTextNode as $$createTextNode, updateText as $$updateText, insertNode as $$insertNode, ForNode as $$ForNode, CondNode as $$CondNode, ExpNode as $$ExpNode, EnvNode as $$EnvNode, PropView as $$PropView, render as $$render, notCached as $$notCached } from "@openinula/next";
      function Child({
        name
      }) {
        let self;
        let name_$p$_ = name;
        let alias;
        self = $$createComponent({
          updateState: changed => {
            if (changed & 1) {
              if ($$notCached(self, "random_str", [name_$p$_])) {
                self.updateDerived(alias = name_$p$_, 2 /*0b10*/);
              }
            }
          },
          updateProp: (propName, newValue) => {
            if (propName === "name") {
              self.updateDerived(name_$p$_ = newValue, 1 /*0b1*/);
            }
          },
          getUpdateViews: () => {
            let $node0, $node1;
            $node0 = $$createElement("h1");
            $node1 = new $$ExpNode(alias, [alias]);
            $$insertNode($node0, $node1, 0);
            $node0._$nodes = [$node1];
            return [[$node0], $changed => {
              if ($changed & 2) {
                $node1 && $node1.update(() => alias, [alias]);
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
