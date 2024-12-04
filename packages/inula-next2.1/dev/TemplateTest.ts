import { delegateEvent, compBuilder, createHTMLNode, setHTMLProp, createFragmentNode, createCompNode, createTemplate, getElementByPosition, createTemplateNode, templateGetElement } from '../src';

const $T1 = createTemplate(`<div><h1>Hello</h1><div><button>+</button></div><h2>world</h2><div><h1></h1><div><h2>`)



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

export const TemplateTest = () => {
  const self = compBuilder()

  let count = 0; // 0b0001
  let double: any;
  self.deriveState(() => double = count * 2, () => [count], 0b0001)

  const increment = () => self.wave(count++, 0b0011)
  return self.prepare().init(
    createTemplateNode(
      $T1,
      (node) => {
        const node0 = templateGetElement(node, 1, 0);
        const node1 = templateGetElement(node, 3, 0);
        const node2 = templateGetElement(node, 3, 1, 0);

        return () => {
          delegateEvent(node0, 'click', increment)
          setHTMLProp(node1, 'textContent', () => count, [count], 0b0001)
          setHTMLProp(node2, 'textContent', () => double, [double], 0b0010)
        }
      },
      [1, createCompNode(UserProfile({
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
      ), 1]
    ),
    
  )
}



`
<div>
  <h1>Hello</h1>
  <div>
    <button onClick={increment}>+</button>
    <UserProfile/>
  </div>
  <h2>world</h2>
  <div>
    <h1>{count}</h1>
    <div>
      <h2>{double}</h2>
    </div>
  </div>
</div>
`
