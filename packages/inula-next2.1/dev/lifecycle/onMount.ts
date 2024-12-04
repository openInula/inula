import { compBuilder, createHTMLNode, setHTMLProp } from '../../src';

export const PageTitle = () => {
  const self = compBuilder();
  
  let pageTitle = ''

  self.didMount = () => {
    self.wave(pageTitle = document.title, [0b0001])
  }

  self.body = () => {
    const $node0 = createHTMLNode('h1');
    setHTMLProp($node0, 'textContent', () => pageTitle, [pageTitle]);

    return [
      $node0,
      (dirty) => {
        if (dirty & 0b0001) setHTMLProp($node0, 'textContent', () => pageTitle, [pageTitle]);
      },
    ]
  };

  return self.init();
}