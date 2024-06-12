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

        return <Child className={count}>
          <div>1</div>
        </Child>;
      });
    `);

    expect(code).toMatchInlineSnapshot(`
      "function Comp() {
        let self;
        let count = 1;
        let $node0, $node1;
        $node1 = new $$PropView($addUpdate => {
          let $node0;
          $node0 = $$createElement("div");
          $node0.textContent = "1";
          return [$node0];
        });
        $node0 = new Child();
        $node0._$init([["className", count, [count]]], null, $node1, null);
        self = $$createComponent({
          updateState: changed => {},
          updateProp: (propName, newValue) => {},
          getUpdateViews: () => {
            return [[$node0], $changed => {
              $node1 && $node1.update($changed);
              return [$node0];
            }];
          }
        });
        return self;
      }"
    `);
  });
});
