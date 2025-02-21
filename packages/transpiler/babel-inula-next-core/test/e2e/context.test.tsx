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
        "import { compBuilder as $$compBuilder, useContext as $$useContext, createExpNode as $$createExpNode, createTextNode as $$createTextNode, createHTMLNode as $$createHTMLNode } from "@openinula/next";
        function App() {
          const $$self = $$compBuilder();
          let {
            level,
            path
          } = $$useContext(UserContext, $$self);
          $$self.addContext(UserContext, "level", value => level = value, 1);
          $$self.addContext(UserContext, "path", value => path = value, 2);
          console.log(level, path);
          return $$self.prepare().init($$createHTMLNode("div", null, $$createExpNode(() => level, () => [level], 1), $$createTextNode("-"), $$createExpNode(() => path, () => [path], 2)));
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
        "import { compBuilder as $$compBuilder, createContextNode as $$createContextNode } from "@openinula/next";
        function App() {
          const $$self = $$compBuilder();
          let level;
          return $$self.prepare().init($$createContextNode(FileContext, $$node => {
            $$node.updateContext("level", () => level, [level], 1);
          }));
        }"
      `);
    });
  });
});
