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
        let self;
        let text = 'hello world';
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            console.log(text);
            let $node0, $node1;
            $node0 = $$createElement("div");
            $node1 = new $$ExpNode(text, [text]);
            $$insertNode($node0, $node1, 0);
            $node0._$nodes = [$node1];
            return [[$node0], $changed => {
              if ($changed & 1) {
                $node1 && $node1.update(() => text, [text]);
              }
              return [$node0];
            }];
          }
        });
        return self.init();
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
        let self;
        let text = 'hello world';
        let color = 'red';
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0, $node1;
            $node0 = $$createElement("div");
            $$setHTMLProp($node0, "className", () => text, [text]);
            $$setHTMLProp($node0, "id", () => text, [text]);
            $$setStyle($node0, {
              color
            });
            $node1 = new $$ExpNode(text, [text]);
            $$insertNode($node0, $node1, 0);
            $node0._$nodes = [$node1];
            return [[$node0], $changed => {
              if ($changed & 1) {
                $node0 && $$setHTMLProp($node0, "className", () => text, [text]);
                $node0 && $$setHTMLProp($node0, "id", () => text, [text]);
                $node1 && $node1.update(() => text, [text]);
              }
              if ($changed & 2) {
                $node0 && $$setStyle($node0, {
                  color
                });
              }
              return [$node0];
            }];
          }
        });
        return self.init();
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
      "function Comp() {
        let self;
        let text = 'hello world';
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0, $node1, $node2, $node3, $node4;
            const $t0 = (() => {
              let $node0, $node1, $node2;
              $node0 = $$createElement("div");
              $node1 = $$createElement("div");
              $node0.appendChild($node1);
              $node2 = $$createElement("div");
              $node0.appendChild($node2);
              return $node0;
            })();
            $node0 = $t0.cloneNode(true);
            $node1 = $node0.firstChild;
            $node2 = $node1.nextSibling;
            $node3 = new $$ExpNode(text, [text]);
            $$insertNode($node1, $node3, 0);
            $node4 = new $$ExpNode(text, [text]);
            $$insertNode($node2, $node4, 0);
            return [[$node0], $changed => {
              if ($changed & 1) {
                $node3 && $node3.update(() => text, [text]);
                $node4 && $node4.update(() => text, [text]);
              }
              return [$node0];
            }];
          }
        });
        return self.init();
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
        let self;
        let text = 'hello world';
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0, $node1, $node2, $node3;
            $node0 = $$createElement("div");
            $node1 = new $$ExpNode(text, [text]);
            $$insertNode($node0, $node1, 0);
            $node0._$nodes = [$node1];
            $node2 = $$createElement("div");
            $node3 = new $$ExpNode(text, [text]);
            $$insertNode($node2, $node3, 0);
            $node2._$nodes = [$node3];
            return [[$node0, $node2], $changed => {
              if ($changed & 1) {
                $node1 && $node1.update(() => text, [text]);
                $node3 && $node3.update(() => text, [text]);
              }
              return [$node0, $node2];
            }];
          }
        });
        return self.init();
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
        let self;
        let text = 'hello world';
        let show = true;
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0, $node1;
            $node0 = $$createElement("div");
            $node1 = new $$CondNode(2, $thisCond => {
              if (show) {
                if ($thisCond.cond === 0) {
                  $thisCond.didntChange = true;
                  return [];
                }
                $thisCond.cond = 0;
                let $node0, $node1;
                $thisCond.updateFunc = $changed => {
                  if ($changed & 1) {
                    $node1 && $node1.update(() => text, [text]);
                  }
                };
                $node0 = $$createElement("div");
                $node1 = new $$ExpNode(text, [text]);
                $$insertNode($node0, $node1, 0);
                $node0._$nodes = [$node1];
                return $thisCond.cond === 0 ? [$node0] : $thisCond.updateCond();
              } else {
                if ($thisCond.cond === 1) {
                  $thisCond.didntChange = true;
                  return [];
                }
                $thisCond.cond = 1;
                let $node0;
                $thisCond.updateFunc = $changed => {};
                $node0 = $$createElement("h1");
                $node0.textContent = "else";
                return $thisCond.cond === 1 ? [$node0] : $thisCond.updateCond();
              }
            });
            $$insertNode($node0, $node1, 0);
            $node0._$nodes = [$node1];
            return [[$node0], $changed => {
              if ($changed & 2) {
                $node1 && $node1.updateCond();
              }
              $node1 && $node1.update($changed);
              return [$node0];
            }];
          }
        });
        return self.init();
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
        let self;
        let list = ['hello', 'world'];
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0, $node1;
            $node0 = $$createElement("div");
            $node1 = new $$ForNode(list, 1, list.map(item => index), (item, index, $updateArr) => {
              let $node0, $node1;
              $updateArr[index] = ($changed, $item) => {
                item = $item;
                if ($changed & 1) {
                  $node1 && $node1.update(() => item, [item]);
                }
              };
              $node0 = $$createElement("div");
              $node0.setAttribute("key", index);
              $node1 = new $$ExpNode(item, [item]);
              $$insertNode($node0, $node1, 0);
              $node0._$nodes = [$node1];
              return [$node0];
            });
            $$insertNode($node0, $node1, 0);
            $node0._$nodes = [$node1];
            return [[$node0], $changed => {
              if ($changed & 1) {
                $node1 && $node1.updateArray(list, list.map(item => index));
              }
              $node1 && $node1.update($changed);
              return [$node0];
            }];
          }
        });
        return self.init();
      }"
    `);
  });
});
