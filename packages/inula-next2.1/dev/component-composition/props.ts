import { createHTMLNode, createFragmentNode, compBuilder, setHTMLProp, Value } from '../../src';

const UserProfile = ({
  name = '', // 0b0001
  age = null, // 0b0010
  favouriteColors = [], // 0b0100
  isAvailable = false,
  ...rest
}: {
  name: string;
  age: number | null;
  favouriteColors: string[];
  isAvailable: boolean;
}) => {
  const self = compBuilder();
  self.updateProp = (propName: string, newValue: Value) => {
    switch (propName) {
      case 'name':
        self.runWithCache('j4toaf', () => (name = newValue), [name]);
        break;
      case 'age':
        self.runWithCache('24fjae', () => (age = newValue), [age]);
        break;
      case 'favouriteColors':
        self.runWithCache('vja03k', () => (favouriteColors = newValue), [favouriteColors]);
        break;
      case 'isAvailable':
        self.runWithCache('agj2io', () => (isAvailable = newValue), [isAvailable]);
        break;
    }
  };

  self.body = () => {
    const $node0 = createFragmentNode();
    const $node1 = createHTMLNode('p');
    setHTMLProp($node1, 'textContent', () => `My name is ${name}`, [name]);
    const $node2 = createHTMLNode('p');
    setHTMLProp($node2, 'textContent', () => `My age is ${age}`, [age]);
    const $node3 = createHTMLNode('p');
    setHTMLProp($node3, 'textContent', () => `My favourite colors are ${favouriteColors.join(', ')}`, [
      favouriteColors,
    ]);
    const $node4 = createHTMLNode('p');
    setHTMLProp($node4, 'textContent', () => `I am ${isAvailable ? 'available' : 'not available'}`, [isAvailable]);

    $node0.assignNodes($node1, $node2, $node3, $node4);

    return [
      $node0,
      dirty => {
        if (dirty & 0b0001) setHTMLProp($node1, 'textContent', () => `My name is ${name}`, [name]);
        if (dirty & 0b0010) setHTMLProp($node2, 'textContent', () => `My age is ${age}`, [age]);
        if (dirty & 0b0100)
          setHTMLProp($node3, 'textContent', () => `My favourite colors are ${favouriteColors.join(', ')}`, [
            favouriteColors,
          ]);
        if (dirty & 0b1000)
          setHTMLProp($node4, 'textContent', () => `I am ${isAvailable ? 'available' : 'not available'}`, [
            isAvailable,
          ]);
      },
    ];
  };

  return self.init();
};

export const App = () => {
  const self = compBuilder();

  self.body = () => {
    const $node0 = UserProfile({
      name: 'John',
      age: 20,
      favouriteColors: ['blue', 'green'],
      isAvailable: true,
    });

    return [$node0, dirty => {}];
  };

  return self.init();
};
