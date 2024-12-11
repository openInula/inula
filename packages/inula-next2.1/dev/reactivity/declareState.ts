import { createHTMLNode, compBuilder, setHTMLProp } from '../../src';

export const Name = () => {
  const self = compBuilder();
  let name = 'John';

  self.body = () => {
    const $node0 = createHTMLNode('h1');
    setHTMLProp($node0, 'textContent', () => name, [name]);

    return [
      $node0,
      dirty => {
        if (dirty & 0b0001) setHTMLProp($node0, 'textContent', () => name, [name]);
      },
    ];
  };

  return self.init();
};
