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
function Button({ children, onClick }) {
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
      {children}
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

function Counter() {
  let count = 0;
  const doubleCount = count * 2; // 当count变化时，doubleCount自动更新

  // 当count变化时，watch会自动执行
  watch(() => {
    uploadToServer(count);
    console.log(`count has changed: ${count}`);
  });

  // 只有在init的时候执行一次
  console.log(`Counter willMount with count ${count}`);
  // 在elements被挂载到DOM之后执行
  didMount(() => {
    console.log(`Counter didMount with count ${count}`);
  });

  return (
    <section>
      count: {count}, double is: {doubleCount}
      <button onClick={() => count++}>Add</button>
    </section>
  );
}

function Counter() {
  let count = 0;
  const doubleCount = count * 2; // 当count变化时，doubleCount自动更新

  uploadToServer(count); // 当count变化时，uploadToServer会自动执行
  console.log(`count has changed: ${count}`); // 当count变化时，console.log会自动执行

  // 只有在init的时候执行一次
  willMount(() => {
    console.log(`Counter willMount with count ${count}`);
  });
  // 在elements被挂载到DOM之后执行
  didMount(() => {
    console.log(`Counter didMount with count ${count}`);
  });

  return (
    <section>
      count: {count}, double is: {doubleCount}
      <button onClick={() => count++}>Add</button>
    </section>
  );
}

function MyComp() {
  let count = 0;

  {
    console.log(count);
    const i = count * 2;
    console.log(i);
  }

  console.log(count);
  const i = count * 2;
  console.log(i);

  const XX = () => {};

  return (
    <>
      <h1 className="123">Hello dlight fn comp</h1>
      <section>
        count: {count}, double is: {db}
        <button onClick={() => (count += 1)}>Add</button>
      </section>
      <Button onClick={() => alert(count)}>Alter count</Button>
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
