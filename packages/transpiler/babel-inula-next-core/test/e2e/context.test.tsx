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
        "import { Comp as $$Comp, createComponent as $$createComponent, updateNode as $$updateNode, createElement as $$createElement, createNode as $$createNode, insertNode as $$insertNode, createTextNode as $$createTextNode, appendNode as $$appendNode, initCompNode as $$initCompNode } from "@openinula/next";
        function App() {
          let self;
          let path_$c$_ = useContext(UserContext, "path");
          let level_$c$_ = useContext(UserContext, "level");
          self = $$createComponent({
            updateState: changed => {},
            updateContext: (ctx, key, value) => {
              if (ctx === UserContext) {
                if (key === "path") {
                  $$updateNode(self, path_$c$_ = value, 1 /*0b1*/);
                }
                if (key === "level") {
                  $$updateNode(self, level_$c$_ = value, 2 /*0b10*/);
                }
              }
            },
            getUpdateViews: () => {
              console.log(level_$c$_, path_$c$_);
              let $node0, $node1, $node2, $node3;
              $node0 = $$createElement("div");
              $node1 = $$createNode(3 /*Exp*/, () => level_$c$_, [level_$c$_]);
              $$insertNode($node0, $node1, 0);
              $node2 = $$createTextNode("-", []);
              $$appendNode($node0, $node2);
              $node3 = $$createNode(3 /*Exp*/, () => path_$c$_, [path_$c$_]);
              $$insertNode($node0, $node3, 2);
              $node0._$nodes = [$node1, $node2, $node3];
              return [[$node0], $changed => {
                if ($changed & 1) {
                  $node3 && $$updateNode($node3, () => path_$c$_, [path_$c$_]);
                }
                if ($changed & 2) {
                  $node1 && $$updateNode($node1, () => level_$c$_, [level_$c$_]);
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
        "import { createComponent as $$createComponent, createNode as $$createNode, initContextChildren as $$initContextChildren, updateNode as $$updateNode, initCompNode as $$initCompNode } from "@openinula/next";
        function App() {
          let self;
          let level;
          self = $$createComponent({
            updateState: changed => {},
            getUpdateViews: () => {
              let $node0;
              $node0 = $$createNode(5 /*Context*/, FileContext, {
                level: level
              }, {
                level: [level]
              });
              $$initContextChildren($node0, []);
              return [[$node0], $changed => {
                if ($changed & 1) {
                  $node0 && $$updateNode($node0, "level", () => level, [level]);
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
});
