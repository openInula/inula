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

describe('for sub component', () => {
  it('should transform for loop', () => {
    const code = `
        function MyComp() {
          let name = 'test';
          let arr = [{x:1, y:1}, {x:2, y:2}, {x:3, y:3}]
          return (
            <div>
              <for each={arr}> {({x, y}, index) => {
                let name1 = 'test'
                const onClick = () => {
                  name1 = 'test2'
                }

                return <div className={name} onClick={onClick} style={{x: index}}>{name1}</div>
                }}
              </for>
              <for each={arr}> {({x, y}, index) => {
                let name1 = 'test'
                const onClick = () => {
                  name1 = 'test2'
                }

                return <div className={name} onClick={onClick} style={{x: index}}>{name1}</div>
              }}
              </for>
            </div>
          )
        }
      `;
    const transformedCode = transform(code);
    expect(transformedCode).toMatchInlineSnapshot(`
      "import { updateNode as $$updateNode, createComponent as $$createComponent, createElement as $$createElement, setHTMLProp as $$setHTMLProp, delegateEvent as $$delegateEvent, setStyle as $$setStyle, createNode as $$createNode, insertNode as $$insertNode, initCompNode as $$initCompNode, Comp as $$Comp, setProp as $$setProp, updateChildren as $$updateChildren } from "@openinula/next";
      function MyComp() {
        let self;
        let name = 'test';
        let arr = [{
          x: 1,
          y: 1
        }, {
          x: 2,
          y: 2
        }, {
          x: 3,
          y: 3
        }];
        function For_1({
          x,
          y,
          index
        }) {
          let self1;
          let x_$p$_ = x;
          let y_$p$_ = y;
          let index_$p$_ = index;
          let name1 = 'test';
          const onClick = () => {
            $$updateNode(self1, name1 = 'test2', 8 /*0b1000*/);
          };
          self1 = $$createComponent({
            updateState: changed => {},
            updateProp: (propName, newValue) => {
              if (propName === "index") {
                $$updateNode(self1, index_$p$_ = newValue, 4 /*0b100*/);
              } else if (propName === "y") {
                y_$p$_ = newValue;
              } else if (propName === "x") {
                x_$p$_ = newValue;
              }
            },
            getUpdateViews: () => {
              let $node0, $node1;
              $node0 = $$createElement("div");
              $$setHTMLProp($node0, "className", () => name, [name]);
              $$delegateEvent($node0, "click", onClick);
              $$setStyle($node0, {
                x: index_$p$_
              });
              $node1 = $$createNode(3 /*Exp*/, () => name1, [name1]);
              $$insertNode($node0, $node1, 0);
              $node0._$nodes = [$node1];
              return [[$node0], $changed => {
                if ($changed & 1) {
                  $node0 && $$setHTMLProp($node0, "className", () => name, [name]);
                }
                if ($changed & 4) {
                  $node0 && $$setStyle($node0, {
                    x: index_$p$_
                  });
                }
                if ($changed & 8) {
                  $node1 && $$updateNode($node1, () => name1, [name1]);
                }
                return [$node0];
              }];
            }
          });
          return $$initCompNode(self1);
        }
        function For_2({
          x,
          y,
          index
        }) {
          let self1;
          let x_$p$_ = x;
          let y_$p$_ = y;
          let index_$p$_ = index;
          let name1 = 'test';
          const onClick = () => {
            $$updateNode(self1, name1 = 'test2', 8 /*0b1000*/);
          };
          self1 = $$createComponent({
            updateState: changed => {},
            updateProp: (propName, newValue) => {
              if (propName === "index") {
                $$updateNode(self1, index_$p$_ = newValue, 4 /*0b100*/);
              } else if (propName === "y") {
                y_$p$_ = newValue;
              } else if (propName === "x") {
                x_$p$_ = newValue;
              }
            },
            getUpdateViews: () => {
              let $node0, $node1;
              $node0 = $$createElement("div");
              $$setHTMLProp($node0, "className", () => name, [name]);
              $$delegateEvent($node0, "click", onClick);
              $$setStyle($node0, {
                x: index_$p$_
              });
              $node1 = $$createNode(3 /*Exp*/, () => name1, [name1]);
              $$insertNode($node0, $node1, 0);
              $node0._$nodes = [$node1];
              return [[$node0], $changed => {
                if ($changed & 1) {
                  $node0 && $$setHTMLProp($node0, "className", () => name, [name]);
                }
                if ($changed & 4) {
                  $node0 && $$setStyle($node0, {
                    x: index_$p$_
                  });
                }
                if ($changed & 8) {
                  $node1 && $$updateNode($node1, () => name1, [name1]);
                }
                return [$node0];
              }];
            }
          });
          return $$initCompNode(self1);
        }
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0, $node1, $node2;
            $node0 = $$createElement("div");
            $node1 = $$createNode(1 /*For*/, arr, 2, null, ({
              x,
              y
            }, index, $updateArr) => {
              let $node0;
              $updateArr[index] = ($changed, $item) => {
                ({
                  x,
                  y
                } = $item);
                if ($changed & 2) {
                  $node0 && $$setProp($node0, "x", () => x, [x]);
                  $node0 && $$setProp($node0, "y", () => y, [y]);
                }
                if ($changed & 49) {
                  $$updateNode($node0, null, 49);
                }
              };
              $node0 = $$Comp(For_1, {
                "x": x,
                "y": y,
                "index": index
              });
              return [$node0];
            });
            $$insertNode($node0, $node1, 0);
            $node2 = $$createNode(1 /*For*/, arr, 2, null, ({
              x,
              y
            }, index, $updateArr) => {
              let $node0;
              $updateArr[index] = ($changed, $item) => {
                ({
                  x,
                  y
                } = $item);
                if ($changed & 2) {
                  $node0 && $$setProp($node0, "x", () => x, [x]);
                  $node0 && $$setProp($node0, "y", () => y, [y]);
                }
                if ($changed & 49) {
                  $$updateNode($node0, null, 49);
                }
              };
              $node0 = $$Comp(For_2, {
                "x": x,
                "y": y,
                "index": index
              });
              return [$node0];
            });
            $$insertNode($node0, $node2, 1);
            $node0._$nodes = [$node1, $node2];
            return [[$node0], $changed => {
              if ($changed & 2) {
                $node1 && $$updateNode($node1, arr, null);
                $node2 && $$updateNode($node2, arr, null);
              }
              $node1 && $$updateChildren($node1, $changed);
              $node2 && $$updateChildren($node2, $changed);
              return [$node0];
            }];
          }
        });
        return $$initCompNode(self);
      }"
    `);
  });
});
