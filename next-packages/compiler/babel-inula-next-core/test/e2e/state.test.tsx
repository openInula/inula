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

describe('state', () => {
  it('should transform destructing state', () => {
    expect(
      transform(`
        function App() {
          let x = 0;
          const [count, setCount] = genState(x);
          return <div>
            {count} is smaller than 1
          </div>;
        }
      `)
    ).toMatchInlineSnapshot(`
      "import { compBuilder as $$compBuilder, createExpNode as $$createExpNode, createTextNode as $$createTextNode, createHTMLNode as $$createHTMLNode } from "@openinula/next";
      function App() {
        const $$self = $$compBuilder();
        let x = 0;
        let count, setCount;
        $$self.deriveState(() => ([count, setCount] = genState(x)), () => [x], 1);
        return $$self.prepare().init($$createHTMLNode("div", null, $$createExpNode(() => count, () => [count], 2), $$createTextNode(" is smaller than 1")));
      }"
    `);
  });

  it('should transform functional dependency state', () => {
    expect(
      transform(`
        function App() {
          let x = 1;
          const double = x * 2;
          const quadruple = double * 2;
          const getQuadruple = () => quadruple;
          const y = getQuadruple() + x;
          return <div>{y}</div>;
        }
      `)
    ).toMatchInlineSnapshot(`
      "import { compBuilder as $$compBuilder, createExpNode as $$createExpNode, createHTMLNode as $$createHTMLNode } from "@openinula/next";
      function App() {
        const $$self = $$compBuilder();
        let x = 1;
        let double;
        $$self.deriveState(() => (double = x * 2), () => [x], 1);
        let quadruple;
        $$self.deriveState(() => (quadruple = double * 2), () => [double], 2);
        const getQuadruple = () => quadruple;
        let y;
        $$self.deriveState(() => (y = getQuadruple() + x), () => [x], 1);
        return $$self.prepare().init($$createHTMLNode("div", null, $$createExpNode(() => y, () => [y], 4)));
      }"
    `);
  });
});
