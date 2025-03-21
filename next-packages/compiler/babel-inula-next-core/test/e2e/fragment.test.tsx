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

describe('fragment', () => {
  it('should support elements in fragment', () => {
    expect(
      transform(`
        import { render } from '@openinula/next';

        function App () {
          return <><div>xxx</div></>
        }
        render(
          App,
          document.getElementById('app')
        );
      `)
    ).toMatchInlineSnapshot(`
      "import { compBuilder as $$compBuilder, createFragmentNode as $$createFragmentNode, createHTMLNode as $$createHTMLNode } from "@openinula/next";
      import { render } from '@openinula/next';
      function App() {
        const $$self = $$compBuilder();
        return $$self.prepare().init($$createFragmentNode($$createHTMLNode("div", $$node => {
          $$node.textContent = "xxx";
        })));
      }
      render(App, document.getElementById('app'));"
    `);
  });
});
