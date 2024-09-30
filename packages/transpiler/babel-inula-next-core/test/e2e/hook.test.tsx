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
        "import { untrack as $$untrack, useHook as $$useHook, Comp as $$Comp, createComponent as $$createComponent, runOnce as $$runOnce, notCached as $$notCached } from "@openinula/next";
        function App() {
          let self;
          let baseX = 0;
          let baseY = 0;
          let _useMousePosition_$h$_;
          let mouse;
          let _useMousePosition2_$h$_;
          let mouse2;
          self = $$createComponent({
            updateState: changed => {
              if (changed & 1) {
                if ($$notCached(self, Symbol.for("inula-cache"), [baseX])) {
                  {
                    $$untrack(() => _useMousePosition_$h$_).updateProp("p0", baseX);
                  }
                }
              }
              if (changed & 2) {
                if ($$notCached(self, Symbol.for("inula-cache"), [baseY])) {
                  {
                    $$untrack(() => _useMousePosition_$h$_).updateProp("p1", baseY);
                  }
                }
              }
              if (changed & 3) {
                if ($$notCached(self, Symbol.for("inula-cache"), [baseX, baseY])) {
                  $$runOnce(() => {
                    _useMousePosition_$h$_ = $$useHook(useMousePosition, [baseX, baseY], 4);
                  });
                  $$runOnce(() => {
                    _useMousePosition2_$h$_ = $$useHook(useMousePosition, [{
                      baseX,
                      baseY
                    }], 8);
                  });
                  {
                    $$untrack(() => _useMousePosition2_$h$_).updateProp("p0", {
                      baseX,
                      baseY
                    });
                  }
                }
              }
              if (changed & 4) {
                if ($$notCached(self, Symbol.for("inula-cache"), [_useMousePosition_$h$_?.value])) {
                  mouse = _useMousePosition_$h$_.value();
                }
              }
              if (changed & 8) {
                if ($$notCached(self, Symbol.for("inula-cache"), [_useMousePosition2_$h$_?.value])) {
                  mouse2 = _useMousePosition2_$h$_.value();
                }
              }
            }
          });
          return self.init();
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
        "import { useHook as $$useHook, Comp as $$Comp, createComponent as $$createComponent, notCached as $$notCached, createElement as $$createElement, delegateEvent as $$delegateEvent, createTextNode as $$createTextNode, insertNode as $$insertNode, ExpNode as $$ExpNode } from "@openinula/next";
        function App2() {
          let self;
          let _useCounter_$h$_ = $$useHook(useCounter, [], 1);
          let count;
          let setCount;
          self = $$createComponent({
            updateState: changed => {
              if (changed & 1) {
                if ($$notCached(self, Symbol.for("inula-cache"), [_useCounter_$h$_?.value])) {
                  {
                    self.updateDerived(({
                      count,
                      setCount
                    } = _useCounter_$h$_.value()), 6 /*0b110*/);
                  }
                }
              }
            },
            getUpdateViews: () => {
              let $node0, $node1, $node2;
              $node0 = $$createElement("button");
              $$delegateEvent($node0, "click", setCount);
              $node1 = $$createTextNode("Increment ", []);
              $$insertNode($node0, $node1, 0);
              $node2 = new $$ExpNode(count, [count]);
              $$insertNode($node0, $node2, 1);
              $node0._$nodes = [$node1, $node2];
              return [[$node0], $changed => {
                if ($changed & 2) {
                  $node2 && $node2.update(() => count, [count]);
                }
                if ($changed & 4) {
                  $node0 && $$delegateEvent($node0, "click", setCount);
                }
                return [$node0];
              }];
            }
          });
          return self.init();
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
        "import { useHook as $$useHook, Comp as $$Comp, createHook as $$createHook, notCached as $$notCached } from "@openinula/next";
        function useMousePosition({
          p0,
          p1,
          p2
        }) {
          let self;
          let p0_$p$_ = p0;
          let baseX;
          let p1_$p$_ = p1;
          let baseY;
          let p2_$p$_ = p2;
          let settings;
          let id;
          let x;
          let y;
          let _useStore_$h$_ = $$useHook(useStore, ['Store'], 32);
          let name;
          function handleMouseMove(event) {
            self.updateDerived(x = baseX + event.clientX / window.innerWidth * envX, 8 /*0b1000*/);
            self.updateDerived(y = baseY + event.clientY / window.innerHeight * envY, 16 /*0b10000*/);
          }
          self = $$createHook({
            didMount: () => {
              {
                window.addEventListener('mousemove', handleMouseMove);
              }
            },
            willUnmount: () => {
              {
                window.removeEventListener('mousemove', handleMouseMove);
              }
            },
            updateState: changed => {
              if (changed & 1) {
                if ($$notCached(self, Symbol.for("inula-cache"), [p0_$p$_])) {
                  baseX = p0_$p$_;
                }
              }
              if (changed & 2) {
                if ($$notCached(self, Symbol.for("inula-cache"), [p1_$p$_])) {
                  baseY = p1_$p$_;
                }
              }
              if (changed & 4) {
                if ($$notCached(self, Symbol.for("inula-cache"), [p2_$p$_])) {
                  {
                    ({
                      settings,
                      id
                    } = p2_$p$_);
                  }
                }
              }
              if (changed & 32) {
                if ($$notCached(self, Symbol.for("inula-cache"), [_useStore_$h$_?.value])) {
                  {
                    ({
                      name
                    } = _useStore_$h$_.value());
                  }
                }
              }
            },
            updateProp: (propName, newValue) => {
              if (propName === "p2") {
                self.updateDerived(p2_$p$_ = newValue, 4 /*0b100*/);
              } else if (propName === "p1") {
                self.updateDerived(p1_$p$_ = newValue, 2 /*0b10*/);
              } else if (propName === "p0") {
                self.updateDerived(p0_$p$_ = newValue, 1 /*0b1*/);
              }
            },
            value: () => [x, y],
            getUpdateViews: () => {
              return function ($changed) {
                if ($changed & 24) self.emitUpdate();
              };
            }
          });
          return self.init();
        }"
      `);
    });
  });
});
