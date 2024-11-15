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
      "import { createComponent as $$createComponent, Comp as $$Comp, initCompNode as $$initCompNode } from "@openinula/next";
      function App() {
        let self;
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0;
            $node0 = $$Comp(Child, {});
            return [[$node0],,];
          }
        });
        return $$initCompNode(self);
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
      "import { createComponent as $$createComponent, updateNode as $$updateNode, createElement as $$createElement, setHTMLProp as $$setHTMLProp, initCompNode as $$initCompNode } from "@openinula/next";
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
              $$updateNode(self, className_$p$_ = newValue, 2 /*0b10*/);
            } else if (propName === "id") {
              $$updateNode(self, id_$p$_ = newValue, 1 /*0b1*/);
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
        return $$initCompNode(self);
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
      "import { createComponent as $$createComponent, updateNode as $$updateNode, notCached as $$notCached, createElement as $$createElement, setHTMLProp as $$setHTMLProp, setStyle as $$setStyle, initCompNode as $$initCompNode } from "@openinula/next";
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
              if ($$notCached(self, "cache0", [info_$p$_])) {
                {
                  $$updateNode(self, {
                    id,
                    className = 'default',
                    pos: [x, y]
                  } = info_$p$_, 30 /*0b11110*/);
                }
              }
            }
          },
          updateProp: (propName, newValue) => {
            if (propName === "info") {
              $$updateNode(self, info_$p$_ = newValue, 1 /*0b1*/);
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
        return $$initCompNode(self);
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
      "import { createComponent as $$createComponent, updateNode as $$updateNode, notCached as $$notCached, createElement as $$createElement, createNode as $$createNode, insertNode as $$insertNode, initCompNode as $$initCompNode } from "@openinula/next";
      function Child({
        name
      }) {
        let self;
        let name_$p$_ = name;
        let alias;
        self = $$createComponent({
          updateState: changed => {
            if (changed & 1) {
              if ($$notCached(self, "cache0", [name_$p$_])) {
                $$updateNode(self, alias = name_$p$_, 2 /*0b10*/);
              }
            }
          },
          updateProp: (propName, newValue) => {
            if (propName === "name") {
              $$updateNode(self, name_$p$_ = newValue, 1 /*0b1*/);
            }
          },
          getUpdateViews: () => {
            let $node0, $node1;
            $node0 = $$createElement("h1");
            $node1 = $$createNode(3 /*Exp*/, () => alias, [alias]);
            $$insertNode($node0, $node1, 0);
            $node0._$nodes = [$node1];
            return [[$node0], $changed => {
              if ($changed & 2) {
                $node1 && $$updateNode($node1, () => alias, [alias]);
              }
              return [$node0];
            }];
          }
        });
        return $$initCompNode(self);
      }"
    `);
  });
});
