import { compBuilder, createFragmentNode, createHTMLNode, setHTMLProp, delegateEvent } from "../src";
import { createConditionalNode } from "../src/Nodes/MutableNodes/conditional";

export const CondTest = () => {
  const self = compBuilder()

  let show = true; // 0b0001
  let count = 0;   // 0b0010

  const toggle = () => {
    self.wave(show = !show, 0b0001);
  }

  const increment = () => {
    self.wave(count++, 0b0010);
  }

  return self.prepare().init(
    createFragmentNode(
      createHTMLNode('button', node => {
        setHTMLProp(node, 'textContent', () => 'Toggle', [show], 0b0001);
        delegateEvent(node, 'click', toggle);
      }),
      createConditionalNode(node => {
        if (node.cachedCondition(0, () => show, [show])) {
          if (node.branch(0)) return [];
          return [createHTMLNode('div', node => {
            setHTMLProp(node, 'textContent', () => `Count is: ${count}`, [count], 0b0010);
          })]
        } else {
          if (node.branch(1)) return [];
          return [createHTMLNode('h1', node => {
            setHTMLProp(node, 'textContent', () => 'Hidden', [], 0b0000);
          }), createHTMLNode('h2', node => {
            setHTMLProp(node, 'textContent', () => 'Hidden2', [], 0b0000);
          })]
        }
      }, 0b0001),
      createHTMLNode('button', node => {
        setHTMLProp(node, 'textContent', () => 'Increment', [], 0b0000);
        delegateEvent(node, 'click', increment);
      }),
    )
  )
}