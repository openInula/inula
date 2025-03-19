import { createHTMLNode, compBuilder, setHTMLProp } from '../../src';

export const DoubleCount = () => {
  const self = compBuilder();
  self.updateState = (dirty) => {
    switch(dirty) {
      case 0b0010: self.runWithCache('j32fh0', () => doubleCount = count * 2, [count]); break;
    }
  }

  let count = 10;
  let doubleCount = count * 2;  

  self.body = () => {
    const $node0 = createHTMLNode('div');
    setHTMLProp($node0, 'textContent', () => doubleCount, [doubleCount]);

    return [
      $node0,
      (dirty) => {
        if (dirty & 0b0010) setHTMLProp($node0, 'textContent', () => doubleCount, [doubleCount]);
      },
    ]
  }

  return self.init();
}
