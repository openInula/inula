import { delegateEvent, compBuilder, createHTMLNode, setHTMLProp, createFragmentNode, createCompNode } from '../src';


const UserProfile = ({
  name, // 0b0001
  age,  // 0b0010
  contact, // 0b0100
  ...rest  // 0b1000
}: any) => {
  const self = compBuilder()
  self.addProp('name', value => name = value, 0b0001)
  self.addProp('age', value => age = value, 0b0010)
  self.addProp('contact', value => contact = value, 0b10100)
  self.addProp('$rest$', value => rest = {...rest, ...value}, 0b1000)

  let {phone, email} = contact; // 0b10000
  self.deriveState(() => ({phone, email} = contact), () => [contact], 0b10000)

  return self.prepare().init(
    createFragmentNode(
      createHTMLNode('button', node => {
        setHTMLProp(node, 'textContent', () => 'Log', [], 0);
        delegateEvent(node, 'click', () => console.log(rest));
      }),
      createHTMLNode('p', node => {
        setHTMLProp(node, 'textContent', () => `My name is ${name}`, [name], 0b0001);
      }),
      createHTMLNode('p', node => {
        setHTMLProp(node, 'textContent', () => `My age is ${age}`, [age], 0b0010);
      }),
      createHTMLNode('p', node => {
        setHTMLProp(node, 'textContent', () => `Phone: ${phone}`, [phone], 0b0100);
      }),
      createHTMLNode('p', node => {
        setHTMLProp(node, 'textContent', () => `Email: ${email}`, [email], 0b0100);
      }),
      createHTMLNode('p', node => {
        setHTMLProp(node, 'textContent', () => `rest: ${JSON.stringify(rest)}`, [rest], 0b1000);
      })
    )
  )
}


export const Counter4 = () => {
  const self = compBuilder()

  let count = 1; // 0b0001 -> 0b11111
  let double: any;
  self.deriveState(() => double = count * 2, () => [count], 0b0010);


  let quadruple: any;
  self.deriveState(() => quadruple = double * 2, () => [double], 0b0100);

  const getQuadruple = () => quadruple;  
  let result: any
  self.deriveState(() => result = getQuadruple() + count, () => [count], 0b1000);

  self.watch(() => {
    console.log('watch1', count, double, quadruple, result);
  }, () => [count, double, quadruple, result], 0b10000);

  const increment = () => {
    self.wave(count++, 0b11111);
  }


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
      createHTMLNode('div', () => {}, 
        createCompNode(UserProfile({
          name: 'John',
          age: count,
          contact: {
            phone: '1234567890',
            email: 'john@example.com'
          },
          height: count * 100,
          weight: double * 10,
        }), node => {
            node.updateProp('age', () => count, [count], 0b0001);
            node.updateProp('height', () => count * 100, [count], 0b0001);
            node.updateProp('weight', () => double * 10, [double], 0b0010);
            node.updateProp('contact', () => ({
              phone: `1234567890+${count}`,
              email: `john+${count}@example.com`
            }), [count], 0b0001);
          }
        )
      )
    )
  )
}



// createTemplateNode($T1, 
//   /*update nodes*/
//   [
//     [0,1,2], node => {
//       setHTMLProp(node, 'textContent', () => double, [double], 0b0010);
//     },
//     [1,2], node => {
//       setHTMLProp(node, 'textContent', () => quadruple, [quadruple], 0b0100);
//     },
//     [2], node => {
//       setHTMLProp(node, 'textContent', () => result, [result], 0b1000);
//     }
//   ]
//   /*Insert nodes*/
//   [
//     1, () => createCompNode(UserProfile),
//   ]
// ),

// ContextNode

/*js*/`
const UserProfile = ({
  name, // 0b0001
  age,  // 0b0010
  contact, // 0b0100
  ...rest  // 0b1000
}: any) => {
  const self = compBuilder()
  self.addProp('name', value => name = value, 0b0001)
  self.addProp('age', value => age = value, 0b0010)
  self.addProp('contact', value => contact = value, 0b10100)
  self.addProp('$rest$', value => rest = {...rest, ...value}, 0b1000)

  let { value, isLoading } = useContext(MyContext)
  self.addContext(MyContext, 'value', value => value = value, 0b10000)
  self.addContext(MyContext,'isLoading', value => isLoading = value, 0b10000)

}



const MyContext = createContext()

const MyApp = () => {
  const self = compBuilder()
  let isLoading = true

  /**
   * <MyContext isLoading={isLoading}>
   *   <UserProfile />
   * </MyContext>
   */
  return self.prepare().init(
    createContextNode(MyContext, node => {
      node.updateContext('isLoading', () => isLoading, [isLoading], 0b0001)
    })
  )
}
`