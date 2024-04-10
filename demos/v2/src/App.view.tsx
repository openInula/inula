// @ts-nocheck
import {
  Children,
  Content,
  Main,
  Model,
  Prop,
  View,
  Watch,
  button,
  div,
  input,
  insertChildren,
  use,
  render,
} from '@openinula/next';

// @ts-ignore
function Button({ children: content, onClick }) {
  console.log(content);

  return (
    <button
      onClick={onClick}
      style={{
        color: 'white',
        backgroundColor: 'green',
        border: 'none',
        padding: '5px 10px',
        marginRight: '10px',
        borderRadius: '4px',
      }}
    >
      {content}
    </button>
  );
}
function ArrayModification() {
  const arr = [];
  willMount(() => {});
  return (
    <section>
      <h1>ArrayModification</h1>
      {arr.join(',')}
      <button onClick={() => arr.push(arr.length)}>Add item</button>
    </section>
  );
}

function MyComp() {
  let count = 0;
  const db = count * 2;

  return (
    <>
      <h1 className="123">Hello dlight fn comp</h1>
      <section>
        count: {count}, double is: {db}
        <button onClick={() => (count += 1)}>Add</button>
      </section>
      <Button onClick={() => alert(count)}>{count}</Button>
      <ConditionalRendering count={count} />
      <ArrayModification />
    </>
  );
}

function ConditionalRendering({ count }) {
  return (
    <section>
      <h1>Condition</h1>
      <if cond={count > 1}>{count} is bigger than is 1</if>
      <else-if cond={count === 1}>{count} is equal to 1</else-if>
      <else>{count} is smaller than 1</else>
    </section>
  );
}

render('main', MyComp);
