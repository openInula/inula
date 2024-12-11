import { compBuilder, createHTMLNode, setHTMLProp } from '../../src';

export const HelloWord = () => {
  const self = compBuilder();
  self.body = () => {
    const $node0 = createHTMLNode('h1');
    setHTMLProp($node0, 'textContent', () => 'Hello World');

    return [$node0, dirty => {}];
  };
  return self.init();
};
