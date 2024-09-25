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

describe('template', () => {
  it('should transform multi layer html into template', () => {
    expect(
      transform(`
        function App() {
          return <div><div>test</div></div>;
        }
      `)
    ).toMatchInlineSnapshot(`
      "import { createComponent as $$createComponent, createElement as $$createElement, appendNode as $$appendNode, initCompNode as $$initCompNode } from "@openinula/next";
      const _$t = (() => {
        let $node0, $node1;
        $node0 = $$createElement("div");
        $node1 = $$createElement("div");
        $node1.textContent = "test";
        $$appendNode($node0, $node1);
        return $node0;
      })();
      function App() {
        let self;
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0;
            $node0 = _$t.cloneNode(true);
            return [[$node0],,];
          }
        });
        return $$initCompNode(self);
      }"
    `);
  });

  it('should support multi components with template', () => {
    expect(
      transform(`
        function App() {
          return <div><div>test</div></div>;
        }
        function Title() {
          return <div><h1>Title</h1></div>;
        }
      `)
    ).toMatchInlineSnapshot(`
      "import { createComponent as $$createComponent, createElement as $$createElement, appendNode as $$appendNode, initCompNode as $$initCompNode } from "@openinula/next";
      const _$t2 = (() => {
        let $node0, $node1;
        $node0 = $$createElement("div");
        $node1 = $$createElement("h1");
        $node1.textContent = "Title";
        $$appendNode($node0, $node1);
        return $node0;
      })();
      const _$t = (() => {
        let $node0, $node1;
        $node0 = $$createElement("div");
        $node1 = $$createElement("div");
        $node1.textContent = "test";
        $$appendNode($node0, $node1);
        return $node0;
      })();
      function App() {
        let self;
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0;
            $node0 = _$t.cloneNode(true);
            return [[$node0],,];
          }
        });
        return $$initCompNode(self);
      }
      function Title() {
        let self;
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0;
            $node0 = _$t2.cloneNode(true);
            return [[$node0],,];
          }
        });
        return $$initCompNode(self);
      }"
    `);
  });
  it('should support nested components', () => {
    expect(
      transform(`
        function App() {
        let name = 'Alice';

        function Parent({ children }) {
          return (
            <div className="parent">
              <h2>Parent</h2>
              {children}
            </div>
          );
        }

        function Child({ name }: { name: string }) {
          return <div className="child">Hello, {name}!</div>;
        }

        return (
          <Parent>
            <Child name={name} />
          </Parent>
        );
      }
      `)
    ).toMatchInlineSnapshot(`
      "import { createComponent as $$createComponent, updateNode as $$updateNode, createElement as $$createElement, appendNode as $$appendNode, createNode as $$createNode, insertNode as $$insertNode, initCompNode as $$initCompNode, notCached as $$notCached, createTextNode as $$createTextNode, Comp as $$Comp, setProp as $$setProp } from "@openinula/next";
      const _$t = (() => {
        let $node0, $node1;
        $node0 = $$createElement("div");
        $node0.className = "parent";
        $node1 = $$createElement("h2");
        $node1.textContent = "Parent";
        $$appendNode($node0, $node1);
        return $node0;
      })();
      function App() {
        let self;
        let name = 'Alice';
        function Parent({
          children
        }) {
          let self1;
          let children_$p$_ = children;
          self1 = $$createComponent({
            updateState: changed => {},
            updateProp: (propName, newValue) => {
              if (propName === "children") {
                $$updateNode(self1, children_$p$_ = newValue, 2 /*0b10*/);
              }
            },
            getUpdateViews: () => {
              let $node0, $node1;
              $node0 = _$t.cloneNode(true);
              $node1 = $$createNode(3 /*Exp*/, () => children_$p$_, [children_$p$_]);
              $$insertNode($node0, $node1, 1);
              return [[$node0], $changed => {
                if ($changed & 2) {
                  $node1 && $$updateNode($node1, () => children_$p$_, [children_$p$_]);
                }
                return [$node0];
              }];
            }
          });
          return $$initCompNode(self1);
        }
        function Child({
          name
        }) {
          let self1;
          let name_$p$_;
          self1 = $$createComponent({
            updateState: changed => {
              if (changed & 1) {
                if ($$notCached(self1, "cache0", [name])) {
                  $$updateNode(self1, name_$p$_ = name, 2 /*0b10*/);
                }
              }
            },
            updateProp: (propName, newValue) => {
              if (propName === "name") {
                $$updateNode(self1, name_$p$_ = newValue, 2 /*0b10*/);
              }
            },
            getUpdateViews: () => {
              let $node0, $node1, $node2, $node3;
              $node0 = $$createElement("div");
              $node0.className = "child";
              $node1 = $$createTextNode("Hello, ", []);
              $$appendNode($node0, $node1);
              $node2 = $$createNode(3 /*Exp*/, () => name_$p$_, [name_$p$_]);
              $$insertNode($node0, $node2, 1);
              $node3 = $$createTextNode("!", []);
              $$appendNode($node0, $node3);
              $node0._$nodes = [$node1, $node2, $node3];
              return [[$node0], $changed => {
                if ($changed & 2) {
                  $node2 && $$updateNode($node2, () => name_$p$_, [name_$p$_]);
                }
                return [$node0];
              }];
            }
          });
          return $$initCompNode(self1);
        }
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0, $node1;
            $node1 = $$createNode(6 /*Children*/, $addUpdate => {
              let $node0;
              $addUpdate($changed => {
                if ($changed & 1) {
                  $node0 && $$setProp($node0, "name", () => name, [name]);
                }
                if ($changed & 3) {
                  $$updateNode($node0, null, 3);
                }
              });
              $node0 = $$Comp(Child, {
                "name": name
              });
              return [$node0];
            });
            $node0 = $$Comp(Parent, {
              "children": $node1
            });
            return [[$node0], $changed => {
              if ($changed & 2) {
                $$updateNode($node0, null, 2);
              }
              $$updateNode($node1, $changed);
              return [$node0];
            }];
          }
        });
        return $$initCompNode(self);
      }"
    `);
  });
});
