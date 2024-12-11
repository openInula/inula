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

describe('children', () => {
  it('should support children', () => {
    expect(
      transform(`
      function App() {
        return <Child name={'hello world!!!'} />;
      }
    `)
    ).toMatchInlineSnapshot(`
      "import { compBuilder as $$compBuilder, createCompNode as $$createCompNode } from "@openinula/next";
      function App() {
        const self = $$compBuilder();
        return self.prepare().init($$createCompNode(Child({
          "name": 'hello world!!!'
        }), node => {}));
      }"
    `);
  });
  it('should support children in comp', () => {
    expect(
      transform(`
      function MyComp() {
        let count = 0;
        const add = () => (count += 1);
        return (
          <>
            <Sub>
              <h1>{count}</h1>
            </Sub>
          </>
        );
      }
      `)
    ).toMatchInlineSnapshot(`
      "import { compBuilder as $$compBuilder, createFragmentNode as $$createFragmentNode, createCompNode as $$createCompNode } from "@openinula/next";
      function MyComp() {
        const self = $$compBuilder();
        let count = 0;
        const add = () => self.wave(self, count += 1, 1 /*0b1*/);
        return self.prepare().init($$createFragmentNode($$createCompNode(Sub({}), node => {})));
      }"
    `);
  });

  it.fails('should support null children', () => {
    expect(
      transform(`
      function App() {
        fn();
        return null;
      }
    `)
    ).toMatchInlineSnapshot(`
      "import { compBuilder as $$compBuilder } from "@openinula/next";
      function App() {
        const self = $$compBuilder();
        fn();
        return null;
      }"
    `);
  });
});
