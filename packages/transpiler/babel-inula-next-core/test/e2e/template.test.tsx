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
      "import { createComponent as $$createComponent, createElement as $$createElement } from "@openinula/next";
      const _$t = (() => {
        let $node0, $node1;
        $node0 = $$createElement("div");
        $node1 = $$createElement("div");
        $node1.textContent = "test";
        $node0.appendChild($node1);
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
        return self.init();
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
      "import { createComponent as $$createComponent, createElement as $$createElement } from "@openinula/next";
      const _$t2 = (() => {
        let $node0, $node1;
        $node0 = $$createElement("div");
        $node1 = $$createElement("h1");
        $node1.textContent = "Title";
        $node0.appendChild($node1);
        return $node0;
      })();
      const _$t = (() => {
        let $node0, $node1;
        $node0 = $$createElement("div");
        $node1 = $$createElement("div");
        $node1.textContent = "test";
        $node0.appendChild($node1);
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
        return self.init();
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
        return self.init();
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
      "import { createComponent as $$createComponent, createElement as $$createElement, ExpNode as $$ExpNode, insertNode as $$insertNode, notCached as $$notCached, createTextNode as $$createTextNode, PropView as $$PropView } from "@openinula/next";
      const _$t2 = (() => {
        let $node0, $node1;
        $node0 = $$createElement("div");
        $node0.className = "parent";
        $node1 = $$createElement("h2");
        $node1.textContent = "Parent";
        $node0.appendChild($node1);
        return $node0;
      })();
      const _$t = (() => {
        let $node0, $node1;
        $node0 = $$createElement("div");
        $node0.className = "parent";
        $node1 = $$createElement("h2");
        $node1.textContent = "Parent";
        $node0.appendChild($node1);
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
                self1.updateDerived(children_$p$_ = newValue, 2 /*0b10*/);
              }
            },
            getUpdateViews: () => {
              let $node0, $node1;
              $node0 = _$t.cloneNode(true);
              $node1 = new $$ExpNode(children_$p$_, [children_$p$_]);
              $$insertNode($node0, $node1, 1);
              return [[$node0], $changed => {
                if ($changed & 2) {
                  $node1 && $node1.update(() => children_$p$_, [children_$p$_]);
                }
                return [$node0];
              }];
            }
          });
          return self1.init();
        }
        function Child({
          name
        }) {
          let self1;
          let name_$p$_;
          self1 = $$createComponent({
            updateState: changed => {
              if (changed & 1) {
                if ($$notCached(self1, Symbol.for("inula-cache"), [name])) {
                  self1.updateDerived(name_$p$_ = name, 2 /*0b10*/);
                }
              }
            },
            updateProp: (propName, newValue) => {
              if (propName === "name") {
                self1.updateDerived(name_$p$_ = newValue, 2 /*0b10*/);
              }
            },
            getUpdateViews: () => {
              let $node0, $node1, $node2, $node3;
              $node0 = $$createElement("div");
              $node0.className = "child";
              $node1 = $$createTextNode("Hello, ", []);
              $$insertNode($node0, $node1, 0);
              $node2 = new $$ExpNode(name_$p$_, [name_$p$_]);
              $$insertNode($node0, $node2, 1);
              $node3 = $$createTextNode("!", []);
              $$insertNode($node0, $node3, 2);
              $node0._$nodes = [$node1, $node2, $node3];
              return [[$node0], $changed => {
                if ($changed & 2) {
                  $node2 && $node2.update(() => name_$p$_, [name_$p$_]);
                }
                return [$node0];
              }];
            }
          });
          return self1.init();
        }
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0, $node1;
            $node1 = new $$PropView($addUpdate => {
              let $node0;
              $addUpdate($changed => {
                if ($changed & 1) {
                  $node0 && $node0._$setProp("name", () => name, [name]);
                }
                if ($changed & 3) {
                  $node0.updateDerived(null, 3);
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
                $node0.updateDerived(null, 2);
              }
              $node1 && $node1.update($changed);
              return [$node0];
            }];
          }
        });
        return self.init();
      }"
    `);
  });
});
