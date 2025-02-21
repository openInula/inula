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

describe('mapping2ForPlugin', () => {
  it('should transform map to for jsxelement', () => {
    const code = `
        function MyComp() {
          let arr = [1, 2, 3];
          return (
            <>
            {arr.map((item) => (<div>{item}</div>))}
            </>
          )
        }
      `;
    const transformedCode = transform(code);
    expect(transformedCode).toMatchInlineSnapshot(`
      "import { compBuilder as $$compBuilder, createFragmentNode as $$createFragmentNode, createForNode as $$createForNode, createExpNode as $$createExpNode, createHTMLNode as $$createHTMLNode } from "@openinula/next";
      function MyComp() {
        const $$self = $$compBuilder();
        let arr = [1, 2, 3];
        return $$self.prepare().init($$createFragmentNode($$createForNode(() => arr, null, ($$n, updateItemFuncArr, item, $$key, $$i) => {
          updateItemFuncArr[$$i] = (newItem, newIdx) => {
            item = newItem;
          };
          return [$$createHTMLNode("div", null, $$createExpNode(() => item, () => [item], 1))];
        }, 1)));
      }"
    `);
  });
  it('should transform last map to for ', () => {
    const code = `
        function MyComp() {
          let arr = [1, 2, 3];
          return (
            <div>
            {arr.map(item => <h1>{item}</h1>).map((item) => (<div>{item}</div>))}
            </div>
          )
        }
      `;
    const transformedCode = transform(code);
    expect(transformedCode).toMatchInlineSnapshot(`
      "import { compBuilder as $$compBuilder, createForNode as $$createForNode, createExpNode as $$createExpNode, createHTMLNode as $$createHTMLNode } from "@openinula/next";
      function MyComp() {
        const $$self = $$compBuilder();
        let arr = [1, 2, 3];
        return $$self.prepare().init($$createHTMLNode("div", null, $$createForNode(() => arr.map(item => <h1>{item}</h1>), null, ($$n, updateItemFuncArr, item, $$key, $$i) => {
          updateItemFuncArr[$$i] = (newItem, newIdx) => {
            item = newItem;
          };
          return [$$createHTMLNode("div", null, $$createExpNode(() => item, () => [item], 1))];
        }, 1)));
      }"
    `);
  });
});
