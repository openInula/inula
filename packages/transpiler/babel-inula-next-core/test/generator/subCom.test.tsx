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
import { transform } from './mock';

describe('generate', () => {
  it('should generate createComponent', () => {
    const code = transform(/*js*/ `
      const Comp = Component(() => {
        let count = 1;
        const Child = Component(() => {
          return <h1>SubComp</h1>
        })

        return <Child className={count}>
          <div>1</div>
        </Child>;
      });
    `);

    expect(code).toMatchInlineSnapshot(`
      "function Comp() {
        const $$self = $$compBuilder();
        let count = 1;
        function Child() {
          const $$self1 = $$compBuilder($$self);
          return $$self1.prepare().init($$createHTMLNode("h1", $$node => {
            $$node.textContent = "SubComp";
          }));
        }
        return $$self.prepare().init($$createCompNode(Child, {
          "className": count,
          "children": $$createChildren(() => [$$createHTMLNode("div", $$node => {
            $$node.textContent = "1";
          })], $$self)
        }, $$node => {
          $$node.updateProp("className", () => count, [count], 1);
        }));
      }"
    `);
  });
});
