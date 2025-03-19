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
      "import { compBuilder as $$compBuilder, createHTMLNode as $$createHTMLNode, createExpNode as $$createExpNode, createTextNode as $$createTextNode, createConditionalNode as $$createConditionalNode, createFragmentNode as $$createFragmentNode, createCompNode as $$createCompNode } from "@openinula/next";
      function App() {
        const $$self = $$compBuilder();
        function Branch_1() {
          const $$self1 = $$compBuilder($$self);
          return $$self1.prepare().init($$createHTMLNode("div", $$node => {
            $$node.textContent = "1";
          }));
        }
        function Default_1() {
          const $$self1 = $$compBuilder($$self);
          return $$self1.prepare().init($$createHTMLNode("div", null, $$createConditionalNode($$node => {
            if ($$node.cachedCondition(0, () => count > 1, [])) {
              if ($$node.branch(0)) return [];
              return [$$createExpNode(() => count, () => [], 0), $$createTextNode(" is bigger than is 1")];
            } else {
              if ($$node.branch(1)) return [];
              return [$$createExpNode(() => count, () => [], 0), $$createTextNode(" is smaller than 1")];
            }
          }, 0)));
        }
        return $$self.prepare().init($$createFragmentNode($$createConditionalNode($$node => {
          if ($$node.cachedCondition(0, () => count > 1, [])) {
            if ($$node.branch(0)) return [];
            return [$$createCompNode(Branch_1, {}, null)];
          } else {
            if ($$node.branch(1)) return [];
            return [$$createCompNode(Default_1, {}, null)];
          }
        }, 0)));
      }"
    `);
  });

  it('should support null children', () => {
    expect(
      transform(/*js*/ `
      const App = () => {
        let count = 0;
        if (count > 1) {
          return <div>1</div>
        }
        return null;
      }
    `)
    ).toMatchInlineSnapshot(`
      "import { compBuilder as $$compBuilder, createHTMLNode as $$createHTMLNode, createFragmentNode as $$createFragmentNode, createCompNode as $$createCompNode, createConditionalNode as $$createConditionalNode } from "@openinula/next";
      function App() {
        const $$self = $$compBuilder();
        let count = 0;
        function Branch_1() {
          const $$self1 = $$compBuilder($$self);
          return $$self1.prepare().init($$createHTMLNode("div", $$node => {
            $$node.textContent = "1";
          }));
        }
        function Default_1() {
          const $$self1 = $$compBuilder($$self);
          return $$self1.prepare().init(null);
        }
        return $$self.prepare().init($$createFragmentNode($$createConditionalNode($$node => {
          if ($$node.cachedCondition(0, () => count > 1, [count])) {
            if ($$node.branch(0)) return [];
            return [$$createCompNode(Branch_1, {}, null)];
          } else {
            if ($$node.branch(1)) return [];
            return [$$createCompNode(Default_1, {}, null)];
          }
        }, 1)));
      }"
    `);
  });
});
