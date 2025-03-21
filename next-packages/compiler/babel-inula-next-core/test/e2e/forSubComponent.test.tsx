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

describe('for sub component', () => {
  it('should transform for loop', () => {
    const code = `
        function MyComp() {
          let name = 'test';
          let arr = [{x:1, y:1}, {x:2, y:2}, {x:3, y:3}]
          return (
            <div>
              <for each={arr}> {({x, y}, index) => {
                let name1 = 'test'
                const onClick = () => {
                  name1 = 'test2'
                }

                return <div className={name} onClick={onClick} style={{x: index}}>{name1}</div>
                }}
              </for>
              <for each={arr}> {({x, y}, index) => {
                let name1 = 'test'
                const onClick = () => {
                  name1 = 'test2'
                }

                return <div className={name} onClick={onClick} style={{x: index}}>{name1}</div>
              }}
              </for>
            </div>
          )
        }
      `;
    const transformedCode = transform(code);
    expect(transformedCode).toMatchInlineSnapshot(`
      "import { compBuilder as $$compBuilder, createForNode as $$createForNode, createCompNode as $$createCompNode, createHTMLNode as $$createHTMLNode } from "@openinula/next";
      function MyComp() {
        const $$self = $$compBuilder();
        let name = 'test';
        let arr = [{
          x: 1,
          y: 1
        }, {
          x: 2,
          y: 2
        }, {
          x: 3,
          y: 3
        }];
        function For_1({
          x,
          y,
          index
        }) {
          let name1 = 'test';
          const onClick = () => {
            name1 = 'test2';
          };
          return <div className={name} onClick={onClick} style={{
            x: index
          }}>{name1}</div>;
        }
        function For_2({
          x,
          y,
          index
        }) {
          let name1 = 'test';
          const onClick = () => {
            name1 = 'test2';
          };
          return <div className={name} onClick={onClick} style={{
            x: index
          }}>{name1}</div>;
        }
        return $$self.prepare().init($$createHTMLNode("div", null, $$createForNode(() => arr, null, ($$n, updateItemFuncArr, {
          x,
          y
        }, $$key, index) => {
          updateItemFuncArr[index] = (newItem, newIdx) => {
            ({
              x,
              y
            } = newItem);
            index = newIdx;
          };
          return [$$createCompNode(For_1, {
            "x": x,
            "y": y,
            "index": index
          }, $$node => {
            $$node.updateProp("x", () => x, [x], 1);
            $$node.updateProp("y", () => y, [y], 1);
          })];
        }, 1), $$createForNode(() => arr, null, ($$n, updateItemFuncArr, {
          x,
          y
        }, $$key, index) => {
          updateItemFuncArr[index] = (newItem, newIdx) => {
            ({
              x,
              y
            } = newItem);
            index = newIdx;
          };
          return [$$createCompNode(For_2, {
            "x": x,
            "y": y,
            "index": index
          }, $$node => {
            $$node.updateProp("x", () => x, [x], 1);
            $$node.updateProp("y", () => y, [y], 1);
          })];
        }, 1)));
      }"
    `);
  });
});
