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

describe('hook', () => {
  describe('consumer', () => {
    it('should transform use hook', () => {
      expect(
        transform(`
        function App () {
         let baseX = 0;
         let baseY = 0;
         const mouse = useMousePosition(baseX, baseY)
         const mouse2 = useMousePosition({
           baseX,
           baseY
         })
        }
      `)
      ).toMatchInlineSnapshot(`
        "import { compBuilder as $$compBuilder } from "@openinula/next";
        function App() {
          const $$self = $$compBuilder();
          let baseX = 0;
          let baseY = 0;
          let mouse;
          $$self.useHook(useMousePosition(baseX, baseY), $$value => $$self.wave((mouse = $$value), 0), hook => {
            hook.updateProp(0, () => baseX, [baseX], 1);
            hook.updateProp(1, () => baseY, [baseY], 2);
          });
          let mouse2;
          $$self.useHook(useMousePosition({
            baseX,
            baseY
          }), $$value => $$self.wave((mouse2 = $$value), 0), hook => {
            hook.updateProp(0, () => ({
              baseX,
              baseY
            }), [baseX, baseY], 3);
          });
        }"
      `);
    });

    it('should support multiple return ', () => {
      expect(
        transform(`
        function App2() {
          let {count, setCount} = useCounter()
          return (
              <button onClick={setCount}>Increment {count}</button>
          );
        }`)
      ).toMatchInlineSnapshot(`
        "import { compBuilder as $$compBuilder, delegateEvent as $$delegateEvent, createTextNode as $$createTextNode, createExpNode as $$createExpNode, createHTMLNode as $$createHTMLNode } from "@openinula/next";
        function App2() {
          const $$self = $$compBuilder();
          let count, setCount;
          $$self.useHook(useCounter(), $$value => $$self.wave(({
            count,
            setCount
          } = $$value), 1), hook => {});
          return $$self.prepare().init($$createHTMLNode("button", $$node => {
            $$delegateEvent($$node, "click", () => setCount, [setCount], 1);
          }, $$createTextNode("Increment "), $$createExpNode(() => count, () => [count], 1)));
        }"
      `);
    });
  });

  describe('provider', () => {
    it('should transform parameters of hook', () => {
      expect(
        transform(`
        function useMousePosition(baseX, baseY, { settings, id }) {
          let x;
          let y;

          const {name} = useStore('Store');


          function handleMouseMove(event) {
            x = baseX + (event.clientX / window.innerWidth) * envX;
            y = baseY + (event.clientY / window.innerHeight) * envY;
          }
          didMount(() => {
            window.addEventListener('mousemove', handleMouseMove);
          })

          willUnmount(() => {
            window.removeEventListener('mousemove', handleMouseMove);
          })
          return [x, y];
        }`)
      ).toMatchInlineSnapshot(`
        "import { hookBuilder as $$hookBuilder } from "@openinula/next";
        function useMousePosition(baseX, baseY, {
          settings,
          id
        }) {
          const $$self = $$hookBuilder();
          $$self.addProp(0, value => baseX = value, 0);
          $$self.addProp(1, value => baseY = value, 0);
          $$self.addProp(2, value => ({
            settings,
            id
          } = value), 0);
          let x;
          let y;
          let name;
          $$self.useHook(useStore('Store'), $$value => $$self.wave(({
            name
          } = $$value), 0), hook => {});
          function handleMouseMove(event) {
            $$self.wave(x = baseX + event.clientX / window.innerWidth * envX, 1 /*0b1*/);
            $$self.wave(y = baseY + event.clientY / window.innerHeight * envY, 2 /*0b10*/);
          }
          $$self.didMount(() => {
            window.addEventListener('mousemove', handleMouseMove);
          });
          $$self.willUnmount(() => {
            window.removeEventListener('mousemove', handleMouseMove);
          });
          return $$self.init(() => [x, y], () => [x, y], 3);
        }"
      `);
    });
  });
});
