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
      "import { compBuilder as $$compBuilder, createElement as $$createElement, createTemplateNode as $$createTemplateNode } from "@openinula/next";
      const _$t = function () {
        const $node0 = $$createElement("div");
        const $node1 = $$createElement("div");
        $node1.textContent = "test";
        $node0.appendChild($node1);
        return $node0;
      }();
      function App() {
        const $$self = $$compBuilder();
        return $$self.prepare().init($$createTemplateNode(_$t, null));
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
      "import { compBuilder as $$compBuilder, createElement as $$createElement, createTemplateNode as $$createTemplateNode } from "@openinula/next";
      const _$t = function () {
        const $node0 = $$createElement("div");
        const $node1 = $$createElement("div");
        $node1.textContent = "test";
        $node0.appendChild($node1);
        return $node0;
      }();
      const _$t2 = function () {
        const $node0 = $$createElement("div");
        const $node1 = $$createElement("h1");
        $node1.textContent = "Title";
        $node0.appendChild($node1);
        return $node0;
      }();
      function App() {
        const $$self = $$compBuilder();
        return $$self.prepare().init($$createTemplateNode(_$t, null));
      }
      function Title() {
        const $$self = $$compBuilder();
        return $$self.prepare().init($$createTemplateNode(_$t2, null));
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
      "import { compBuilder as $$compBuilder, createElement as $$createElement, createExpNode as $$createExpNode, createTemplateNode as $$createTemplateNode, createTextNode as $$createTextNode, createHTMLNode as $$createHTMLNode, createCompNode as $$createCompNode, createChildren as $$createChildren } from "@openinula/next";
      const _$t = function () {
        const $node0 = $$createElement("div");
        $node0.className = "parent";
        const $node1 = $$createElement("h2");
        $node1.textContent = "Parent";
        $node0.appendChild($node1);
        return $node0;
      }();
      function App() {
        const $$self = $$compBuilder();
        let name = 'Alice';
        function Parent({
          children
        }) {
          const $$self1 = $$compBuilder($$self);
          $$self1.addProp("children", $$value => children = $$value, 2);
          return $$self1.prepare().init($$createTemplateNode(_$t, null, [1, $$createExpNode(() => children, () => [children], 2)]));
        }
        function Child({
          name
        }: {
          name: string;
        }) {
          const $$self1 = $$compBuilder($$self);
          $$self1.addProp("name", $$value => name = $$value, 4);
          return $$self1.prepare().init($$createHTMLNode("div", $$node => {
            $$node.className = "child";
          }, $$createTextNode("Hello, "), $$createExpNode(() => name, () => [name], 4), $$createTextNode("!")));
        }
        return $$self.prepare().init($$createCompNode(Parent, {
          "children": $$createChildren(() => [$$createCompNode(Child, {
            "name": name
          }, $$node => {
            $$node.updateProp("name", () => name, [name], 1);
          })], $$self)
        }, null));
      }"
    `);
  });
});
