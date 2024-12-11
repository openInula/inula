import {
  delegateEvent,
  compBuilder,
  createHTMLNode,
  setHTMLProp,
  createFragmentNode,
  createCompNode,
  createContextNode,
  createContext,
  useContext,
} from '../src';

const UserContext = createContext();

// TODO Default value

const UserProfile = () => {
  const self = compBuilder();

  let {
    name, // 0b0001
    age, // 0b0010
    contact: { phone, email }, // 0b0100
    // ...rest  // 0b1000
  } = useContext(UserContext, self);
  self.addContext(UserContext, 'name', value => (name = value), 0b0001);
  self.addContext(UserContext, 'age', value => (age = value), 0b0010);
  self.addContext(UserContext, 'contact', value => ({ phone, email } = value), 0b10100);
  // self.addContext(UserContext, '$rest$', value => rest = {...rest, ...value}, 0b1000)

  return self.prepare().init(
    createFragmentNode(
      createHTMLNode('p', node => {
        setHTMLProp(node, 'textContent', () => `My name is ${name}`, [name], 0b0001);
      }),
      createHTMLNode('p', node => {
        setHTMLProp(node, 'textContent', () => `My age is ${age}`, [age], 0b0010);
      }),
      createHTMLNode('p', node => {
        setHTMLProp(node, 'textContent', () => `Phone: ${phone}`, [phone], 0b0100);
      })
    )
  );
};

export const Counter4 = () => {
  const self = compBuilder();

  let count = 1; // 0b0001 -> 0b11111
  let double: any;
  self.deriveState(
    () => (double = count * 2),
    () => [count],
    0b0010
  );

  let quadruple: any;
  self.deriveState(
    () => (quadruple = double * 2),
    () => [double],
    0b0100
  );

  const getQuadruple = () => quadruple;
  let result: any;
  self.deriveState(
    () => (result = getQuadruple() + count),
    () => [count],
    0b1000
  );

  self.watch(
    () => {
      console.log('watch1', count, double, quadruple, result);
    },
    () => [count, double, quadruple, result],
    0b10000
  );

  const increment = () => {
    self.wave(count++, 0b11111);
  };

  return self.prepare().init(
    createFragmentNode(
      createHTMLNode('h1', node => {
        setHTMLProp(node, 'textContent', () => count, [count], 0b0001);
      }),
      createHTMLNode('h2', node => {
        setHTMLProp(node, 'textContent', () => double, [double], 0b0010);
      }),
      createHTMLNode('h3', node => {
        setHTMLProp(node, 'textContent', () => quadruple, [quadruple], 0b0100);
      }),
      createHTMLNode('h4', node => {
        setHTMLProp(node, 'textContent', () => result, [result], 0b1000);
      }),
      createHTMLNode('button', node => {
        setHTMLProp(node, 'textContent', () => 'Increment', [], 0);
        delegateEvent(node, 'click', increment);
      }),
      createHTMLNode(
        'div',
        () => {},
        createContextNode(UserContext, node => {
          node.updateContext('name', () => 'John', [], 0b0000);
          node.updateContext('age', () => 20, [], 0b0000);
          node.updateContext('contact', () => ({ phone: `1234567890+${count}` }), [count], 0b0001);
        }).with(createCompNode(UserProfile(), node => {}))
      )
    )
  );
};
