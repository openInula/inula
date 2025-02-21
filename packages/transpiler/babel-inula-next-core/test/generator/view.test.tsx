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
describe('view generation', () => {
  it('should generation single html', () => {
    const code = transform(/*js*/ `
      const Comp = Component(() => {
        let text = 'hello world';
        console.log(text);
        return <div>{text}</div>
      })
    `);

    expect(code).toMatchInlineSnapshot(`
      "function Comp() {
        const $$self = $$compBuilder();
        let text = 'hello world';
        console.log(text);
        return $$self.prepare().init($$createHTMLNode("div", null, $$createExpNode(() => text, () => [text], 1)));
      }"
    `);
  });

  it('should generate html properties and update', () => {
    const code = transform(/*js*/ `
      const Comp = Component(() => {
        let text = 'hello world';
        let color = 'red';
        return <div className={text} id={text} style={{color}}>{text}</div>
      })
    `);

    expect(code).toMatchInlineSnapshot(`
      "function Comp() {
        const $$self = $$compBuilder();
        let text = 'hello world';
        let color = 'red';
        return $$self.prepare().init($$createHTMLNode("div", $$node => {
          $$setHTMLProp($$node, "className", () => text, [text], 1);
          $$setHTMLProp($$node, "id", () => text, [text], 1);
          $$setStyle($$node, () => ({
            color
          }), [color], 2);
        }, $$createExpNode(() => text, () => [text], 1)));
      }"
    `);
  });

  it('should generate multiple html', () => {
    const code = transform(/*js*/ `
      const Comp = Component(() => {
        let text = 'hello world';
        return (
          <div>
            <div>{text}</div>
            <div>{text}</div>
          </div>
        )
      })
    `);

    expect(code).toMatchInlineSnapshot(`
      "const _$t = function () {
        const $node0 = $$createElement("div");
        const $node1 = $$createElement("div");
        $node0.appendChild($node1);
        const $node2 = $$createElement("div");
        $node0.appendChild($node2);
        return $node0;
      }();
      function Comp() {
        const $$self = $$compBuilder();
        let text = 'hello world';
        return $$self.prepare().init($$createTemplateNode(_$t, null, [0, $$createExpNode(() => text, () => [text], 1), 0], [0, $$createExpNode(() => text, () => [text], 1), 1]));
      }"
    `);
  });

  it('should support fragment', () => {
    const code = transform(/*js*/ `
      const Comp = Component(() => {
        let text = 'hello world';
        return (
          <>
            <div>{text}</div>
            <div>{text}</div>
          </>
        )
      })
    `);
    expect(code).toMatchInlineSnapshot(`
      "function Comp() {
        const $$self = $$compBuilder();
        let text = 'hello world';
        return $$self.prepare().init($$createFragmentNode($$createHTMLNode("div", null, $$createExpNode(() => text, () => [text], 1)), $$createHTMLNode("div", null, $$createExpNode(() => text, () => [text], 1))));
      }"
    `);
  });
  it('should generate conditional html', () => {
    const code = transform(/*js*/ `
      const Comp = Component(() => {
        let text = 'hello world';
        let show = true;
        return (
          <div>
            <if cond={show}>
              <div>{text}</div>
            </if>
            <else>
            <h1>else</h1>
            </else>
          </div>
        );
      });
    `);

    expect(code).toMatchInlineSnapshot(`
      "function Comp() {
        const $$self = $$compBuilder();
        let text = 'hello world';
        let show = true;
        return $$self.prepare().init($$createHTMLNode("div", null, $$createConditionalNode($$node => {
          if ($$node.cachedCondition(0, () => show, [show])) {
            if ($$node.branch(0)) return [];
            return [$$createHTMLNode("div", null, $$createExpNode(() => text, () => [text], 1))];
          } else {
            if ($$node.branch(1)) return [];
            return [$$createHTMLNode("h1", $$node => {
              $$node.textContent = "else";
            })];
          }
        }, 2)));
      }"
    `);
  });

  it('should generate loop html', () => {
    const code = transform(/*js*/ `
      const Comp = Component(() => {
        let list = ['hello', 'world'];
        return (
          <div>
            <for each={list}>
              {(item, index) => <div key={index}>{item}</div>})}
            </for>
          </div>
        );
      });
    `);
    expect(code).toMatchInlineSnapshot(`
      "function Comp() {
        const $$self = $$compBuilder();
        let list = ['hello', 'world'];
        return $$self.prepare().init($$createHTMLNode("div", null, $$createForNode(() => list, () => list.map((item, index) => index), ($$n, updateItemFuncArr, item, $$key, index) => {
          updateItemFuncArr[index] = (newItem, newIdx) => {
            item = newItem;
            index = newIdx;
          };
          return [$$createHTMLNode("div", $$node => {
            $$node.setAttribute("key", index);
          }, $$createExpNode(() => item, () => [item], 1))];
        }, 1)));
      }"
    `);
  });
});
