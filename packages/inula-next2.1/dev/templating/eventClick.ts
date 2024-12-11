import { compBuilder, createHTMLNode, setHTMLProp, createFragmentNode, delegateEvent } from '../../src';

export const Counter = () => {
  const self = compBuilder();

  let count = 0;

  const increment = () => {
    self.wave(count++, 0b0001);
  };

  self.body = () => {
    const $node0 = createFragmentNode();
    const $node1 = createHTMLNode('h1');
    setHTMLProp($node1, 'textContent', () => count, [count]);
    const $node2 = createHTMLNode('button');
    setHTMLProp($node2, 'textContent', () => `+1`);
    delegateEvent($node2, 'click', increment);
    $node0.assignNodes($node1, $node2);

    return [
      $node0,
      dirty => {
        if (dirty & 0b0001) setHTMLProp($node1, 'textContent', () => count, [count]);
      },
    ];
  };
  return self.init();
};
