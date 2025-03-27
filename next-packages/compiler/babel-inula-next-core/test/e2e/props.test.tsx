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
      "import { compBuilder as $$compBuilder, createCompNode as $$createCompNode } from "@openinula/next";
      function App() {
        const $$self = $$compBuilder();
        return $$self.prepare().init($$createCompNode(Child, {}, null));
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
      "import { compBuilder as $$compBuilder, withDefault as $$withDefault, setHTMLProp as $$setHTMLProp, createHTMLNode as $$createHTMLNode } from "@openinula/next";
      function App({
        id,
        className = 'default'
      }) {
        const $$self = $$compBuilder();
        $$self.addProp("id", $$value => id = $$value, 1);
        $$self.addProp("className", $$value => className = $$withDefault($$value, 'default'), 2);
        return $$self.prepare().init($$createHTMLNode("div", $$node => {
          $$setHTMLProp($$node, "id", () => id, [id], 1);
          $$setHTMLProp($$node, "className", () => className, [className], 2);
        }));
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
      "import { compBuilder as $$compBuilder, setHTMLProp as $$setHTMLProp, setStyle as $$setStyle, createHTMLNode as $$createHTMLNode } from "@openinula/next";
      function App({
        info: {
          id,
          className = 'default',
          pos: [x, y]
        }
      }) {
        const $$self = $$compBuilder();
        $$self.addProp("info", $$value => ({
          id,
          className = 'default',
          pos: [x, y]
        } = $$value), 1);
        return $$self.prepare().init($$createHTMLNode("div", $$node => {
          $$setHTMLProp($$node, "id", () => id, [id], 1);
          $$setHTMLProp($$node, "className", () => className, [className], 1);
          $$setStyle($$node, () => ({
            left: x,
            top: y
          }), [x, y], 1);
        }));
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
      "import { compBuilder as $$compBuilder, createExpNode as $$createExpNode, createHTMLNode as $$createHTMLNode } from "@openinula/next";
      function Child({
        name: alias
      }) {
        const $$self = $$compBuilder();
        $$self.addProp("name", $$value => alias = $$value, 1);
        return $$self.prepare().init($$createHTMLNode("h1", null, $$createExpNode(() => alias, () => [alias], 1)));
      }"
    `);
  });
});
