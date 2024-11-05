import { describe, expect, it } from 'vitest';
import { transform } from '../mock';

describe('analyze early return', () => {
  it('should work', () => {
    expect(
      transform(/*js*/ `
      const App = () => {
        if (count > 1) {
          return <div>1</div>
        }
        return <div>
          <if cond={count > 1}>{count} is bigger than is 1</if>
          <else>{count} is smaller than 1</else>
        </div>;
      }
    `)
    ).toMatchInlineSnapshot(`
        "import { createComponent as $$createComponent, createElement as $$createElement, initCompNode as $$initCompNode, createNode as $$createNode, createTextNode as $$createTextNode, updateNode as $$updateNode, updateChildren as $$updateChildren, insertNode as $$insertNode, Comp as $$Comp } from "@openinula/next";
        function App() {
          let self;
          function Branch_1() {
            let self1;
            self1 = $$createComponent({
              updateState: changed => {},
              getUpdateViews: () => {
                let $node0;
                $node0 = $$createElement("div");
                $node0.textContent = "1";
                return [[$node0],,];
              }
            });
            return $$initCompNode(self1);
          }
          function Default_1() {
            let self1;
            self1 = $$createComponent({
              updateState: changed => {},
              getUpdateViews: () => {
                let $node0, $node1;
                $node0 = $$createElement("div");
                $node1 = $$createNode(2 /*Cond*/, 0, $thisCond => {
                  if (count > 1) {
                    if ($thisCond.cond === 0) {
                      $thisCond.didntChange = true;
                      return [];
                    }
                    $thisCond.cond = 0;
                    let $node0, $node1;
                    $thisCond.updateFunc = $changed => {};
                    $node0 = $$createNode(3 /*Exp*/, () => count, []);
                    $node1 = $$createTextNode(" is bigger than is 1", []);
                    return $thisCond.cond === 0 ? [$node0, $node1] : $$updateNode($thisCond);
                  } else {
                    if ($thisCond.cond === 1) {
                      $thisCond.didntChange = true;
                      return [];
                    }
                    $thisCond.cond = 1;
                    let $node0, $node1;
                    $thisCond.updateFunc = $changed => {};
                    $node0 = $$createNode(3 /*Exp*/, () => count, []);
                    $node1 = $$createTextNode(" is smaller than 1", []);
                    return $thisCond.cond === 1 ? [$node0, $node1] : $$updateNode($thisCond);
                  }
                });
                $$insertNode($node0, $node1, 0);
                $node0._$nodes = [$node1];
                return [[$node0], $changed => {
                  $node1 && $$updateChildren($node1, $changed);
                  return [$node0];
                }];
              }
            });
            return $$initCompNode(self1);
          }
          self = $$createComponent({
            updateState: changed => {},
            getUpdateViews: () => {
              let $node0;
              $node0 = $$createNode(2 /*Cond*/, 0, $thisCond => {
                if (count > 1) {
                  if ($thisCond.cond === 0) {
                    $thisCond.didntChange = true;
                    return [];
                  }
                  $thisCond.cond = 0;
                  let $node0;
                  $thisCond.updateFunc = $changed => {};
                  $node0 = $$Comp(Branch_1, {});
                  return $thisCond.cond === 0 ? [$node0] : $$updateNode($thisCond);
                } else {
                  if ($thisCond.cond === 1) {
                    $thisCond.didntChange = true;
                    return [];
                  }
                  $thisCond.cond = 1;
                  let $node0;
                  $thisCond.updateFunc = $changed => {};
                  $node0 = $$Comp(Default_1, {});
                  return $thisCond.cond === 1 ? [$node0] : $$updateNode($thisCond);
                }
              });
              return [[$node0], $changed => {
                $node0 && $$updateChildren($node0, $changed);
                return [$node0];
              }];
            }
          });
          return $$initCompNode(self);
        }"
      `);
  });
});
